"""Record the six native stage PNGs without pixel edits or registry mutation."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sha = lambda data: hashlib.sha256(data).hexdigest()

SPECS = [{'id': 'final_sacrament',
  'layer': 'bg-final-chamber',
  'scene': 'sh4-final-sacraments-stone-perimeter',
  'ceiling': True,
  'scope': 'Final sacrament chamber beneath Room 302, empty stone perimeter and central ritual basin',
  'edition': 'Silent Hill 4: The Room (2004), puzzle screenshot and actual public gameplay recording at 30:20 '
             'and 34:00',
  'notes': ['The source screenshot and exact final-chamber gameplay establish cracked gray stone, a circular '
            'red basin, rounded-top ritual stelae, gray supports, a shallow ribbed dome and a circular oculus.',
            'The red human images on the rear stelae are static painted motifs from the observed monuments. '
            'Henry, Walter, Eileen and the Conjurer are all excluded from this environment plate.',
            'The tangent camera and broadened foreground stone walkway are authored fighting-view adaptations. '
            'Stela count and repeated painted motif, dome curvature, oculus size, full room diameter and '
            'reduced/cropped ring mechanism remain unverified; this does not certify the original mesh or '
            'original ritual layout.',
            'The basin and inert ring mechanism stay behind the clear footing. No narrative progression, '
            'actor, moving ritual, new collision or hazard is implemented.']},
 {'id': 'scarlet_chamber',
  'layer': 'bg-hell-descent-arena',
  'scene': 'homecoming-hell-descent-scarlet-arena',
  'ceiling': True,
  'scope': 'Actual Scarlet arena at the bottom of Hell Descent, empty industrial room',
  'edition': 'Silent Hill: Homecoming (2008), actual public gameplay recording at 2:41:40, 2:45:40 and 2:46:10',
  'notes': ['The selected frames show the actual Scarlet arena: rust-dark metal floor/grating, low amber '
            'light, rectangular grid shadows and rear metal rail sections with angular braces.',
            'The historical lot9 images sh5_screen_137.jpg and sh5_screen_138.jpg depict Sepulcher, not '
            'Scarlet; the earlier dossier already records that limitation. They are excluded. No hanging '
            'ceiling cables are inferred from that misattribution.',
            'The side-on full wall span, regularized rail spacing, widened floor, exact grate dimensions and '
            'lighting arrangement are authored adaptations from 320×180 gameplay frames and remain unverified.',
            'No Alex, Fitch, Scarlet, doll fragment, hanging organic sack, mirror, cable effect or invented '
            'machine is baked into the background. Existing gameplay and reference policy remain untouched.']},
 {'id': 'arcade_hospital_roof',
  'layer': 'bg-normal-fog-roof',
  'scene': 'arcade-brookhaven-roof-normal-fog',
  'ceiling': False,
  'scope': 'Brookhaven Hospital roof, Arcade Stage 1 Area 3, normal gray-fog phase around Tuberculosis',
  'edition': 'Silent Hill: The Arcade (2007), actual public boss recording at 3:30 and 5:50; 2007 screenshot '
             'gallery for fence structure only',
  'notes': ['The gray phase gameplay frames establish the actual square rooftop slabs, low concrete boundary '
            'and chain-link fence. The 2007 roof screenshot supplies the rectangular fence bays and '
            'inward-angled top panels only.',
            'The orange boss-presentation color is intentionally excluded from the selected fixed-normal '
            'gray-fog phase. The 2010.02.21 gallery image 08 was rejected because its on-screen label '
            'identifies Stage 3 Area 1 Toluca Lake, not this roof.',
            'The lateral camera, regularized fence spacing, continuous intact walking strip and clipped '
            'access-room facade are authored adaptations. Whole-roof geometry, tile sizes and exact fence bay '
            'count remain unverified.',
            'No Eric, Tina, Emilie, Tuberculosis, dead creature, cone, rooftop hole, collapse, orange '
            'transition or new weather/hazard event is embedded in the art.']}]


def inspect_asset(spec, suffix, layer_id, receipt):
    name = spec['id'] + ('.bg.png' if suffix == 'bg' else '.near-edges.png')
    path = HERE / 'png' / name
    raw = path.read_bytes()
    assert raw == Path(receipt['originalOutput']).read_bytes(), 'Native image bytes changed'
    im = Image.open(path)
    assert im.size == (1672, 941), im.size
    rgba = im.convert('RGBA')
    alpha = rgba.getchannel('A')
    hist = alpha.histogram()
    width, height = im.size
    total = width * height
    center = alpha.crop((round(width * .07), 0, round(width * .93), height))
    footing = alpha.crop((round(width * .07), round(height * .72), round(width * .93), round(height * .95)))
    if suffix == 'fg':
        assert im.mode == 'RGBA'
        assert hist[0] / total > .93
        assert center.getextrema()[1] <= 1
        assert footing.getextrema()[1] <= 1
    else:
        assert alpha.getextrema() == (255, 255)
    digest = sha(raw)
    return {
        'stageId': spec['id'], 'promptKey': receipt['key'],
        'role': 'opaque-background' if suffix == 'bg' else 'transparent-foreground',
        'filename': name, 'originalOutput': receipt['originalOutput'],
        'localPath': str(path),
        'path': f"assets/stages/{spec['id']}.{layer_id}.{digest[:12]}.png",
        'width': width, 'height': height, 'mode': im.mode,
        'bytes': len(raw), 'sha256': digest, 'pixelSHA256': sha(rgba.tobytes()),
        'alphaRange': list(alpha.getextrema()),
        'qa': {
            'fullyTransparentFraction': hist[0] / total,
            'semiTransparentPixels': sum(hist[1:255]),
            'opaqueFraction': hist[255] / total,
            'centerAlphaMax': center.getextrema()[1],
            'footBandAlphaMax': footing.getextrema()[1],
            'nonzeroAlphaInCenter': sum(center.histogram()[1:]),
            'centerPixelsAboveAlpha2': sum(center.histogram()[3:]),
            'nativeTraceAlphaPreserved': True,
        },
        'visualInspection': 'completed-native-plate-only',
        'visualNotes': 'Single empty side-on plate or sparse matching edge overlay inspected. Any central alpha-1 traces are retained exactly as generated. Runtime QA belongs to root integration.',
        'preservation': 'Native imagegen PNG copied byte-for-byte; no crop, resize, recolor, alpha edit or recompression',
        'pixels': {'nativeGeneratedBytesPreserved': True, 'postprocessing': False, 'certified1to1': False, 'certifiedUHD': False},
    }


def main():
    definitions = {entry['id']: entry for entry in json.loads((ROOT / 'data/stages.json').read_text())}
    receipts = []
    prompts = []
    for plane in ['background', 'foreground']:
        receipts.extend(json.loads((HERE / f'generation-results-{plane}.json').read_text()))
        prompts.extend(json.loads((HERE / f'prompts-{plane}.json').read_text()))
    receipts_by_key = {item['key']: item for item in receipts}
    assets = []
    stages = []
    for spec in SPECS:
        definition = definitions[spec['id']]
        assert not definition['reference']['blocked']
        layers = []
        for suffix, layer_id, parallax in [('bg', spec['layer'], 0), ('fg', 'near-edges', .006)]:
            key = f"{spec['id']}-{suffix}-wave28"
            asset = inspect_asset(spec, suffix, layer_id, receipts_by_key[key])
            assets.append(asset)
            layers.append({
                'id': layer_id, 'rect': [0, 0, 1, 1], 'fit': 'cover',
                'ticksPerFrame': 1, 'loop': False, 'parallaxX': parallax,
                'frames': [{key: asset[key] for key in ['path', 'sha256', 'bytes', 'width', 'height']}],
            })
        stages.append({
            'stageId': spec['id'], 'source': definition['source'],
            'status': 'integrated-candidate', 'fidelity': 'unverified',
            'origin': 'conversation-image-generation', 'mode': 'replace',
            'scene': spec['scene'], 'runtimeSceneId': definition['referencePolicy'].get('sceneId'),
            'geometry': {'ceiling': spec['ceiling']},
            'referenceIds': definition['reference']['referenceIds'],
            'worldState': definition['referencePolicy']['worldState'],
            'edition': spec['edition'], 'locationScope': spec['scope'], 'selectedSubLocation': spec['scope'],
            'layers': layers,
            'notes': spec['notes'] + ['One opaque static background and one independent transparent edge foreground. No animated clip, source cadence, collision or gameplay change. In-engine QA is deferred to root integration.'],
            'supports': {'groundLineY': .87, 'runtimeChange': False},
            'safeAreas': {
                'normalizedCoordinates': True,
                'combatFooting': [.07, .72, .86, .23],
                'centerClear': [.07, 0, .86, 1],
                'note': 'Visible overlay absent from the central 86 percent; native alpha-1 traces are measured and retained. Artwork audit only, no collision change.',
            },
        })
    output = {
        'schemaVersion': 1, 'group': 'vague28-stages',
        'scope': 'Three missing static stage candidates; six independent native planes only',
        'createdAt': datetime.now(timezone.utc).isoformat(),
        'baseCommit': '0e05c91fae9f761f6ce87c0a7915fed0763dea21',
        'deliveryState': 'ready-for-root-integration',
        'stages': stages, 'assets': assets,
        'references': json.loads((HERE / 'references/sources.json').read_text()),
        'prompts': prompts,
        'visualQA': {
            'kind': 'native-plate-inspection-only', 'allSixGeneratedPlatesInspected': True,
            'notAnInEngineTest': True, 'noPixelPostprocessing': True,
            'oneToOneCertified': False,
        },
        'sourceReviewPath': 'docs/production/vague28/stages/source-review.json',
    }
    target = HERE / 'integration-delivery.json'
    if target.exists():
        raise SystemExit('Preserve the existing delivery; choose a distinct revision explicitly.')
    target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'delivery': str(target), 'stages': len(stages), 'assets': len(assets), 'bytes': sum(asset['bytes'] for asset in assets), 'foregroundQA': [{'stageId': asset['stageId'], **asset['qa']} for asset in assets if asset['role'] == 'transparent-foreground']}, indent=2))


if __name__ == '__main__':
    main()
