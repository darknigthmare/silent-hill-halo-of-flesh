"""Preservation and calculation contracts for the stdlib workbook updater."""
from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import tempfile
import unittest
from xml.sax.saxutils import escape
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('halo_workbook_update', ROOT / 'scripts/update-production-workbook.py')
UPDATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(UPDATE)
MAIN = UPDATE.MAIN
CUSTOM = '<x:extLst><x:ext uri="urn:halo:customer"><qa:metadata xmlns:qa="urn:customer" preserve="yes">untouched</qa:metadata></x:ext></x:extLst>'


def cell(address, value=None, formula=None, custom=''):
    kind = 'n' if isinstance(value, (int, float)) else 'str'
    payload = '' if value is None else '<x:v>' + escape(str(value)) + '</x:v>'
    if formula is not None:
        payload = '<x:f>' + escape(formula) + '</x:f>' + payload
    return f'<x:c r="{address}" s="0" t="{kind}">{payload}{custom}</x:c>'


def tiny_workbook(path, *, owner='Alice', delivery='', unknown_formula=False, cycle=False):
    metrics = {'reviewedCombatProfiles': 1, 'authoredFinishers': 0, 'referenceStageTracks': 0,
               'presentationHooks': 9, 'disabledMoves': 0, 'pngCandidates': 0,
               'animatedClips': 0, 'certifiedOneToOne': 0}
    previous = {'metrics': metrics}
    report = {'sheets': {}}
    data = {}
    for sheet, key in UPDATE.TABLES.items():
        rows = {6: cell('A6', key + ':1')}
        fields = {'id': 'A'}
        record = {'id': key + ':1'}
        if sheet == 'Actions':
            fields.update({'reason': 'F', 'status': 'H', 'owner': 'I', 'delivery': 'J'})
            record.update({'reason': 'Original technical work', 'status': 'En cours', 'owner': '', 'delivery': ''})
            rows[6] += cell('D6', 'P0') + cell('F6', record['reason'], custom=CUSTOM) + cell('H6', record['status']) + cell('I6', owner) + cell('J6', delivery)
            rows[7] = cell('A7', 'tasks:2') + cell('D7', 'P0') + cell('H7', 'À faire')
            rows[8] = cell('A8', 'tasks:3') + cell('D8', 'P1') + cell('H8')
        if sheet == 'Combattants':
            fields.update({'animatedClips': 'S', 'artState': 'R', 'oneToOneValidated': 'T'})
            record.update({'animatedClips': 0, 'artState': 'PNG à produire', 'oneToOneValidated': False})
            rows[6] += cell('C6', 'sh1') + cell('R6', record['artState']) + cell('S6', 0) + cell('T6', 'Non')
            rows[7] = cell('A7', 'fighters:2') + cell('C7', 'sh2') + cell('S7', '7')
        previous[key] = [record]
        report['sheets'][sheet] = {'rows': 1, 'fields': fields}
        data[sheet] = rows
    data['Synthèse'] = {
        6: cell('D6', 'sh1') + cell('E6', 99, 'COUNTIFS(\'Combattants\'!$C$6:$C$7,$D6)'),
        18: cell('B18', 99, 'SUM(\'Combattants\'!$S$6:$S$7)'),
        20: cell('B20', 99, 'COUNTA(\'Actions\'!$A$6:$A$8)-COUNTIFS(\'Actions\'!$H$6:$H$8,"Validé")'),
        21: cell('B21', 99, 'COUNTIFS(\'Actions\'!$D$6:$D$8,"P0",\'Actions\'!$H$6:$H$8,"<>Validé")'),
        32: cell('A32', UPDATE.summary_text(metrics))}
    if unknown_formula:
        data['Synthèse'][6] += cell('B6', 1, 'HYPERLINK("https://example.invalid","unsafe")')
    if cycle:
        data['Synthèse'][6] += cell('B6', 1, 'B7')
        data['Synthèse'][7] = cell('B7', 1, 'B6')
    names = ['Synthèse', *UPDATE.TABLES]
    book = f'<x:workbook xmlns:x="{MAIN}" xmlns:r="{UPDATE.REL[1:-1]}"><x:sheets>'
    rels = '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    with ZipFile(path, 'w') as archive:
        archive.comment = b'customer archive comment'
        archive.writestr('custom/customer.bin', b'\x00unchanged customer payload\xff')
        for index, name in enumerate(names, 1):
            book += f'<x:sheet name="{name}" sheetId="{index}" r:id="r{index}" />'
            rels += f'<Relationship Id="r{index}" Target="worksheets/sheet{index}.xml" />'
            rows = ''.join(f'<x:row r="{row}" ht="50" customHeight="1">{values}</x:row>' for row, values in sorted(data[name].items()))
            xml = (f'<x:worksheet xmlns:x="{MAIN}"><x:cols><x:col min="1" max="31" width="30" /></x:cols>'
                   f'<x:sheetData>{rows}</x:sheetData>{CUSTOM}</x:worksheet>')
            archive.writestr(f'xl/worksheets/sheet{index}.xml', xml)
        archive.writestr('xl/workbook.xml', book + '</x:sheets></x:workbook>')
        archive.writestr('xl/_rels/workbook.xml.rels', rels + '</Relationships>')
    return previous, report


class WorkbookUpdateTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='halo-workbook-test-')
        self.addCleanup(self.temporary.cleanup)
        self.directory = Path(self.temporary.name)
        self.source = self.directory / 'source.xlsx'

    def actual_baseline(self):
        fixture = ROOT / 'docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx'
        report = json.loads((ROOT / 'docs/production/workbook-verification.json').read_text())
        workbook = UPDATE.WorkbookEditor(fixture)
        previous = {'metrics': deepcopy(report['metrics'])}
        reverse_roles = {value: key for key, value in UPDATE.ROLES.items()}
        for sheet, table in UPDATE.TABLES.items():
            layout = report['sheets'][sheet]
            previous[table] = []
            for index in range(6, 6 + layout['rows']):
                record = {}
                for field, column in layout['fields'].items():
                    value = workbook.value(sheet, column + str(index))
                    if field in {'boss', 'projectile', 'oneToOneValidated'}:
                        value = value == 'Oui'
                    if field == 'targetRole':
                        value = reverse_roles.get(value, value)
                    record[field] = '' if value is None else value
                previous[table].append(record)
        return fixture, report, previous

    @staticmethod
    def appended_source():
        return {'id': 'QA_APPEND_ONLY_SOURCE', 'title': 'Synthetic source append fixture',
                'type': 'technical-fixture', 'scope': 'Only verifies preservation of workbook sources.',
                'caveat': 'No original footage or artwork certification. ' * 12,
                'consultedAt': '2026-10-23', 'url': 'https://example.invalid/append-only-source'}

    def test_formula_caches_use_current_data_including_sum_and_open_p0_counts(self):
        tiny_workbook(self.source)
        workbook = UPDATE.WorkbookEditor(self.source)
        first = UPDATE.FormulaEvaluator(workbook).recalculate()
        self.assertEqual(len(first), 4)
        self.assertEqual(workbook.value('Synthèse', 'B18'), 0, 'SUM ignores numeric text in a range')
        self.assertEqual(workbook.value('Synthèse', 'B20'), 3)
        self.assertEqual(workbook.value('Synthèse', 'B21'), 2)
        self.assertEqual(workbook.value('Synthèse', 'E6'), 1)
        workbook.set_value('Combattants', 'S6', 3)
        workbook.set_value('Actions', 'H7', 'Validé')
        UPDATE.FormulaEvaluator(workbook).recalculate()
        self.assertEqual(workbook.value('Synthèse', 'B18'), 3)
        self.assertEqual(workbook.value('Synthèse', 'B20'), 2)
        self.assertEqual(workbook.value('Synthèse', 'B21'), 1)
        self.assertTrue(UPDATE.FormulaEvaluator.matches(None, '<>Validé'))
        self.assertTrue(UPDATE.FormulaEvaluator.matches('VALIDÉ', 'Validé'))

    def test_unknown_and_external_formulas_and_cycles_fail_closed(self):
        tiny_workbook(self.source, unknown_formula=True)
        with self.assertRaisesRegex(ValueError, 'Unsupported formula function'):
            UPDATE.FormulaEvaluator(UPDATE.WorkbookEditor(self.source)).recalculate()
        tiny_workbook(self.source, cycle=True)
        with self.assertRaisesRegex(ValueError, 'Circular formula'):
            UPDATE.FormulaEvaluator(UPDATE.WorkbookEditor(self.source)).recalculate()
        tiny_workbook(self.source)
        evaluator = UPDATE.FormulaEvaluator(UPDATE.WorkbookEditor(self.source))
        with self.assertRaisesRegex(ValueError, 'Unknown formula worksheet'):
            evaluator.evaluate("SUM('[outside.xlsx]Actions'!A6:A8)", 'Synthèse')
        with self.assertRaisesRegex(ValueError, 'ranges differ'):
            evaluator.evaluate('COUNTIFS(\'Actions\'!A6:A8,"x",\'Actions\'!D6:D7,"P0")', 'Synthèse')
        with self.assertRaisesRegex(ValueError, 'Unsupported'):
            evaluator.evaluate('SUM(\'Actions\'!A6:A8)*2', 'Synthèse')

    def test_unknown_xml_and_unrelated_zip_payloads_and_owner_are_preserved(self):
        previous, report = tiny_workbook(self.source)
        plan = deepcopy(previous)
        plan['tasks'][0]['reason'] = 'Updated technical work with & <literal> text'
        workbook = UPDATE.WorkbookEditor(self.source)
        UPDATE.apply_plan(workbook, plan, previous, report)
        UPDATE.FormulaEvaluator(workbook).recalculate()
        output = self.directory / 'output.xlsx'
        workbook.write(output)
        exported = UPDATE.WorkbookEditor(output)
        self.assertEqual(exported.value('Actions', 'I6'), 'Alice')
        self.assertEqual(exported.value('Actions', 'F6'), plan['tasks'][0]['reason'])
        with ZipFile(self.source) as before, ZipFile(output) as after:
            self.assertEqual(before.comment, after.comment)
            self.assertEqual(before.read('custom/customer.bin'), after.read('custom/customer.bin'))
            for name in before.namelist():
                if name not in ('xl/worksheets/sheet1.xml', 'xl/worksheets/sheet9.xml'):
                    self.assertEqual(before.read(name), after.read(name), name)
            self.assertEqual(after.read('xl/worksheets/sheet9.xml').decode().count(CUSTOM), 2)

    def test_changed_annotation_conflicts_and_unknown_ids_and_row_counts_fail_closed(self):
        previous, report = tiny_workbook(self.source, delivery='Manual delivery')
        plan = deepcopy(previous)
        plan['tasks'][0]['delivery'] = 'New generated delivery'
        with self.assertRaisesRegex(ValueError, 'Annotated field must be reconciled'):
            UPDATE.apply_plan(UPDATE.WorkbookEditor(self.source), plan, previous, report)
        plan = deepcopy(previous)
        plan['fighters'][0]['id'] = 'unknown'
        with self.assertRaisesRegex(ValueError, 'IDs changed'):
            UPDATE.apply_plan(UPDATE.WorkbookEditor(self.source), plan, previous, report)
        plan = deepcopy(previous)
        plan['sources'].append(deepcopy(plan['sources'][0]))
        with self.assertRaisesRegex(ValueError, 'Row scope changed'):
            UPDATE.apply_plan(UPDATE.WorkbookEditor(self.source), plan, previous, report)
        plan = deepcopy(previous)
        workbook = UPDATE.WorkbookEditor(self.source)
        workbook.sheets['Synthèse']['values']['A32'] = 'Manual narrative'
        with self.assertRaisesRegex(ValueError, 'Annotated summary'):
            UPDATE.apply_plan(workbook, plan, previous, report)

    def test_stale_plan_hash_fails_before_output_creation(self):
        previous, report = tiny_workbook(self.source)
        plan = self.directory / 'plan.json'
        plan.write_text(json.dumps(previous))
        report_path = self.directory / 'report.json'
        report['planSha256'] = '0' * 64
        report_path.write_text(json.dumps(report))
        output = self.directory / 'output'
        with self.assertRaisesRegex(ValueError, 'Previous plan does not match'):
            UPDATE.update_workbook(plan, self.source, report_path, output, plan)
        self.assertFalse(output.exists())

    def test_source_append_updates_only_trailing_cells_table_ranges_and_one_count_formula(self):
        fixture, report, previous = self.actual_baseline()
        payload = (json.dumps(previous, ensure_ascii=False, indent=2) + '\n').encode()
        report['planSha256'] = hashlib.sha256(payload).hexdigest()
        old_path, report_path, plan_path = [self.directory / name for name in ['old.json', 'report.json', 'new.json']]
        old_path.write_bytes(payload)
        report_path.write_text(json.dumps(report))
        plan = deepcopy(previous)
        source = self.appended_source()
        plan['sources'].append(source)
        plan['metrics']['sources'] = len(plan['sources'])
        plan_path.write_text(json.dumps(plan, ensure_ascii=False))
        destination = self.directory / 'append'
        result = UPDATE.update_workbook(plan_path, fixture, report_path, destination, old_path)
        output = destination / fixture.name
        exported, original = UPDATE.WorkbookEditor(output), UPDATE.WorkbookEditor(fixture)
        end = len(plan['sources']) + 5
        for field, column in UPDATE.SOURCE_FIELDS.items():
            self.assertEqual(exported.value('Sources', column + str(end)), source[field])
            self.assertEqual(exported.sheets['Sources']['cells'][column + str(end)].get('s'), original.sheets['Sources']['cells'][column + str(end - 1)].get('s'))
        self.assertEqual(exported.value('Synthèse', 'B16'), len(plan['sources']))
        self.assertEqual(exported.sheets['Synthèse']['cells']['B16'].findtext('s:f', namespaces=UPDATE.NS), f"COUNTA('Sources'!$A$6:$A${end})")
        self.assertEqual(result['sheets']['Sources']['rows'], len(plan['sources']))
        self.assertEqual(result['sheets']['Sources']['range'], f'A5:G{end}')
        preservation = result['verification']['preservation']
        self.assertTrue(preservation['passed'])
        self.assertEqual(preservation['appendedSourceRows'], 1)
        self.assertEqual(preservation['appendedSourceCells'], 7)
        self.assertEqual(preservation['auditedFormulaExpansions'], 1)
        self.assertEqual(len(result['recalculatedFormulas']), 80)
        structure = json.loads((destination / 'workbook-structure-changes.json').read_text())
        allowed_parts = {original.sheets['Sources']['path'], original.sheets['Synthèse']['path'], structure[0]['tablePath']}
        with ZipFile(fixture) as before, ZipFile(output) as after:
            self.assertEqual(before.namelist(), after.namelist())
            for name in before.namelist():
                if name not in allowed_parts:
                    self.assertEqual(before.read(name), after.read(name), name)
            table = ET.fromstring(after.read(structure[0]['tablePath']))
            self.assertEqual(table.get('ref'), f'A5:G{end}')
            self.assertEqual(table.find('s:autoFilter', UPDATE.NS).get('ref'), f'A5:G{end}')
        validator = UPDATE.load_validator()
        logs = [destination / name for name in ['workbook-change-log.json', 'workbook-layout-changes.json', 'workbook-structure-changes.json']]
        with self.assertRaises(AssertionError):
            validator.compare_source(fixture, output, *logs[:2])
        forged = deepcopy(structure)
        forged[0]['formula']['after'] = 'SUM(1,136)'
        forged_path = self.directory / 'forged-structure.json'
        forged_path.write_text(json.dumps(forged))
        with self.assertRaisesRegex(AssertionError, 'exact Sources count formula'):
            validator.compare_source(fixture, output, *logs[:2], forged_path)
        # Wrong new-cell style, another formula, a row flag and unrelated ZIP bytes
        # must each fail independently, even with the genuine append journal.
        source_part, summary_part = original.sheets['Sources']['path'], original.sheets['Synthèse']['path']
        source_prefix = original.sheets['Sources']['prefix']
        with ZipFile(output) as archive:
            entries = {name: archive.read(name) for name in archive.namelist()}
        mutations = [
            (source_part, lambda raw: raw.replace(f'r="G{end}" s="16"'.encode(), f'r="G{end}" s="0"'.encode(), 1)),
            (summary_part, lambda raw: raw.replace(b"COUNTA('Combattants'!$A$6:$A$235)", b'SUM(230)', 1)),
            (source_part, lambda raw: raw.replace(f'<{source_prefix}row r="{end}"'.encode(), f'<{source_prefix}row hidden="1" r="{end}"'.encode(), 1)),
            (source_part, lambda raw: raw.replace(f'r="A{end - 1}" s="10"'.encode(), f'r="A{end - 1}" cm="1" s="10"'.encode(), 1)),
            ('xl/styles.xml', lambda raw: raw + b' ')
        ]
        for number, (part, mutate) in enumerate(mutations):
            changed = mutate(entries[part])
            self.assertTrue(changed != entries[part], 'Tamper fixture failed to alter ' + part)
            tampered = self.directory / f'tampered-{number}.xlsx'
            with ZipFile(tampered, 'w') as archive:
                for name, value in entries.items():
                    archive.writestr(name, changed if name == part else value)
            with self.assertRaises(AssertionError, msg=part):
                validator.compare_source(fixture, tampered, *logs)

    def test_source_append_refuses_reordering_insertion_deletion_and_other_table_expansion(self):
        fixture, report, previous = self.actual_baseline()
        for mutate in [
            lambda plan: plan['sources'].insert(0, self.appended_source()),
            lambda plan: plan['sources'].reverse(),
            lambda plan: plan['sources'].pop(),
            lambda plan: plan['sources'].append(deepcopy(plan['sources'][0])),
            lambda plan: plan['fighters'].append(deepcopy(plan['fighters'][0]))
        ]:
            plan = deepcopy(previous)
            mutate(plan)
            with self.assertRaisesRegex(ValueError, 'Row scope changed|Order or IDs changed'):
                UPDATE.apply_plan(UPDATE.WorkbookEditor(fixture), plan, previous, report)

    def test_actual_workbook_updates_all_mapped_tables_and_recalculates_80_formulas(self):
        # Reconstruct the mapped baseline from the fixture workbook, independently
        # of the runtime generator, then exercise the full production verifier.
        fixture = ROOT / 'docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx'
        report = json.loads((ROOT / 'docs/production/workbook-verification.json').read_text())
        workbook = UPDATE.WorkbookEditor(fixture)
        previous = {'metrics': deepcopy(report['metrics'])}
        reverse_roles = {value: key for key, value in UPDATE.ROLES.items()}
        booleans = {'boss', 'projectile', 'oneToOneValidated'}
        for sheet, table in UPDATE.TABLES.items():
            layout = report['sheets'][sheet]
            previous[table] = []
            for index in range(6, 6 + layout['rows']):
                record = {}
                for field, column in layout['fields'].items():
                    value = workbook.value(sheet, column + str(index))
                    if field in booleans:
                        value = value == 'Oui'
                    if field == 'targetRole':
                        value = reverse_roles.get(value, value)
                    record[field] = '' if value is None else value
                previous[table].append(record)
        payload = (json.dumps(previous, ensure_ascii=False, indent=2) + '\n').encode()
        report['planSha256'] = hashlib.sha256(payload).hexdigest()
        old_path = self.directory / 'old-plan.json'
        old_path.write_bytes(payload)
        report_path = self.directory / 'report.json'
        report_path.write_text(json.dumps(report))
        plan = deepcopy(previous)
        plan['moves'][0]['canonicalVerification'] += ' Verified technical test update.'
        plan['observations'][0]['description'] += ' Additional documented observation.'
        plan['sources'][0]['caveat'] += ' Independent technical comparison remains required.'
        plan['fighters'][0]['animatedClips'] += 1
        plan['metrics']['animatedClips'] += 1
        role = next(row for row in plan['tasks'] if row['priority'] == 'P0' and row['status'] != 'Validé')
        role['status'] = 'Validé'
        plan_path = self.directory / 'plan.json'
        plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')
        result = UPDATE.update_workbook(plan_path, fixture, report_path, self.directory / 'result', old_path)
        exported = UPDATE.WorkbookEditor(self.directory / 'result' / fixture.name)
        expected_open = sum(row['status'] != 'Validé' for row in plan['tasks'])
        expected_p0 = sum(row['status'] != 'Validé' and row['priority'] == 'P0' for row in plan['tasks'])
        self.assertEqual(exported.value('Synthèse', 'B18'), plan['metrics']['animatedClips'])
        self.assertEqual(exported.value('Synthèse', 'B20'), expected_open)
        self.assertEqual(exported.value('Synthèse', 'B21'), expected_p0)
        self.assertEqual(len(result['recalculatedFormulas']), 80)
        self.assertTrue(result['verification']['preservation']['passed'])
        self.assertGreater(result['verification']['preservation']['comparedCells'], 200_000)
        self.assertEqual(exported.value('Sources', 'E6'), plan['sources'][0]['caveat'])
        self.assertEqual(exported.value('Gestes référencés', 'F6'), plan['observations'][0]['description'])
        self.assertEqual(exported.value('Combattants', 'T6'), 'Non', 'No visual certification is inferred')


if __name__ == '__main__':
    unittest.main()
