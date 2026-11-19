from pathlib import Path
from PIL import Image
import os, json, hashlib, datetime

ROOT = Path(__file__).parent
REPO = Path('/workspace/scratch/silent-hill-wave22')
d = json.loads((ROOT / 'delivery.json').read_text())
prompts = json.loads((ROOT / 'prompts.json').read_text())
variants = [
    ('light', 'bom_light_guardian_140.front-variant.v1.png', 'Angle frontal écarté au profit du profil v2.'),
    ('water', 'bom_water_guardian_141.side-right.v1.png', 'Halo autour du corps, cadrage trop serré et crête dorsale surinterprétée.'),
    ('water_v2', 'bom_water_guardian_141.side-right.v2.png', 'Fond corrigé mais crête crochue non attestée ; remplacée par v3.'),
    ('earth', 'bom_earth_guardian_142.side-right.v1.png', 'Angle encore trois-quarts ; remplacé par profil v2.'),
    ('insane', 'bom_insane_cancer_126.side-right.v1.png', 'Halo de fond et angle trois-quarts ; remplacé par profil v2.'),
]
by_key = {p['key']: p for p in prompts}
import re
archived = []
for key, name, reason in variants:
    source = Path(re.search(r'as (/[^\n]+\.png) by default', by_key[key]['output']).group(1))
    dest = ROOT / 'variants' / name
    if not dest.exists(): os.link(source, dest)
    raw = dest.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == hashlib.sha256(source.read_bytes()).hexdigest()
    archived.append({'fighterId':by_key[key]['id'], 'localPath':str(dest), 'sha256':hashlib.sha256(raw).hexdigest(), 'bytes':len(raw), 'reason':reason, 'integrate':False})

triage = json.loads((REPO / 'docs/production/vague19/missing-triage.json').read_text())
initial_ids = ['arcade_numb_body_arcade', 'arcade_nurse_arcade', 'film_dark_nurse_171', 'shf_hinako_s_mother_165', 'film_missionary_revelation_177', 'arcade_robbie_the_rabbit_shotgun']
blocked = []
for id in initial_ids:
    e = next(x for x in triage['entries'] if x['id'] == id)
    entry = {'fighterId':id, 'status':'deferred', 'category':e['category'], 'reason':e['reason'], 'generationAttemptedWave22':False, 'historicalEvidence':'docs/production/vague19/missing-triage.json', 'requestId':e.get('requestId'), 'refusalKind':e.get('refusalKind'), 'runtimeChanged':False}
    if id == 'film_missionary_revelation_177':
        entry.update({'freshResearch':'Limited web lookup of the Revelation costume/FX production notes; no newly inspected native full-body final-costume image resolved the shoes/supports. No generation.', 'consultedURLs':['https://metrofilms.com/media/SILENT%2BHILL%2BREVELATION%2B_DP.2f567193-6530-47a3-8d88-0812d7e85589.pdf','https://www.comingsoon.net/horror/news/724338-excl-talking-silent-hill-revelations-monster-fx-with-paul-jones/xwp_curated_content'], 'sourceReadScope':'Search result excerpts only for these new URLs; full PDF not visually inspected in this wave.', 'nextAction':'Inspect a final-costume native full-body frame or production photo showing the actual footwear before generating a full-body sprite.'})
    elif id == 'arcade_robbie_the_rabbit_shotgun':
        entry.update({'freshResearch':'Limited web lookup found native-model and bestiary entry points, but no inspected evidence resolving Robbie_Rifle.obj versus the Shotgun profile; no gun or variant inferred.', 'consultedURLs':['https://models.spriters-resource.com/arcade/silenthillthearcade/asset/340933/page-1/','https://www.silenthillmemories.net/sh_arcade/creatures_en.htm'], 'sourceReadScope':'Search result discovery; no model download or weapon render inspected in wave22.', 'nextAction':'Verify the complete weapon carried by the exact Arcade Robbie variant; any catalogue correction requires source evidence and separate integration.'})
    else:
        entry.update({'freshResearch':'Historical refusal checked locally; not retried, no reformulation used to bypass it.', 'nextAction':'Preserve historical blocked status; do not retry unchanged content.'})
    blocked.append(entry)

proofs=[]
for r in d['selected']:
    binary=Path(r['localPath']).read_bytes()
    assert hashlib.sha256(binary).hexdigest()==r['sha256']
    im=Image.open(r['localPath']);assert im.mode=='RGBA';a=im.getchannel('A');h=a.histogram()
    assert h[0]>0 and sum(h[250:])>0
    b=r['visibleBounds'];assert b[0]>0 and b[1]>0 and b[2]<im.width and b[3]<im.height
    assert r['existingAnimatedClipCount']==0
    refs=[]
    for ref in r['references']:
        assert hashlib.sha256(Path(ref['localPath']).read_bytes()).hexdigest()==ref['sha256']
        refs.append(ref['id'])
    proofs.append({'fighterId':r['fighterId'],'fileSHA256Verified':True,'trueAlphaVerified':True,'completeAlpha32BoundsInsideCanvas':True,'existingAnimatedClips':0,'referencesSHA256Verified':refs,'pixelEditingPerformed':False})

d.update({'closed':True,'closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'subLot':'final-consolidated','activePNGCount':len(d['selected']),'activePNGBytes':sum(x['bytes'] for x in d['selected']),'generationCalls':len(prompts),'archivedVariants':archived,'variantCount':len(archived),'deferredInitialTargets':blocked,'newPortraits':0,'newAnimatedClips':0,'certifiedOneToOne':0,'newDuelsEnabled':0,'usageCounts':{'existingCombatantsWithNewStaticLateralViews':5,'scriptedPursuersWithPresentationOnlyLateralView':1},'verification':proofs,'runtimeQA':'Performed separately by parent after import; no engine test or animation timing certification claimed by this art delivery.'})
for name in ['delivery.json','delivery-final.json']:(ROOT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
(ROOT/'deferred-targets.json').write_text(json.dumps({'schema':1,'wave':22,'initialTargets':blocked,'historicalRefusalsRetried':0,'imageGenerationRefusalsWave22':0},ensure_ascii=False,indent=2)+'\n')
(ROOT/'final-verification.json').write_text(json.dumps({'schema':1,'wave':22,'generationCalls':len(prompts),'accepted':len(d['selected']),'archivedVariants':len(archived),'proofs':proofs,'certifiedOneToOne':0,'runtimeModified':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'selected':len(d['selected']),'bytes':d['activePNGBytes'],'calls':len(prompts),'variants':len(archived),'deferred':len(blocked),'finalSHA256':hashlib.sha256((ROOT/'delivery-final.json').read_bytes()).hexdigest()},ensure_ascii=False))
