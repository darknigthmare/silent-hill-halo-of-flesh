// Read-only Artifact Tool QA. Avoid full historical recalculation/export.
import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

process.on('uncaughtException', error => { console.error('QA_ERROR: ' + error.message); process.exit(1); });
process.on('unhandledRejection', error => { console.error('QA_ERROR: ' + (error?.message || String(error))); process.exit(1); });

const [input, outputDir, historicalName, selectedViews] = process.argv.slice(2);
if (!input || !outputDir || !historicalName) throw new Error('Usage: render-combat-guide-final.mjs input.xlsx outputDir historicalSheet');
await fs.mkdir(outputDir, { recursive: true });
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const formulas = [];
for (const name of ['Guide combat', 'Associations guide']) {
  const sheet = workbook.worksheets.getItem(name);
  for (const address of ['B4', 'B5', 'E4', 'E5', 'H4', 'H5']) {
    const cell = sheet.getRange(address);
    formulas.push({ sheet: name, address, formula: cell.formulas[0][0], value: cell.values[0][0] });
  }
}
await fs.writeFile(path.join(outputDir, 'final-formulas.json'), JSON.stringify(formulas, null, 2) + '\n');
const views = [
  [historicalName, 'A1:F8', 'historical-after', 1.2],
  ['Guide combat', 'A1:F11', 'guide-overview', 1],
  ['Guide combat', 'G17:K19', 'guide-story-changes', 1],
  ['Guide combat', 'G23:K26', 'guide-production-changes', 1],
  ['Guide combat', 'A58:F64', 'extensions-overview', 1],
  ['Guide combat', 'G60:K63', 'extensions-contracts', 1],
  ['Guide combat', 'A79:F83', 'extensions-access', 1],
  ['Guide combat', 'G81:K83', 'extensions-access-contracts', 1],
  ['Guide combat', 'A95:F98', 'extensions-end', 1],
  ['Associations guide', 'A1:H12', 'associations-overview', 1],
  ['Associations guide', 'A448:G453', 'associations-end', 1],
  ['Associations guide', 'A336:G341', 'associations-stages-arcade', 1],
  ['Associations guide', 'A346:G349', 'associations-stages-ascension', 1],
];
for (const [sheetName, range, name, scale] of views) {
  if (selectedViews && !selectedViews.split(',').includes(name)) continue;
  const rendered = await workbook.render({ sheetName, range, scale, format: 'png' });
  await fs.writeFile(path.join(outputDir, name + '.png'), new Uint8Array(await rendered.arrayBuffer()));
  console.log(JSON.stringify({ rendered: name, sheetName, range }));
}
console.log(JSON.stringify({ input, outputDir, status: 'rendered-read-only' }));
