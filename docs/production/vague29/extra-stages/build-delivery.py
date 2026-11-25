"""Record native Arcade hospital planes; no pixel transformation."""
from pathlib import Path
from PIL import Image
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
stage = next(s for s in json.loads((ROOT / 'data/stages.json').read_text()) if s['id'] == 'arcade_hospital')
assert not stage['reference']['blocked']
assets, layers = [], []
for suffix, layer_id, parallax, receipt in [
    ('bg', 'bg-normal-corridor', 0, 'background-receipt.json'),
    ('fg', 'near-door-jambs', .006, 'foreground-receipt.json'),
]:
    path = HERE / f'png/arcade_hospital.{suffix}.png'
    raw = path.read_bytes()
    original = json.loads((HERE / receipt).read_text())
    assert raw == Path(original['originalOutput']).read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    im = Image.open(path)
    assert im.format == 'PNG' and getattr(im, 'n_frames', 1) == 1
    alpha = im.convert('RGBA').getchannel('A')
    center = alpha.crop((round(im.width * .07), 0, round(im.width * .93), im.height))
    hist = alpha.histogram()
    if suffix == 'fg':
        assert im.mode == 'RGBA' and hist[0] / (im.width * im.height) > .88
        assert center.getextrema()[1] <= 1
    else:
        assert alpha.getextrema() == (255, 255)
    frame = dict(path=f'assets/stages/arcade_hospital.{layer_id}.{digest[:12]}.png',
                 sha256=digest, bytes=len(raw), width=im.width, height=im.height)
    assets.append(dict(**frame, stageId=stage['id'], localPath=str(path),
                       originalOutput=original['originalOutput'], pixelsModified=False,
                       transparentFraction=hist[0] / (im.width * im.height),
                       centerAlphaMax=center.getextrema()[1]))
    layers.append(dict(id=layer_id, rect=[0, 0, 1, 1], fit='cover',
                       ticksPerFrame=1, loop=False, parallaxX=parallax, frames=[frame]))
notes = [
    'Original 2007 Arcade hospital screenshots sh_arcade_04.jpg and sh_arcade_19.jpg establish the normal corridor: worn gray-cream plaster, dark lower wall panels, wooden door trim, green-gray doorways and mottled square floor tiles.',
    'The lateral wall span, two door openings, closed door, wall vent, ceiling light and continuous widened fighting lane are authored extensions. Room dimensions, exact doorway count, lighting placement and tile geometry are not measured from the original game.',
    'The normal corridor remains separate from the orange Otherworld fan room. No nurses, actors, weapons, UI, hazards or automatic transformations are baked into either plane.',
    'Native background is 1672 by 941 and native foreground is 1671 by 941; each uses its actual dimensions with cover fit. No resizing, recoloring, crop or alpha cleanup was applied. Trace alpha 1 pixels in the clear foreground center are preserved.',
    'One opaque background and one independent transparent foreground; static candidates, not an animation or a 1:1 certification.',
]
delivery = dict(schema=1, wave=29, stages=[dict(
    stageId=stage['id'], source=stage['source'], status='integrated-candidate',
    fidelity='unverified', origin='conversation-image-generation', mode='replace',
    scene='arcade-brookhaven-normal-corridor', geometry={'ceiling': True},
    referenceIds=stage['reference']['referenceIds'], layers=layers, notes=notes,
)], assets=assets)
(HERE / 'integration-delivery.json').write_text(json.dumps(delivery, ensure_ascii=False, indent=2) + '\n')
sources = [dict(
    filename=name, url='https://www.silenthillmemories.net/sh_arcade/screens/pics/' + name,
    sourcePage='https://www.silenthillmemories.net/sh_arcade/screens_en.htm',
    edition='Silent Hill: The Arcade (2007)', role='Archived original gameplay screenshot',
    sha256=hashlib.sha256((HERE / 'references' / name).read_bytes()).hexdigest(),
    inspected=True,
) for name in ['sh_arcade_04.jpg', 'sh_arcade_19.jpg']]
(HERE / 'source-review.json').write_text(json.dumps(dict(stageId=stage['id'], sources=sources,
    observations=notes, fidelity='unverified', nativeGeneratedBytesPreserved=True), ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(stages=1, png=len(assets), dimensions=[[a['width'], a['height']] for a in assets])))
