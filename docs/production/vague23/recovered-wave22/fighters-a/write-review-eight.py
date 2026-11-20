import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('/workspace/scratch/halo-wave22-fighters-a')
REPO = Path('/workspace/scratch/silent-hill-wave22')
original = BASE / 'native-visual-review.json'
review = json.loads(original.read_text())
assert review['reviewedProfiles'] == 5
review['previousReview'] = {'path': str(original), 'sha256': hashlib.sha256(original.read_bytes()).hexdigest()}
review.update({
    'reviewedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'eight-profiles-reviewed',
    'method': 'Read-only view_image inspection: ten native FightEngine Canvas duel captures for five combat profiles and six drawRasterMonster workshop captures for three reference-only Raw Shock profiles. No tests rerun; no asset pixels changed.',
    'reviewedProfiles': 8, 'reviewedCaptures': 16,
    'combatProfilesReviewed': 5, 'noncombatReferenceProfilesReviewed': 3,
    'noncombatDuels': 0,
    'remaining': 'Part4 extension native captures to review after root import.',
})
observations = {
    'shattered_raw_shock_feminine_100': [
        'Profil neutre entier dans les deux sens : tête ovale, bouche fermée, deux mains et deux pieds arqués lisibles.',
        'Le pied le plus bas rejoint la ligne de référence ; aucune main, tête ou extrémité coupée et aucun rectangle ou halo visible.',
        'Vue d’atelier sans HUD de duel ni adversaire : le rôle de poursuite et combatEnabled=false demeurent. Ce rendu ne valide pas une interaction de combat.',
    ],
    'shattered_raw_shock_abstract_102': [
        'Tête géométrique à ouverture centrale, bras, mains et pieds complets à gauche comme à droite.',
        'Les espaces entre les segments du torse restent ouverts et laissent voir le fond ; la correction alpha ne produit pas de plaque noire distincte ni de halo.',
        'Un pied constitue l’appui le plus bas sur la ligne ; l’autre est relevé par la pose. Référence statique d’atelier, aucun duel ni HUD de combat.',
    ],
    'shattered_raw_shock_atrophied_103': [
        'La tête évidée en U et les ouvertures du torse restent lisibles malgré le gabarit mince et petit de l’atelier.',
        'Les deux mains et deux pieds restent complets lors du miroir ; le pied le plus bas rejoint la ligne et aucun contour ne heurte le bord.',
        'Hauteur visible rapportée par le cadrage natif : environ 139,32 px. Ce gabarit de présentation ne mesure pas la taille canonique relative aux autres morphologies. Aucun duel ni HUD de combat ; combatEnabled=false conservé.',
    ],
}
for id_, notes in observations.items():
    folder = REPO / 'docs/production/vague22/qa-native/cases' / id_
    report_path = folder / 'report.json'
    data = json.loads(report_path.read_text())
    assert data['passed'] and data['browserTest'] is False
    assert data['combatIds'] == [] and data['referenceOnlyIds'] == [id_]
    assert len(data['checks']) == 36 and all(c['passed'] for c in data['checks'])
    capture_by_file = {c['file']: c for c in data['captures']}
    captures = []
    for side, facing in [('left', -1), ('right', 1)]:
        path = folder / (id_ + '-reference-' + side + '.png')
        capture = capture_by_file[path.name]
        sha = hashlib.sha256(path.read_bytes()).hexdigest()
        assert sha == capture['sha256']
        captures.append({
            'path': str(path), 'repositoryPath': str(path.relative_to(REPO)),
            'sha256': sha, 'bytes': path.stat().st_size,
            'facing': facing, 'inspectedWith': 'view_image',
            'purpose': 'native-workshop-renderer-reference-only',
            'combatEnabled': False, 'geometry': capture['geometry'],
        })
    review['records'].append({
        'id': id_, 'status': 'reviewed-no-concrete-visual-defect',
        'combatEligible': False, 'combatEnabled': False, 'duels': 0,
        'captures': captures, 'observations': notes,
        'report': {'path': str(report_path), 'sha256': hashlib.sha256(report_path.read_bytes()).hexdigest(), 'passed': True, 'checkCount': len(data['checks']), 'browserTest': False},
    })
review['referencedCheckExecutions'] = sum(r['report']['checkCount'] for r in review['records'])
assert review['referencedCheckExecutions'] == 448
review['limits'].append('Raw Shock captures use the native workshop renderer only; no FightEngine duel, damage, input combat, DOM/CSS or browser claim is made for these three profiles.')
target = BASE / 'native-visual-review-eight.json'
target.write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'path': str(target), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'profiles': 8, 'captures': 16, 'referencedChecks': 448, 'browserTest': False}, indent=2))
