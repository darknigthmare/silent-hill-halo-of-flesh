#!/usr/bin/env python3
"""Read-only reconciliation of the delivered wave 33 workbooks and their evidence."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
BASELINE = '4f7d2e89c106ad4a00752bcb4c9b046ee3043b18'
BASELINE_TREE = '453e9a5f8b74e4e5c4dd0e306294b4c79e8867eb'
SPEC = importlib.util.spec_from_file_location('guide_graft', ROOT / 'scripts/graft-combat-guide-workbook.py')
GRAFT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GRAFT)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    requirements_path = ROOT / 'docs/combat-guide/requirements-resolved.json'
    associations_path = ROOT / 'docs/combat-guide/associations.json'
    requirements = json.loads(requirements_path.read_text())
    associations = json.loads(associations_path.read_text())
    log = json.loads((HERE / 'refresh-change-log.json').read_text())
    authoring = json.loads((HERE / 'authoring-report.json').read_text())
    GRAFT.require(authoring['sourceHashes'] == {
        'requirements': digest(requirements_path), 'associations': digest(associations_path)
    }, 'The workbook authoring sources are stale')
    expected = GRAFT.expected_cells(requirements, associations)
    formulas = GRAFT.expected_formulas(requirements, associations)
    checked = []
    historical = []
    renders = []
    for name, report_name, render_folder in [
        ('SILENT_HILL_CORPUS_BIBLE.xlsx', 'corpus-preservation.json', 'render-corpus'),
        ('SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx', 'production-preservation.json', 'render-production'),
    ]:
        destination = ROOT / 'docs/production' / name
        report = json.loads((HERE / report_name).read_text())
        GRAFT.require(digest(destination) == report['afterSha256'], 'Delivered workbook differs from its preservation report')
        after = GRAFT.Package(destination)
        GRAFT.verify_sources(after, expected, formulas)
        baseline_bytes = subprocess.check_output(['git', 'show', BASELINE_TREE + ':docs/production/' + name], cwd=ROOT, env={**os.environ, 'GIT_NO_LAZY_FETCH': '1'})
        with tempfile.TemporaryDirectory(prefix='halo-wave33-readonly-') as tmp:
            original = Path(tmp) / name
            original.write_bytes(baseline_bytes)
            GRAFT.require(digest(original) == report['beforeSha256'], 'Baseline workbook hash mismatch')
            before = GRAFT.Package(original)
            allowed = {sheet: {cell['address'] for cell in log['changedCells'] if cell['sheet'] == sheet} | set(formulas[sheet]) for sheet in GRAFT.GUIDES}
            heights = {(row['sheet'], row['row']): row for row in log['changedRowHeights']}
            preserved = GRAFT.verify_preservation(before, after, set(report['changedParts']), allowed, heights, log)
        GRAFT.require(preserved == report['historicalSheets'], 'Historical worksheet measurements differ')
        historical.extend(preserved)
        render = json.loads((HERE / render_folder / 'render-report.json').read_text())
        GRAFT.require(render['associationSha256'] == digest(associations_path), 'Rendered view source is stale')
        for view in render['previews']:
            GRAFT.require(digest(HERE / render_folder / view['filename']) == view['sha256'], 'Rendered preview hash mismatch')
        GRAFT.require(all(check['passed'] and check['actual'] == check['expected'] for check in render['checks']), 'Rendered view checks failed')
        if render['scope'] == 'full-corpus-workbook':
            GRAFT.require(render['inputSha256'] == report['afterSha256'], 'Rendered corpus differs from the delivered workbook')
        else:
            projection = report['renderProjection']
            GRAFT.require(projection['sourceSha256'] == report['afterSha256'], 'Rendered projection has a stale source')
            GRAFT.require(render['inputSha256'] == projection['projectionSha256'], 'Rendered projection bytes differ from the reviewed projection')
            for part, sha in projection['byteIdenticalPayloads'].items():
                GRAFT.require(GRAFT.sha(after.parts[part]) == sha, 'Retained projection payload mismatch')
        renders.append({'scope': render['scope'], 'path': str((HERE / render_folder).relative_to(ROOT)), 'checksPassed': len(render['checks']), 'previewsVerified': len(render['previews'])})
        checked.append({
            'path': str(destination.relative_to(ROOT)), 'sha256': digest(destination),
            'sourceCellsCompared': sum(map(len, expected.values())),
            'formulaCachesCompared': sum(map(len, formulas.values())),
            'historicalSheetsPreserved': len(preserved), 'sections': len(requirements['sections']),
            'associations': len(associations['records']), 'status': 'passed',
        })
    assets = json.loads((HERE / 'association-asset-links.json').read_text())
    GRAFT.require(assets['associationSha256'] == digest(associations_path), 'Asset linkage report is stale')
    for row in assets['newImages']:
        GRAFT.require(digest(ROOT / row['path']) == row['sha256'], 'New associated image changed')
    result = {
        'schemaVersion': 1, 'asOf': '2026-11-27', 'status': 'passed', 'baselineCommit': BASELINE, 'baselineTree': BASELINE_TREE,
        'guideSections': len(requirements['sections']), 'associations': len(associations['records']),
        'imagePathsPresent': assets['currentUniqueImagePaths'], 'newImagePaths': len(assets['newImages']),
        'imageAvailability': assets['imageAvailability'],
        'stageBitmapCandidates': sum(row['kind'] == 'stage' and row['observedStatus'].startswith('bitmap candidat référencé') for row in associations['records']),
        'sourceTexts': 3, 'historicalSheetsPreserved': len(historical),
        'historicalCellsPreserved': sum(row['cells'] for row in historical),
        'historicalFormulasPreserved': sum(row['formulas'] for row in historical),
        'workbookSourceCellsComparedEach': sum(map(len, expected.values())),
        'workbookFormulaCachesComparedEach': sum(map(len, formulas.values())),
        'sourceCellsChangedEach': len(log['changedCells']), 'workbooks': checked,
        'renderChecks': renders,
        'formulaRecalculation': 'Artifact Tool donor recalculated; decision and extension status changed and restored; formula error scan found zero entries.',
        'visualReview': 'Reviewed at normal readable zoom: guide summary, Historical Society association row, retained extension layout, and historical Corpus/Synthèse opening views. Other historical worksheet payloads verified byte-for-byte.',
        'limits': 'Native Excel desktop was not run. The large workbook uses an exact-payload temporary rendering projection; the full delivered workbook is preserved. No runtime feature, animation or 1:1 fidelity certification follows from this workbook verification.',
    }
    temporary = HERE / 'validation.json.tmp'
    temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, HERE / 'validation.json')
    print(json.dumps({key: result[key] for key in ['status', 'historicalSheetsPreserved', 'historicalCellsPreserved', 'historicalFormulasPreserved', 'workbookSourceCellsComparedEach', 'workbookFormulaCachesComparedEach', 'sourceCellsChangedEach']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
