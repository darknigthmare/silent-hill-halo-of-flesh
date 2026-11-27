/** Reconcile delivered files, preservation and the remaining production queue. */
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {ROSTER,STAGES,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {stageBitmapFor,stageBitmapRooms} from '../../../src/stage-bitmaps.js';
import {PROJECTILE_BITMAPS} from '../../../src/projectile-bitmap-manifest.js';
import {projectileBitmapFor} from '../../../src/projectile-bitmaps.js';

const out='docs/production/vague27/',hash=(bytes,type='sha256')=>createHash(type).update(bytes).digest('hex');
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const baseline=await readJson(out+'baseline.json');
const oldFile=path=>execFileSync('git',['show',baseline.baseCommit+':'+path],{maxBuffer:20*1024*1024});
const oldRegistry=JSON.parse(oldFile('art/registry.json'));
const stageSource=oldFile('src/stage-bitmap-manifest.js').toString();
const oldStages=JSON.parse(stageSource.slice(stageSource.indexOf('export const STAGE_BITMAPS = ')+28).trim().replace(/;$/,''));
const currentRegistry=await readJson('art/registry.json');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const checks=[];
const check=(name,passed)=>{checks.push({name,passed:!!passed});if(!passed)throw Error(name);};

for(const [id,old] of Object.entries(oldRegistry.assets)){
  const now=currentRegistry.assets[id];
  check('Preserved portrait '+id,same(old.portrait,now.portrait));
  check('Preserved earlier frames '+id,old.frames.every((frame,i)=>same(frame,now.frames[i])));
  check('Preserved earlier clips '+id,Object.entries(old.clips).every(([key,value])=>same(value,now.clips[key])));
}
for(const [id,old] of Object.entries(oldStages))check('Preserved stage composition '+id,same(old,STAGE_BITMAPS[id]));
for(const item of baseline.protectedFiles)check('Preserved rules/workbook '+item.path,hash(await readFile(item.path))===item.sha256);

const trackedAssets=execFileSync('git',['ls-tree','-r','-z',baseline.baseCommit,'--','assets'],{encoding:'utf8'}).split('\0').filter(Boolean);
let preservedAssetFiles=0;
for(const entry of trackedAssets){
  const [header,path]=entry.split('\t'),gitSHA=header.split(' ')[2],bytes=await readFile(path);
  const actual=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  check('Preserved asset bytes '+path,actual===gitSHA);preservedAssetFiles++;
}

const stages=STAGES.filter(stage=>stageBitmapFor(stage,STAGE_BITMAPS));
const missingStages=STAGES.filter(stage=>!stageBitmapFor(stage,STAGE_BITMAPS)).map(stage=>({id:stage.id,name:stage.name,source:stage.source,blocked:!!stage.reference?.blocked,scene:stage.referencePolicy?.sceneId||null}));
const oldStageFrames=Object.values(oldStages).flatMap(art=>stageBitmapRooms(art).flatMap(room=>room.layers.flatMap(layer=>layer.frames)));
const stageFrames=Object.values(STAGE_BITMAPS).flatMap(art=>stageBitmapRooms(art).flatMap(room=>room.layers.flatMap(layer=>layer.frames)));
const addedStageIds=stages.filter(stage=>!oldStages[stage.id]).map(stage=>stage.id);
const addedAttackPoses=Object.entries(currentRegistry.assets).flatMap(([id,art])=>Object.keys(art.clips).filter(pose=>!oldRegistry.assets[id]?.clips[pose]).map(pose=>({fighterId:id,pose,frames:art.clips[pose].frames.map(index=>art.frames[index].path),animated:new Set(art.clips[pose].frames).size>1})));
const addedFrames=Object.entries(currentRegistry.assets).flatMap(([id,art])=>art.frames.slice(oldRegistry.assets[id]?.frames.length||0));
const addedStages=addedStageIds.flatMap(id=>STAGE_BITMAPS[id].layers.flatMap(layer=>layer.frames));
const effects=Object.values(PROJECTILE_BITMAPS);
const newFrames=[...addedFrames,...addedStages,...effects.map(art=>art.frame)];
check('Eleven distinct delivered images',newFrames.length===11&&new Set(newFrames.map(frame=>frame.sha256)).size===11);

const projectileProfiles=[];
for(const fighter of ROSTER){
  const moves=Object.values(createCombatProfile(fighter).moves).filter(move=>move.projectile&&!move.trap&&move.enabled!==false);
  if(!moves.length)continue;
  const slots=moves.map(move=>({key:move.key,name:move.name,bitmap:projectileBitmapFor(fighter,move)?.id||null}));
  projectileProfiles.push({fighterId:fighter.id,name:fighter.name,source:fighter.source,slots});
}
const projectileSlots=projectileProfiles.flatMap(profile=>profile.slots);
const oldOpen=await readJson('docs/production/vague26/remaining-evidence.json');
const coverage=await readJson('data/sprite-coverage.json');
const summary={schema:1,wave:27,createdAt:new Date().toISOString(),baseCommit:baseline.baseCommit,passed:true,
  delivered:{uniquePNG:newFrames.length,newCharacters:0,newPortraits:0,newAnimatedClips:0,
    attacks:addedAttackPoses,stages:addedStageIds,projectiles:effects.map(art=>({id:art.id,fighterId:art.fighterId,slots:art.slots,frame:art.frame.path})),
    images:newFrames.map(frame=>({path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height}))},
  coverage:{characters:{roster:ROSTER.length,portraits:coverage.selectionAvailable,sideViews:coverage.combatSideViewCandidates,
    legacyToReview:coverage.combatLegacyUnreviewed,missingCombat:coverage.combatMissing,missingPortraits:coverage.selectionMissing,animatedClips:coverage.animatedClips,certified:coverage.certified},
    stages:{total:STAGES.length,before:Object.keys(oldStages).length,active:stages.length,missing:missingStages.length,blocked:missingStages.filter(stage=>stage.blocked).length,
      open:missingStages.filter(stage=>!stage.blocked).length,oldPNG:new Set(oldStageFrames.map(frame=>frame.path)).size,activePNG:new Set(stageFrames.map(frame=>frame.path)).size},
    projectiles:{defaultProfiles:projectileProfiles.length,defaultSlots:projectileSlots.length,illustratedProfiles:effects.length,
      illustratedSlots:projectileSlots.filter(slot=>slot.bitmap).length,missingSlots:projectileSlots.filter(slot=>!slot.bitmap).length,
      note:'Default enabled projectile moves only. Phase-specific weapon kits, traps, unrelated VFX and impact images are not counted.'}},
  preservation:{oldProfiles:Object.keys(oldRegistry.assets).length,oldStageCompositions:Object.keys(oldStages).length,
    assetFilesVerifiedByteIdentical:preservedAssetFiles,protectedRuleAndWorkbookFiles:baseline.protectedFiles.length,checks},
  verification:{node:'node-tests-final.txt',pythonArt:'python-art-tests.txt',build:'verify-final.txt',
    nativeCharacters:'characters/qa-native/report.json',nativeProjectiles:'projectiles/qa-native-final/report.json',nativeStages:'stages/qa-native/report.json',
    localBrowser:'Blocked before browser launch by process_singleton socket() Operation not permitted; no local HTTP success claimed.',
    pythonFullSuite:'Stopped with exit137 during the unchanged workbook tests; 105 art-tool tests pass separately. Full workbook gate left to CI.'},
  fidelity:'unverified',limits:['Eleven static authored PNGs. The two attack clips contain one image each.',
    'Stage perspectives and widths are versus adaptations from limited gameplay captures; 1:1 visual fidelity is not certified.',
    'Projectile descriptions establish attack kind, not original textures or measured motion.']};
await writeFile(out+'summary.json',JSON.stringify(summary,null,2)+'\n');
await writeFile(out+'remaining-assets.json',JSON.stringify({schema:1,wave:27,characterEvidence:'../vague26/remaining-evidence.json',
  characters:oldOpen.entries.map(entry=>({fighterId:entry.fighterId,name:entry.name,source:entry.source,combatView:entry.combatView,
    selectionAvailable:entry.selectionAvailable,reason:entry.reason,requiredEvidenceOrAction:entry.requiredEvidenceOrAction})),
  stages:missingStages,projectiles:projectileProfiles.filter(profile=>profile.slots.some(slot=>!slot.bitmap)),
  limits:summary.coverage.projectiles.note},null,2)+'\n');
console.log(JSON.stringify({delivered:summary.delivered.uniquePNG,coverage:summary.coverage,preservationChecks:checks.length}));
