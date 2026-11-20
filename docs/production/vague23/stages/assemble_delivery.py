"""Preserve imagegen bytes and assemble a read-only audited stage delivery."""
from pathlib import Path
import hashlib, json, shutil, sys
from datetime import datetime, timezone
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
GEN = ROOT.parent / 'generated_images'
hash_bytes = lambda data: hashlib.sha256(data).hexdigest()

def image_meta(path):
    data = path.read_bytes()
    with Image.open(path) as im:
        im.load()
        width,height = im.size
        rgba = im.convert('RGBA')
        alpha = rgba.getchannel('A')
        histogram = alpha.histogram()
        total = width * height
        center = alpha.crop((round(width*.07),0,round(width*.93),height))
        feet = alpha.crop((round(width*.07),round(height*.72),round(width*.93),round(height*.95)))
        return {'width':width,'height':height,'mode':im.mode,'bytes':len(data),'sha256':hash_bytes(data),'pixelSHA256':hash_bytes(rgba.tobytes()),'alphaRange':list(alpha.getextrema()),'qa':{'fullyTransparentFraction':histogram[0]/total,'semiTransparentPixels':sum(histogram[1:255]),'opaqueFraction':histogram[255]/total,'centerAlphaMax':center.getextrema()[1],'footBandAlphaMax':feet.getextrema()[1]}}

part=sys.argv[1]
configs=json.loads((HERE / f'config-{part}.json').read_text())
catalogue={s['id']:s for s in json.loads((ROOT/'data/stages.json').read_text())}
allprompts=[]
for file in sorted(HERE.glob('prompts-*.json')):
    allprompts += json.loads(file.read_text())
prompts={p['key']:p for p in allprompts}
result={'schemaVersion':1,'group':'vague23-stages','scope':'New native static bitmap candidates for existing missing stages only','createdAt':datetime.now(timezone.utc).isoformat(),'baseCommit':'cffb58bbcb78c2bdb1381965ea0efb3e5fb54994','deliveryState':'ready-for-root-integration','stages':[],'assets':[],'references':[],'prompts':[],'qa':{'sourceAndGeneratedImagesVisuallyInspected':True,'browserTest':False,'engineTest':False,'noPixelsRetouched':True,'noAnimatedClips':True,'certified1to1':False,'certifiedUHD':False}}
for c in configs:
    sid=c['stageId']; s=catalogue[sid]
    assert not s.get('reference',{}).get('blocked'),sid
    assert c['source']==s['source'],sid
    scene=s.get('referencePolicy',{}).get('sceneId') or c['scene']
    layers=[]
    for kind in ['bg','fg']:
        original=GEN/c[kind+'File']
        filename=f"{sid}.{c[kind+'Layer']}.png"
        local=HERE/filename
        if local.exists():
            assert hash_bytes(local.read_bytes())==hash_bytes(original.read_bytes())
        else: shutil.copy2(original,local)
        meta=image_meta(local)
        if kind=='bg': assert meta['alphaRange']==[255,255],(sid,meta)
        else:
            assert meta['alphaRange']==[0,255],(sid,meta)
            assert meta['qa']['fullyTransparentFraction']>.75,(sid,meta)
            assert meta['qa']['centerAlphaMax']<=1,(sid,meta)
            assert meta['qa']['footBandAlphaMax']<=1,(sid,meta)
        path=f"assets/stages/{sid}.{c[kind+'Layer']}.{meta['sha256'][:12]}.png"
        frame={key:meta[key] for key in ['sha256','bytes','width','height']};frame['path']=path
        layers.append({'id':c[kind+'Layer'],'rect':[0,0,1,1],'fit':'cover','ticksPerFrame':1,'loop':False,'parallaxX':0 if kind=='bg' else .006,'frames':[frame]})
        result['assets'].append({'stageId':sid,'promptKey':c[kind+'Key'],'role':'opaque-background' if kind=='bg' else 'transparent-foreground','filename':filename,'originalOutput':str(original),'localPath':str(local),'path':path,**meta,'visualInspection':'completed','preservation':'Original imagegen PNG copied byte-for-byte; no crop, resize, recolor or alpha editing','pixels':{'nativeGeneratedBytesPreserved':True,'postprocessing':False,'certified1to1':False,'certifiedUHD':False}})
        result['prompts'].append(prompts[c[kind+'Key']])
    result['stages'].append({'stageId':sid,'source':s['source'],'status':'integrated-candidate','fidelity':'unverified','origin':'conversation-image-generation','mode':'replace','scene':scene,'runtimeSceneId':s.get('referencePolicy',{}).get('sceneId'),'geometry':{'ceiling':c['ceiling']},'referenceIds':s.get('reference',{}).get('referenceIds',[]),'worldState':c['worldState'],'edition':c['edition'],'locationScope':c['locationScope'],'selectedSubLocation':c['locationScope'],'layers':layers,'notes':c['notes'],'supports':{'groundLineY':.87,'runtimeChange':False},'safeAreas':{'normalizedCoordinates':True,'combatFooting':[.07,.72,.86,.23],'centerClear':[.07,0,.86,1],'note':'Artwork/alpha audit only; no collision or gameplay changes'}})
    for ref in c['refs']:
        file=HERE/'references'/ref['file'];data=file.read_bytes()
        with Image.open(file) as im:width,height=im.size
        result['references'].append({'stageId':sid,**ref,'localPath':str(file),'path':str(file.relative_to(ROOT)),'bytes':len(data),'sha256':hash_bytes(data),'width':width,'height':height,'inspected':True,'sourceClaim':'Observed reference imagery; fine details, new camera and hidden geometry remain unverified'})
result['totals']={'stages':len(result['stages']),'newPNG':len(result['assets']),'bytes':sum(a['bytes']for a in result['assets']),'references':len(result['references'])}
(HERE/f'delivery-{part}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'delivery':str(HERE/f'delivery-{part}.json'),'totals':result['totals'],'assets':[{key:a[key]for key in ['stageId','role','width','height','alphaRange','qa']}for a in result['assets']]},ensure_ascii=False,indent=2))
