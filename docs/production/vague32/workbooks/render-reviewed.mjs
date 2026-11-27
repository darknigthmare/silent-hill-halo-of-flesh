// Read-only rendering of the validated final XLSX or its exact-payload QA projection.
// Run with CODEX_PRIMARY_RUNTIME_NODE after copying this file into a temporary
// directory whose node_modules points to CODEX_PRIMARY_RUNTIME_NODE_MODULES.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const [input, outputDir, scope] = process.argv.slice(2);
if (!input || !outputDir || !['full-corpus-workbook', 'exact-guide-payload-projection'].includes(scope)) {
  throw new Error('Usage: render-reviewed.mjs <input.xlsx> <outputDir> <scope>');
}
await fs.mkdir(outputDir, { recursive: true });
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const guide = workbook.worksheets.getItem('Guide combat');
const associations = workbook.worksheets.getItem('Associations guide');
const checks = [
  ['guide sections', guide.getRange('B4').values[0][0], 68],
  ['association count', associations.getRange('B4').values[0][0], 445],
  ['antique shop label', associations.getRange('C282').values[0][0], 'GREEN LION — ANTICHAMBRE DU CULTE'],
  ['antique shop status', associations.getRange('F282').values[0][0], 'bitmap candidat référencé ; fixed-altered'],
  ['clinic label', associations.getRange('C327').values[0][0], 'LIGHTHOUSE — ENTRÉE DE LA CLINIQUE'],
  ['clinic status', associations.getRange('F327').values[0][0], 'bitmap candidat référencé ; fixed-normal'],
];
for (const [name, actual, expected] of checks) {
  if (actual !== expected) throw new Error(`${name}: expected ${expected}, received ${actual}`);
}
const views = [
  ['Guide combat', 'A1:H6', 'guide-summary'],
  ['Guide combat', 'A58:F64', 'extensions-retained'],
  ['Associations guide', 'B282:G282', 'antique-shop'],
  ['Associations guide', 'B327:G327', 'clinic-entrance'],
];
const previews = [];
for (const [sheetName, range, name] of views) {
  const rendered = await workbook.render({ sheetName, range, scale: 1, format: 'png' });
  const bytes = new Uint8Array(await rendered.arrayBuffer());
  const filename = `${name}.png`;
  await fs.writeFile(path.join(outputDir, filename), bytes);
  previews.push({ sheetName, range, filename, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const report = {
  schemaVersion: 1,
  status: 'passed',
  inputSha256: createHash('sha256').update(await fs.readFile(input)).digest('hex'),
  scope,
  checks: checks.map(([name, actual, expected]) => ({ name, actual, expected, passed: true })),
  previews,
  mutation: false,
  limits: 'Read-only Artifact Tool re-import and render. Native Excel desktop was not executed. A projection is temporary and never replaces the full delivered workbook; the preservation report separately establishes every retained worksheet payload.',
};
await fs.writeFile(path.join(outputDir, 'render-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, scope, checks: checks.length, previews: previews.length }));
