#!/usr/bin/env python3
"""Import one already-created, visually reviewed transparent PNG/WebP; never generates art.

Every input is one subject in one pose, not an atlas. Identity is exact and source-specific.
Technical acceptance is NOT a certification of Silent Hill accuracy. Pillow is required.
"""
from __future__ import annotations
import argparse
import hashlib
from io import BytesIO
import stat
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from PIL import Image, UnidentifiedImageError

MAX_BYTES = 24 * 1024 * 1024
MAX_PIXELS = 4096 * 4096
Image.MAX_IMAGE_PIXELS = MAX_PIXELS
BASE_POSE_KEYS = ('idle','walk','crouch','jump','guard','dodge','hurt','knockdown','ko','phase')
MOVE_KEYS = ('neutralLight','forwardLight','crouchLight','airLight','neutralHeavy','forwardHeavy',
             'crouchHeavy','airHeavy','throw','backThrow','dodgeAttack','guardCounter','wakeupAttack',
             'neutralSpecial','forwardSpecial','backSpecial','downSpecial','airSpecial','super','desperation')
PRESENTATION_KEYS = ('intro','winRound','loseRound','winMatch','loseMatch','outro','finisher','finished','taunt')
POSE_KEYS = BASE_POSE_KEYS + MOVE_KEYS + PRESENTATION_KEYS

def validate_pose_key(pose: str, fighter_id: str, root: Path | None = None) -> str:
    """Return the base pose after checking the exact production context and owner."""
    if not isinstance(pose, str) or len(pose) > 240:
        raise ValueError('Invalid pose key.')
    parts = pose.split('@')
    base = parts[0]
    if base not in POSE_KEYS or len(parts) > 2:
        raise ValueError('Unknown engine pose.')
    if len(parts) == 1:
        return base
    if base not in PRESENTATION_KEYS or root is None:
        raise ValueError('Invalid presentation context.')
    index = json.loads((root / 'data/production-reference-index.json').read_text())
    fighters, stages = index['fighters'], index['stages']
    context = parts[1]
    if base in ('finisher', 'finished'):
        match = re.fullmatch(r'([a-z0-9_]+)_(signature|nightmare|fatality)', context)
        if not match:
            raise ValueError('Invalid finisher context.')
        ident, kind = match.groups()
        valid = ident in stages if kind == 'fatality' else ident in fighters and (base == 'finished' or ident == fighter_id)
    else:
        kind = {'winRound':'winRound1','loseRound':'loseRound1'}.get(base,base)
        valid = fighter_id in fighters and context == f'{fighter_id}:{kind}'
    if not valid:
        raise ValueError('Unknown production context or wrong exact fighter owner.')
    return base

def read_image_snapshot(path: Path) -> bytes:
    if path.is_symlink():
        raise ValueError('A regular image file is required, not a symlink.')
    fd = os.open(path, os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0) | getattr(os, 'O_NONBLOCK', 0))
    with os.fdopen(fd, 'rb') as stream:
        if not stat.S_ISREG(os.fstat(stream.fileno()).st_mode):
            raise ValueError('A regular image file is required.')
        raw = stream.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise ValueError('Input exceeds the 24 MiB budget.')
    return raw

def inspect_image(path: Path, *, raw: bytes | None = None) -> dict:
    # Digest, Pillow validation and publication all use this one immutable snapshot.
    if raw is None:
        raw = read_image_snapshot(path)
    if len(raw) > MAX_BYTES:
        raise ValueError('Input exceeds the 24 MiB budget.')
    with Image.open(BytesIO(raw)) as image:
        if image.format not in ('PNG', 'WEBP') or getattr(image, 'n_frames', 1) != 1:
            raise ValueError('One static PNG/WebP only; no APNG, animation, SVG or atlas.')
        if image.width < 256 or image.height < 128 or image.width > 4096 or image.height > 4096:
            raise ValueError('Image dimensions must be 256..4096 wide and 128..4096 high; no upscaling.')
        if image.width * image.height > MAX_PIXELS:
            raise ValueError('Decoded image exceeds the pixel budget.')
        if image.mode not in ('RGBA', 'LA'):
            raise ValueError('A real alpha channel is required; no painted black/checkerboard background.')
        image.load()
        alpha = image.getchannel('A')
        hist = alpha.histogram()
        clear = sum(hist[:16]) / (image.width * image.height)
        if clear < .08 or clear > .98 or alpha.getextrema()[1] < 96:
            raise ValueError('Alpha audit failed: image must contain a readable isolated subject and transparent margin.')
        bounds = alpha.point(lambda a: 255 if a >= 32 else 0).getbbox()
        if not bounds or bounds[0] < 1 or bounds[1] < 1 or bounds[2] >= image.width or bounds[3] >= image.height:
            raise ValueError('Visible pixels touch an edge: recover the complete subject before importing.')
        rgba = image.convert('RGBA')
        rgba.paste((0, 0, 0, 0), mask=alpha.point(lambda a: 255 if a == 0 else 0))
        return {'pixelSHA256': hashlib.sha256(rgba.tobytes()).hexdigest(),
                'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw),
                'width': image.width, 'height': image.height, 'extension': image.format.lower(),
                'visibleBounds': list(bounds), 'transparentFraction': round(clear, 5)}

