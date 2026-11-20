"""Record native PNGs without editing their pixels or integrating any registry."""
from pathlib import Path
import hashlib, json
from datetime import datetime, timezone
from PIL import Image

ROOT=Path(__file__).resolve().parents[4]
HERE=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()

def asset(stage_id, layer_id, filename, prompt_key, original):
    p=HERE/'png'/filename; b=p.read_bytes(); im=Image.open(p); rgba=im.convert('RGBA')
    a=rgba.getchannel('A'); h=a.histogram(); w,he=im.size; n=w*he
    center=a.crop((round(w*.07),0,round(w*.93),he))
    foot=a.crop((round(w*.07),round(he*.72),round(w*.93),round(he*.95)))
    source_bytes=Path(original).read_bytes()
    assert b==source_bytes, 'Native output changed'
    assert im.size==(1672,941), im.size
    if layer_id=='near-edges':
        assert im.mode=='RGBA' and h[0]/n>.90
        assert center.getextrema()[1]<=2 and foot.getextrema()[1]<=2
    else:
        assert a.getextrema()==(255,255)
    s=sha(b); dest=f'assets/stages/{stage_id}.{layer_id}.{s[:12]}.png'
    return {'stageId':stage_id,'promptKey':prompt_key,'role':'transparent-foreground' if layer_id=='near-edges' else 'opaque-background','filename':filename,'originalOutput':original,'localPath':str(p),'path':dest,'width':w,'height':he,'mode':im.mode,'bytes':len(b),'sha256':s,'pixelSHA256':sha(rgba.tobytes()),'alphaRange':list(a.getextrema()),'qa':{'fullyTransparentFraction':h[0]/n,'semiTransparentPixels':sum(h[1:255]),'opaqueFraction':h[255]/n,'centerAlphaMax':center.getextrema()[1],'footBandAlphaMax':foot.getextrema()[1],'nonzeroAlphaInCenter':sum(center.histogram()[1:]),'nativeTraceAlphaPreserved':True},'visualInspection':'completed-native-plate-only','visualNotes':'Empty source-guided scene or sparse matching edge overlay inspected; runtime QA belongs to integration. Native foreground traces of alpha 1-2 are retained, not digitally cleared.','preservation':'Native imagegen PNG preserved byte-for-byte by immutable hardlink; no crop, resize, recolor, alpha edit or recompression','pixels':{'nativeGeneratedBytesPreserved':True,'postprocessing':False,'certified1to1':False,'certifiedUHD':False}}

