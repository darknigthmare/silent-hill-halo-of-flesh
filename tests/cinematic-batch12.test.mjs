import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {loreFinisher,lorePresentation,sampleLorePresentation,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';
import {OUTRO_TICKS} from '../src/presentation-sequences.js';

const IDS=['downpour_anne_cunningham','sh4_ghost_victim_066','bom_earth_guardian_142','bom_steel_guardian_146','bom_swarm_132'];
const [ANNE,GHOST,EARTH,STEEL,SWARM]=IDS;
const KEYS=['intro','winRound','loseRound','winMatch','loseMatch','outro'],TYPES={winRound:'winRound1',loseRound:'loseRound1'};
const ledger=JSON.parse(readFileSync(new URL('../docs/production/batches/lot12-cinematics.json',import.meta.url),'utf8'));
const fighter=id=>{const f=ROSTER.find(f=>f.id===id);assert.ok(f,id);return f;};
const actor=(id,index=0)=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index,x:index?880:320,y:594,facing:index?-1:1,grounded:true});
const sample=(a,key,p)=>sampleLorePresentation(a,{key,progress:p,lore:lorePresentation(a,key)});
const engines=new Set();afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('lot12 authors thirty exact previously unowned result contexts while leaving taunts and finishers absent',()=>{
  assert.equal(ledger.batch,'lot12');assert.equal(ledger.baseCommit,'1e6e408a3ef9d66869fdf7ce26eded06e383d12a');assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);
  const old=['lot9','lot10','lot11'].flatMap(batch=>JSON.parse(readFileSync(new URL(`../docs/production/batches/${batch}-cinematics.json`,import.meta.url))).items.map(i=>i.rowId));
  assert.equal(new Set(ledger.items.map(i=>i.rowId)).size,30);assert.deepEqual(new Set(ledger.items.map(i=>i.entityId)),new Set(IDS));
  for(const row of ledger.items){
    assert.equal(row.collection,'presentations');assert.equal(row.status,'implemented-candidate');assert.equal(row.baselineAuthored,false);assert.ok(!old.includes(row.rowId));
    assert.equal(row.rowId,`${row.entityId}:${TYPES[row.contextKey]||row.contextKey}`);assert.ok(KEYS.includes(row.contextKey));assert.match(row.sourceSha256,/^[a-f0-9]{64}$/);
    assert.equal(lorePresentation(actor(row.entityId),row.contextKey).authored,true);assert.equal(lorePresentation(fighter(row.entityId),row.contextKey).authored,true);
  }
  for(const id of IDS){assert.ok(LORE_CINEMATIC_COVERAGE.presentationOnlyIds.includes(id));assert.equal(lorePresentation(actor(id),'taunt').authored,false);for(const type of ['signature','nightmare'])assert.equal(cinematicSummary(id+'_'+type).authored,false);}
});

test('thirty pure presentation samples retain source body, equipment, role and physical state at either facing',()=>{
  const contexts=new Set(),poses=new Set();for(const id of IDS)for(const facing of [-1,1]){const a={...actor(id),facing},before=structuredClone(a);
    for(const key of KEYS){const p=lorePresentation(a,key);assert.equal(p.ownerId,id);assert.equal(p.source,a.data.source);assert.equal(p.clipKey,`${key}@${id}:${TYPES[key]||key}`);
      assert.equal(p.description,FIGHTER_REFERENCES[id].proposals[TYPES[key]||key].description);assert.equal(p.artStatus,'contextual-images-missing');assert.equal(p.timingProvenance,'original-versus-ticks');assert.equal(p.reversible,['winRound','loseRound'].includes(key));assert.ok(p.scopeNote);
      contexts.add(p.clipKey);poses.add(p.poseIntent);for(const progress of [0,.05,.25,.5,.75,.94,1]){const s=sample(a,key,progress);assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.y)&&s.alpha>=0&&s.alpha<=1);assert.ok(s.pose.startsWith(p.poseIntent));assert.equal(Math.abs(s.y),0);}
    }
    assert.deepEqual(a,before);const recovered=sample(a,'loseRound',1);assert.ok(Math.abs(recovered.x)<1e-8);assert.equal(recovered.alpha,1);assert.equal(recovered.pose,lorePresentation(a,'loseRound').poseIntent+'-ready');
  }assert.equal(contexts.size,30);assert.equal(poses.size,30);
});

test('source, year, body, equipment and policy ownership guards reject forged presentations',()=>{
  for(const id of IDS){const a=actor(id);
    for(const data of [{...a.data,source:'borrowed-work'},{...a.data,year:1999},{...a.data,visual:{...a.data.visual,kind:'fox'}},{...a.data,visual:{...a.data.visual,weapon:id===ANNE?'hammer':'pistol'}}]){
      const forged={...a,data};for(const key of KEYS){assert.equal(lorePresentation(forged,key).authored,false);assert.equal(lorePresentation(forged,key).hasComposedOutro,false);assert.deepEqual(sample(forged,key,.8),{x:0,y:0,alpha:1,pose:'hold'});}
    }
    for(const patch of [{id:'other-owner'},{source:'other-source'},{edition:'other-edition'},{role:'scripted-encounter'},{combatEnabled:false}])assert.equal(lorePresentation({...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,...patch}}},'intro').authored,false,id);
  }
});

