from pathlib import Path
from PIL import Image
from datetime import datetime, timezone
import hashlib
import json

ROOT = Path(__file__).resolve().parent
prompt_rows = json.loads((ROOT / 'prompts.json').read_text())
prompts = {row['id']: row for row in prompt_rows}
reference_records = json.loads((ROOT / 'reference-provenance.json').read_text())
reference_records = {Path(row['path']).name: row for row in reference_records}

SPECS = [
    {'id':'shf_shichibi_168','name':'Shichibi','file':'shf_shichibi_168.side.490006f1c119.png',
     'blob':'3e99adc68735c82ca0ed299fb8dd0dee307121b5','anchor':[1085,881],
     'review':'Whole connected golden fox form in right-facing lateral idle. Long narrow muzzle, upright ears, red eye, cream chest mane, four complete leg supports (near/far front legs overlap), pale shoulder ribbons and golden tail fan retained. Every readable outer extremity stays inside the image.',
     'limits':'This is the golden fully furred artwork phase, not the red patched phase. Tail fan overlap and rear root-to-tip continuity are reconstructed and not certified. The original airborne art was adapted into a static four-foot idle; source timing and exact hidden geometry remain unverified.'},
    {'id':'shf_kyubi_169','name':'Kyubi','file':'shf_kyubi_169.side.9e78e93583b4.png',
     'blob':'76a1edc11569f2bf0b0dc7c528ec3741643e2a32','anchor':[1100,846],
     'review':'Whole connected black fox form in right-facing lateral idle, four readable leg supports, narrow muzzle, tall pointed ears, blue eye/mouth, pale cool-blue shoulder ribbons and complete fringed black tail fan. It follows the dedicated Kyubi reference and is not a recolor of the Shichibi output.',
     'limits':'Tail fan root-to-tip continuity and exact count through overlapping depth cannot be certified from this static lateral reconstruction. The source airborne art was adapted into a standing idle. Hidden geometry and original timings are unverified.'},
    {'id':'shf_oi_omoi_159','name':'Oi-omoi','file':'shf_oi_omoi_159.side-closed-chest.4c0a30dbe658.png',
     'blob':'12e8c50a83965ae9fb470947349db4d9ccbae411','anchor':[435,1696],
     'review':'One connected artificial doll assemblage facing right, with multiple attached bob-haired ceramic doll heads and interlocked miniature articulated limbs, blue floral skirt, pale ruffled hem, exactly two main supporting jointed legs, white socks and complete black Mary Jane shoes. A targeted edit closes the main chest using crossed/interlocked doll arms, replacing the open rib-like panel in the first draft.',
     'limits':'The complex arrangement of small doll limbs and obscured head placements is authored from the two supplied model references, not extracted geometry. Minor local limb placement differs from the three-quarter source; no exact 1:1 certification is claimed. The original draft is retained only as an inactive variant.'},
]

def hash_file(path):
    data = path.read_bytes()
    return hashlib.sha256(data).hexdigest(), hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()

def technical(path):
    im=Image.open(path)
    alpha=im.getchannel('A')
    width,height=im.size
    bbox=alpha.point(lambda a:255 if a>=32 else 0).getbbox()
    histogram=alpha.histogram()
    return {'mode':im.mode,'format':im.format,'frames':getattr(im,'n_frames',1),'width':width,'height':height,
        'visibleBounds':list(bbox),'visibleAlphaThreshold':32,'alphaBounds':list(alpha.getbbox()),
        'maximumAlpha':alpha.getextrema()[1],
        'zeroAlphaFraction':round(histogram[0]/(width*height),6),
        'transparentFractionAlphaBelow16':round(sum(histogram[:16])/(width*height),6),
        'edgeAlphaMaximumTopBottomLeftRight':[alpha.crop(box).getextrema()[1] for box in [(0,0,width,1),(0,height-1,width,height),(0,0,1,height),(width-1,0,width,height)]],
        'minimumVisiblePaddingFraction':round(min(bbox[0]/width,bbox[1]/height,(width-bbox[2])/width,(height-bbox[3])/height),6),
        'readablePixelsTouchEdge':False,'nativePixelsPreserved':True,'pixelsModified':False}

