import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright-core/index.mjs'));
const root=new URL('./',import.meta.url);
const browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1});
 await page.goto(new URL('composition-native.html',root).href);
 await page.waitForFunction(()=>Array.from(document.images).every(im=>im.complete&&im.naturalWidth===1672&&im.naturalHeight===941));
 await page.screenshot({path:new URL('composition-native.png',root).pathname,fullPage:false});
 const report={kind:'static-native-layer-composition',browser:browser.version(),viewport:[1672,941],deviceScaleFactor:1,images:await page.locator('img').evaluateAll(xs=>xs.map(im=>({id:im.id,naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,complete:im.complete}))),runtimeIntegration:false,originalFootageComparison:false};
 await writeFile(new URL('composition-render-report.json',root),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}finally{await browser.close();}
