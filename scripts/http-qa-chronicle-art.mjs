/** Real chronicle navigation and settlement with prepared deciding KOs. */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { CHRONICLES } from '../src/data.js';
import { chronicleEncounterPlan } from '../src/run-progress.js';
import { chronicleArtwork } from '../src/chronicle-art.js';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4282';
const output = resolve(process.env.QA_OUTPUT || 'tests/http-chronicle-art');
const players = { heather_birth: 'sh3_missionary_047', room_21: 'sh4_walter_sullivan_072', travis_mirrors: 'origins_ariel_078', static_beneath_st_amelia: 'townfall_lunger', murphy_rain: 'downpour_anne_cunningham', trauma_together: 'ascension_snarler_180' };
const outputs = [];
for (const wave of [7, 8, 9]) {
  const journal = new URL(`../docs/production/wave${wave}-story/generation.json`, import.meta.url);
  outputs.push(...JSON.parse(await readFile(journal, 'utf8')).outputs);
}
const selected = process.env.QA_STORY_ROUTES?.split(',');
const routes = CHRONICLES.filter(route => chronicleArtwork(route.id) && (!selected || selected.includes(route.id)));
const fallback = CHRONICLES.find(route => !chronicleArtwork(route.id));
const report = { build: 'dist', checks: [], routes: [], captures: [], errors: [], method: 'Real HTTP navigation and combat preflight. Prepared deciding KOs advance the normal engine callbacks and result UI. No saved victory or substituted art.' };
await mkdir(output, { recursive: true });

function check(label, condition) {
  report.checks.push({ label, passed: Boolean(condition) });
  if (!condition) throw Error(label);
}
async function capture(locator, name) {
  await locator.screenshot({ path: resolve(output, name), type: 'jpeg', quality: 82 });
  report.captures.push(name);
}
async function settle(page, winnerIndex) {
  return page.evaluate(winnerIndex => {
    const engine = window.__HALO_QA__.engine;
    engine.running = false;
    const introTicks = engine.phase === 'intro' ? engine.phaseTimer : 0;
    for (let tick = 0; tick < introTicks; tick++) engine.update();
    engine.config.fatalities = false;
    engine.round = engine.config.roundsToWin;
    const winner = engine.actors[winnerIndex], loser = engine.actors[1 - winnerIndex];
    winner.roundWins = engine.config.roundsToWin - 1;
    loser.roundWins = 0;
    loser.health = 0;
    loser.ko = false;
    loser.lastHit = { attackerIndex: winnerIndex, moveKey: 'neutralLight', isSuper: false, environmental: false };
    engine.resolveKnockouts();
    const resultTicks = engine.phaseTimer;
    for (let tick = 0; tick < resultTicks; tick++) engine.update();
    const outroTicks = engine.winner?.presentation?.duration || 0;
    for (let tick = 0; tick < outroTicks && engine.isPresentingOutro(); tick++) engine.update();
    return engine.phase === 'matchEnd' && engine.winner === winner;
  }, winnerIndex);
}
async function loaded(page, index) {
  try {
    await page.waitForFunction(index => {
      const q = window.__HALO_QA__;
      return q?.run?.index === index && q.engine && !q.engine.destroyed && q.run.status === 'ready' && q.engine.phase !== 'matchEnd';
    }, index, { timeout: 60000 });
  } catch (error) {
    const status = await page.locator('#spriteLaunchStatus').textContent({ timeout: 1000 }).catch(() => '');
    throw Error(`Encounter ${index + 1} did not start. ${status || error.message}`);
  }
  await page.evaluate(() => { window.__HALO_QA__.engine.running = false; });
}

function launchBrowser() {
  return chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER_EXECUTABLE || undefined, args: ['--disable-accelerated-2d-canvas'] });
}

