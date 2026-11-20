import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('/workspace/scratch/halo-wave22-fighters-a')
REPO = Path('/workspace/scratch/silent-hill-wave22')

def load(name):
    return json.loads((BASE / name).read_text())

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def write(name, value):
    path = BASE / name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return sha(path)

delivery = load('delivery.json')
baseline = load('runtime-reference-audit.json')
selected_ids = {e['id'] for e in delivery['selected']}
blocks = load('historical-block-evidence.json')
for record in blocks['records']:
    record['sourceSHA256'] = sha(REPO / record['file'])
write('historical-block-evidence.json', blocks)
missing = [
    ('sh1_incubus_019', 'direct-historical-tool-refusal', 'Refus explicite antérieur Incubus ; aucune nouvelle requête.'),
    ('sh2_mannequin_ambusher_023', 'related-historical-tool-refusal', 'Famille Mannequin précédemment refusée ; la variante remake 2024 ne sert pas de nouvelle tentative.'),
    ('sh2_spider_mannequin', 'related-historical-tool-refusal', 'Famille Mannequin précédemment refusée ; aucun essai Spider ni transfert d’une autre édition.'),
    ('sh2_mary_final_manifestation_034', 'direct-historical-tool-refusal', 'Refus imagegen antérieur, requestId aab0fa5c-0b16-4cc5-b4b7-8969f7bbdc30 ; aucun nouvel appel.'),
    ('homecoming_amnion_hanging_form_097', 'direct-historical-tool-refusal', 'Refus imagegen antérieur, requestId 618d08f4-0487-4b32-839f-f69a2983f6e2 ; aucun nouvel appel.'),
    ('homecoming_amnion_exposed_form_098', 'related-historical-tool-refusal-and-insufficient-phase-reference', 'Même sujet Amnion précédemment refusé, et anatomie exposée de seconde phase non établie par le rendu fermé. Aucun essai ni emprunt de la première forme.'),
]
records = []
for id_, status, reason in missing:
    records.append({'id': id_, 'inventoryClass': 'missing-portrait-and-view', 'decision': status, 'attemptsThisWave': 0, 'reason': reason, 'evidence': 'historical-block-evidence.json'})
for original in baseline:
    id_, policy = original['id'], original['referencePolicy']
    record = {'id': id_, 'inventoryClass': 'legacy-unreviewed', 'combatEnabledPreserved': policy['combatEnabled'], 'rolePreserved': policy['role']}
    if id_ in selected_ids:
        e = next(e for e in delivery['selected'] if e['id'] == id_)
        record.update({'decision': 'dedicated-combat-view' if e['combatEligible'] else 'noncombat-reference-view', 'selectedSHA256': e['sha256'], 'newPortrait': False, 'newEngineProfile': False, 'existingAnimatedClips': e['existingAnimatedClips']})
    elif id_ == 'sh1_air_screamer_001':
        record.update({'decision': 'existing-animation-preserved', 'attemptsThisWave': 0, 'reason': 'Le profil possède déjà un clip idle animé à plusieurs frames. Aucune image fixe ne le remplace.', 'existingAnimatedClips': original['sprite']['animatedClips']})
    elif id_ == 'sh2_maria_final_manifestation_033':
        record.update({'decision': 'related-historical-tool-refusal', 'attemptsThisWave': 0, 'reason': 'Même famille de manifestation finale que Mary explicitement refusée. Le portrait Maria existant demeure ; aucun essai sous cette autre identité.', 'evidence': 'historical-block-evidence.json'})
    elif id_ == 'sh1_stalker_008':
        record.update({'decision': 'insufficient-exact-native-reference', 'attemptsThisWave': 0, 'reason': 'Les images consultées ne fixent pas assez clairement le Stalker armé translucide de Nowhere dans son édition exacte. Le modèle Grey Child et sa seule recoloration ne suffisent pas à établir une vue 1:1.'})
    elif id_ == 'origins_remnant_077':
        record.update({'decision': 'insufficient-exact-native-reference', 'attemptsThisWave': 0, 'reason': 'La cage filaire et l’ombre sont trop petites/peu définies dans les sources natives consultées pour établir attaches, arceaux et crochets sans invention. Aucun modèle ou détail de cage ajouté. La requête publique Fandom a répondu HTTP402 ; aucun contournement de cette réponse.', 'evidence': ['reference-downloads-1.json', 'reference-downloads-3.json']})
    else:
        assert policy['combatEnabled'] is False
        record.update({'decision': 'documented-role-preserved-no-forced-fighter', 'attemptsThisWave': 0, 'reason': 'Présence non combattante ou obstacle environnemental documenté ; aucune conversion en personnage de duel ni invention d’un corps autonome.'})
    records.append(record)
assert len(records) == 28
counts = {}
for e in records:
    counts[e['decision']] = counts.get(e['decision'], 0) + 1
decisions = {
    'schema': 1, 'wave': 22, 'group': 'fighters-a', 'baseCommit': '80db2a9',
    'generatedAt': datetime.now(timezone.utc).isoformat(),
    'sourceScope': ['sh1', 'sh2', 'sh3', 'sh4', 'origins', 'homecoming', 'shattered', 'downpour'],
    'inventoryScope': {'legacyProfilesReviewed': 22, 'trueMissingProfilesReviewed': 6},
    'counts': counts, 'newIdentityAdditions': 0, 'newPortraits': 0,
    'selectedViews': 10, 'combatEligibleViews': 7, 'noncombatReferenceViews': 3,
    'generationCalls': 12, 'selectedOutputs': 10, 'archivedSupersededOutputs': 2,
    'historicalRefusalsRetried': 0, 'newToolRefusals': 0,
    'certifiedOneToOne': 0, 'nativeAnimationProduced': 0,
    'records': records,
    'limits': ['Native sources are image references; generated unseen sides, poses and textures remain reconstructions.', 'Only raw unedited imagegen PNGs are deliverables. Alpha composites and native game captures are separate QA artifacts.', 'Opposite facing is a runtime mirror. Static idle frames do not supply source animation, measured frames or contact geometry.'],
}
decision_hash = write('selection-decisions.json', decisions)
checks = []
for e in delivery['selected']:
    checks.append({'id': e['id'], 'candidateSHA256Matches': sha(e['localPath']) == e['sha256'], 'generationOriginalSHA256Matches': sha(e['generationPath']) == e['sha256'], 'referenceFilesPresent': all(Path(p).is_file() for p in e['referenceFiles']), 'targetFilenameContainsSHA12': e['sha256'][:12] in e['path'], 'portraitPreservationDeclared': bool(e['selectionPortraitPreserved']), 'animatedClipNotReplaced': e['existingAnimatedClips'] == 0, 'rightFacingDeclared': e['facing'] == 1})
assert all(all(v is True for k,v in e.items() if k != 'id') for e in checks)
consistency_hash = write('delivery-consistency.json', {'schema': 1, 'checkedAt': datetime.now(timezone.utc).isoformat(), 'deliverySHA256': sha(BASE / 'delivery.json'), 'checks': checks, 'passed': True, 'method': 'File identity and metadata cross-check only; no engine tests or raster edits.'})
print(json.dumps({'decisions': str(BASE / 'selection-decisions.json'), 'sha256': decision_hash, 'counts': counts, 'consistencySHA256': consistency_hash}, indent=2))
