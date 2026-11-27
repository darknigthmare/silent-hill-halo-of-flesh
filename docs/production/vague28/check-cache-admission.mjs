/** Actual cache admission for pairs affected by this wave; these are not played matches. */
import {readFile,writeFile} from 'node:fs/promises';
import {ROSTER,STAGES,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {SpriteCache,spriteCache,combatSpriteFor} from '../../../src/sprite-system.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {stageBitmapRooms,stageBitmapFrames,stageBitmapFor,StageBitmapCache} from '../../../src/stage-bitmaps.js';
import {PROJECTILE_BITMAPS} from '../../../src/projectile-bitmap-manifest.js';
import {PROJECTILE_BITMAP_BUDGET,projectileBitmapFrames} from '../../../src/projectile-bitmaps.js';
const out='docs/production/vague28/';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const delivery=await json(out+'characters/delivery.json'),baseline=await json(out+'baseline.json');
const previousWave=await json('docs/production/vague27/summary.json');
const ids=[...new Set([...delivery.entries.map(entry=>entry.fighterId),...previousWave.delivered.attacks.map(entry=>entry.fighterId)])];
const stageIds=Object.keys(STAGE_BITMAPS).filter(id=>!baseline.oldStageIds.includes(id));
const effects=Object.values(PROJECTILE_BITMAPS).filter(art=>!baseline.oldProjectileIds.includes(art.id));
const byId=new Map(ROSTER.map(fighter=>[fighter.id,fighter]));
const cost=frames=>[...new Map(frames.map(frame=>[frame.path,frame])).values()].reduce((sum,frame)=>sum+frame.width*frame.height*4,0);
const report={schema:1,wave:28,createdAt:new Date().toISOString(),passed:false,
  scope:'Admission through real cache validators only. Fighter scope includes both unpublished waves27–28; stage and projectile scopes are the new wave28 assets. These counts do not represent rendered or played matches.',
  fighterIds:ids,stageIds,effectIds:effects.map(art=>art.id)};
const fighterCache=spriteCache,stageCache=new StageBitmapCache(),projectileCache=new SpriteCache({maxBytes:PROJECTILE_BITMAP_BUDGET});
try{
  const seen=new Set();let maximum=0,maximumPair=[];
  for(const id of ids)for(const opponent of ROSTER){
    if(!createCombatProfile(opponent).referencePolicy.combatEnabled)continue;
    const pair=[id,opponent.id].sort(),key=pair.join('|');if(seen.has(key))continue;
    const arts=pair.map(member=>combatSpriteFor(byId.get(member),SPRITES));if(arts.some(art=>!art))continue;
    const frames=arts.flatMap(art=>art.frames);fighterCache.validatePins(frames);seen.add(key);
    const bytes=cost(frames);if(bytes>maximum){maximum=bytes;maximumPair=pair;}
  }
  report.fighters={budgetBytes:fighterCache.maxBytes,pairsChecked:seen.size,maximumDecodedBytes:maximum,maximumPair};
  const rooms=Object.values(STAGE_BITMAPS).flatMap(stageBitmapRooms),stageSeen=new Set();maximum=0;maximumPair=[];
  for(const id of stageIds)for(const [index,room] of rooms.entries()){
    const active=stageBitmapFor(STAGES.find(stage=>stage.id===id)),activeIndex=rooms.indexOf(active);
    if(activeIndex<0)throw Error('Active stage composition is absent from the stored rooms.');
    const pair=[id+':'+(active.scene||activeIndex),room.stageId+':'+(room.scene||index)].sort(),key=pair.join('|');if(stageSeen.has(key))continue;
    const frames=[...stageBitmapFrames([STAGES.find(stage=>stage.id===id)]),...room.layers.flatMap(layer=>layer.frames)];
    stageCache.validatePins(frames);stageSeen.add(key);const bytes=cost(frames);
    if(bytes>maximum){maximum=bytes;maximumPair=pair;}
  }
  report.stages={budgetBytes:stageCache.maxBytes,pairsChecked:stageSeen.size,maximumDecodedBytes:maximum,maximumPair};
  const projectileSeen=new Set(),owners=[...new Set(Object.values(PROJECTILE_BITMAPS).map(art=>art.fighterId))];maximum=0;maximumPair=[];
  for(const effect of effects)for(const opponent of owners){
    const pair=[effect.fighterId,opponent].sort(),key=pair.join('|');if(projectileSeen.has(key))continue;
    const frames=projectileBitmapFrames(pair.map(id=>byId.get(id)));projectileCache.validatePins(frames);projectileSeen.add(key);
    const bytes=cost(frames);if(bytes>maximum){maximum=bytes;maximumPair=pair;}
  }
  report.projectiles={budgetBytes:projectileCache.maxBytes,pairsChecked:projectileSeen.size,maximumDecodedBytes:maximum,maximumPair};
  if(!seen.size||!stageSeen.size||!projectileSeen.size)throw Error('Expected non-empty affected scopes.');
  report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
await writeFile(out+'cache-admission.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
