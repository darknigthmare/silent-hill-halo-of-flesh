"""Inventory the unchanged imagegen outputs selected or archived in wave 25."""
from pathlib import Path
import argparse
import hashlib
import json
import struct
from datetime import datetime, timezone

parser = argparse.ArgumentParser()
parser.add_argument('--animated-receipt', required=True)
parser.add_argument('--out', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[3]
out = Path(args.out).resolve()
assert not out.exists(), 'Preserve existing evidence; choose a fresh output.'

def read(path):
    return json.loads((root / path).read_text())

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

active = {}
for row in read('docs/production/sprite-wave25-imports-2026-11-20.json')['imports']:
    active[row['sha256']] = {
        'fighterId': row['fighterId'], 'frameIndex': 0, 'activePath': row['path'],
        'usage': row['usage'], 'kind': 'static-lateral-candidate',
    }
animated = read(args.animated_receipt)
assert animated['complete'] is True
for row in animated['frames']:
    active[row['sha256']] = {
        'fighterId': animated['fighterId'], 'frameIndex': row['frameIndex'],
        'activePath': row['path'], 'kind': 'existing-animated-idle-frame-replacement',
        'usage': 'combat-lateral-candidate',
    }
for row in read('docs/production/vague25/receipt-stages.json')['assets']:
    active[row['sha256']] = {
        'stageId': row['stageId'], 'activePath': row['path'],
        'kind': 'static-stage-plane', 'usage': 'stage-composition',
    }

lots = {
    'classics': 'docs/production/vague25/classics/png',
    'extra': 'docs/production/wave25-extra/png',
    'townfall-a': 'docs/production/vague25/townfall-a/png',
    'townfall-b': 'docs/production/vague25/townfall-b/png',
    'air-screamer': 'docs/production/vague25/air-screamer/png',
    'stages': 'docs/production/vague25/stages/png',
}
archive_reasons = {
    'sh1_larval_stalker_007.side.png': 'Initial pale material superseded by the dark translucent native correction; complete original retained.',
    'shf_hinako_s_father_164.initial.png': 'Initial three-quarter body superseded by a strict lateral imagegen correction; complete original retained.',
    'bom_blood_baby_144.initial.png': 'Initial three-quarter body superseded by a strict lateral imagegen correction; complete original retained.',
    'air-screamer.idle-wings-down.png': 'Initial low-wing pose passed cadence/identity checks but crossed the physical floor plane at runtime; superseded by a targeted native wing-clearance correction. Complete original and held QA retained.',
}
rows = []
seen = set()
for lot, directory in lots.items():
    folder = root / directory
    assert folder.is_dir(), f'Missing native lot: {folder}'
    for path in sorted(folder.glob('*.png')):
        raw = path.read_bytes()
        digest = sha(raw)
        assert raw[:8] == b'\x89PNG\r\n\x1a\n'
        width, height = struct.unpack('>II', raw[16:24])
        assert digest not in seen, 'An identical source is listed twice; distinguish outputs from copies.'
        seen.add(digest)
        row = {
            'lot': lot, 'retainedNativePath': str(path.relative_to(root)),
            'sha256': digest, 'bytes': len(raw), 'width': width, 'height': height,
            'nativeBytesPreserved': True, 'pixelsModified': False,
        }
        if digest in active:
            row.update(active[digest])
            row['disposition'] = 'active'
            assert (root / row['activePath']).read_bytes() == raw
        else:
            assert path.name in archive_reasons, f'Unaccounted native output: {path}'
            row.update(disposition='archived-superseded', reason=archive_reasons[path.name])
        rows.append(row)

assert set(active) <= seen, 'An active generated image is missing from its native archive.'
report = {
    'schema': 1, 'wave': 25, 'createdAt': datetime.now(timezone.utc).isoformat(),
    'scope': 'Every newly generated native image output from this wave. Copies, references, old assets and QA screenshots are excluded from generation counts.',
    'newNativeOutputs': len(rows), 'selectedActiveOutputs': sum(r['disposition'] == 'active' for r in rows),
    'archivedSupersededOutputs': sum(r['disposition'] != 'active' for r in rows),
    'activeStaticCharacterOutputs': sum(r.get('kind') == 'static-lateral-candidate' for r in rows),
    'activeExistingAnimationFrameReplacements': sum(r.get('kind') == 'existing-animated-idle-frame-replacement' for r in rows),
    'activeStagePlanes': sum(r.get('kind') == 'static-stage-plane' for r in rows),
    'newPortraits': 0, 'newAnimatedClips': 0, 'rows': rows,
    'limits': [
        'The three Air Screamer poses replace images of an existing clip; the clip sequence and durations are retained.',
        'The eleven other character views and eight stage planes are static.',
        'Candidates remain unverified for source fidelity; no one-to-one certification.',
    ],
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: v for k, v in report.items() if k not in ('rows', 'limits', 'scope')}))
