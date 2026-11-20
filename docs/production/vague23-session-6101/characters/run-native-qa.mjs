// Run only after the parent reports that generated manifests are stable.
// One fighter per process; immutable harness snapshot and exact process evidence.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
if(!process.argv.includes('--run'))throw Error('Explicit --run required after the parent stability signal.');
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../../..');
const base=path.resolve(here,'..'),qa=path.join(base,'qa-native');
const node=process.env.CODEX_PRIMARY_RUNTIME_NODE;
if(!node)throw Error('CODEX_PRIMARY_RUNTIME_NODE must be set.');
const hash=b=>createHash('sha256').update(b).digest('hex');
const deliveryBytes=await fs.readFile(path.join(here,'delivery.json'));
if(hash(deliveryBytes)!=='b3f63409b2dadf326033ddb62fb6f4c8e42289d780f1694c1ac38b10208bbe6c')throw Error('Delivery differs from frozen art handoff.');
const ids=JSON.parse(deliveryBytes).selected.map(s=>s.fighterId);
const harnessBytes=await fs.readFile(path.join(base,'qa-characters-native.mjs')),harnessSHA256=hash(harnessBytes);
const executedHarness='executed/qa-characters-native-'+harnessSHA256.slice(0,12)+'.mjs';
const harness=path.join(qa,executedHarness);
await fs.mkdir(path.dirname(harness),{recursive:true});
try{await fs.writeFile(harness,harnessBytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;if(hash(await fs.readFile(harness))!==harnessSHA256)throw Error('Harness snapshot conflict.');}
const summaries=[];
for(const id of ids){
 const out=path.join(qa,'cases',id);
 await fs.mkdir(out,{recursive:true});
 try{await fs.access(path.join(out,'report.json'));throw Error('Existing report must be preserved: '+id);}catch(e){if(e.code!=='ENOENT')throw e;}
 const nodeExecArgv=['--expose-gc','--max-old-space-size=128','--max-semi-space-size=1'];
 const args=[...nodeExecArgv,harness,'--ids='+id,'--stages=hazel_subway','--out='+out];
 const command=[node,...args],started=Date.now(),startedAt=new Date(started).toISOString(),chunks=[];
 console.log(JSON.stringify({progress:'process-start',id,harnessSHA256}));
 const result=await new Promise(resolve=>{
  const child=spawn(node,args,{cwd:root,env:{...process.env,HALO_QA_ROOT:root},stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',b=>{chunks.push(Buffer.from(b));process.stdout.write(b);});
  child.stderr.on('data',b=>{chunks.push(Buffer.from(b));process.stderr.write(b);});
  child.on('error',e=>{chunks.push(Buffer.from(String(e.stack||e)+'\n'));});
  child.on('close',(exitCode,signal)=>resolve({exitCode,signal}));
 });
 const logBytes=Buffer.concat(chunks);await fs.writeFile(path.join(out,'process.txt'),logBytes,{flag:'wx'});
 let reportBytes=null,report=null;
 try{reportBytes=await fs.readFile(path.join(out,'report.json'));report=JSON.parse(reportBytes);}catch{}
 const observation={schema:1,kind:'characters',id,command,startedAt,completedAt:new Date().toISOString(),durationSeconds:(Date.now()-started)/1000,...result,signalNumber:null,nodeExecArgv,harnessSHA256,executedHarness,reportSHA256:reportBytes?hash(reportBytes):null,log:'process.txt',logSHA256:hash(logBytes),passed:result.exitCode===0&&!result.signal&&report?.passed===true};
 await fs.writeFile(path.join(out,'process-observation.json'),JSON.stringify(observation,null,2)+'\n',{flag:'wx'});
 summaries.push({id,passed:observation.passed,exitCode:observation.exitCode,signal:observation.signal,checks:report?.checks?.length,cases:report?.cases?.length,previews:report?.rendererPreviews?.length,captures:report?.captures?.length});
 console.log(JSON.stringify({progress:'process-complete',...summaries.at(-1)}));
 if(!observation.passed){process.exitCode=1;break;}
}
await fs.writeFile(path.join(here,'native-process-summary.json'),JSON.stringify({schema:1,createdAt:new Date().toISOString(),harnessSHA256,executedHarness,expectedIds:ids,results:summaries,passed:summaries.length===ids.length&&summaries.every(s=>s.passed)},null,2)+'\n',{flag:'wx'});
