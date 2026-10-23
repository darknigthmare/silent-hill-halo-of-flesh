#!/usr/bin/env python3
"""Validate a local exported timeline, then optionally publish it with --apply --pose-reviewed.

No image generation, slicing, recolouring, game-stat changes or automatic art approval.
A dry run is the default. The exact frame order/hashes and previous clip are optimistic
concurrency guards: an old export cannot overwrite a more recent timeline unnoticed.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('sprite_import', Path(__file__).with_name('import-sprite.py'))
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)
MOVE_KEYS = importer.MOVE_KEYS
PRESENTATION_KEYS = importer.PRESENTATION_KEYS
POSE_KEYS = importer.POSE_KEYS
MAX_STEPS, MAX_TICKS = 256, 36000


def validate_clip(asset: dict, pose: str, clip: dict, root: Path | None = None) -> dict:
    base_pose = importer.validate_pose_key(pose, asset['fighterId'], root, asset.get('source'))
    if not isinstance(clip, dict) or not {'frames','ticksPerFrame','loop'} <= set(clip) or set(clip) - {'frames','ticksPerFrame','frameTicks','loop'}:
        raise ValueError('Invalid clip fields')
    frames = clip['frames']
    if not isinstance(frames, list) or not 1 <= len(frames) <= MAX_STEPS or any(type(i) is not int or not 0 <= i < len(asset['frames']) for i in frames):
        raise ValueError('Steps must refer to existing imported frames')
    ticks = clip['ticksPerFrame']
    if type(ticks) is not int or not 1 <= ticks <= 600 or type(clip['loop']) is not bool:
        raise ValueError('Invalid duration or loop')
    durations = clip.get('frameTicks', [ticks] * len(frames))
    if not isinstance(durations, list) or len(durations) != len(frames) or any(type(t) is not int or not 1 <= t <= 600 for t in durations) or sum(durations) > MAX_TICKS:
        raise ValueError('Invalid per-frame durations or total duration')
    if base_pose in MOVE_KEYS and clip['loop']:
        raise ValueError('Attacks cannot loop independently of the engine')
    if base_pose in PRESENTATION_KEYS and clip['loop']:
        raise ValueError('Presentations must play once; looping is refused')
    normalized = dict(frames=list(frames), ticksPerFrame=ticks, frameTicks=list(durations), loop=clip['loop'])
    importer.validate_weapon_clips(asset, pose=pose, clip=normalized)
    return normalized


def apply_packet(root: Path, packet: dict, apply: bool = False, pose_reviewed: bool = False) -> dict:
    root = Path(root).resolve()
    manifest = root / 'art/registry.json'
    for relative in ('art','art/registry.json','assets','assets/sprites'):
        path = root / relative
        if path.resolve() != path or path.is_symlink():
            raise ValueError('No linked registry or asset directories')
    before = manifest.read_bytes()
    registry = json.loads(before)
    allowed = {'schema','kind','fighterId','source','pose','frameSet','previousClip','clip'}
    if not isinstance(packet, dict) or set(packet) != allowed or type(packet['schema']) is not int or packet['schema'] != 1 or packet['kind'] != 'halo-sprite-clip':
        raise ValueError('Unsupported or extended clip packet')
    if not isinstance(packet['fighterId'], str) or not isinstance(packet['pose'], str):
        raise ValueError('Invalid identity or pose')
    asset = registry.get('assets', {}).get(packet['fighterId'])
    if not asset or asset['fighterId'] != packet['fighterId'] or asset['source'] != packet['source']:
        raise ValueError('Unknown exact fighter/source')
    frame_set = packet['frameSet']
    if not isinstance(frame_set, list) or not 1 <= len(frame_set) <= 256 or any(not isinstance(f,dict) or set(f) != {'path','sha256'} for f in frame_set):
        raise ValueError('Invalid frame identity set')
    expected = [dict(path=f['path'],sha256=f['sha256']) for f in asset['frames']]
    if frame_set != expected:
        raise ValueError('Frame order or content changed; re-export the clip')
    pose = packet['pose']
    previous = asset['clips'].get(pose)
    if packet['previousClip'] != previous:
        raise ValueError('Stale clip export; the previous timeline changed')
    clip = validate_clip(asset, pose, packet['clip'], root)
    if apply and not pose_reviewed:
        raise ValueError('Inspect the complete pose and pass --pose-reviewed before publishing')
    pixels = []
    # No cache of untrusted pixel hashes: inspect every registered image sequentially.
    for frame in asset['frames']:
        if not re.fullmatch(r'assets/sprites/[a-z0-9_.-]+\.(png|webp)', frame['path']):
            raise ValueError('Unsafe raster path')
        path = root / frame['path']
        meta = importer.inspect_image(path)
        if meta['sha256'] != frame['sha256']:
            raise ValueError('Actual image no longer matches its registered digest')
        pixels.append(meta['pixelSHA256'])
    distinct = len({pixels[i] for i in clip['frames']})
    # Idle/recovery reuse is allowed, but one idle PNG must not manufacture a new attack.
    if pose != 'idle' and previous is None and pose != importer.WEAPON_IDLE_KEYS[0]:
        idle_pixels = {pixels[i] for i in asset['clips']['idle']['frames']}
        if not any(pixels[i] not in idle_pixels for i in clip['frames']):
            raise ValueError('A new pose needs an actual dedicated image, not only idle reuse')
    importer.validate_weapon_clips(asset, pose=pose, clip=clip, pixel_hashes=pixels)
    asset['clips'][pose] = clip
    asset['animatedClips'] = sum(len({pixels[i] for i in c['frames']}) > 1 for c in asset['clips'].values())
    if apply:
        lock = root / 'art/.import.lock'
        try:
            fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        except FileExistsError as error:
            raise ValueError('Another art operation is in progress') from error
        try:
            os.close(fd)
            if manifest.read_bytes() != before:
                raise ValueError('Registry changed during inspection; retry with a new export')
            importer.atomic_write(manifest, (json.dumps(registry, ensure_ascii=False, indent=2)+'\n').encode())
        finally:
            lock.unlink(missing_ok=True)
    return {'fighterId':asset['fighterId'],'pose':pose,'steps':len(clip['frames']),
            'distinctImages':distinct,'totalTicks':sum(clip['frameTicks']),'animated':distinct > 1,
            'applied':bool(apply),'artworkCertified':False,'nextStep':'npm run sprites:check && npm test'}


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('packet', type=Path)
    p.add_argument('--root', type=Path, default=ROOT)
    p.add_argument('--apply', action='store_true')
    p.add_argument('--pose-reviewed', action='store_true')
    try:
        args = p.parse_args()
        with args.packet.open('rb') as stream:
            raw = stream.read(128 * 1024 + 1)
        if len(raw) > 128 * 1024:
            raise ValueError('Clip packet too large')
        print(json.dumps(apply_packet(args.root, json.loads(raw), args.apply, args.pose_reviewed), ensure_ascii=False))
    except (ValueError, TypeError, OSError, KeyError) as error:
        print('Clip refused: '+str(error), file=sys.stderr)
        sys.exit(2)
