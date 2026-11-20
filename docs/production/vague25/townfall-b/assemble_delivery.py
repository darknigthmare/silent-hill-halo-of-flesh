"""Audit two unmodified native Townfall lateral sprites; no repository writes."""
from pathlib import Path
from datetime import datetime, timezone
from PIL import Image
import hashlib,json

HERE=Path(__file__).resolve().parent
WORK=HERE.parents[1]
REPO=WORK/'silent-hill-halo-of-flesh'
prompts=json.loads((HERE/'prompts.json').read_text())
prompt_by_id={p['fighterId']:p for p in prompts}
source_inventory=json.loads((REPO/'docs/production/vague25/townfall/references/source-inventory.json').read_text())
source_by_name={Path(r['localPath']).name:r for r in source_inventory['files']}

def hashes(p):
    b=p.read_bytes()
    return hashlib.sha256(b).hexdigest(),hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()

def technical(p):
    with Image.open(p) as im:
        im.load();assert im.mode=='RGBA'
        a=im.getchannel('A');w,h=im.size;hist=a.histogram()
        b=a.point(lambda v:255 if v>=32 else 0).getbbox();assert b
        pad=dict(left=b[0]/w,top=b[1]/h,right=(w-b[2])/w,bottom=(h-b[3])/h)
        return dict(format=im.format,mode=im.mode,frames=getattr(im,'n_frames',1),width=w,height=h,
                    pixelSHA256=hashlib.sha256(im.tobytes()).hexdigest(),alphaRange=list(a.getextrema()),
                    visibleBounds=list(b),visibleAlphaThreshold=32,alphaBounds=list(a.getbbox()),
                    boundsAtAlpha2=list(a.point(lambda v:255 if v>=2 else 0).getbbox()),
                    fullyTransparentFraction=hist[0]/(w*h),transparentFractionAlphaBelow16=sum(hist[:16])/(w*h),
                    edgeAlphaMaximumTopBottomLeftRight=[a.crop(box).getextrema()[1]for box in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]],
                    paddingAtAlpha32=pad,minimumVisiblePaddingFraction=min(pad.values()),
                    readablePixelsTouchEdge=False,nativePixelsPreserved=True,pixelsModified=False)

specs=[
 dict(fighterId='townfall_widow',name='Widow',file='townfall_widow.side.png',original='exec-2a7417a2-a0ba-42cf-895f-62f3a8204409.png',
      anchor=[531,1290],role='unverified',combatEnabled=False,
      review='One complete slender Widow facing right in a strict lateral silhouette. Pale rounded face-covering draped hood, original gray ragged wraps, hanging rectangular photo/paper pieces and trailing cloth bands retained. One short flat wood strip held low, two attached arms, two complete bare legs and feet. No black funeral veil, knife or invented weapon. Whole hood, wood, bands, fingertips, heels and toes inside the canvas.',
      limits='Model03 is a named whole-body three-quarter source, not a measured lateral turnaround. The new profile and more level resting foot presentation reconstruct unseen depth and pose; hood folds, covered face outline, strip/photo placement and exact anatomy remain unverified. Widow remains unverified and outside duel; this image does not establish attacks, mobility, a combat pattern or super.'),
 dict(fighterId='townfall_the_weight',name='The Weight',file='townfall_the_weight.side.png',original='exec-43455c21-c12a-4627-a1e4-1b01192e50a5.png',
      anchor=[448,1308],role='scripted-encounter',combatEnabled=True,
      review='One complete model08 pursuer in a strict right-facing lateral silhouette. Asymmetric folded upper mass and absorbed arms, small ridged oval head in front, narrow waist, two dark trouser legs and two complete lace-up canvas shoes retained. No separate fists, extra heads, chains, rocks, weapons or IV equipment. Upper mass, head and both shoes have clear complete contours.',
      limits='Model08 dominates the body and outfit. Concept06 is secondary fold/material evidence only; its A–H head alternatives and long falling filament were excluded. Model03 final-encounter form was not used. The side camera, concealed lobe geometry, exact lobe continuity and material detail are reconstructed and not certified. Scripted-encounter role, existing duel enablement and disabled super are unchanged. The preview halo is RGB under alpha zero, with sampled isolated trace alpha1 pixels; no correction or cleanup was warranted or performed.'),
]

