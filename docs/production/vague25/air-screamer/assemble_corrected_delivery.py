#!/usr/bin/env python3
"""Write only new correction metadata; original deliveries and native pixels stay intact."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import math
from PIL import Image

base = Path(__file__).resolve().parent
read = lambda name: json.loads((base / name).read_text())
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()

def save_new(name, value):
    with (base / name).open('x', encoding='utf-8') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')

original = read('delivery.json')
delivery = copy.deepcopy(original)
audit = read('native-png-audit-corrected.json')
spec = read('prompt-corrected.json')
points = read('body-landmarks.json')
calibration = {'anchor': [0.51, 0.745], 'bodyHeight': 0.42}
assert sha(audit['localPath']) == sha(audit['nativePath']) == audit['sha256']
assert audit['sha256'] == '88d752b48e9fa4aa0104527a898c14fe7f44d5eee1f8e74262b668a65e1973ac'

new_point_row = {'frameIndex': 2, 'pixels': audit['bodyLandmarks'],
                 'sha256': audit['sha256'], 'localPath': audit['localPath'],
                 'width': audit['width'], 'height': audit['height']}
points['landmarks'][2] = new_point_row
points['calibration'] = calibration
points['supersedes'] = {'file': 'body-landmarks.json', 'sha256': sha(base / 'body-landmarks.json')}
points['method'] += ' Corrected frame2 measured with the same regions and threshold; rows0/1 unchanged. One common anchorY=.745 is used for all three images; only rendering metadata changes, never native pixels.'
neutral = Image.open(original['selected'][0]['localPath']).getchannel('A')
corrected = Image.open(audit['localPath']).getchannel('A')
mask = lambda a: {(x, y) for y in range(470, 640) for x in range(1020, 1500) if a.getpixel((x, y)) >= 96}
one, two = mask(neutral), mask(corrected)
points['headAlphaMaskIoUAgainstNeutral']['2'] = len(one & two) / len(one | two)
save_new('body-landmarks-corrected.json', points)

peer = {
    'schema': 1, 'reviewer': '/root/audit_previous_work',
    'reviewedAt': datetime.now(timezone.utc).isoformat(), 'passed': True,
    'scope': 'Direct inspection of the new native correction compared to the previously reviewed neutral/up poses and retained walk identity. Candidate morphology only; actual new calibration and transitions require the new engine run.',
    'correctedNativeSHA256': audit['sha256'], 'correctedNativePath': audit['localPath'],
    'findings': 'Identité latérale, tête/cou, deux pattes et deux ailes cohérents ; pointe basse relevée, pose entière et encore distincte du neutre. Accepté comme candidat morphologique pour delivery-corrected.',
    'calibrationReview': 'Independent calculation on the recorded real draw matrices confirms common anchorY=.745 lifts all three idle poses by3.629231screen pixels at the tested camera. Framing bottom592.992859 for ground594; feet5.632–9.176pixels above the preserved walk, to review in the new native engine captures.',
    'engineCycleQARequired': True,
}
save_new('peer-review-corrected.json', peer)

for row in delivery['selected']:
    row['calibrationProposal'] = copy.deepcopy(calibration)
row = delivery['selected'][2]
for key in ('localPath', 'nativePath', 'sha256', 'pixelSHA256', 'bytes', 'width', 'height'):
    row[key] = audit[key]
row.update(bodyLandmarks=audit['bodyLandmarks'], bodyLandmarkSHA256=audit['sha256'],
           promptId=spec['id'], prompt=spec['prompt'], technical=audit,
           directInputReferences=[{'localPath': path, 'sha256': sha(path)} for path in spec['referenced_image_paths']],
           review='Natif corrigé entier en profil droit ; tête/cou/corps/pattes conservés, deux ailes distinctes et pointe basse relevée par édition imagegen. Revue morphologique indépendante acceptée ; nouveau réglage commun d’ancre à contrôler dans le moteur.',
           supersedesNativeSHA256=original['selected'][2]['sha256'])
assert [sha(row['localPath']) for row in delivery['selected'][:2]] == [row['sha256'] for row in original['selected'][:2]]
max_shift = max(math.dist(points['landmarks'][0]['pixels'][key], item['pixels'][key])
                for item in points['landmarks'][1:] for key in item['pixels'])
delivery['revision'] = 'distal-wing-correction-and-common-idle-anchor-calibration'
delivery['supersedesDelivery'] = {'path': str(base / 'delivery.json'), 'sha256': sha(base / 'delivery.json')}
delivery['supersededNativeCandidates'] = [{'frameIndex': 2,
    'path': original['selected'][2]['localPath'], 'sha256': original['selected'][2]['sha256'],
    'reason': 'Downstroke wing crossed the actual ground plane by23.887visible/24.950framing screen pixels. Original native and failed visual QA are preserved.'}]
review = delivery['animationReview']
review.update(commonCalibration=calibration,
              bodyLandmarksFile=str(base / 'body-landmarks-corrected.json'),
              bodyLandmarksFileSHA256=sha(base / 'body-landmarks-corrected.json'),
              maximumNativeBodyLandmarkShiftFromNeutralPixels=max_shift,
              headAlphaMaskIoUAgainstNeutral=points['headAlphaMaskIoUAgainstNeutral'],
              peerReview=str(base / 'peer-review-corrected.json'),
              nativePoseConsistencyReviewed=True, peerReviewPassed=True,
              engineCycleQARequired=True, engineCycleQACompleted=False,
              calibrationMethod='All three idle PNGs keep identical dimensions1536x1024 and bodyHeight.42. Common anchor changes from[.51,.735] to[.51,.745], a10.24native-pixel anchor shift, lifting each rendered pose by3.629231screen pixels at the recorded camera. The body scale and relative landmarks stay constant. This small common versus calibration clears the corrected wing while preserving the complete native image; no clipping, alpha processing or per-pose scaling is used. The untouched walk calibration remains[.51,.9]/.8 and its transition must be visually accepted in the new run.')
review['groundClearanceCorrection'] = {
    'originalNativeFrame2SHA256': original['selected'][2]['sha256'],
    'correctedNativeFrame2SHA256': audit['sha256'],
    'imagegenCorrectionCalls': 1, 'requestedLowestNativeY': 810,
    'observedNativeVisibleBoundsMaxYExclusive': 836,
    'observedNativeFramingBoundsMaxYExclusive': 837,
    'requestedNativeMarginMet': False,
    'oldCalibrationActualProjection': {'anchor': [.51, .735], 'visibleBottomScreen': 596.2676725440854,
                                      'framingBottomScreen': 596.6220896467573, 'groundScreen': 594},
    'newCommonCalibrationPredictedProjection': {'anchor': [.51, .745],
        'liftScreenPixels': 3.629230980961, 'visibleBottomScreen': 592.6384415631244,
        'framingBottomScreen': 592.9928586657963, 'groundScreen': 594,
        'framingClearanceScreenPixels': 1.0071413342037},
    'decision': 'Root chose the single corrected native plus a common small idle-anchor adjustment after explicit analysis. No second generation, no gate relaxation, no frame3 change. New actual-engine QA is still required before publication.',
    'newEngineGate': 'Visible and framing bounds must remain at or above registered ground plane plus the unchanged2pixel tolerance in both facings; inspect walk-to-idle foot/hover transition.',
    'historicReceiptInterpretation': 'generation-receipt-corrected.json records failure at the former.735 anchor and remains unchanged. This new delivery records the subsequent selection under common.745 calibration.'
}
generation = delivery['generation']
generation.update(calls=4, correctionCalls=1,
                  nativeFilesTotalBytes=original['generation']['nativeFilesTotalBytes'] + audit['bytes'],
                  selectedNativeFilesTotalBytes=sum(item['bytes'] for item in delivery['selected']),
                  allNativeOutputsPreserved=True, nativeBytesUnmodified=True,
                  correctionPromptSet=str(base / 'prompt-corrected.json'),
                  correctionPromptSetSHA256=sha(base / 'prompt-corrected.json'),
                  correctionReceipt=str(base / 'generation-receipt-corrected.json'),
                  strategy='Three-pose generation followed by one targeted distal-wing imagegen edit. Keep neutral/up native bytes unchanged and calibrate all three selected idle poses with one common anchor; old downstroke and all evidence preserved.')
delivery['limits'].append('The requested y<=810 native margin was not obtained by imagegen. Selection instead relies on the documented common anchor adjustment; actual clearance and unchanged-walk transition require the corrected native QA run.')
save_new('delivery-corrected.json', delivery)
print(json.dumps({'delivery': str(base / 'delivery-corrected.json'),
                  'landmarks': str(base / 'body-landmarks-corrected.json'),
                  'selectedBytes': generation['selectedNativeFilesTotalBytes'],
                  'allFourNativeBytes': generation['nativeFilesTotalBytes'],
                  'maximumBodyLandmarkShiftNativePixels': max_shift,
                  'headAlphaMaskIoUCorrectedVsNeutral': points['headAlphaMaskIoUAgainstNeutral']['2'],
                  'calibration': calibration, 'nativeSHA256': audit['sha256']}))
