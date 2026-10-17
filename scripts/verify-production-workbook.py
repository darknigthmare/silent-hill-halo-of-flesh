"""Read-only verification of the exported phase-one Excel file (stdlib only)."""
from pathlib import Path
from zipfile import ZipFile
import argparse
import hashlib
import gzip
import json
import posixpath
import xml.etree.ElementTree as ET

NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
REL = '{http://schemas.openxmlformats.org/package/2006/relationships}'
TABLES = {'Combattants': 'fighters', 'Mouvements': 'moves', 'Finishers': 'finishers',
          'Présentations': 'presentations', 'Clips': 'poses', 'Arènes': 'stages',
          'Animations arènes': 'stageAnimations', 'Actions': 'tasks',
          'Gestes référencés': 'observations', 'Sources': 'sources'}


def read_json(path):
    data = path.read_bytes()
    return json.loads(gzip.decompress(data) if path.suffix == '.gz' else data)


def verify(plan_path, workbook_path):
    plan_bytes = plan_path.read_bytes()
    plan = json.loads(plan_bytes)
    report = {'schema': 1, 'xlsxSha256': hashlib.sha256(workbook_path.read_bytes()).hexdigest(),
              'planSha256': hashlib.sha256(plan_bytes).hexdigest(), 'bytes': workbook_path.stat().st_size,
              'sheets': {}, 'errors': [], 'sourceUrls': 0, 'summaryFormulas': 0,
              'checks': ['ZIP CRC', 'worksheet scope', 'row IDs and totals', 'frozen panes',
                         'native tables and filters', 'validation lists', 'all cached error cells',
                         'summary formula caches', 'source URLs', 'numeric engine data',
                         'empty source timing fields', 'blocked production statuses']}
    with ZipFile(workbook_path) as z:
        assert z.testzip() is None, 'Invalid ZIP CRC'
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            for item in ET.fromstring(z.read('xl/sharedStrings.xml')):
                strings.append(''.join(item.itertext()))
        book = ET.fromstring(z.read('xl/workbook.xml'))
        relations = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        sheets = book.findall('s:sheets/s:sheet', NS)
        assert [s.get('name') for s in sheets] == ['Synthèse', *TABLES], 'Worksheet order/scope mismatch'

        def value(cell):
            if cell is None:
                return None
            raw = cell.findtext('s:v', default=None, namespaces=NS)
            if cell.get('t') == 's':
                return strings[int(raw)]
            if cell.get('t') == 'inlineStr':
                return ''.join(cell.find('s:is', NS).itertext())
            if raw is None:
                return None
            if cell.get('t') in ('str', 'e'):
                return raw
            try:
                return float(raw)
            except ValueError:
                return raw

        for sheet in sheets:
            name = sheet.get('name')
            target = relations[sheet.get('{'+NS['r']+'}id')]
            location = target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
            xml = ET.fromstring(z.read(location))
            cells = {c.get('r'): c for c in xml.findall('.//s:sheetData/s:row/s:c', NS)}
            errors = [(name, address, value(c)) for address, c in cells.items() if c.get('t') == 'e']
            report['errors'].extend(errors)
            assert not errors, f'Cached Excel errors: {errors[:3]}'
            if name == 'Synthèse':
                formulas = [c for c in cells.values() if c.find('s:f', NS) is not None]
                report['summaryFormulas'] = len(formulas)
                assert len(formulas) == 80, 'Summary formula coverage changed'
                assert all(isinstance(value(c), (float, int)) for c in formulas), 'Missing numeric formula caches'
                expected = [plan['metrics'][k] for k in ['fighters','stages','moves','supers',
                    'fighterFinishers','stageFinishers','presentations','poses','stageAnimations',
                    'observations','sources','pngCandidates','animatedClips','certifiedOneToOne']]
                expected.append(sum(t['status'] != 'Validé' for t in plan['tasks']))
                expected.append(sum(t['priority'] == 'P0' and t['status'] != 'Validé' for t in plan['tasks']))
                assert [value(cells.get(f'B{i}')) for i in range(6,22)] == expected, 'Summary totals differ'
                continue
            data = plan[TABLES[name]]
            assert [value(cells.get(f'A{i}')) for i in range(6,6+len(data))] == [r['id'] for r in data], name
            assert not any(a.startswith('A') and a[1:].isdigit() and int(a[1:]) > len(data)+5
                           and value(c) not in (None,'') for a,c in cells.items()), f'Extra rows: {name}'
            pane = xml.find('s:sheetViews/s:sheetView/s:pane', NS)
            assert pane is not None and pane.get('xSplit') == '3' and pane.get('ySplit') == '5', name
            table_parts = xml.findall('s:tableParts/s:tablePart', NS)
            assert len(table_parts) == 1, f'Missing native table: {name}'
            rel_path = posixpath.join(posixpath.dirname(location), '_rels', posixpath.basename(location)+'.rels')
            table_rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read(rel_path))}
            table_target = table_rels[table_parts[0].get('{'+NS['r']+'}id')]
            table_path = table_target.lstrip('/') if table_target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(location), table_target))
            table = ET.fromstring(z.read(table_path))
            assert table.find('s:autoFilter', NS) is not None, f'Missing filter: {name}'
            validations = xml.findall('s:dataValidations/s:dataValidation', NS)
            if name not in ('Sources','Gestes référencés'):
                assert len(validations) >= (2 if name == 'Actions' else 1), f'Missing validation: {name}'
            headers = {value(c): address[:-1] for address,c in cells.items() if address.endswith('5') and address[:-1].isalpha()}
            table_headers = [column.get('name') for column in table.findall('s:tableColumns/s:tableColumn', NS)]
            assert table_headers == list(headers), f'Native table headers differ from visible headers: {name}'
            status_key = 'status' if name == 'Actions' else 'productionStatus'
            status_column = headers.get('État' if name == 'Actions' else 'État de production')
            if status_column:
                assert [value(cells.get(f'{status_column}{i}')) for i in range(6,6+len(data))] == [r[status_key] for r in data], f'Status mismatch: {name}'
            if name == 'Mouvements':
                for header, field in [('Préparation (ticks)','startup'),('Actif (ticks)','active'),
                                      ('Récupération (ticks)','recovery'),('Dégâts moteur','damage'),('Portée moteur','reach')]:
                    assert [value(cells.get(f'{headers[header]}{i}')) for i in range(6,6+len(data))] == [r[field] for r in data], header
                for header in ['FPS source à relever','Début source à relever','Impact source à relever','Fin source à relever']:
                    assert all(value(cells.get(f'{headers[header]}{i}')) in (None,'') for i in range(6,6+len(data))), header
            if name == 'Sources':
                urls = [value(cells.get(f'{headers["Lien de référence"]}{i}')) for i in range(6,6+len(data))]
                assert urls == [s['url'] for s in plan['sources']], 'URL text mismatch'
                report['sourceUrls'] = len(urls)
            current_fields = {
                'Combattants': {'Décision de fidélité': 'identityNote'},
                'Mouvements': {'Nom actuel': 'currentName', 'Mention actuelle du dépôt': 'currentClaim',
                               'Validation du geste actuel': 'canonicalVerification', 'Cible / révision attendue': 'target'},
                'Présentations': {'Intégration à prévoir': 'engineState', 'Déclenchement prévu': 'trigger'},
                'Finishers': {'Pistes à produire': 'actorTracks', 'État technique actuel': 'existing',
                              'Séquence actuelle': 'currentSequence', 'Déclenchement prévu': 'trigger'},
                'Arènes': {'Décision de fidélité': 'locationNote', 'Météo actuelle': 'weather',
                          'Transformation moteur': 'shift'},
                'Animations arènes': {'État actuel': 'existing', 'Déclenchement / durée': 'trigger',
                                      'Travail attendu': 'description', 'Fidélité / nature': 'status'},
                'Actions': {'Constat': 'reason', 'Critère de livraison': 'acceptance'}
            }
            for header, field in current_fields.get(name, {}).items():
                assert [value(cells.get(f'{headers[header]}{i}')) for i in range(6,6+len(data))] == [r[field] for r in data], f'Integration mismatch: {name}:{field}'
            if name == 'Mouvements':
                assert [value(cells.get(f'{headers["Projectile actuel"]}{i}')) for i in range(6,6+len(data))] == ['Oui' if r['projectile'] else 'Non' for r in data], 'Projectile availability mismatch'
            report['sheets'][name] = {'dataRows': len(data), 'tableRef': table.get('ref'),
                                    'frozenRows': 5, 'frozenColumns': 3, 'validationLists': len(validations)}
    report['totalDataRows'] = sum(v['dataRows'] for v in report['sheets'].values())
    report['passed'] = True
    report['limits'] = 'Read-only OOXML verification; no claim of a native Excel desktop session or a full animation review.'
    return report


