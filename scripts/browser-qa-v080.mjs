import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright-core';

const root = resolve(new URL('../', import.meta.url).pathname);
const outDir = resolve(root, 'tests/captures-v080');
const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const browserExecutable = process.env.QA_BROWSER_EXECUTABLE || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const report = {
  version: '0.7.0',
  generatedAt: new Date().toISOString(),
  baseURL,
  browser: null,
  captures: [],
  consoleErrors: [],
  consoleWarnings: [],
  pageErrors: [],
  requestFailures: [],
  layoutIssues: [],
  assertions: [],
};

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
let server;
const cleanupServer=()=>{if(server&&!server.killed)server.kill('SIGTERM');};
process.once('exit',cleanupServer);
process.once('SIGINT',()=>{cleanupServer();process.exit(130);});
process.once('SIGTERM',()=>{cleanupServer();process.exit(143);});

async function waitForServer(url, timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok) return;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error(`Serveur inaccessible après ${timeoutMs} ms: ${url}`);
}

if (!process.env.QA_BASE_URL) {
  server = spawn(process.execPath, ['scripts/server.mjs', '4173'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '4173' },
  });
  server.stdout.on('data', (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on('data', (chunk) => process.stderr.write(`[server] ${chunk}`));
}

await waitForServer(baseURL);

const browser = await chromium.launch({
  headless: true,
  executablePath: browserExecutable,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
report.browser = await browser.version();

function observe(page, label) {
  page.on('console', (message) => {
    const entry = { page: label, type: message.type(), text: message.text() };
    const expected404 = label === 'not-found-desktop' && /404 \(Not Found\)/.test(entry.text);
    const expectedOffline = page.__allowExpectedNetworkFailure && /Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(entry.text);
    if (message.type() === 'error' && !expected404 && !expectedOffline) report.consoleErrors.push(entry);
    if (message.type() === 'warning') report.consoleWarnings.push(entry);
  });
  page.on('pageerror', (error) => report.pageErrors.push({ page: label, message: error.message }));
  page.on('requestfailed', (request) => {
    if (page.__allowExpectedNetworkFailure) return;
    const failure = request.failure();
    report.requestFailures.push({ page: label, url: request.url(), error: failure?.errorText || 'unknown' });
  });
}

async function assertPage(page, label, predicate, detail) {
  const passed = await predicate();
  report.assertions.push({ label, passed, detail });
  if (!passed) throw new Error(`${label}: ${detail}`);
}

async function inspectLayout(page, label, { allowVerticalScroll = true } = {}) {
  const issues = await page.evaluate(({ allowVerticalScroll }) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const visible = [...document.querySelectorAll('body *')].filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const decorativeOverflow = element.matches('.grain,.scanlines,.vignette');
      return !decorativeOverflow && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
    });
    const overflow = visible
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          id: element.id || null,
          className: typeof element.className === 'string' ? element.className.slice(0, 100) : null,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
        };
      })
      .filter((item) => item.right > viewportWidth + 4 || item.left < -4)
      .slice(0, 25);
    const bodyOverflow = document.documentElement.scrollWidth > viewportWidth + 4;
    const verticalIssue = !allowVerticalScroll && document.documentElement.scrollHeight > viewportHeight + 4;
    return { bodyOverflow, verticalIssue, overflow };
  }, { allowVerticalScroll });
  if (issues.bodyOverflow || issues.verticalIssue || issues.overflow.length) {
    report.layoutIssues.push({ page: label, ...issues });
  }
}

async function capture(page, name, { fullPage = false, locator = null } = {}) {
  const file = resolve(outDir, `${name}.png`);
  if (locator) await locator.screenshot({ path: file });
  else await page.screenshot({ path: file, fullPage });
  report.captures.push({ name, file: `tests/captures-v080/${name}.png`, viewport: page.viewportSize() });
}

