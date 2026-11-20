/**
 * Capability probe only: no application loaded, no HTTP server, no downloads.
 * Run: "$CODEX_PRIMARY_RUNTIME_NODE" docs/production/vague23/qa-preparation/environment-probe.mjs --out=/fresh/probe.json
 */
import {createRequire} from 'node:module';
import {access, readFile, writeFile, mkdir} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {constants} from 'node:fs';

const option = name => process.argv.find(a => a.startsWith('--'+name+'='))?.slice(name.length+3);
const out = option('out');
if (!out) throw new Error('Explicit --out=/fresh/report.json required.');
const path = resolve(out);
try { await access(path); throw new Error('Refusing to replace existing probe evidence: '+path); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const modules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
if (!modules) throw new Error('CODEX_PRIMARY_RUNTIME_NODE_MODULES is required.');
const require = createRequire(join(modules, '__halo_wave23_capability_probe.cjs'));
const report = {
  schema: 1, checkedAt: new Date().toISOString(),
  applicationTest: false, applicationLoaded: false, httpServerStarted: false,
  downloads: 0, installations: 0, actorStateInjected: false,
  node: process.version, runtimeNode: process.execPath, runtimeModules: modules,
  dependencies: {}, executables: {}, native: {available: false},
  browser: {available: false, executable: '/usr/bin/chromium', attempted: false,
    scope: 'Single ordinary headless launch and about:blank only; no product behavior.'}
};
for (const name of ['@napi-rs/canvas','sharp','playwright','playwright-core']) {
  try {
    const module = require(name);
    const version = name === 'sharp' ? module.versions.sharp
      : JSON.parse(await readFile(require.resolve(name+'/package.json'),'utf8')).version;
    report.dependencies[name] = {available:true,version};
  } catch (error) { report.dependencies[name] = {available:false,error:error.message}; }
}
for (const executable of ['/usr/bin/chromium','/usr/lib/chromium/chromium']) {
  try { await access(executable, constants.X_OK); report.executables[executable] = true; }
  catch { report.executables[executable] = false; }
}
try {
  const {createCanvas} = require('@napi-rs/canvas');
  const sharp = require('sharp');
  const canvas = createCanvas(8,8), ctx = canvas.getContext('2d');
  ctx.fillStyle='#284c69'; ctx.fillRect(0,0,8,8);
  const png = canvas.toBuffer('image/png');
  const decoded = await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  report.native = {available:decoded.info.width===8&&decoded.info.height===8&&decoded.info.channels===4,
    canvasCreated:true,pngEncoded:true,sharpDecoded:true,
    applicationTest:false,width:decoded.info.width,height:decoded.info.height};
} catch (error) { report.native.error=String(error.stack||error); }
let browser;
if (report.executables[report.browser.executable]) {
  try {
    const {chromium} = require('playwright-core');
    report.browser.defaultExecutable=chromium.executablePath();
    try { await access(report.browser.defaultExecutable,constants.X_OK); report.browser.defaultExecutableExists=true; }
    catch { report.browser.defaultExecutableExists=false; }
    report.browser.attempted=true;
    browser = await chromium.launch({headless:true,executablePath:report.browser.executable,timeout:15000});
    const page=await browser.newPage();
    await page.goto('about:blank');
    report.browser.available=true;
    report.browser.version=browser.version();
    report.browser.pageURL=page.url();
    report.browser.readyState=await page.evaluate(()=>document.readyState);
  } catch (error) { report.browser.error=String(error.stack||error); }
  finally { await browser?.close(); }
}
report.completedAt=new Date().toISOString();
await mkdir(dirname(path),{recursive:true});
await writeFile(path,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({
  report:path,nativeAvailable:report.native.available,browserAvailable:report.browser.available,
  applicationTest:false,browserError:report.browser.error?.split('\n').slice(0,3).join(' ')
}));