selected=[]
for spec in SPECS:
    path=ROOT/'png'/spec['file']
    sha,blob=hash_file(path)
    assert blob==spec['blob'],(path,blob,spec['blob'])
    tech=technical(path)
    refs=[]
    for original in prompts[spec['id']]['refs']:
        p=ROOT/'references'/Path(original).name
        prior=reference_records[p.name]
        ref_sha,_=hash_file(p)
        assert ref_sha==prior['sha256']
        refs.append({'file':str(p),'path':str(p),'relativePath':'references/'+p.name,
                     'url':prior['url'],'sha256':ref_sha,'bytes':p.stat().st_size,
                     'role':prior['role'],'referenceInspectedBeforeGeneration':True,
                     'retrievedAgainThisSession':False,'copiedExact':True})
    ax,ay=spec['anchor']
    top=tech['visibleBounds'][1]
    cal={'anchor':[ax/tech['width'],ay/tech['height']],
        'bodyHeight':(ay-top)/tech['height'],'anchorPixels':[ax,ay],
        'bodyHeightPixels':ay-top,'referenceTopPixels':top,
        'referenceHeightBasis':'Complete native resting-pose silhouette envelope at alpha >= 32, including tail fan for fox profiles; a presentation calibration, not a canonical anatomical height.',
        'supportReview':'Horizontal midpoint of the visible main foot/paw supports; tail fan, head mass, small doll hands and ribbons excluded from the horizontal foot anchor.',
        'supportVisuallyReviewed':True,'wholeImageVisuallyReviewed':True,
        'runtimeGameplayReviewPerformed':False,'collisionGeometryChanged':False}
    row={'id':spec['id'],'fighterId':spec['id'],'name':spec['name'],'source':'shf',
         'sourceEdition':'Silent Hill f, supplied native official concept/model artwork mirrored by Silent Hill Memories',
         'variant':'side','status':'side-view-candidate','localPath':str(path),'file':str(path),
         'relativePath':'png/'+path.name,'sha256':sha,'gitBlobSha':blob,'gitBlobUploadVerified':True,
         'bytes':path.stat().st_size,'width':tech['width'],'height':tech['height'],
         'facing':1,'singleSubjectReviewed':True,'wholeSubjectReviewed':True,'subjectCount':1,
         'review':spec['review'],
         'limits':spec['limits']+' Requested 10% padding is not met: minimum visible padding is '+str(round(100*tech['minimumVisiblePaddingFraction'],2))+'%. Readable extremities remain inside the canvas. Low-alpha noise up to 1-2 reaches some borders; native pixels are retained without trimming, background cleanup, rescaling or recoloring.',
         'references':refs,'primaryReferencePaths':[r['relativePath'] for r in refs],
         'prompt':prompts[spec['id']]['prompt'],'promptRecord':'prompts.json',
         'exactInvocationPromptRecorded':True,'generationTool':'image_gen.imagegen',
         'transparentBackgroundRequested':True,'technical':tech,'calibrationProposal':cal,
         'fidelity':'unverified','certifiedOneToOne':False,'animatedClips':0,
         'newGenerationThisSession':True,'nativeBytesPreserved':True}
    if spec['id']=='shf_oi_omoi_159':
        row['correction']={'prompt':(ROOT/'prompt-oi-closed-chest.txt').read_text().strip(),
            'promptRecord':'prompt-oi-closed-chest.txt',
            'editTarget':'png/shf_oi_omoi_159.side.0236462da24c.png',
            'supportingReference':'references/shf-silent_hill_f_art_monster_oi-omoi_01.png',
            'visuallyReviewed':True,'result':'closed resting chest restored; all outer anatomy preserved as a candidate',
            'nativeOutputMaterialization':'Exact PNG bytes decoded from imagegen data URL after runtime recovery; imagegen returned no filesystem path.'}
    selected.append(row)

old=ROOT/'png'/'shf_oi_omoi_159.side.0236462da24c.png'
old_sha,old_blob=hash_file(old)
archive={'id':'shf_oi_omoi_159','localPath':str(old),'relativePath':'png/'+old.name,
         'sha256':old_sha,'gitBlobSha':old_blob,'bytes':old.stat().st_size,
         'technical':technical(old),'activeImportAllowed':False,
         'reason':'Initial output transferred the segmented open-looking chest from the detailed source. Superseded by the targeted closed-chest candidate.'}
delivery={'schema':1,'wave':24,'createdAt':datetime.now(timezone.utc).isoformat(),
          'scope':'Three newly generated source-guided lateral candidates: golden Shichibi, Kyubi, and closed-chest Oi-omoi. One superseded Oi-omoi draft retained. No portrait replacement, gameplay role edit, or animation claimed.',
          'generationTool':'built-in image_gen.imagegen','selected':selected,'archived':[archive],
          'limits':['No source-model extraction, exact 1:1 certification, or animation is asserted.','Runtime anchoring and gameplay-scale review remain for root integration.','No registry, test, gameplay, or git-ref changes made by this generation agent.'],
          'nextStep':'Import the three selected rows through the existing project importer, preserve portraits/clips, then inspect native gameplay framing.'}
(ROOT/'delivery.json').write_text(json.dumps(delivery,indent=2)+'\n')
(ROOT/'native-png-audit.json').write_text(json.dumps([{'id':r['id'],'path':r['relativePath'],'sha256':r['sha256'],'gitBlobSha':r['gitBlobSha'],**r['technical']} for r in selected]+[{'id':archive['id'],'path':archive['relativePath'],'sha256':old_sha,'gitBlobSha':old_blob,'activeImportAllowed':False,**archive['technical']}],indent=2)+'\n')
used_names={Path(r['relativePath']).name for row in selected for r in row['references']}
(ROOT/'reference-provenance.json').write_text(json.dumps([reference_records[n] for n in sorted(used_names)],indent=2)+'\n')
print(json.dumps({'selected':len(selected),'archived':1,'delivery':str(ROOT/'delivery.json'),'nativeBytes':sum(r['bytes'] for r in selected),'ids':[r['id'] for r in selected]},indent=2))