def compare_source(source_path, workbook_path, change_log_path, layout_change_log_path=None):
    """Compare all cells and native structures, allowing only the authored change log."""
    def canonical(element):
        if element is None:
            return None
        return (element.tag, tuple(sorted(element.attrib.items())), element.text or '',
                tuple(canonical(child) for child in element))

    def snapshot(file):
        result = {}
        with ZipFile(file) as z:
            strings = [''.join(item.itertext()) for item in ET.fromstring(z.read('xl/sharedStrings.xml'))] if 'xl/sharedStrings.xml' in z.namelist() else []
            book = ET.fromstring(z.read('xl/workbook.xml'))
            rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
            styles = ET.fromstring(z.read('xl/styles.xml'))
            xfs = list(styles.find('s:cellXfs', NS))
            fonts, fills, borders = [list(styles.find(f's:{name}', NS)) for name in ['fonts','fills','borders']]
            formats = {x.get('numFmtId'): x.get('formatCode') for x in styles.findall('s:numFmts/s:numFmt', NS)}

            def style(index):
                xf = xfs[int(index or 0)]
                refs = {'fontId','fillId','borderId','numFmtId'}
                return (tuple(sorted((k,v) for k,v in xf.attrib.items() if k not in refs)),
                        tuple(canonical(child) for child in xf),
                        canonical(fonts[int(xf.get('fontId','0'))]), canonical(fills[int(xf.get('fillId','0'))]),
                        canonical(borders[int(xf.get('borderId','0'))]), formats.get(xf.get('numFmtId'), xf.get('numFmtId')))

            for item in book.findall('s:sheets/s:sheet', NS):
                target = rels[item.get('{'+NS['r']+'}id')]
                location = target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
                xml = ET.fromstring(z.read(location))
                cells = {}
                for cell in xml.findall('s:sheetData/s:row/s:c', NS):
                    raw = cell.findtext('s:v', None, NS)
                    if cell.get('t') == 's':
                        value = strings[int(raw)]
                    elif cell.get('t') == 'inlineStr':
                        value = ''.join(cell.find('s:is', NS).itertext())
                    elif raw is None or cell.get('t') in ('str','e'):
                        value = raw
                    else:
                        value = float(raw)
                    cells[cell.get('r')] = {'value': value, 'formula': cell.findtext('s:f', None, NS), 'style': style(cell.get('s'))}
                features = {tag: tuple(canonical(x) for x in xml.findall('s:'+tag, NS))
                            for tag in ['cols','sheetFormatPr','mergeCells','dataValidations','conditionalFormatting','sheetProtection','autoFilter','drawing','legacyDrawing','hyperlinks','pageMargins','pageSetup','printOptions']}
                features['pane'] = canonical(xml.find('s:sheetViews/s:sheetView/s:pane', NS))
                features['rowHeights'] = [(row.get('r'),row.get('ht'),row.get('hidden'),row.get('outlineLevel')) for row in xml.findall('s:sheetData/s:row', NS)]
                table_parts = xml.findall('s:tableParts/s:tablePart', NS)
                tables = []
                if table_parts:
                    rel_path = posixpath.join(posixpath.dirname(location), '_rels', posixpath.basename(location)+'.rels')
                    table_rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read(rel_path))}
                    for part in table_parts:
                        target = table_rels[part.get('{'+NS['r']+'}id')]
                        table_path = target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(location),target))
                        tables.append(canonical(ET.fromstring(z.read(table_path))))
                features['tables'] = tuple(tables)
                result[item.get('name')] = {'cells': cells, 'features': features}
        return result

    before, after = snapshot(source_path), snapshot(workbook_path)
    assert list(before) == list(after), 'Narrow edit changed worksheet order'
    changes = read_json(change_log_path)
    allowed = {(change['sheet'],change['address']): change for change in changes}
    assert len(allowed) == len(changes), 'Repeated authored change address'
    layout_changes = read_json(layout_change_log_path) if layout_change_log_path else []
    allowed_heights = {(change['sheet'],str(change['row'])): change for change in layout_changes}
    assert len(allowed_heights) == len(layout_changes), 'Repeated row height change'
    touched_rows = {(change['sheet'], ''.join(c for c in change['address'] if c.isdigit())) for change in changes if isinstance(change['after'],str)}
    assert set(allowed_heights) <= touched_rows, 'Resized row contains no authored text change'
    verified_heights = set()
    def equivalent_value(value):
        return None if value == '' else value
    count = 0
    for name in before:
        old_features, new_features = before[name]['features'], after[name]['features']
        assert {k:v for k,v in old_features.items() if k != 'rowHeights'} == {k:v for k,v in new_features.items() if k != 'rowHeights'}, f'Native layout/features changed: {name}'
        old_rows, new_rows = old_features['rowHeights'], new_features['rowHeights']
        assert len(old_rows) == len(new_rows), f'Row layout scope changed: {name}'
        for old_row, new_row in zip(old_rows, new_rows):
            key = (name,old_row[0])
            change = allowed_heights.get(key)
            if change:
                assert old_row[0] == new_row[0] and old_row[2:] == new_row[2:], f'Other row properties changed: {key}'
                assert float(old_row[1]) == change['before'] and float(new_row[1]) == change['after'], f'Unmatched row height change: {key}'
                assert 0 < change['before'] < change['after'] <= 390, f'Unexpected resize: {key}'
                verified_heights.add(key)
            else:
                assert old_row == new_row, f'Unrelated row height changed: {key}'
        old_cells, new_cells = before[name]['cells'], after[name]['cells']
        assert set(old_cells) == set(new_cells), f'Cell scope changed: {name}'
        for address, old in old_cells.items():
            new = new_cells[address]
            assert old['formula'] == new['formula'], f'Formula changed: {name}!{address}'
            assert old['style'] == new['style'], f'Cell formatting changed: {name}!{address}'
            change = allowed.get((name,address))
            if change:
                assert equivalent_value(old['value']) == equivalent_value(change['before']) and equivalent_value(new['value']) == equivalent_value(change['after']), f'Unmatched authored change: {name}!{address}'
            elif not old['formula']:
                assert old['value'] == new['value'], f'Unrelated cell changed: {name}!{address}'
            count += 1
    assert verified_heights == set(allowed_heights), 'Unverified row height changes'
    return {'passed': True, 'comparedCells': count, 'authoredChanges': len(changes),
            'enlargedRows': len(verified_heights),
            'unchanged': ['worksheet order','unrelated values','all formulas','effective cell formatting','column widths','unrelated row heights','native tables and validation features']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plan', type=Path)
    parser.add_argument('workbook', type=Path)
    parser.add_argument('report', type=Path)
    parser.add_argument('--compare-source', type=Path)
    parser.add_argument('--change-log', type=Path)
    parser.add_argument('--layout-change-log', type=Path)
    args = parser.parse_args()
    result = verify(args.plan, args.workbook)
    if args.compare_source or args.change_log:
        if not (args.compare_source and args.change_log):
            parser.error('--compare-source and --change-log must be provided together')
        result['preservation'] = compare_source(args.compare_source, args.workbook, args.change_log, args.layout_change_log)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({k: result[k] for k in ['passed','bytes','totalDataRows','sourceUrls','summaryFormulas','errors']}, ensure_ascii=False))
