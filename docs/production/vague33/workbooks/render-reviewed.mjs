// Read-only Artifact Tool rendering; run from a runtime linked to the primary dependencies.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {FileBlob, SpreadsheetFile} from '@oai/artifact-tool';

const [input, outputDir, scope, associationFile] = process.argv.slice(2);
if (!input || !outputDir || !associationFile || !['full-corpus-workbook', 'exact-guide-payload-projection'].includes(scope)) {
  throw new Error('Usage: render-reviewed.mjs <input.xlsx> <outputDir> <scope> <associations.json>');
}
const sourceBytes = await fs.readFile(associationFile), source = JSON.parse(sourceBytes);
const index = source.records.findIndex(row => row.kind === 'stage' && row.id === 'arcade_historical');
if (index < 0) throw new Error('Missing Historical Society association');
const sourceRow = source.records[index], rowNumber = index + 9;
await fs.mkdir(outputDir, {recursive: true});
async function writeAtomic(filename, bytes) {
  const target = path.join(outputDir, filename), temporary = target + '.tmp';
  await fs.writeFile(temporary, bytes);
  await fs.rename(temporary, target);
}
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const guide = workbook.worksheets.getItem('Guide combat'), associations = workbook.worksheets.getItem('Associations guide');
const checks = [
  ['guide sections', guide.getRange('B4').values[0][0], 68],
  ['association count', associations.getRange('B4').values[0][0], source.records.length],
  ['Historical Society ID', associations.getRange('B' + rowNumber).values[0][0], sourceRow.id],
  ['Historical Society label', associations.getRange('C' + rowNumber).values[0][0], sourceRow.name],
  ['Historical Society status', associations.getRange('F' + rowNumber).values[0][0], sourceRow.observedStatus],
];
for (const [name, actual, expected] of checks) if (actual !== expected) throw new Error(`${name}: expected ${expected}, received ${actual}`);
const views = [
  ['Guide combat', 'A1:H6', 'guide-summary'],
  ['Guide combat', 'A58:F64', 'extensions-retained'],
  ['Associations guide', 'B' + rowNumber + ':G' + rowNumber, 'historical-society'],
  [workbook.worksheets.getItemAt(0).name, 'A1:F8', 'historical-opening'],
];
const previews = [];
for (const [sheetName, range, name] of views) {
  const rendered = await workbook.render({sheetName, range, scale: 1, format: 'png'});
  const bytes = new Uint8Array(await rendered.arrayBuffer()), filename = name + '.png';
  await writeAtomic(filename, bytes);
  previews.push({sheetName, range, filename, sha256: createHash('sha256').update(bytes).digest('hex')});
}
const report = {
  schemaVersion: 1, status: 'passed', inputSha256: createHash('sha256').update(await fs.readFile(input)).digest('hex'),
  associationSha256: createHash('sha256').update(sourceBytes).digest('hex'), scope,
  checks: checks.map(([name, actual, expected]) => ({name, actual, expected, passed: true})), previews, mutation: false,
  limits: 'Read-only Artifact Tool re-import and render. Native Excel desktop was not run. The temporary rendering projection never replaces the full delivered workbook; historical payloads are verified separately byte for byte.',
};
await writeAtomic('render-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({status: report.status, scope, checks: checks.length, previews: previews.length}));
