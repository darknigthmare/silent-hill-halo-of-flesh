import json
import hashlib
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('/workspace/scratch/halo-wave22-fighters-a')

def read(name):
    return json.loads((BASE / name).read_text())

def write(name, data):
    path = BASE / name
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return hashlib.sha256(path.read_bytes()).hexdigest()

audits = {x['id']: x for x in read('raster-audit-batch4.json')['records']}
jobs = {x['id']: x for x in read('prompts-batch4.json')['jobs']}
prior = {x['id']: x for x in read('runtime-reference-audit.json')}
downloads = read('reference-downloads-3.json')['records']
specific = {
    'sh2_twin_pyramid_heads_031': {
        'edition': 'Silent Hill 2 original (2001), Lakeview Hotel final duo encounter',
        'composition': 'canonical-encounter-duo',
        'subjectCount': 2,
        'singleSubjectReviewed': False,
        'singleCollectiveProfileReviewed': True,
        'engineProfileCount': 1,
        'newEngineProfiles': 0,
        'phase': 'Two original Pyramid Heads with spears, neutral encounter composition',
        'anchor': [0.44, 996 / 1024],
        'bodyHeight': 960 / 1024,
        'anchorDefinition': 'Presentation axis between the two pelvis/support axes, independent of spear length; lowest front boot is the support baseline. Body height uses highest front helmet to lowest boot. One collective runtime profile, not two autonomous actors.',
        'review': 'Deux corps distincts orientés à droite ; deux casques originaux pointus, quatre bottes, quatre bras et deux lances entières. Les pointes et les talons des deux armes restent dans le PNG. Alpha réel et intervalles entre les membres contrôlés sur damier ; aucun halo visible dans la composition.',
        'limits': 'Un seul profil moteur collectif, deux corps dans une image ; aucun deuxième acteur autonome ajouté. Pose, côtés cachés, talons et pointes recomposés depuis des vues natives partielles et le modèle de base. La figure arrière est légèrement plus petite et plus haute dans la profondeur représentée ; ce décalage ne mesure pas le plan de sol canonique. Marge alpha32 minimale 28 px, soit 2,73 % de la hauteur : le prompt demandait 8 %, non obtenus, sans extrémité coupée. Aucune animation, synchronisation des deux corps ou fidélité 1:1 certifiée.',
    },
    'sh4_one_truth_070': {
        'edition': 'Silent Hill 4: The Room original (2004)',
        'composition': 'single-real-wall-target',
        'subjectCount': 1,
        'singleSubjectReviewed': True,
        'engineProfileCount': 1,
        'newEngineProfiles': 0,
        'phase': 'One attached Giant Wall Man target with its bordering membrane/support',
        'anchor': [0.42, 1397 / 1424],
        'bodyHeight': 1371 / 1424,
        'anchorDefinition': 'Stationary wall-support axis, independent of the four reaching arms; lower own border is the presentation baseline. Body height includes the whole attached assembly from head to bottom border, preserving the existing assembly-height convention. This is not a walking foot anchor or a measured rail position.',
        'review': 'Une cible attachée, tête et torse vers la droite avec léger trois-quarts pour rendre les quatre bras lisibles. Quatre mains et bordure du support entières ; aucun pied ou corps inférieur inventé. La composition sur damier montre une vraie découpe transparente autour de l’assemblage, sans rectangle de fond ni halo.',
        'limits': 'Le rendu source entier mesure 197×254 px et la capture de salle 250×176 px. La profondeur du cadre et le côté caché sont reconstruits, pas relevés sur modèle 3D ; le support complet de la salle et son rail ne sont pas livrés. Une seule cible représentée, pas les douze Wall Men ni leur puzzle. Marge alpha32 minimale 26 px, soit 1,83 % de la hauteur : le prompt demandait 8 %, non obtenus, mais les quatre mains et tout le bord restent visibles. canMove/canJump/canDodge restent false ; aucune animation du rail ou fidélité 1:1 certifiée.',
    },
}

