/** Narrow update of the existing companion workbook. Run a byte-identical copy
 * from an OS temporary directory using the bundled primary Node runtime.
 * --root=/checkout --out=/evidence --output=/output.xlsx --mode=inspect|edit
 * The four imported stage rows are resolved by stable ID; all other cells and
 * all formulas are preserved. No sheet, table, filter or validation is rebuilt.
 */
import fs from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const arg=n=>process.argv.find(a=>a.startsWith('--'+n+'='))?.slice(n.length+3);
const root=resolve(arg('root')),out=resolve(arg('out')),mode=arg('mode')||'inspect';
if(!['inspect','edit'].includes(mode))throw Error('Expected inspect or edit mode.');
await fs.mkdir(out,{recursive:true});
const source=join(root,'docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx');
const bytes=await fs.readFile(source),hash=b=>createHash('sha256').update(b).digest('hex');
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const corpus=wb.worksheets.getItem('Corpus'),stages=wb.worksheets.getItem('Stages');
const value=(sheet,cell)=>sheet.getRange(cell).values[0][0];
const snapshot=sheet=>{const range=sheet.getRange(sheet.name==='Corpus'?'A1:M74':'A1:J131');return {values:range.values,formulas:range.formulas,tables:sheet.tables.items.map(t=>({name:t.name,style:t.style,showHeaders:t.showHeaders,showTotals:t.showTotals,showFilterButton:t.showFilterButton}))};};
const before={Corpus:snapshot(corpus),Stages:snapshot(stages)};
const ids=stages.getRange('A9:A131').values.map(r=>r[0]);
if(ids.length!==123||new Set(ids).size!==123)throw Error('Stage identifiers differ from the existing table.');
const info=await wb.inspect({kind:'workbook,sheet,table',maxChars:4500,tableMaxRows:2,tableMaxCols:5,tableMaxCellChars:70});
await fs.writeFile(join(out,mode+'-inspection.json'),JSON.stringify(info,null,2)+'\n');
const render=async(range,name,book=wb)=>{const blob=await book.render({sheetName:'Stages',range,scale:1,format:'png'});const b=new Uint8Array(await blob.arrayBuffer());await fs.writeFile(join(out,name),b);return {file:name,range,sha256:hash(b)};};
if(mode==='inspect'){
  const previews=[await render('A1:H13','stages-before.png')];
  const targetRows=ids.map((id,i)=>id.startsWith('book_')?i+9:null).filter(Boolean);
  previews.push(await render('A'+Math.min(...targetRows)+':F'+Math.max(...targetRows),'book-zones-before.png'));
  await fs.writeFile(join(out,'before.json'),JSON.stringify({sourceSHA256:hash(bytes),counts:{active:value(stages,'B4'),open:value(stages,'E4'),blocked:value(stages,'H4'),total:value(stages,'B5')},previews},null,2)+'\n');
  console.log(JSON.stringify({mode,sourceSHA256:hash(bytes),previews}));
  process.exit(0);
}
if(!arg('output'))throw Error('Explicit output path required for edit.');
const prepared=JSON.parse(await fs.readFile(join(out,'prepared-input.json'),'utf8'));
// Imported dxf fills lose patternType on a plain export in this runtime.
// Read the exact four original rules without editing the package, then use the
// public API to reapply those definitions. This keeps their native solid fills.
// The independent package comparator must still pass without any exception.
const python=process.env.CODEX_PRIMARY_RUNTIME_PYTHON;
if(!python)throw Error('CODEX_PRIMARY_RUNTIME_PYTHON is required for read-only source inspection.');
const conditionalFormatPreservation=JSON.parse(execFileSync(python,[
  join(root,'docs/production/vague23/qa-preparation/read-source-conditional-formats.py'),
  '--source',source
],{encoding:'utf8'}));
if(conditionalFormatPreservation.sourceSHA256!==hash(bytes))throw Error('Conditional-format source changed after import.');
for(const rule of conditionalFormatPreservation.rules)wb.worksheets.getItem(rule.sheet).getRange(rule.range).conditionalFormats.clear();
for(const rule of conditionalFormatPreservation.rules)wb.worksheets.getItem(rule.sheet).getRange(rule.range).conditionalFormats.add(rule.type,{text:rule.text,format:{fill:rule.fill}});
conditionalFormatPreservation.method='Original fill-only text rules reapplied through range.conditionalFormats.clear/add; no OOXML mutation.';
await fs.writeFile(join(out,'conditional-format-preservation.json'),JSON.stringify(conditionalFormatPreservation,null,2)+'\n');
const receipts=(await fs.readdir(join(root,'docs/production/vague23'))).filter(n=>/^stage-integration-.*\.json$/.test(n));
const delivered=[],sourceNotes=new Map(),sourceEditions=new Map();
for(const file of receipts){
  const r=JSON.parse(await fs.readFile(join(root,'docs/production/vague23',file),'utf8'));delivered.push(...r.stages.map(s=>s.stageId));
  for(const input of r.inputs){const raw=await fs.readFile(input.path);if(hash(raw)!==input.sha256)throw Error('Stage delivery changed after import.');for(const stage of JSON.parse(raw).stages){sourceNotes.set(stage.stageId,stage.notes?.[0]||'');sourceEditions.set(stage.stageId,stage.edition||'');}}
}
if(!delivered.length||new Set(delivered).size!==delivered.length)throw Error('Missing or duplicated completed stage imports.');
const allowed=new Set(['B4','E4']),changes=[],rowHeightChanges=[];
const widths=[27,39,31,14,15,36,67,48,72,78];
const lineCount=(text,width)=>String(text??'').split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/(width*.9))),0);
for(const id of delivered){
  const index=ids.indexOf(id),data=prepared.stageRows.find(s=>s.id===id);
  if(index<0||!data||data.bitmap!=='Actif'||data.paths.length!==2)throw Error('Imported stage is not active: '+id);
  const row=index+9;
  if(value(stages,'D'+row)!=='Absent')throw Error('Stage already counted: '+id);
  const sourceNote=sourceNotes.get(id);
  const prereleaseNote=/E3 prerelease/i.test(sourceEditions.get(id))&&!/pr[ée](?:version|commercial)/i.test(sourceNote)
    ?'Référence E3 de préversion ; état commercial non certifié.':'';
  const cells={['D'+row]:'Actif',['G'+row]:data.action,['J'+row]:[data.note,sourceNote,prereleaseNote,...data.paths].filter(Boolean).join('\n')};
  for(const [address,newValue]of Object.entries(cells)){allowed.add(address);changes.push({id,address,before:value(stages,address),after:newValue});stages.getRange(address).values=[[newValue]];}
  const range=stages.getRange('A'+row+':J'+row),priorHeight=range.format.rowHeight;
  const required=Math.max(...range.values[0].map((text,i)=>lineCount(text,widths[i])))*13+10;
  if(required>priorHeight){range.format.rowHeight=required;rowHeightChanges.push({id,row,before:priorHeight,after:required});}
}
wb.recalculate();
const active=prepared.stageRows.filter(s=>s.bitmap==='Actif').length,open=prepared.stageRows.filter(s=>s.bitmap==='Absent'&&s.reference==='Ouverte').length;
if(value(stages,'B4')!==active||value(stages,'E4')!==open||value(stages,'B5')!==123||value(stages,'H4')!==15)throw Error('Formula counts do not match current runtime.');
// An actual edit must propagate through the existing formulas, then be restored.
const sample=changes.find(c=>c.address.startsWith('D'));
stages.getRange(sample.address).values=[['Absent']];wb.recalculate();
if(value(stages,'B4')!==active-1||value(stages,'E4')!==open+1)throw Error('Live recalculation failed.');
stages.getRange(sample.address).values=[['Actif']];wb.recalculate();
const after={Corpus:snapshot(corpus),Stages:snapshot(stages)};
if(JSON.stringify(before.Corpus)!==JSON.stringify(after.Corpus))throw Error('Unrelated Corpus sheet changed.');
if(JSON.stringify(before.Stages.formulas)!==JSON.stringify(after.Stages.formulas)||JSON.stringify(before.Stages.tables)!==JSON.stringify(after.Stages.tables))throw Error('Existing formulas or tables changed.');
const differences=[];
for(let r=0;r<before.Stages.values.length;r++)for(let c=0;c<before.Stages.values[r].length;c++){
  if(JSON.stringify(before.Stages.values[r][c])!==JSON.stringify(after.Stages.values[r]?.[c])){
    const address=String.fromCharCode(65+c)+(r+1);if(!allowed.has(address))throw Error('Unexpected edited cell: '+address);differences.push(address);
  }
}
const formulaError=/^#(?:REF!|DIV\/0!|VALUE!|N\/A|NAME\?|NUM!|SPILL!|CALC!|NULL!)/;
for(const sheet of [corpus,stages])for(const row of sheet.getUsedRange().values)for(const cell of row)if(typeof cell==='string'&&formulaError.test(cell))throw Error('Unexpected formula error '+cell);
const output=resolve(arg('output'));await fs.mkdir(dirname(output),{recursive:true});
await(await SpreadsheetFile.exportXlsx(wb)).save(output);
const resultBytes=await fs.readFile(output);
const reopened=await SpreadsheetFile.importXlsx(await FileBlob.load(output));reopened.recalculate();
if(value(reopened.worksheets.getItem('Stages'),'B4')!==active||value(reopened.worksheets.getItem('Stages'),'E4')!==open)throw Error('Export readback mismatch.');
if(reopened.worksheets.getItem('Stages').tables.items.length!==1||reopened.worksheets.getItem('Corpus').tables.items.length!==1)throw Error('Tables lost on export.');
for(const name of ['Corpus','Stages'])if(JSON.stringify(snapshot(reopened.worksheets.getItem(name)))!==JSON.stringify(after[name]))throw Error('Export changed cells, formulas or tables in '+name);
const rows=delivered.map(id=>ids.indexOf(id)+9);
const previews=[await render('A1:H8','stages-after-summary.png',reopened),await render('A'+Math.min(...rows)+':J'+Math.max(...rows),'book-zones-after.png',reopened)];
if(hash(await fs.readFile(source))!==hash(bytes))throw Error('Source workbook was overwritten during edit.');
const report={schema:1,source,sourceSHA256:hash(bytes),output,outputSHA256:hash(resultBytes),authoring:'@oai/artifact-tool import + keyed cell edits + original conditional-format API reapplication',deliveredStageIds:delivered,changes,differences,rowHeightChanges,conditionalFormatPreservation,unchangedCorpus:true,unchangedFormulas:true,unchangedTables:true,counts:{active,open,blocked:15,total:123},recalculation:'passed-edit-and-restored',exportReadback:'passed',formulaErrors:0,previews,visualReview:'pending'};
await fs.writeFile(join(out,'workbook-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({mode,output,counts:report.counts,changedCells:differences.length,previews}));
