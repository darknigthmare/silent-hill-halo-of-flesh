/** Disposable API diagnostic. No product/source workbook is written. */
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';

const report=process.argv.find(a=>a.startsWith('--report='))?.slice(9);
if(!report)throw Error('Explicit --report= path required.');
const python=process.env.CODEX_PRIMARY_RUNTIME_PYTHON;
if(!python)throw Error('CODEX_PRIMARY_RUNTIME_PYTHON is required.');
const book=Workbook.create(),sheet=book.worksheets.add('Probe');
sheet.getRange('A1').values=[['Absent']];
sheet.getRange('A1').conditionalFormats.add('containsText',{
  text:'Absent',format:{fill:'#FFF0CB'}
});
book.recalculate();
const exported=await SpreadsheetFile.exportXlsx(book);
const temp=await fs.mkdtemp(join(tmpdir(),'silent-hill-dxf-probe-'));
let exportBytes;
try{const file=join(temp,'probe.xlsx');await exported.save(file);exportBytes=await fs.readFile(file);}
finally{await fs.rm(temp,{recursive:true,force:true});}
const result=JSON.parse(execFileSync(python,['-c',
  'import sys,io,zipfile,json,xml.etree.ElementTree as E; z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); ns={"s":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}; root=E.fromstring(z.read("xl/styles.xml")); dxfs=root.find("s:dxfs",ns); print(json.dumps({"dxfXml":[E.tostring(x,encoding="unicode") for x in dxfs],"patternTypes":[x.get("patternType") for x in dxfs.findall(".//s:patternFill",ns)]}))'
],{input:exportBytes,encoding:'utf8'}));
const evidence={schema:1,kind:'isolated-public-api-export-probe',
  documentedCall:"range.conditionalFormats.add('containsText', {text:'Absent', format:{fill:'#FFF0CB'}})",
  sourceWorkbookTouched:false,disposableXlsxWrittenAndRemoved:true,...result,
  conclusion:result.patternTypes.every(x=>x===null)
    ?'The documented solid-color fill also exports without patternType. Rebuilding the existing rules through this public API does not preserve that source attribute.'
    :result.patternTypes.every(x=>x==='solid')
      ?'The documented fill exports with patternType=solid on a newly created rule. Test reapplying the original imported rules through the same public API before considering an OOXML repair.'
      :'Inspect exported pattern types before selecting a repair.'};
await fs.writeFile(report,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