test('Anne uses two continuous ground-support transfers with her own pistol and no narrative ending selection',()=>{
  const a=actor(ANNE),before=structuredClone(a);assert.equal(a.data.visual.weapon,'pistol');assert.equal(lorePresentation(a,'outro').hasComposedOutro,true);
  for(const weapon of ['hammer','revolver','circular_saw',null])for(const key of KEYS)assert.equal(lorePresentation({...a,data:{...a.data,visual:{...a.data.visual,weapon}}},key).authored,false);
  for(const [p,x] of [[0,0],[.05,0],[.32,-9],[.55,-9],[.94,-21],[1,-21]]){const s=sample(a,'outro',p);assert.ok(Math.abs(s.x-x)<1e-9);assert.equal(Math.abs(s.y),0);assert.equal(s.alpha,1);}
  for(const p of [.05,.32,.55,.94])assert.ok(Math.abs(sample(a,'outro',p-1e-7).x-sample(a,'outro',p+1e-7).x)<1e-4);
  assert.match(sample(a,'outro',.2).pose,/-rear-foot-ground-support$/);assert.match(sample(a,'outro',.8).pose,/-front-foot-ground-support$/);assert.equal(sample({...a,facing:-1},'outro',1).x,21);assert.deepEqual(a,before);
  const fixed={...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,canMove:false}}};assert.equal(lorePresentation(fixed,'outro').hasComposedOutro,false);assert.equal(Math.abs(sample(fixed,'outro',1).x),0);
  for(const key of KEYS)assert.match(lorePresentation(a,key).scopeNote,/épargner\/tuer/);
});

test('the composite old Ghost remains persistent and cannot silently become a new named victim',()=>{
  const a=actor(GHOST),ref=FIGHTER_REFERENCES[GHOST],identity=ref.identityStatus;
  try{ref.identityStatus='individu-canonique-nouveau';for(const key of KEYS)assert.equal(lorePresentation(a,key).authored,false);}finally{ref.identityStatus=identity;}
  for(const key of KEYS)for(const p of [0,.25,.5,.75,1]){const s=sample(a,key,p);assert.ok(s.alpha>=.75);assert.equal(Math.abs(s.y),0);}
  assert.equal(sample(a,'loseMatch',1).alpha,.75);assert.equal(sample(a,'outro',1).alpha,1);assert.equal(sample(a,'outro',1).x,0);assert.equal(lorePresentation(a,'outro').hasComposedOutro,false);
  assert.match(lorePresentation(a,'intro').scopeNote,/pas un individu canonique supplémentaire/);assert.match(lorePresentation(a,'loseMatch').poseIntent,/suppressed-body-retained/);
});

test('Vita guardians keep complete preformed bodies and Swarm remains its own insect family without parent-title behavior',()=>{
  for(const id of [EARTH,STEEL,SWARM]){const ref=FIGHTER_REFERENCES[id],constraints=ref.constraints;
    try{ref.constraints=constraints.filter(c=>!c.startsWith('Version Book of Memories uniquement;'));assert.equal(lorePresentation(actor(id),'intro').authored,false);}finally{ref.constraints=constraints;}
    assert.equal(sample(actor(id),'intro',0).alpha,1);assert.equal(lorePresentation({...actor(id),data:{...fighter(id),source:'homecoming'}},'intro').authored,false);
  }
  for(const id of [EARTH,STEEL]){const a=actor(id);assert.equal(lorePresentation(a,'outro').hasComposedOutro,false);for(const key of KEYS)for(const p of [0,.5,1]){assert.equal(sample(a,key,p).alpha,1);assert.equal(sample(a,key,p).y,0);}}
  assert.match(lorePresentation(actor(EARTH),'intro').scopeNote,/aucun assemblage de fragments/);assert.match(lorePresentation(actor(STEEL),'intro').scopeNote,/ni créées ni déplacées indépendamment/);
  const a=actor(SWARM);assert.equal(lorePresentation(a,'outro').hasComposedOutro,true);assert.equal(sample(a,'loseRound',.5).alpha,.86);assert.equal(sample(a,'loseRound',1).alpha,1);assert.equal(Math.abs(sample(a,'outro',1).x),31);assert.equal(sample(a,'outro',1).alpha,0);assert.match(lorePresentation(a,'intro').scopeNote,/distincte du Swarm Homecoming/);
});

function engine(id,stageId='midwich'){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter('sh2_bubble_head_nurse_024'),stage:STAGES.find(s=>s.id===stageId),mode:'local',roundsToWin:2,timeLimit:99,seed:110112,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false});engines.add(e);return e;
}
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function knockout(e,winner=0){const loser=e.actors[1-winner];loser.health=0;loser.lastHit={attackerIndex:winner,isSuper:false,environmental:false};e.resolveKnockouts();}

