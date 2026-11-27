#!/usr/bin/env python3
"""Compare guide sources against the published wave 32 tree; write reconciliation evidence."""
from collections import Counter
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
BASELINE = '4f7d2e89c106ad4a00752bcb4c9b046ee3043b18'
BASELINE_TREE = '453e9a5f8b74e4e5c4dd0e306294b4c79e8867eb'
CACHE = Path(os.environ.get('HALO_ASSET_CACHE', '/tmp/halo-active-repo'))
SPEC = importlib.util.spec_from_file_location('guide_graft', ROOT / 'scripts/graft-combat-guide-workbook.py')
GRAFT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GRAFT)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, path)


def old_json(relative):
    return json.loads(subprocess.check_output(['git', 'show', BASELINE_TREE + ':' + relative], cwd=ROOT,
                                            env={**os.environ, 'GIT_NO_LAZY_FETCH': '1'}))


def images(value):
    if isinstance(value, str):
        if value.startswith('assets/') and Path(value).suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp', '.gif'}:
            yield value
    elif isinstance(value, list):
        for item in value:
            yield from images(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from images(item)


def main():
    requirements_path = ROOT / 'docs/combat-guide/requirements-resolved.json'
    associations_path = ROOT / 'docs/combat-guide/associations.json'
    requirements, associations = json.loads(requirements_path.read_text()), json.loads(associations_path.read_text())
    old_requirements, old_associations = old_json('docs/combat-guide/requirements-resolved.json'), old_json('docs/combat-guide/associations.json')
    before, after = GRAFT.expected_cells(old_requirements, old_associations), GRAFT.expected_cells(requirements, associations)
    changes = [{'sheet': sheet, 'address': address, 'before': before[sheet].get(address), 'after': value}
               for sheet, cells in after.items() for address, value in cells.items() if before[sheet].get(address) != value]
    delta = {'schemaVersion': 1, 'baselineCommit': BASELINE, 'baselineTree': BASELINE_TREE,
             'status': 'sources-audited-pending-authoring', 'guideSections': len(requirements['sections']),
             'associations': len(associations['records']), 'changedSourceCells': len(changes), 'changes': changes,
             'sourceHashes': {'requirements-resolved.json': digest(requirements_path), 'associations.json': digest(associations_path)},
             'historicalScope': 'All thirteen original worksheets retain their recorded historical scope. Only guide worksheets may evolve.'}
    old_images, current_images = set(images(old_associations)), set(images(associations))
    added, removed = sorted(current_images - old_images), sorted(old_images - current_images)
    local = {path for path in current_images if (ROOT / path).is_file()}
    cached = {path for path in current_images - local if path in old_images and (CACHE / path).is_file()}
    missing = sorted(current_images - local - cached)
    GRAFT.require((len(old_images), len(current_images), len(added)) == (719, 729, 10), 'Unexpected wave 33 image counts')
    GRAFT.require(not removed and not missing, 'Removed or missing associated image')
    GRAFT.require(set(added) <= local, 'Every new image must exist in the persistent source mirror')
    owners = []
    for record in associations['records']:
        matches = sorted(set(images(record)) & set(added))
        if matches:
            owners.append({'kind': record['kind'], 'id': record['id'], 'newPaths': matches, 'status': 'passed'})
    GRAFT.require(len(owners) == 5 and sum(row['kind'] == 'profile' for row in owners) == 4, 'Expected four pose owners and one stage owner')
    GRAFT.require(any(row['kind'] == 'stage' and row['id'] == 'arcade_historical' for row in owners), 'Missing Historical Society layer ownership')
    links = {'schemaVersion': 1, 'status': 'passed', 'baselineCommit': BASELINE, 'baselineTree': BASELINE_TREE,
             'associationFile': 'docs/combat-guide/associations.json', 'associationSha256': digest(associations_path),
             'baselineUniqueImagePaths': len(old_images), 'currentUniqueImagePaths': len(current_images),
             'imageAvailability': {'persistentSourceMirror': len(local), 'regenerableBaselineCache': len(cached), 'cacheRoot': str(CACHE), 'newImagesAllPersistent': True},
             'imageFormats': dict(sorted(Counter(Path(path).suffix for path in current_images).items())),
             'missingPaths': missing, 'removedPaths': removed,
             'newImages': [{'path': path, 'sha256': digest(ROOT / path)} for path in added], 'ownerAttachmentChecks': owners,
             'workbookProjection': 'The existing table records identity, source, guide sections, status and target file. Detailed pose and layer paths remain in associations.json; unchanged profile summary cells are retained.'}
    write_json(HERE / 'source-delta.json', delta)
    write_json(HERE / 'association-asset-links.json', links)
    print(json.dumps({'status': 'passed', 'changedSourceCells': len(changes), 'images': len(current_images), 'newImages': len(added), 'owners': len(owners), 'availability': links['imageAvailability']}))


if __name__ == '__main__':
    main()