def main():
    definitions=json.loads((ROOT/'data/stages.json').read_text()); by_id={x['id']:x for x in definitions}
    results=[]
    for name in ['generation-results-a.json','generation-results-foreground-a.json']:
        results+=json.loads((HERE/name).read_text())
    result_by_key={x['key']:x for x in results}
    specs=[
      {'id':'nightmare_theater','layer':'bg-caliban-cave','scene':'origins-artaud-otherworld-caliban-cave','scope':'Artaud Theater, Otherworld cave beyond the stage mirror, Caliban encounter','edition':'Silent Hill: Origins (2007 PSP); official strategy guide gameplay captures, PDF page82, printed81','ceiling':True,'references':['origins-guide-native-page-082.jpeg'],'notes':['Primary source is the official strategy guide page82, printed81, actual Caliban gameplay panels. The earlier cave-painted stage scenery is not used as the actual combat cave.','Rock wall, gravel floor and rectangular mirror exit follow the captured cave. Side-on spacing, hidden surfaces and diffuse lighting are authored adaptations.','No Caliban, Travis, symbols, page decoration, fire, new hazard or normal-world theater auditorium is included.']},
      {'id':'nightmare_school','layer':'bg-paparazzi-courtyard','scene':'shsm-midwich-paparazzi-courtyard','scope':'Midwich High School, Nightmare3, courtyard at the first Paparazzi window','edition':'Silent Hill: Shattered Memories (2009 Wii), walkthrough screenshot3b and its location text','ceiling':False,'references':['shsm-school-courtyard-walkthrough.jpg'],'notes':['The small native screenshot3b shows the camera phone framing the courtyard window; only the background window, brickwork and low overhang are architectural evidence. The guide identifies the first Paparazzi courtyard point and red-lit window.','Phone, hand, reticle, people and puzzle are excluded. The larger wall span, window-mullion spacing, frost detail and side-on courtyard geometry are adaptations because the source is only200x150.','No frozen couple, chase, puzzle, door-unlock event, falling snow or source cadence is reproduced.']},
      {'id':'nightmare_mall_sm','layer':'bg-gumball-hall','scene':'shsm-toluca-gumball-hall-frozen','scope':'Toluca Mall, Nightmare5, frozen Gumball hall after Garage Access South and before thaw','edition':'Silent Hill: Shattered Memories (2009 Wii), walkthrough screenshot6a and its location text','ceiling':True,'references':['shsm-mall-gumball-walkthrough.jpg'],'notes':['The native screenshot6a shows a low enclosed hall, frozen wall, angular rear/right ice and square tiled floor; its oval machine sign is intentionally an abstract frosted panel consistent with the existing stage scope.','This is the Gumball room after Garage Access South, not the previous Tookie atrium or the roof. Frozen people, dispenser, puzzle colors, toucan statue and player are absent.','The broader side-on room, unseen left extent, texture scale and ice geometry are adaptations from the200x150 source, not certified1:1.']}
    ]
    assets=[]; stages=[]
    for spec in specs:
        sid=spec['id']; src=by_id[sid]; layers=[]
        for suffix,lid,filename,parallax in [('bg',spec['layer'],sid+'.bg.png',0),('fg','near-edges',sid+'.near-edges.png',.006)]:
            key=sid+'-'+suffix+'-wave26';out=asset(sid,lid,filename,key,result_by_key[key]['originalOutput']);assets.append(out)
            frame={k:out[k] for k in ['sha256','bytes','width','height','path']}
            layers.append({'id':lid,'rect':[0,0,1,1],'fit':'cover','ticksPerFrame':1,'loop':False,'parallaxX':parallax,'frames':[frame]})
        stages.append({'stageId':sid,'source':src['source'],'status':'integrated-candidate','fidelity':'unverified','origin':'conversation-image-generation','mode':'replace','scene':spec['scene'],'runtimeSceneId':src['referencePolicy'].get('sceneId'),'geometry':{'ceiling':spec['ceiling']},'referenceIds':src['reference']['referenceIds'],'worldState':src['referencePolicy']['worldState'],'edition':spec['edition'],'locationScope':spec['scope'],'selectedSubLocation':spec['scope'],'layers':layers,'notes':spec['notes']+['One opaque static background and one sparse transparent edge foreground. No new animated clip, source cadence, collision or gameplay change. In-engine QA deferred to root integration.'],'supports':{'groundLineY':.87,'runtimeChange':False},'safeAreas':{'normalizedCoordinates':True,'combatFooting':[.07,.72,.86,.23],'centerClear':[.07,0,.86,1],'note':'Visible overlay absent from the central86percent; tiny native alpha1-2 traces are explicitly measured and preserved. Artwork audit only, no collision changes.'}})
    refspec=[
      ('nightmare_theater','origins-guide-native-page-082.jpeg','https://www.silenthillmemories.net/publications/guides/silent_hill_origins_official_strategy_guide.pdf','PDF page82, printed81, middle-left and lower two gameplay panels. Ignore monster closeup and page ornaments.','Native embedded JPEG extracted from the official guide without resampling. Original PDF SHA256f38b8418256264266e8c4ba78b22bc4aaa76084bc9a5eecc9f89325e679dbd80; xref recorded separately.'),
      ('nightmare_school','shsm-school-courtyard-walkthrough.jpg','https://www.silenthillmemories.net/sh_shattered_memories/walkthrough/walkthrough_puzzle_3b.jpg','Architecture behind phone only; source200x150 limits full-yard reconstruction.','Native gameplay screenshot downloaded unchanged; source guide https://www.silenthillmemories.net/sh_shattered_memories/walkthrough_06_nightmare_3_school_en.htm'),
      ('nightmare_mall_sm','shsm-mall-gumball-walkthrough.jpg','https://www.silenthillmemories.net/sh_shattered_memories/walkthrough/walkthrough_puzzle_6a.jpg','Frozen hall architecture behind player; do not reproduce figures or machine.','Native gameplay screenshot downloaded unchanged; source guide https://www.silenthillmemories.net/sh_shattered_memories/walkthrough_10_nightmare_5_toluca_mall_en.htm')
    ]
    refs=[]
    for sid,name,url,panels,claim in refspec:
        p=HERE/'references'/name;b=p.read_bytes();im=Image.open(p)
        refs.append({'stageId':sid,'file':name,'localPath':str(p),'path':p.relative_to(ROOT).as_posix(),'url':url,'selectedPanels':panels,'bytes':len(b),'sha256':sha(b),'width':im.width,'height':im.height,'inspected':True,'sourceClaim':claim})
    prompts=[]
    for name in ['prompts-background-a.json','prompts-foreground-a.json']:prompts+=json.loads((HERE/name).read_text())
    out={'schemaVersion':1,'group':'vague26-stages-a','scope':'Three missing static stage candidates; six independent native planes only','createdAt':datetime.now(timezone.utc).isoformat(),'baseCommit':'8c2b56320ceb9fd5490660cb8e20a2dbf62c57bb','deliveryState':'ready-for-root-integration','stages':stages,'assets':assets,'references':refs,'prompts':prompts,'visualQA':{'kind':'native-plate-inspection-only','allSixGeneratedPlatesInspected':True,'notAnInEngineTest':True,'noPixelPostprocessing':True,'oneToOneCertified':False},'pendingReservedStages':['cedar_grove','antique_shop','frozen_streets']}
    path=HERE/'integration-delivery-a.json'
    if path.exists(): raise SystemExit('Preserve existing delivery; write a distinct revision explicitly.')
    path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'path':str(path),'stages':len(stages),'assets':len(assets),'bytes':sum(x['bytes'] for x in assets),'foregroundTransparentFractions':[x['qa']['fullyTransparentFraction'] for x in assets if x['role']=='transparent-foreground']},indent=2))

if __name__=='__main__':main()
