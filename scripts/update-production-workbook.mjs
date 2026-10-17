/** Narrow phase-two update of the existing workbook. Preserve all other cells and features. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';

const [planPath,sourcePath,previousReportPath,outPath,previousPlanPath]=process.argv.slice(2);
if(!previousPlanPath)throw new Error('Usage: update-production-workbook.mjs PLAN EXISTING_XLSX PREVIOUS_REPORT OUTPUT_DIR PREVIOUS_PLAN');
const planBytes=await fs.readFile(planPath),plan=JSON.parse(planBytes);
const sourceSha256=createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex');
const previous=JSON.parse(await fs.readFile(previousReportPath,'utf8'));
const previousPlanBytes=await fs.readFile(previousPlanPath),previousPlan=JSON.parse(previousPlanBytes);
if(createHash('sha256').update(previousPlanBytes).digest('hex')!==previous.planSha256)throw new Error('Previous plan does not match the existing workbook report.');
const tableKeys={'Combattants':'fighters','Mouvements':'moves','Finishers':'finishers','Présentations':'presentations','Clips':'poses','Arènes':'stages','Animations arènes':'stageAnimations','Actions':'tasks'};
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const changes=[],layoutChanges=[];
const sheet=name=>wb.worksheets.getItem(name);
const scalar=value=>value===true?'Oui':value===false?'Non':Array.isArray(value)?value.join(', '):value&&typeof value==='object'?JSON.stringify(value):value;
const normalize=value=>scalar(value)===''?null:scalar(value)??null;
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
    changes.push({sheet:name,address:`${column}${index+6}`,before:normalize(before[index][0]),after:scalar(row[key])});changed=true;
    if(['productionStatus','delivery'].includes(key)||(name==='Actions'&&key==='status')){
      const old=previousPlan[tableKeys[name]][index][key];
      if(normalize(before[index][0])!==normalize(old))throw new Error(`Annotated field must be reconciled: ${name}:${row.id}:${key}`);
    }
   }
  });
  if(changed)range.values=rows.map(row=>[scalar(row[key])]);
 }
}

setCell('Synthèse','A3','Références de combat et d’animation — Intégration des fiches dans le moteur — 17 octobre 2026');
setCell('Synthèse','A14','Pistes d’arène inventoriées');
setCell('Synthèse','A32',`${plan.metrics.reviewedCombatProfiles} fiches appliquées ; ${plan.metrics.authoredFinishers} montages de finisher ; ${plan.metrics.referenceStageTracks} éléments d’arène ; 9 hooks. ${plan.metrics.disabledMoves} commandes bloquées. Images : 2 PNG candidats, 0 clip animé, 0 fidélité 1:1 certifiée.`);
updateColumns('Combattants',plan.fighters,['identityNote','productionStatus']);
updateColumns('Mouvements',plan.moves,['currentName','currentClaim','canonicalVerification','target','startup','active','recovery','damage','reach','meterCost','hits','projectile','effect','cancelInto','productionStatus']);
updateColumns('Présentations',plan.presentations,['trigger','engineState','productionStatus']);
updateColumns('Finishers',plan.finishers,['name','currentSequence','trigger','actorTracks','existing','productionStatus']);
updateColumns('Arènes',plan.stages,['name','currentStatus','locationNote','weather','props','layers','terrain','shift','tracks','events','interactions','hazards','productionStatus']);
updateColumns('Animations arènes',plan.stageAnimations,['name','animationName','existing','trigger','layer','description','status','productionStatus']);

const actionLayout=previous.sheets.Actions;
const actionIds=sheet('Actions').getRange(`A6:A${plan.tasks.length+5}`).values.map(row=>row[0]);
if(actionIds.some((id,index)=>id!==plan.tasks[index].id))throw new Error('Task order changed');
updateColumns('Actions',plan.tasks,['reason','acceptance','status','delivery']);

// Enlarge only rows whose newly written text needs more space. All columns,
// styles, tables and larger user-selected row heights remain intact.
const widths=new Map(),heights=new Map();
for(const change of changes){
 if(change.sheet==='Synthèse'||typeof change.after!=='string'||!change.after)continue;
 const [,column,rowText]=change.address.match(/^([A-Z]+)(\d+)$/),row=Number(rowText);
 const widthKey=change.sheet+':'+column,rowKey=change.sheet+':'+row;
 if(!widths.has(widthKey))widths.set(widthKey,sheet(change.sheet).getRange(`${column}${row}`).format.columnWidth);
 const width=widths.get(widthKey);
 if(!Number.isFinite(width)||width<=3)throw new Error(`Unreadable column width: ${widthKey}`);
 const lines=change.after.split('\n').reduce((count,line)=>count+Math.max(1,Math.ceil(line.length/Math.max(8,width-3))),0);
 const required=Math.min(390,18+lines*13);
 if(!heights.has(rowKey)){
  const before=sheet(change.sheet).getRange(`A${row}`).format.rowHeight;
  if(!Number.isFinite(before))throw new Error(`Unreadable row height: ${rowKey}`);
  heights.set(rowKey,{sheet:change.sheet,row,before,after:before,reason:'Wrap newly updated production text'});
 }
 heights.get(rowKey).after=Math.max(heights.get(rowKey).after,required);
}
for(const change of heights.values())if(change.after>change.before){
 sheet(change.sheet).getRange(`A${change.row}`).format.rowHeight=change.after;
 layoutChanges.push(change);
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

const extraStageRow=plan.stages.findIndex(stage=>stage.additionalBindings?.length)+6;
const previews=[['Synthèse','A1:H36'],['Mouvements','H5:M10'],['Présentations','J5:N10'],['Finishers','M5:Q10'],['Animations arènes','E5:K11'],['Actions',`D${plan.tasks.length+2}:J${plan.tasks.length+5}`],['Combattants','K5:L9'],['Arènes','F5:M8'],['Arènes',`F${extraStageRow}:M${extraStageRow+1}`]];
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
await fs.writeFile(path.join(outPath,'workbook-layout-changes.json'),JSON.stringify(layoutChanges,null,2)+'\n');
await fs.writeFile(path.join(outPath,'workbook-change-log.json.gz'),gzipSync(changeBytes,{level:9}));
await fs.writeFile(path.join(outPath,'workbook-layout-changes.json.gz'),gzipSync(JSON.stringify(layoutChanges,null,2)+'\n',{level:9}));
const report={...previous,planSha256:createHash('sha256').update(planBytes).digest('hex'),file:path.basename(file),metrics:plan.metrics,calculated,
 editableStatusRecalculation:{before,after,restored},visualPreviews:previews.map(([name])=>name),
 operation:'Narrow update of existing workbook',sourceSha256,changedCells:changes.length,
 changesBySheet:Object.fromEntries([...new Set(changes.map(change=>change.sheet))].map(name=>[name,changes.filter(change=>change.sheet===name).length])),
 enlargedRows:layoutChanges.length,
 changeLogSha256:createHash('sha256').update(changeBytes).digest('hex'),changeLog:'workbook-change-log.json.gz',layoutChangeLog:'workbook-layout-changes.json.gz',engine:'Artifact Tool primary runtime; native Excel desktop not executed'};
await fs.writeFile(path.join(outPath,'workbook-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({file,changedCells:changes.length,openActions:before,previewSheets:report.visualPreviews}));
