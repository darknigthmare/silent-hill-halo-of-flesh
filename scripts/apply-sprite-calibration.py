#!/usr/bin/env python3
"""Apply an exported, exact-hash calibration without changing images or collision rules.
Dry run by default. --apply publishes the registry atomically under the importer lock.
"""
import argparse
import importlib.util
import json
import math
import os
import re
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('sprite_import', Path(__file__).with_name('import-sprite.py'))
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)

def apply_packet(root, packet, apply=False):
    root = Path(root).resolve()
    path = root / 'art/registry.json'
    for relative in ('art', 'art/registry.json', 'assets', 'assets/sprites'):
        location = root / relative
        if location.resolve() != location or location.is_symlink():
            raise ValueError('Registry and asset directories must not be symlinks')
    before = path.read_bytes()
    registry = json.loads(before)
    if not isinstance(packet, dict) or type(packet.get('schema')) is not int or packet['schema'] not in (1, 2) or packet.get('kind') != 'halo-sprite-calibration':
        raise ValueError('Unsupported calibration format')
    allowed = {'schema', 'kind', 'fighterId', 'source', 'frames'}
    if packet['schema'] == 2:
        allowed.add('previousFrames')
    if set(packet) != allowed or not isinstance(packet['fighterId'], str) or not isinstance(packet['source'], str):
        raise ValueError('Unexpected calibration fields or identity')
    if packet['schema'] == 1 and apply:
        raise ValueError('Legacy calibration has no concurrency guard; re-export using the current inspector')
    asset = registry.get('assets', {}).get(packet.get('fighterId'))
    if not asset or asset['source'] != packet.get('source'):
        raise ValueError('Unknown fighter or mismatched source')
    if packet['schema'] == 2:
        previous = [{key: frame[key] for key in ('path', 'sha256', 'anchor', 'bodyHeight', 'facing')} for frame in asset['frames']]
        if packet['previousFrames'] != previous:
            raise ValueError('Stale calibration export: anchors, dimensions, direction or frame set changed')
    entries = packet.get('frames')
    if not isinstance(entries, list) or not entries or len(entries) > 256:
        raise ValueError('Invalid calibration frame list')
    frames = {f['path']: f for f in asset['frames']}
    seen = set()
    for entry in entries:
        if not isinstance(entry, dict) or set(entry) != {'path', 'sha256', 'anchor', 'bodyHeight', 'facing'}:
            raise ValueError('Only frame calibration fields are accepted')
        frame = frames.get(entry['path'])
        if not frame or entry['path'] in seen or frame['sha256'] != entry['sha256']:
            raise ValueError('Stale, repeated or mismatched frame')
        seen.add(entry['path'])
        anchor = entry['anchor']
        def finite(value):
            return type(value) in (int, float) and math.isfinite(value)
        if not isinstance(anchor, list) or len(anchor) != 2 or not all(finite(n) and 0 <= n <= 1 for n in anchor):
            raise ValueError('Invalid anchor')
        if not finite(entry['bodyHeight']) or not .05 <= entry['bodyHeight'] <= 1 or type(entry['facing']) is not int or entry['facing'] not in (-1, 1):
            raise ValueError('Invalid calibration or native direction')
        # Confirm this is still the actual file, not just matching untrusted JSON metadata.
        if not re.fullmatch(r'assets/sprites/[a-z0-9_.-]+\.(png|webp)', frame['path']):
            raise ValueError('Invalid registered sprite path')
        meta = importer.inspect_image(root / frame['path'])
        if meta['sha256'] != frame['sha256']:
            raise ValueError('Registered image changed')
        frame.update(anchor=anchor, bodyHeight=entry['bodyHeight'], facing=entry['facing'])
        if asset['portrait']['path'] == frame['path']:
            asset['portrait']['facing'] = frame['facing']
    if apply:
        lock = root / 'art/.import.lock'
        try:
            fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        except FileExistsError as exc:
            raise ValueError('Another art import or calibration is active') from exc
        try:
            os.close(fd)
            if path.read_bytes() != before:
                raise ValueError('Registry changed; re-export calibration')
            importer.atomic_write(path, (json.dumps(registry, ensure_ascii=False, indent=2)+'\n').encode())
        finally:
            lock.unlink(missing_ok=True)
    return {'fighterId': asset['fighterId'], 'frames': len(entries), 'applied': bool(apply), 'nextStep': 'npm run sprites:check && npm test'}

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('packet', type=Path)
    p.add_argument('--root', type=Path, default=ROOT)
    p.add_argument('--apply', action='store_true')
    try:
        args = p.parse_args()
        with args.packet.open('rb') as stream:
            raw = stream.read(256 * 1024 + 1)
        if len(raw) > 256 * 1024:
            raise ValueError('Calibration file too large')
        print(json.dumps(apply_packet(args.root, json.loads(raw), args.apply)))
    except (ValueError, TypeError, OSError, KeyError) as error:
        print('Calibration refused: '+str(error), file=sys.stderr)
        sys.exit(2)
