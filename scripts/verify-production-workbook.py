"""Read-only verification of the exported phase-one Excel file (stdlib only)."""
from pathlib import Path
from zipfile import ZipFile
import argparse
import hashlib
import gzip
import json
import posixpath
import xml.etree.ElementTree as ET
import re
from functools import lru_cache

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


def column_name(number):
    result = ''
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result


def worksheet_cells(xml, name):
    """Index only explicit, unique Excel coordinates in their declared row."""
    cells, rows = {}, set()
    for row in xml.findall('s:sheetData/s:row', NS):
        row_id = row.get('r')
        assert isinstance(row_id, str) and re.fullmatch(r'[1-9][0-9]*', row_id) and int(row_id) <= 1048576, f'Invalid row address: {name}'
        assert row_id not in rows, f'Duplicate row address: {name}!{row_id}'
        rows.add(row_id)
        for cell in row.findall('s:c', NS):
            address = cell.get('r')
            match = re.fullmatch(r'([A-Z]{1,3})([1-9][0-9]*)', address or '')
            assert match and match[2] == row_id, f'Cell address does not match row: {name}!{address}'
            column = 0
            for letter in match[1]:
                column = column * 26 + ord(letter) - ord('A') + 1
            assert column <= 16384, f'Cell column outside Excel bounds: {name}!{address}'
            assert address not in cells, f'Duplicate cell address: {name}!{address}'
            # ElementTree.find reads only the first child; never let a second
            # value, inline string or formula hide from value/preservation checks.
            payload = [child.tag.rsplit('}', 1)[-1] for child in cell
                       if child.tag in {'{' + NS['s'] + '}' + tag for tag in ('f', 'v', 'is')}]
            assert payload in ([], ['v'], ['f'], ['f', 'v'], ['is']), f'Ambiguous cell payload: {name}!{address}'
            assert (payload == ['is']) if cell.get('t') == 'inlineStr' else ('is' not in payload), f'Invalid inline cell payload: {name}!{address}'
            cells[address] = cell
    return cells


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
            cells = worksheet_cells(xml, name)
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
            expected_ref = f'A5:{column_name(len(table_headers))}{len(data) + 5}'
            assert table.get('ref') == expected_ref and table.find('s:autoFilter', NS).get('ref') == expected_ref, f'Native table/filter range mismatch: {name}'
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


