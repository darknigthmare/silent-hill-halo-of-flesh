/** Targeted update of the existing Corpus/Stages workbook with Artifact Tool.
 * Run a copy from a private OS temporary directory using CODEX_PRIMARY_RUNTIME_NODE.
 * --root=/checkout --output=/workspace/outputs/unique --mode=inspect|apply
 * Apply additionally requires --input=/fresh/prepare-corpus-input.json.
 * The checked-in workbook is never overwritten by this script.
 */
import fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';

const arg=(name,fallback='')=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3)||fallback;
if(!arg('root')||!arg('output'))throw Error('Explicit --root and --output required.');
const root=resolve(arg('root')),outputDir=resolve(arg('output')),mode=arg('mode','inspect');
if(!['inspect','apply'].includes(mode))throw Error('Use mode inspect or apply.');
const inputPath=join(root,'docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx');
const bytes=await fs.readFile(inputPath),hash=b=>createHash('sha256').update(b).digest('hex');
const sourceSHA256=hash(bytes);
await fs.mkdir(outputDir,{recursive:true});
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const corpus=wb.worksheets.getItem('Corpus'),stages=wb.worksheets.getItem('Stages');
const value=(sheet,address)=>sheet.getRange(address).values[0][0];
const assert=(passed,message)=>{if(!passed)throw Error(message);};
const fixedRanges={Corpus:'A1:M74',Stages:'A1:J131'};
const snapshot=sheet=>({values:sheet.getRange(fixedRanges[sheet.name]).values,formulas:sheet.getRange(fixedRanges[sheet.name]).formulas});
const before={Corpus:snapshot(corpus),Stages:snapshot(stages)};
const tables=()=>[corpus,stages].map(s=>({sheet:s.name,tables:s.tables.items.map(t=>({name:t.name,style:t.style,showFilterButton:t.showFilterButton}))}));
const beforeTables=tables();
assert(value(corpus,'B4')===66&&value(stages,'B5')===123,'Unexpected workbook catalogue.');
if(mode==='inspect'){
  const inspection=await wb.inspect({kind:'workbook,sheet,table',maxChars:6000,tableMaxRows:3,tableMaxCols:6});
  await fs.writeFile(join(outputDir,'before-inspection.json'),JSON.stringify({sourceSHA256,inspection,tables:beforeTables,stagesSummary:{active:value(stages,'B4'),openMissing:value(stages,'E4'),blocked:value(stages,'H4')},formulas:{Corpus:corpus.getRange('A4:H5').formulas,Stages:stages.getRange('A4:H5').formulas}},null,2)+'\n');
  const png=await wb.render({sheetName:'Stages',range:'A1:H12',scale:1,format:'png'});
  await fs.writeFile(join(outputDir,'before-stages-preview.png'),new Uint8Array(await png.arrayBuffer()));
  assert(hash(await fs.readFile(inputPath))===sourceSHA256,'Inspection changed source workbook.');
  console.log(JSON.stringify({mode,sourceSHA256,active:value(stages,'B4'),openMissing:value(stages,'E4'),blocked:value(stages,'H4'),preview:join(outputDir,'before-stages-preview.png')}));
  process.exit(0);
}
if(!arg('input'))throw Error('Fresh prepared runtime --input required for apply.');
const inputRaw=await fs.readFile(resolve(arg('input'))),prepared=JSON.parse(inputRaw),expected=new Map(prepared.stageRows.map(s=>[s.id,s]));
assert(expected.size===123,'Expected 123 unique stage records.');
for(const [path,sha] of Object.entries(prepared.sourceHashes))assert(hash(await fs.readFile(join(root,path)))===sha,'Stale runtime snapshot: '+path);
const beforeInspection=JSON.parse(await fs.readFile(join(outputDir,'before-inspection.json'),'utf8'));
assert(beforeInspection.sourceSHA256===sourceSHA256,'Workbook changed since the baseline preview.');
const updates=[];
const widths=[27,39,31,14,15,36,67,48,72,78];
const lines=(value,width)=>String(value??'').split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil([...line].reduce((m,ch)=>m+(/[\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff\uff01-\uff60]/u.test(ch)?2:1),0)/(width*.9))),0);
for(let row=9;row<=131;row++){
  const old=stages.getRange('A'+row+':J'+row).values[0],data=expected.get(old[0]);
  assert(data&&data.name===old[1]&&data.sourceLabel===old[2],'Stage identity/order mismatch at '+row);
  if(data.bitmap===old[3])continue;
  assert(old[3]==='Absent'&&data.bitmap==='Actif'&&old[4]==='Ouverte'&&data.reference==='Ouverte','Unexpected stage status change: '+data.id);
  const notes=[data.note,...data.paths].filter(Boolean).join('\n');
  stages.getRange('D'+row).values=[['Actif']];
  stages.getRange('G'+row).values=[[data.action]];
  stages.getRange('J'+row).values=[[notes]];
  const values=stages.getRange('A'+row+':J'+row).values[0],needed=Math.max(...values.map((v,i)=>lines(v,widths[i])))*13+10;
  const originalHeight=stages.getRange('A'+row+':J'+row).format.rowHeight;
  const nextHeight=Math.max(Number(originalHeight)||0,needed);
  if(nextHeight>Number(originalHeight))stages.getRange('A'+row+':J'+row).format.rowHeight=nextHeight;
  updates.push({id:data.id,row,cells:['D'+row,'G'+row,'J'+row],previousBitmap:old[3],bitmap:data.bitmap,paths:data.paths,originalHeight,rowHeight:nextHeight});
}
assert(updates.length>0,'No new stage bitmap to update.');
wb.recalculate();
const counts={corpus:value(corpus,'B4'),active:value(stages,'B4'),openMissing:value(stages,'E4'),blocked:value(stages,'H4'),stages:value(stages,'B5')};
assert(counts.corpus===66&&counts.stages===123&&counts.active===prepared.stageRows.filter(s=>s.bitmap==='Actif').length&&counts.openMissing===prepared.stageRows.filter(s=>s.bitmap==='Absent'&&s.reference==='Ouverte').length&&counts.blocked===prepared.stageRows.filter(s=>s.reference==='Bloquée').length,'Updated count formulas differ from runtime.');
assert(JSON.stringify(snapshot(corpus))===JSON.stringify(before.Corpus),'Corpus values or formulas changed.');
assert(JSON.stringify(stages.getRange(fixedRanges.Stages).formulas)===JSON.stringify(before.Stages.formulas),'Stage formulas changed.');
assert(JSON.stringify(tables())===JSON.stringify(beforeTables),'Native table definitions changed.');
const changedCells=new Set(updates.flatMap(u=>u.cells).concat(['B4','E4']));
const afterStages=stages.getRange(fixedRanges.Stages).values;
for(let row=0;row<before.Stages.values.length;row++)for(let col=0;col<10;col++){
  const address=String.fromCharCode(65+col)+(row+1);
  if(!changedCells.has(address))assert(JSON.stringify(afterStages[row][col])===JSON.stringify(before.Stages.values[row][col]),'Unrelated cell changed: '+address);
}
const chosen=updates[0].row;
stages.getRange('D'+chosen).values=[['Absent']];wb.recalculate();
assert(value(stages,'B4')===counts.active-1&&value(stages,'E4')===counts.openMissing+1,'Live formula recalculation failed.');
stages.getRange('D'+chosen).values=[['Actif']];wb.recalculate();
assert(value(stages,'B4')===counts.active&&value(stages,'E4')===counts.openMissing,'Live test restoration failed.');
const errorScan=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'final formula error scan',maxChars:4000});
const inspection=await wb.inspect({kind:'region',sheetId:'Stages',range:'A1:H12',include:'values,formulas',maxChars:5000});
await fs.writeFile(join(outputDir,'after-inspection.json'),JSON.stringify({inspection,errorScan,updates,counts},null,2)+'\n');
const finalPath=join(outputDir,'SILENT_HILL_CORPUS_BIBLE.xlsx');
await(await SpreadsheetFile.exportXlsx(wb)).save(finalPath);
assert(hash(await fs.readFile(inputPath))===sourceSHA256,'Source workbook overwritten.');
for(const [path,sha] of Object.entries(prepared.sourceHashes))assert(hash(await fs.readFile(join(root,path)))===sha,'Runtime changed during workbook update: '+path);
const report={schema:1,wave:23,createdAt:new Date().toISOString(),authoring:'@oai/artifact-tool',source:{path:inputPath,sha256:sourceSHA256},sourceHashes:prepared.sourceHashes,preparedInputSHA256:hash(inputRaw),updatedStages:updates,counts,corpusUnchanged:true,stageOrderUnchanged:true,formulasPreserved:true,nativeTablesPreserved:true,representativeRecalculation:'passed-and-restored',exportReadback:'pending',visualReview:'pending',xlsx:{path:finalPath,bytes:(await fs.stat(finalPath)).size,sha256:hash(await fs.readFile(finalPath))}};
await fs.writeFile(join(outputDir,'workbook-verification.json'),JSON.stringify(report,null,2)+'\n');
await fs.writeFile(join(outputDir,'stage-register.json'),JSON.stringify({asOf:'2026-11-19',sourceHashes:prepared.sourceHashes,stages:prepared.stageRows},null,2)+'\n');
console.log(JSON.stringify({output:finalPath,updatedStages:updates.map(u=>u.id),counts,sha256:report.xlsx.sha256}));

