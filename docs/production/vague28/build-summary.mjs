/** Reconcile the current wave against its immutable local predecessor. */
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {ROSTER,STAGES,createCombatProfile} from '../../../src/data.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {stageBitmapFor,stageBitmapRooms} from '../../../src/stage-bitmaps.js';
import {PROJECTILE_BITMAPS} from '../../../src/projectile-bitmap-manifest.js';
import {projectileBitmapFor} from '../../../src/projectile-bitmaps.js';

const out='docs/production/vague28/',hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const baseline=await json(out+'baseline.json');
const oldFile=path=>execFileSync('git',['show',baseline.baseCommit+':'+path],{maxBuffer:20*1024*1024});
const oldManifest=(path,exportName)=>{
  const raw=oldFile(path).toString(),prefix='export const '+exportName+' = ';
  const start=raw.indexOf(prefix);if(start<0)throw Error('Unknown manifest serialization: '+path);
  return JSON.parse(raw.slice(start+prefix.length).trim().replace(/;$/,''));
};
const oldRegistry=JSON.parse(oldFile('art/registry.json'));
const oldStages=oldManifest('src/stage-bitmap-manifest.js','STAGE_BITMAPS');
const oldEffects=oldManifest('src/projectile-bitmap-manifest.js','PROJECTILE_BITMAPS');
const registry=await json('art/registry.json'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const checks=[],check=(name,passed)=>{checks.push({name,passed:!!passed});if(!passed)throw Error(name);};
for(const [id,old] of Object.entries(oldRegistry.assets)){
  const now=registry.assets[id];
  check('Preserved portrait '+id,same(old.portrait,now?.portrait));
  check('Preserved earlier frames '+id,old.frames.every((frame,index)=>same(frame,now.frames[index])));
  check('Preserved earlier clips '+id,Object.entries(old.clips).every(([key,value])=>same(value,now.clips[key])));
}
for(const [id,old] of Object.entries(oldStages))check('Preserved stage '+id,same(old,STAGE_BITMAPS[id]));
for(const [id,old] of Object.entries(oldEffects))check('Preserved projectile '+id,same(old,PROJECTILE_BITMAPS[id]));
for(const file of baseline.protectedFiles)check('Preserved rules/workbook '+file.path,hash(await readFile(file.path))===file.sha256);
const tracked=execFileSync('git',['ls-tree','-r','-z',baseline.baseCommit,'--','assets'],{encoding:'utf8'}).split('\0').filter(Boolean);
for(const entry of tracked){
  const [header,path]=entry.split('\t'),expected=header.split(' ')[2],bytes=await readFile(path);
  const actual=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  check('Preserved asset bytes '+path,actual===expected);
}
const stageFrames=arts=>Object.values(arts).flatMap(art=>stageBitmapRooms(art).flatMap(room=>room.layers.flatMap(layer=>layer.frames)));
const addedStages=Object.fromEntries(Object.entries(STAGE_BITMAPS).filter(([id])=>!Object.hasOwn(oldStages,id)));
const addedEffects=Object.values(PROJECTILE_BITMAPS).filter(art=>!Object.hasOwn(oldEffects,art.id));
const addedProfiles=Object.keys(registry.assets).filter(id=>!Object.hasOwn(oldRegistry.assets,id));
const addedPortraits=addedProfiles.map(id=>registry.assets[id].portrait).filter(Boolean);
const addedFighterFrames=Object.entries(registry.assets).flatMap(([id,art])=>art.frames.slice(oldRegistry.assets[id]?.frames.length||0));
const addedPoses=Object.entries(registry.assets).flatMap(([id,art])=>Object.keys(art.clips)
  .filter(pose=>!oldRegistry.assets[id]?.clips[pose]).map(pose=>({fighterId:id,pose,
    frames:art.clips[pose].frames.map(index=>art.frames[index].path),animated:new Set(art.clips[pose].frames).size>1})));
const newFrames=[...new Map([...addedPortraits,...addedFighterFrames,...stageFrames(addedStages),...addedEffects.map(art=>art.frame)].map(frame=>[frame.path,frame])).values()];
check('Twelve delivered files are independent native images',newFrames.length===12&&new Set(newFrames.map(frame=>frame.sha256)).size===12);
const expectedPoses=['sh1_groaner_003:forwardSpecial','sh3_closer_036:forwardSpecial','sh3_numb_body_small_037:forwardSpecial','bom_fire_guardian_137:neutralSpecial'].sort();
check('All four expected static attack poses are present',same(addedPoses.map(pose=>pose.fighterId+':'+pose.pose).sort(),expectedPoses)&&addedPoses.every(pose=>!pose.animated));
check('No new character or portrait is counted',addedProfiles.length===0&&addedPortraits.length===0);
check('All three expected stages are present',same(Object.keys(addedStages).sort(),['final_sacrament','scarlet_chamber','arcade_hospital_roof'].sort()));
check('Only Earth and Fire projectiles are added',same(addedEffects.map(art=>art.id).sort(),['bom_earth_guardian_rock','bom_fire_guardian_hand_flame'].sort()));
for(const frame of newFrames)check('Delivered PNG bytes '+frame.path,hash(await readFile(frame.path))===frame.sha256);
const activeStages=STAGES.filter(stage=>stageBitmapFor(stage,STAGE_BITMAPS));
const missingStages=STAGES.filter(stage=>!stageBitmapFor(stage,STAGE_BITMAPS)).map(stage=>({id:stage.id,name:stage.name,source:stage.source,
  blocked:!!stage.reference?.blocked,scene:stage.referencePolicy?.sceneId||null}));
const projectileProfiles=ROSTER.flatMap(fighter=>{
  const moves=Object.values(createCombatProfile(fighter).moves).filter(move=>move.projectile&&!move.trap&&move.enabled!==false);
  return moves.length?[{fighterId:fighter.id,name:fighter.name,source:fighter.source,slots:moves.map(move=>({key:move.key,name:move.name,
    bitmap:projectileBitmapFor(fighter,move)?.id||null}))}]:[];
});
const projectileSlots=projectileProfiles.flatMap(profile=>profile.slots),coverage=await json('data/sprite-coverage.json');
const poseBacklog=await json(out+'pose-backlog.json');
const previousOpen=await json('docs/production/vague27/remaining-assets.json');
const remainingCharacters=previousOpen.characters.filter(entry=>!addedProfiles.includes(entry.fighterId));
const summary={schema:1,wave:28,createdAt:new Date().toISOString(),baseCommit:baseline.baseCommit,passed:true,
  delivered:{uniquePNG:newFrames.length,newCharacters:addedProfiles.length,newPortraits:addedPortraits.length,
    newAnimatedClips:addedPoses.filter(pose=>pose.animated).length,attacks:addedPoses,stages:Object.keys(addedStages),
    projectiles:addedEffects.map(art=>({id:art.id,fighterId:art.fighterId,slots:art.slots,frame:art.frame.path})),
    images:newFrames.map(frame=>({path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height}))},
  coverage:{characters:{roster:ROSTER.length,portraits:coverage.selectionAvailable,sideViews:coverage.combatSideViewCandidates,
    legacyToReview:coverage.combatLegacyUnreviewed,missingCombat:coverage.combatMissing,missingPortraits:coverage.selectionMissing,
    animatedClips:coverage.animatedClips,certified:coverage.certified},
    stages:{total:STAGES.length,before:Object.keys(oldStages).length,active:activeStages.length,missing:missingStages.length,
      blocked:missingStages.filter(stage=>stage.blocked).length,open:missingStages.filter(stage=>!stage.blocked).length,
      oldPNG:new Set(stageFrames(oldStages).map(frame=>frame.path)).size,activePNG:new Set(stageFrames(STAGE_BITMAPS).map(frame=>frame.path)).size},
    poses:{scope:poseBacklog.scope,profiles:poseBacklog.summary.mainBacklogProfiles,
      enabledCommands:poseBacklog.summary.commands.enabled,commandsWithExactClips:poseBacklog.summary.commands.presentEnabled,
      enabledCommandsWithoutExactClips:poseBacklog.summary.commands.missingEnabled,
      expectedMissingAnimations:null,report:'pose-backlog.json'},
    projectiles:{defaultProfiles:projectileProfiles.length,defaultSlots:projectileSlots.length,
      illustratedProfiles:projectileProfiles.filter(profile=>profile.slots.some(slot=>slot.bitmap)).length,
      fullyIllustratedProfiles:projectileProfiles.filter(profile=>profile.slots.every(slot=>slot.bitmap)).length,
      partiallyIllustratedProfiles:projectileProfiles.filter(profile=>profile.slots.some(slot=>slot.bitmap)&&profile.slots.some(slot=>!slot.bitmap)).length,
      unillustratedProfiles:projectileProfiles.filter(profile=>profile.slots.every(slot=>!slot.bitmap)).length,
      profilesWithMissingSlots:projectileProfiles.filter(profile=>profile.slots.some(slot=>!slot.bitmap)).length,
      illustratedSlots:projectileSlots.filter(slot=>slot.bitmap).length,missingSlots:projectileSlots.filter(slot=>!slot.bitmap).length,
      note:'Default enabled projectile moves only. Phase-specific weapon kits, traps, unrelated VFX and impact images are not counted.'}},
  preservation:{oldProfiles:Object.keys(oldRegistry.assets).length,oldStageCompositions:Object.keys(oldStages).length,
    oldProjectileEffects:Object.keys(oldEffects).length,assetFilesVerifiedByteIdentical:tracked.length,
    protectedRuleAndWorkbookFiles:baseline.protectedFiles.length,checks},
  publication:{state:'local-only',reason:'Automatic approval review rejected the GitHub push; no remote PR or HTTP CI result is claimed.'},
  verificationReport:'verification.json',poseBacklogReport:'pose-backlog.json',
  fidelity:'unverified',limits:['Static authored PNGs; single-frame attack poses are not animated clips.',
    'References and observed details are recorded separately from versus adaptations in each delivery.',
    'Both render orientations use the existing engine mirror, not independently certified source geometry.']};
await writeFile(out+'summary.json',JSON.stringify(summary,null,2)+'\n');
await writeFile(out+'remaining-assets.json',JSON.stringify({schema:1,wave:28,characterEvidence:'../vague26/remaining-evidence.json',
  characters:remainingCharacters,poseBacklog:'pose-backlog.json',stages:missingStages,projectiles:projectileProfiles.filter(profile=>profile.slots.some(slot=>!slot.bitmap)),
  limits:summary.coverage.projectiles.note},null,2)+'\n');
console.log(JSON.stringify({delivered:summary.delivered.uniquePNG,coverage:summary.coverage,preservationChecks:checks.length}));
