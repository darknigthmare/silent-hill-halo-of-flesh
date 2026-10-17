/** Narrow phase-two update of the existing workbook. Preserve all other cells and features. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';

const [planPath,sourcePath,previousReportPath,outPath]=process.argv.slice(2);
if(!outPath)throw new Error('Usage: update-production-workbook.mjs PLAN EXISTING_XLSX PREVIOUS_REPORT OUTPUT_DIR');
const planBytes=await fs.readFile(planPath),plan=JSON.parse(planBytes);
const sourceSha256=createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex');
const previous=JSON.parse(await fs.readFile(previousReportPath,'utf8'));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const changes=[];
const sheet=name=>wb.worksheets.getItem(name);
const normalize=value=>value??null;
function setCell(name,address,value){
 const cell=sheet(name).getRange(address),before=normalize(cell.values[0][0]);
 if(before===normalize(value))return;
 changes.push({sheet:name,address,before,after:value});cell.values=[[value]];
}
function updateColumns(name,rows,keys){
 const layout=previous.sheets[name];
 if(!layout||layout.rows!==rows.length)throw new Error(`Scope changed: ${name}`);
 const ids=sheet(name).getRange(`A6:A${rows.length+5}`).values.map(row=>row[0]);
 if(ids.some((id,index)=>id!==rows[index].id))throw new Error(`Order or IDs changed: ${name}`);
 for(const key of keys){
  const column=layout.fields[key];if(!column)throw new Error(`Unknown field ${name}:${key}`);
  const range=sheet(name).getRange(`${column}6:${column}${rows.length+5}`),before=range.values;
  let changed=false;
  rows.forEach((row,index)=>{
   if(normalize(before[index][0])!==normalize(row[key])){
    changes.push({sheet:name,address:`${column}${index+6}`,before:normalize(before[index][0]),after:row[key]});changed=true;
   }
  });
  if(changed)range.values=rows.map(row=>[row[key]]);
 }
}

setCell('Synthèse','A3','Références de combat et d’animation — Suivi des hooks moteur — 17 octobre 2026');
setCell('Synthèse','A32','Huit hooks de présentation sont disponibles. Les deux PNG restent des candidats ; les clips dédiés restent à produire.');
updateColumns('Présentations',plan.presentations,['trigger','engineState']);
updateColumns('Finishers',plan.finishers,['actorTracks','existing']);

const actionLayout=previous.sheets.Actions;
const actionIds=sheet('Actions').getRange(`A6:A${plan.tasks.length+5}`).values.map(row=>row[0]);
if(actionIds.some((id,index)=>id!==plan.tasks[index].id))throw new Error('Task order changed');
for(const id of ['global:round-boundaries','global:cinematic-clips']){
 const index=plan.tasks.findIndex(task=>task.id===id);if(index<0)throw new Error(`Missing task: ${id}`);
 const oldStatus=sheet('Actions').getRange(`${actionLayout.fields.status}${index+6}`).values[0][0];
 if(!['À faire',plan.tasks[index].status].includes(oldStatus))throw new Error(`Annotated task status must be reconciled before regeneration: ${id}`);
 for(const key of ['reason','acceptance','status','delivery'])setCell('Actions',`${actionLayout.fields[key]}${index+6}`,plan.tasks[index][key]);
}

wb.recalculate();
const expected=[...['fighters','stages','moves','supers','fighterFinishers','stageFinishers','presentations','poses','stageAnimations','observations','sources','pngCandidates','animatedClips','certifiedOneToOne'].map(key=>plan.metrics[key]),
 plan.tasks.filter(task=>task.status!=='Validé').length,plan.tasks.filter(task=>task.priority==='P0'&&task.status!=='Validé').length];
const calculated=sheet('Synthèse').getRange('B6:B21').values.map(row=>row[0]);
if(JSON.stringify(expected)!==JSON.stringify(calculated))throw new Error('Recalculated totals differ from the updated plan');

// Exercise an open artistic task, then restore it; technical progress is not art approval.
const statusCell=sheet('Actions').getRange(`${actionLayout.fields.status}6`),firstStatus=statusCell.values[0][0];
const before=sheet('Synthèse').getRange('B20').values[0][0];
statusCell.values=[['Validé']];wb.recalculate();
const after=sheet('Synthèse').getRange('B20').values[0][0];
if(after!==before-1)throw new Error('Editable status no longer updates the summary');
statusCell.values=[[firstStatus]];wb.recalculate();
const restored=sheet('Synthèse').getRange('B20').values[0][0];
if(restored!==before)throw new Error('Temporary status was not restored');

await fs.mkdir(outPath,{recursive:true});
const inspection=await wb.inspect({kind:'table',range:'Synthèse!A5:H21',include:'values,formulas',tableMaxRows:17,tableMaxCols:8,maxChars:7500});
await fs.writeFile(path.join(outPath,'workbook-summary-inspection.ndjson'),inspection.ndjson);
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},maxChars:5000});
if(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A|#NUM!|#NULL!|#SPILL!|#CALC!/.test(errors.ndjson))throw new Error('Unexpected formula errors');
await fs.writeFile(path.join(outPath,'workbook-formula-scan.ndjson'),errors.ndjson);

const previews=[['Synthèse','A1:H36'],['Présentations','I5:N12'],['Finishers','M5:Q10'],['Actions',`D${plan.tasks.length+2}:J${plan.tasks.length+5}`]];
await fs.mkdir(path.join(outPath,'previews'),{recursive:true});
for(const [index,[sheetName,range]] of previews.entries()){
 const blob=await wb.render({sheetName,range,scale:1,format:'png'});
 const name=String(index+1).padStart(2,'0')+'-'+sheetName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').toLowerCase()+'.png';
 await fs.writeFile(path.join(outPath,'previews',name),new Uint8Array(await blob.arrayBuffer()));
}
const file=path.join(outPath,path.basename(sourcePath));
await (await SpreadsheetFile.exportXlsx(wb)).save(file);
const changeBytes=JSON.stringify(changes,null,2)+'\n';
await fs.writeFile(path.join(outPath,'workbook-change-log.json'),changeBytes);
const report={...previous,planSha256:createHash('sha256').update(planBytes).digest('hex'),file:path.basename(file),metrics:plan.metrics,calculated,
 editableStatusRecalculation:{before,after,restored},visualPreviews:previews.map(([name])=>name),
 operation:'Narrow update of existing workbook',sourceSha256,changedCells:changes.length,
 changesBySheet:Object.fromEntries([...new Set(changes.map(change=>change.sheet))].map(name=>[name,changes.filter(change=>change.sheet===name).length])),
 changeLogSha256:createHash('sha256').update(changeBytes).digest('hex'),engine:'Artifact Tool primary runtime; native Excel desktop not executed'};
await fs.writeFile(path.join(outPath,'workbook-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({file,changedCells:changes.length,openActions:before,previewSheets:report.visualPreviews}));
