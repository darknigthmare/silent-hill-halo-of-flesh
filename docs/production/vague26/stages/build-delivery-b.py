"""Record one additional stage without mutating the accepted lot A."""
from pathlib import Path
import importlib.util, json, hashlib
from datetime import datetime, timezone
from PIL import Image

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('native_stage_delivery',HERE/'build-delivery.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
ROOT=module.ROOT
stage=next(x for x in json.loads((ROOT/'data/stages.json').read_text()) if x['id']=='frozen_streets')
assets=[];layers=[]
for kind,filename,lid,parallax in [('background','frozen_streets.bg.png','bg-frozen-exterior',0),('foreground','frozen_streets.near-edges.png','near-edges',.006)]:
    result=json.loads((HERE/('generation-result-'+kind+'-b.json')).read_text())
    asset=module.asset('frozen_streets',lid,filename,result['key'],result['originalOutput']);assets.append(asset)
    layers.append({'id':lid,'rect':[0,0,1,1],'fit':'cover','ticksPerFrame':1,'loop':False,'parallaxX':parallax,'frames':[{k:asset[k] for k in ['sha256','bytes','width','height','path']}]})
scope='Unnamed frozen exterior route visible in Wii promotional screenshot38, gallery dated2009-07-31; no street name or final-build match certified'
definition={'stageId':'frozen_streets','source':'shattered','status':'integrated-candidate','fidelity':'unverified','origin':'conversation-image-generation','mode':'replace','scene':'shsm-frozen-exterior-press-route','runtimeSceneId':None,'geometry':{'ceiling':False},'referenceIds':stage['reference']['referenceIds'],'worldState':stage['referencePolicy']['worldState'],'edition':'Silent Hill: Shattered Memories, Wii promotional gameplay screenshot dated2009-07-31; predates release','locationScope':scope,'selectedSubLocation':scope,'layers':layers,'notes':['The selected native screenshot38 depicts an exterior route bounded by thick ice, embedded broken masonry, a dark upper gap and a bent slender pole. It is not a normal-world snowy street.','The screenshot belongs to a gallery section dated2009-07-31; it does not certify the exact street, route chapter or a matching final-release build. This scope remains explicit.','The original slope, depth and obstructions are adapted into a flat side-on versus floor. Sideways expansion, pole placement, unseen surfaces and ice geometry are authored reconstruction, not certified1:1.','Player, Raw Shock, reticle, snowstorm, source chase and gameplay obstacles are omitted. No new collision, weather, hazard, source timing or animation is introduced.','One opaque static background plus one sparse transparent near-edge plate. Native trace alpha is preserved; in-engine QA deferred to root integration.'],'supports':{'groundLineY':.87,'runtimeChange':False},'safeAreas':{'normalizedCoordinates':True,'combatFooting':[.07,.72,.86,.23],'centerClear':[.07,0,.86,1],'note':'Visible foreground absent from the central86percent; native alpha traces quantitatively retained. Artwork inspection only, no collision changes.'}}
p=HERE/'references/shsm-frozen-exterior-press-20090731-38.jpg';b=p.read_bytes();im=Image.open(p)
ref={'stageId':'frozen_streets','file':p.name,'localPath':str(p),'path':p.relative_to(ROOT).as_posix(),'url':'https://www.silenthillmemories.net/sh_shattered_memories/screenshots/pics/sh_shm_screen_38.jpg','sourcePage':'https://www.silenthillmemories.net/sh_shattered_memories/screens_en.htm','galleryDate':'2009-07-31','selectedPanels':'Full native screenshot; architecture only, no player/monster/reticle','bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'width':im.width,'height':im.height,'inspected':True,'sourceClaim':'Native promotional gameplay screenshot downloaded unchanged. Exact street and final-build match remain unverified.'}
prompts=[]
for name in ['prompts-background-b.json','prompts-foreground-b.json']:prompts+=json.loads((HERE/name).read_text())
out={'schemaVersion':1,'group':'vague26-stages-b','scope':'One additional missing frozen exterior stage; two native static planes','createdAt':datetime.now(timezone.utc).isoformat(),'baseCommit':'8c2b56320ceb9fd5490660cb8e20a2dbf62c57bb','deliveryState':'ready-for-root-integration','stages':[definition],'assets':assets,'references':[ref],'prompts':prompts,'visualQA':{'kind':'native-plate-inspection-only','bothGeneratedPlatesInspected':True,'notAnInEngineTest':True,'noPixelPostprocessing':True,'oneToOneCertified':False}}
path=HERE/'integration-delivery-b.json'
if path.exists():raise SystemExit('Preserve existing delivery; use a new explicit revision.')
path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'path':str(path),'assets':len(assets),'bytes':sum(x['bytes'] for x in assets),'foregroundAlphaZeroFraction':assets[1]['qa']['fullyTransparentFraction'],'foregroundCenterAlphaMax':assets[1]['qa']['centerAlphaMax']},indent=2))
