import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('/workspace/scratch/halo-wave22-fighters-a')

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def load(name):
    return json.loads((BASE / name).read_text())

def write(name, data):
    (BASE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

frozen = BASE / 'delivery-final-provisional-eight.json'
assert sha(frozen) == 'e70ab69234e77e6b2e08bc297d71c090d402e68310100cd1ba99c019a4695fb6'
assert sha(BASE / 'native-visual-review.json') == '9391ad8ec175489156324de054b7c31cfb2bb07718457bd38c228406dbb4a280'
d = load('delivery.json')
assert len(d['selected']) == 10 and d['generationCalls'] == 12
download_files = ['reference-downloads-1.json', 'reference-downloads-2.json', 'reference-downloads-3.json']
downloads = []
for filename in download_files:
    records = load(filename)
    if isinstance(records, dict):
        records = records['records']
    downloads.extend(records)
native_by_sha = {}
for r in downloads:
    if r.get('sha256'):
        native_by_sha.setdefault(r['sha256'], []).append(r)
variant_by_sha = {v['sha256']: v for v in d['variants']}
for e in d['selected']:
    assert sha(e['localPath']) == e['sha256'] == sha(e['generationPath'])
    assert e['existingAnimatedClips'] == 0
    records = []
    for path in e['referenceFiles']:
        h = sha(path)
        if h in native_by_sha:
            item = {'kind': 'native-visual-reference', 'path': path, 'sha256': h, 'bytes': Path(path).stat().st_size, 'urls': sorted(set(r['url'] for r in native_by_sha[h]))}
        elif h in variant_by_sha:
            item = {'kind': 'previous-generated-candidate-for-targeted-correction', 'path': path, 'sha256': h, 'bytes': Path(path).stat().st_size, 'variant': variant_by_sha[h]}
        else:
            raise AssertionError('Unclassified image reference: ' + path)
        records.append(item)
    e['referenceInputRecords'] = records
d.update({
    'generatedAt': datetime.now(timezone.utc).isoformat(),
    'deliveryStatus': 'closed-ten-profile-asset-delivery',
    'nativeReviewState': 'eight-reviewed-two-extensions-pending',
    'nativeReview': {'path': str(BASE / 'native-visual-review-eight.json'), 'sha256': sha(BASE / 'native-visual-review-eight.json'), 'profiles': 8, 'captures': 16, 'referencedCheckExecutions': 448, 'browserTest': False},
    'nativeReviewPendingIds': ['sh2_twin_pyramid_heads_031', 'sh4_one_truth_070'],
    'assetMetadataFrozen': True,
    'repoModifiedByThisAgent': False,
    'integrationHandledByParent': True,
    'selectionDecisions': {'path': str(BASE / 'selection-decisions.json'), 'sha256': sha(BASE / 'selection-decisions.json')},
    'historicalBlockEvidence': {'path': str(BASE / 'historical-block-evidence.json'), 'sha256': sha(BASE / 'historical-block-evidence.json')},
    'referenceArchives': [{'path': str(BASE / p), 'sha256': sha(BASE / p)} for p in download_files],
    'closedSubsets': [{'path': str(BASE / ('delivery-part' + str(i) + '.json')), 'sha256': sha(BASE / ('delivery-part' + str(i) + '.json'))} for i in range(1, 5)],
    'frozenEight': {'path': str(frozen), 'sha256': sha(frozen)},
})
write('delivery.json', d)
write('delivery-final.json', d)
assert sha(BASE / 'delivery.json') == sha(BASE / 'delivery-final.json')
c = load('delivery-consistency.json')
c.update({'checkedAt': datetime.now(timezone.utc).isoformat(), 'deliveryPath': str(BASE / 'delivery-final.json'), 'deliverySHA256': sha(BASE / 'delivery-final.json'), 'allReferenceInputsClassifiedAndHashed': True, 'frozenEightSHA256Verified': True})
write('delivery-consistency.json', c)
print(json.dumps({'finalManifest': str(BASE / 'delivery-final.json'), 'sha256': sha(BASE / 'delivery-final.json'), 'sameAsDeliveryJson': True, 'assetCount': len(d['selected']), 'nativeReviewPending': d['nativeReviewPendingIds'], 'consistencySHA256': sha(BASE / 'delivery-consistency.json')}, indent=2))
