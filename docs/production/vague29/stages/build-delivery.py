"""Validate and record native imagegen bytes; never edit source pixels."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sha = lambda data: hashlib.sha256(data).hexdigest()

SPECS = [
    {
        'id': 'book_light', 'layer': 'bg-light-room',
        'scene': 'bom-light-zone8-window-room', 'ceiling': False,
        'supportNote': 'Ceiling support for contextual finishers is not established by these references; preserve the previous ineligibility rather than infer a usable support from the painted interior.',
        'edition': 'Silent Hill: Book of Memories (PS Vita, 2012), Zone 8 Light World gameplay',
        'scope': 'Rectangular Light World room: stone window wall and rose-brown tiled floor',
        'referenceFiles': ['light-sheet-6.jpg', 'light-sheet-10.jpg'],
        'notes': [
            'Gameplay sheets establish dark ochre/pale aged stone, rectangular paneling, narrow white windows and rose-brown square floor slabs. The screenshot grids are source evidence only, not delivered artwork.',
            'The lateral camera, widened continuous floor, regularized window count, wall spacing and tiny foreground stone trims are authored versus adaptations. No exact procedural room seed, dimensions or hidden geometry is certified.',
            'No other elemental zone, new rune, character, enemy, attack, interface or collectible is painted into this room. The small rear stone slab remains behind the fighting line.',
        ],
    },
    {
        'id': 'book_steel', 'layer': 'bg-steel-room',
        'scene': 'bom-steel-zone19-gear-room', 'ceiling': False,
        'supportNote': 'Ceiling support for contextual finishers is not established by these references; preserve the previous ineligibility rather than infer a usable support from the painted interior.',
        'edition': 'Silent Hill: Book of Memories (PS Vita, 2012), Zone 19 Steel World gameplay and Miguel Rico original environment props',
        'scope': 'Steel World industrial room with closed tread-plate door and inert floor gear motif',
        'referenceFiles': ['steel-sheet-1.jpg', 'steel-sheet-3.jpg', 'rico-07.jpg', 'rico-09.jpg'],
        'notes': [
            'Gameplay sheets establish green-gray industrial rooms, bright rectangular wall lights and large floor-disc motifs. Miguel Rico source renders corroborate the tread-plate double door and toothed three-spoke disc.',
            'The camera, wall-panel arrangement, door placement, gear diameter, lamp spacing and continuous clear floor are authored adaptations of observed materials and motifs; source topology and procedural room layout remain unverified.',
            'The floor motif is inert art, not a moving trap or new machine. No extra rune, pipe network, character, weapon or UI is introduced.',
        ],
    },
    {
        'id': 'film_midwich', 'layer': 'bg-otherworld-gallery',
        'scene': 'film2006-midwich-otherworld-upper-gallery', 'ceiling': True,
        'edition': 'Silent Hill (Christophe Gans, 2006), transformed upper Midwich gallery, film frame reproduced by Film Mining 101',
        'scope': 'Upper Midwich Otherworld gallery with circular amber geometric window, exposed beams and grated walkway',
        'referenceFiles': ['film-source-034.png'],
        'notes': [
            'The actual film frame shows Rose in the transformed upper gallery, the circular amber glazed geometric window, dark rectangular bays, overhead beams and rusty gallery metal. The bathroom, courtyard and game versions of Midwich are excluded.',
            'The foreground walkway is widened and its near railing omitted to leave a clear versus plane; the source corridor depth and exact width are not reconstructed 1:1.',
            'The window motif, wall symmetry and beam repetition are interpreted at the new camera. No person, creature, gore, new chain or collapsing floor is baked into the image.',
        ],
    },
    {
        'id': 'film_church', 'layer': 'bg-protected-rear-nave',
        'scene': 'film2006-church-rear-nave-before-intrusion', 'ceiling': True,
        'edition': 'Silent Hill (Christophe Gans, 2006), protected church nave before final intrusion, film frame reproduced by Film Mining 101',
        'scope': 'Normal-state nave facing the rear entrance: pale square pillars, timber paneling, ring lamps and candles',
        'referenceFiles': ['film-source-046.png'],
        'notes': [
            'The source film frame shows the congregation facing the rear entrance. Square pale columns, brown timber paneling, raised rear doors, conical ring lamps and small candles are retained while all people are removed.',
            'The camera is lowered/regularized for versus, the clear floor broadened and pews moved to the rear outer margins. Exact pew count, pillar spacing, door proportions and illumination remain unverified.',
            'Fixed-normal pre-intrusion phase is preserved: no pit, barbed wire, Alessa bed, bodies, blood, 2012 sanctuary or game-chapel imagery. No new hazard or transformation is implemented.',
        ],
    },
]


def inspect_asset(spec, suffix, layer):
    receipt = json.loads((HERE / f"{spec['id']}.{suffix}.receipt.json").read_text())
    path = HERE / 'png' / f"{spec['id']}.{suffix}.png"
    if not path.exists():
        path = ROOT / receipt['finalAssetPath']
    raw = path.read_bytes()
    if Path(receipt['originalOutput']).exists():
        assert raw == Path(receipt['originalOutput']).read_bytes(), path
    if receipt.get('sha256'):
        assert sha(raw) == receipt['sha256'], path
    im = Image.open(path)
    assert im.format == 'PNG' and im.size == (1672, 941), path
    assert getattr(im, 'n_frames', 1) == 1
    rgba = im.convert('RGBA')
    alpha = rgba.getchannel('A')
    w, h = im.size
    hist = alpha.histogram()
    center = alpha.crop((round(w * .07), 0, round(w * .93), h))
    foot = alpha.crop((round(w * .07), round(h * .72), round(w * .93), round(h * .95)))
    if suffix == 'fg':
        assert im.mode == 'RGBA' and hist[0] / (w * h) > .93
        assert center.getextrema()[1] <= 1 and foot.getextrema()[1] <= 1
    else:
        assert alpha.getextrema() == (255, 255)
    digest = sha(raw)
    rel = f"assets/stages/{spec['id']}.{layer}.{digest[:12]}.png"
    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        assert dest.read_bytes() == raw
    else:
        os.link(path, dest)
    return {
        'stageId': spec['id'], 'promptKey': receipt['key'],
        'role': 'opaque-background' if suffix == 'bg' else 'transparent-foreground',
        'originalOutput': receipt['originalOutput'], 'localPath': str(dest),
        'path': rel, 'width': w, 'height': h, 'mode': im.mode,
        'bytes': len(raw), 'sha256': digest, 'pixelSHA256': sha(rgba.tobytes()),
        'alphaRange': list(alpha.getextrema()),
        'qa': {
            'fullyTransparentFraction': hist[0] / (w * h),
            'centerAlphaMax': center.getextrema()[1],
            'footBandAlphaMax': foot.getextrema()[1],
            'centerPixelsAboveAlpha2': sum(center.histogram()[3:]),
            'nativeTraceAlphaPreserved': True,
        },
        'visualInspection': 'completed-native-plate-only',
        'visualNotes': 'Eight native outputs visually inspected: empty environments, correct intended state, one plane per file, foreground confined to edges. No in-engine test claimed.',
        'preservation': 'Original PNG bytes, unchanged. Hardlink preserves source bytes; no crop, resize, recolor, alpha repair or re-encoding.',
        'pixels': {'nativeGeneratedBytesPreserved': True, 'postprocessing': False, 'certified1to1': False, 'certifiedUHD': False},
    }


def main():
    definitions = {s['id']: s for s in json.loads((ROOT / 'data/stages.json').read_text())}
    assets, stages = [], []
    for spec in SPECS:
        definition = definitions[spec['id']]
        assert not definition['reference']['blocked']
        layers = []
        for suffix, layer, parallax in [('bg', spec['layer'], 0), ('fg', 'near-edges', .006)]:
            asset = inspect_asset(spec, suffix, layer)
            assets.append(asset)
            layers.append({
                'id': layer, 'rect': [0, 0, 1, 1], 'fit': 'cover',
                'ticksPerFrame': 1, 'loop': False, 'parallaxX': parallax,
                'frames': [{k: asset[k] for k in ['path', 'sha256', 'bytes', 'width', 'height']}],
            })
        stages.append({
            'stageId': spec['id'], 'source': definition['source'],
            'status': 'integrated-candidate', 'fidelity': 'unverified',
            'origin': 'conversation-image-generation', 'mode': 'replace',
            'scene': spec['scene'], 'runtimeSceneId': definition['referencePolicy'].get('sceneId'),
            'geometry': {'ceiling': spec['ceiling']},
            'referenceIds': definition['reference']['referenceIds'],
            'worldState': definition['referencePolicy']['worldState'],
            'edition': spec['edition'], 'locationScope': spec['scope'],
            'selectedSubLocation': spec['scope'], 'layers': layers,
            'notes': spec['notes'] + ['One independent opaque background and one transparent parallax foreground. Both static; no animation, collision or rules changes.'] + ([spec['supportNote']] if spec.get('supportNote') else []),
            'supports': {'groundLineY': .87, 'runtimeChange': False},
            'safeAreas': {'normalizedCoordinates': True, 'combatFooting': [.07, .72, .86, .23], 'centerClear': [.07, 0, .86, 1], 'note': 'No foreground pixels above alpha1 in center or footing; native alpha1 traces preserved.'},
        })
    output = {
        'schemaVersion': 1, 'group': 'vague29-stages',
        'scope': 'Four missing static stages; eight independent native PNG planes',
        'createdAt': datetime.now(timezone.utc).isoformat(),
        'baseCommit': '2af87b6a1a8740a0759ce7c8c2746be19c48f4af',
        'deliveryState': 'ready-for-root-integration', 'stages': stages, 'assets': assets,
        'references': json.loads((HERE / 'references/sources.json').read_text()),
        'prompts': [json.loads(p.read_text()) for p in sorted(HERE.glob('*.prompt.json'))],
        'visualQA': {'kind': 'native-plate-inspection-only', 'allEightGeneratedPlatesInspected': True, 'notAnInEngineTest': True, 'noPixelPostprocessing': True, 'oneToOneCertified': False},
        'sourceReviewPath': 'docs/production/vague29/stages/source-review.json',
    }
    (HERE / 'source-review.json').write_text(json.dumps({'date': '2026-11-25', 'stages': SPECS, 'method': 'Retrieved and inspected actual gameplay/film frames and original environment art; no fidelity certification.'}, ensure_ascii=False, indent=2) + '\n')
    (HERE / 'integration-delivery.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'stages': len(stages), 'png': len(assets), 'bytes': sum(a['bytes'] for a in assets), 'foregroundQA': [{k:a[k] for k in ['stageId','qa']} for a in assets if a['role']=='transparent-foreground']}, indent=2))


if __name__ == '__main__':
    main()
