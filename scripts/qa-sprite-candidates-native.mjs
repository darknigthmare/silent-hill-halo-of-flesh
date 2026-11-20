/**
 * Read-only art verification with the actual FightEngine and native Canvas.
 *
 * Usage:
 *   node scripts/qa-sprite-candidates-native.mjs \
 *     --pairs=fighter_a:fighter_b,fighter_c:fighter_a \
 *     --out=docs/production/qa-sprite-YYYY-MM-DD/lot --label=lot
 *
 * Both player orders are rendered automatically. --ids=a,b,c pairs adjacent IDs
 * and pairs the last odd ID with the first. Existing report.json is never replaced.
 * Optional: --port=4237, --stage=brookhaven_sh2, HALO_QA_ROOT.
 *
 * Dependencies: Node >=20, @napi-rs/canvas and sharp. These optional QA packages
 * may be provided by NODE_PATH, HALO_QA_NODE_MODULES or
 * CODEX_PRIMARY_RUNTIME_NODE_MODULES; no package or lockfile changes are made.
 * --help does not load optional dependencies or write files.
 *
 * Native Canvas is not a browser test. The default run never launches Chromium.
 * The single environment probe on 2026-11-18 failed before page creation:
 * process_singleton_posix.cc:297, socket() failed: Operation not permitted.
 * No retry or altered launch flags were used after that failure.
 *
 * Only report.json, portraits and duel captures are written to --out. Artwork,
 * registry, manifests, engine, rules, source poses and actor states are unchanged.
 * Manually inspect the final captures; passing geometry checks alone does not
 * certify source fidelity, animation, attack timing or browser behavior.
 */
import {createRequire} from 'node:module';
import {mkdir, writeFile, readFile, access} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';

const require = createRequire(import.meta.url);
const option = (name, fallback = '') => process.argv.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3) || fallback;
if (process.argv.includes('--help')) {
  console.log(`Native FightEngine sprite QA (not browser QA)
  --pairs=id:id,id:id OR --ids=id,id[,id]
  --out=directory  (required; existing report.json is preserved)
  --label=label --port=4237 --stage=brookhaven_sh2
Both player orders, selection portraits, exact PNG bytes, alpha envelopes,
120 real idle ticks, framing, facing, combat paths and pause are checked.
Dependencies: @napi-rs/canvas and sharp, resolved from normal Node lookup,
NODE_PATH, HALO_QA_NODE_MODULES or CODEX_PRIMARY_RUNTIME_NODE_MODULES.
HALO_QA_ROOT optionally selects a checkout. No build or registry edit is run.
Final captures require human/visual review; no 1:1 or animation certification.`);
  process.exit(0);
}

