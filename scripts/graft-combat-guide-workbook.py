#!/usr/bin/env python3
"""Transfer reviewed Artifact Tool cells without reserializing historical parts.

This is a package-preservation adapter, not a spreadsheet authoring engine.
The donor is authored/recalculated/rendered by add-combat-guide-workbook.mjs.
Only logged source-cell updates, six counter formulas, appended association
rows, their table range and logged row heights may cross into the target.
Every existing style index and every other ZIP member remain byte-identical.
No openpyxl/xlsxwriter or other spreadsheet authoring library is used.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import posixpath
import re
import zipfile
from collections import Counter
from pathlib import Path
import xml.etree.ElementTree as ET

NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG = 'http://schemas.openxmlformats.org/package/2006/relationships'
ET.register_namespace('x', NS)
ET.register_namespace('r', REL)
GUIDES = ('Guide combat', 'Associations guide')
DECISIONS = {'retained': 'Retenu', 'deferred': 'Différé', 'decision-needed': 'À décider', 'not-applicable': 'Non applicable'}
STATUSES = {'documented': 'Documenté', 'documented-only': 'Conçu, à intégrer', 'partial': 'Partiel'}
KINDS = {'profile': 'Profil', 'stage': 'Arène', 'chronicle': 'Chronique', 'corpus': 'Corpus', 'projectile': 'Projectile'}
GUIDE_HEADERS = ['ID', 'Rubrique du guide', 'Priorité', 'Décision', 'État constaté', 'Adaptation Silent Hill', 'Existant observé', 'Prochaine action', 'Critères de validation', 'Fichiers associés', 'Catégories associées']
MODULE_HEADERS = ['ID', 'Module', 'Priorité', 'Décision', 'Rubriques', 'Motif']
ASSO_HEADERS = ['Catégorie', 'ID existant', 'Nom', 'Œuvre / source', 'Rubriques du guide', 'État observé', 'Fichier associé']


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def tag(local):
    return '{' + NS + '}' + local


def canon(element):
    if element is None:
        return None
    return (element.tag, tuple(sorted(element.attrib.items())), element.text or '', tuple(canon(child) for child in element))


def sha(data):
    return hashlib.sha256(data).hexdigest()


class Package:
    def __init__(self, path):
        self.path = Path(path)
        with zipfile.ZipFile(path) as archive:
            self.infos = archive.infolist()
            self.parts = {item.filename: archive.read(item) for item in self.infos}
            self.comment = archive.comment
        require(len(self.parts) == len(self.infos), 'Duplicate ZIP member')
        rels = {r.get('Id'): self.resolve('xl/workbook.xml', r.get('Target')) for r in self.xml('xl/_rels/workbook.xml.rels')}
        self.sheets = {s.get('name'): rels[s.get('{' + REL + '}id')] for s in self.xml('xl/workbook.xml').find(tag('sheets'))}
        self.strings = self.xml('xl/sharedStrings.xml') if 'xl/sharedStrings.xml' in self.parts else []
        self.styles = self.xml('xl/styles.xml')
        self.style_keys = [self.style_key(i) for i in range(len(self.styles.find(tag('cellXfs'))))]
        self.tables = {}
        for name in self.parts:
            if name.startswith('xl/tables/') and name.endswith('.xml'):
                tree = self.xml(name)
                require(tree.get('name') not in self.tables, 'Duplicate table name')
                self.tables[tree.get('name')] = name

    @staticmethod
    def resolve(base, target):
        return target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(base), target))

    def xml(self, name):
        return ET.fromstring(self.parts[name])

    def cells(self, sheet):
        return {c.get('r'): c for c in self.xml(self.sheets[sheet]).iter(tag('c'))}

    def value(self, cell):
        if cell is None:
            return ''
        if cell.get('t') == 'inlineStr':
            return ''.join(t.text or '' for t in cell.iter(tag('t')))
        value = cell.find(tag('v'))
        value = value.text if value is not None and value.text is not None else ''
        if cell.get('t') == 's':
            return ''.join(t.text or '' for t in self.strings[int(value)].iter(tag('t')))
        return value

    def xf_key(self, element, include_base):
        element = copy.deepcopy(element)
        for attr, collection in [('fontId', 'fonts'), ('fillId', 'fills'), ('borderId', 'borders')]:
            index = int(element.attrib.pop(attr, '0'))
            element.set(attr, repr(canon(self.styles.find(tag(collection))[index])))
        number = int(element.attrib.pop('numFmtId', '0'))
        formats = self.styles.find(tag('numFmts'))
        custom = {} if formats is None else {int(x.get('numFmtId')): x.get('formatCode') for x in formats}
        element.set('numberFormat', custom.get(number, 'builtin:' + str(number)))
        if include_base:
            base = int(element.attrib.pop('xfId', '0'))
            element.set('baseStyle', repr(self.xf_key(self.styles.find(tag('cellStyleXfs'))[base], False)))
        return canon(element)

    def style_key(self, index):
        return self.xf_key(self.styles.find(tag('cellXfs'))[index], True)


def expected_cells(requirements, associations):
    expected = {name: {} for name in GUIDES}
    def rows(sheet, start, values):
        for number, row in enumerate(values, start):
            for column, value in enumerate(row):
                expected[sheet][chr(65 + column) + str(number)] = str(value or '')
    rows('Guide combat', 8, [GUIDE_HEADERS] + [[s['id'], s['section'] + '. ' + s['title'], s['priority'], DECISIONS[s['decision']], STATUSES[s['implementationStatus']], s['adaptation'], s['observed'], s['nextAction'], '\n'.join(s['acceptance']), '\n'.join(s['evidencePaths']), ', '.join(s['entityKinds'])] for s in requirements['sections']])
    rows('Guide combat', 44, [MODULE_HEADERS] + [[s['id'], s['name'], s['priority'], DECISIONS[s['decision']], ', '.join(s['sections']), s['reason']] for s in requirements['moduleDecisions']])
    def section_lines(values):
        return '\n'.join(', '.join(values[i:i + 8]) for i in range(0, len(values), 8))
    rows('Associations guide', 8, [ASSO_HEADERS] + [[KINDS[s['kind']], s['id'], s['name'], s.get('source') or '', section_lines(s['guideSections']), s['observedStatus'], s['targetFile']] for s in associations['records']])
    expected['Guide combat']['A6'] = f"Source : {requirements['sourceFile']} — {requirements['asOf']}. État de conception distinct de la livraison jouable."
    expected['Associations guide']['A6'] = f"Inventaire au {associations['asOf']}, référence {associations['baselineCommit'][:8]}. Les détails restent dans docs/combat-guide/associations.json."
    return expected


def expected_formulas(requirements, associations):
    end = 8 + len(associations['records'])
    module_end = 44 + len(requirements['moduleDecisions'])
    counts = Counter(r['kind'] for r in associations['records'])
    decisions = Counter(r['decision'] for r in requirements['moduleDecisions'])
    guide = {
        'B4': ('COUNTA(A9:A38)', 30),
        'B5': (f'COUNTIFS(D45:D{module_end},"Différé")', decisions['deferred']),
        'E4': (f'COUNTA(A45:A{module_end})', len(requirements['moduleDecisions'])),
        'E5': (f'COUNTIFS(D45:D{module_end},"À décider")', decisions['decision-needed']),
        'H4': ('COUNTIFS(E9:E38,"Conçu, à intégrer")', sum(s['implementationStatus'] == 'documented-only' for s in requirements['sections'])),
        'H5': (f'COUNTIFS(D45:D{module_end},"Non applicable")', decisions['not-applicable']),
    }
    asso = {'B4': (f'COUNTA(B9:B{end})', len(associations['records']))}
    for address, kind in [('B5', 'stage'), ('E4', 'profile'), ('E5', 'chronicle'), ('H4', 'corpus'), ('H5', 'projectile')]:
        asso[address] = (f'COUNTIFS(A9:A{end},"{KINDS[kind]}")', counts[kind])
    return {'Guide combat': guide, 'Associations guide': asso}


def verify_sources(package, expected, formulas):
    for sheet in GUIDES:
        cells = package.cells(sheet)
        for address, value in expected[sheet].items():
            require(package.value(cells.get(address)) == value, f'Source mismatch {sheet}!{address}')
            require(cells[address].find(tag('f')) is None, f'Unexpected formula in source cell {sheet}!{address}')
        for address, (formula, cache) in formulas[sheet].items():
            cell = cells[address]
            require(cell.findtext(tag('f')) == formula, f'Counter formula mismatch {sheet}!{address}')
            require(float(package.value(cell)) == cache, f'Counter cached value mismatch {sheet}!{address}')
        require(sum(c.find(tag('f')) is not None for c in cells.values()) == 6, f'Unexpected formula count in {sheet}')
        require(not any(c.get('t') == 'e' for c in cells.values()), f'Excel error in {sheet}')


def transfer(before, donor, log, expected, formulas):
    require(list(before.sheets)[-2:] == list(GUIDES), 'Guide tabs must already exist at the end')
    require(all(s in donor.sheets for s in GUIDES), 'Donor is missing guides')
    verify_sources(donor, expected, formulas)
    logged = {(c['sheet'], c['address']): c for c in log['changedCells']}
    require(len(logged) == len(log['changedCells']), 'Duplicate source-cell authorization')
    actual = {}
    for sheet in GUIDES:
        cells = before.cells(sheet)
        for address, after in expected[sheet].items():
            old = before.value(cells.get(address))
            if old != after:
                actual[(sheet, address)] = (old, after)
    require(set(actual) == set(logged), 'Changed cells do not exactly match the reviewed change log')
    for key, (old, after) in actual.items():
        entry = logged[key]
        require(old == str(entry['before'] or '') and after == str(entry['after'] or ''), f'Change log values differ: {key}')
    old_end, end = 8 + log['beforeAssociations'], 8 + log['afterAssociations']
    require(end == 8 + len(expected['Associations guide']) // 7 - 1, 'Association count mismatch')
    require(log['afterAssociations'] >= log['beforeAssociations'], 'Association removal needs a separate review')
    require(log['newRows'] == [{'sheet': 'Associations guide', 'row': r} for r in range(old_end + 1, end + 1)], 'Unexpected appended rows')
    replacements = {}
    allowed_cells = {sheet: {address for s, address in logged if s == sheet} for sheet in GUIDES}
    allowed_cells['Associations guide'].update(formulas['Associations guide'])
    heights = {(r['sheet'], int(r['row'])): r for r in log['changedRowHeights']}
    require(len(heights) == len(log['changedRowHeights']), 'Duplicate row-height authorization')
    for sheet, number in heights:
        require(any(s == sheet and int(re.search(r'\d+$', a).group()) == number for s, a in logged), 'Height change has no edited source cell')

    style_map = {}
    for index, key in enumerate(donor.style_keys):
        if key in before.style_keys:
            style_map[index] = before.style_keys.index(key)

    def mapped_cell(source, previous=None):
        result = copy.deepcopy(source)
        index = int(result.get('s', '0'))
        require(index in style_map, f'Donor style {index} has no exact pre-existing target style')
        if previous is not None:
            old_index = int(previous.get('s', '0'))
            require(donor.style_keys[index] == before.style_keys[old_index], 'Existing cell style changed')
            result.attrib.pop('s', None)
            if 's' in previous.attrib:
                result.set('s', previous.get('s'))
        elif 's' in result.attrib:
            result.set('s', str(style_map[index]))
        if result.get('t') == 's':
            # Keep the target shared-string pool exact. Transfer donor text as
            # inline rich text rather than introducing an external index.
            value = result.find(tag('v'))
            string = copy.deepcopy(donor.strings[int(value.text)])
            string.tag = tag('is')
            result.remove(value)
            result.append(string)
            result.set('t', 'inlineStr')
        return result

    for sheet in GUIDES:
        tree = before.xml(before.sheets[sheet])
        source = donor.xml(donor.sheets[sheet])
        data = tree.find(tag('sheetData'))
        old_rows = {int(r.get('r')): r for r in data}
        donor_rows = {int(r.get('r')): r for r in source.find(tag('sheetData'))}
        donor_cells = donor.cells(sheet)
        old_cells = before.cells(sheet)
        for address in sorted(allowed_cells[sheet]):
            number = int(re.search(r'\d+$', address).group())
            if number > old_end and sheet == 'Associations guide':
                continue
            require(address in old_cells and address in donor_cells, 'Existing changed cell missing')
            row = old_rows[number]
            previous = next(c for c in row if c.get('r') == address)
            replacement = mapped_cell(donor_cells[address], previous)
            require({k: v for k, v in replacement.attrib.items() if k != 't'} == {k: v for k, v in previous.attrib.items() if k != 't'}, 'Unexpected cell metadata change')
            index = list(row).index(previous)
            row.remove(previous)
            row.insert(index, replacement)
        for (name, number), entry in heights.items():
            if name != sheet:
                continue
            row, source_row = old_rows[number], donor_rows[number]
            require(float(row.get('ht')) == entry['before'] and float(source_row.get('ht')) == entry['after'] > entry['before'], 'Unexpected row height')
            for attr in ('ht', 'customHeight'):
                if attr in source_row.attrib:
                    row.set(attr, source_row.get(attr))
        if sheet == 'Associations guide':
            require(max(old_rows) == old_end and max(donor_rows) == end, 'Unexpected association tail')
            for number in range(old_end + 1, end + 1):
                row = copy.deepcopy(donor_rows[number])
                require(set(c.get('r') for c in row) == {chr(65 + c) + str(number) for c in range(7)}, 'New row must have exactly seven cells')
                for index, cell in enumerate(list(row)):
                    row.remove(cell)
                    row.insert(index, mapped_cell(cell))
                data.append(row)
            old_dimension, new_dimension = tree.find(tag('dimension')), source.find(tag('dimension'))
            if old_dimension is not None:
                require(new_dimension is not None, 'Donor omitted existing dimension')
                old_dimension.set('ref', new_dimension.get('ref'))
        replacements[before.sheets[sheet]] = ET.tostring(tree, encoding='utf-8', xml_declaration=True)

    name = 'CombatGuideAssociations'
    old_table = before.xml(before.tables[name])
    new_table = donor.xml(donor.tables[name])
    require(old_table.get('ref') == f'A8:G{old_end}' and new_table.get('ref') == f'A8:G{end}', 'Unexpected association table range')
    candidate = copy.deepcopy(old_table)
    candidate.set('ref', new_table.get('ref'))
    candidate.find(tag('autoFilter')).set('ref', new_table.find(tag('autoFilter')).get('ref'))
    new_table.set('id', old_table.get('id'))
    require(canon(candidate) == canon(new_table), 'Donor changed more than the association table range')
    replacements[before.tables[name]] = ET.tostring(candidate, encoding='utf-8', xml_declaration=True)
    return replacements, allowed_cells, heights


def verify_preservation(before, after, changed_parts, allowed_cells, heights, log):
    require(list(before.parts) == list(after.parts), 'ZIP member inventory changed')
    require(before.comment == after.comment, 'ZIP archive comment changed')
    for name in before.parts:
        if name not in changed_parts:
            require(before.parts[name] == after.parts[name], 'Unrelated package bytes changed: ' + name)
    require(before.sheets == after.sheets, 'Sheet names, IDs or order changed')
    historical = []
    for sheet, name in before.sheets.items():
        if sheet not in GUIDES:
            tree = before.xml(name)
            historical.append({'sheet': sheet, 'part': name, 'sha256': sha(before.parts[name]), 'cells': sum(1 for _ in tree.iter(tag('c'))), 'formulas': sum(1 for _ in tree.iter(tag('f'))), 'conditionalFormats': sum(1 for _ in tree.iter(tag('conditionalFormatting'))), 'validations': sum(1 for _ in tree.iter(tag('dataValidation')))})
            continue
        old, new = before.xml(name), after.xml(name)
        old_data, new_data = old.find(tag('sheetData')), new.find(tag('sheetData'))
        old_rows = {int(r.get('r')): r for r in old_data}
        new_rows = {int(r.get('r')): r for r in new_data}
        for number, row in old_rows.items():
            new_row = new_rows[number]
            old_attributes, new_attributes = dict(row.attrib), dict(new_row.attrib)
            if (sheet, number) in heights:
                for attr in ('ht', 'customHeight'):
                    old_attributes.pop(attr, None)
                    new_attributes.pop(attr, None)
            require(old_attributes == new_attributes, f'Unapproved row metadata change {sheet}!{number}')
            require([c.get('r') for c in row] == [c.get('r') for c in new_row], f'Existing cell inventory changed {sheet}!{number}')
            for previous, current in zip(row, new_row):
                if previous.get('r') not in allowed_cells[sheet]:
                    require(canon(previous) == canon(current), f'Unapproved cell change {sheet}!{previous.get("r")}')
                require(previous.get('s') == current.get('s'), f'Existing style index changed {sheet}!{previous.get("r")}')
        expected_new_rows = {r['row'] for r in log['newRows'] if r['sheet'] == sheet}
        require(set(new_rows) - set(old_rows) == expected_new_rows, 'Unapproved row addition')
        old.remove(old_data)
        new.remove(new_data)
        for tree in (old, new):
            dimension = tree.find(tag('dimension'))
            if dimension is not None:
                tree.remove(dimension)
        require(canon(old) == canon(new), f'Unapproved sheet feature change: {sheet}')
    return historical


def write_qa_projection(package, destination):
    """Extract exact parts for read-only rendering when the full import exceeds RAM.

    The projection is temporary and must never replace a delivered workbook.
    Keep the first historical sheet and both guide sheets. No cell, formula,
    style or native table payload is authored or changed by this extraction.
    """
    names = [next(s for s in package.sheets if s not in GUIDES), *GUIDES]
    workbook = package.xml('xl/workbook.xml')
    sheets = workbook.find(tag('sheets'))
    keep_ids = set()
    for sheet in list(sheets):
        if sheet.get('name') in names:
            keep_ids.add(sheet.get('{' + REL + '}id'))
        else:
            sheets.remove(sheet)
    relationships = package.xml('xl/_rels/workbook.xml.rels')
    omitted = set()
    for relation in list(relationships):
        if relation.get('Type').endswith('/worksheet') and relation.get('Id') not in keep_ids:
            part = package.resolve('xl/workbook.xml', relation.get('Target'))
            omitted.add(part)
            relpart = posixpath.join(posixpath.dirname(part), '_rels', posixpath.basename(part) + '.rels')
            if relpart in package.parts:
                omitted.add(relpart)
                for table_relation in package.xml(relpart):
                    require(table_relation.get('Type').endswith('/table'), 'QA projection requires review for non-table sheet relationships')
                    omitted.add(package.resolve(part, table_relation.get('Target')))
            relationships.remove(relation)
    content_types = package.xml('[Content_Types].xml')
    for entry in list(content_types):
        if entry.get('PartName', '').lstrip('/') in omitted:
            content_types.remove(entry)
    require(workbook.find(tag('definedNames')) is None, 'QA projection requires review for workbook defined names')
    metadata = {'xl/workbook.xml': ET.tostring(workbook, encoding='utf-8', xml_declaration=True)}
    # The package reader expects the default namespace on these two OPC roots.
    ET.register_namespace('', PKG)
    metadata['xl/_rels/workbook.xml.rels'] = ET.tostring(relationships, encoding='utf-8', xml_declaration=True)
    ET.register_namespace('', 'http://schemas.openxmlformats.org/package/2006/content-types')
    metadata['[Content_Types].xml'] = ET.tostring(content_types, encoding='utf-8', xml_declaration=True)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, 'w') as archive:
        for info in package.infos:
            if info.filename not in omitted:
                archive.writestr(info, metadata.get(info.filename, package.parts[info.filename]))
    with zipfile.ZipFile(destination) as archive:
        retained = [name for name in archive.namelist() if name not in metadata]
        require(all(archive.read(name) == package.parts[name] for name in retained), 'QA projection changed a retained payload')
    return {
        'purpose': 'Temporary read-only Artifact Tool rendering projection; never a delivered workbook.',
        'sourceSha256': sha(package.path.read_bytes()), 'retainedSheets': names,
        'byteIdenticalPayloads': {name: sha(package.parts[name]) for name in retained},
        'metadataProjectionOnly': sorted(metadata), 'omittedParts': sorted(omitted),
        'scope': 'Render the two complete guide sheets and A1:F8 of the first historical sheet. Preservation of all other historical sheets is established by exact ZIP-payload comparison, not by this projection.',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for option in ('before', 'donor', 'changes', 'requirements', 'associations', 'output', 'report'):
        parser.add_argument('--' + option, required=True, type=Path)
    parser.add_argument('--qa-projection', type=Path, help='Optional temporary read-only rendering subset; never a deliverable')
    args = parser.parse_args()
    require(args.before.resolve() != args.output.resolve(), 'Write a validated candidate; never overwrite the original in this adapter')
    before, donor = Package(args.before), Package(args.donor)
    log = json.loads(args.changes.read_text())
    requirements, associations = json.loads(args.requirements.read_text()), json.loads(args.associations.read_text())
    require(len(requirements['sections']) == 30 and [s['section'] for s in requirements['sections']] == [f'{i:02d}' for i in range(30)], 'Expected sections 00–29')
    require(len({(r['kind'], r['id']) for r in associations['records']}) == len(associations['records']), 'Duplicate association')
    expected, formulas = expected_cells(requirements, associations), expected_formulas(requirements, associations)
    replacements, allowed_cells, heights = transfer(before, donor, log, expected, formulas)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.output, 'w') as archive:
        archive.comment = before.comment
        for info in before.infos:
            archive.writestr(info, replacements.get(info.filename, before.parts[info.filename]))
    after = Package(args.output)
    historical = verify_preservation(before, after, set(replacements), allowed_cells, heights, log)
    verify_sources(after, expected, formulas)
    report = {
        'method': 'Artifact Tool authors, recalculates and renders the donor. This stdlib-only adapter transfers its reviewed cells while preserving every unrelated ZIP payload byte.',
        'beforeSha256': sha(args.before.read_bytes()), 'donorSha256': sha(args.donor.read_bytes()), 'afterSha256': sha(args.output.read_bytes()),
        'inputHashes': {'requirements': sha(args.requirements.read_bytes()), 'associations': sha(args.associations.read_bytes()), 'changeLog': sha(args.changes.read_bytes())},
        'sheetNames': list(after.sheets), 'sections': 30, 'modules': len(requirements['moduleDecisions']), 'associations': len(associations['records']),
        'changedParts': sorted(replacements), 'byteIdenticalParts': len(before.parts) - len(replacements),
        'historicalSheets': historical, 'sourceCellsChangedOrAdded': len(log['changedCells']), 'associationCounterFormulasUpdated': 6,
        'rowHeightsIncreased': log['changedRowHeights'], 'appendedRows': log['newRows'],
        'preservedByteExactly': ['all historical worksheets', 'all historical tables', 'styles', 'shared strings', 'workbook metadata', 'all relationships', 'Guide combat tables', 'content types', 'theme', 'other ZIP parts'],
        'preservedGuideFeatures': ['all unchanged cells', 'all existing style indices', 'column widths', 'frozen panes', 'validations', 'conditional formats', 'existing comments and hyperlinks', 'native table identities'],
        'formulaValues': {sheet: {cell: value for cell, (_, value) in entries.items()} for sheet, entries in formulas.items()},
        'status': 'passed',
    }
    if args.qa_projection:
        require(args.qa_projection.resolve() not in (args.before.resolve(), args.output.resolve(), args.donor.resolve()), 'QA projection must have its own temporary path')
        report['renderProjection'] = write_qa_projection(after, args.qa_projection)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'output': str(args.output), 'sha256': report['afterSha256'], 'historicalSheets': len(historical), 'historicalCells': sum(s['cells'] for s in historical), 'changedParts': report['changedParts'], 'sourceCellsChangedOrAdded': report['sourceCellsChangedOrAdded'], 'status': 'passed'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
