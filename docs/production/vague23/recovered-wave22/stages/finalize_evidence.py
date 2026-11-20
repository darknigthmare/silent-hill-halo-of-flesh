from pathlib import Path
import json, hashlib, datetime

R = Path(__file__).resolve().parent
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(name): return json.loads((R/name).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(name, obj):
    p=R/name; p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
    return {'file':name,'localPath':str(p),'sha256':sha(p),'bytes':p.stat().st_size}

parts=[read(f'delivery-part{i}.json') for i in range(1,5)]
stages=[s for d in parts for s in d['stages']]
assets=[a for d in parts for a in d['assets']]
assert len(stages)==10 and len({s['stageId'] for s in stages})==10 and len(assets)==20
for a in assets:
    p=Path(a['localPath']); assert sha(p)==a['sha256'] and p.stat().st_size==a['bytes']
assert sum(a['bytes'] for a in assets)==23993353
parts_index=[{'file':f'delivery-part{i}.json','sha256':sha(R/f'delivery-part{i}.json'),'bytes':(R/f'delivery-part{i}.json').stat().st_size,'stageIds':[s['stageId'] for s in d['stages']],'totals':d['totals']} for i,d in enumerate(parts,1)]
refs=[r for d in parts for r in d['references']]
assert len(refs)==13
crops=read('reference-crops-origins.json')
published=[]
for r in refs:
    if Path(r['path']).name=='origins-native-page-021.jpg': continue
    published.append(dict(r))
published.extend(crops)
for r in published:
    p=Path(r['path']); assert sha(p)==r['sha256'] and p.stat().st_size==r['bytes']
    r['publicationPath']='references/'+p.name
    r['visualInspection']='completed; source or relevant source excerpt opened with view_image'
assert len(published)==15
guide_map={g['url']:g for d in parts for g in d['provenance']['sourceGuides']}
review=read('native-visual-review.json')
assert review['status']=='passed' and review['totals']['visuallyReviewed']==10

deferred=[
 {'stageId':'final_sacrament','reason':'La vue disponible de la chambre finale est largement masquée par le Conjurer ; la seconde est une petite vue de cinématique. Pas de volume de salle suffisamment lisible pour reconstruire honnêtement le versus.','evidence':['sh4_the_final_sacraments_01.jpg','sh4_13_outside_room_302_02.jpg']},
 {'stageId':'nightmare_theater','reason':'Le guide officiel montre une vue large de la bibliothèque normale avant miroir ; les vues Otherworld sont partielles. Le décor de caverne bleue voisin appartient à une autre scène/phase. Aucune substitution entre ces salles.','evidence':['Origins official guide, PDF page81 / printed80, SHA f38b8418256264266e8c4ba78b22bc4aaa76084bc9a5eecc9f89325e679dbd80']},
 {'stageId':'prison_hc','reason':'Pas de vue native accessible et suffisamment claire du Cell Block B normal avant la cage. Les images de guides bloquées par HTTP403 ne sont pas considérées comme inspectées.','accessLimits':['Gamepressure / Portforward image requests returned403; no bypass attempted.']},
 {'stageId':'scarlet_chamber','reason':'Les références accessibles ne permettent pas de lire suffisamment l’arène Hell Descent. Un personnage Scarlet ou une chambre d’hôpital voisine ne constitue pas une preuve de cette salle.'},
 {'stageId':'villa_rooftop','reason':'Les storyboards natifs montrent des fragments du toit et du bord, souvent occultés par Anita ; ils ne suffisent pas pour retenir une reconstruction plus large de cette cible.','evidence':['YouTube7ZiuLKo7MxI, public storyboards M14/M15 inspected; no usable downloaded video frame claimed.']},
 {'stageId':'villa_stairwell','reason':'Aucune capture native inspectée de l’escalier exact ne donne une pièce exploitable. Les couloirs, cours et images promotionnelles ne sont pas substitués à cet escalier.'},
 {'stageId':'cedar_grove','reason':'Report historique conservé. La nouvelle lecture du guide officiel distingue Female Hydrotherapy (baignoire) et Female Treatment après le miroir (lit). Elle ne fournit pas la vue complète normale et la phase clairement fixée requises pour cette cible.','evidence':['Origins official guide PDF48 / printed47; embedded raster SHA36953a7b5a0c5750ccde185e3d70f36ccbe9b10e313d08107f8edbf0d12474a0']},
 {'stageId':'frozen_streets','reason':'Alternative explorée brièvement : le guide Nightmare1 consulté n’apporte pas de capture native suffisante. Aucune génération ni remplacement de salle effectué.'}
]
decisions={
 'schemaVersion':1,'createdAt':now,'scope':'Wave22 stages only','baseCommit':'80db2a9fdda7032bcaf110df79915be598290f08',
 'selected':[{'stageId':s['stageId'],'scene':s['scene'],'source':s['source'],'locationScope':s['locationScope'],'referenceIds':s['referenceIds']} for s in stages],
 'selectionRule':'Retain a precise room and phase only when native visual evidence was inspected. Replacement targets follow evidence quality; no visual mixture of neighboring rooms, normal/Otherworld states or editions.',
 'initialPriorityIds':['hazel_subway','underpass_sh3','nightmare_hilltop','outside_room_302','final_sacrament','alchemilla_origins','nightmare_theater','nightmare_hospital_hc','prison_hc','scarlet_chamber'],
 'replacementTargetsRetained':['villa','nowhere','central_nightmare','nightmare_hospital_sm'],
 'deferredThisPass':deferred,
 'priorReportsPreserved':[{'stageId':i,'status':'deferred-unchanged','newQualifyingEvidence':False} for i in ['nightmare_mall','apartment_roof','shimizu_residence','police_station_hc']],
 'newEvidenceForLastTarget':{'stageId':'nightmare_hospital_sm','edition':'US PSP2010 only','videoURL':'https://www.youtube.com/watch?v=2Ekz2eUCIbU','cells':['shsm-psp-er-iced-exit.png','shsm-psp-er-exit-close.png','shsm-psp-er-bed.png'],'supports':'Iced exit, adjacent fixed glass-block masonry column, bed and small cabinet in the ER radio-puzzle room before thaw.','limitations':'Three318×180 native views; occluded detail, widened camera, room scale and unseen geometry remain unverified. No Wii screenshot used as visual input; no animated glass partition or curtain inferred.'},
 'revisionHistory':[{'stageId':'nowhere','draft':'nowhere.generator-room-draft.png','action':'One targeted integrated-imagegen edit removed an unattested small rectangular hatch from the far left wall.','retained':'nowhere.bethor-generator-room.png','retainedSHA256':'6c753fcbaa0afb827734973cfb66a27e62df7958a75274a70826074b87c5b1c9','draftPublished':False,'pixelRetouch':False}],
 'noNewFighters':True,'noNewSourceAnimations':True,'noRuntimeChanges':True,'certified1to1':False,'certifiedUHD':False
}
decision_receipt=write('selection-decisions.json',decisions)
reference_manifest={
 'schemaVersion':1,'createdAt':now,'scope':'Only relevant native raster views for the ten retained stages','references':published,
 'totals':{'files':len(published),'bytes':sum(r['bytes'] for r in published)},
 'sourceGuides':list(guide_map.values()),
 'workingArchivesNotForPublication':[
  {'url':'https://www.silenthillmemories.net/publications/guides/silent_hill_origins_official_strategy_guide.pdf','sha256':'f38b8418256264266e8c4ba78b22bc4aaa76084bc9a5eecc9f89325e679dbd80','reason':'Full guide remains scratch work source; only the three relevant native elevator views are selected.'},
  {'url':'https://ptgmedia.pearsoncmg.com/images/9780744010435/samplepages/1043-5_silent_hill.pdf','sha256':'f01865db7cd59a274ed0efac5eb80f5f76f89441de049e7a1116b2818e5aa82f','reason':'Full sample guide remains work source; only native gate2A image selected.'},
  {'file':'origins-native-page-021.jpg','sha256':'1f60f93440685381fb1310c205f1e30fadabf2b1dae09fbfc8b6d2b28921ef65','replacementPublicationFiles':[Path(r['path']).name for r in crops],'reason':'Full embedded page was inspected and used as a generation reference; publication uses its three relevant screenshot excerpts with exact source rectangles.'},
  {'file':'shsm-psp-native-hospital-M60.jpg','sha256':'6475c8ef5f8b11e06a6dcd520f6d5a98d355f0ad9c794b5424314b36ef586933','reason':'Full native storyboard inspected and used as reference; only relevant ER bed cell selected for publication.'},
  {'file':'shsm-psp-native-hospital-M61.jpg','sha256':'f97aed371e071320a7ee0fe00a08a4b01a33b83f3df9c98803b37c63bb199bea','reason':'Full native storyboard inspected and used as reference; only two relevant iced-exit cells selected for publication.'}
 ],
 'exclusions':'Do not publish full PDF guides, full HTML pages, full YouTube metadata/formats, unrelated gallery screenshots, unused storyboards or the rejected generated draft.',
 'referenceProcessing':'Native raster extraction or crop only; no resampling or generated source detail. This does not alter any production PNG.'
}
reference_receipt=write('reference-inventory.json',reference_manifest)

delivery={
 'schemaVersion':1,'group':'wave22-stages','createdAt':now,'scope':'Ten missing stages; twenty independent static PNG planes','baseCommit':'80db2a9fdda7032bcaf110df79915be598290f08','deliveryState':'integrated-and-native-reviewed',
 'stages':stages,'assets':assets,'references':refs,'prompts':[p for d in parts for p in d['prompts']],
 'incrementalDeliveries':parts_index,
 'publicationReferenceInventory':reference_receipt,
 'provenance':{'generator':'integrated image_gen.imagegen','retainedPNGs':20,'imageGenerationCalls':21,'callsPerGeneratedOutput':1,'targetedRevisionCount':1,'sourceGuides':list(guide_map.values()),'nativePixelsPreserved':True,'postGenerationPixelEditing':False,'preservation':'Hardlinks to native generated PNG bytes; dimensions and alpha preserved.','noRuntimeChangesByProducer':True,'noCharactersOrPortraitsChanged':True,'sourceEditionExceptionDocumented':'nightmare_hospital_sm uses new explicit US PSP2010 native footage, not Wii visual input. Existing proposal annotations are not recertified.'},
 'qa':{'visualOutputPNGsInspected':20,'nativeMetadataAndSHA256Verified':20,'opaqueBackgrounds':10,'genuineAlphaForegrounds':10,'descriptorValidation':'validateStageBitmap and stageBitmapFor passed for all incremental candidates','nativeStageCasesPassed':10,'nativeStageAssertionsPassed':460,'nativeStageCapturesInspected':10,'nativeReview':{'file':'native-visual-review.json','sha256':sha(R/'native-visual-review.json'),'bytes':(R/'native-visual-review.json').stat().st_size},'browserTest':False,'httpTest':False,'actorStateInjected':False,'attacksTested':False,'fidelity':'unverified; no1:1 or UHD certification'},
 'totals':{'stages':10,'png':20,'bytes':23993353,'nativeWidth':1672,'nativeHeight':941,'sourceRastersSelectedForPublication':15},
 'coverageAfterRootIntegration':{'activeStages':65,'catalogueStages':123,'missingStages':58,'missingUnblocked':43,'blocked':15,'basis':'Base55 plus10 distinct newly integrated stages; blocked policies unchanged.'},
 'selectionDecisions':decision_receipt,
 'notes':['The four incremental delivery files and all their stages/assets remain frozen. This consolidated file is provenance for the whole lot; do not re-import already integrated IDs.','All PNGs are native imagegen output. Reference crops are documentary extracts, not edits of production art.','Asset-level engineTest:false describes the pre-integration asset inspection checkpoint; the linked final native review supplies the later actual engine result.','Static planes and live parallax are not new source animation, attack timing, a gameplay transformation or a claim of browser testing.']
}
delivery_receipt=write('delivery.json',delivery)
inventory={
 'schemaVersion':1,'createdAt':now,'status':'complete','scope':'Wave22 stage evidence only','delivery':delivery_receipt,
 'incrementalDeliveries':parts_index,'selectionDecisions':decision_receipt,'referenceInventory':reference_receipt,
 'nativeVisualReview':{'file':'native-visual-review.json','sha256':sha(R/'native-visual-review.json'),'bytes':(R/'native-visual-review.json').stat().st_size},
 'productionAssets':[{'stageId':a['stageId'],'role':a['role'],'localPath':a['localPath'],'path':a['path'],'sha256':a['sha256'],'bytes':a['bytes'],'width':a['width'],'height':a['height']} for a in assets],
 'nativeCaptures':[{'stageId':c['stageId'],'path':c['capture'],'sha256':c['captureSHA256'],'bytes':c['captureBytes'],'caseReport':c['nativeCaseReport'],'caseReportSHA256':c['nativeCaseReportSHA256']} for c in review['cases']],
 'totals':{'stages':10,'png':20,'productionBytes':23993353,'nativeCases':10,'nativeAssertions':460,'nativeCaptures':10,'selectedReferenceRasters':15,'selectedReferenceBytes':reference_manifest['totals']['bytes']},
 'publishInstructions':'Use reference-inventory.json.references for documentary raster copies, not the working source paths inside frozen prompts. Production paths already integrated by root; no further asset import or generation required.',
 'excluded':'Full PDF/HTML/video metadata, unused research rasters, source sheets replaced by relevant cells, rejected draft, redundant copies of native captures.',
 'browserTest':False,'certified1to1':False
}
inventory_receipt=write('evidence-inventory.json',inventory)
print(json.dumps({'delivery':delivery_receipt,'referenceInventory':reference_receipt,'selectionDecisions':decision_receipt,'evidenceInventory':inventory_receipt,'totals':inventory['totals']},ensure_ascii=False))