let browser, server;
try {
  if (!process.env.QA_BASE_URL) {
    const project = fileURLToPath(new URL('../', import.meta.url));
    server = spawn(process.execPath, ['scripts/server.mjs', '4282', '--dist'], { cwd: project, stdio: 'ignore' });
    for (let attempt = 0; attempt < 50; attempt++) {
      try { if ((await fetch(base)).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  const build = await (await fetch(base + '/build-manifest.json')).json();
  for (const { web } of outputs) {
    const entry = build.files.find(file => file.path === web.path);
    check('dist ships exact bytes / ' + web.path, entry?.sha256 === web.sha256 && entry.bytes === web.bytes);
  }
  for (const route of routes) {
    // Release decoded fighters, stage layers and Canvas surfaces between full routes.
    browser = await launchBrowser();
    report.browser = browser.version();
    const context = await browser.newContext({ viewport: { width: 1200, height: 800 }, serviceWorkers: 'block' });
    // The public button owns all route parameters. Request the existing inspection bridge only.
    await context.addInitScript(() => {
      if (!location.pathname.endsWith('unified-versus.html')) return;
      const url = new URL(location.href);
      url.searchParams.set('qa', '1');
      history.replaceState(history.state, '', url);
    });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(String(e)));
    const id = route.id, art = chronicleArtwork(id);
    const verify = (label, value) => check(id + ' / ' + label, value);
    const record = { id, player: players[id], encounters: [], dossiers: [] };
    report.routes.push(record);
    await page.goto(base + '/modules/chronicles.html');
    verify('15 chronicles available', await page.locator('.route-button').count() === 15);
    const routeButton = page.locator('.route-button').filter({ hasText: route.title });
    await routeButton.click();
    const hero = page.locator('#routeIllustration');
    await hero.waitFor({ state: 'visible' });
    verify('archive displays authored opening', (await hero.getAttribute('src')).endsWith(art.intro.path) && await hero.getAttribute('alt') === art.intro.alt && await page.locator('#routeIntro').textContent() === route.intro);
    await capture(page.locator('.route-art'), id + '-archive.jpg');
    await page.locator('.route-button').filter({ hasText: fallback.title }).click();
    verify('unillustrated route returns to procedural artwork', !await hero.isVisible() && await hero.getAttribute('src') === null);
    await routeButton.click();
    const dossier = page.locator('#dossierEnding');
    const plan = chronicleEncounterPlan(id);
    if (!plan.queue.length) {
      record.dossiers = plan.referenceDossiers;
      verify('dossier provides a disclosure', await dossier.isVisible() && !await dossier.evaluate(node => node.open));
      await dossier.locator('summary').click();
      await dossier.locator('img').waitFor({ state: 'visible' });
      verify('dossier decodes distinct ending with authored text', (await dossier.locator('img').getAttribute('src')).endsWith(art.ending.path) && await dossier.locator('img').getAttribute('alt') === art.ending.alt && art.ending.path !== art.intro.path && await page.locator('#routeOutro').textContent() === route.outro);
      if (id === 'maya_villa') {
        await page.setViewportSize({ width: 390, height: 680 });
        await dossier.scrollIntoViewIfNeeded();
        verify('mobile dossier fits the viewport', await dossier.evaluate(node => { const rect = node.getBoundingClientRect(); return rect.width > 0 && rect.left >= 0 && rect.right <= innerWidth + 1; }));
      }
      await capture(dossier, id + '-dossier-ending.jpg');
      verify('reading does not award a win or register an attempt', await page.evaluate(() => !localStorage.getItem('sh-halo-of-flesh-run-v1') && !localStorage.getItem('sh-halo-of-flesh-chronicles-v1')));
      await page.locator('.route-button').filter({ hasText: fallback.title }).click();
      verify('other dossier clears disclosure and picture', !await dossier.isVisible() && await dossier.locator('img').getAttribute('src') === null);
      await context.close();
      await browser.close();
      browser = null;
      continue;
    }
    verify('playable ending reserved for final victory', !await dossier.isVisible());
    await page.selectOption('#playerFighter', players[id]);
    await page.click('#launchRoute');
    await loaded(page, 0);
    const opening = page.locator('#chronicleOpening'), ending = page.locator('#chronicleEnding');
    await opening.locator('img').waitFor({ state: 'visible' });
    verify('new game shows first encounter illustration and original text', (await opening.locator('img').getAttribute('src')).endsWith(art.intro.path) && await opening.locator('p').textContent() === route.intro);
    await capture(page.locator('.canvas-wrap'), id + '-opening.jpg');
    const run = await page.evaluate(() => window.__HALO_QA__.run);
    record.dossiers = run.referenceDossiers || [];
    verify('ordinary preflight, authored chapter count intact', !await page.isChecked('#artDiagnostic') && run.queue.length + record.dossiers.length === route.fighters.length);
    if (id === 'heather_birth') {
      verify('prepared first loss reaches normal engine settlement', await settle(page, 1));
      await page.locator('#rematch').waitFor({ state: 'visible' });
      verify('lost encounter retains retry without ending', !await ending.isVisible() && await page.evaluate(() => window.__HALO_QA__.run.status === 'lost'));
      await page.click('#rematch');
      await loaded(page, 0);
      verify('retry retains checkpoint without a second prologue', !await opening.isVisible());
    }
    for (const [index, fighterId] of run.queue.entries()) {
      await loaded(page, index);
      record.encounters.push(await page.evaluate(() => window.__HALO_QA__.selection.p2.id));
      verify('ordinary encounter ' + (index + 1), record.encounters.at(-1) === fighterId);
      if (index) verify('later chapter omits introduction ' + (index + 1), !await opening.isVisible());
      if (id === 'murphy_rain' && fighterId === 'downpour_wheelman_116') {
        await page.evaluate(() => {
          const engine = window.__HALO_QA__.engine;
          const ticks = engine.phase === 'intro' ? engine.phaseTimer : 0;
          for (let tick = 0; tick < ticks; tick++) engine.update();
          engine.render(performance.now());
        });
        await capture(page.locator('.canvas-wrap'), id + '-wheelman.jpg');
      }
      verify('engine decides encounter ' + (index + 1), await settle(page, 0));
      await page.locator('#result').waitFor({ state: 'visible' });
      if (index < run.queue.length - 1) {
        verify('intermediate screen with Continue, no ending ' + (index + 1), !await ending.isVisible() && await page.locator('#continueRun').isVisible());
        await page.click('#continueRun');
      }
    }
    await ending.locator('img').waitFor({ state: 'visible' });
    verify('final result uses distinct decoded illustration', (await ending.locator('img').getAttribute('src')).endsWith(art.ending.path) && art.ending.path !== art.intro.path);
    verify('authored ending and dossier count visible', (await page.locator('.result-card').innerText()).includes(route.outro) && (!record.dossiers.length || (await page.locator('#resultText').innerText()).includes(record.dossiers.length + ' chapitre')));
    const saved = await page.evaluate(() => ({ run: JSON.parse(localStorage.getItem('sh-halo-of-flesh-run-v1')), progress: JSON.parse(localStorage.getItem('sh-halo-of-flesh-chronicles-v1')) }));
    verify('checkpoint, grade and attempt persisted', saved.run.status === 'complete' && saved.run.wins === run.queue.length && saved.progress.completed.includes(id) && !!saved.progress.grades[id] && saved.progress.attempts[id] === 1);
    record.grade = saved.progress.grades[id];
    await capture(page.locator('.result-card'), id + '-ending.jpg');
    if (id === 'room_21' || id === 'static_beneath_st_amelia' || id === 'trauma_together') {
      await page.setViewportSize({ width: 390, height: 680 });
      await page.locator('#resultSelect').scrollIntoViewIfNeeded();
      verify('mobile result action reachable', await page.locator('#resultSelect').evaluate(button => { const box = button.getBoundingClientRect(); return box.bottom <= innerHeight + 1 && box.left >= 0 && box.right <= innerWidth + 1; }));
      await page.click('#resultSelect');
      verify('mobile selection action returns to menu', await page.locator('#selectScreen').isVisible());
    }
    await context.close();
    await browser.close();
    browser = null;
  }
  browser = await launchBrowser();
  const offline = await browser.newContext();
  const tab = await offline.newPage();
  tab.on('pageerror', error => report.errors.push(String(error)));
  await tab.goto(base);
  await tab.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 120000 });
  const assets = outputs.map(row => row.web);
  const cacheName = await tab.evaluate(async paths => {
    for (const name of await caches.keys()) {
      if (!name.includes('-static-')) continue;
      const cache = await caches.open(name);
      if ((await Promise.all(paths.map(path => cache.match('/' + path)))).every(Boolean)) return name;
    }
    return null;
  }, assets.map(asset => asset.path));
  check(`installed static cache contains all ${assets.length} illustrations`, cacheName);
  report.cache = cacheName;
  await offline.setOffline(true);
  const navigation = await tab.goto(base + '/modules/chronicles.html');
  check('offline archive opens from service worker', navigation.fromServiceWorker() && navigation.status() === 200);
  for (const { path, sha256, width, height } of assets) {
    const actual = await tab.evaluate(async path => {
      const response = await fetch('/' + path);
      const blob = await response.blob();
      const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
      const bitmap = await createImageBitmap(blob);
      const dimensions = [bitmap.width, bitmap.height];
      bitmap.close();
      return { offline: !navigator.onLine, status: response.status, type: blob.type, dimensions, sha256: Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('') };
    }, path);
    check('offline exact and decodable / ' + path, actual.offline && actual.status === 200 && actual.type === 'image/webp' && actual.sha256 === sha256 && actual.dimensions[0] === width && actual.dimensions[1] === height);
  }
  for (const route of CHRONICLES) {
    await tab.locator('.route-button').filter({ hasText: route.title }).click();
    const hero = tab.locator('#routeIllustration');
    if (chronicleArtwork(route.id)) await hero.waitFor({ state: 'visible' });
    check('offline route retains authored text and expected artwork / ' + route.id,
      await tab.locator('#routeIntro').textContent() === route.intro && await tab.locator('#routeOutro').textContent() === route.outro && await hero.isVisible() === Boolean(chronicleArtwork(route.id)));
  }
  await offline.close();
  check('no unhandled browser exceptions', !report.errors.length);
} catch (error) {
  report.failure = String(error);
  process.exitCode = 1;
} finally {
  report.passed = !report.failure && !report.errors.length;
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, errors: report.errors, failure: report.failure }));
  await browser?.close();
  server?.kill();
}
