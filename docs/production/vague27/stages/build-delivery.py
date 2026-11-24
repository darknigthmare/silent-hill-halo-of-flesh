"""Record the six native stage PNGs without pixel edits or registry mutation."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sha = lambda data: hashlib.sha256(data).hexdigest()

SPECS = [
    {
        'id': 'police_station_hc',
        'layer': 'bg-closed-police-cell',
        'scene': 'homecoming-police-first-cell-closed',
        'ceiling': True,
        'scope': 'Shepherd’s Glen Police Station, Alex’s first closed cell before release by Wheeler',
        'edition': 'Silent Hill: Homecoming (2008), actual public HD gameplay capture, 1:47:30 and 1:48:30–1:48:40',
        'notes': [
            'Exact sub-location checked in actual Homecoming gameplay: the first closed police cell, before Wheeler releases Alex. No hospital or Overlook prison is substituted.',
            'The historical lot9 URL sh5_screen_060.jpg was inspected and rejected: it shows Joshua behind bars and Alex in a hospital gown in the opening hospital, not the police cell. See source-review.json.',
            'The gray steel barred enclosure, worn gray-green walls, closed gate and damaged concrete follow the captured cell. The lateral camera, complete wall span, regularized gate proportions and expanded clear floor are authored adaptations from 320×180 source frames.',
            'No Alex, Wheeler, weapon, flashlight beam, Schism, released/open cell door, blood or new hazard is baked into the art.'
        ],
    },
    {
        'id': 'villa_rooftop',
        'layer': 'bg-first-visit-mural',
        'scene': 'tsm-villa-rooftop-first-visit-fog',
        'ceiling': False,
        'scope': 'Kettenstadt Villa rooftop, first visit in blue-green fog, Maya’s mural and memorial',
        'edition': 'Silent Hill: The Short Message (2024 PS5), actual public gameplay/cutscene capture, 21:40, 21:50 and 22:40',
        'notes': [
            'The first rooftop visit in fog supplies the mural, memorial flowers, concrete wall, parapet and restrained metal railing. The later clear-sky ending is not used as the selected phase.',
            'The painted human motif belongs to Maya’s wall mural. It is static artwork, not a living actor or an additional combatant. Anita, the phone and subtitles are absent.',
            'The wall painting, roof proportions, flower arrangement, lighting and newly widened side-on camera remain authored interpretations of 320×180 source frames; mural brushwork and full roof geometry are not certified 1:1.',
            'The foreground has no open drop, jump sequence, body, automatic lethal finisher, lightning or petal storm. Existing narrative-only safety policy and fixed-normal fog phase remain unchanged.'
        ],
    },
    {
        'id': 'villa_stairwell',
        'layer': 'bg-rooftop-access-stairs',
        'scene': 'tsm-villa-rooftop-access-stairwell',
        'ceiling': True,
        'scope': 'Kettenstadt Villa normal concrete stairwell to the rooftop immediately after the chase exit',
        'edition': 'Silent Hill: The Short Message (2024 PS5), actual public chase clips, Chase 2 at 50–51 s and Chase 4 at 100 s',
        'notes': [
            'Source frames isolate the ordinary gray-green concrete stair chamber beyond the Otherworld maze doorway: straight worn steps, two-tone teal walls, thin wall rail, low ceiling and paneled roof-access door.',
            'Paper-covered maze walls, chain-link gates and the phone seen before the doorway are excluded. No monster or pursuit animation is baked into the normal stairwell.',
            'The source camera looks up the stairs. This plate deliberately adapts it to a lateral elevation with an expanded horizontal lower landing; step count, full side-wall profile, door size and hidden surfaces remain unverified.',
            'All steps and the rail remain behind the clear fighter floor. No new collision, falling hazard, door slam, moving shadow or automatic finisher is introduced.'
        ],
    },
]


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
            key = f"{spec['id']}-{suffix}-wave27"
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
        'schemaVersion': 1, 'group': 'vague27-stages',
        'scope': 'Three missing static stage candidates; six independent native planes only',
        'createdAt': datetime.now(timezone.utc).isoformat(),
        'baseCommit': 'fbd109d39ac843620e6c0fde1284480bc51a66d3',
        'deliveryState': 'ready-for-root-integration',
        'stages': stages, 'assets': assets,
        'references': json.loads((HERE / 'references/sources.json').read_text()),
        'prompts': prompts,
        'visualQA': {
            'kind': 'native-plate-inspection-only', 'allSixGeneratedPlatesInspected': True,
            'notAnInEngineTest': True, 'noPixelPostprocessing': True,
            'oneToOneCertified': False,
        },
        'sourceReviewPath': 'docs/production/vague27/stages/source-review.json',
    }
    target = HERE / 'integration-delivery.json'
    if target.exists():
        raise SystemExit('Preserve the existing delivery; choose a distinct revision explicitly.')
    target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'delivery': str(target), 'stages': len(stages), 'assets': len(assets), 'bytes': sum(asset['bytes'] for asset in assets), 'foregroundQA': [{'stageId': asset['stageId'], **asset['qa']} for asset in assets if asset['role'] == 'transparent-foreground']}, indent=2))


if __name__ == '__main__':
    main()