const root = resolve(process.env.HALO_QA_ROOT || fileURLToPath(new URL('../', import.meta.url)));
const outArgument = option('out', process.env.HALO_QA_OUT);
if (!outArgument) throw Error('Provide --out=directory; prior QA evidence must be preserved.');
const out = resolve(root, outArgument);
const label = option('label', process.env.HALO_QA_LABEL || 'sprite-candidates');
const pairArgument = option('pairs', process.env.HALO_QA_PAIRS);
const idsArgument = option('ids', process.env.HALO_QA_IDS);
if (pairArgument && idsArgument) throw Error('Use --pairs or --ids, not both.');
let basePairs;
if (pairArgument) basePairs = pairArgument.split(',').map(pair => pair.split(':'));
else if (idsArgument) {
  const requested = idsArgument.split(',');
  if (requested.length < 2) throw Error('--ids needs at least two fighters.');
  basePairs = [];
  for (let index = 0; index < requested.length; index += 2) basePairs.push([requested[index], requested[index + 1] || requested[0]]);
} else throw Error('Provide --pairs=id:id,id:id or --ids=id,id.');
if (basePairs.some(pair => pair.length !== 2 || pair.some(id => !/^[a-z0-9_]+$/.test(id)))) throw Error('Invalid fighter pair or ID.');
if (basePairs.some(pair => pair[0] === pair[1])) throw Error('Each pair needs two distinct IDs so draw geometry can be attributed to each fighter.');
const ids = [...new Set(basePairs.flat())];
const pairs = [...new Map(basePairs.flatMap(pair => pair[0] === pair[1] ? [pair] : [pair, [...pair].reverse()]).map(pair => [pair.join(':'), pair])).values()];
const port = Number(option('port', process.env.HALO_QA_PORT || '4237'));
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Port must be an integer from 1024 to 65535.');
const base = `http://127.0.0.1:${port}`;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
try {
  await access(resolve(out, 'report.json'));
  throw Error(`QA report already exists: ${resolve(out, 'report.json')}. Choose a new output directory.`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

function optionalDependency(name) {
  try { return require(name); } catch (originalError) {
    for (const modulesPath of [process.env.HALO_QA_NODE_MODULES, process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)) {
      try { return createRequire(join(modulesPath, '__halo_qa_loader.cjs'))(name); } catch {}
    }
    throw Error(`Cannot load optional QA dependency ${name}; provide NODE_PATH or HALO_QA_NODE_MODULES. ${originalError.message}`);
  }
}

const report = {
  schema: 3, label, generatedAt: new Date().toISOString(),
  mode: 'native FightEngine visual QA', browserTest: false,
  browserProbe: {
    date: '2026-11-18', executable: '/usr/bin/chromium', attempts: 1, pageCreated: false,
    result: 'system Chromium aborted with SIGABRT: process_singleton_posix.cc:297 socket() failed: Operation not permitted',
    note: 'Historical environment probe, not retried by this script; no browser behavior is certified.'
  },
  limits: [
    'Actual FightEngine rendered with native Canvas; DOM, CSS, browser input, browser decoding and service worker are not tested.',
    'Source HTTP PNG bytes are checked by SHA-256. Sharp normalizes encoding only in memory; decoded pixel equality is checked. Source files are not edited.',
    'Minimal storage/event/gamepad adapters are used. Real intros, updates, rendering and pause execute; actor positions, facing, health and poses are not overridden.',
    'Opposite facing is the engine mirror, not an independently sourced view. One-frame idle candidates do not certify animation, attacks, collision timing or fidelity 1:1.',
    'This script writes only reports and captures. Final captures must be visually inspected separately.'
  ],
  checks: [], assets: [], portraits: [], duels: [], errors: []
};
function check(name, passed, detail) {
  report.checks.push({name, passed: !!passed, ...(detail === undefined ? {} : {detail})});
  if (!passed) report.errors.push(name);
  return !!passed;
}

let server;
await mkdir(out, {recursive: true});
try {
  const {createCanvas, Image} = optionalDependency('@napi-rs/canvas');
  const sharp = optionalDependency('sharp');
  report.dependencies = {canvas: optionalDependency('@napi-rs/canvas/package.json').version, sharp: sharp.versions.sharp, node: process.version};
  for (const name of ['art/registry.json', 'src/sprite-manifest.js']) report[name + 'SHA256'] = digest(await readFile(resolve(root, name)));

  globalThis.window = {};
  globalThis.localStorage = {getItem: () => null, setItem() {}, removeItem() {}};
  globalThis.document = {hidden: false, addEventListener() {}, removeEventListener() {}};
  Object.defineProperty(globalThis, 'navigator', {configurable: true, value: {getGamepads: () => [], vibrate: () => false, userActivation: {hasBeenActive: false}}});
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => {};
  const mod = name => import(pathToFileURL(resolve(root, 'src', name)).href);
  const [{ROSTER, STAGES, VERSION}, {SPRITES}, {spriteCache, paintRasterPortrait}, {sampleSpriteClip, actorSpriteState}, {stageBitmapCache, stageBitmapFrames, pinCombatAssets, prepareCombatAssets}, {FightEngine}] = await Promise.all([
    mod('data.js'), mod('sprite-manifest.js'), mod('sprite-system.js'), mod('sprite-animation.js'), mod('stage-bitmaps.js'), mod('fight.js')
  ]);
  report.version = VERSION;
  report.ids = ids;
  const fighters = ids.map(id => ROSTER.find(fighter => fighter.id === id));
  if (fighters.some((fighter, index) => !fighter || !SPRITES[ids[index]])) throw Error('Roster or manifest lacks requested IDs: ' + ids.filter((id, index) => !fighters[index] || !SPRITES[id]).join(', '));
  const stageId = option('stage', process.env.HALO_QA_STAGE || 'brookhaven_sh2');
  const stage = STAGES.find(candidate => candidate.id === stageId);
  if (!stage) throw Error('Unknown stage: ' + stageId);
  report.stage = {id: stage.id, name: stage.name};

  const serverLog = [];
  let serverError;
  server = spawn(process.execPath, ['scripts/server.mjs', String(port)], {cwd: root, env: {...process.env, PORT: String(port)}, stdio: ['ignore', 'pipe', 'pipe']});
  server.stdout.on('data', data => serverLog.push(String(data)));
  server.stderr.on('data', data => serverLog.push(String(data)));
  server.on('error', error => { serverError = error; });
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (serverError || server.exitCode !== null) break;
    if (serverLog.some(line => line.includes(`http://127.0.0.1:${port}`))) {
      try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 100));
  }
  if (!check('Source HTTP server ready', ready, {log: serverLog, error: serverError?.message})) throw Error('Source HTTP server unavailable.');

  const descriptors = [...new Map([
    ...fighters.flatMap(fighter => [...SPRITES[fighter.id].frames, SPRITES[fighter.id].portrait].filter(Boolean)),
    ...stageBitmapFrames([stage])
  ].map(frame => [frame.path, frame])).values()];
  const bytesByPath = new Map();
  const imagePaths = new WeakMap();
  const frameByPath = new Map(descriptors.map(frame => [frame.path, frame]));
  for (const frame of descriptors) {
    const response = await fetch(base + '/' + frame.path);
    const bytes = Buffer.from(await response.arrayBuffer());
    const hash = digest(bytes);
    const exact = response.status === 200 && response.headers.get('content-type')?.includes('image/png') && bytes.length === frame.bytes && hash === frame.sha256;
    if (!check('Exact PNG HTTP bytes ' + frame.path, exact, {http: response.status, mime: response.headers.get('content-type'), bytes: bytes.length, sha256: hash})) throw Error('PNG source does not match manifest: ' + frame.path);
    const normalized = await sharp(bytes).png().toBuffer();
    const rawOriginal = await sharp(bytes).ensureAlpha().raw().toBuffer();
    const rawNormalized = await sharp(normalized).ensureAlpha().raw().toBuffer();
    if (!check('Lossless in-memory PNG adapter ' + frame.path, rawOriginal.equals(rawNormalized))) throw Error('PNG adapter changed decoded pixels: ' + frame.path);
    bytesByPath.set(frame.path, normalized);
  }
  for (const cache of [spriteCache, stageBitmapCache]) {
    cache.createImage = () => {
      const image = new Image();
      image.decode = undefined;
      for (const property of ['onload', 'onerror']) {
        let callback;
        Object.defineProperty(image, property, {get: () => callback, set: value => { callback = typeof value === 'function' ? (...args) => { void value(...args); } : undefined; }});
      }
      return image;
    };
    cache.url = path => bytesByPath.get(path);
  }

  for (const fighter of fighters) {
    const art = SPRITES[fighter.id];
    for (const frame of [...new Map([...art.frames, art.portrait].filter(Boolean).map(value => [value.path, value])).values()]) {
      const image = await spriteCache.load(frame);
      check('Native PNG decode ' + frame.path, !!image && image.width === frame.width && image.height === frame.height);
      if (!image) throw Error('PNG decode failed: ' + frame.path);
      imagePaths.set(image, frame.path);
      const surface = createCanvas(frame.width, frame.height);
      const context = surface.getContext('2d');
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, frame.width, frame.height).data;
      let left = frame.width, top = frame.height, right = 0, bottom = 0, clear = 0, solid = 0;
      for (let offset = 3; offset < pixels.length; offset += 4) {
        const alpha = pixels[offset];
        if (!alpha) clear++;
        if (alpha >= 32) {
          const index = (offset - 3) / 4, x = index % frame.width, y = Math.floor(index / frame.width);
          solid++; left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
        }
      }
      const bounds = [left, top, right, bottom];
      check('Visible alpha envelope ' + frame.path, clear > 0 && solid > 0 && (!frame.visibleBounds || JSON.stringify(bounds) === JSON.stringify(frame.visibleBounds)), {bounds, expected: frame.visibleBounds || null});
      report.assets.push({id: fighter.id, path: frame.path, width: image.width, height: image.height, transparentFraction: clear / (frame.width * frame.height), visibleBounds: bounds});
    }
    const paths = new Set(Array.from({length: 241}, (_, frame) => sampleSpriteClip(art, {pose: 'idle', frame})?.frame?.path));
    check(fighter.id + ' idle selects one distinct combat frame', paths.size === 1 && !paths.has(art.portrait?.path) && new Set(art.clips.idle.frames).size === 1, {paths: [...paths], portrait: art.portrait?.path, clip: art.clips.idle, note: 'A one-frame looping clip remains a static image.'});
    for (const facing of [1, -1]) {
      const canvas = createCanvas(500, 500);
      canvas.dataset = {};
      const context = canvas.getContext('2d'), draw = context.drawImage.bind(context), seen = [];
      context.drawImage = function(image, ...args) { if (imagePaths.has(image)) seen.push(imagePaths.get(image)); return draw(image, ...args); };
      paintRasterPortrait(canvas, fighter, {facing});
      const filename = `portrait-${fighter.id}-${facing > 0 ? 'right' : 'left'}.png`;
      await writeFile(resolve(out, filename), canvas.toBuffer('image/png'));
      check(fighter.id + ' portrait uses preserved selection ' + facing, canvas.dataset.artStatus === 'raster' && seen.includes(art.portrait?.path) && seen.every(path => path === art.portrait?.path), {status: canvas.dataset.artStatus, seen, expected: art.portrait?.path});
      report.portraits.push({id: fighter.id, facing, path: art.portrait?.path, file: filename});
    }
  }

  for (const pair of pairs) {
    const subjects = pair.map(id => fighters.find(fighter => fighter.id === id));
    pinCombatAssets(subjects, [stage]);
    const preflight = await prepareCombatAssets(subjects, [stage]);
    if (!check(pair.join('/') + ' asset preflight', preflight.ok, preflight)) throw Error('Asset preflight failed.');
    for (const frame of descriptors) {
      const image = spriteCache.peek(frame.path) || stageBitmapCache.peek(frame.path);
      if (image) imagePaths.set(image, frame.path);
    }
    const canvas = createCanvas(1280, 720), context = canvas.getContext('2d');
    const observed = [];
    let currentTick = 0;
    const draw = context.drawImage.bind(context);
    context.drawImage = function(image, ...args) {
      const path = imagePaths.get(image);
      if (path?.startsWith('assets/sprites/')) {
        const matrix = context.getTransform();
        observed.push({path, args, tick: currentTick, matrix: [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f], width: image.width, height: image.height});
      }
      return draw(image, ...args);
    };
    const engine = new FightEngine(canvas, {p1: subjects[0], p2: subjects[1], stage, mode: 'local', timeLimit: 0, seed: 71117, artDiagnostic: false, stageHazards: false, stageDirector: false, otherworldShift: false, fatalities: false, stageFatalities: false});
    try {
      let waiting = 0;
      while ((engine.phase !== 'fight' || engine.texts.some(text => ['intro', 'round', 'fight'].includes(text.kind))) && waiting++ < 1200) engine.update();
      check(pair.join('/') + ' real intro completes', engine.phase === 'fight' && !engine.paused, {ticks: waiting, phase: engine.phase});
      const expected = subjects.map(fighter => sampleSpriteClip(SPRITES[fighter.id], {pose: 'idle', frame: 0}).frame.path);
      const snapshots = [];
      for (let tick = 0; tick <= 120; tick++) {
        currentTick = engine.frame;
        engine.render();
        if (tick === 0 || tick === 120) {
          const filename = `duel-${pair.join('--')}-tick${tick}.png`;
          await writeFile(resolve(out, filename), canvas.toBuffer('image/png'));
          snapshots.push(filename);
        }
        if (tick < 120) engine.update();
      }
      check(pair.join('/') + ' actors face one another', engine.actors.every((actor, index) => actor.data.id === pair[index] && actor.facing === (index ? -1 : 1)), engine.actors.map(actor => ({id: actor.data.id, x: actor.x, y: actor.y, facing: actor.facing, state: actorSpriteState(actor)})));
      const seen = [...new Set(observed.map(record => record.path))];
      check(pair.join('/') + ' fight idle never draws portraits', seen.every(path => expected.includes(path)) && expected.every(path => seen.includes(path)), {seen, expected});
      const geometries = engine.actors.map((actor, index) => {
        const path = expected[index], record = observed.filter(value => value.path === path).at(-1), frame = frameByPath.get(path);
        if (!record || record.args.length !== 4) { check(actor.data.id + ' draw geometry exists in slot ' + index, false); return {id: actor.data.id, missing: true}; }
        const [dx, dy, dw, dh] = record.args, [a, b, c, d, e, f] = record.matrix;
        const boxOf = bounds => {
          const [left, top, right, bottom] = bounds;
          const points = [[left, top], [right, top], [left, bottom], [right, bottom]].map(([u, v]) => {
            const x = dx + u / frame.width * dw, y = dy + v / frame.height * dh;
            return {x: a * x + c * y + e, y: b * x + d * y + f};
          });
          return {left: Math.min(...points.map(point => point.x)), top: Math.min(...points.map(point => point.y)), right: Math.max(...points.map(point => point.x)), bottom: Math.max(...points.map(point => point.y))};
        };
        const exterior = boxOf(frame.framingBounds || frame.visibleBounds), visible = boxOf(frame.visibleBounds), camera = engine.presentationCamera;
        const ground = {x: actor.x * camera.scale + camera.x, y: actor.y * camera.scale + camera.y};
        const complete = Object.values(exterior).every(Number.isFinite) && exterior.left >= 0 && exterior.top >= 0 && exterior.right <= 1280 && exterior.bottom <= 720;
        check(actor.data.id + ' full exterior visible in slot ' + index, complete, {exterior, visible, ground});
        return {id: actor.data.id, slot: index + 1, path, exterior, visible, ground, visibleBottomMinusGround: visible.bottom - ground.y, complete, draw: record};
      });
      const beforePause = engine.frame;
      engine.togglePause(true);
      engine.update();
      check(pair.join('/') + ' pause stops simulation', engine.frame === beforePause);
      report.duels.push({pair, stage: stage.id, phase: engine.phase, camera: engine.presentationCamera, geometries, seenPaths: seen, snapshots, idleTicks: 120});
    } finally { engine.destroy(); }
  }
  for (const name of ['art/registry.json', 'src/sprite-manifest.js']) {
    const hash = digest(await readFile(resolve(root, name)));
    check(name + ' unchanged during QA', hash === report[name + 'SHA256'], {before: report[name + 'SHA256'], after: hash});
  }
} catch (error) {
  report.failure = String(error.stack || error);
  report.errors.push(String(error.message || error));
  process.exitCode = 1;
} finally {
  server?.kill('SIGTERM');
  report.passed = report.errors.length === 0;
  await writeFile(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({passed: report.passed, label, checks: report.checks.length, failed: report.checks.filter(value => !value.passed), portraits: report.portraits.length, duels: report.duels.length, report: resolve(out, 'report.json'), failure: report.failure}));
  if (!report.passed) process.exitCode = 1;
}
