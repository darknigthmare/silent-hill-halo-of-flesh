/** Run the existing stage-only native harness once per process, sequentially.
 * node scripts/qa-stage-pass21-batched-native.mjs --out=/fresh/evidence \
 *   --initial-attempt=/preserved/grouped/attempt.json
 * No game code, actor state, production PNG or original harness is modified.
 */
import {spawn} from 'node:child_process';
import {access,link,mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
if(process.argv.includes('--help')){
 console.log('Sequential per-stage native QA. Reads the twelve IDs in vague21/integration.json, uses a fresh output directory, and stops on the first failed process. Optional --initial-attempt=file preserves prior interruption metadata.');
 process.exit(0);
}
const root=resolve(process.env.HALO_QA_ROOT||fileURLToPath(new URL('../',import.meta.url)));
const out=resolve(option('out')||join(root,'docs/production/vague21/qa-native'));
const integrationPath=resolve(option('integration')||join(root,'docs/production/vague21/integration.json'));
const harness=join(root,'scripts/qa-stage-pass21-native.mjs');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const exists=async path=>{try{await access(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}};
if(await exists(out)&&(await readdir(out)).length)throw Error('Existing evidence is preserved. Choose a fresh --out directory.');
const integrationBytes=await readFile(integrationPath),integration=JSON.parse(integrationBytes);
const stageIds=integration.stages.map(stage=>stage.stageId);
if(stageIds.length!==12||new Set(stageIds).size!==12||stageIds.some(id=>!/^[a-z0-9_]+$/.test(id)))throw Error('The integration record must contain twelve distinct valid stage IDs.');
const initialAttempt=option('initial-attempt')?JSON.parse(await readFile(resolve(option('initial-attempt')),'utf8')):null;
if(initialAttempt?.passed===true)throw Error('An interrupted attempt cannot be labelled passed.');
await mkdir(join(out,'cases'),{recursive:true});
if(initialAttempt)await writeFile(join(out,'initial-grouped-attempt.json'),JSON.stringify(initialAttempt,null,2)+'\n');
const report={schema:1,label:'stage-pass21-batched-native',generatedAt:new Date().toISOString(),root,stageIds,
 status:'running',passed:false,browserTest:false,httpTest:false,actorStateInjected:false,
 executionMode:'Twelve sequential child processes; one stage per diagnostic-logged harness invocation; 128MiB Node old-space limit; no automatic retry.',
 nodeExecArgv:['--max-old-space-size=128'],
 originalHarness:'scripts/qa-stage-pass21-native.mjs',harnessSHA256:digest(await readFile(harness)),
 orchestratorSHA256:digest(await readFile(fileURLToPath(import.meta.url))),
 integration:{path:integrationPath,sha256:digest(integrationBytes)},initialAttempt,
 method:null,limits:[],checks:[],errors:[],assets:[],cases:[],captures:[],sourceHashes:{},processes:[],counts:{}};
const assets=new Map();
async function save(){
 report.assets=[...assets.values()];
 report.counts={requestedStages:stageIds.length,completedProcesses:report.processes.length,passedProcesses:report.processes.filter(p=>p.passed).length,
  stageCases:report.cases.length,captures:report.captures.length,checkExecutions:report.checks.length,passedChecks:report.checks.filter(c=>c.passed).length,
  failedChecks:report.checks.filter(c=>!c.passed).length,uniqueAssets:report.assets.length,sourceFiles:Object.keys(report.sourceHashes).length};
 await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
}
await save();
try{
 for(const [index,id] of stageIds.entries()){
  const caseDir=join(out,'cases',id),relativeDir='cases/'+id;
  if(await exists(caseDir))throw Error('Case output must be fresh: '+caseDir);
  const args=['--max-old-space-size=128',harness,'--stages='+id,'--out='+caseDir],startedAt=new Date().toISOString(),started=performance.now();
  console.log(JSON.stringify({event:'stage-start',index:index+1,total:stageIds.length,stageId:id}));
  const result=await new Promise((accept,reject)=>{
   const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,HALO_QA_ROOT:root},stdio:['ignore','pipe','pipe']});
   let stdout='',stderr='';
   child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
   child.stdout.on('data',chunk=>{stdout+=chunk;});child.stderr.on('data',chunk=>{stderr+=chunk;});
   child.on('error',reject);child.on('close',(code,signal)=>accept({code,signal,stdout,stderr}));
  });
  await mkdir(caseDir,{recursive:true});
  await writeFile(join(caseDir,'process.stdout.log'),result.stdout);await writeFile(join(caseDir,'process.stderr.log'),result.stderr);
  const processRecord={stageId:id,startedAt,completedAt:new Date().toISOString(),durationMs:Math.round(performance.now()-started),
   command:[process.execPath,...args],exitCode:result.code,signal:result.signal,passed:false,report:relativeDir+'/report.json',
   stdout:relativeDir+'/process.stdout.log',stderr:relativeDir+'/process.stderr.log'};
  report.processes.push(processRecord);
  if(result.code!==0||result.signal)throw Error('Unit process failed for '+id+': exit='+result.code+' signal='+result.signal+'; see '+processRecord.stderr);
  const caseBytes=await readFile(join(caseDir,'report.json')),one=JSON.parse(caseBytes);processRecord.reportSHA256=digest(caseBytes);
  if(one.passed!==true||one.errors.length||one.checks.some(check=>!check.passed)||one.stageIds.length!==1||one.stageIds[0]!==id||one.cases.length!==1||one.captures.length!==1)throw Error('Incomplete or failed unit report for '+id);
  if(one.browserTest!==false||one.httpTest!==false||one.actorStateInjected!==false||one.harnessSHA256!==report.harnessSHA256)throw Error('Unit harness/method mismatch for '+id);
  if(report.method&&JSON.stringify(report.method)!==JSON.stringify(one.method))throw Error('Unit methods differ for '+id);
  report.method??=one.method;report.dependencies??=one.dependencies;report.version??=one.version;report.limits=[...new Set([...report.limits,...one.limits])];
  for(const [path,hashes] of Object.entries(one.sourceHashes)){
   if(!hashes.before||hashes.before!==hashes.after)throw Error('Source changed in '+id+': '+path);
   const prior=report.sourceHashes[path];
   if(prior&&prior.before!==hashes.before)throw Error('Source changed between cases: '+path);
   report.sourceHashes[path]={before:hashes.before,after:hashes.after,verifiedCases:[...(prior?.verifiedCases||[]),id]};
  }
  for(const asset of one.assets){
   const prior=assets.get(asset.path);
   if(prior&&JSON.stringify(prior)!==JSON.stringify(asset))throw Error('Asset metadata differs between cases: '+asset.path);
   assets.set(asset.path,asset);
  }
  const capture=one.captures[0];
  if(capture.stageId!==id||capture.file!==id+'.png')throw Error('Unexpected capture identity for '+id);
  const sourceCapture=join(caseDir,capture.file),captureBytes=await readFile(sourceCapture);
  if(digest(captureBytes)!==capture.sha256||captureBytes.length!==capture.bytes)throw Error('Capture hash mismatch for '+id);
  await link(sourceCapture,join(out,capture.file));
  report.checks.push(...one.checks.map(check=>({...check,processStageId:id,report:relativeDir+'/report.json'})));
  report.cases.push(...one.cases.map(item=>({...item,report:relativeDir+'/report.json'})));
  report.captures.push({...capture,caseFile:relativeDir+'/'+capture.file,transfer:'hardlink; byte-identical SHA256 verified'});
  processRecord.passed=true;processRecord.checks=one.checks.length;
  await save();
  console.log(JSON.stringify({event:'stage-passed',stageId:id,checks:one.checks.length,capture:join(out,capture.file)}));
 }
 if(report.processes.length!==12||report.cases.length!==12||report.captures.length!==12)throw Error('The twelve-stage campaign did not complete.');
 if(digest(await readFile(harness))!==report.harnessSHA256)throw Error('Original harness changed during campaign.');
 report.status='passed';report.passed=true;
}catch(error){
 report.status='failed';report.passed=false;report.failure=String(error.stack||error);report.errors.push(String(error.message||error));process.exitCode=1;
 console.error(JSON.stringify({event:'campaign-failed',failure:String(error.message||error)}));
}finally{
 report.completedAt=new Date().toISOString();
 report.checkCountNote='Actual assertion executions from all completed unit reports, including repeated common checks; not a claim of that many unique assertions.';
 report.initialAttemptNote=initialAttempt?'The initial grouped process exited137 and remains interrupted/failed; it is not counted as a successful case or check.':'No initial-attempt evidence supplied.';
 await save();
 console.log(JSON.stringify({event:'campaign-complete',passed:report.passed,status:report.status,counts:report.counts,report:join(out,'report.json')}));
}
