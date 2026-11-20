#!/usr/bin/env python3
"""Import the reviewed wave25 Air Screamer idle poses at indices 0..2 only.

Dry-run is the default. --apply is explicit, and --receipt must be a new path.
This dedicated animation transaction does not call or relax --combat-idle.
It reuses the repository's unchanged native-image validation and atomic writer.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import re
import sys
from datetime import datetime, timezone

FIGHTER = 'sh1_air_screamer_001'
SOURCE = 'sh1'
WALK_SHA = '5adcb14c1e7f53938c4604dafeafc339317b0ab484578ae6e3ede23f1317ef01'
CLIPS = {
    'idle': {'frames': [0, 1, 0, 2], 'ticksPerFrame': 6,
             'frameTicks': [6, 6, 6, 6], 'loop': True},
    'walk': {'frames': [3], 'ticksPerFrame': 6, 'loop': True},
}
MARKER = [{'index': 3, 'sha256': WALK_SHA}]
ALLOWED_ENTRY_FIELDS = {'frames', 'combatView', 'retainedLegacyCombatFrames'}
FRAME_FIELDS = ('sha256', 'bytes', 'width', 'height', 'visibleBounds',
                'pixelSHA256', 'transparentFraction')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(',', ':')).encode('utf-8')


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def plain_file(path):
    path = Path(path).absolute()
    require(path.resolve() == path and not path.is_symlink() and path.is_file(),
            'A native regular file without symlink components is required: ' + str(path))
    return path


def raster_path(root, relative):
    require(isinstance(relative, str) and re.fullmatch(
        r'assets/sprites/[a-z0-9_.-]+\.(png|webp)', relative),
        'Unsafe registered raster path.')
    return plain_file(root / relative)


def registered_files(root, registry, importer):
    """Verify all active bytes, not only the five historical Air Screamer files."""
    checked = {}
    pixel_hashes = set()
    for art in registry['assets'].values():
        references = list(art['frames']) + ([art['portrait']] if art.get('portrait') else [])
        for frame in references:
            relative = frame['path']
            if relative not in checked:
                raw = importer.read_image_snapshot(raster_path(root, relative))
                checked[relative] = {'path': relative, 'sha256': digest(raw), 'bytes': len(raw)}
            item = checked[relative]
            require(item['sha256'] == frame['sha256'] and item['bytes'] == frame['bytes'],
                    'Registered file changed: ' + relative)
            pixels = frame.get('pixelSHA256')
            if not pixels:
                pixels = importer.inspect_image(root / relative)['pixelSHA256']
            pixel_hashes.add(pixels)
    return checked, pixel_hashes


def assert_unchanged_files(root, files, importer):
    for relative, expected in files.items():
        raw = importer.read_image_snapshot(raster_path(root, relative))
        require(digest(raw) == expected['sha256'] and len(raw) == expected['bytes'],
                'Existing raster changed during import: ' + relative)


def validate_entry(entry):
    require(entry['fighterId'] == FIGHTER and entry['source'] == SOURCE,
            'Wrong exact fighter or source.')
    require(len(entry['frames']) == 4 and entry['frames'][3]['sha256'] == WALK_SHA,
            'Exactly four frames and the historical glide are required.')
    require(entry['clips'] == CLIPS and entry['animatedClips'] == 1,
            'The original complete idle/walk clips and animated count must remain exact.')
    require(entry['fidelity'] == 'unverified' and entry['status'] == 'integrated-candidate',
            'This import cannot certify fidelity or change publication status.')
    require(entry.get('portrait') and entry['portrait']['path'] not in {
        frame['path'] for frame in entry['frames']}, 'Separate historical portrait is required.')


def perform(args):
    root = args.root.resolve()
    input_path = plain_file(args.input)
    receipt_path = args.receipt.absolute()
    require(not receipt_path.exists() and not receipt_path.is_symlink(),
            'Preserve the existing receipt; choose a fresh receipt path.')
    require(receipt_path.parent.resolve() == receipt_path.parent,
            'Receipt parent cannot contain a symlink.')
    raw_input = input_path.read_bytes()
    delivery = json.loads(raw_input)
    require(delivery.get('fighterId') == FIGHTER and delivery.get('source') == SOURCE,
            'Only the exact Air Screamer wave25 delivery is accepted.')
    require(delivery.get('replacedFrameIndices') == [0, 1, 2], 'Only indices 0..2 may change.')
    selected = delivery.get('selected')
    require(isinstance(selected, list) and [x.get('frameIndex') for x in selected] == [0, 1, 2],
            'Three rows in exact index order 0,1,2 are required.')
    review = delivery.get('animationReview', {})
    require(review.get('nativePoseConsistencyReviewed') is True and
            review.get('peerReviewPassed') is True and
            review.get('engineCycleQARequired') is True,
            'Reviewed coherent native poses and explicit pending engine-cycle QA are required.')
    require(delivery.get('preservedClips') == CLIPS and
            delivery.get('allowedEntryMetadataChanges') == {
                'combatView': 'side-view-candidate', 'retainedLegacyCombatFrames': MARKER},
            'Delivery cannot expand the fixed clip or metadata-change contract.')

    baseline_ref = delivery['baseline']
    baseline_path = Path(baseline_ref['path'])
    if not baseline_path.is_absolute():
        baseline_path = input_path.parent / baseline_path
    baseline_path = plain_file(baseline_path)
    baseline_raw = baseline_path.read_bytes()
    require(digest(baseline_raw) == baseline_ref['sha256'], 'Baseline delivery digest changed.')
    baseline = json.loads(baseline_raw)
    require(baseline['fighterId'] == FIGHTER and baseline['source'] == SOURCE,
            'Wrong baseline owner.')
    manifest = plain_file(root / 'art/registry.json')
    before_raw = manifest.read_bytes()
    registry = json.loads(before_raw)
    before = registry['assets'][FIGHTER]
    require(before == baseline['entry'], 'Air Screamer changed after the reviewed baseline.')
    validate_entry(before)
    require('combatView' not in before and 'retainedLegacyCombatFrames' not in before,
            'Only the original unqualified legacy entry can be upgraded once.')
    production = json.loads((root / 'data/production-reference-index.json').read_text())
    require(production['fighters'].get(FIGHTER) == SOURCE, 'Production fighter/source mismatch.')

    module_path = plain_file(root / 'scripts/import-sprite.py')
    spec = importlib.util.spec_from_file_location('unchanged_native_sprite_importer', module_path)
    importer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(importer)
    active_files, registered_pixels = registered_files(root, registry, importer)
    for protected in baseline['protectedBinaryFiles']:
        require(active_files.get(protected['path']) == protected,
                'Historical frame or portrait no longer matches the exact baseline bytes.')

    native_sha = set()
    native_pixels = set()
    common_calibration = None
    frames = []
    snapshots = []
    for row in selected:
        require(row.get('fighterId') == FIGHTER and row.get('source') == SOURCE and
                row.get('facing') == 1, 'Every selected frame must have the same SH1 owner and face right.')
        require(row.get('singleSubjectReviewed') is True and row.get('wholeSubjectReviewed') is True
                and row.get('strictRightSideReviewed') is True,
                'Every frame needs whole-subject, single-subject, strict-side visual review.')
        source = plain_file(row['localPath'])
        raw = importer.read_image_snapshot(source)
        meta = importer.inspect_image(source, raw=raw)
        require(meta['extension'] == 'png' and (meta['width'], meta['height']) == (1536, 1024),
                'This reviewed delivery requires three native 1536x1024 transparent PNGs.')
        for field in ('sha256', 'bytes', 'width', 'height', 'pixelSHA256'):
            require(row.get(field) == meta[field], 'Native delivery metadata mismatch: ' + field)
        require(meta['sha256'] not in native_sha and meta['pixelSHA256'] not in native_pixels and
                meta['sha256'] not in {x['sha256'] for x in active_files.values()} and
                meta['pixelSHA256'] not in registered_pixels,
                'Repeated or re-encoded images cannot form this animation.')
        native_sha.add(meta['sha256'])
        native_pixels.add(meta['pixelSHA256'])
        calibration = row.get('calibrationProposal')
        require(isinstance(calibration, dict) and set(calibration) == {'anchor', 'bodyHeight'},
                'Exact anchor/bodyHeight calibration object required.')
        anchor = calibration['anchor']
        height = calibration['bodyHeight']
        require(isinstance(anchor, list) and len(anchor) == 2 and
                all(type(n) in (int, float) and math.isfinite(n) and 0 <= n <= 1 for n in anchor)
                and type(height) in (int, float) and math.isfinite(height) and .05 <= height <= 1,
                'Invalid body anchor or equivalent-height scale.')
        if common_calibration is None:
            common_calibration = calibration
        require(calibration == common_calibration,
                'All three poses must use the same fixed body anchor and scale, independent of wings.')
        require(row.get('bodyLandmarks') and set(row['bodyLandmarks']) == {
                'beakTip', 'skullCrest', 'nearFootEnd', 'farFootEnd'},
                'The reviewed common non-wing body landmarks are required.')
        for point in row['bodyLandmarks'].values():
            require(isinstance(point, list) and len(point) == 2 and
                    all(type(n) in (int, float) and math.isfinite(n) for n in point) and
                    0 <= point[0] < meta['width'] and 0 <= point[1] < meta['height'],
                    'Invalid native body landmark.')
        native_name = Path(row['nativePath']).name
        require(re.fullmatch(r'exec-[a-f0-9-]+\.png', native_name), 'Native source filename required.')
        relative = f"assets/sprites/{FIGHTER}.{meta['sha256'][:12]}.png"
        target = root / relative
        require(target.parent.resolve() == target.parent and not target.is_symlink(),
                'Output sprite path cannot contain a symlink.')
        if target.exists():
            require(target.is_file() and target.read_bytes() == raw,
                    'Never overwrite an existing different raster.')
        frame = {field: meta[field] for field in FRAME_FIELDS}
        frame.update(path=relative, facing=1, anchor=anchor, bodyHeight=height,
                     sourceFile=native_name, sourceSHA256=meta['sha256'],
                     origin='conversation-image-generation', purpose='combat', view='side-view')
        frames.append(frame)
        snapshots.append((source, target, raw, meta))

    after = copy.deepcopy(before)
    after['frames'][:3] = frames
    after['combatView'] = 'side-view-candidate'
    after['retainedLegacyCombatFrames'] = copy.deepcopy(MARKER)
    validate_entry(after)
    require(after['frames'][3] == before['frames'][3] and after['portrait'] == before['portrait'],
            'The historical glide and portrait must stay deeply identical.')
    require({k: v for k, v in after.items() if k not in ALLOWED_ENTRY_FIELDS} ==
            {k: v for k, v in before.items() if k not in ALLOWED_ENTRY_FIELDS},
            'An undeclared entry field changed.')
    proposed = copy.deepcopy(registry)
    proposed['assets'][FIGHTER] = after
    require({k: v for k, v in proposed['assets'].items() if k != FIGHTER} ==
            {k: v for k, v in registry['assets'].items() if k != FIGHTER},
            'Another fighter entry changed.')
    after_raw = (json.dumps(proposed, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    receipt = {
        'schema': 1, 'wave': 25, 'fighterId': FIGHTER, 'source': SOURCE,
        'createdAt': utc_now(), 'complete': False, 'applied': False,
        'dryRun': not args.apply, 'replacedFrameIndices': [0, 1, 2],
        'input': {'path': str(input_path), 'sha256': digest(raw_input)},
        'baseline': {'path': str(baseline_path), 'sha256': digest(baseline_raw)},
        'helperSHA256': digest(Path(__file__).read_bytes()),
        'unchangedStaticImporterSHA256': digest(module_path.read_bytes()),
        'frames': [{'frameIndex': i, **frame, 'sourceLocalPath': str(snapshots[i][0])}
                   for i, frame in enumerate(frames)],
        'preservedClips': CLIPS, 'animatedClipsBefore': 1, 'animatedClipsAfter': 1,
        'allowedEntryMetadataChanges': delivery['allowedEntryMetadataChanges'],
        'protectedBinaryFiles': list(active_files.values()),
        'before': {'registrySHA256': digest(before_raw), 'entrySHA256': digest(canonical(before))},
        'proposed': {'registrySHA256': digest(after_raw), 'entrySHA256': digest(canonical(after))},
        'checks': {'nativeBytesAndPixels': True, 'threeDistinctNativePoses': True,
                   'fixedBodyCalibration': True, 'nativePoseConsistencyReviewed': True,
                   'originalClipTimingPreserved': True, 'portraitDeepEquality': True,
                   'glideFrame3DeepEquality': True, 'allOtherEntryFieldsDeepEquality': True,
                   'allOtherFightersDeepEquality': True, 'allActiveRasterDigestsBefore': True,
                   'historicalRasterDigestsBefore': True},
        'limitations': ['Candidate side reconstruction; fidelity remains unverified.',
                        'The existing walk frame remains an unchanged historical motion frame.',
                        'This import preserves animation semantics but does not replace real cyclic engine QA.'],
        'nextStep': 'Build derived sprite data; run the dedicated native cyclic harness and inspect both facings.'
    }
    if args.apply:
        lock = root / 'art/.import.lock'
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        try:
            os.close(fd)
            require(manifest.read_bytes() == before_raw, 'Registry changed during validation; rerun.')
            assert_unchanged_files(root, active_files, importer)
            for source, target, raw, meta in snapshots:
                require(importer.read_image_snapshot(source) == raw, 'Native source changed during validation.')
                if target.exists():
                    require(not target.is_symlink() and target.read_bytes() == raw,
                            'Output collision after validation.')
                else:
                    importer.atomic_write(target, raw)
                require(digest(target.read_bytes()) == meta['sha256'], 'Native publication digest mismatch.')
            require(manifest.read_bytes() == before_raw, 'Registry changed before atomic publication.')
            importer.atomic_write(manifest, after_raw)
            require(manifest.read_bytes() == after_raw, 'Published registry differs from the validated proposal.')
            assert_unchanged_files(root, active_files, importer)
            require(digest(module_path.read_bytes()) == receipt['unchangedStaticImporterSHA256'],
                    'Static importer changed during this transaction.')
            receipt['checks']['allActiveRasterDigestsAfter'] = True
            receipt['checks']['historicalRasterDigestsAfter'] = True
            receipt['applied'] = True
            receipt['complete'] = True
            receipt['completedAt'] = utc_now()
        finally:
            lock.unlink(missing_ok=True)
    else:
        require(manifest.read_bytes() == before_raw, 'Registry changed during dry-run; rerun.')
        receipt['validationComplete'] = True
    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation prevents overwriting a previous proof document.
    with receipt_path.open('x', encoding='utf-8') as stream:
        json.dump(receipt, stream, ensure_ascii=False, indent=2)
        stream.write('\n')
    return {'fighterId': FIGHTER, 'complete': receipt['complete'],
            'dryRun': receipt['dryRun'], 'validatedFrames': len(frames),
            'protectedNativeFiles': len(active_files), 'receipt': str(receipt_path)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--receipt', type=Path, required=True)
    parser.add_argument('--apply', action='store_true')
    try:
        print(json.dumps(perform(parser.parse_args()), ensure_ascii=False))
    except (ValueError, OSError, KeyError, TypeError) as exc:
        print('Dedicated animation import refused: ' + str(exc), file=sys.stderr)
        sys.exit(2)
