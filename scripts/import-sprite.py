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
WEAPON_IDLE_OWNER = 'sh3_memory_of_alessa_049'
WEAPON_IDLE_SOURCE = 'sh3'
WEAPON_IDLE_WEAPONS = ('knife', 'handgun', 'pipe', 'smg')
WEAPON_IDLE_KEYS = tuple(f'idle@{WEAPON_IDLE_OWNER}:weapon:{weapon}' for weapon in WEAPON_IDLE_WEAPONS)

def validate_pose_key(pose: str, fighter_id: str, root: Path | None = None, source: str | None = None) -> str:
    """Return the base pose after checking the exact production context and owner."""
    if not isinstance(pose, str) or len(pose) > 240:
        raise ValueError('Invalid pose key.')
    parts = pose.split('@')
    base = parts[0]
    if base not in POSE_KEYS or len(parts) > 2:
        raise ValueError('Unknown engine pose.')
    if len(parts) == 1:
        return base
    context = parts[1]
    if ':weapon:' in context:
        if pose not in WEAPON_IDLE_KEYS or fighter_id != WEAPON_IDLE_OWNER or source not in (None, WEAPON_IDLE_SOURCE) or root is None:
            raise ValueError('Invalid exact fighter/source or weapon idle context.')
        index = json.loads((root / 'data/production-reference-index.json').read_text())
        if not isinstance(index.get('fighters'), dict) or index['fighters'].get(fighter_id) != WEAPON_IDLE_SOURCE:
            raise ValueError('Weapon idle context requires the exact SH3 production owner.')
        return base
    if base not in PRESENTATION_KEYS or root is None:
        raise ValueError('Invalid presentation context.')
    index = json.loads((root / 'data/production-reference-index.json').read_text())
    fighters, stages = index['fighters'], index['stages']
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


def validate_weapon_clips(asset: dict, *, pose: str | None = None, clip: dict | None = None,
                          pixel_hashes: list[str] | None = None) -> None:
    """Keep the four weapon idles isolated; only knife may share generic idle.

    Authoring checks cached pixel identities first. Publication supplies freshly
    inspected hashes so re-encoded images cannot borrow another weapon's pixels.
    """
    clips = dict(asset.get('clips', {}))
    if pose is not None:
        clips[pose] = clip
    contextual = {key: value for key, value in clips.items() if ':weapon:' in key}
    if not contextual:
        return
    if asset.get('fighterId') != WEAPON_IDLE_OWNER or asset.get('source') != WEAPON_IDLE_SOURCE or any(key not in WEAPON_IDLE_KEYS for key in contextual):
        raise ValueError('Weapon idle clips require the exact SH3 fighter/source and one of four weapon keys.')
    frames = asset.get('frames', [])
    pixels = pixel_hashes if pixel_hashes is not None else [frame.get('pixelSHA256') or frame.get('sha256') for frame in frames]
    if len(pixels) != len(frames) or any(not isinstance(value, str) or not value for value in pixels):
        raise ValueError('Weapon idle clips require valid pixel identities.')

    def identities(value):
        indices = value.get('frames') if isinstance(value, dict) else None
        if not isinstance(indices, list) or not indices or any(type(index) is not int or not 0 <= index < len(pixels) for index in indices):
            raise ValueError('Weapon idle clips require existing frames and a generic idle clip.')
        return {pixels[index] for index in indices}

    generic = identities(clips.get('idle'))
    contexts = {key: identities(value) for key, value in contextual.items()}
    for key, selected in contexts.items():
        if key != WEAPON_IDLE_KEYS[0] and selected & generic:
            raise ValueError('A weapon idle needs dedicated pixels distinct from generic idle.')
        if any(selected & other for other_key, other in contexts.items() if other_key != key):
            raise ValueError('Weapon idle clips cannot borrow another weapon\'s pixels.')

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

