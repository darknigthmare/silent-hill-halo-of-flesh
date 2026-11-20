/** Reopen and inspect one bounded changed view per invocation.
 * Run from an OS temporary directory with bundled Artifact Tool.
 * --output=/workspace/outputs/unique [--row=23]; omitting row renders the summary.
 */
import fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
const arg=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3);
if(!arg('output'))throw Error('Explicit output required.');
const out=resolve(arg('output')),path=join(out,'SILENT_HILL_CORPUS_BIBLE.xlsx'),reportPath=join(out,'workbook-verification.json');
const hash=b=>createHash('sha256').update(b).digest('hex'),report=JSON.parse(await fs.readFile(reportPath,'utf8'));
if(hash(await fs.readFile(path))!==report.xlsx.sha256)throw Error('Unexpected exported workbook bytes.');
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path));wb.recalculate();
const c=wb.worksheets.getItem('Corpus'),s=wb.worksheets.getItem('Stages'),v=(sheet,cell)=>sheet.getRange(cell).values[0][0];
const actual={corpus:v(c,'B4'),active:v(s,'B4'),openMissing:v(s,'E4'),blocked:v(s,'H4'),stages:v(s,'B5')};
if(JSON.stringify(actual)!==JSON.stringify(report.counts))throw Error('Formula readback differs.');
if(c.tables.items.length!==1||s.tables.items.length!==1||c.tables.items[0].name!=='CorpusSilentHill'||s.tables.items[0].name!=='StagesSilentHill')throw Error('Native tables differ.');
for(const item of report.updatedStages)if(v(s,'A'+item.row)!==item.id||v(s,'D'+item.row)!=='Actif'||item.paths.some(p=>!String(v(s,'J'+item.row)).includes(p)))throw Error('Updated row differs: '+item.id);
const excelError=/^#(?:REF!|DIV\/0!|VALUE!|N\/A|NAME\?|NUM!|SPILL!|CALC!|NULL!)/;
for(const [sheet,range] of [[c,'A1:M74'],[s,'A1:J131']])for(const row of sheet.getRange(range).values)for(const cell of row)if(typeof cell==='string'&&excelError.test(cell))throw Error('Formula error after reopen.');
const row=arg('row')?Number(arg('row')):null;
if(row!==null&&!report.updatedStages.some(item=>item.row===row))throw Error('Only updated rows may be selected.');
const range=row===null?'A1:H12':'A'+row+':J'+row;
global.gc?.();
const png=await wb.render({sheetName:'Stages',range,scale:1,format:'png'}),bytes=new Uint8Array(await png.arrayBuffer()),file=row===null?'after-stages-preview.png':'after-stage-row-'+row+'.png';
await fs.writeFile(join(out,file),bytes);
if(hash(await fs.readFile(path))!==report.xlsx.sha256)throw Error('Reopen changed exported bytes.');
report.exportReadback='passed';report.formulaErrors=0;report.readbackSummary=actual;
report.renderedViews=(report.renderedViews||[]).filter(r=>r.range!==range).concat({sheet:'Stages',range,file,sha256:hash(bytes),bytes:bytes.length});
await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts:actual,range,rendered:file,sha256:hash(bytes)}));

