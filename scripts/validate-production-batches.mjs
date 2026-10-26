/** Validate the per-agent Excel row ledger; this does not certify source fidelity. */
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BATCH_WORKSTREAMS=Object.freeze({art:'poses',combat:'moves',cinematics:'presentations',
  stages:'stageAnimations',references:'observations',poses:'poses'});
const statuses=new Set(['implemented-candidate','specified','blocked']);
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

export function validateProductionBatches(ledgers,plan,{baseCommit,itemsPerAgent=30,batch='lot9',previousPlan}={}){
  const errors=[],seen=new Set(),summaries=[];
  if(!/^[a-f0-9]{40}$/.test(baseCommit||''))throw Error('Exact baseline commit is required.');
  if(!Number.isSafeInteger(itemsPerAgent)||itemsPerAgent<1)throw Error('Positive item count required.');
  if(!Array.isArray(ledgers))throw Error('Agent ledgers must be an array.');
  const sourceIds=new Set((plan.sources||[]).map(source=>source.id));
  for(const ledger of ledgers){
    const name=ledger?.workstream,collection=BATCH_WORKSTREAMS[name];
    if(!Object.hasOwn(BATCH_WORKSTREAMS,name)||seen.has(name)){errors.push('Unknown or duplicate workstream: '+name);continue;}
    seen.add(name);
    if(ledger.schema!==1||ledger.batch!==batch||ledger.baseCommit!==baseCommit||ledger.requestedItems!==itemsPerAgent)
      errors.push(name+': schema, batch, baseline or requested count mismatch');
    if(!Array.isArray(ledger.items)||ledger.items.length!==itemsPerAgent){errors.push(name+': exactly '+itemsPerAgent+' row entries required');continue;}
    const rows=new Map((plan[collection]||[]).map(row=>[row.id,row])),ids=new Set(),counts={};
    const previousRows=previousPlan&&new Map((previousPlan[collection]||[]).map(row=>[row.id,row]));
    for(const item of ledger.items){
      const label=name+': '+item?.rowId,row=rows.get(item?.rowId);
      if(!item||!nonempty(item.rowId)||ids.has(item.rowId))errors.push(label+': missing or duplicate row');
      ids.add(item?.rowId);
      if(item?.collection!==collection||!row)errors.push(label+': exact Excel collection and row required');
      const owner=row?.fighterId||row?.stageId||row?.entityId;
      if(!nonempty(item?.entityId)||item.entityId!==owner)errors.push(label+': row owner mismatch');
      if(!statuses.has(item?.status))errors.push(label+': unsupported declared status');
      counts[item?.status]=(counts[item?.status]||0)+1;
      if(!nonempty(item?.limits))errors.push(label+': explicit limits required');
      if(!Array.isArray(item?.evidence)||!item.evidence.length||item.evidence.some(ref=>{
        if(sourceIds.has(ref))return false;
        try{return typeof ref!=='string'||new URL(ref).protocol!=='https:';}catch{return true;}
      }))errors.push(label+': known source IDs or HTTPS references required');
      if(!Array.isArray(item?.artifacts)||item.artifacts.some(path=>!nonempty(path)||isAbsolute(path)||
        path.includes('\\')||path.split('/').some(part=>!part||part==='.'||part==='..')))
        errors.push(label+': safe repository artifact paths required');
      if(item?.status==='blocked'){
        if(!nonempty(item.reason))errors.push(label+': blocked entry requires a reason');
      }else if(!item?.artifacts?.length)errors.push(label+': delivered work requires an artifact');
      if(previousRows){
        const previous=previousRows.get(item?.rowId);
        if(!previous)errors.push(label+': original baseline row required');
        else if(item?.status!=='blocked'&&JSON.stringify(previous)===JSON.stringify(row))
          errors.push(label+': declared delivery did not change the Excel row');
      }
    }
    summaries.push({workstream:name,collection,requested:itemsPerAgent,rows:ids.size,declaredStatuses:counts});
  }
  for(const name of Object.keys(BATCH_WORKSTREAMS))if(!seen.has(name))errors.push('Missing workstream: '+name);
  if(errors.length)throw Error(errors.join('\n'));
  return {schema:1,batch,baseCommit,itemsPerAgent,agents:summaries.length,
    rowWorkItems:summaries.reduce((sum,item)=>sum+item.rows,0),workstreams:summaries,
    passed:true,certifiedOneToOne:false,
    limits:'Counts and traceability only. Declared implementations and specifications are not certified gestures, artwork or completed Excel tasks. Blocked rows stay explicitly blocked.'};
}

export async function auditProductionBatches({root=resolve(fileURLToPath(new URL('../',import.meta.url))),
  planPath='docs/production/production-plan.json',baselinePlanPath,baseCommit,batch='lot9',itemsPerAgent=30}={}){
  const files=Object.keys(BATCH_WORKSTREAMS).map(name=>`docs/production/batches/${batch}-${name}.json`);
  const bytes=await Promise.all(files.map(file=>readFile(resolve(root,file))));
  const ledgers=bytes.map(value=>JSON.parse(value)),planBytes=await readFile(resolve(root,planPath));
  const previousBytes=baselinePlanPath?await readFile(baselinePlanPath):null;
  const report=validateProductionBatches(ledgers,JSON.parse(planBytes),{baseCommit,batch,itemsPerAgent,
    ...(previousBytes?{previousPlan:JSON.parse(previousBytes)}:{})});
  const artifacts=new Map();
  for(const ledger of ledgers)for(const item of ledger.items)for(const artifact of item.artifacts){
    const path=resolve(root,artifact),rel=relative(root,path);
    if(isAbsolute(rel)||rel.startsWith('..'))throw Error('Artifact outside repository: '+artifact);
    const info=await lstat(path);
    if(!info.isFile()||info.isSymbolicLink())throw Error('Regular artifact file required: '+artifact);
    if(!artifacts.has(artifact))artifacts.set(artifact,{path:artifact,sha256:digest(await readFile(path)),bytes:info.size});
  }
  return {...report,planSha256:digest(planBytes),...(previousBytes?{baselinePlanSha256:digest(previousBytes)}:{}),
    ledgers:files.map((path,index)=>({path,sha256:digest(bytes[index])})),
    artifacts:[...artifacts.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [baseCommit,output,baselinePlanPath,batch='lot9']=process.argv.slice(2);
  const report=await auditProductionBatches({baseCommit,baselinePlanPath,batch});
  if(output)await writeFile(resolve(output),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(report,null,2));
}