def atomic_write(path: Path, raw: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix='.'+path.name+'.', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(raw)
            f.flush()
            os.fsync(f.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)

def import_sprite(args: argparse.Namespace) -> dict:
    root = args.root.resolve()
    manifest = root / 'art/registry.json'
    if (root / 'art').is_symlink() or manifest.is_symlink() or (root / 'assets').is_symlink() or (root / 'assets/sprites').is_symlink():
        raise ValueError('Output paths must not be symlinks.')
    before = manifest.read_bytes()
    registry = json.loads(before)
    roster = json.loads((root / 'data/roster.json').read_text())
    fighter = next((f for f in roster if f['id'] == args.fighter), None)
    if not fighter or fighter['source'] != args.source or not re.fullmatch(r'[a-z0-9_]+', args.fighter):
        raise ValueError('Unknown fighter ID or wrong source. Cross-game aliases are refused.')
    if not args.single_subject_reviewed:
        raise ValueError('Inspect the image first and explicitly pass --single-subject-reviewed. No automatic sheet detection is claimed.')
    base_pose = validate_pose_key(args.pose, args.fighter, root)
    if base_pose in MOVE_KEYS + PRESENTATION_KEYS and args.loop:
        raise ValueError('Attacks and presentations must play once; looping is refused.')
    if not 0 <= args.anchor_x <= 1 or not 0 <= args.anchor_y <= 1 or not .05 <= args.body_height <= 1:
        raise ValueError('Anchor and standing-equivalent body calibration must be finite and in range.')
    if not 1 <= args.ticks <= 600:
        raise ValueError('Simulation ticks per frame must be 1..600.')
    source = args.image.absolute()
    snapshot = read_image_snapshot(source)
    meta = inspect_image(source, raw=snapshot)
    current = registry['assets'].get(args.fighter)
    if current and (current.get('fighterId') != args.fighter or current.get('source') != args.source):
        raise ValueError('Existing asset has a different exact fighter/source; no cross-edition append.')
    if current and not (args.replace or args.append):
        raise ValueError('This ID already has art. Use --append for a new frame or --replace to reset it explicitly.')
    if args.append and not current:
        raise ValueError('Cannot append to an ID without an idle frame.')
    if not current and args.pose != 'idle' or args.replace and args.pose != 'idle':
        raise ValueError('The first frame of an asset must be idle.')
    for ident, art in registry['assets'].items():
        for prior in art['frames']:
            if ident == args.fighter and not args.append:
                continue  # An explicitly replaced asset can keep its own original pixels.
            if not re.fullmatch(r'assets/sprites/[a-z0-9_.-]+\.(png|webp)', prior['path']):
                raise ValueError('Invalid registered raster path.')
            pixels = prior.get('pixelSHA256') or inspect_image(root / prior['path'])['pixelSHA256']
            if prior['sha256'] == meta['sha256'] or pixels == meta['pixelSHA256']:
                raise ValueError('Repeated or re-encoded pixels cannot populate another fighter or animation frame.')
    relative = f"assets/sprites/{args.fighter}.{meta['sha256'][:12]}.{meta['extension']}"
    target = root / relative
    if target.is_symlink():
        raise ValueError('Output target is a symlink.')
    frame = {k: meta[k] for k in ('sha256', 'bytes', 'width', 'height', 'visibleBounds', 'pixelSHA256', 'transparentFraction')}
    frame.update(path=relative, facing=args.facing, anchor=[args.anchor_x, args.anchor_y],
                 bodyHeight=args.body_height, sourceFile=source.name, sourceSHA256=meta['sha256'], origin=args.origin)
    if args.append:
        asset = current
        index = len(asset['frames'])
        if index >= 256:
            raise ValueError('Maximum 256 frames per asset.')
        for previous in asset['frames']:
            previous.setdefault('origin', asset['origin'])
        asset['frames'].append(frame)
        origins = {f['origin'] for f in asset['frames']}
        asset['origin'] = next(iter(origins)) if len(origins) == 1 else 'mixed'
        clip = asset['clips'].setdefault(args.pose, {'frames': [], 'ticksPerFrame': args.ticks, 'loop': args.loop})
        if clip['loop'] != args.loop:
            raise ValueError('Clip loop must stay consistent when appending.')
        if len(clip['frames']) >= 256:
            raise ValueError('Maximum 256 steps per clip.')
        durations = clip.get('frameTicks', [clip['ticksPerFrame']] * len(clip['frames']))
        if len(durations) != len(clip['frames']) or any(type(t) is not int or not 1 <= t <= 600 for t in durations):
            raise ValueError('Existing clip has invalid durations; repair it before appending.')
        if sum(durations) + args.ticks > 36000:
            raise ValueError('Maximum 36,000 ticks per clip.')
        if 'frameTicks' in clip or args.ticks != clip['ticksPerFrame']:
            clip['frameTicks'] = durations + [args.ticks]
        clip['frames'].append(index)
    else:
        asset = {'fighterId': args.fighter, 'source': args.source, 'status': 'integrated-candidate',
                 'fidelity': 'unverified', 'origin': args.origin,
                 'sourceFile': source.name, 'sourceSHA256': meta['sha256'],
                 'sourceDimensions': [meta['width'], meta['height']], 'singleSubjectReviewed': True,
                 'notes': args.note, 'mirrorPolicy': 'presentation-only; opposite side not independently generated',
                 'frames': [frame], 'portrait': {k: frame[k] for k in ('path', 'sha256', 'bytes', 'width', 'height', 'facing')},
                 'clips': {'idle': {'frames': [0], 'ticksPerFrame': args.ticks, 'loop': args.loop}}}
        registry['assets'][args.fighter] = asset
    asset['animatedClips'] = sum(len(set(asset['frames'][i]['sha256'] for i in c['frames'])) > 1 for c in asset['clips'].values())
    report = {'fighterId': args.fighter, 'source': args.source, 'path': relative, 'pose': args.pose,
              'frames': len(asset['frames']), 'animatedClips': asset['animatedClips'], 'fidelity': 'unverified',
              'technical': meta, 'dryRun': args.dry_run}
    if not args.dry_run:
        # Write content-addressed image first; registry is the single atomic visibility point.
        # Optimistic lease prevents silently overwriting another simultaneous import.
        lock = root / 'art/.import.lock'
        try:
            fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        except FileExistsError as exc:
            raise ValueError('Another sprite import is active; retry after it completes.') from exc
        try:
            os.close(fd)
            if manifest.read_bytes() != before:
                raise ValueError('Registry changed during validation; rerun against its latest state.')
            atomic_write(target, snapshot)
            atomic_write(manifest, (json.dumps(registry, ensure_ascii=False, indent=2)+'\n').encode())
        finally:
            lock.unlink(missing_ok=True)
        report['nextStep'] = 'npm run sprites:check && npm test && npm run build'
    return report

def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('image', type=Path)
    p.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    p.add_argument('--fighter', required=True, help='Exact ID in data/roster.json')
    p.add_argument('--source', required=True, help='Exact source key, e.g. sh1 or film')
    p.add_argument('--origin', choices=('external-unspecified', 'artist-created', 'scan', 'conversation-image-generation'),
                   default='external-unspecified', help='Actual image provenance, not the fictional game source. Never inferred.')
    p.add_argument('--single-subject-reviewed', action='store_true')
    p.add_argument('--anchor-x', type=float, required=True)
    p.add_argument('--anchor-y', type=float, required=True)
    p.add_argument('--body-height', type=float, required=True, help='Standing-equivalent reference height / full image height, not crouched visible bounds')
    p.add_argument('--facing', type=int, choices=(-1, 1), default=1)
    p.add_argument('--pose', default='idle', help='Exact engine key or presentation@production-ID; presentations: '+', '.join(PRESENTATION_KEYS))
    p.add_argument('--ticks', type=int, default=1)
    p.add_argument('--loop', action='store_true', help='Base poses only; attacks and presentation sequences play once.')
    actions = p.add_mutually_exclusive_group()
    actions.add_argument('--append', action='store_true')
    actions.add_argument('--replace', action='store_true')
    p.add_argument('--note', default='Image individuelle importée; fidélité et animation à valider visuellement.')
    p.add_argument('--dry-run', action='store_true')
    return p

if __name__ == '__main__':
    try:
        print(json.dumps(import_sprite(parser().parse_args()), ensure_ascii=False, indent=2))
    except (ValueError, OSError, KeyError, UnidentifiedImageError, Image.DecompressionBombError) as exc:
        print('Sprite import refused: '+str(exc), file=sys.stderr)
        sys.exit(2)