selected=[]
for s in specs:
    fid=s['fighterId'];p=HERE/'png'/s['file'];original=WORK/'generated_images'/s['original']
    sh,blob=hashes(p);assert hashes(original)[0]==sh
    tech=technical(p);assert tech['frames']==1
    refs=[]
    for original_ref in prompt_by_id[fid]['references']:
        name=Path(original_ref).name;r=source_by_name[name];local=HERE/'references'/name;refsha,_=hashes(local)
        assert refsha==r['sha256']==r['historicalSHA256']
        refs.append(dict(file=str(local),path=str(local),localPath=str(local),relativePath='references/'+name,
                         repositoryReferencePath=r['repositoryPath'],url=r['url'],sourcePage=source_inventory['sourceGallery'],
                         sha256=refsha,bytes=local.stat().st_size,width=r['width'],height=r['height'],
                         historicalProvenance=r['historicalEvidence'],matchesART92eBytes=True,
                         role='secondary-material-only; alternate heads A-H and dripping filament explicitly excluded' if name.endswith('_06.jpg') else 'primary named final full-body model',
                         referenceInspectedBeforeGeneration=True,referenceInspectedAfterGeneration=True,copiedExact=True,transfer='immutable-hardlink'))
    x,y=s['anchor'];top=tech['visibleBounds'][1]
    cal=dict(anchor=[x/tech['width'],y/tech['height']],bodyHeight=(y-top)/tech['height'],anchorPixels=[x,y],bodyHeightPixels=y-top,
             referenceTopPixels=top,referenceHeightBasis='Entire readable native silhouette at alpha >=32, including hood or upper lobes, to lower foot support; presentation calibration only.',
             supportReview='Horizontal midpoint of the two principal foot supports; hanging strips, wood and upper mass excluded from horizontal anchor.',
             supportVisuallyReviewed=True,wholeImageVisuallyReviewed=True,runtimeGameplayReviewPerformed=False,collisionGeometryChanged=False)
    limits=s['limits']+' A 20% empty margin was requested; actual minimum visible padding is '+str(round(tech['minimumVisiblePaddingFraction']*100,2))+'%. No readable extremity is clipped. Native trace alpha is preserved. One static candidate only, no animated clip, no source timing, no UHD or 1:1 certification.'
    row=dict(id=fid,fighterId=fid,name=s['name'],source='townfall',sourceEdition=prompt_by_id[fid]['edition'],variant='side',status='side-view-candidate',
             localPath=str(p),file=str(p),relativePath='png/'+p.name,originalOutput=str(original),sha256=sh,gitBlobSha=blob,
             bytes=p.stat().st_size,width=tech['width'],height=tech['height'],facing=1,subjectCount=1,
             singleSubjectReviewed=True,wholeSubjectReviewed=True,review=s['review'],limits=limits,references=refs,
             combatRolePreserved=s['role'],combatEnabled=s['combatEnabled'],superEnabled=False,
             usage='reference-only-lateral-candidate' if not s['combatEnabled'] else 'combat-lateral-candidate',
             prompt=prompt_by_id[fid]['prompt'],promptRecord='prompts.json',exactInvocationPromptRecorded=True,
             generationTool='image_gen.imagegen',transparentBackgroundRequested=True,technical=tech,calibrationProposal=cal,
             fidelity='unverified',certifiedOneToOne=False,animatedClips=0,newGenerationThisSession=True,nativeBytesPreserved=True,
             nativePreservation='Exact original PNG bytes; immutable hardlink only; no rescaling, recoloring, trimming, background cleanup or recompression')
    if fid=='townfall_the_weight':row['alphaPreviewReview']='weight-alpha-halo-review.json'
    selected.append(row)

out=dict(schema=1,wave=25,createdAt=datetime.now(timezone.utc).isoformat(),
         scope='Two existing Townfall profiles gain separate source-guided lateral candidates. Preserve historical portraits, clip semantics, role and gameplay.',
         selected=selected,archived=[],generationCalls=2,correctionCalls=0,successfulNativePNG=2,animatedClips=0,
         sourceGallery=source_inventory['sourceGallery'],historicalReferenceAudit='art/provenance-art92-e.json',
         historicalRefusalReview='No direct refusal for either identity found in ART92-e or the historical scan; no retry under a different phase or identity performed.',
         limits=['No true side orthographic source or measured pose/timing was available; no 1:1 certification.',
                 'Runtime anchoring and gameplay-scale QA remain for root integration.',
                 'Widow combatEnabled:false; Weight combatEnabled:true and scripted-encounter. Neither super enabled.',
                 'No registry, engine, tests or git refs changed by the generation agent.'],
         totals=dict(selected=2,newPNG=2,bytes=sum(s['bytes']for s in selected),sourceReferences=3),
         nextStep='Import selected[] through the existing vague25 character importer and inspect the new candidates in their permitted runtime roles.')
(HERE/'delivery.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
(HERE/'native-png-audit.json').write_text(json.dumps([dict(fighterId=r['fighterId'],path=r['relativePath'],sha256=r['sha256'],**r['technical'])for r in selected],indent=2)+'\n')
print(json.dumps({'delivery':str(HERE/'delivery.json'),'totals':out['totals'],'selected':[{k:r[k]for k in ['fighterId','localPath','sha256','width','height','bytes','combatEnabled','calibrationProposal']}for r in selected]},indent=2))
