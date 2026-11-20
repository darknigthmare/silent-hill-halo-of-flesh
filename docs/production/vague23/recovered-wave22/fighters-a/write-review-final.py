import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('/workspace/scratch/halo-wave22-fighters-a')
REPO = Path('/workspace/scratch/silent-hill-wave22')

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def load(path):
    return json.loads(Path(path).read_text())

def write(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

manifest = BASE / 'delivery-final.json'
eight = BASE / 'native-visual-review-eight.json'
assert sha(manifest) == '5898318f882ca840c9a52d4da96be96811ccc5887db30630319fbbc452c0689f'
assert sha(eight) == 'a1db66d0453be4bc3ec71f255cb883b609e6f4c2e94b90038d6441e071e5f23e'
review = load(eight)
assert len(review['records']) == 8
observations = {
    'sh2_twin_pyramid_heads_031': [
        'Dans les deux orientations, les deux casques et les deux corps regardent vers l’adversaire. Quatre bottes et les deux lances, avec pointes et talons complets, restent visibles.',
        'Les silhouettes restent séparées ; aucune fusion en géant ou troisième corps. Le corps arrière est plus petit et son appui plus haut dans la profondeur représentée, conformément à la composition du PNG livré.',
        'Les quatre bottes restent dans la zone de sol ; aucun casque ou bout de lance coupé, aucun halo ou rectangle de fond, aucun recouvrement du HUD.',
        'Le moteur affiche un seul profil collectif. Cette capture ne démontre ni deux déplacements autonomes, ni une synchronisation d’animations, ni le sol canonique de la scène originale.',
    ],
    'sh4_one_truth_070': [
        'Une seule cible est visible avec la tête et le torse orientés vers l’adversaire. Les quatre bras et quatre mains demeurent lisibles dans les deux sens.',
        'La bordure supérieure, les deux montants et le bas du cadre restent entiers. Aucun pied, corps inférieur ou rail arrière ajouté par le rendu ; le bas du propre cadre forme la référence d’appui.',
        'L’assemblage reste séparé du HUD et des bords ; le décor apparaît autour des bras sans rectangle opaque extérieur ni halo.',
        'Il s’agit de la transposition stationnaire d’une cible attachée. Le cadre n’atteste pas un rail complet, les douze cibles ou leur puzzle. Le rapport natif confirme les restrictions de déplacement ; une capture fixe seule ne prouve pas une animation.',
    ],
}
expected_counts = {'sh2_twin_pyramid_heads_031': 64, 'sh4_one_truth_070': 74}
for id_, notes in observations.items():
    folder = REPO / 'docs/production/vague22/qa-native/cases' / id_
    report_path = folder / 'report.json'
    data = load(report_path)
    assert data['passed'] and data['browserTest'] is False
    assert len(data['checks']) == expected_counts[id_]
    assert all(c['passed'] for c in data['checks'])
    assert id_ in data['combatIds']
    capture_by_file = {c['file']: c for c in data['captures']}
    captures = []
    for side, facing in [('left', -1), ('right', 1)]:
        path = folder / (id_ + '-' + side + '-idle.png')
        recorded = capture_by_file[path.name]
        assert sha(path) == recorded['sha256']
        captures.append({'path': str(path), 'repositoryPath': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size, 'facing': facing, 'inspectedWith': 'view_image', 'purpose': 'native-duel-idle'})
    review['records'].append({'id': id_, 'status': 'reviewed-no-concrete-visual-defect', 'combatEligible': True, 'captures': captures, 'observations': notes, 'report': {'path': str(report_path), 'sha256': sha(report_path), 'passed': True, 'checkCount': len(data['checks']), 'browserTest': False}})
review.update({
    'reviewedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'ten-profiles-twenty-captures-reviewed',
    'method': 'Read-only visual inspection via view_image of fourteen native FightEngine Canvas duel captures for seven combat-eligible profiles and six native drawRasterMonster workshop captures for three reference-only Raw Shock profiles. No tests rerun and no asset pixels changed.',
    'reviewedProfiles': 10, 'reviewedCaptures': 20,
    'combatProfilesReviewed': 7, 'combatCapturesReviewed': 14,
    'noncombatReferenceProfilesReviewed': 3, 'noncombatReferenceCapturesReviewed': 6,
    'noncombatDuels': 0,
    'referencedCheckExecutions': sum(r['report']['checkCount'] for r in review['records']),
    'previousEightReview': {'path': str(eight), 'sha256': sha(eight)},
    'frozenAssetManifest': {'path': str(manifest), 'sha256': sha(manifest)},
    'supersedesPendingNativeReview': {'manifestState': 'eight-reviewed-two-extensions-pending', 'idsNowReviewed': list(observations)},
    'remaining': [], 'concreteVisualDefectsObserved': [],
})
assert review['referencedCheckExecutions'] == 586
assert sum(len(r['captures']) for r in review['records']) == 20
final = BASE / 'native-visual-review-final.json'
write(final, review)
delivery = load(manifest)
for e in delivery['selected']:
    assert sha(e['localPath']) == e['sha256'] == sha(e['generationPath'])
frozen = BASE / 'delivery-final-provisional-eight.json'
assert sha(frozen) == 'e70ab69234e77e6b2e08bc297d71c090d402e68310100cd1ba99c019a4695fb6'
receipt = {
    'schema': 1, 'wave': 22, 'group': 'fighters-a',
    'completedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'ten-assets-delivered-and-native-visual-review-complete',
    'activePngs': 10, 'combatEligibleViews': 7, 'noncombatReferenceViews': 3,
    'generationCalls': 12, 'supersededVariants': 2,
    'selectedBytes': sum(e['bytes'] for e in delivery['selected']),
    'portraitsAdded': 0, 'engineProfilesAdded': 0, 'animationsAdded': 0,
    'certifiedOneToOne': 0, 'browserTest': False,
    'nativeReviewedProfiles': 10, 'nativeReviewedCaptures': 20, 'referencedNativeChecks': 586,
    'fileHashes': {name: sha(BASE / name) for name in ['delivery-final.json', 'delivery.json', 'delivery-part4.json', 'delivery-final-provisional-eight.json', 'native-visual-review.json', 'native-visual-review-eight.json', 'native-visual-review-final.json', 'selection-decisions.json', 'historical-block-evidence.json', 'delivery-consistency.json', 'README.md']},
    'notes': [
        'The final asset manifest and README retain their truthful pre-import A4-review-pending snapshot. native-visual-review-final.json supersedes that pending review without rewriting any frozen metadata or PNG.',
        'The referenced checks were already executed by the parent harness; this reviewer performed image inspection and file identity checks only.',
        'No engine, registry, manifest, portrait, animation, moveset or workbook was modified by this agent. Parent handles import and publication.',
    ],
}
receipt_path = BASE / 'completion-receipt.json'
write(receipt_path, receipt)
print(json.dumps({'finalReview': str(final), 'finalReviewSHA256': sha(final), 'receipt': str(receipt_path), 'receiptSHA256': sha(receipt_path), 'profiles': 10, 'captures': 20, 'referencedChecks': 586, 'selectedBytes': receipt['selectedBytes'], 'frozenManifestSHA256': sha(manifest)}, indent=2))
