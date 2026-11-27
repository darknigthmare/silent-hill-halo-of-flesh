"""Read-only OOXML checks for the two additive combat-guide worksheets."""
from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZipFile

MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
OFFICE_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PACKAGE_REL = 'http://schemas.openxmlformats.org/package/2006/relationships'
NS = {'s': MAIN}
ADDED_SHEETS = ('Guide combat', 'Associations guide')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(element):
    return (element.tag, tuple(sorted(element.attrib.items())), element.text or '',
            tuple(canonical(child) for child in element))


def relationship_path(part):
    directory, name = posixpath.split(part)
    return posixpath.join(directory, '_rels', name + '.rels')


def relationships(archive, part):
    location = relationship_path(part)
    if location not in archive.namelist():
        return {}
    result = {}
    for item in ET.fromstring(archive.read(location)):
        target = item.get('Target')
        if item.get('TargetMode') != 'External':
            target = target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(part), target))
        result[item.get('Id')] = (item.get('Type'), target, item.get('TargetMode'))
    return result


def normal_xml(archive, part):
    root = ET.fromstring(archive.read(part))
    rels = relationships(archive, part)
    for element in root.iter():
        for key, value in tuple(element.attrib.items()):
            if key.startswith('{' + OFFICE_REL + '}'):
                if value not in rels:
                    raise AssertionError(f'Unresolved relationship: {part} {value}')
                element.set(key, json.dumps(rels[value], ensure_ascii=False))
    return canonical(root)


def sheets(archive):
    rels = relationships(archive, 'xl/workbook.xml')
    root = ET.fromstring(archive.read('xl/workbook.xml'))
    return {sheet.get('name'): rels[sheet.get('{' + OFFICE_REL + '}id')][1]
            for sheet in root.find('s:sheets', NS)}


def values(archive, part):
    strings = []
    if 'xl/sharedStrings.xml' in archive.namelist():
        strings = [''.join(item.itertext()) for item in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
    result = {}
    root = ET.fromstring(archive.read(part))
    for cell in root.findall('.//s:sheetData/s:row/s:c', NS):
        address = cell.get('r')
        if address in result:
            raise AssertionError(f'Duplicate cell: {part}!{address}')
        if cell.get('t') == 'inlineStr':
            value = ''.join(cell.find('s:is', NS).itertext())
        else:
            value = cell.findtext('s:v', None, NS)
            if cell.get('t') == 's':
                value = strings[int(value)]
            elif value is not None and cell.get('t') not in ('str', 'e'):
                value = float(value)
        if cell.get('t') == 'e':
            raise AssertionError(f'Cached formula error: {part}!{address}: {value}')
        result[address] = {'value': value, 'formula': cell.findtext('s:f', None, NS)}
    return root, result


def verify(source, output):
    with ZipFile(source) as before, ZipFile(output) as after:
        assert before.testzip() is None and after.testzip() is None, 'ZIP CRC'
        assert len(after.namelist()) == len(set(after.namelist())), 'Duplicate ZIP part'
        old_sheets, new_sheets = sheets(before), sheets(after)
        assert list(new_sheets) == [*old_sheets, *ADDED_SHEETS], 'Only the two guide sheets may be appended'
        old_book, new_book = ET.fromstring(before.read('xl/workbook.xml')), ET.fromstring(after.read('xl/workbook.xml'))
        old_book.remove(old_book.find('s:sheets', NS))
        new_book.remove(new_book.find('s:sheets', NS))
        assert canonical(old_book) == canonical(new_book), 'Historical workbook metadata changed'
        preserved = []
        for name, part in old_sheets.items():
            assert normal_xml(before, part) == normal_xml(after, new_sheets[name]), f'Historical worksheet changed: {name}'
            assert sorted(relationships(before, part).values()) == sorted(relationships(after, new_sheets[name]).values()), f'Historical sheet links changed: {name}'
            root, cells = values(before, part)
            preserved.append({'sheet': name, 'cells': len(cells),
                              'formulas': sum(c['formula'] is not None for c in cells.values()),
                              'conditionalFormattingBlocks': len(root.findall('s:conditionalFormatting', NS)),
                              'validationLists': len(root.findall('s:dataValidations/s:dataValidation', NS))})
        # New formats and shared strings may append entries. Existing indices,
        # definitions and meaning must stay intact for all historical sheets.
        for part in ['xl/styles.xml', 'xl/sharedStrings.xml']:
            left, right = ET.fromstring(before.read(part)), ET.fromstring(after.read(part))
            if part.endswith('styles.xml'):
                for component in left:
                    match = right.find(component.tag)
                    assert match is not None, f'Removed style component {component.tag}'
                    assert list(map(canonical, component)) == list(map(canonical, match))[:len(component)], f'Historical style changed: {component.tag}'
                    assert {k: v for k, v in component.attrib.items() if k != 'count'} == {k: v for k, v in match.attrib.items() if k != 'count'}, f'Style attributes changed: {component.tag}'
            else:
                assert list(map(canonical, left)) == list(map(canonical, right))[:len(left)], 'Historical shared strings changed'
        preserved_parts = []
        excluded = {'xl/workbook.xml', 'xl/styles.xml', 'xl/sharedStrings.xml', 'xl/_rels/workbook.xml.rels', '[Content_Types].xml', '_rels/.rels'}
        for part in before.namelist():
            if part in excluded or part.startswith('xl/worksheets/'):
                continue
            assert part in after.namelist() and before.read(part) == after.read(part), f'Historical package part changed: {part}'
            preserved_parts.append(part)
        guides = []
        for name in ADDED_SHEETS:
            root, cells = values(after, new_sheets[name])
            pane = root.find('s:sheetViews/s:sheetView/s:pane', NS)
            assert pane is not None and pane.get('ySplit') == '8', f'Guide headers not frozen: {name}'
            table_parts = root.findall('s:tableParts/s:tablePart', NS)
            assert len(table_parts) == (2 if name == 'Guide combat' else 1), f'Missing guide table: {name}'
            rels = relationships(after, new_sheets[name])
            table_path = rels[table_parts[0].get('{' + OFFICE_REL + '}id')][1]
            table = ET.fromstring(after.read(table_path))
            assert table.find('s:autoFilter', NS) is not None, f'Guide filter missing: {name}'
            guides.append({'sheet': name, 'tableRef': table.get('ref'), 'cells': len(cells),
                           'formulas': sum(c['formula'] is not None for c in cells.values())})
        return {'passed': True, 'sourceSha256': digest(Path(source).read_bytes()),
                'outputSha256': digest(Path(output).read_bytes()), 'preservedSheets': preserved,
                'preservedWorkbookMetadata': True, 'preservedHistoricalRelationships': True,
                'preservedPackageParts': preserved_parts, 'addedSheets': guides,
                'limits': 'OOXML verification and Artifact Tool renders. Native Excel desktop not executed.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    report = verify(args.source, args.output)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))