async function openPage(context, path, label) {
  const page = await context.newPage();
  observe(page, label);
  const response = await page.goto(`${baseURL}/${path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  page.__navigationStatus = response?.status() ?? null;
  await page.waitForTimeout(350);
  return page;
}

const desktop = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });

let page = await openPage(desktop, '', 'command-desktop');
await page.waitForSelector('#contentCount');
await assertPage(page, 'Command version', async () => (await page.textContent('#contentCount'))?.includes('v0.8.0'), 'Le Command Center doit afficher v0.8.0.');
await assertPage(page, 'Command totals', async () => (await page.textContent('#contentCount'))?.includes('4600 COUPS'), 'Le Command Center doit afficher 4600 coups.');
await inspectLayout(page, 'command-desktop', { allowVerticalScroll: false });
await capture(page, '01-command-center-desktop');
await page.click('.command-item[data-mode="options"]');
await page.waitForSelector('#optionsModal:not(.hidden)');
await assertPage(page, 'Options dialog semantics', async () => (await page.getAttribute('#optionsModal','aria-hidden')) === 'false', 'La fenêtre Options doit être exposée aux technologies d’assistance.');
await assertPage(page, 'Options focus', async () => page.evaluate(() => document.querySelector('#optionsModal')?.contains(document.activeElement)), 'Le focus doit entrer dans la fenêtre Options.');
const memoryDownloadPromise=page.waitForEvent('download');
await page.click('#exportMemory');
const memoryDownload=await memoryDownloadPromise;
await assertPage(page, 'Memory backup export', async () => memoryDownload.suggestedFilename().startsWith('HALO-OF-FLESH_MEMORY_v0.8.0_'), 'L’export de mémoire doit produire un JSON versionné.');
await capture(page, '02-options-signal-theme');
await page.click('#closeOptions');
await assertPage(page, 'Options close semantics', async () => (await page.getAttribute('#optionsModal','aria-hidden')) === 'true', 'La fenêtre Options doit redevenir masquée après fermeture.');
await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
await page.reload({waitUntil:'networkidle'});
await assertPage(page, 'Service worker controls command', async () => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), 'La deuxième navigation doit être contrôlée par le service worker.');
await assertPage(page, 'PWA cache is lightweight', async () => page.evaluate(async()=>{
  const keys=await caches.keys();
  const cache=await caches.open(keys.find(key=>key.includes('static-v0.8.0'))||'missing');
  const paths=(await cache.keys()).map(request=>new URL(request.url).pathname);
  return keys.some(key=>key.includes('static-v0.8.0'))&&paths.includes('/offline.html')&&!paths.includes('/data/movesets.json');
}), 'Le cache critique doit contenir le repli hors ligne sans le catalogue lourd.');
page.__allowExpectedNetworkFailure=true;
await desktop.setOffline(true);
await page.goto(`${baseURL}/uncached-signal-v080`,{waitUntil:'domcontentloaded',timeout:15000});
await assertPage(page, 'Offline fallback', async () => (await page.textContent('body'))?.includes('S’EST ÉTEINT'), 'Une navigation inconnue hors ligne doit afficher la page de repli dédiée.');
await capture(page, '03-offline-signal-fallback');
await desktop.setOffline(false);
page.__allowExpectedNetworkFailure=false;
await page.close();

page = await openPage(desktop, 'signal-that-does-not-exist', 'not-found-desktop');
await assertPage(page, 'True 404 status', async () => page.__navigationStatus === 404, 'Une route inconnue doit conserver le statut HTTP 404.');
await assertPage(page, 'True 404 page', async () => (await page.textContent('body'))?.includes('PERDU'), 'Une route inconnue doit afficher le dossier 404 thématique.');
await capture(page, '04-true-404-signal');
await page.close();

page = await openPage(desktop, 'modules/archive.html?tab=movesets', 'movesets-desktop');
await page.waitForSelector('.move-card');
await assertPage(page, 'Moveset count', async () => (await page.locator('.move-card').count()) === 20, 'La fiche sélectionnée doit présenter exactement 20 mouvements.');
await assertPage(page, 'Moveset fidelity', async () => (await page.locator('[data-fidelity="direct-canonical"]').count()) > 0, 'Au moins une action directement attestée doit être visible.');
await inspectLayout(page, 'movesets-desktop');
await capture(page, '05-movesets-complete-desktop');
await page.selectOption('#moveSource', 'townfall');
await page.fill('#moveSearch', 'The Weight');
await page.waitForTimeout(300);
await assertPage(page, 'Townfall post-release entry', async () => (await page.textContent('#moveDetail'))?.includes('The Weight'), 'The Weight doit être présent dans le registre Townfall.');
await capture(page, '06-townfall-the-weight-moveset');
await page.close();

page = await openPage(desktop, 'modules/unified-versus.html?mode=versus', 'selection-desktop');
await page.waitForSelector('.fighter-card');
await assertPage(page, 'Roster rendered', async () => (await page.locator('.fighter-card').count()) > 0, 'La grille des manifestations doit être rendue.');
await inspectLayout(page, 'selection-desktop');
await capture(page, '07-selection-versus-desktop');
await page.click('#fighterDossier');
await page.waitForSelector('#dossier:not(.hidden)');
await assertPage(page, 'Dossier 20 moves', async () => (await page.locator('#dossier .move-list > li').count()) === 20, 'Le dossier Versus doit présenter 20 mouvements.');
await capture(page, '08-dossier-complete-moveset', { locator: page.locator('.dossier-card') });
await page.close();

page = await openPage(desktop, 'modules/unified-versus.html?mode=training&qa=1', 'observation-desktop');
await page.waitForSelector('#launch');
await assertPage(page, 'Stage systems enabled', async () => (await page.isChecked('#stageTerrain')) && (await page.isChecked('#stageDirector')), 'Le terrain et le directeur du lieu doivent être actifs par défaut.');
await page.click('#openGallery');
await page.waitForSelector('#stageGallery:not(.hidden)');
const townfallStage=page.locator('.stage-entry').filter({hasText:'ST. AMELIA MARINA'}).first();
await assertPage(page, 'Townfall stage available', async () => (await townfallStage.count()) === 1, 'St. Amelia Marina doit être sélectionnable.');
await townfallStage.click();
await page.waitForFunction(() => document.querySelector('#stageGallery')?.classList.contains('hidden'));
await page.click('#launch');
await page.waitForSelector('#fightScreen:not(.hidden)');
await page.waitForTimeout(700);
await page.keyboard.press('KeyJ');
await page.waitForTimeout(250);
await assertPage(page, 'Observation active', async () => !(await page.locator('#trainingToggle').getAttribute('class'))?.includes('hidden'), 'Le contrôle Observation doit être disponible.');
await assertPage(page, 'Context preview bridge', async () => page.evaluate(() => window.__HALO_QA__?.previewContext('guardCounter') === true), 'Le moteur navigateur doit pouvoir prévisualiser une riposte contextuelle.');
await assertPage(page, 'Context move active', async () => page.evaluate(() => window.__HALO_QA__?.snapshot()?.p1?.currentMove?.key === 'guardCounter'), 'La riposte de garde doit être le mouvement actif.');
await inspectLayout(page, 'observation-desktop', { allowVerticalScroll: false });
await capture(page, '09-observation-context-counter');
await assertPage(page, 'CRTV stage event trigger', async () => page.evaluate(() => window.__HALO_QA__?.triggerStageEvent('crtvLock') === true), 'Le directeur doit déclencher le verrou CRTV.');
await page.waitForTimeout(250);
await assertPage(page, 'Townfall stage doctrine runtime', async () => page.evaluate(() => {
  const state=window.__HALO_QA__?.snapshot();
  return state?.world?.shift?.style==='signal'&&state?.world?.terrain?.id==='wetConcrete'&&state?.world?.director?.activeEvent==='crtvLock';
}), 'Le snapshot doit exposer signal, béton trempé et événement CRTV.');
await capture(page, '10-townfall-crtv-stage-director');
await page.close();

page = await openPage(desktop, 'modules/unified-versus.html?mode=versus', 'stages-desktop');
await page.waitForSelector('#openGallery');
await page.click('#openGallery');
await page.waitForSelector('#stageGallery:not(.hidden)');
await assertPage(page, 'Stage catalogue', async () => (await page.locator('.stage-entry').count()) === 123, 'La galerie doit contenir 123 arènes.');
await capture(page, '11-animated-stage-gallery');
await page.close();

page = await openPage(desktop, 'modules/archive.html?tab=stages', 'stage-archive-desktop');
await page.waitForSelector('.archive-stage');
await assertPage(page, 'Stage archive catalogue', async () => (await page.locator('.archive-stage').count()) === 123, 'Le registre détaillé doit contenir 123 arènes.');
const marinaArchive=page.locator('.archive-stage').filter({hasText:'ST. AMELIA MARINA'}).first();
await marinaArchive.click();
await page.waitForTimeout(250);
await assertPage(page, 'Stage lore detail', async () => {
  const text=await page.textContent('#stageDetail');
  return text?.includes('RUPTURE DU SIGNAL')&&text?.includes('BÉTON TREMPÉ')&&text?.includes('MISE EN SCÈNE DU LIEU');
}, 'Le dossier d’arène doit exposer terrain, bascule et événements.');
await assertPage(page, 'Stage contextual triggers', async () => {
  const text=await page.textContent('#stageDetail');
  return ['IMPACT LOURD / PREMIER TEMPS','MI-CHEMIN OTHERWORLD','PRESSION DE FIN DE ROUND'].every((label)=>text?.includes(label));
}, 'Le dossier d’arène doit traduire les trois déclencheurs contextuels en français.');
await inspectLayout(page, 'stage-archive-desktop');
await capture(page, '12-stage-lore-director-archive');
await page.close();

await desktop.close();

const mobile = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
page = await openPage(mobile, '', 'command-mobile');
await page.waitForSelector('#contentCount');
await inspectLayout(page, 'command-mobile');
await capture(page, '13-command-center-mobile', { fullPage: true });
await page.close();

page = await openPage(mobile, 'modules/archive.html?tab=movesets', 'movesets-mobile');
await page.waitForSelector('.move-card');
await inspectLayout(page, 'movesets-mobile');
await capture(page, '14-movesets-mobile', { fullPage: true });
await page.close();

page = await openPage(mobile, 'modules/unified-versus.html?mode=versus', 'selection-mobile');
await page.waitForSelector('.fighter-card');
await inspectLayout(page, 'selection-mobile');
await capture(page, '15-selection-mobile', { fullPage: true });
await page.close();

await mobile.close();
await browser.close();
cleanupServer();

const passedAssertions = report.assertions.filter((assertion) => assertion.passed).length;
const failedAssertions = report.assertions.length - passedAssertions;
report.summary = {
  captures: report.captures.length,
  assertions: report.assertions.length,
  passedAssertions,
  failedAssertions,
  consoleErrors: report.consoleErrors.length,
  consoleWarnings: report.consoleWarnings.length,
  pageErrors: report.pageErrors.length,
  requestFailures: report.requestFailures.length,
  layoutIssues: report.layoutIssues.length,
  success: failedAssertions === 0 && report.consoleErrors.length === 0 && report.pageErrors.length === 0 && report.requestFailures.length === 0 && report.layoutIssues.length === 0,
};

await writeFile(resolve(outDir, 'browser-qa-v080.json'), `${JSON.stringify(report, null, 2)}\n`);
const markdown = `# QA navigateur — v0.8.0

**Date : ${new Date(report.generatedAt).toLocaleDateString('fr-FR')}**  
**Navigateur : ${report.browser}**  
**Surface : Chromium / Playwright, desktop 1600×1000 et mobile 430×932.**

## Résultat

- Captures : **${report.summary.captures}**.
- Assertions : **${report.summary.passedAssertions}/${report.summary.assertions} réussies**.
- Erreurs console : **${report.summary.consoleErrors}**.
- Avertissements console : **${report.summary.consoleWarnings}**.
- Exceptions JavaScript : **${report.summary.pageErrors}**.
- Échecs réseau inattendus : **${report.summary.requestFailures}**.
- Problèmes de débordement détectés : **${report.summary.layoutIssues}**.
- Verdict : **${report.summary.success ? 'RÉUSSI' : 'À CORRIGER'}**.

## Parcours couverts

1. Menu principal desktop, version v0.8.0 et totaux.
2. Options, focus, états ARIA et export de mémoire.
3. Service worker, cache critique léger et repli hors ligne.
4. Véritable page HTTP 404 thématique.
5. Registre des movesets complets.
6. Fiche Townfall de The Weight.
7. Sélection Versus.
8. Dossier à vingt mouvements.
9. Salle d’Observation et riposte contextuelle.
10. Événement CRTV actif sur St. Amelia Marina.
11. Galerie des 123 arènes animées.
12. Dossier détaillé de doctrine d’arène.
13. Menu principal mobile.
14. Movesets mobile.
15. Sélection mobile.

## Captures

${report.captures.map((capture) => `- \`${capture.file}\` — ${capture.viewport.width}×${capture.viewport.height}.`).join('\n')}

Le rapport machine détaillé est disponible dans \`tests/captures-v080/browser-qa-v080.json\`.
`;
await writeFile(resolve(root, 'docs/BROWSER_QA_v0.8.0.md'), markdown);

if (!report.summary.success) {
  console.error(JSON.stringify(report.summary, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(report.summary, null, 2));
}