selected = []
for id_, s in specific.items():
    a, j, p = audits[id_], jobs[id_], prior[id_]
    policy = p['referencePolicy']
    references = [r for r in downloads if r['id'] == id_ and r.get('status') == 200]
    ref_files = j['references']
    for path in ref_files:
        match = next(r for r in references if r['localPath'] == path)
        assert hashlib.sha256(Path(path).read_bytes()).hexdigest() == match['sha256']
    assert hashlib.sha256(Path(a['localPath']).read_bytes()).hexdigest() == a['sha256']
    assert p['sprite']['animatedClips'] == 0
    assert policy['combatEnabled'] is True
    entry = {
        'fighterId': id_, 'id': id_, 'source': j['source'], 'edition': s['edition'],
        'file': a['localPath'], 'localPath': a['localPath'],
        'candidate': Path(a['localPath']).name,
        'path': 'assets/sprites/' + Path(a['localPath']).name,
        'selectionPortraitPreserved': p['sprite']['portrait']['path'],
        'previousFramePreservedAsPortrait': True,
        'classification': 'dedicated-combat-lateral-view',
        'status': 'lateral-view-candidate',
        'combatEligible': True, 'combatEnabled': policy['combatEnabled'],
        'combatRole': policy['role'],
        'canMove': policy['canMove'], 'canJump': policy['canJump'], 'canDodge': policy['canDodge'],
        'runtimePolicyUnchanged': True,
        'composition': s['composition'], 'subjectCount': s['subjectCount'],
        'engineProfileCount': s['engineProfileCount'], 'newEngineProfiles': 0,
        'fidelity': 'unverified', 'certifiedOneToOne': False,
        'facing': 1, 'pose': 'neutral', 'phase': s['phase'],
        'animated': False, 'existingAnimatedClips': 0,
        'clipsProposal': {'idle': {'frames': [0], 'ticksPerFrame': 1, 'loop': False}},
        'dimensions': [a['width'], a['height']],
        **{k: a[k] for k in ['width', 'height', 'bytes', 'sha256', 'pixelSHA256', 'alphaBounds', 'transparentFraction', 'alphaExtrema', 'edgeAlphaMax']},
        'visibleBounds': a['alphaBounds']['32'], 'framingBounds': a['alphaBounds']['8'],
        'alphaThreshold': 32,
        'calibrationProposal': {'anchor': s['anchor'], 'bodyHeight': s['bodyHeight'], 'definition': s['anchorDefinition']},
        'anchor': s['anchor'], 'bodyHeight': s['bodyHeight'],
        'singleSubjectReviewed': s['singleSubjectReviewed'],
        'wholeSubjectReviewed': True,
        'review': s['review'], 'limits': s['limits'],
        'prompt': j['prompt'], 'referenceFiles': ref_files,
        'referenceUrls': [r['url'] for r in references], 'references': references,
        'historicalReview': read('prompts-batch4.json')['priorHistoryReview'],
        'tool': 'image_gen__imagegen', 'generationPath': a['generationPath'],
        'alphaCompositionPreview': str(BASE / 'qa' / (id_ + '-composite.png')),
    }
    if 'singleCollectiveProfileReviewed' in s:
        entry['singleCollectiveProfileReviewed'] = s['singleCollectiveProfileReviewed']
    selected.append(entry)

current = read('delivery.json')
part = {k: deepcopy(v) for k, v in current.items() if k not in ['selected', 'assets', 'variants', 'pending', 'generationCalls', 'trueMissingIdentityAdditions', 'combatEligibleViews', 'noncombatReferenceViews']}
part.update({
    'generatedAt': datetime.now(timezone.utc).isoformat(),
    'deliveryStatus': 'closed-subset-4-extensions', 'activePngs': 2,
    'combatEligibleViews': 2, 'noncombatReferenceViews': 0,
    'trueMissingIdentityAdditions': 0, 'generationCalls': 2,
    'selected': selected,
    'assets': [{k: e[k] for k in ['id', 'localPath', 'path', 'sha256', 'bytes', 'width', 'height']} | {'role': 'fighter-side-view'} for e in selected],
})
part_hash = write('delivery-part4.json', part)
assert len(current['selected']) == 8
assert not set(specific).intersection(e['id'] for e in current['selected'])
current['selected'].extend(selected)
current['assets'].extend(part['assets'])
current.update({
    'generatedAt': part['generatedAt'], 'deliveryStatus': 'ten-profiles-delivered-awaiting-native-extension-review',
    'activePngs': 10, 'combatEligibleViews': 7, 'noncombatReferenceViews': 3,
    'generationCalls': 12,
    'frozenEight': {
        'path': str(BASE / 'delivery-final-provisional-eight.json'),
        'sha256': hashlib.sha256((BASE / 'delivery-final-provisional-eight.json').read_bytes()).hexdigest(),
    },
})
current_hash = write('delivery.json', current)
print(json.dumps({'part4': str(BASE / 'delivery-part4.json'), 'part4SHA256': part_hash, 'deliverySHA256': current_hash, 'activePngs': 10, 'combatEligibleViews': 7, 'noncombatReferenceViews': 3, 'frozenEightSHA256': current['frozenEight']['sha256']}, indent=2))
