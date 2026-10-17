"""Read-only verification of the exported phase-one Excel file (stdlib only)."""
from pathlib import Path
from zipfile import ZipFile
import argparse
import hashlib
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
                    'observations','sources','pngCandidates','animatedClips','certifiedOneToOne','tasks']]
                expected.append(sum(t['priority'] == 'P0' for t in plan['tasks']))
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
            report['sheets'][name] = {'dataRows': len(data), 'tableRef': table.get('ref'),
                                    'frozenRows': 5, 'frozenColumns': 3, 'validationLists': len(validations)}
    report['totalDataRows'] = sum(v['dataRows'] for v in report['sheets'].values())
    report['passed'] = True
    report['limits'] = 'Read-only OOXML verification; no claim of a native Excel desktop session or a full animation review.'
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plan', type=Path)
    parser.add_argument('workbook', type=Path)
    parser.add_argument('report', type=Path)
    args = parser.parse_args()
    result = verify(args.plan, args.workbook)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({k: result[k] for k in ['passed','bytes','totalDataRows','sourceUrls','summaryFormulas','errors']}, ensure_ascii=False))