def selection_provenance(asset: dict) -> dict:
    """Describe the current portrait; old metadata is usable only for its exact source."""
    portrait = asset['portrait']
    source_sha = portrait.get('sourceSHA256', portrait['sha256'])
    fallbacks = [frame for frame in asset.get('frames', [])
                 if frame['path'] == portrait['path'] and frame['sha256'] == portrait['sha256']]
    fallbacks += [candidate for candidate in (asset.get('selectionProvenance', {}), asset)
                  if candidate.get('sourceSHA256') == source_sha]
    result = {'sourceSHA256': source_sha, 'sourceDimensions': [portrait['width'], portrait['height']]}
    for key in ('origin', 'sourceFile'):
        for candidate in [portrait, *fallbacks]:
            if key in candidate:
                result[key] = candidate[key]
                break
    return result

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
    base_pose = validate_pose_key(args.pose, args.fighter, root, args.source)
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
    separate_action = args.selection or args.selection_only or args.combat_idle
    if current and not (args.replace or args.append or separate_action):
        raise ValueError('This ID already has art. Use --append, --selection, --selection-only or --combat-idle; --replace resets legacy art explicitly.')
    if args.append and (not current or current.get('combatView') == 'selection-only' or not current.get('frames')):
        raise ValueError('Cannot append to an ID without an idle frame.')
    replace_knife_idle = args.combat_idle and args.pose == WEAPON_IDLE_KEYS[0]
    if separate_action and args.pose != 'idle' and not replace_knife_idle:
        raise ValueError('Selection and combat-idle actions use the idle import slot; append other combat poses separately.')
    if (args.selection or args.selection_only) and args.loop:
        raise ValueError('A selection portrait is not an animation.')
    if args.replace and current and current.get('combatView'):
        raise ValueError('Separated art requires --selection or --combat-idle; --replace cannot erase its other use.')
    if args.combat_idle or args.selection_only:
        if not current or not current.get('portrait'):
            raise ValueError('Import a selection portrait first with --selection.')
    if args.selection_only:
        if len(current.get('frames', [])) > 1 or set(current.get('clips', {})) - {'idle'}:
            raise ValueError('This action cannot discard existing combat poses or animated frames.')
        if current.get('combatView') == 'side-view-candidate':
            raise ValueError('A separate side-view combat image cannot be reclassified through its portrait.')
        if meta['sha256'] != current['portrait']['sha256'] or any(f['sha256'] != current['portrait']['sha256'] for f in current['frames']):
            raise ValueError('Selection-only reclassification requires the exact existing shared portrait PNG.')
    if args.combat_idle and (current['frames'] or current['clips']):
        clips = current['clips']
        if not current['frames'] or clips.get('idle', {}).get('frames') != [0]:
            raise ValueError('Combat idle replacement requires a single static idle at frame 0.')
        shared_idle = {'idle'}
        if replace_knife_idle:
            if clips.get(args.pose, {}).get('frames') != [0]:
                raise ValueError('The knife idle must already share exactly the generic idle frame.')
            shared_idle.add(args.pose)
        if any(0 in clip['frames'] for name, clip in clips.items() if name not in shared_idle):
            raise ValueError('Combat idle replacement cannot change frame 0 shared with another clip.')
    if not current and args.pose != 'idle' or args.replace and args.pose != 'idle':
        raise ValueError('The first frame of an asset must be idle.')
    weapon_pixels = None
    inspected_weapon_pixels = {}
    if args.fighter == WEAPON_IDLE_OWNER and args.source == WEAPON_IDLE_SOURCE and not (args.selection or args.selection_only):
        weapon_pixels = []
        if args.append or args.combat_idle:
            # Old registry pixel hashes are only caches, not authoring evidence.
            # Recheck every retained image against its digest.
            retained = current['frames'] if args.append else current['frames'][1:]
            for prior in retained:
                if not re.fullmatch(r'assets/sprites/[a-z0-9_.-]+\.(png|webp)', prior['path']):
                    raise ValueError('Invalid registered weapon raster path.')
                previous_meta = inspect_image(root / prior['path'])
                if previous_meta['sha256'] != prior['sha256']:
                    raise ValueError('Registered weapon image no longer matches its digest.')
                weapon_pixels.append(previous_meta['pixelSHA256'])
                inspected_weapon_pixels[prior['path']] = previous_meta['pixelSHA256']
        if args.combat_idle:
            weapon_pixels.insert(0, meta['pixelSHA256'])
        else:
            weapon_pixels.append(meta['pixelSHA256'])
    known_pixels = {f['path']: f['pixelSHA256'] for art in registry['assets'].values() for f in art['frames'] if f.get('pixelSHA256')}
    for ident, art in registry['assets'].items():
        references = [(f, 'combat') for f in art['frames']]
        if art.get('portrait'):
            references.append((art['portrait'], 'selection'))
        for index, (prior, purpose) in enumerate(references):
            if ident == args.fighter:
                if args.selection_only or args.replace or args.selection and purpose == 'selection' or args.combat_idle and purpose == 'combat' and index == 0:
                    continue
            if not re.fullmatch(r'assets/sprites/[a-z0-9_.-]+\.(png|webp)', prior['path']):
                raise ValueError('Invalid registered raster path.')
            pixels = (inspected_weapon_pixels.get(prior['path']) if ident == args.fighter else None) or prior.get('pixelSHA256') or known_pixels.get(prior['path'])
            if not pixels:
                pixels = inspect_image(root / prior['path'])['pixelSHA256']
                known_pixels[prior['path']] = pixels
            if prior['sha256'] == meta['sha256'] or pixels == meta['pixelSHA256']:
                raise ValueError('Repeated or re-encoded pixels cannot populate another fighter or animation frame.')
    relative = f"assets/sprites/{args.fighter}.{meta['sha256'][:12]}.{meta['extension']}"
    target = root / relative
    if target.is_symlink():
        raise ValueError('Output target is a symlink.')
    frame = {k: meta[k] for k in ('sha256', 'bytes', 'width', 'height', 'visibleBounds', 'pixelSHA256', 'transparentFraction')}
    frame.update(path=relative, facing=args.facing, anchor=[args.anchor_x, args.anchor_y],
                 bodyHeight=args.body_height, sourceFile=source.name, sourceSHA256=meta['sha256'], origin=args.origin)
    portrait = {k: frame[k] for k in ('path', 'sha256', 'bytes', 'width', 'height', 'facing', 'visibleBounds', 'pixelSHA256', 'sourceFile', 'sourceSHA256', 'origin')}
    portrait['purpose'] = 'selection'
    if args.selection_only:
        asset = current
        asset.setdefault('selectionNotes', asset.get('notes', ''))
        asset['selectionProvenance'] = selection_provenance(asset)
        asset['frames'] = []
        asset['clips'] = {}
        asset['combatView'] = 'selection-only'
    elif args.selection and current:
        asset = current
        asset['portrait'] = portrait
        asset['selectionNotes'] = args.note
        if not asset['frames']:
            asset['combatView'] = 'selection-only'
            asset['origin'] = args.origin
            asset['sourceFile'] = source.name
            asset['sourceSHA256'] = meta['sha256']
            asset['sourceDimensions'] = [meta['width'], meta['height']]
    elif args.combat_idle:
        asset = current
        asset.setdefault('selectionNotes', asset.get('notes', ''))
        asset['selectionProvenance'] = selection_provenance(asset)
        frame.update(purpose='combat', view='side-view')
        retained = asset['frames'][1:]
        if asset.get('combatView') != 'side-view-candidate' and retained:
            legacy = [{'index': index, 'sha256': prior['sha256']}
                      for index, prior in enumerate(retained, start=1)
                      if 'purpose' not in prior and 'view' not in prior]
            if legacy:
                asset['retainedLegacyCombatFrames'] = legacy
        old_origin = asset['origin']
        origins = {args.origin} | {prior.get('origin', old_origin) for prior in retained}
        origin = next(iter(origins)) if len(origins) == 1 else 'mixed'
        if origin != old_origin:
            for prior in retained:
                prior.setdefault('origin', old_origin)
        asset['clips']['idle'] = {'frames': [0], 'ticksPerFrame': args.ticks, 'loop': args.loop}
        asset.update(frames=[frame, *retained],
                     combatView='side-view-candidate', combatNotes=args.note, notes=args.note,
                     origin=origin, sourceFile=source.name, sourceSHA256=meta['sha256'],
                     sourceDimensions=[meta['width'], meta['height']])
    elif args.append:
        asset = current
        if asset.get('combatView') == 'side-view-candidate':
            frame.update(purpose='combat', view='side-view')
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
                 'frames': [frame], 'portrait': portrait,
                 'clips': {'idle': {'frames': [0], 'ticksPerFrame': args.ticks, 'loop': args.loop}}}
        if args.selection:
            asset.update(frames=[], clips={}, combatView='selection-only', selectionNotes=args.note)
        registry['assets'][args.fighter] = asset
    if args.selection:
        asset['selectionProvenance'] = selection_provenance(asset)
    validate_weapon_clips(asset, pixel_hashes=weapon_pixels)
    animation_pixels = weapon_pixels if weapon_pixels is not None else [frame['sha256'] for frame in asset['frames']]
    asset['animatedClips'] = sum(len({animation_pixels[index] for index in clip['frames']}) > 1 for clip in asset['clips'].values())
    report = {'fighterId': args.fighter, 'source': args.source, 'path': relative, 'pose': args.pose,
              'frames': len(asset['frames']), 'animatedClips': asset['animatedClips'], 'fidelity': 'unverified',
              'combatView': asset.get('combatView', 'legacy-unreviewed'), 'portraitPath': asset['portrait']['path'],
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
    p.add_argument('--pose', default='idle', help='Exact engine key, presentation@production-ID, or Alessa idle@exact-ID:weapon:knife|handgun|pipe|smg; presentations: '+', '.join(PRESENTATION_KEYS))
    p.add_argument('--ticks', type=int, default=1)
    p.add_argument('--loop', action='store_true', help='Base poses only; attacks and presentation sequences play once.')
    actions = p.add_mutually_exclusive_group()
    actions.add_argument('--append', action='store_true')
    actions.add_argument('--replace', action='store_true')
    actions.add_argument('--selection', action='store_true', help='Import only the selection portrait; preserve any existing combat frames and clips.')
    actions.add_argument('--selection-only', action='store_true', help='Reclassify an exact existing shared portrait/idle as selection only; preserve its PNG and portrait metadata.')
    actions.add_argument('--combat-idle', action='store_true', help='Install a distinct side-view idle at frame 0, preserving the portrait and other poses. An animated or shared idle cannot be replaced.')
    p.add_argument('--note', default='Image individuelle importée; fidélité et animation à valider visuellement.')
    p.add_argument('--dry-run', action='store_true')
    return p

if __name__ == '__main__':
    try:
        print(json.dumps(import_sprite(parser().parse_args()), ensure_ascii=False, indent=2))
    except (ValueError, OSError, KeyError, UnidentifiedImageError, Image.DecompressionBombError) as exc:
        print('Sprite import refused: '+str(exc), file=sys.stderr)
        sys.exit(2)