test('ten real two-round engine matches exercise every owned context without spawning bodies, damage or finisher',()=>{
  const seen=new Set();for(const id of IDS)for(const wins of [true,false]){
    const e=engine(id),a=e.actors[0],body=a.data.id,weapon=a.data.visual.weapon;assert.equal(a.presentation.key,'intro');assert.equal(a.presentation.lore.authored,true);seen.add(id+':intro');ticks(e,e.phaseTimer);knockout(e,wins?0:1);
    const first=wins?'winRound':'loseRound';assert.equal(e.phase,'roundEnd');assert.equal(a.presentation.key,first);assert.equal(a.presentation.reversible,true);assert.equal(a.presentation.lore.authored,true);seen.add(id+':'+(TYPES[first]||first));
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.equal(a.health,a.maxHealth);knockout(e,wins?0:1);const final=wins?'winMatch':'loseMatch';assert.equal(a.presentation.key,final);assert.equal(a.presentation.lore.authored,true);assert.equal(a.presentation.reversible,false);seen.add(id+':'+final);
    assert.equal(e.fatality,null);assert.equal(e.actors.length,2);assert.equal(e.projectiles.length,0);assert.equal(a.data.id,body);assert.equal(a.data.visual.weapon,weapon);assert.ok(e.actors.every(a=>a.stats.fatalities===0));ticks(e,e.phaseTimer);assert.equal(e.phase,'matchEnd');
    if(wins){assert.equal(a.presentation.key,'outro');assert.equal(a.presentation.lore.authored,true);seen.add(id+':outro');}else assert.equal(a.presentation.key,'loseMatch');
    e.destroy();engines.delete(e);
  }assert.deepEqual(seen,new Set(ledger.items.map(i=>i.rowId)));
});

test('Anne and Vita Swarm composed exits pause on focus loss and defer the result for ninety real ticks',()=>{
  for(const id of [ANNE,SWARM])for(const boundary of ['blur','hidden']){const e=engine(id),a=e.actors[0];ticks(e,e.phaseTimer);knockout(e);ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);knockout(e);ticks(e,e.phaseTimer);
    const physical=e.actors.map(a=>[a.x,a.y,a.health,a.ammo,a.profile.moves]);assert.equal(e.isPresentingOutro(),true);assert.equal(a.presentation.stagingDuration,OUTRO_TICKS);assert.equal(a.presentation.clipDuration,0);let overlays=0;e.ctx.fillRect=()=>overlays++;e.renderMatchEnd(e.ctx);assert.equal(overlays,0);
    ticks(e,38);const frame=a.presentation.frame;if(boundary==='blur')e.onFocusLoss();else{document.hidden=true;e.onVisibilityChange();}assert.equal(e.paused,true);ticks(e,20);assert.equal(a.presentation.frame,frame);assert.equal(e.isPresentingOutro(),true);
    if(boundary==='hidden'){assert.equal(e.togglePause(false),false);document.hidden=false;e.onVisibilityChange();assert.equal(e.paused,true);}e.togglePause(false);ticks(e,OUTRO_TICKS-frame);assert.equal(a.presentation.complete,true);assert.equal(e.isPresentingOutro(),false);assert.deepEqual(e.actors.map(a=>[a.x,a.y,a.health,a.ammo,a.profile.moves]),physical);
    e.renderMatchEnd(e.ctx);assert.ok(overlays>0);e.destroy();engines.delete(e);
  }
});

// These regression checks are outside the lot12 thirty-row delivery. They
// protect the actual reviewed room instead of inventing a wall for the browser.
for(const [id,stageId,reason] of [
  ['sh4_wall_man_056','labyrinth',/Premier plan requis/],['origins_memory_of_richard_grady_083','labyrinth',/Premier plan requis/],
  ['sh2_flesh_lip_027','woodside',/Appui de plafond/],['origins_memory_of_helen_grady_082','woodside',/Appui de plafond/]
])test(id+': actual '+stageId+' rejects borrowed support and uses ordinary deciding KO',()=>{
  const a=actor(id),target=actor('sh2_bubble_head_nurse_024',1),stage=STAGES.find(s=>s.id===stageId);
  for(const type of ['signature','nightmare']){
    const definition=a.data.fatalities.find(f=>f.type===type),stored=cinematicSummary(definition.id);
    assert.equal(stored.authored,true);assert.ok(stored.beats.length>0);
    const plan=loreFinisher({attacker:a,target,stage,definition});assert.equal(plan.allowed,false);assert.match(plan.reason,reason);
  }
  const e=engine(id,stageId);e.config.fatalities=true;ticks(e,e.phaseTimer);knockout(e);assert.equal(e.phase,'roundEnd');assert.equal(e.actors[0].roundWins,1);assert.equal(e.fatality,null);
  ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.equal(e.actors[1].health,e.actors[1].maxHealth);knockout(e);
  assert.equal(e.phase,'roundEnd');assert.equal(e.fatality,null);assert.equal(e.actors[0].roundWins,2);assert.equal(e.actors[0].stats.fatalities,0);assert.equal(e.actors[1].health,0);assert.equal(e.actors[1].presentation.key,'loseMatch');
});
