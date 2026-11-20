from pathlib import Path
from PIL import Image
import json, hashlib, datetime, sys

ROOT = Path(__file__).parent
BASE = Path('/workspace/scratch/silent-hill-wave22/docs/production/vague22/qa-native/cases')
delivery = json.loads((ROOT/'delivery-final.json').read_text())
reviewed_ids = set(sys.argv[1:])
notes = {
    'bom_light_guardian_140': {'silhouette':'Carapace, bras-masse, bras fin et deux pieds restent lisibles dans les deux sens ; cœur lumineux conservé sur le bord du torse.', 'supports':'Deux pieds au sol avec une ombre de moteur ; aucun appui coupé.', 'sourceComparison':'Les invariants du bestiaire BoM sont conservés. La rotation et les plaques fines ne sont pas attestées par un modèle source latéral.'},
    'bom_water_guardian_141': {'silhouette':'Couronne compacte, deux bras, mains et base fermée sont visibles. Le halo des variantes intermédiaires est absent sur le décor de jeu.', 'supports':'Base aquatique arrondie, sans jambe humaine ajoutée ; son placement sur le sol du versus est une adaptation de présentation.', 'sourceComparison':'La masse, les deux bras et la base sont corroborés par le bestiaire et la capture50 ; reflets, profondeur du dos et détails de bouche restent reconstruits.'},
    'bom_earth_guardian_142': {'silhouette':'Tête rocheuse, mâchoire et deux ensembles de segments/poings entiers dans les deux sens. Le poing arrière approche le bord mais demeure dans la capture.', 'supports':'Assemblage flottant : pointe inférieure et ombre, aucune jambe ni pied humain. Ne pas lire le repère inférieur comme un contact plantaire canonique.', 'sourceComparison':'La structure rocheuse et les blocs détachés correspondent aux captures48/49 ; angle latéral, nombre/découpe fine des segments et échelle de présentation ne sont pas certifiés.'},
    'shortmessage_sakura_head_150': {'silhouette':'Dans le renderer d’atelier, la tête fleurie, les manches, cordons et deux montants inférieurs tiennent dans le cadre, sans halo visible.', 'supports':'Les deux montants atteignent le repère horizontal de l’atelier ; la capture ne représente pas un duel ni une marche.', 'sourceComparison':'Costume final recoupé avec captures natives et figurine officielle. Le concept à baskets est exclu. La vue gauche est un miroir de présentation, pas une seconde vue source.'},
    'bom_air_screamer_121': {'silhouette':'Les deux ailes membraneuses, le cou, la tête et les deux serres restent entiers et lisibles dans les deux sens. Aucun halo opaque visible et aucun empiétement sur le HUD.', 'supports':'Pose de vol statique : les deux serres pendent au-dessus du sol et de l’ombre du moteur ; aucun contact plantaire ni battement animé n’est représenté.', 'sourceComparison':'Deux ailes et deux pattes attestées par la capture PS Vita20120126_09. L’angle d’aile, les textures fines et le profil sont reconstruits ; aucune phase animée n’est livrée.'},
    'bom_insane_cancer_126': {'silhouette':'La masse ventrale, la petite tête enfouie dans les plis, la main proche et les deux pieds tiennent intégralement dans chaque capture. Le contour clair reste fin, sans halo opaque visible ; le HUD demeure libre.', 'supports':'Deux petits pieds visibles au niveau du sol, avec l’ombre du moteur. Le bras éloigné est naturellement occulté par la masse en profil ; aucune extrémité visible n’est coupée.', 'sourceComparison':'Masse, tête enfouie et petits appuis recoupés avec la capture PS Vita20120126_10 et le bestiaire. Profondeur/plis fins non certifiés.'},
}
rows=[];pending=[]
for item in delivery['selected']:
    id=item['fighterId']
    if id not in reviewed_ids: pending.append(id);continue
    report_path=BASE/id/'report.json';report=json.loads(report_path.read_text());captures=[]
    for side in ['right','left']:
        filename=id+('-reference-'+side if id=='shortmessage_sakura_head_150' else '-'+side+'-idle')+'.png'
        p=BASE/id/filename;data=p.read_bytes();sha=hashlib.sha256(data).hexdigest();im=Image.open(p)
        evidence=next(c for c in report['captures'] if c['file']==filename)
        assert evidence['sha256']==sha
        assert evidence['draw']['path']==item['path']
        assert evidence['draw']['path']!=item['selectionPortraitPreserved']['path']
        assert evidence['geometry']['complete'] is True
        captures.append({'path':str(p),'file':filename,'sha256':sha,'bytes':len(data),'width':im.width,'height':im.height,'purpose':evidence['purpose'],'facing':evidence.get('facing',evidence.get('state',{}).get('facing')),'drawnPath':evidence['draw']['path'],'drawMatchesNewSprite':True,'selectionPortraitDrawn':False,'geometryCompleteReported':True,'visuallyInspected':True})
    rows.append({'fighterId':id,'result':'passed-with-fidelity-limitations','captures':captures,'observations':notes[id], 'croppingIssueObserved':False,'opaqueHaloObserved':False,'hudObstructionObserved':False if id!='shortmessage_sakura_head_150' else None,'referenceOnly':id=='shortmessage_sakura_head_150','sourceRolePreserved':True,'nativeReport':{'path':str(report_path),'sha256':hashlib.sha256(report_path.read_bytes()).hexdigest(),'passed':report['passed'],'checkCount':len(report['checks']),'actorStateInjected':report.get('actorStateInjected')},'fidelity':'unverified'})
result={'schema':1,'wave':22,'group':'fighters-b','reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Read-only visual review of actual parent-produced native Canvas captures, right and left for each delivered profile. Native report metadata and image SHA256 are cross-checked; no new harness execution by this reviewer.','result':'complete-no-blocking-visual-defect-observed' if not pending else 'partial-awaiting-captures','reviewedProfiles':len(rows),'reviewedCaptureCount':sum(len(r['captures']) for r in rows),'entries':rows,'pendingProfiles':pending,'issues':[],'limits':['Static native Canvas captures do not prove animated clips, timing fidelity, browser/HTTP execution, or 1:1 source fidelity.','Mirroring the right-facing asset does not supply an independently sourced opposite-side drawing.','Sakura Head is reviewed only in the workshop reference renderer and remains outside autonomous duels.']}
(ROOT/'native-visual-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'reviewed':len(rows),'captures':result['reviewedCaptureCount'],'pending':pending,'sha256':hashlib.sha256((ROOT/'native-visual-review.json').read_bytes()).hexdigest()},ensure_ascii=False))
