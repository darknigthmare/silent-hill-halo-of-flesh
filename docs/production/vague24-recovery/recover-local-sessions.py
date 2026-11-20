"""Preserve divergent local wave 23 deliveries without replacing active A art.

This recovery script copies native/evidence bytes only. It does not generate or
edit images, certify fidelity, or replay historical tests. Run from the intended
repository; all original source commits must remain available for verification.
"""
from pathlib import Path
import copy
import hashlib
import json
import subprocess
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[3]
A = Path('/workspace/scratch/6d8d28552d08/silent-hill-halo-of-flesh')
B = Path('/workspace/scratch/6101dce1e243/silent-hill-halo-of-flesh')
W22 = Path('/workspace/scratch/silent-hill-wave22')
BASE = 'cffb58bbcb78c2bdb1381965ea0efb3e5fb54994'
COMMITS = {
    'activeSessionA': 'aa97ffba2c6ca0b6d6bdc61ee1c17dc091933231',
    'recoveredSessionB': 'c0eea6d1185cee0575c407aaf1e5854e9077db10',
    'wave22Archive': '6757168e36aaf9e99d5889197da05a28abd7c698',
}
RECOVERY = Path('docs/production/vague24-recovery')
B_ARCHIVE = Path('docs/production/vague23-session-6101')
IDS = ['bom_raw_shock_148', 'bom_gray_child_147']

def git(root, *args):
    return subprocess.run(['git', '-C', str(root), *args], check=True,
                          capture_output=True, text=True).stdout.strip()

def digest(data):
    return hashlib.sha256(data).hexdigest()

def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

assert git(ROOT, 'rev-parse', 'HEAD') == COMMITS['activeSessionA']
assert git(B, 'rev-parse', 'HEAD') == COMMITS['recoveredSessionB']
assert git(W22, 'rev-parse', 'HEAD') == COMMITS['wave22Archive']
manifest = {
    'schema': 1, 'recoveryWave': 24,
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'publishedBaseline': BASE, 'sourceCommits': COMMITS,
    'policy': 'A remains active; only two unique reviewed B views are recovered as active. Overlapping B art and rejected art are retained inactive. Historical evidence is copied byte-for-byte, not rewritten or rerun.',
    'files': [],
}

def preserve(source, destination, origin, status):
    data = source.read_bytes()
    target = ROOT / destination
    if target.exists():
        assert target.read_bytes() == data, f'Unexpected conflicting recovery target: {destination}'
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    manifest['files'].append({
        'source': str(source), 'path': destination.as_posix(),
        'sourceSession': origin, 'disposition': status,
        'bytes': len(data), 'sha256': digest(data), 'byteIdentical': True,
    })

changed_b = git(B, 'diff', '--name-only', BASE, COMMITS['recoveredSessionB']).splitlines()
for name in changed_b:
    path = Path(name)
    if name.startswith('assets/'):
        destination = path
        disposition = ('active-recovered-static-idle' if any(path.name.startswith(i + '.') for i in IDS)
                       else 'inactive-alternative-native-png')
    elif name.startswith('docs/production/vague23/'):
        destination = B_ARCHIVE / path.relative_to('docs/production/vague23')
        disposition = 'historical-session-B-evidence'
    else:
        destination = RECOVERY / 'session-6101-original-state' / path
        disposition = 'historical-session-B-state-not-runtime'
    preserve(B / path, destination, 'session-B', disposition)

for name in git(W22, 'diff', '--name-only', BASE, COMMITS['wave22Archive']).splitlines():
    assert name.startswith('docs/production/vague23/')
    preserve(W22 / name, Path(name), 'wave22-archive', 'preserved-original-archive')

loose = git(W22, 'ls-files', '--others', '--exclude-standard').splitlines()
for name in loose:
    assert name.startswith('docs/production/vague23/')
    preserve(W22 / name, RECOVERY / 'loose-wave23-scripts' / Path(name).name,
             'wave22-worktree', 'inactive-untracked-production-script-or-baseline')

preserve(A.parent / 'generated_images/exec-adbf1708-b405-4628-9d14-6bb38c664d52.png',
         RECOVERY / 'rejected/arcade-hospital-unverified-location.png',
         'session-A', 'rejected-location-unverified-never-active')
preserve(A.parent / 'wave23-publication-inventory.json',
         RECOVERY / 'session-6d8d-publication-inventory.json', 'session-A', 'historical-publication-inventory')
preserve(B.parent / 'publication-wave23/manifest.json',
         RECOVERY / 'session-6101-publication-manifest.json', 'session-B', 'historical-publication-inventory')

original_delivery = B / 'docs/production/vague23/characters/delivery.json'
delivery = json.loads(original_delivery.read_text())
selected = copy.deepcopy([item for item in delivery['selected'] if item['fighterId'] in IDS])
assert set(item['fighterId'] for item in selected) == set(IDS)

def relocate(path):
    prefix = 'docs/production/vague23/'
    index = path.find(prefix)
    return str(ROOT / B_ARCHIVE / path[index + len(prefix):]) if index >= 0 else path

for item in selected:
    for key in ['localPath', 'file', 'candidatePath']:
        if item.get(key):
            item[key] = relocate(item[key])
    for reference in item.get('references', []):
        for key in ['path', 'file']:
            if reference.get(key):
                reference[key] = relocate(reference[key])
    assert digest(Path(item['localPath']).read_bytes()) == item['sha256']
    item['recoveredFromCommit'] = COMMITS['recoveredSessionB']
    item['recoveryPolicy'] = 'Restore the reviewed native static idle; retain source edition, historic portrait, clips, roles and unverified fidelity.'

recovered_delivery = {
    'schema': 1, 'wave': 23, 'recoveryWave': 24,
    'originalDelivery': {'path': str(B_ARCHIVE / 'characters/delivery.json'),
                         'sha256': digest(original_delivery.read_bytes())},
    'sourceCommit': COMMITS['recoveredSessionB'],
    'selected': selected, 'scope': 'Two unique B profiles absent from active A lateral coverage. No new generation.',
}
write_json(ROOT / RECOVERY / 'recovered-character-delivery.json', recovered_delivery)
manifest['counts'] = {
    'sessionBChangedFilesPreserved': len(changed_b),
    'wave22ArchiveFilesPreserved': sum(x['sourceSession'] == 'wave22-archive' for x in manifest['files']),
    'looseProductionFilesPreserved': len(loose),
    'allMappedFiles': len(manifest['files']),
    'bytes': sum(x['bytes'] for x in manifest['files']),
    'nativeBActiveImagesRetained': 14,
    'uniqueBViewsToActivate': 2,
    'overlappingBImagesRetainedInactive': 12,
    'rejectedAImagesRetainedInactive': 1,
}
write_json(ROOT / RECOVERY / 'recovery-manifest.json', manifest)
print(json.dumps(manifest['counts']))
