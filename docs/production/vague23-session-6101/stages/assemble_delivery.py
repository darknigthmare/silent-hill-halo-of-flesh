"""Describe native files only. No raster writes or pixel transformations."""
from pathlib import Path
from PIL import Image
import json, hashlib, datetime

R = Path(__file__).resolve().parent
REPO = R.parents[3]
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
specs = json.loads((R/'stage-specs.json').read_text())
outputs = json.loads((R/'outputs.json').read_text())
source = {s['id']:s for s in json.loads((REPO/'data/stages.json').read_text())}
prompts = []
for name in ['prompts-bg-first.json','prompts-bg-second.json','prompts-fg-first.json','prompts-fg-second.json']:
    prompts += json.loads((R/name).read_text())
prompts.append(json.loads((R/'prompt-blood-correction.json').read_text()))

def audit(p):
    b = p.read_bytes()
    with Image.open(p) as im:
        im.load()
        assert im.format == 'PNG' and not getattr(im,'is_animated',False)
        rgba = im.convert('RGBA'); al = rgba.getchannel('A'); w,h=im.size
        center=al.crop((int(w*.08),0,int(w*.92),h))
        feet=al.crop((int(w*.08),int(h*.75),int(w*.92),int(h*.9)))
        return {'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'width':w,'height':h,
                'mode':im.mode,'alphaRange':list(al.getextrema()),
                'centerAlphaMax':center.getextrema()[1],'footBandAlphaMax':feet.getextrema()[1],
                'transparentRatio':al.histogram()[0]/(w*h),
                'pixelSHA256':hashlib.sha256(rgba.tobytes()).hexdigest()}

assets=[]; stages=[]; audits=[]
for spec in specs:
    sid=spec['stageId']; s=source[sid]; selected=[o for o in outputs if o['filename'].startswith(sid+'.')]
    assert len(selected)==2 and not s['reference']['blocked']
    layers=[]
    for i,o in enumerate(selected):
        local=R/'images'/o['filename']; original=Path(o['originalOutput'])
        m=audit(local)
        assert original.read_bytes()==local.read_bytes(), 'Native generated file changed'
        assert (m['width'],m['height'])==(1672,941)
        if i==0: assert m['alphaRange']==[255,255]
        else: assert m['alphaRange']==[0,255] and m['footBandAlphaMax']<=1
        slug=local.stem.split('.',1)[1]
        path='assets/stages/'+sid+'.'+slug+'.'+m['sha256'][:12]+'.png'
        a={'promptKey':o['key'],'filename':o['filename'],'originalOutput':o['originalOutput'],
           'localPath':str(local),'stageId':sid,'role':'opaque-background' if i==0 else 'transparent-foreground',
           'path':path,**m,
           'nativeByteEqualityVerified':True,'visualInspection':'completed',
           'pixels':{'nativeGeneratedBytesPreserved':True,'postprocessing':False,'certified1to1':False,'certifiedUHD':False},
           'qa':{'footingLineNormalizedY':0.825,'footBandAlphaMax':m['footBandAlphaMax'] if i else None,
                 'visualOutcome':'source-guided versus candidate; fidelity unverified',
                 'browserTest':False,'engineTest':False}}
        assets.append(a); audits.append({'file':o['filename'],**m})
        layers.append({'id':slug,'rect':[0,0,1,1],'fit':'cover','ticksPerFrame':1,'loop':False,
                       'parallaxX':0 if i==0 else .006,
                       'frames':[{k:a[k] for k in ['path','sha256','bytes','width','height']}]})
    stages.append({'stageId':sid,'source':s['source'],'status':'integrated-candidate','fidelity':'unverified',
       'origin':'conversation-image-generation','mode':'replace','scene':spec['scene'],
       'runtimeSceneId':s.get('referencePolicy',{}).get('sceneId'),'geometry':{'ceiling':spec['ceiling']},
       'referenceIds':s['reference']['referenceIds'],'worldState':s['referencePolicy']['worldState'],
       'edition':spec['edition'],'locationScope':spec['locationScope'],'selectedSubLocation':spec['locationScope'],
       'supports':{'description':spec['support'],'groundLineY':.825,'runtimeChange':False},
       'safeAreas':{'normalizedCoordinates':True,'combatFooting':[.08,.75,.84,.15],
                    'centerClear':[.08,0,.84,1],
                    'foregroundMaximumAlphaInFootBand':assets[-1]['footBandAlphaMax'],
                    'note':'Measured alpha; values0–1/255 are preserved native traces, not falsely called all zero.'},
       'layers':layers,'referenceFiles':spec['sourceFiles'],
       'notes':[spec['locationScope'],*spec['observations'],*spec['limits'],
          'Two independent static PNG planes; foreground parallax0.006. No new original animation, hazard, transition or collision.',
          'Native1672×941 generation; no upscaling, raster retouch, automatic alpha cleanup or1:1/UHD certification.',
          'Camera position and hidden geometry are versus reconstructions; foreground margins are very sparse and do not occlude the fighting lane.']})

refs=json.loads((R/'references/downloads-bom.json').read_text())
for ref in refs:
    p=Path(ref['path']); b=p.read_bytes(); assert hashlib.sha256(b).hexdigest()==ref['sha256']
    with Image.open(p) as im: ref.update(width=im.width,height=im.height,mode=im.mode)
    ref['usedBy']=[s['stageId'] for s in specs if p.name in s['sourceFiles']]
    ref['visualInspection']='completed on native image'
    ref['sourceStatus']='published game screenshot hosted by an unofficial archive; dated launch or E3 prerelease set retained explicitly'

result={'schemaVersion':1,'group':'wave23-stages','createdAt':now,'scope':'missing stage bitmap candidates only',
  'baseCommit':'cffb58bbcb78c2bdb1381965ea0efb3e5fb54994','deliveryState':'candidate-ready-for-root-integration',
  'stages':stages,'assets':assets,'references':refs,'prompts':prompts,
  'provenance':{'generator':'integrated image_gen.imagegen','calls':10,'retainedPNG':8,
     'targetedCorrections':['Fire: remove invented platform lip and caution stripes.','Blood: remove extrapolated central disk.'],
     'discardedVariants':['variants/book_fire.initial-platform-draft.png','variants/book_blood.initial-disk-draft.png'],
     'externalPixelEditing':False,'nativePixelsPreserved':True,'noRuntimeChanges':True,
     'sourceGalleryURL':'https://www.silenthillmemories.net/sh_book_of_memories/screenshots_en.htm',
     'referenceDates':{'book_fire':'2012-10-16 US launch','book_earth':'2012-06-06 E3 prerelease','book_blood':'2012-06-06 E3 prerelease','book_water':'2012-06-06 E3 prerelease'}},
  'qa':{'visualOutputsInspected':10,'nativePNGMetadataMeasured':8,'opaqueBackgrounds':4,
     'genuineAlphaForegrounds':4,'browserTest':False,'runtimeTest':'pending parent integration',
     'candidateFidelity':'unverified','noAnimationClaim':True},
  'totals':{'stages':len(stages),'png':len(assets),'bytes':sum(a['bytes'] for a in assets)}}
(R/'delivery.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(R/'raster-audit.json').write_text(json.dumps(audits,indent=2)+'\n')
(R/'reference-inventory.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'delivery':str(R/'delivery.json'),'totals':result['totals']}))
