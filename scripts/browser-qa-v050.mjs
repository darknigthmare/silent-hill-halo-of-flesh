import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const root = resolve(new URL('../', import.meta.url).pathname);
const outDir = resolve(root, 'tests/captures-v050');
const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const browserExecutable = process.env.QA_BROWSER_EXECUTABLE || undefined;
const report = {
  version: '0.5.0',
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

await mkdir(outDir, { recursive: true });
let server;

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
    if (message.type() === 'error') report.consoleErrors.push(entry);
    if (message.type() === 'warning') report.consoleWarnings.push(entry);
  });
  page.on('pageerror', (error) => report.pageErrors.push({ page: label, message: error.message }));
  page.on('requestfailed', (request) => {
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
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
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
  report.captures.push({ name, file: `tests/captures-v050/${name}.png`, viewport: page.viewportSize() });
}

async function openPage(context, path, label) {
  const page = await context.newPage();
  observe(page, label);
  await page.goto(`${baseURL}/${path}`, { waitUntil: 'networkidle', timeout: 45_000 });
  await page.waitForTimeout(350);
  return page;
}

const desktop = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });

let page = await openPage(desktop, '', 'command-desktop');
await page.waitForSelector('#contentCount');
await assertPage(page, 'Command version', async () => (await page.textContent('#contentCount'))?.includes('v0.5.0'), 'Le Command Center doit afficher v0.5.0.');
await assertPage(page, 'Command totals', async () => (await page.textContent('#contentCount'))?.includes('3680 COUPS'), 'Le Command Center doit afficher 3680 coups.');
await inspectLayout(page, 'command-desktop', { allowVerticalScroll: false });
await capture(page, '01-command-center-desktop');
await page.click('.command-item[data-mode="options"]');
await page.waitForSelector('#optionsModal:not(.hidden)');
await capture(page, '02-options-signal-theme');
await page.close();

page = await openPage(desktop, 'modules/archive.html?tab=movesets', 'movesets-desktop');
await page.waitForSelector('.move-card');
await assertPage(page, 'Moveset count', async () => (await page.locator('.move-card').count()) === 16, 'La fiche sélectionnée doit présenter exactement 16 mouvements.');
await assertPage(page, 'Moveset fidelity', async () => (await page.locator('[data-fidelity="direct-canonical"]').count()) > 0, 'Au moins une action directement attestée doit être visible.');
await inspectLayout(page, 'movesets-desktop');
await capture(page, '03-movesets-complete-desktop');
await page.selectOption('#moveSource', 'townfall');
await page.fill('#moveSearch', 'The Weight');
await page.waitForTimeout(300);
await assertPage(page, 'Townfall post-release entry', async () => (await page.textContent('#moveDetail'))?.includes('The Weight'), 'The Weight doit être présent dans le registre Townfall.');
await capture(page, '04-townfall-the-weight-moveset');
await page.close();

page = await openPage(desktop, 'modules/unified-versus.html?mode=versus', 'selection-desktop');
await page.waitForSelector('.fighter-card');
await assertPage(page, 'Roster rendered', async () => (await page.locator('.fighter-card').count()) > 0, 'La grille des manifestations doit être rendue.');
await inspectLayout(page, 'selection-desktop');
await capture(page, '05-selection-versus-desktop');
await page.click('#fighterDossier');
await page.waitForSelector('#dossier:not(.hidden)');
await assertPage(page, 'Dossier 16 moves', async () => (await page.locator('#dossier .move-list > li').count()) === 16, 'Le dossier Versus doit présenter 16 mouvements.');
await capture(page, '06-dossier-complete-moveset', { locator: page.locator('.dossier-card') });
await page.close();

page = await openPage(desktop, 'modules/unified-versus.html?mode=training', 'observation-desktop');
await page.waitForSelector('#launch');
await page.click('#launch');
await page.waitForSelector('#fightScreen:not(.hidden)');
await page.waitForTimeout(700);
await page.keyboard.press('KeyJ');
await page.waitForTimeout(250);
await assertPage(page, 'Observation active', async () => !(await page.locator('#trainingToggle').getAttribute('class'))?.includes('hidden'), 'Le contrôle Observation doit être disponible.');
await inspectLayout(page, 'observation-desktop', { allowVerticalScroll: false });
await capture(page, '07-observation-frame-data');
await page.close();

page = await openPage(desktop, 'modules/unified-versus.html?mode=versus', 'stages-desktop');
await page.waitForSelector('#openGallery');
await page.click('#openGallery');
await page.waitForSelector('#stageGallery:not(.hidden)');
await assertPage(page, 'Stage catalogue', async () => (await page.locator('.stage-entry').count()) === 123, 'La galerie doit contenir 123 arènes.');
await capture(page, '08-animated-stage-gallery');
await page.close();

await desktop.close();

const mobile = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
page = await openPage(mobile, '', 'command-mobile');
await page.waitForSelector('#contentCount');
await inspectLayout(page, 'command-mobile');
await capture(page, '09-command-center-mobile', { fullPage: true });
await page.close();

page = await openPage(mobile, 'modules/archive.html?tab=movesets', 'movesets-mobile');
await page.waitForSelector('.move-card');
await inspectLayout(page, 'movesets-mobile');
await capture(page, '10-movesets-mobile', { fullPage: true });
await page.close();

page = await openPage(mobile, 'modules/unified-versus.html?mode=versus', 'selection-mobile');
await page.waitForSelector('.fighter-card');
await inspectLayout(page, 'selection-mobile');
await capture(page, '11-selection-mobile', { fullPage: true });
await page.close();

await mobile.close();
await browser.close();
if (server) server.kill('SIGTERM');

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

await writeFile(resolve(outDir, 'browser-qa-v050.json'), `${JSON.stringify(report, null, 2)}\n`);
const markdown = `# QA navigateur — v0.5.0\n\n**Date : ${new Date(report.generatedAt).toLocaleDateString('fr-FR')}**  \n**Navigateur : ${report.browser}**  \n**Surface : Chrome for Testing / Playwright, desktop 1600×1000 et mobile 430×932.**\n\n## Résultat\n\n- Captures : **${report.summary.captures}**.\n- Assertions : **${report.summary.passedAssertions}/${report.summary.assertions} réussies**.\n- Erreurs console : **${report.summary.consoleErrors}**.\n- Avertissements console : **${report.summary.consoleWarnings}**.\n- Exceptions JavaScript : **${report.summary.pageErrors}**.\n- Échecs réseau : **${report.summary.requestFailures}**.\n- Problèmes de débordement détectés : **${report.summary.layoutIssues}**.\n- Verdict : **${report.summary.success ? 'RÉUSSI' : 'À CORRIGER'}**.\n\n## Parcours couverts\n\n1. Command Center desktop et version v0.5.0.\n2. Options et identité CRTV/radio.\n3. Registre des movesets complets.\n4. Fiche Townfall post-sortie de The Weight.\n5. Sélection Versus.\n6. Dossier à seize mouvements.\n7. Salle d’Observation et frame data.\n8. Galerie des 123 arènes animées.\n9. Command Center mobile.\n10. Movesets mobile.\n11. Sélection mobile.\n\n## Captures\n\n${report.captures.map((capture) => `- \`${capture.file}\` — ${capture.viewport.width}×${capture.viewport.height}.`).join('\n')}\n\nLe rapport machine détaillé est disponible dans \`tests/captures-v050/browser-qa-v050.json\`.\n`;
await writeFile(resolve(root, 'docs/BROWSER_QA_v0.5.0.md'), markdown);

if (!report.summary.success) {
  console.error(JSON.stringify(report.summary, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(report.summary, null, 2));
}
