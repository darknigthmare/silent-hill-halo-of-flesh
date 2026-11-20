#!/usr/bin/env python3
"""Assemble metadata only; never changes image pixels or repository registries."""
from pathlib import Path
import hashlib
import json
import math

BASE = Path(__file__).resolve().parent
sha = lambda raw: hashlib.sha256(raw).hexdigest()
read = lambda name: json.loads((BASE / name).read_text())
write = lambda name, obj: (BASE / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
native = read('native-png-audit.json')
points = read('body-landmarks.json')
prompts = read('prompts.json')
baseline = read('baseline.json')
references = read('reference-provenance.json')
calibration = {'anchor': [0.51, 0.735], 'bodyHeight': 0.42}
for row, asset in zip(points['landmarks'], native):
    row.update(sha256=asset['sha256'], localPath=asset['localPath'], width=asset['width'], height=asset['height'])
write('body-landmarks.json', points)
max_shift = max(math.dist(points['landmarks'][0]['pixels'][key], row['pixels'][key])
                for row in points['landmarks'][1:] for key in row['pixels'])
peer = {
    'reviewer': '/root/audit_previous_work',
    'method': 'Independent visual inspection of all three native outputs, existing walk frame3 and original SH1 render; source-bound, no certification.',
    'passed': True,
    'findings': 'Tête et cou latéraux cohérents, deux ailes membraneuses et deux pattes, aucune pointe coupée ; poses haut/neutre/bas distinctes, corps stable. Légères différences de texture, aucune identité pixel annoncée.',
    'condition': 'Même ancre corporelle et même facteur d’échelle pour 0..2 ; ne pas recalibrer sur la hauteur des ailes.',
    'reviewedFiles': [{'frameIndex': n['frameIndex'], 'path': n['localPath'], 'sha256': n['sha256']} for n in native],
    'limits': 'Three static native poses reviewed; actual cyclic engine QA remains required after import.'
}
write('peer-review.json', peer)
selected = []
for asset, prompt, landmarks in zip(native, prompts['prompts'], points['landmarks']):
    index = asset['frameIndex']
    row = {
        'fighterId': 'sh1_air_screamer_001', 'source': 'sh1', 'edition': 'PlayStation 1999',
        'frameIndex': index, 'pose': ['neutral', 'wings-up', 'wings-down'][index],
        'localPath': asset['localPath'], 'nativePath': asset['nativePath'],
        'sha256': asset['sha256'], 'pixelSHA256': asset['pixelSHA256'],
        'bytes': asset['bytes'], 'width': asset['width'], 'height': asset['height'],
        'facing': 1, 'calibrationProposal': calibration,
        'bodyLandmarks': landmarks['pixels'], 'bodyLandmarkSHA256': asset['sha256'],
        'singleSubjectReviewed': True, 'wholeSubjectReviewed': True, 'strictRightSideReviewed': True,
        'review': 'Même Air Screamer SH1 entier en profil latéral droit ; tête/cou/corps/pattes visuellement stables, une seule paire d’ailes et de pattes, pose d’ailes distincte. Natifs inchangés, vrai canal alpha, parties entières dans le cadre.',
        'limits': 'Reconstruction latérale à partir de vues SH1 avant/arrière et d’un candidat de continuité déjà actif. Aucun turnaround source orthographique, aucune certification 1:1 ; petites variations de texture conservées. Rythme versus déjà existant, pas un cycle extrait du jeu source. QA cyclique moteur encore requise.',
        'references': references,
        'directInputReferences': [{'localPath': path, 'sha256': sha(Path(path).read_bytes())} for path in prompt['referenced_image_paths']],
        'promptId': prompt['id'], 'prompt': prompt['prompt'],
        'transparentBackgroundRequested': True, 'technical': asset,
    }
    selected.append(row)

delivery = {
    'schema': 1, 'wave': 25, 'kind': 'reviewed-three-pose-animated-idle-replacement',
    'fighterId': 'sh1_air_screamer_001', 'source': 'sh1', 'edition': 'PlayStation 1999',
    'selected': selected, 'replacedFrameIndices': [0, 1, 2],
    'baseline': {'path': str(BASE / 'baseline.json'), 'sha256': sha((BASE / 'baseline.json').read_bytes())},
    'preservedClips': baseline['entry']['clips'], 'preservedAnimatedClips': 1,
    'allowedEntryMetadataChanges': {
        'combatView': 'side-view-candidate',
        'retainedLegacyCombatFrames': [{'index': 3, 'sha256': baseline['entry']['frames'][3]['sha256']}],
    },
    'metadataRationale': 'The existing validateCombatFramePurposes requires this exact legacy marker to retain the old frame3 deeply unchanged after classifying the three reviewed idle frames as side-view candidates. No validator or static importer is relaxed. Notes, source provenance, portrait, frame3 and every other entry field remain unchanged.',
    'animationReview': {
        'nativePoseConsistencyReviewed': True, 'peerReviewPassed': True,
        'engineCycleQARequired': True, 'engineCycleQACompleted': False,
        'nativeDimensions': [1536, 1024], 'commonCalibration': calibration,
        'calibrationMethod': 'One fixed anchor under the pelvis ([783.36,752.64] native pixels), one standing-equivalent height 430.08 pixels for every pose. This preserves the body scale independently of wing extension; projected lateral width is close to the unchanged walk frame. Native body landmarks provide measurable evidence and must be projected by actual rendering in cyclic QA.',
        'bodyLandmarksFile': str(BASE / 'body-landmarks.json'),
        'bodyLandmarksFileSHA256': sha((BASE / 'body-landmarks.json').read_bytes()),
        'maximumNativeBodyLandmarkShiftFromNeutralPixels': max_shift,
        'headAlphaMaskIoUAgainstNeutral': points['headAlphaMaskIoUAgainstNeutral'],
        'nativePixelsIdenticalAcrossPoses': False,
        'textureVariation': 'Small texture variations and subpixel/1–2 pixel outline differences remain; no per-pixel identity is claimed. Native textures were not processed.',
        'peerReview': str(BASE / 'peer-review.json'),
        'cyclicGate': 'Run the actual idle sequence 0,1,0,2 for at least two complete 24-tick cycles; preserve six ticks per step, walk frame3 on movement and return to idle, both facings, body landmark stability and unchanged portrait. Do not claim qualified cyclic consistency from static review alone.'
    },
    'generation': {
        'tool': 'built-in image_gen.imagegen', 'calls': 3, 'correctionCalls': 0,
        'strategy': 'Generate neutral first from inspected source and continuity references, then independently edit only wings to high and low poses from the neutral native PNG.',
        'allNativeOutputsPreserved': True, 'nativeBytesUnmodified': True,
        'nativeFilesTotalBytes': sum(n['bytes'] for n in native),
        'promptSet': str(BASE / 'prompts.json'), 'promptSetSHA256': sha((BASE / 'prompts.json').read_bytes()),
        'alphaReview': 'Brown/black preview halo is hidden RGB beneath alpha zero; inspected far-background alpha samples are all zero. Alpha>=2 bounds tightly follow the whole subject, with a few alpha1 antialiasing traces retained. No procedural edit or needless imagegen correction.'
    },
    'import': {'helper': str(BASE / 'import-air-screamer-idle.py'),
               'default': 'dry-run; explicit --apply required by integrator after review',
               'staticImporterUnchanged': True, 'registryNotModifiedByAuthor': True},
    'limits': ['Unverified reconstruction candidate; no source-exact side view or 1:1 claim.',
               'Timing is the original project clip, not a newly measured SH1 animation.',
               'Left facing is a presentation mirror, not independently sourced anatomy.',
               'The immutable historical walk image may differ in texture/pose from the new idle; actual movement transition remains part of post-import QA.',
               'Only three idle frames change. No attack, impact, guard, finisher, source role or gameplay ability is authored.'],
}
write('delivery.json', delivery)
print(json.dumps({'delivery': str(BASE / 'delivery.json'), 'selected': len(selected),
                  'bytes': delivery['generation']['nativeFilesTotalBytes'],
                  'maximumBodyLandmarkShift': max_shift}))