def compare_source(source_path, workbook_path, change_log_path, layout_change_log_path=None, structure_change_log_path=None):
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

            @lru_cache(maxsize=None)
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
                for address, cell in worksheet_cells(xml, item.get('name')).items():
                    raw = cell.findtext('s:v', None, NS)
                    if cell.get('t') == 's':
                        value = strings[int(raw)]
                    elif cell.get('t') == 'inlineStr':
                        value = ''.join(cell.find('s:is', NS).itertext())
                    elif raw is None or cell.get('t') in ('str','e'):
                        value = raw
                    else:
                        value = float(raw)
                    formula_node = cell.find('s:f', NS)
                    native = (tuple(sorted((key,item) for key,item in cell.attrib.items() if key not in ('r','s','t'))),
                              tuple(canonical(child) for child in cell if child.tag not in ('{'+NS['s']+'}v','{'+NS['s']+'}is','{'+NS['s']+'}f')),
                              (tuple(sorted(formula_node.attrib.items())),tuple(canonical(child) for child in formula_node)) if formula_node is not None else None)
                    cells[address] = {'value': value, 'formula': cell.findtext('s:f', None, NS), 'style': style(cell.get('s')), 'native': native}
                features = {tag: tuple(canonical(x) for x in xml.findall('s:'+tag, NS))
                            for tag in ['cols','sheetFormatPr','mergeCells','dataValidations','conditionalFormatting','sheetProtection','autoFilter','drawing','legacyDrawing','hyperlinks','pageMargins','pageSetup','printOptions']}
                features['pane'] = canonical(xml.find('s:sheetViews/s:sheetView/s:pane', NS))
                features['dimension'] = canonical(xml.find('s:dimension', NS))
                features['sheetStructure'] = (tuple(sorted(xml.attrib.items())), tuple(canonical(child) for child in xml if child.tag not in ('{'+NS['s']+'}sheetData','{'+NS['s']+'}dimension')))
                features['rowHeights'] = [(row.get('r'),row.get('ht'),tuple(sorted((key,value) for key,value in row.attrib.items() if key not in ('r','ht')))) for row in xml.findall('s:sheetData/s:row', NS)]
                table_parts = xml.findall('s:tableParts/s:tablePart', NS)
                tables, table_paths = [], []
                if table_parts:
                    rel_path = posixpath.join(posixpath.dirname(location), '_rels', posixpath.basename(location)+'.rels')
                    table_rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read(rel_path))}
                    for part in table_parts:
                        target = table_rels[part.get('{'+NS['r']+'}id')]
                        table_path = target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(location),target))
                        tables.append(canonical(ET.fromstring(z.read(table_path))))
                        table_paths.append(table_path)
                features['tables'] = tuple(tables)
                result[item.get('name')] = {'cells': cells, 'features': features, 'path': location, 'tablePaths': table_paths}
        return result

    before, after = snapshot(source_path), snapshot(workbook_path)
    assert list(before) == list(after), 'Narrow edit changed worksheet order'
    changes = read_json(change_log_path)
    allowed = {(change['sheet'],change['address']): change for change in changes}
    assert len(allowed) == len(changes), 'Repeated authored change address'
    layout_changes = read_json(layout_change_log_path) if layout_change_log_path else []
    allowed_heights = {(change['sheet'],str(change['row'])): change for change in layout_changes}
    assert len(allowed_heights) == len(layout_changes), 'Repeated row height change'
    structures = read_json(structure_change_log_path) if structure_change_log_path else []
    assert len(structures) <= 1, 'Only one Sources append may be authorized'
    append = structures[0] if structures else None
    appended_addresses, formula_change = set(), None
    if append:
        assert append.get('kind') == 'append-sources' and append.get('sheet') == 'Sources', 'Only Sources append is allowed'
        old_count, new_count = append['oldRows'], append['newRows']
        assert type(old_count) is int and type(new_count) is int and 0 < old_count < new_count, 'Invalid source append size'
        old_end, new_end = old_count + 5, new_count + 5
        assert append['oldRange'] == f'A5:G{old_end}' and append['newRange'] == f'A5:G{new_end}', 'Invalid source append range'
        assert append['templateRow'] == old_end and append['appendedRows'] == list(range(old_end + 1, new_end + 1)), 'Only trailing source rows may be appended'
        assert append['columns'] == list('ABCDEFG'), 'Only seven source columns may be appended'
        assert len(append['appendedIds']) == new_count - old_count and len(set(append['appendedIds'])) == new_count - old_count, 'Invalid appended source IDs'
        assert all(isinstance(value,str) and value for value in append['appendedIds']), 'Empty appended source ID'
        assert before['Sources']['tablePaths'] == after['Sources']['tablePaths'] == [append['tablePath']], 'Sources table relationship changed'
        assert [row[0] for row in before['Sources']['features']['rowHeights']][-1] == str(old_end), 'Source append does not follow the last existing row'
        formula_change = {'sheet':'Synthèse','address':'B16',
            'before':f"COUNTA('Sources'!$A$6:$A${old_end})",'after':f"COUNTA('Sources'!$A$6:$A${new_end})"}
        assert append['formula'] == formula_change, 'Only the exact Sources count formula may expand'
        appended_addresses = {column+str(row) for row in append['appendedRows'] for column in append['columns']}
        old_ids = {cell['value'] for address,cell in before['Sources']['cells'].items() if re.fullmatch(r'A[0-9]+',address) and int(address[1:]) >= 6}
        assert not old_ids.intersection(append['appendedIds']), 'Source ID already exists'

    def expanded_table(node):
        tag, attrs, text, children = node
        attributes = dict(attrs)
        if tag in ('{'+NS['s']+'}table','{'+NS['s']+'}autoFilter'):
            assert attributes.get('ref') == append['oldRange'], 'Unexpected source table/filter range'
            attributes['ref'] = append['newRange']
        return tag, tuple(sorted(attributes.items())), text, tuple(expanded_table(child) for child in children)

    with ZipFile(source_path) as old_zip, ZipFile(workbook_path) as new_zip:
        assert old_zip.namelist() == new_zip.namelist() and old_zip.comment == new_zip.comment, 'Workbook ZIP scope/order/comment changed'
        mutable = {before[name]['path'] for name,_ in allowed} | ({before['Sources']['path'],before['Synthèse']['path'],append['tablePath']} if append else set())
        for name in old_zip.namelist():
            if name in mutable or name == 'xl/sharedStrings.xml':
                continue
            assert old_zip.read(name) == new_zip.read(name), f'Unrelated ZIP member changed: {name}'
        if 'xl/sharedStrings.xml' in old_zip.namelist() and old_zip.read('xl/sharedStrings.xml') != new_zip.read('xl/sharedStrings.xml'):
            old_shared, new_shared = [ET.fromstring(archive.read('xl/sharedStrings.xml')) for archive in (old_zip,new_zip)]
            assert len(new_shared) >= len(old_shared) and tuple(map(canonical,list(old_shared))) == tuple(map(canonical,list(new_shared)[:len(old_shared)])), 'Existing shared strings changed'
            old_attrs, new_attrs = dict(old_shared.attrib), dict(new_shared.attrib)
            if 'uniqueCount' in old_attrs:
                old_attrs['uniqueCount'] = str(len(new_shared))
            assert old_attrs == new_attrs, 'Shared-string properties changed'
    touched_rows = {(change['sheet'], ''.join(c for c in change['address'] if c.isdigit())) for change in changes if isinstance(change['after'],str)}
    assert set(allowed_heights) <= touched_rows, 'Resized row contains no authored text change'
    verified_heights = set()
    verified_changes = set()
    def equivalent_value(value):
        return None if value == '' else value
    count = 0
    for name in before:
        old_features, new_features = before[name]['features'], after[name]['features']
        ignored = {'rowHeights'} | ({'tables','dimension'} if append and name == 'Sources' else set())
        assert {k:v for k,v in old_features.items() if k not in ignored} == {k:v for k,v in new_features.items() if k not in ignored}, f'Native layout/features changed: {name}'
        if append and name == 'Sources':
            assert len(old_features['tables']) == len(new_features['tables']) == 1, 'Sources table count changed'
            assert dict(old_features['tables'][0][1]).get('name') == 'Plansources', 'Unexpected source table name'
            assert expanded_table(old_features['tables'][0]) == new_features['tables'][0], 'Unrelated source table definition changed'
            for label,dimension in [('oldDimension',old_features['dimension']),('newDimension',new_features['dimension'])]:
                assert (dict(dimension[1]).get('ref') if dimension else None) == append[label], 'Unmatched source dimension'
            if old_features['dimension'] is None:
                assert new_features['dimension'] is None, 'Unexpected source dimension created'
            else:
                old_dimension = append['oldDimension']
                assert re.fullmatch(r'A[1-5]:G'+str(old_end),old_dimension), 'Unexpected old source dimension'
                assert append['newDimension'] == old_dimension[:-len(str(old_end))]+str(new_end), 'Unexpected new source dimension'
                tag,attrs,text,children = old_features['dimension']
                props=dict(attrs);props['ref']=append['newDimension']
                assert (tag,tuple(sorted(props.items())),text,children)==new_features['dimension'], 'Other dimension properties changed'
        old_rows, new_rows = old_features['rowHeights'], new_features['rowHeights']
        extra_rows = new_rows[len(old_rows):]
        assert len(old_rows) == len(new_rows) or append and name == 'Sources' and [row[0] for row in extra_rows] == list(map(str,append['appendedRows'])), f'Row layout scope changed: {name}'
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
        if extra_rows:
            template = old_rows[-1]
            for row in extra_rows:
                key=(name,row[0]);change=allowed_heights.get(key)
                assert row[2:] == template[2:], 'Appended row properties differ from source template'
                if change:
                    assert float(template[1]) == change['before'] and float(row[1]) == change['after'] and 0 < change['before'] < change['after'] <= 390, 'Invalid appended row height'
                    verified_heights.add(key)
                else:
                    assert row[1] == template[1], 'Unlogged appended row height'
        old_cells, new_cells = before[name]['cells'], after[name]['cells']
        extra_cells=set(new_cells)-set(old_cells)
        assert set(old_cells) <= set(new_cells) and (extra_cells == appended_addresses if append and name == 'Sources' else not extra_cells), f'Cell scope changed: {name}'
        for address, old in old_cells.items():
            new = new_cells[address]
            if append and name == 'Synthèse' and address == 'B16':
                assert old['formula'] == formula_change['before'] and new['formula'] == formula_change['after'], 'Sources count formula differs from audited expansion'
            else:
                assert old['formula'] == new['formula'], f'Formula changed: {name}!{address}'
            assert old['style'] == new['style'], f'Cell formatting changed: {name}!{address}'
            assert old['native'] == new['native'], f'Native cell metadata changed: {name}!{address}'
            change = allowed.get((name,address))
            if change:
                assert equivalent_value(old['value']) == equivalent_value(change['before']) and equivalent_value(new['value']) == equivalent_value(change['after']), f'Unmatched authored change: {name}!{address}'
                verified_changes.add((name,address))
            elif not old['formula']:
                assert old['value'] == new['value'], f'Unrelated cell changed: {name}!{address}'
            count += 1
        for address in extra_cells:
            new=new_cells[address];column=re.match(r'[A-Z]+',address)[0]
            change=allowed.get((name,address))
            assert change and change.get('kind') == 'source-append-cell' and change['before'] is None, 'Appended source cell must be explicitly logged'
            assert equivalent_value(new['value']) == equivalent_value(change['after']) and new['formula'] is None, 'Appended source value/formula mismatch'
            assert new['style'] == old_cells[column+str(append['templateRow'])]['style'], 'Appended source style differs from template'
            assert new['native'] == ((),(),None), 'Unexpected metadata on appended source cell'
            verified_changes.add((name,address))
        if append and name == 'Sources':
            assert [new_cells['A'+str(row)]['value'] for row in append['appendedRows']] == append['appendedIds'], 'Appended source ID mismatch'
    assert verified_heights == set(allowed_heights), 'Unverified row height changes'
    assert verified_changes == set(allowed), 'Unverified authored changes'
    return {'passed': True, 'comparedCells': count, 'authoredChanges': len(changes),
            'enlargedRows': len(verified_heights),
            'appendedSourceRows': len(append['appendedRows']) if append else 0,
            'appendedSourceCells': len(appended_addresses), 'auditedFormulaExpansions': 1 if append else 0,
            'unchanged': ['worksheet order','unrelated values','all unrelated formulas' if append else 'all formulas','effective cell formatting','column widths','unrelated row heights','native tables and validation features outside the audited Sources expansion' if append else 'native tables and validation features','unrelated ZIP members']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plan', type=Path)
    parser.add_argument('workbook', type=Path)
    parser.add_argument('report', type=Path)
    parser.add_argument('--compare-source', type=Path)
    parser.add_argument('--change-log', type=Path)
    parser.add_argument('--layout-change-log', type=Path)
    parser.add_argument('--structure-change-log', type=Path)
    args = parser.parse_args()
    result = verify(args.plan, args.workbook)
    if args.compare_source or args.change_log or args.layout_change_log or args.structure_change_log:
        if not (args.compare_source and args.change_log):
            parser.error('--compare-source and --change-log must be provided together')
        result['preservation'] = compare_source(args.compare_source, args.workbook, args.change_log, args.layout_change_log, args.structure_change_log)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({k: result[k] for k in ['passed','bytes','totalDataRows','sourceUrls','summaryFormulas','errors']}, ensure_ascii=False))
