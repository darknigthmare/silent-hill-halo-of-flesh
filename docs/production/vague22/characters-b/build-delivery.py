from pathlib import Path
from PIL import Image
import os, json, hashlib, datetime

ROOT = Path(__file__).parent
REPO = Path('/workspace/scratch/silent-hill-wave22')
registry = json.loads((REPO / 'art/registry.json').read_text())['assets']
roster = {}
def index_roster(v):
    if isinstance(v, dict):
        if 'id' in v and 'reference' in v: roster[v['id']] = v
        for x in v.values(): index_roster(x)
    elif isinstance(v, list):
        for x in v: index_roster(x)
index_roster(json.loads((REPO / 'data/roster.json').read_text()))
configs = json.loads((ROOT / 'generation-config.json').read_text())
refs = {r['id']: r for r in json.loads((ROOT / 'references/manifest.json').read_text())}
selected, pending, assets = [], [], []
for c in configs:
    ident = c['task']['id']
    src = Path(c['generatedPath'])
    dst = ROOT / ('sprites' if c['approved'] else 'variants') / c['filename']
    dst.parent.mkdir(exist_ok=True)
    if not dst.exists(): os.link(src, dst)
    binary = dst.read_bytes()
    sha = hashlib.sha256(binary).hexdigest()
    im = Image.open(dst)
    assert im.mode == 'RGBA' and im.format == 'PNG'
    alpha = im.getchannel('A')
    hist = alpha.histogram()
    bounds = {str(t): list(alpha.point(lambda x: 255 if x >= t else 0).getbbox()) for t in [1, 8, 32, 128]}
    b = bounds['32']; w, h = im.size
    calibration = {'anchor': [c['anchorX'], round(b[3] / h, 8)], 'bodyHeight': round((b[3] - b[1]) / h, 8), 'definition': 'Approximate authored support axis; alpha32 exclusive lower baseline. Includes head/crown and complete supports. Native Canvas review required; not a measured source scale.'}
    row = {
        'fighterId': ident, 'source': c['source'], 'edition': 'Silent Hill: Book of Memories (PS Vita, 2012)' if c['source'] == 'bom' else 'Silent Hill: The Short Message (2024)',
        'file': str(dst), 'localPath': str(dst), 'candidate': c['filename'],
        'path': 'assets/sprites/' + ident + '.' + sha[:12] + '.png',
        'status': 'side-view-candidate' if c['approved'] else 'withheld-pending-visual-correction',
        'fidelity': 'unverified', 'facing': 1, 'pose': 'idle', 'animated': False,
        'dimensions': [w, h], 'width': w, 'height': h, 'bytes': len(binary), 'sha256': sha,
        'sourceSHA256': sha, 'pixelSHA256': hashlib.sha256(im.tobytes()).hexdigest(),
        'alphaBounds': bounds, 'visibleBounds': b, 'framingBounds': bounds['8'],
        'transparentFraction': round(hist[0] / (w*h), 8), 'alphaExtrema': alpha.getextrema(),
        'minimumReadablePaddingFraction': round(min(b[0]/w, b[1]/h, (w-b[2])/w, (h-b[3])/h), 8),
        'calibrationProposal': calibration, 'anchor': calibration['anchor'], 'bodyHeight': calibration['bodyHeight'],
        'selectionPortraitPreserved': registry[ident].get('portrait'),
        'existingAnimatedClipCount': registry[ident].get('animatedClips', 0),
        'portraitAction': 'preserve-existing', 'clipAction': 'preserve-existing-clips', 'roleAction': 'preserve-existing-runtime-role',
        'purpose': 'combat', 'view': 'side-view', 'singleSubjectReviewed': True, 'wholeSubjectReviewed': True,
        'review': c['review'], 'limits': c['limits'] + ' One static drawing. Native generated pixels unchanged; no resize, crop, alpha painting or other pixel processing. Very low alpha noise can extend beyond readable bounds.',
        'referenceIds': roster.get(ident, {}).get('reference', {}).get('referenceIds', c['referenceIds']), 'references': [refs[n] for n in c['referenceNames']],
        'runtimeRole': roster.get(ident, {}).get('reference', {}).get('combatRole'),
        'usageRestriction': 'Sakura Head remains a scripted pursuer outside autonomous duels. This new lateral presentation frame must not enable combat.' if ident == 'shortmessage_sakura_head_150' else 'Preserve existing role and rules; this image adds no new attacks or movement.',
        'prompt': c['task']['prompt'], 'tool': 'image_gen__imagegen', 'rawPixelsUnchanged': True,
        'nativeRuntimeQA': 'pending-parent-integration', 'certifiedOneToOne': False,
    }
    (selected if c['approved'] else pending).append(row)
    if c['approved']: assets.append({k:row[k] for k in ['fighterId','source','localPath','path','sha256','bytes','width','height','facing','anchor','bodyHeight','visibleBounds','purpose','view']})
delivery = {
    'schema': 1, 'wave': 22, 'group': 'fighters-b', 'generatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'basePublishedCommit': '80db2a9fdda7032bcaf110df79915be598290f08',
    'selected': selected, 'fighters': selected, 'assets': assets, 'pending': pending,
    'rawPixelsUnchanged': True, 'newAnimatedClips': 0, 'newPortraits': 0,
    'certifiedOneToOne': 0, 'repoModified': False,
    'scope': 'Distinct static combat presentation views. Existing portraits, runtime roles and animated clips are preserved. No new fighter IDs or behavior changes.',
    'notes': ['Pending variants must not be integrated. Native Canvas verification is performed by the parent after import.', 'Portrait concept/model and licensed sculpture are differentiated in per-asset provenance. No 1:1 fidelity certification.'],
}
(ROOT / 'delivery.json').write_text(json.dumps(delivery, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'raster-audit.json').write_text(json.dumps({'schema':1, 'selected':[{k:r[k] for k in ['fighterId','sha256','bytes','dimensions','alphaBounds','transparentFraction','alphaExtrema','minimumReadablePaddingFraction','calibrationProposal']} for r in selected], 'pendingCount':len(pending)}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'selected':[{'id':r['fighterId'],'sha256':r['sha256'],'bounds':r['visibleBounds'],'anchor':r['anchor'],'bodyHeight':r['bodyHeight']} for r in selected], 'pending':[r['fighterId'] for r in pending]}, ensure_ascii=False))
