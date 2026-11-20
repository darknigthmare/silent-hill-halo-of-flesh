"""Inventory only explicit imagegen deliveries, excluding source renders and QA captures."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import struct

root = Path(__file__).resolve().parents[3]
base = root / 'docs/production/vague26'
out = base / 'native-dispositions.json'
assert not out.exists(), 'Preserve the prior inventory.'
registry = json.loads((root / 'art/registry.json').read_text())['assets']
rows = []

def inspect(path, expected):
    raw = path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == expected
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    width, height = struct.unpack('>II', raw[16:24])
    return {'path': str(path.relative_to(root)), 'sha256': digest,
            'bytes': len(raw), 'width': width, 'height': height}

for relative in ['characters/collector/delivery.json', 'characters/stalker/delivery.json',
                 'film/integration-delivery.json']:
    path = base / relative
    delivery = json.loads(path.read_text())
    for entry in delivery['selected']:
        native = Path(entry['localPath'])
        row = inspect(native, entry['sha256'])
        frame = registry[entry['fighterId']]['frames'][0]
        active = inspect(root / frame['path'], entry['sha256'])
        assert native.read_bytes() == (root / frame['path']).read_bytes()
        rows.append({**row, 'status': 'active', 'kind': 'static-character-view',
                     'fighterId': entry['fighterId'], 'activePath': active['path'],
                     'delivery': str(path.relative_to(root)), 'pixelsModified': False})
    for entry in delivery.get('archived', []):
        row = inspect(path.parent / entry['path'], entry['sha256'])
        rows.append({**row, 'status': 'archived-superseded', 'kind': 'static-character-view',
                     'reason': entry['reason'], 'delivery': str(path.relative_to(root)),
                     'pixelsModified': False})
for relative in ['stages/integration-delivery-a.json', 'stages/integration-delivery-b.json']:
    path = base / relative
    delivery = json.loads(path.read_text())
    for entry in delivery['assets']:
        native = Path(entry['localPath'])
        row = inspect(native, entry['sha256'])
        active = inspect(root / entry['path'], entry['sha256'])
        assert native.read_bytes() == (root / entry['path']).read_bytes()
        rows.append({**row, 'status': 'active', 'kind': 'static-stage-plane',
                     'stageId': entry['stageId'], 'activePath': active['path'],
                     'delivery': str(path.relative_to(root)), 'pixelsModified': False})
assert len({row['path'] for row in rows}) == len(rows)
assert len({row['sha256'] for row in rows}) == len(rows)
refusal_path = base / 'film/receipt-nurse-return-refused.json'
refusal = json.loads(refusal_path.read_text())
assert refusal['status'] == 'refused' and refusal['successfulImages'] == 0 and refusal['attemptCount'] == 1
report = {'schema': 1, 'wave': 26, 'createdAt': datetime.now(timezone.utc).isoformat(),
          'method': 'Exact SHA256 and byte equality for the explicit imagegen delivery outputs. Source model renders, reference images and QA screenshots are excluded from generation counts.',
          'counts': {'newNativeOutputs': len(rows),
                     'selectedActiveOutputs': sum(row['status'] == 'active' for row in rows),
                     'archivedSupersededOutputs': sum(row['status'] == 'archived-superseded' for row in rows),
                     'activeStaticCharacterOutputs': sum(row['status'] == 'active' and row['kind'] == 'static-character-view' for row in rows),
                     'activeStagePlanes': sum(row['status'] == 'active' and row['kind'] == 'static-stage-plane' for row in rows),
                     'newPortraits': 0, 'newAnimatedClips': 0, 'refusedAttemptsWithNoImage': 1},
          'outputs': rows, 'refusals': [{'fighterId': refusal['fighterId'],
                                       'receipt': str(refusal_path.relative_to(root)),
                                       'receiptSHA256': hashlib.sha256(refusal_path.read_bytes()).hexdigest(),
                                       'requestId': refusal['requestId'], 'images': 0, 'retried': False}],
          'limits': 'Generated candidates remain unverified. A static image is not an animated clip; preserved source animation files are reference evidence only.'}
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'out': str(out.relative_to(root)), **report['counts']}))
