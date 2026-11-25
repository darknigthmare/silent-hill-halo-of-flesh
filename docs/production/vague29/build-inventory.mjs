/**
 * Read-only inventory of the authored manifests and current runtime contracts.
 * Only the selected JSON/Markdown reports are written; art/data/src stay untouched.
 * Works with a sparse checkout: asset presence is checked in HEAD or on disk,
 * without downloading or decoding images. No network or browser claims are made.
 *
 * node docs/production/vague29/build-inventory.mjs --output-prefix baseline-inventory
 * node docs/production/vague29/build-inventory.mjs --output-prefix final-inventory
 * Add --check to compare deterministic reports without writing them.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

const self=fileURLToPath(import.meta.url),directory=dirname(self),root=resolve(directory,'../../..');
const rel=p=>relative(root,p).replaceAll('\\','/'),read=p=>readFile(resolve(root,p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await read(p));
const mod=p=>import(pathToFileURL(resolve(root,p)).href);
const unique=a=>[...new Set(a)],sum=(a,fn)=>a.reduce((n,x)=>n+fn(x),0);
const argument=process.argv.indexOf('--output-prefix');
const prefix=argument<0?'inventory':process.argv[argument+1];
if(!/^[a-z0-9][a-z0-9_-]*$/.test(prefix||''))throw Error('--output-prefix requires a simple lowercase filename stem');
const hashes=new Map();
async function source(path,recurse=true){
  if(hashes.has(path))return;
  const bytes=await read(path);hashes.set(path,{path,sha256:hash(bytes),bytes:bytes.length});
  if(recurse&&path.endsWith('.js'))for(const match of bytes.toString().matchAll(/(?:import|export)\s+(?:[^;]*?\s+from\s+)?['"]([^'"]+)['"]/g)){
    if(match[1].startsWith('.'))await source(rel(resolve(root,dirname(path),match[1])));
  }
}
const modules=['src/data.js','src/sprite-manifest.js','src/sprite-usage.js','src/sprite-clips.js',
  'src/sprite-poses.js','src/stage-bitmap-manifest.js','src/stage-bitmaps.js',
  'src/projectile-bitmap-manifest.js','src/projectile-bitmaps.js','src/chronicle-art.js'];
for(const path of modules)await source(path);
const additional=['art/registry.json','art/reference-provenance-alessa.json','data/roster.json','data/sprite-coverage.json','data/content-stats.json',
  'data/coverage-audit.json','docs/production/franchise-corpus.json',
  'docs/production/vague28/summary.json','docs/production/vague28/remaining-assets.json',rel(self)];
for(const path of additional)await source(path,false);
const [{ROSTER,STAGES,CHRONICLES,SOURCE_META,createCombatProfile,MOVESET_KEYS},
  {SPRITES},{spriteUsage},{clipSummary},{weaponIdleClipKeys,BASE_POSE_KEYS,PRESENTATION_KEYS},
  {STAGE_BITMAPS},{stageBitmapFor,stageBitmapRooms},{PROJECTILE_BITMAPS},{projectileBitmapFor},
  {chronicleArtwork}]=await Promise.all(modules.map(mod));
const registry=(await json('art/registry.json')).assets;
const publishedCoverage=await json('data/sprite-coverage.json');
const historical=await json('docs/production/vague28/summary.json');
const previousRemaining=await json('docs/production/vague28/remaining-assets.json');
const previousReasons=new Map(previousRemaining.characters.map(c=>[c.fighterId,c]));
const contentStats=await json('data/content-stats.json');
const corpus=await json('docs/production/franchise-corpus.json');
const alessaWeaponEvidence=await json('art/reference-provenance-alessa.json');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}).trim();
const sourceCommit=git('rev-parse','HEAD');
const tree=git('ls-tree','-r','-z','HEAD','--','assets').split('\0').filter(Boolean);
const headAssets=new Map(tree.map(entry=>{const split=entry.indexOf('\t');return [entry.slice(split+1),entry.slice(0,split).split(' ')[2]];}));
const assetReferences=new Map();
function asset(frame,kind){
  if(!frame?.path)return null;
  const existing=assetReferences.get(frame.path);
  if(existing){if(!existing.kinds.includes(kind))existing.kinds.push(kind);return frame.path;}
  assetReferences.set(frame.path,{path:frame.path,kinds:[kind],sha256:frame.sha256??null,
    width:frame.width??null,height:frame.height??null,bytes:frame.bytes??null,
    inHead:headAssets.has(frame.path),headBlob:headAssets.get(frame.path)??null,
    availableOnDisk:headAssets.has(frame.path)?null:existsSync(resolve(root,frame.path))});
  return frame.path;
}
const comparisons=[];
function compare(name,stored,recomputed,meaning='Same definition; mismatch indicates a stale derived report.'){
  comparisons.push({name,stored,recomputed,equal:JSON.stringify(stored)===JSON.stringify(recomputed),meaning});
}
const profiles=ROSTER.map(fighter=>{
  const art=registry[fighter.id],built=SPRITES[fighter.id],usage=spriteUsage(built),runtime=createCombatProfile(fighter);
  if(art||built){
    assert.ok(art&&built,'Missing authoring or built record: '+fighter.id);
    assert.equal(art.fighterId,built.fighterId);assert.equal(art.source,built.source);
    assert.deepEqual(art.clips,built.clips,'Authoring/generated clip mismatch: '+fighter.id);
    const signature=frame=>frame?[frame.path,frame.sha256,frame.width,frame.height]:null;
    assert.deepEqual(art.frames.map(signature),built.frames.map(signature),'Authoring/generated frame mismatch: '+fighter.id);
    assert.deepEqual(signature(art.portrait),signature(built.portrait),'Authoring/generated portrait mismatch: '+fighter.id);
  }
  const clips=Object.entries(built?.clips||{}).map(([key,clip])=>({key,...clipSummary(built,clip),
    paths:unique((clip.frames||[]).map(index=>built.frames[index]?.path).filter(Boolean))}));
  const portraitPath=asset(built?.portrait,'portrait');
  for(const frame of built?.frames||[])asset(frame,'sprite-frame');
  const idle=clips.find(c=>c.key==='idle');
  const weaponKeys=weaponIdleClipKeys(fighter);
  const reason=previousReasons.get(fighter.id);
  return {id:fighter.id,name:fighter.name,source:fighter.source,category:fighter.category,boss:!!fighter.boss,
    variant:fighter.variant??null,variantOf:fighter.variantOf??null,
    selectionAvailable:usage.selection,portraitPath,combatView:usage.combatView,
    separateSelectionAndCombat:usage.separateSelectionAndCombat,
    idlePaths:idle?.paths||[],idleAnimated:idle?.animated||false,
    frameCount:built?.frames.length||0,clips,animatedClips:clips.filter(c=>c.animated).length,
    sourceRole:runtime.referencePolicy.role,combatEnabled:runtime.referencePolicy.combatEnabled,
    fidelity:built?.fidelity??'not-assessed',
    missingReason:usage.combatView==='side-view-candidate'?null:reason?.reason??null,
    requiredEvidenceOrAction:usage.combatView==='side-view-candidate'?null:reason?.requiredEvidenceOrAction??null,
    weaponIdles:{keys:weaponKeys,present:weaponKeys.filter(k=>built?.clips[k]),missing:weaponKeys.filter(k=>!built?.clips[k]),
      missingEvidence:weaponKeys.filter(k=>!built?.clips[k]).map(key=>({key,
        source:fighter.id==='sh3_memory_of_alessa_049'&&key.endsWith(':smg')?'art/reference-provenance-alessa.json':null,
        reason:fighter.id==='sh3_memory_of_alessa_049'&&key.endsWith(':smg')?alessaWeaponEvidence.missingWeapon?.generationOutcome??null:null}))},
    weaponPhaseKits:(runtime.moveset.weaponPhases||[]).map(phase=>({id:phase.id,
      enabledCommandKeys:MOVESET_KEYS.filter(k=>phase.moves[k]?.enabled===true),
      disabledCommandKeys:MOVESET_KEYS.filter(k=>phase.moves[k]?.enabled===false)}))};
});
function characterCounts(rows){return {totalProfiles:rows.length,portraits:rows.filter(p=>p.selectionAvailable).length,
  missingPortraits:rows.filter(p=>!p.selectionAvailable).length,sideViewCandidates:rows.filter(p=>p.combatView==='side-view-candidate').length,
  legacyToReview:rows.filter(p=>p.combatView==='legacy-unreviewed').length,missingCombat:rows.filter(p=>p.combatView==='missing').length,
  separateSelectionAndCombat:rows.filter(p=>p.separateSelectionAndCombat).length,
  combatEnabled:rows.filter(p=>p.combatEnabled).length,certified:rows.filter(p=>p.fidelity==='verified').length};}
const characters=characterCounts(profiles);
const stages=STAGES.map(stage=>{
  const art=STAGE_BITMAPS[stage.id];
  let selected=null,error=null;
  try{selected=stageBitmapFor(stage);}catch(e){error=e.message;}
  const rooms=stageBitmapRooms(art).map(room=>({scene:room.scene??null,
    selected:room===selected,layerCount:room.layers.length,
    parallax:room.layers.some(layer=>!!layer.parallaxX),
    layers:room.layers.map(layer=>({id:layer.id,parallaxX:layer.parallaxX||0,
      paths:layer.frames.map(frame=>asset(frame,'stage-plane'))}))}));
  return {id:stage.id,name:stage.name,source:stage.source,registered:!!art,active:!!selected,
    blocked:!!stage.reference?.blocked,requiredScene:stage.referencePolicy?.sceneId||null,
    fidelity:art?.fidelity??'not-assessed',rooms,error};
});
const allRooms=stages.flatMap(s=>s.rooms),selectedRooms=allRooms.filter(r=>r.selected);
const allStagePaths=unique(allRooms.flatMap(r=>r.layers.flatMap(l=>l.paths)));
const selectedStagePaths=unique(selectedRooms.flatMap(r=>r.layers.flatMap(l=>l.paths)));
const stageSummary={total:stages.length,active:stages.filter(s=>s.active).length,missing:stages.filter(s=>!s.active).length,
  missingWithReferenceBlocked:stages.filter(s=>!s.active&&s.blocked).length,
  missingWithoutBlockFlag:stages.filter(s=>!s.active&&!s.blocked).length,
  registeredRooms:allRooms.length,registeredPlaneFiles:allStagePaths.length,
  selectedDefaultPlaneFiles:selectedStagePaths.length,selectedDefaultRoomsWithParallax:selectedRooms.filter(r=>r.parallax).length,
  note:'A stage can register several rooms. Plane counts are not stage counts. An unset block flag does not establish that enough references exist.'};
const projectiles=ROSTER.flatMap(fighter=>{
  const moves=Object.values(createCombatProfile(fighter).moves).filter(move=>move.projectile&&!move.trap&&move.enabled!==false);
  return moves.length?[{fighterId:fighter.id,name:fighter.name,source:fighter.source,
    slots:moves.map(move=>{const effect=projectileBitmapFor(fighter,move);return {key:move.key,name:move.name,bitmap:effect?.id??null};})}]:[];
});
for(const effect of Object.values(PROJECTILE_BITMAPS))asset(effect.frame,'projectile');
const slots=projectiles.flatMap(p=>p.slots);
const projectileSummary={dedicatedImages:Object.keys(PROJECTILE_BITMAPS).length,defaultProfiles:projectiles.length,
  illustratedProfiles:projectiles.filter(p=>p.slots.some(s=>s.bitmap)).length,
  fullyIllustratedProfiles:projectiles.filter(p=>p.slots.every(s=>s.bitmap)).length,
  partiallyIllustratedProfiles:projectiles.filter(p=>p.slots.some(s=>s.bitmap)&&p.slots.some(s=>!s.bitmap)).length,
  unillustratedProfiles:projectiles.filter(p=>p.slots.every(s=>!s.bitmap)).length,
  defaultSlots:slots.length,illustratedSlots:slots.filter(s=>s.bitmap).length,missingSlots:slots.filter(s=>!s.bitmap).length,
  note:'Default enabled projectile commands only. Weapon phase kits, traps, impact VFX and unrelated environmental effects are excluded. One image may serve several exact owner/source/slot routes.'};
const chronicles=CHRONICLES.map(route=>({id:route.id,title:route.title,source:route.source,
  images:Object.entries(chronicleArtwork(route.id)||{}).map(([kind,value])=>({kind,path:asset(value,'chronicle')}))}));
const chronicleCounts=Object.fromEntries(['intro','ending','rival','observation','sighting'].map(kind=>[kind,chronicles.filter(c=>c.images.some(i=>i.kind===kind)).length]));
const chronicleSummary={routes:chronicles.length,illustratedRoutes:chronicles.filter(c=>c.images.length).length,
  ...chronicleCounts,images:sum(chronicles,c=>c.images.length),
  note:'Fifteen configured story routes, not one story for every roster profile. Observation illustrations are used by three routes instead of a rival duel image; sightings are supplementary.'};
const clips=profiles.flatMap(p=>p.clips.map(c=>({fighterId:p.id,...c})));
const clipSummaryTotal={entries:clips.length,animatedClips:clips.filter(c=>c.animated).length,
  profilesWithAnimation:profiles.filter(p=>p.animatedClips>0).length,
  staticClips:clips.filter(c=>!c.animated).length,
  idleClips:clips.filter(c=>c.key==='idle').length,
  dedicatedAttackClips:clips.filter(c=>MOVESET_KEYS.includes(c.key)).length,
  presentationClips:clips.filter(c=>PRESENTATION_KEYS.includes(c.key.split('@')[0])).length,
  baseStateClips:clips.filter(c=>BASE_POSE_KEYS.includes(c.key)).length,
  note:'A clip is animated only with at least two distinct pixel signatures. A static attack pose, repeated image or extra clip key does not create a new character or animation.'};
const variants=profiles.filter(p=>p.variant||p.variantOf);
const weaponProfiles=profiles.filter(p=>p.weaponPhaseKits.length||p.weaponIdles.keys.length);
const variantsSummary={...characterCounts(variants),ids:variants.map(p=>p.id),
  note:'Metadata variants include weapons, forms, sizes and editions. They overlap the roster and are not an independent costume catalogue.',
  costumeCatalogue:{defined:false,totalRequired:null,missing:null,completionPercent:null}};
const weaponSummary={profiles:weaponProfiles.length,phaseKits:sum(weaponProfiles,p=>p.weaponPhaseKits.length),
  exactIdleKeys:sum(weaponProfiles,p=>p.weaponIdles.keys.length),presentIdles:sum(weaponProfiles,p=>p.weaponIdles.present.length),
  missingIdles:sum(weaponProfiles,p=>p.weaponIdles.missing.length),
  missingEvidence:weaponProfiles.flatMap(p=>p.weaponIdles.missingEvidence),
  note:'Weapon phases reuse commands; four phase kits do not establish eighty missing drawings or four additional characters. The absent Memory of Alessa SMG idle has a documented prior generation refusal and is not an open production target.'};
const byCategory=Object.fromEntries(unique(profiles.map(p=>p.category)).map(k=>[k,characterCounts(profiles.filter(p=>p.category===k))]));
const bySource=Object.entries(SOURCE_META).map(([id,meta])=>{const rows=profiles.filter(p=>p.source===id),ss=stages.filter(s=>s.source===id),ps=projectiles.filter(p=>p.source===id).flatMap(p=>p.slots);
  return {id,name:meta.label,...characterCounts(rows),bosses:rows.filter(p=>p.boss).length,
    stagesTotal:ss.length,stagesActive:ss.filter(s=>s.active).length,stagesMissing:ss.filter(s=>!s.active).length,
    stagesBlocked:ss.filter(s=>!s.active&&s.blocked).length,projectileSlots:ps.length,illustratedProjectileSlots:ps.filter(s=>s.bitmap).length,
    chronicleRoutes:chronicles.filter(c=>c.source===id).length,chronicleImages:sum(chronicles.filter(c=>c.source===id),c=>c.images.length)};});
const currentAssets=[...assetReferences.values()].sort((a,b)=>a.path.localeCompare(b.path));
const assetSummary={uniqueReferencedFiles:currentAssets.length,
  portraits:currentAssets.filter(a=>a.kinds.includes('portrait')).length,
  spriteFrames:currentAssets.filter(a=>a.kinds.includes('sprite-frame')).length,
  uniquePortraitAndSpriteFiles:currentAssets.filter(a=>a.kinds.some(k=>k==='portrait'||k==='sprite-frame')).length,
  stagePlanes:allStagePaths.length,projectiles:currentAssets.filter(a=>a.kinds.includes('projectile')).length,
  chronicles:currentAssets.filter(a=>a.kinds.includes('chronicle')).length,
  referencedInHead:currentAssets.filter(a=>a.inHead).length,
  newOnDiskNotInHead:currentAssets.filter(a=>!a.inHead&&a.availableOnDisk).length,
  missingFromHeadAndDisk:currentAssets.filter(a=>!a.inHead&&!a.availableOnDisk).map(a=>a.path),
  headAssetFiles:headAssets.size,
  headUnreferencedByTheseManifests:[...headAssets.keys()].filter(p=>!assetReferences.has(p)).sort(),
  note:'File presence is checked in the current Git commit or on disk. Sparse checkout absence is not a missing production asset. No pixel decoding, integrity against PNG bytes, visual approval or remote publication check is performed.'};
for(const [key,value] of Object.entries({total:characters.totalProfiles,selectionAvailable:characters.portraits,
  selectionMissing:characters.missingPortraits,combatSideViewCandidates:characters.sideViewCandidates,
  combatLegacyUnreviewed:characters.legacyToReview,combatMissing:characters.missingCombat,
  separateSelectionAndCombat:characters.separateSelectionAndCombat,animatedClips:clipSummaryTotal.animatedClips,certified:characters.certified})){
  compare('data/sprite-coverage.json:'+key,publishedCoverage[key],value);
}
for(const [name,stored,recomputed] of [
  ['characters.portraits',historical.coverage.characters.portraits,characters.portraits],
  ['characters.sideViews',historical.coverage.characters.sideViews,characters.sideViewCandidates],
  ['characters.legacyToReview',historical.coverage.characters.legacyToReview,characters.legacyToReview],
  ['characters.missingCombat',historical.coverage.characters.missingCombat,characters.missingCombat],
  ['stages.active',historical.coverage.stages.active,stageSummary.active],
  ['stages.activePNG',historical.coverage.stages.activePNG,stageSummary.registeredPlaneFiles],
  ['projectiles.illustratedSlots',historical.coverage.projectiles.illustratedSlots,projectileSummary.illustratedSlots],
  ['characters.animatedClips',historical.coverage.characters.animatedClips,clipSummaryTotal.animatedClips]]){
  compare('vague28/summary.json:'+name,stored,recomputed,'Historical wave28 snapshot; differences after a new delivery are expected deltas, not errors.');
}
for(const [name,stored,recomputed] of [['fighters',contentStats.fighters,ROSTER.length],['bosses',contentStats.bosses,profiles.filter(p=>p.boss).length],
  ['stages',contentStats.stages,STAGES.length],['chronicles',contentStats.chronicles,CHRONICLES.length]])compare('data/content-stats.json:'+name,stored,recomputed);
for(const path of hashes.keys())assert.equal(hash(await read(path)),hashes.get(path).sha256,'Source changed during audit; rerun: '+path);
const report={schema:'halo-static-inventory-v1',generatedBy:rel(self),deterministic:true,sourceCommit,
  scope:'Current roster, runtime manifests and registered static artwork. No animation production, pixels, runtime settings or catalogue IDs are changed.',
  summary:{characters,bosses:characterCounts(profiles.filter(p=>p.boss)),nonBosses:characterCounts(profiles.filter(p=>!p.boss)),
    byCategory,stages:stageSummary,projectiles:projectileSummary,chronicles:chronicleSummary,clips:clipSummaryTotal,
    variants:variantsSummary,weapons:weaponSummary,assets:assetSummary,
    corpus:{documentaryRecords:corpus.records.length,runtimeSources:Object.keys(SOURCE_META).length,
      note:'Documentary records are not executable packs, required new fighters, or finished gameplay.'},
    propsAndOtherVFX:{separateCatalogueDefined:false,totalRequired:null,completionPercent:null,
      note:'Foreground decor is included in stage planes. No separate exhaustive props, nonprojectile VFX or impact-image inventory defines a defensible percentage.'},
    audio:{trackedAudioFiles:[...headAssets.keys()].filter(p=>/\.(wav|mp3|ogg|flac|aac|m4a)$/i.test(p)),
      mode:'Procedural Web Audio cues in src/shared.js and src/lore-cinematics.js; not a completed source-audio asset library.',totalRequired:null},
    catalogDefinitions:{...contentStats,meaning:'Configured data definitions, not a percentage of finished artwork or completed playthroughs.'}},
  bySource,profiles,stages,projectiles,chronicles,weaponProfiles,
  comparisons,interpretationWarnings:[
    'Portrait and combat coverage overlap; missing counts must not be added as unique profiles.',
    'Bosses and variants are subsets of the same roster, not additional characters.',
    'A side-view image may belong to a noncombatant or an unresolved role; combatEnabled is reported separately.',
    'The historical activePNG count includes all registered room variants; the default scene plane count has a narrower scope.',
    'coverageComplete in content-stats.json concerns catalogue definitions; it does not mean that all art is complete.',
    'A stage without a reference block flag may still lack adequate visual references; see its production research.',
    'No 1:1 fidelity, UHD resolution, complete game, finished animation, release status or online deployment is inferred from these counts.',
    'Earlier production README/summary publication fields are historical snapshots; current PR/CI status requires a separate live GitHub check.'
  ],sourceHashes:[...hashes.values()].sort((a,b)=>a.path.localeCompare(b.path)),assetReferences:currentAssets};
const pct=(a,b)=>b?`${(100*a/b).toFixed(1).replace('.',',')} %`:'—';
const cell=v=>String(v??'—').replaceAll('|','/').replaceAll('\n',' ');
const table=(headers,rows)=>['| '+headers.map(cell).join(' | ')+' |','| '+headers.map(()=>'---').join(' | ')+' |',...rows.map(row=>'| '+row.map(cell).join(' | ')+' |')].join('\n');
const lines=['# État des lieux — Silent Hill: Halo of Flesh','',
  `Commit de base inspecté : \`${sourceCommit}\`. Rapport déterministe produit par \`${rel(self)}\`.`,
  '', 'Les chiffres décrivent les manifestes actuels. Les images statiques, leur présence dans Git, leur rôle de combat et leur fidélité sont des états distincts. Cet audit ne décode pas les PNG et ne remplace pas la vérification visuelle.',
  '', '## Couverture par partie','',table(['Partie','Présent','Référence / total','Reste','Couverture'],[
    ['Portraits de sélection',characters.portraits,characters.totalProfiles,characters.missingPortraits,pct(characters.portraits,characters.totalProfiles)],
    ['Sprites de base de profil candidats',characters.sideViewCandidates,characters.totalProfiles,`${characters.missingCombat} absents + ${characters.legacyToReview} anciens à revoir`,pct(characters.sideViewCandidates,characters.totalProfiles)],
    ['Boss : sprites de base candidats',report.summary.bosses.sideViewCandidates,report.summary.bosses.totalProfiles,`${report.summary.bosses.missingCombat} absents + ${report.summary.bosses.legacyToReview} anciens`,pct(report.summary.bosses.sideViewCandidates,report.summary.bosses.totalProfiles)],
    ['Arènes avec scène bitmap active',stageSummary.active,stageSummary.total,stageSummary.missing,pct(stageSummary.active,stageSummary.total)],
    ['Commandes de projectile avec image dédiée',projectileSummary.illustratedSlots,projectileSummary.defaultSlots,projectileSummary.missingSlots,pct(projectileSummary.illustratedSlots,projectileSummary.defaultSlots)],
    ['Profils projectile avec au moins une image',projectileSummary.illustratedProfiles,projectileSummary.defaultProfiles,projectileSummary.unillustratedProfiles,pct(projectileSummary.illustratedProfiles,projectileSummary.defaultProfiles)],
    ['Intros de chroniques',chronicleCounts.intro,chronicles.length,chronicles.length-chronicleCounts.intro,pct(chronicleCounts.intro,chronicles.length)],
    ['Endings de chroniques',chronicleCounts.ending,chronicles.length,chronicles.length-chronicleCounts.ending,pct(chronicleCounts.ending,chronicles.length)],
    ['Scènes rival / observation',chronicleCounts.rival+chronicleCounts.observation,chronicles.length,chronicles.length-chronicleCounts.rival-chronicleCounts.observation,pct(chronicleCounts.rival+chronicleCounts.observation,chronicles.length)],
    ['Idles des contextes d’armes déclarés',weaponSummary.presentIdles,weaponSummary.exactIdleKeys,weaponSummary.missingIdles,pct(weaponSummary.presentIdles,weaponSummary.exactIdleKeys)],
    ['Clips avec plusieurs images distinctes',clipSummaryTotal.animatedClips,'Périmètre final non défini','Non chiffré','—'],
    ['Fidélité certifiée',characters.certified,characters.totalProfiles,'Validation des sources nécessaire',pct(characters.certified,characters.totalProfiles)]
  ]),
  '',`Les ${projectileSummary.dedicatedImages} images de projectile couvrent ${projectileSummary.illustratedSlots} commandes : ces deux unités ne sont pas interchangeables. ${projectileSummary.partiallyIllustratedProfiles} profil(s) restent partiellement couverts.`,
  '',`Décors : ${stageSummary.registeredRooms} pièces/variantes enregistrées, ${stageSummary.registeredPlaneFiles} plans bitmap au total ; ${stageSummary.selectedDefaultPlaneFiles} plans sont sélectionnés dans les scènes par défaut. ${stageSummary.selectedDefaultRoomsWithParallax} scènes par défaut déclarent une parallaxe. Parmi les ${stageSummary.missing} arènes absentes, ${stageSummary.missingWithReferenceBlocked} ont un blocage de référence explicite et ${stageSummary.missingWithoutBlockFlag} n’en ont pas ; cette dernière valeur n’atteste pas que les références suffisent.`,
  '', '## Détail par œuvre / pack runtime','',table(['Œuvre','Profils','Portraits','Sprites de profil','Anciens à revoir','Arènes','Projectiles : commandes'],bySource.map(s=>[s.name,s.totalProfiles,`${s.portraits}/${s.totalProfiles}`,`${s.sideViewCandidates}/${s.totalProfiles}`,s.legacyToReview,`${s.stagesActive}/${s.stagesTotal}`,s.projectileSlots?`${s.illustratedProjectileSlots}/${s.projectileSlots}`:'Sans commande par défaut'])),
  '', '## Catégories du roster','',table(['Catégorie','Profils','Portraits','Profil candidat','Ancien à revoir','Combat absent'],Object.entries(byCategory).map(([name,c])=>[name,c.totalProfiles,c.portraits,c.sideViewCandidates,c.legacyToReview,c.missingCombat])),
  '', '## Costumes, variantes et armes','',
  `${variantsSummary.totalProfiles} fiches possèdent un champ variant ou variantOf : ${variantsSummary.portraits} portraits, ${variantsSummary.sideViewCandidates} profils candidats, ${variantsSummary.legacyToReview} vues anciennes et ${variantsSummary.missingCombat} absences. Elles sont déjà incluses dans les ${characters.totalProfiles} profils. Ces fiches décrivent aussi des armes, tailles, formes et éditions ; elles ne constituent pas un catalogue exhaustif de costumes. Aucun pourcentage de costumes n’est calculé.`,
  '',table(['Profil','Kit / contexte','Idle exact'],weaponProfiles.flatMap(p=>p.weaponIdles.keys.map(key=>[p.name,key,p.weaponIdles.present.includes(key)?'Présent':p.weaponIdles.missingEvidence.find(e=>e.key===key)?.reason?'Absent — génération précédemment refusée':'Manquant']))),
  '', 'Le refus documenté de la variante SMG de Memory of Alessa est conservé dans art/reference-provenance-alessa.json. Aucun autre idle d’arme ne remplace cette image manquante.',
  '',`Les ${weaponSummary.phaseKits} kits d’armes réutilisent des clés de commandes. Ils n’ajoutent pas de personnages et ne définissent pas un nombre d’images d’attaque à produire.`,
  '', '## Histoires et illustrations','',
  `${chronicleSummary.images} images sont référencées sur ${chronicles.length} parcours : ${chronicleCounts.intro} intros, ${chronicleCounts.ending} endings, ${chronicleCounts.rival} rivaux, ${chronicleCounts.observation} observations et ${chronicleCounts.sighting} apparitions supplémentaires. Le périmètre est celui des parcours configurés, pas une histoire pour chacun des ${characters.totalProfiles} profils.`,
  '',table(['Parcours','Pack','Images prévues dans le manifeste'],chronicles.map(c=>[c.title,c.source,c.images.map(i=>i.kind).join(', ')])),
  '', '## Assets et autres systèmes','',
  `Les manifestes référencent ${assetSummary.uniqueReferencedFiles} fichiers distincts : ${assetSummary.uniquePortraitAndSpriteFiles} fichiers de personnages/portraits, ${assetSummary.stagePlanes} plans de décors, ${assetSummary.projectiles} projectiles et ${assetSummary.chronicles} illustrations de chronique. Les portraits et frames partagent parfois un même fichier ; ${assetSummary.portraits} + ${assetSummary.spriteFrames} ne constitue donc pas un total distinct.`,
  '',`Dans le commit de base inspecté, ${assetSummary.referencedInHead} fichiers référencés sont présents ; ${assetSummary.newOnDiskNotInHead} autres sont présents sur disque mais absents de ce commit de base. ${assetSummary.missingFromHeadAndDisk.length} référence(s) absente(s) à la fois du commit de base et du disque. Le checkout peut être partiel : l’absence d’un PNG sur disque ne prouve pas son absence du dépôt. Ces nombres ne décrivent pas le statut de publication actuel.`,
  '',`Bible : ${corpus.records.length} notices documentaires, ${Object.keys(SOURCE_META).length} packs runtime. Les ${contentStats.moves} commandes, ${contentStats.fatalities} définitions de fatalité et ${contentStats.bossPhases} phases de boss relèvent des données de gameplay ; ce ne sont pas des images ou des animations achevées.`,
  '', 'Les props isolés, les VFX hors projectiles, les effets d’impact et les costumes n’ont pas de catalogue séparé suffisamment défini pour calculer une complétion. Les éléments de premier plan sont inclus dans les plans de décors. Le son est synthétisé par Web Audio ; aucun total final de fichiers SFX n’est établi.',
  '', '## Écarts avec les états précédents','',table(['Comparaison','Valeur enregistrée','Recalcul','Lecture'],comparisons.filter(c=>!c.equal||c.name.startsWith('vague28/')).map(c=>[c.name,c.stored,c.recomputed,c.equal?'Identique':c.name.startsWith('vague28/')?'Delta depuis la vague 28':'Rapport dérivé à actualiser'])),
  '', 'Le compteur historique activePNG inclut les variantes de pièce. coverageComplete décrit les fiches du catalogue, pas la complétion des assets. Les anciens champs local-only ou not-run décrivent leur exécution historique ; le statut des PR et de la CI doit être vérifié séparément sur GitHub.',
  '', '## Profils de base à compléter ou revoir','',table(['ID','Nom','Portrait','Vue combat','Motif documenté'],profiles.filter(p=>p.combatView!=='side-view-candidate').map(p=>[p.id,p.name,p.selectionAvailable?'Présent':'Absent',p.combatView,p.missingReason||'Aucun motif dans l’inventaire précédent'])),
  '', '## Arènes sans scène bitmap active','',table(['ID','Nom','Pack','Blocage de référence','Scène requise'],stages.filter(s=>!s.active).map(s=>[s.id,s.name,s.source,s.blocked?'Oui':'Pas de flag',s.requiredScene])),
  '', '## Commandes de projectile sans image','',table(['Profil','Pack','Commandes absentes'],projectiles.filter(p=>p.slots.some(s=>!s.bitmap)).map(p=>[p.name,p.source,p.slots.filter(s=>!s.bitmap).map(s=>s.key).join(', ')])),
  '', '## Reproduction','',
  '```bash',`node ${rel(self)} --output-prefix ${prefix}`,`node ${rel(self)} --output-prefix ${prefix} --check`,'```',
  '', 'Le JSON joint contient les identifiants, chemins, états, comparaisons et SHA-256 des sources. Le script refuse un changement de source pendant le recensement. Il écrit uniquement les deux rapports demandés.',
  ''
];
const outputs=[[resolve(directory,prefix+'.json'),JSON.stringify(report,null,2)+'\n'],[resolve(directory,prefix+'.md'),lines.join('\n')]];
if(process.argv.includes('--check'))for(const [path,bytes] of outputs)assert.equal(await readFile(path,'utf8'),bytes,'Saved inventory is stale: '+rel(path));
else{await mkdir(directory,{recursive:true});for(const [path,bytes] of outputs)await writeFile(path,bytes);}
console.log(JSON.stringify({reports:outputs.map(([path])=>rel(path)),characters,stages:stageSummary,projectiles:projectileSummary,
  chronicles:chronicleSummary,weapons:weaponSummary,animatedClips:clipSummaryTotal.animatedClips,
  missingFiles:assetSummary.missingFromHeadAndDisk.length,derivedReportMismatches:comparisons.filter(c=>!c.equal&&!c.name.startsWith('vague28/')).length}));
