"""Withdraw only the unpublished Air candidate held by wave25 visual QA.

This restores its exact pre-wave entry before the unchanged strict importer
applies the corrected three-pose delivery. No PNG, other entry or clip is edited.
"""
from pathlib import Path
import argparse
import copy
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import os
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--root', type=Path, required=True)
parser.add_argument('--import-receipt', type=Path, required=True)
parser.add_argument('--baseline', type=Path, required=True)
parser.add_argument('--receipt', type=Path, required=True)
parser.add_argument('--apply', action='store_true')
args = parser.parse_args()
assert args.apply, 'Explicit --apply is required for this documented restoration.'
root = args.root.resolve()
out = args.receipt.resolve()
assert not out.exists(), 'Preserve the prior receipt.'
fighter = 'sh1_air_screamer_001'
sha = lambda raw: hashlib.sha256(raw).hexdigest()
canonical = lambda value: json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
import_raw = args.import_receipt.read_bytes()
receipt = json.loads(import_raw)
baseline_raw = args.baseline.read_bytes()
baseline = json.loads(baseline_raw)
assert receipt['complete'] and receipt['applied'] and receipt['fighterId'] == fighter
assert sha(baseline_raw) == receipt['baseline']['sha256']
baseline_tree = '12bb301c51be56fccd8a2ffd9834468f2f56a9b8'
historical = json.loads(subprocess.check_output(['git', 'show', baseline_tree + ':art/registry.json'], cwd=root))
assert baseline['entry'] == historical['assets'][fighter]
manifest = root / 'art/registry.json'
before_raw = manifest.read_bytes()
before = json.loads(before_raw)
assert sha(before_raw) == receipt['proposed']['registrySHA256'], 'Registry-wide CAS rejected a concurrent change.'
assert sha(canonical(before['assets'][fighter])) == receipt['proposed']['entrySHA256']
assert before['assets'][fighter]['frames'][3] == baseline['entry']['frames'][3]
assert before['assets'][fighter]['portrait'] == baseline['entry']['portrait']
assert before['assets'][fighter]['clips'] == baseline['entry']['clips']
after = copy.deepcopy(before)
after['assets'][fighter] = baseline['entry']
assert {k: v for k, v in before['assets'].items() if k != fighter} == {
    k: v for k, v in after['assets'].items() if k != fighter}
after_raw = (json.dumps(after, ensure_ascii=False, indent=2) + '\n').encode()
spec = importlib.util.spec_from_file_location('unchanged_sprite_importer', root / 'scripts/import-sprite.py')
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)
lock = root / 'art/.import.lock'
fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
try:
    os.close(fd)
    assert manifest.read_bytes() == before_raw, 'Registry-wide CAS changed before restoration.'
    importer.atomic_write(manifest, after_raw)
    assert manifest.read_bytes() == after_raw
finally:
    lock.unlink(missing_ok=True)
result = {
    'schema': 1, 'wave': 25, 'createdAt': datetime.now(timezone.utc).isoformat(),
    'purpose': 'Withdraw the unpublished low-wing candidate held by visual QA, then use the original strict importer for its corrected delivery.',
    'fighterId': fighter, 'complete': True, 'baselineTree': baseline_tree,
    'priorImportReceipt': {'path': str(args.import_receipt), 'sha256': sha(import_raw)},
    'baseline': {'path': str(args.baseline), 'sha256': sha(baseline_raw)},
    'beforeRegistrySHA256': sha(before_raw), 'restoredRegistrySHA256': sha(after_raw),
    'withdrawnEntry': before['assets'][fighter], 'restoredEntry': baseline['entry'],
    'otherEntriesUnchanged': True, 'rasterFilesTouched': 0,
    'lockAndRegistryWideCAS': True,
}
out.parent.mkdir(parents=True, exist_ok=True)
with out.open('x') as stream:
    json.dump(result, stream, ensure_ascii=False, indent=2)
    stream.write('\n')
print(json.dumps({key: value for key, value in result.items() if key not in ('withdrawnEntry', 'restoredEntry')}))
