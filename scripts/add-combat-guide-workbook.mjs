// Run with CODEX_PRIMARY_RUNTIME_NODE from a temporary directory linked to
// CODEX_PRIMARY_RUNTIME_NODE_MODULES. The repository needs no new dependency.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
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
let sourceHashes = {}, expectedCounts = {}, previewSpecs = [], refreshPlan = null;
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

} else if (mode === 'refresh') {
  const baselineRef = process.argv[7] || '9c426d7e230eaec464203acb9b43b63a420acf30';
  const readBaseline = relative => JSON.parse(execFileSync('git', ['show', baselineRef + ':' + relative], { cwd: repo, maxBuffer: 8 * 1024 * 1024 }));
  const reqPath = path.join(repo, 'docs/combat-guide/requirements.json');
  const assoPath = path.join(repo, 'docs/combat-guide/associations.json');
  const reqBytes = await fs.readFile(reqPath), assoBytes = await fs.readFile(assoPath);
  const requirements = JSON.parse(reqBytes), associations = JSON.parse(assoBytes);
  const oldRequirements = readBaseline('docs/combat-guide/requirements.json');
  const oldAssociations = readBaseline('docs/combat-guide/associations.json');
  sourceHashes = Object.fromEntries([['requirements', reqBytes], ['associations', assoBytes]].map(([key, bytes]) => [key, createHash('sha256').update(bytes).digest('hex')]));
  const sections = requirements.sections, modules = requirements.moduleDecisions, records = associations.records;
  if (sections.length !== 30 || sections.some((entry, index) => entry.section !== String(index).padStart(2, '0'))) throw new Error('Expected ordered sections 00–29');
  if (new Set(records.map(record => record.kind + ':' + record.id)).size !== records.length) throw new Error('Duplicate association identifier');
  if (modules.length !== oldRequirements.moduleDecisions.length) throw new Error('A module-count change needs its own layout review');
  if (records.length < oldAssociations.records.length) throw new Error('Association removals need an explicit review');
  const guide = workbook.worksheets.getItem('Guide combat'), asso = workbook.worksheets.getItem('Associations guide');
  const guideHeaders = ['ID', 'Rubrique du guide', 'Priorité', 'Décision', 'État constaté', 'Adaptation Silent Hill', 'Existant observé', 'Prochaine action', 'Critères de validation', 'Fichiers associés', 'Catégories associées'];
  const moduleHeaders = ['ID', 'Module', 'Priorité', 'Décision', 'Rubriques', 'Motif'];
  const assoHeaders = ['Catégorie', 'ID existant', 'Nom', 'Œuvre / source', 'Rubriques du guide', 'État observé', 'Fichier associé'];
  const guideWidths = { A: 24, B: 40, C: 10, D: 18, E: 22, F: 74, G: 66, H: 56, I: 68, J: 62, K: 30 };
  const assoWidths = { A: 24, B: 42, C: 45, D: 25, E: 32, F: 80, G: 75, H: 18 };
  const sectionRows = input => input.sections.map(row => [row.id, row.section + '. ' + row.title, row.priority,
    label(decisionLabels, row.decision), label(statusLabels, row.implementationStatus), row.adaptation, row.observed,
    row.nextAction, row.acceptance.join('\n'), row.evidencePaths.join('\n'), row.entityKinds.join(', ')]);
  const moduleRows = input => input.moduleDecisions.map(row => [row.id, row.name, row.priority,
    label(decisionLabels, row.decision), row.sections.join(', '), row.reason]);
  const sectionLines = values => Array.from({ length: Math.ceil(values.length / 8) }, (_, index) => values.slice(index * 8, index * 8 + 8).join(', ')).join('\n');
  const associationRows = input => input.records.map(row => [label(kindLabels, row.kind), row.id, row.name,
    row.source || '', sectionLines(row.guideSections), row.observedStatus, row.targetFile]);
  const sourceLine = input => 'Source : ' + input.sourceFile + ' — ' + input.asOf + '. État de conception distinct de la livraison jouable.';
  const inventoryLine = input => 'Inventaire au ' + input.asOf + ', référence ' + input.baselineCommit.slice(0, 8) + '. Les détails restent dans docs/combat-guide/associations.json.';
  const normalized = value => value === null || value === undefined ? '' : value;
  const equal = (left, right) => JSON.stringify(left.map(row => row.map(normalized))) === JSON.stringify(right.map(row => row.map(normalized)));
  const assertRange = (sheet, address, expected) => {
    const actual = sheet.getRange(address).values;
    if (!equal(actual, expected)) throw new Error('Existing workbook data differs from the recorded JSON baseline: ' + sheet.name + '!' + address + '. Review the edit before refresh.');
  };
  assertRange(guide, 'A8:K38', [guideHeaders, ...sectionRows(oldRequirements)]);
  assertRange(guide, 'A44:F' + (44 + oldRequirements.moduleDecisions.length), [moduleHeaders, ...moduleRows(oldRequirements)]);
  assertRange(asso, 'A8:G' + (8 + oldAssociations.records.length), [assoHeaders, ...associationRows(oldAssociations)]);
  assertRange(guide, 'A6', [[sourceLine(oldRequirements)]]);
  assertRange(asso, 'A6', [[inventoryLine(oldAssociations)]]);
  const oldEnd = 8 + oldAssociations.records.length, end = 8 + records.length;
  const oldCounters = [['B4', '=COUNTA(B9:B' + oldEnd + ')'],
    ...[['B5', 'Arène'], ['E4', 'Profil'], ['E5', 'Chronique'], ['H4', 'Corpus'], ['H5', 'Projectile']]
      .map(([cell, category]) => [cell, '=COUNTIFS(A9:A' + oldEnd + ',"' + category + '")'])];
  for (const [cell, formula] of oldCounters)
    if (asso.getRange(cell).formulas[0][0] !== formula) throw new Error('Existing summary formula differs from the baseline: Associations guide!' + cell);
  refreshPlan = { baselineRef, beforeAssociations: oldAssociations.records.length, afterAssociations: records.length, changedCells: [], changedRowHeights: [], newRows: [] };
  for (const [sheetName, range, suffix] of [
    ['Guide combat', 'A1:F11', 'guide-overview'], ['Guide combat', 'G8:K11', 'guide-details'],
    ['Guide combat', 'A19:F22', 'guide-narrative'], ['Guide combat', 'A42:F' + (44 + modules.length), 'guide-modules'],
    ['Associations guide', 'A1:G12', 'associations-overview'], ['Associations guide', 'A' + (oldEnd - 3) + ':G' + oldEnd, 'associations-end']
  ]) {
    const preview = await workbook.render({ sheetName, range, scale: 1, format: 'png' });
    await fs.writeFile(path.join(outputDir, 'before-' + suffix + '.png'), new Uint8Array(await preview.arrayBuffer()));
  }
  const updateCell = (sheet, address, value) => {
    const previous = sheet.getRange(address).values[0][0];
    if (normalized(previous) === normalized(value)) return;
    sheet.getRange(address).values = [[value]];
    refreshPlan.changedCells.push({ sheet: sheet.name, address, before: previous, after: value });
  };
  const rowHeight = (row, widths) => Math.max(42, Math.min(390, 10 + 14 * Math.max(...row.map((value, column) =>
    String(value ?? '').split('\n').reduce((total, line) => total + Math.max(1, Math.ceil(line.length / Math.max(7, widths[String.fromCharCode(65 + column)] - 4))), 0)))));
  const refreshRows = (sheet, startRow, oldRows, rows, tableName, widths) => {
    const lastColumn = String.fromCharCode(64 + rows[0].length);
    const tables = sheet.tables.items.filter(table => table.name === tableName);
    if (tables.length !== 1) throw new Error('Missing or duplicated existing table: ' + tableName);
    if (rows.length > oldRows.length) {
      tables[0].rows.add(null, rows.slice(oldRows.length));
      for (let index = oldRows.length; index < rows.length; index++) {
        const row = startRow + index, target = sheet.getRange('A' + row + ':' + lastColumn + row);
        // Copy an established row of the same parity. Its transparent or solid
        // fill keeps the existing native table stripe, without a white override.
        const templateIndex = oldRows.length - 1 - ((oldRows.length - 1 - index) & 1);
        if (templateIndex < 0) throw new Error('Two established rows are required to preserve native striping');
        const templateRow = startRow + templateIndex;
        target.copyFrom(sheet.getRange('A' + templateRow + ':' + lastColumn + templateRow), 'all');
        target.format.rowHeight = rowHeight(rows[index], widths);
        refreshPlan.newRows.push({ sheet: sheet.name, row });
      }
    }
    for (let index = 0; index < rows.length; index++) {
      const previous = oldRows[index] || Array(rows[index].length).fill(null);
      if (index < oldRows.length && equal([previous], [rows[index]])) continue;
      const number = startRow + index, target = sheet.getRange('A' + number + ':' + lastColumn + number);
      target.values = [rows[index]];
      for (let column = 0; column < rows[index].length; column++)
        if (normalized(previous[column]) !== normalized(rows[index][column]))
          refreshPlan.changedCells.push({ sheet: sheet.name, address: String.fromCharCode(65 + column) + number, before: previous[column], after: rows[index][column] });
      if (index < oldRows.length) {
        const existingHeight = sheet.getRange('A' + number).format.rowHeight;
        const neededHeight = rowHeight(rows[index], widths);
        if (!Number.isFinite(existingHeight)) throw new Error('Cannot verify existing row height: ' + sheet.name + '!' + number);
        if (neededHeight > existingHeight) {
          target.format.rowHeight = neededHeight;
          refreshPlan.changedRowHeights.push({ sheet: sheet.name, row: number, before: existingHeight, after: neededHeight });
        }
      }
    }
  };
  refreshRows(guide, 9, sectionRows(oldRequirements), sectionRows(requirements), 'CombatGuideSections', guideWidths);
  refreshRows(guide, 45, moduleRows(oldRequirements), moduleRows(requirements), 'CombatGuideModules', guideWidths);
  refreshRows(asso, 9, associationRows(oldAssociations), associationRows(associations), 'CombatGuideAssociations', assoWidths);
  updateCell(guide, 'A6', sourceLine(requirements));
  updateCell(asso, 'A6', inventoryLine(associations));
  asso.getRange('B4').formulas = [['=COUNTA(B9:B' + end + ')']];
  for (const [cell, category] of [['B5', 'Arène'], ['E4', 'Profil'], ['E5', 'Chronique'], ['H4', 'Corpus'], ['H5', 'Projectile']])
    asso.getRange(cell).formulas = [['=COUNTIFS(A9:A' + end + ',"' + category + '")']];
  expectedCounts = { sections: 30, modules: modules.length, associations: records.length,
    moduleDecisions: Object.fromEntries(Object.keys(decisionLabels).map(key => [key, modules.filter(row => row.decision === key).length])) };
  previewSpecs = [
    ['Guide combat', 'A1:F11', 'guide-overview'], ['Guide combat', 'G8:K11', 'guide-details'],
    ['Guide combat', 'A19:F22', 'guide-narrative'], ['Guide combat', 'G17:K19', 'guide-story-changes'],
    ['Guide combat', 'G23:K26', 'guide-production-changes'], ['Guide combat', 'A42:F' + (44 + modules.length), 'guide-modules'],
    ['Associations guide', 'A1:G12', 'associations-overview'], ['Associations guide', 'A' + (end - 5) + ':G' + end, 'associations-end']
  ];
  await fs.writeFile(path.join(outputDir, 'refresh-change-log.json'), JSON.stringify(refreshPlan, null, 2) + '\n');
} else if (mode !== 'inspect') throw new Error('Mode must be inspect, build or refresh');
workbook.recalculate();
if (mode === 'build' || mode === 'refresh') {
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
await fs.writeFile(path.join(outputDir, 'authoring-report.json'), JSON.stringify({ mode, basename, sourceHashes, expectedCounts, refreshPlan, previews: previewSpecs.map(row => row[2] + '.png'), sourceWorkbookSha256: createHash('sha256').update(await fs.readFile(input)).digest('hex'), limits: 'Artifact Tool authoring, recalculation and rendering. Native Excel desktop not executed.' }, null, 2) + '\n');
console.log(JSON.stringify({ mode, outputDir, expectedCounts }));
