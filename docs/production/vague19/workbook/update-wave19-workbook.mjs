import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';

const source='/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh/docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx';
const work='/workspace/scratch/8edddaaaab76/wave19-workbook';
const outputDir='/workspace/scratch/8edddaaaab76/outputs/wave19-workbook';
const mode=process.argv[2]||'inspect';
const sourceBytes=await fs.readFile(source);
const sourceSHA256=createHash('sha256').update(sourceBytes).digest('hex');
if(sourceSHA256!=='7de47c02b04650c8982fc2d86e414a4c35637ce080446e00cd6189465a0f3b7d')throw new Error('Source workbook changed after the preservation audit');
await fs.mkdir(work,{recursive:true});
console.log(JSON.stringify({phase:'import',sourceSHA256}));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
console.log(JSON.stringify({phase:'imported'}));
const sheet=name=>wb.worksheets.getItem(name);
if(mode==='inspect'){
const inspection=await wb.inspect({kind:'workbook,sheet,table',maxChars:8500,tableMaxRows:5,tableMaxCols:6,tableMaxCellChars:90});
await fs.writeFile(path.join(work,'source-inspection.ndjson'),inspection.ndjson);
const ranges=[['Synthèse','A1:H36'],['Combattants','P5:V10'],['Clips','E5:M10'],['Arènes','E5:S8']];
await fs.mkdir(path.join(work,'previews-before'),{recursive:true});
for(const [name,range] of ranges){
 const label=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').toLowerCase();
 const data=await wb.inspect({kind:'table',range:`'${name}'!${range}`,include:'values,formulas',tableMaxRows:36,tableMaxCols:19,maxChars:16000});
 await fs.writeFile(path.join(work,`source-${label}.ndjson`),data.ndjson);
 const image=await wb.render({sheetName:name,range,scale:1,format:'png'});
 await fs.writeFile(path.join(work,'previews-before',label+'.png'),new Uint8Array(await image.arrayBuffer()));
 console.log(JSON.stringify({phase:'preview-before',sheet:name}));
}
 const output=await SpreadsheetFile.exportXlsx(wb);
 const file=path.join(path.dirname(new URL(import.meta.url).pathname),'roundtrip-probe.xlsx');
 await output.save(file);
 await fs.writeFile(path.join(work,'source-read.json'),JSON.stringify({source,sourceSHA256,roundtripProbe:file,metrics:sheet('Synthèse').getRange('A5:B21').values},null,2)+'\n');
 console.log(JSON.stringify({phase:'roundtrip-exported',file}));
}else if(mode==='update'&&process.argv.includes('--integration-ready')){
 const factsBytes=await fs.readFile(path.join(work,'wave19-current-coverage.json'));
 const facts=JSON.parse(factsBytes),previousPath='/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh/docs/production/workbook-verification.json';
 const previousBytes=await fs.readFile(previousPath),previous=JSON.parse(previousBytes);
 const preservation=JSON.parse(await fs.readFile(path.join(work,'roundtrip-preservation.json'),'utf8'));
 if(!preservation.passedValuesFormulas||Object.values(preservation.sheets).some(s=>s.stylesChangedCount||Object.keys(s.featuresChanged).length||s.rowChangesCount))throw new Error('Round-trip preservation audit failed');
 for(const input of facts.sources){const b=await fs.readFile(path.join('/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh',input.file));if(createHash('sha256').update(b).digest('hex')!==input.sha256)throw new Error('Coverage input changed: '+input.file);}
 if(facts.coverage.selectionAvailable!==204||facts.coverage.combatSideViewCandidates!==135||facts.coverage.animatedClips!==6||facts.stages.filter(s=>s.bitmapProgress).length!==32)throw new Error('Unexpected final coverage');
 const changes=[],layoutChanges=[],historyRetention=[];
 const norm=v=>v===undefined||v===''?null:v;
 function setCell(name,address,value,reason){
  const range=sheet(name).getRange(address),before=norm(range.values[0][0]);
  if(before===norm(value))return;
  changes.push({sheet:name,address,before,after:value,reason});range.values=[[value]];
 }
 function indexed(name,rows){
  const ids=sheet(name).getRange(`A6:A${rows.length+5}`).values.map(r=>r[0]);
  if(ids.some((id,i)=>id!==rows[i].id))throw new Error('IDs or order changed: '+name);
  return rows.map((row,i)=>({...row,sheetRow:i+6}));
 }
 const metrics=facts.metrics;
 for(const fighter of indexed('Combattants',facts.fighters)){
  setCell('Combattants',`R${fighter.sheetRow}`,fighter.artState,'Current PNG candidate availability');
  setCell('Combattants',`S${fighter.sheetRow}`,fighter.animatedClips,'Current distinct-frame animated clip count');
 }
 const availability=/^(?:\d+ images indépendantes, montage candidat de \d+ ticks du versus ; timing source et fidélité non certifiés\.|Image de repos candidate, une image indépendante ; aucune animation certifiée|Pose [^\n]+? fixe candidate, une image indépendante ; aucune animation certifiée|Aucun clip dédié)/;
 const coverageById=new Map(facts.fighters.map(f=>[f.id,f.coverage]));
 for(const pose of indexed('Clips',facts.poses)){
  const address=`I${pose.sheetRow}`,before=sheet('Clips').getRange(address).values[0][0];
  const oldHead=before.match(availability),newHead=pose.existing.match(availability);
  if(!oldHead||!newHead)throw new Error('Unrecognized factual clip prefix: '+pose.id);
  const tail=before.slice(oldHead[0].length);
  let current=newHead[0];
  if(pose.pose==='idle'){
   const c=coverageById.get(pose.fighterId);
   const combat=c.combatView==='side-view-candidate'?'vue latérale candidate':c.combatView==='legacy-unreviewed'?'vue de combat héritée à revoir':'vue de combat absente';
   current+=`\nCouverture au 19 novembre 2026 : portrait ${c.selection?'présent':'absent'} ; ${combat}${c.separateSelectionAndCombat?' ; portrait et combat distincts':''}.`;
  }
  if(tail){
   const historical=oldHead[0]!==newHead[0]&&/Blocage|Campagne ART|Livraison candidate/.test(tail)&&!tail.includes('Historique conservé');
   current+=(historical?'\nHistorique conservé — ':'')+tail;
   historyRetention.push({sheet:'Clips',address,preservedSuffix:tail,explicitHistoricalLabelAdded:historical});
  }
  setCell('Clips',address,current,'Update availability prefix and current view coverage; preserve all prior annotations after the prefix');
 }
 for(const move of indexed('Mouvements',facts.moves)){
  const address=`Y${move.sheetRow}`,before=sheet('Mouvements').getRange(address).values[0][0];
  if(!['Clip absent','Clip candidat à vérifier'].includes(before))throw new Error('Annotated move clip status must be preserved: '+move.id);
  setCell('Mouvements',address,move.clipStatus,'Current dedicated attack clip availability');
 }
 for(const stage of indexed('Arènes',facts.stages)){
  if(!stage.bitmapProgress)continue;
  const address=`G${stage.sheetRow}`,before=sheet('Arènes').getRange(address).values[0][0],b=stage.bitmapProgress;
  const text=before+`\nCouverture au 19 novembre 2026 : décor bitmap candidat actif ; ${b.layers} couche(s), ${b.files} PNG indépendant(s) ; mode ${b.mode}${b.scene?' ; vue '+b.scene:''}. Fidélité et animation non certifiées.`;
  setCell('Arènes',address,text,'Append current active bitmap facts while preserving the existing catalogue status');
  historyRetention.push({sheet:'Arènes',address,preservedPrefix:before});
 }
 const subtitle=sheet('Synthèse').getRange('A3').values[0][0];
 setCell('Synthèse','A3',subtitle+'\nAu 19 novembre 2026 : 204 portraits / 230 ; 135 vues latérales candidates.\n6 clips animés ; 32 décors bitmap actifs / 123 ; 136 portraits et combats distincts.\nRestants : 26 portraits absents ; 37 vues de combat absentes ; 58 vues héritées à revoir.','Append dated current coverage to the original subtitle');
 const summary=`${metrics.reviewedCombatProfiles} fiches appliquées ; ${metrics.authoredFinishers} montages de finisher ; ${metrics.referenceStageTracks} éléments d’arène ; ${metrics.presentationHooks} hooks. ${metrics.disabledMoves} commandes bloquées. Images : ${metrics.pngCandidates} profils avec PNG candidats, ${metrics.animatedClips} montage animé candidat, ${metrics.certifiedOneToOne} fidélité 1:1 certifiée.`;
 setCell('Synthèse','A32',summary,'Canonical summary_text(metrics) contract with refreshed PNG and animated clip counts');
 const sizes=new Map();
 for(const change of changes){
  if(typeof change.after!=='string')continue;
  const [,column,rowString]=change.address.match(/^([A-Z]+)(\d+)$/),row=Number(rowString),key=change.sheet+':'+row;
  let required;
  if(change.sheet==='Synthèse')required=change.address==='A3'?70:sheet(change.sheet).getRange(`A${row}`).format.rowHeight;
  else{
   const width=sheet(change.sheet).getRange(`${column}${row}`).format.columnWidth;
   if(!Number.isFinite(width)||width<=3)throw new Error('Cannot estimate changed-text width');
   const lines=change.after.split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/Math.max(8,width-3))),0);
   required=Math.min(390,18+lines*13);
  }
  if(!sizes.has(key)){const before=sheet(change.sheet).getRange(`A${row}`).format.rowHeight;sizes.set(key,{sheet:change.sheet,row,before,after:before,reason:'Show appended factual coverage and preserve existing larger row heights'});}
  sizes.get(key).after=Math.max(sizes.get(key).after,required);
 }
 for(const change of sizes.values())if(change.after>change.before){sheet(change.sheet).getRange(`A${change.row}`).format.rowHeight=change.after;layoutChanges.push(change);}
 wb.recalculate();
 const expected=[...['fighters','stages','moves','supers','fighterFinishers','stageFinishers','presentations','poses','stageAnimations','observations','sources','pngCandidates','animatedClips','certifiedOneToOne'].map(k=>metrics[k]),previous.calculated[14],previous.calculated[15]];
 const calculated=sheet('Synthèse').getRange('B6:B21').values.map(r=>r[0]);
 if(JSON.stringify(expected)!==JSON.stringify(calculated))throw new Error('Recalculated totals differ from the current facts and preserved action annotations');
 const inputCell=sheet('Actions').getRange('H6'),savedInput=inputCell.values[0][0],before=sheet('Synthèse').getRange('B20').values[0][0];
 if(savedInput==='Validé')throw new Error('Representative editable input no longer open');
 inputCell.values=[['Validé']];wb.recalculate();const after=sheet('Synthèse').getRange('B20').values[0][0];
 if(after!==before-1)throw new Error('Editable action no longer recalculates the summary');
 inputCell.values=[[savedInput]];wb.recalculate();const restored=sheet('Synthèse').getRange('B20').values[0][0];
 if(restored!==before||inputCell.values[0][0]!==savedInput)throw new Error('Representative edit not restored');
 await fs.mkdir(outputDir,{recursive:true});
 const inspection=await wb.inspect({kind:'table',range:"'Synthèse'!A5:H21",include:'values,formulas',tableMaxRows:17,tableMaxCols:8,maxChars:9000});
 await fs.writeFile(path.join(outputDir,'workbook-summary-inspection.ndjson'),inspection.ndjson);
 const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},maxChars:5000});
 if(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A|#NUM!|#NULL!|#SPILL!|#CALC!/.test(errors.ndjson))throw new Error('Unexpected workbook formula error');
 await fs.writeFile(path.join(outputDir,'workbook-formula-scan.ndjson'),errors.ndjson);
 const formulaValues=sheet('Synthèse').getRange('A1:H45').values,formulaMatrix=sheet('Synthèse').getRange('A1:H45').formulas,recalculatedFormulas=[];
 for(let r=0;r<formulaMatrix.length;r++)for(let c=0;c<formulaMatrix[r].length;c++)if(formulaMatrix[r][c])recalculatedFormulas.push({sheet:'Synthèse',address:String.fromCharCode(65+c)+(r+1),formula:formulaMatrix[r][c].replace(/^=/,''),value:formulaValues[r][c]});
 if(recalculatedFormulas.length!==80)throw new Error('Formula count changed');
 const bomRow=facts.fighters.findIndex(f=>f.id==='bom_bogeyman_122')+6;
 const selectedStage=facts.stages.findIndex(s=>s.bitmapProgress&&s.id.includes('bom'));
 const stageRow=selectedStage>=0?selectedStage+6:facts.stages.findIndex(s=>s.bitmapProgress)+6;
 const previews=[['Synthèse','A1:H36','01-synthese'],['Combattants',`P${bomRow}:V${bomRow+1}`,'02-bom-facts'],['Clips','H917:L917','03-nurse-walk'],['Mouvements','W1839:AE1839','04-nurse-attack'],['Arènes',`E${stageRow}:K${stageRow}`,'05-stage-facts']];
 await fs.mkdir(path.join(outputDir,'previews'),{recursive:true});
 for(const [name,range,label] of previews){const blob=await wb.render({sheetName:name,range,scale:1,format:'png'});await fs.writeFile(path.join(outputDir,'previews',label+'.png'),new Uint8Array(await blob.arrayBuffer()));console.log(JSON.stringify({phase:'preview-after',sheet:name,range}));}
 const file=path.join(outputDir,path.basename(source));
 await (await SpreadsheetFile.exportXlsx(wb)).save(file);
 for(const [label,payload] of [['workbook-change-log',changes],['workbook-layout-changes',layoutChanges],['workbook-structure-changes',[]]]){const bytes=JSON.stringify(payload,null,2)+'\n';await fs.writeFile(path.join(outputDir,label+'.json'),bytes);await fs.writeFile(path.join(outputDir,label+'.json.gz'),gzipSync(bytes,{level:9}));}
 await fs.writeFile(path.join(outputDir,'workbook-history-retention.json'),JSON.stringify(historyRetention,null,2)+'\n');
 await fs.writeFile(path.join(outputDir,'wave19-current-coverage.json'),factsBytes);
 await fs.writeFile(path.join(outputDir,'workbook-verification-before-wave19.json'),previousBytes);
 const xlsxBytes=await fs.readFile(file);
 const report={schema:previous.schema,input:'wave19-current-coverage.json',planSha256:null,
  planSha256Status:'No new complete production-plan baseline was applied. The historical plan hash is preserved below; full-plan updates require reconciliation against this narrow factual update.',
  historicalPlanSha256:previous.planSha256,historicalWorkbookSha256:sourceSHA256,historicalVerificationSha256:createHash('sha256').update(previousBytes).digest('hex'),
  historicalReport:'workbook-verification-before-wave19.json',coverageSnapshotSha256:createHash('sha256').update(factsBytes).digest('hex'),
  file:path.basename(file),xlsxSha256:createHash('sha256').update(xlsxBytes).digest('hex'),bytes:xlsxBytes.length,sheets:previous.sheets,metrics,calculated,
  engine:'Artifact Tool through the primary bundled Node runtime; read-only native XML verification; native Excel desktop not executed',
  operation:'Narrow factual coverage update after wave19; no full production-plan rewrite',updatedAt:facts.capturedAt,
  sourceSha256:sourceSHA256,changedCells:changes.length,changesBySheet:Object.fromEntries([...new Set(changes.map(c=>c.sheet))].map(n=>[n,changes.filter(c=>c.sheet===n).length])),
  enlargedRows:layoutChanges.length,recalculatedFormulas,editableStatusRecalculation:{sheet:'Actions',address:'H6',before,after,restored,inputRestored:true},
  changeLogSha256:createHash('sha256').update(JSON.stringify(changes,null,2)+'\n').digest('hex'),changeLog:'workbook-change-log.json.gz',layoutChangeLog:'workbook-layout-changes.json.gz',structureChangeLog:'workbook-structure-changes.json.gz',appendedSources:0,
  verification:{passed:false,pending:'Read-only post-export preservation audit and isolated repository contract tests'},
  visualPreviews:previews.map(([sheet,range,label])=>({sheet,range,file:'previews/'+label+'.png'})),
  limits:'Only current factual PNG/clip/stage coverage and the summary were updated. IDs, roles, annotation suffixes, owners, status decisions, source timings and historical proposals remain as in the original workbook. No art or timing certification.'};
 await fs.writeFile(path.join(outputDir,'workbook-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({phase:'exported',file,changedCells:changes.length,enlargedRows:layoutChanges.length,changesBySheet:report.changesBySheet,calculated}));
}else if(mode==='review'){
 const review=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(outputDir,path.basename(source))));
 const values=review.worksheets.getItem('Clips').getRange('I6:I2305').values;
 const longest=values.map((r,i)=>({row:i+6,length:(r[0]||'').length})).sort((a,b)=>b.length-a.length)[0];
 for(const [range,label] of [[`H${longest.row}:M${longest.row}`,'06-longest-history'],['H1576:M1576','07-bom-idle']]){
  const blob=await review.render({sheetName:'Clips',range,scale:1,format:'png'});
  await fs.writeFile(path.join(outputDir,'previews',label+'.png'),new Uint8Array(await blob.arrayBuffer()));
  console.log(JSON.stringify({phase:'review',sheet:'Clips',range,file:label+'.png',longest}));
 }
}else throw new Error('Update mode requires the final integration signal flag.');
