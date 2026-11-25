// Run with CODEX_PRIMARY_RUNTIME_NODE from a temporary directory linked to
// CODEX_PRIMARY_RUNTIME_NODE_MODULES. The repository needs no new dependency.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const repo = process.argv[2];
if (!repo) throw new Error('Usage: node --input-type=module - <repo> <outputDir> <mode> [basename] [source.xlsx] < script.mjs');
const outputDir = process.argv[3];
const mode = process.argv[4] || 'inspect';
if (!outputDir) throw new Error('An absolute output directory is required');
await fs.mkdir(outputDir, { recursive: true });
const basename = process.argv[5] || 'SILENT_HILL_CORPUS_BIBLE.xlsx';
const input = process.argv[6] || path.join(repo, 'docs/production', basename);
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const summary = await workbook.inspect({ kind: 'workbook,sheet,table', maxChars: 9000, tableMaxRows: 4, tableMaxCols: 8, tableMaxCellChars: 100 });
await fs.writeFile(path.join(outputDir, 'before-inspect.ndjson'), summary.ndjson);
console.log(JSON.stringify({ input, mode }));
const names = basename.includes('CORPUS') ? ['Corpus', 'Stages'] : [workbook.worksheets.getItemAt(0).name];
for (const name of names) {
  const preview = await workbook.render({ sheetName: name, range: 'A1:F8', scale: 1.2, format: 'png' });
  await fs.writeFile(path.join(outputDir, `before-${name}.png`), new Uint8Array(await preview.arrayBuffer()));
}
const decisionLabels = { retained: 'Retenu', deferred: 'Différé', 'decision-needed': 'À décider', 'not-applicable': 'Non applicable' };
const statusLabels = { documented: 'Documenté', 'documented-only': 'Conçu, à intégrer', partial: 'Partiel' };
const kindLabels = { profile: 'Profil', stage: 'Arène', chronicle: 'Chronique', corpus: 'Corpus', projectile: 'Projectile' };
const headerFill = '#343B36';
const textColor = '#28302B';
const titleColor = '#572A2A';
function label(map, value) {
  if (!(value in map)) throw new Error(`Unmapped label: ${value}`);
  return map[value];
}
function setupSheet(name, endRow, endColumn, widths) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  sheet.tabColor = '#5E6962';
  sheet.getRange(`A1:${endColumn}${endRow}`).format = {
    font: { name: 'Arial', size: 10, color: textColor },
    rowHeight: 22, verticalAlignment: 'center',
  };
  Object.entries(widths).forEach(([column, width]) => {
    sheet.getRange(`${column}1:${column}${endRow}`).format.columnWidth = width;
  });
  sheet.getRange('A2').format.font = { name: 'Arial', size: 16, bold: true, color: titleColor };
  sheet.getRange('A2').format.rowHeight = 30;
  sheet.getRange(`A3:${endColumn}3`).format.borders = { bottom: { style: 'thin', color: '#D5DAD6' } };
  sheet.getRange('A6').format = { font: { name: 'Arial', size: 10, italic: true, color: '#59655D' }, rowHeight: 24 };
  sheet.freezePanes.freezeRows(8);
  sheet.freezePanes.freezeColumns(2);
  return sheet;
}
function writeTable(sheet, startRow, headers, rows, tableName, widths) {
  const lastColumn = String.fromCharCode(64 + headers.length);
  const endRow = startRow + rows.length;
  sheet.getRange(`A${startRow}:${lastColumn}${endRow}`).values = [headers, ...rows];
  const table = sheet.tables.add(`A${startRow}:${lastColumn}${endRow}`, true, tableName);
  table.style = 'TableStyleLight1';
  table.showFilterButton = true;
  sheet.getRange(`A${startRow}:${lastColumn}${startRow}`).format = {
    fill: headerFill, font: { name: 'Arial', size: 10, color: '#FFFFFF', bold: true },
    wrapText: true, rowHeight: 36, horizontalAlignment: 'center', verticalAlignment: 'center',
    borders: { insideVertical: { style: 'thin', color: '#FFFFFF' } },
  };
  sheet.getRange(`A${startRow + 1}:${lastColumn}${endRow}`).format = {
    wrapText: true, verticalAlignment: 'top', horizontalAlignment: 'left',
  };
  rows.forEach((row, index) => {
    const required = Math.max(...row.map((value, column) => {
      const width = widths[String.fromCharCode(65 + column)];
      return String(value ?? '').split('\n').reduce((total, line) => total + Math.max(1, Math.ceil(line.length / Math.max(7, width - 4))), 0);
    }));
    const height = Math.max(42, Math.min(390, 10 + required * 14));
    sheet.getRange(`A${startRow + index + 1}:${lastColumn}${startRow + index + 1}`).format.rowHeight = height;
    if (index % 2 === 1) sheet.getRange(`A${startRow + index + 1}:${lastColumn}${startRow + index + 1}`).format.fill = '#F2F4F1';
  });
  return table;
}
let sourceHashes = {}, expectedCounts = {}, previewSpecs = [];
if (mode === 'build') {
  for (const name of ['Guide combat', 'Associations guide']) {
    let existing;
    try { existing = workbook.worksheets.getItem(name); } catch {}
    if (existing) throw new Error(`The source already contains ${name}. Reconcile manual edits before rebuilding from its original baseline.`);
  }
  const reqPath = path.join(repo, 'docs/combat-guide/requirements.json');
  const assoPath = path.join(repo, 'docs/combat-guide/associations.json');
  const reqBytes = await fs.readFile(reqPath);
  const assoBytes = await fs.readFile(assoPath);
  const requirements = JSON.parse(reqBytes), associations = JSON.parse(assoBytes);
  sourceHashes = Object.fromEntries([['requirements', reqBytes], ['associations', assoBytes]].map(([key, bytes]) => [key, createHash('sha256').update(bytes).digest('hex')]));
  const sections = requirements.sections, modules = requirements.moduleDecisions, records = associations.records;
  if (sections.length !== 30 || sections.some((entry, index) => entry.section !== String(index).padStart(2, '0'))) throw new Error('Expected ordered sections 00–29');
  if (new Set(records.map(record => `${record.kind}:${record.id}`)).size !== records.length) throw new Error('Duplicate association identifier');
  const guideWidths = { A: 24, B: 40, C: 10, D: 18, E: 22, F: 74, G: 66, H: 56, I: 68, J: 62, K: 30 };
  const guide = setupSheet('Guide combat', 44 + modules.length, 'K', guideWidths);
  guide.getRange('A2').values = [['GUIDE COMBAT — SILENT HILL']];
  guide.getRange('A4:B5').values = [['Rubriques associées', null], ['Modules différés', null]];
  guide.getRange('D4:E5').values = [['Modules étudiés', null], ['À décider', null]];
  guide.getRange('G4:H5').values = [['Conception seulement', null], ['Hors périmètre', null]];
  guide.getRange('B4').formulas = [['=COUNTA(A9:A38)']];
  guide.getRange('B5').formulas = [[`=COUNTIFS(D45:D${44 + modules.length},"Différé")`]];
  guide.getRange('E4').formulas = [[`=COUNTA(A45:A${44 + modules.length})`]];
  guide.getRange('E5').formulas = [[`=COUNTIFS(D45:D${44 + modules.length},"À décider")`]];
  guide.getRange('H4').formulas = [['=COUNTIFS(E9:E38,"Conçu, à intégrer")']];
  guide.getRange('H5').formulas = [[`=COUNTIFS(D45:D${44 + modules.length},"Non applicable")`]];
  guide.getRange('A6').values = [[`Source : ${requirements.sourceFile} — ${requirements.asOf}. État de conception distinct de la livraison jouable.`]];
  const guideRows = sections.map(row => [row.id, `${row.section}. ${row.title}`, row.priority, label(decisionLabels, row.decision),
    label(statusLabels, row.implementationStatus), row.adaptation, row.observed, row.nextAction,
    row.acceptance.join('\n'), row.evidencePaths.join('\n'), row.entityKinds.join(', ')]);
  writeTable(guide, 8, ['ID', 'Rubrique du guide', 'Priorité', 'Décision', 'État constaté', 'Adaptation Silent Hill', 'Existant observé', 'Prochaine action', 'Critères de validation', 'Fichiers associés', 'Catégories associées'], guideRows, 'CombatGuideSections', guideWidths);
  guide.getRange('A42').values = [['Décisions de modules']];
  guide.getRange('A42').format.font = { name: 'Arial', size: 14, bold: true, color: titleColor };
  const moduleRows = modules.map(row => [row.id, row.name, row.priority, label(decisionLabels, row.decision), row.sections.join(', '), row.reason]);
  writeTable(guide, 44, ['ID', 'Module', 'Priorité', 'Décision', 'Rubriques', 'Motif'], moduleRows, 'CombatGuideModules', guideWidths);
  guide.getRange(`D45:D${44 + modules.length}`).dataValidation = { rule: { type: 'list', values: Object.values(decisionLabels) } };
  guide.getRange(`D45:D${44 + modules.length}`).conditionalFormats.add('containsText', { text: 'À décider', format: { fill: '#FFF0C7', font: { bold: true, color: '#6C4B00' } } });
  const assoWidths = { A: 24, B: 42, C: 45, D: 25, E: 32, F: 80, G: 75, H: 18 };
  const end = 8 + records.length;
  const asso = setupSheet('Associations guide', end, 'H', assoWidths);
  asso.getRange('A2').values = [['ASSOCIATIONS DU GUIDE AU CONTENU']];
  asso.getRange('A4:B5').values = [['Entités associées', null], ['Arènes', null]];
  asso.getRange('D4:E5').values = [['Profils', null], ['Chroniques', null]];
  asso.getRange('G4:H5').values = [['Corpus éditorial', null], ['Projectiles', null]];
  asso.getRange('B4').formulas = [[`=COUNTA(B9:B${end})`]];
  for (const [cell, category] of [['B5', 'Arène'], ['E4', 'Profil'], ['E5', 'Chronique'], ['H4', 'Corpus'], ['H5', 'Projectile']]) {
    asso.getRange(cell).formulas = [[`=COUNTIFS(A9:A${end},"${category}")`]];
  }
  asso.getRange('A6').values = [[`Inventaire au ${associations.asOf}, référence ${associations.baselineCommit.slice(0, 8)}. Les détails restent dans docs/combat-guide/associations.json.`]];
  const sectionLines = sections => Array.from({ length: Math.ceil(sections.length / 8) }, (_, index) => sections.slice(index * 8, index * 8 + 8).join(', ')).join('\n');
  const assoRows = records.map(row => [label(kindLabels, row.kind), row.id, row.name, row.source || '', sectionLines(row.guideSections), row.observedStatus, row.targetFile]);
  writeTable(asso, 8, ['Catégorie', 'ID existant', 'Nom', 'Œuvre / source', 'Rubriques du guide', 'État observé', 'Fichier associé'], assoRows, 'CombatGuideAssociations', assoWidths);
  for (const sheet of [guide, asso]) for (const cell of ['B4', 'B5', 'E4', 'E5', 'H4', 'H5']) sheet.getRange(cell).format = { font: { name: 'Arial', size: 10, bold: true }, numberFormat: '#,##0', horizontalAlignment: 'right' };
  expectedCounts = { sections: 30, modules: modules.length, associations: records.length,
    moduleDecisions: Object.fromEntries(Object.keys(decisionLabels).map(key => [key, modules.filter(row => row.decision === key).length])) };
  previewSpecs = [
    ['Guide combat', 'A1:F11', 'guide-overview'], ['Guide combat', 'G8:K11', 'guide-details'],
    ['Guide combat', 'A19:F22', 'guide-narrative'], ['Guide combat', `A42:F${44 + modules.length}`, 'guide-modules'],
    ['Associations guide', 'A1:G12', 'associations-overview'],
    ['Associations guide', `A${Math.max(8, end - 3)}:G${end}`, 'associations-end'],
  ];
} else if (mode !== 'inspect') throw new Error('Mode must be inspect or build');
workbook.recalculate();
if (mode === 'build') {
  const guide = workbook.worksheets.getItem('Guide combat');
  const asso = workbook.worksheets.getItem('Associations guide');
  if (guide.getRange('B4').values[0][0] !== 30 || asso.getRange('B4').values[0][0] !== expectedCounts.associations) throw new Error('Workbook counts differ from JSON');
  const cell = guide.getRange('D45');
  const before = cell.values[0][0];
  const base = guide.getRange('B5').values[0][0];
  cell.values = [['Retenu']];
  workbook.recalculate();
  if (guide.getRange('B5').values[0][0] !== base - 1) throw new Error('Module summary does not react to a decision change');
  cell.values = [[before]];
  workbook.recalculate();
  if (guide.getRange('B5').values[0][0] !== base) throw new Error('Module decision restore failed');
  const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 50 }, maxChars: 3000 });
  await fs.writeFile(path.join(outputDir, 'formula-scan.ndjson'), errors.ndjson);
  if (/"match"/.test(errors.ndjson) && /#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A|#NUM!|#NULL!|#SPILL!|#CALC!/.test(errors.ndjson)) throw new Error('Unexpected formula error');
  for (const [sheetName, range, name] of previewSpecs) {
    const preview = await workbook.render({ sheetName, range, scale: 1, format: 'png' });
    await fs.writeFile(path.join(outputDir, `${name}.png`), new Uint8Array(await preview.arrayBuffer()));
  }
  const inspect = await workbook.inspect({ kind: 'region', sheetId: 'Guide combat', range: 'A4:H5', maxChars: 2500 });
  await fs.writeFile(path.join(outputDir, 'after-inspect.ndjson'), inspect.ndjson);
}
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outputDir, mode === 'inspect' ? 'roundtrip.xlsx' : basename));
await fs.writeFile(path.join(outputDir, 'authoring-report.json'), JSON.stringify({ mode, basename, sourceHashes, expectedCounts, previews: previewSpecs.map(row => row[2] + '.png'), sourceWorkbookSha256: createHash('sha256').update(await fs.readFile(input)).digest('hex'), limits: 'Artifact Tool authoring, recalculation and rendering. Native Excel desktop not executed.' }, null, 2) + '\n');
console.log(JSON.stringify({ mode, outputDir, expectedCounts }));
