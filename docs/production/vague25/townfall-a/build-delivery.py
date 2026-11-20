import json, pathlib, datetime, hashlib
OUT=pathlib.Path(__file__).parent
references=json.loads((OUT/'reference-provenance.json').read_text())['references']
ids=['townfall_lunger','townfall_sorrowful','townfall_fallen']
reviews={
 'townfall_lunger': 'Profil droit entier de Lunger, debout : tête organique asymétrique à bord noir intégré, deux bras repliés retenus par les sangles, doigts retenus près du torse, deux jambes minces et deux pieds complets dirigés à droite. Aucun poing libre, arme tenue, membre supplémentaire ou fond opaque visible. La lecture latérale du torse est étroite et cohérente avec les pieds.',
 'townfall_sorrowful': 'Profil droit entier de Sorrowful : tête à sillons asymétriques, deux mains rapprochées du sternum, petit tube translucide à raccords bleu et rouge, vêtement pelvien gris, deux jambes et deux pieds superposés mais complets. Le torse montre son côté étroit ; le petit tube ne devient pas un fouet. Aucun membre supplémentaire ou extrémité coupée observé.',
 'townfall_fallen': 'Profil droit entier de Fallen, DEBOUT comme dans le concept final 04 : épaules contractées, tête terminale creuse, torse maigre, deux bras aux doigts recourbés, deux jambes longues et deux pieds complets, deux petits filaments sombres entièrement cadrés. Le dos et le torse restent latéraux malgré les deux avant-bras portés vers l’avant. Pas de quadrupédie, socle ou flaque ajoutés.'
}
common='Reconstruction statique guidée par les références ; aucun profil source exact, côté opposé, modèle tournant ou timing original disponible. Le côté caché, l’épaisseur, les surfaces et les petites asymétries sont reconstruits. Fidélité unverified, sans certification 1:1. Le miroir est une présentation uniquement. Les ancres et hauteurs sont des propositions à contrôler dans le moteur ; elles ne certifient pas l’échelle canonique. Aucun nouveau portrait, clip animé ou changement de rôle.'
limits={
 'townfall_lunger': 'Les trajets et le nombre précis des sangles/boucles ne sont pas mesurés ; leur construction latérale reste approximative. Marges verticales très réduites (8 px au-dessus et 19 px au-dessous du seuil alpha8) : les extrémités sont entières, mais la cible de marge généreuse du prompt n’est pas atteinte. Un bruit alpha1 existe au bord ; aucun sujet visible ne touche ce bord. '+common,
 'townfall_sorrowful': 'Le trajet exact de la petite tubulure, les plis et le masquage du bras/jambe éloignés sont reconstruits. Marges réelles supérieures/inférieures de 26/71 px au seuil alpha8, inférieures à la cible généreuse demandée. '+common,
 'townfall_fallen': 'Source : concept final, pas rendu du modèle commercial certifié. La contraction des épaules et le dos vus de côté sont reconstruits ; le statut concept est conservé. Marges réelles de 66/86 px au seuil alpha8, inférieures à la cible généreuse demandée. '+common
}
anchorX={'townfall_lunger':0.48,'townfall_sorrowful':0.48,'townfall_fallen':0.49}
selected=[];technical=[];visual=[];receipts=[]
for fid in ids:
 t=json.loads((OUT/('technical-'+fid+'.json')).read_text());technical.append(t)
 r=json.loads((OUT/('receipt-'+fid+'.json')).read_text());receipts.append(r)
 p=pathlib.Path(t['localPath']);native=pathlib.Path(t['nativePath'])
 assert hashlib.sha256(p.read_bytes()).hexdigest()==t['sha256']==hashlib.sha256(native.read_bytes()).hexdigest()
 assert t['mode']=='RGBA' and t['alpha0Fraction']>0.5
 bbox=t['visibleBoundsAlpha32'];anchorY=bbox[3]/t['height'];bodyHeight=(bbox[3]-bbox[1])/t['height']
 cal={'facing':1,'anchor':[anchorX[fid],anchorY],'bodyHeight':bodyHeight,'basis':'Proposition après inspection native : centre horizontal approximatif des pieds, contact au point bas de la semelle/des orteils proches, enveloppe alpha32. Le pied éloigné est légèrement plus haut dans la pose. À vérifier en moteur.'}
 refs=[]
 for ref in references:
  if ref['fighterId']!=fid:continue
  q=dict(ref);q['file']=q['localPath'];q['path']=q['localPath'];refs.append(q)
 entry={'fighterId':fid,'source':'townfall','edition':'Silent Hill: Townfall — final concept artwork' if fid=='townfall_fallen' else 'Silent Hill: Townfall — final in-game model promotional render','rolePreserved':'combatant','combatEnabled':True,'usage':'combat-lateral-candidate','localPath':str(p),'relativePath':str(p.relative_to(OUT)),'nativePath':str(native),'sha256':t['sha256'],'sourceSHA256':t['sha256'],'bytes':t['bytes'],'width':t['width'],'height':t['height'],'facing':1,'calibrationProposal':cal,'singleSubjectReviewed':True,'wholeSubjectReviewed':True,'subjectCount':1,'review':reviews[fid],'limits':limits[fid],'fidelity':'unverified','certifiedOneToOne':False,'animatedClips':0,'references':refs,'generationReceipt':'receipt-'+fid+'.json','technical':t,'nativeBytesPreserved':True,'externalVisualQA':'Peer visual check is recorded separately; runtime integration QA pending root.'}
 selected.append(entry)
 visual.append({'fighterId':fid,'file':str(p),'sha256':t['sha256'],'status':'accepted-as-candidate','observations':reviews[fid],'limits':limits[fid],'calibrationProposal':cal,'wholeSubjectReviewed':True,'strictRightProfileReviewed':True,'sourceReferencePaths':[q['relativePath'] for q in refs],'reviewer':'generate_ascension_missing','independentOfGenerator':False,'runtimeReviewed':False})
(OUT/'technical.json').write_text(json.dumps(technical,ensure_ascii=False,indent=2)+'\n')
(OUT/'visual-review.json').write_text(json.dumps({'schema':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewScope':'Native source-to-output silhouette/limb/orientation review, not runtime or fidelity certification','acceptedCandidates':3,'hold':0,'certifiedOneToOne':False,'entries':visual},ensure_ascii=False,indent=2)+'\n')
(OUT/'generation-receipts.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2)+'\n')
delivery={'schema':1,'wave':25,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Three genuinely missing dedicated combat lateral candidates for existing Townfall portraits; no registry/core/git edits by this sublot.','selected':selected,'archived':[],'excluded':[],'generationCalls':3,'successfulNativeOutputs':3,'newRefusals':[],'priorRefusalsRespected':True,'retainedClips':'All existing static idle semantics and portraits to be preserved by root importer.','newAnimatedClips':0,'newSelectionPortraits':0,'certifiedOneToOne':False,'limits':[common,'Fallen follows the upright final concept rather than the old corpus rampant poseRig.','Only root may import, rebuild or publish; runtime QA not covered by this delivery.'],'supportingFiles':['prompts.json','reference-provenance.json','scope-audit.json','generation-receipts.json','technical.json','visual-review.json','peer-visual-review.json','README.md']}
(OUT/'delivery.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'selected':[{'fighterId':x['fighterId'],'sha256':x['sha256'],'calibration':x['calibrationProposal']} for x in selected]},ensure_ascii=False,indent=2))
