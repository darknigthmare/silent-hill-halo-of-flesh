/** Render selection-only imports through the game's paintRasterPortrait function.
 * Run from the checkout, using --out=directory followed by roster IDs. Outputs a
 * focused JSON record and two actual selection renders per ID. Optional native
 * dependencies resolve through the standard package lookup or runtime modules.
 */
import {createRequire} from 'node:module';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root = resolve(process.env.HALO_QA_ROOT || process.cwd());
const [outputArg, ...ids] = process.argv.slice(2);
if (!outputArg?.startsWith('--out=') || !ids.length || ids.some(id => !/^[a-z0-9_]+$/.test(id))) {
  throw Error('Usage: node qa-wave3-selection.mjs --out=directory id [id ...]');
}
const out = resolve(root, outputArg.slice(6));
const require = createRequire(import.meta.url);
function dependency(name) {
  try { return require(name); } catch (error) {
    const dir = process.env.HALO_QA_NODE_MODULES || process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
    if (!dir) throw error;
    return createRequire(join(dir, 'qa-native-loader.cjs'))(name);
  }
}
const {createCanvas, loadImage} = dependency('@napi-rs/canvas');
const sharp = dependency('sharp');
const moduleAt = name => import(pathToFileURL(join(root, 'src', name)).href);
const [{ROSTER}, {SPRITES}, {paintRasterPortrait, combatSpriteFor, spriteStatus}, {combatReferencePolicy}] = await Promise.all([
  moduleAt('data.js'), moduleAt('sprite-manifest.js'), moduleAt('sprite-system.js'), moduleAt('combat-reference-policy.js')
]);
const sha256 = data => createHash('sha256').update(data).digest('hex');
const sourceFiles = ['art/registry.json', 'src/sprite-manifest.js'];
async function sourceHashes() {
  return Object.fromEntries(await Promise.all(sourceFiles.map(async name => [name, sha256(await readFile(join(root, name)))])));
}
const report = {schema: 1, generatedAt: new Date().toISOString(), mode: 'native paintRasterPortrait', browserTest: false,
  assets: [], portraits: [], checks: [], limits: ['The native renderer uses a predecoded local image cache. This run covers selection, asset identity and combat-art exclusion.', 'The resulting PNGs require separate visual inspection.']};
function check(name, passed, detail) { report.checks.push({name, passed: !!passed, detail}); }
await mkdir(out, {recursive: true});
const reportPath = join(out, 'report.json');
try {
  await readFile(reportPath);
  throw Error('Existing report at ' + reportPath);
} catch (error) { if (error.code !== 'ENOENT') throw error; }
report.hashesBefore = await sourceHashes();
for (const id of ids) {
  const fighter = ROSTER.find(f => f.id === id);
  const art = SPRITES[id];
  const portrait = art?.portrait;
  if (!fighter || !portrait) throw Error('Missing roster profile or portrait for ' + id);
  const policy = combatReferencePolicy(fighter);
  const usage = spriteStatus(fighter);
  check(id + ' selection-only contract', usage.selection && usage.combatView === 'missing' && combatSpriteFor(fighter) === null,
    {artKind: usage.kind, combatArt: usage.combatView, documentedRole: policy.role, preexistingRulesCombatEnabled: policy.combatEnabled});
  const bytes = await readFile(join(root, portrait.path));
  check(id + ' asset identity', bytes.length === portrait.bytes && sha256(bytes) === portrait.sha256, {path: portrait.path, sha256: sha256(bytes), bytes: bytes.length});
  const encoded = await sharp(bytes).png().toBuffer();
  const [originalRaw, normalizedRaw] = await Promise.all([bytes, encoded].map(input => sharp(input).ensureAlpha().raw().toBuffer()));
  check(id + ' native decode adapter preserves pixels', originalRaw.equals(normalizedRaw));
  const image = await loadImage(encoded);
  check(id + ' source dimensions', image.width === portrait.width && image.height === portrait.height, {width: image.width, height: image.height});
  let x0 = image.width, y0 = image.height, x1 = 0, y1 = 0, transparent = 0;
  for (let index = 0; index < image.width * image.height; index++) {
    const alpha = originalRaw[index * 4 + 3];
    if (alpha === 0) transparent++;
    if (alpha < 32) continue;
    const x = index % image.width, y = Math.floor(index / image.width);
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1);
  }
  const bounds = [x0, y0, x1, y1];
  check(id + ' complete alpha bounds and transparent exterior', transparent > 0 && x0 > 0 && y0 > 0 && x1 < image.width && y1 < image.height && bounds.every((v, i) => v === portrait.visibleBounds[i]), {bounds, transparentFraction: transparent / (image.width * image.height)});
  report.assets.push({id, path: portrait.path, width: image.width, height: image.height, bounds, role: policy.role, preexistingRulesCombatEnabled: policy.combatEnabled});
  for (const facing of [1, -1]) {
    const canvas = createCanvas(500, 500), context = canvas.getContext('2d');
    canvas.dataset = {};
    const requested = [], drawCalls = [];
    const cache = {peek(path) { requested.push(path); return path === portrait.path ? image : null; }, status: () => 'ready'};
    const drawImage = context.drawImage.bind(context);
    context.drawImage = (value, ...args) => { drawCalls.push({exactImage: value === image, args, transform: Array.from(context.getTransform().toFloat64Array())}); return drawImage(value, ...args); };
    paintRasterPortrait(canvas, fighter, {facing, cache});
    const direction = facing === 1 ? 'right' : 'left';
    check(id + ' selection draw ' + direction, canvas.dataset.artPurpose === 'selection' && canvas.dataset.artStatus === 'raster' && requested.length === 1 && requested[0] === portrait.path && drawCalls.length === 1 && drawCalls[0].exactImage, {requested, dataset: canvas.dataset});
    const draw = drawCalls[0], crop = draw?.args.slice(0, 4), destination = draw?.args.slice(4, 8);
    const expectedCrop = [x0,y0,x1-x0,y1-y0];
    const upright = draw?.transform[5] === 1;
    const expectedFacing = facing * (portrait.facing || 1);
    const [dx,dy,dw,dh] = destination || [NaN,NaN,NaN,NaN];
    const visibleInside = Math.abs(dx + dw / 2) < .01 && Math.abs(dy + dh / 2) < .01 && dw <= canvas.width - 12.0 + .01 && dh <= canvas.height - 12.0 + .01;
    check(id + ' visible outline framed ' + direction, crop?.every((v,i) => v === expectedCrop[i]) && visibleInside && upright && draw.transform[0] === expectedFacing, {sourceCrop: crop, destination, expectedFacing});
    const file = 'selection-' + id + '-' + direction + '.png';
    await writeFile(join(out, file), canvas.toBuffer('image/png'), {flag: 'wx'});
    report.portraits.push({id, facing, path: portrait.path, file});
  }
}
report.hashesAfter = await sourceHashes();
for (const name of sourceFiles) check(name + ' stable during selection renders', report.hashesAfter[name] === report.hashesBefore[name]);
report.passed = report.checks.every(entry => entry.passed);
await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', {flag:'wx'});
console.log(JSON.stringify({passed: report.passed, checks: report.checks.length, failed: report.checks.filter(entry => !entry.passed), portraits: report.portraits.length, report: reportPath}));
if (!report.passed) process.exitCode = 1;
