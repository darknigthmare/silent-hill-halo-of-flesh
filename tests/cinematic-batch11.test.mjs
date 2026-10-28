import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {loreFinisher,lorePresentation,sampleLorePresentation,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';
import {OUTRO_TICKS} from '../src/presentation-sequences.js';

const IDS=['origins_remnant_077','homecoming_curtis_ackers','downpour_weeping_bat_105','downpour_prisoner_minion_brawler_108','downpour_prisoner_minion_agile_109'];
const REMNANT=IDS[0],CURTIS=IDS[1],BAT=IDS[2],BRAWLER=IDS[3],AGILE=IDS[4];
const KEYS=['intro','winRound','loseRound','winMatch','loseMatch','outro'],TYPES={winRound:'winRound1',loseRound:'loseRound1'};
const ledger=JSON.parse(readFileSync(new URL('../docs/production/batches/lot11-cinematics.json',import.meta.url),'utf8'));
const fighter=id=>{const f=ROSTER.find(f=>f.id===id);assert.ok(f,id);return f;};
const actor=(id,index=0)=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index,x:index?880:320,y:594,facing:index?-1:1,grounded:true});
const sample=(a,key,p)=>sampleLorePresentation(a,{key,progress:p,lore:lorePresentation(a,key)});
const engines=new Set();afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('lot11 owns thirty new exact presentation rows without replacing either previous batch or authoring attacks',()=>{
  assert.equal(ledger.batch,'lot11');assert.equal(ledger.baseCommit,'7b9980d102dc2db385445bc20e4172c1113dda2b');assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);
  const previous=['lot9','lot10'].flatMap(batch=>JSON.parse(readFileSync(new URL(`../docs/production/batches/${batch}-cinematics.json`,import.meta.url))).items.map(i=>i.rowId));
  assert.equal(new Set(ledger.items.map(i=>i.rowId)).size,30);assert.deepEqual(new Set(ledger.items.map(i=>i.entityId)),new Set(IDS));
  for(const row of ledger.items){
    assert.equal(row.collection,'presentations');assert.equal(row.status,'implemented-candidate');assert.equal(row.baselineAuthored,false);assert.ok(!previous.includes(row.rowId));
    assert.equal(row.rowId,`${row.entityId}:${TYPES[row.contextKey]||row.contextKey}`);assert.ok(KEYS.includes(row.contextKey));assert.match(row.sourceSha256,/^[a-f0-9]{64}$/);
    assert.equal(lorePresentation(actor(row.entityId),row.contextKey).authored,true);assert.equal(lorePresentation(fighter(row.entityId),row.contextKey).authored,true);
  }
  for(const id of IDS){assert.equal(lorePresentation(actor(id),'taunt').authored,false);for(const type of ['signature','nightmare'])assert.equal(cinematicSummary(id+'_'+type).authored,false);}
  assert.equal(LORE_CINEMATIC_COVERAGE.fighterIds.length,99);assert.equal(LORE_CINEMATIC_COVERAGE.recipes.length,79);assert.equal(LORE_CINEMATIC_COVERAGE.presentationOnlyIds.length,15);
  assert.equal(ROSTER.reduce((n,f)=>n+['intro','winRound','loseRound','winMatch','loseMatch','outro','taunt'].filter(key=>lorePresentation(f,key).authored).length,0),776);
});

test('thirty source-owned pose intents sample without changing anatomy, weapon, role, resources or physical state',()=>{
  const contexts=new Set(),poses=new Set();for(const id of IDS){const a=actor(id),before=structuredClone(a);
    for(const key of KEYS){const p=lorePresentation(a,key);assert.equal(p.ownerId,id);assert.equal(p.source,a.data.source);assert.equal(p.clipKey,`${key}@${id}:${TYPES[key]||key}`);
      assert.equal(p.description,FIGHTER_REFERENCES[id].proposals[TYPES[key]||key].description);assert.equal(p.artStatus,'contextual-images-missing');assert.equal(p.timingProvenance,'original-versus-ticks');assert.equal(p.reversible,['winRound','loseRound'].includes(key));assert.ok(p.scopeNote);
      contexts.add(p.clipKey);poses.add(p.poseIntent);for(const progress of [0,.1,.3,.5,.75,1]){const s=sample(a,key,progress);assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.y)&&s.alpha>=0&&s.alpha<=1);assert.ok(s.pose.startsWith(p.poseIntent));}
    }
    assert.deepEqual(a,before);const recovered=sample(a,'loseRound',1);assert.ok(Math.abs(recovered.x)<1e-8);assert.equal(recovered.y,0);assert.equal(recovered.alpha,1);assert.equal(recovered.pose,lorePresentation(a,'loseRound').poseIntent+'-ready');
  }assert.equal(contexts.size,30);assert.equal(poses.size,30);
});

test('new contexts reject borrowed work, year, anatomy, equipment, policy owner, edition and disabled role',()=>{
  for(const id of IDS){const a=actor(id);
    for(const data of [{...a.data,source:'borrowed-work'},{...a.data,year:1999},{...a.data,visual:{...a.data.visual,kind:'fox'}},{...a.data,visual:{...a.data.visual,weapon:'pistol'}}]){
      const forged={...a,data};for(const key of KEYS){assert.equal(lorePresentation(forged,key).authored,false);assert.equal(lorePresentation(forged,key).hasComposedOutro,false);assert.deepEqual(sample(forged,key,.8),{x:0,y:0,alpha:1,pose:'hold'});}
    }
    for(const patch of [{id:'other-owner'},{source:'other-source'},{edition:'other-edition'},{role:'scripted-encounter'},{combatEnabled:false}])assert.equal(lorePresentation({...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,...patch}}},'intro').authored,false,id);
  }
  const bogeyman=actor('homecoming_bogeyman_092');assert.equal(bogeyman.profile.referencePolicy.combatEnabled,false);assert.equal(lorePresentation(bogeyman,'intro').authored,false,'a preserved noncombat dossier is not granted these result tracks');
});

test('Curtis requires the circular saw rather than a chainsaw, while Walter and Robbie retain their original categories',()=>{
  const a=actor(CURTIS);assert.equal(a.data.visual.weapon,'circular_saw');
  for(const key of KEYS){assert.match(lorePresentation(a,key).poseIntent,/curtis-circular-saw/);for(const weapon of ['chainsaw','cleaver',null])assert.equal(lorePresentation({...a,data:{...a.data,visual:{...a.data.visual,weapon}}},key).authored,false);}
  assert.equal(fighter('sh4_walter_sullivan_072').visual.weapon,'chainsaw');assert.equal(fighter('arcade_robbie_the_rabbit_chainsaw').visual.weapon,'chainsaw');
  assert.match(lorePresentation(a,'intro').scopeNote,/Room 321 Underground/);assert.match(lorePresentation(a,'intro').scopeNote,/Ni démarrage moteur/);
});

test('Origins Faceless Nurse injection requires her own nurse anatomy and syringe in both existing finisher edits',()=>{
  const a=actor('origins_faceless_nurse'),target=actor('sh2_bubble_head_nurse_024',1),stage=STAGES.find(s=>s.id==='midwich');assert.equal(a.data.visual.weapon,'syringe');
  for(const type of ['signature','nightmare']){const definition=a.data.fatalities.find(f=>f.type===type),plan=attacker=>loreFinisher({attacker,target,stage,definition});
    const valid=plan(a);assert.equal(valid.allowed,true);assert.equal(valid.recipeId,'clinicalInjection');assert.ok(valid.steps.some(s=>s.label==='GESTE D INJECTION'));
    for(const weapon of ['scalpel','pistol','chainsaw',null]){const refused=plan({...a,data:{...a.data,visual:{...a.data.visual,weapon}}});assert.equal(refused.allowed,false);assert.match(refused.reason,/Arme exacte/);}
    const wrongBody=plan({...a,data:{...a.data,visual:{...a.data.visual,kind:'humanoid'}}});assert.equal(wrongBody.allowed,false);assert.match(wrongBody.reason,/Anatomie du sujet/);
    const wrongWork=plan({...a,data:{...a.data,source:'homecoming'}});assert.equal(wrongWork.allowed,false);assert.match(wrongWork.reason,/œuvre/);
    assert.equal(lorePresentation({...a,data:{...a.data,visual:{...a.data.visual,weapon:'scalpel'}}},'intro').authored,false,'the same source-owned injection recipe also guards existing presentations');
  }
});

test('Remnant retains a visible cage and shadow instead of receiving flesh, teleports, forced lighting or a terminal body fall',()=>{
  const a=actor(REMNANT),before=structuredClone(a);assert.equal(a.data.visual.weapon,null);
  for(const key of KEYS){assert.match(lorePresentation(a,key).poseIntent,/remnant-.*cage.*shadow/);for(const p of [0,.25,.5,.75,1]){const s=sample(a,key,p);assert.equal(s.y,0);assert.ok(s.alpha>=.7);}}
  assert.equal(sample(a,'loseRound',1).alpha,1);assert.equal(sample(a,'loseMatch',1).alpha,.7);assert.equal(sample(a,'outro',1).alpha,1);assert.equal(sample(a,'outro',1).x,0);assert.equal(lorePresentation(a,'outro').hasComposedOutro,false);assert.deepEqual(a,before);
});

test('Weeping Bat stays wholly at the ground-level reference while no actual upper support is provided',()=>{
  const a=actor(BAT);for(const key of KEYS){assert.match(lorePresentation(a,key).poseIntent,/weeping-bat/);for(const progress of [0,.2,.5,.8,1]){const s=sample(a,key,progress);assert.equal(Math.abs(s.x),0);assert.equal(s.y,0);assert.equal(s.alpha,1);}}
  assert.match(lorePresentation(a,'outro').scopeNote,/sans ailes ni vol libre/);assert.match(lorePresentation(a,'outro').scopeNote,/support réel/);assert.equal(lorePresentation(a,'outro').hasComposedOutro,false);
});

test('Prisoner variants keep separate constraints and Agile withdraws through two continuous grounded supports',()=>{
  for(const id of [BRAWLER,AGILE]){const ref=FIGHTER_REFERENCES[id],original=ref.constraints;try{ref.constraints=[];assert.equal(lorePresentation(actor(id),'intro').authored,false);}finally{ref.constraints=original;}}
  for(const key of KEYS){assert.match(lorePresentation(actor(BRAWLER),key).poseIntent,/^dp-brawler-/);assert.match(lorePresentation(actor(AGILE),key).poseIntent,/^dp-agile-/);}
  const a=actor(AGILE),before=structuredClone(a);assert.equal(lorePresentation(a,'outro').hasComposedOutro,true);assert.equal(lorePresentation(actor(BRAWLER),'outro').hasComposedOutro,false);
  for(const [p,x] of [[0,0],[.1,0],[.34,-8],[.54,-8],[.9,-20],[1,-20]]){const s=sample(a,'outro',p);assert.equal(Math.abs(s.x-x),0);assert.equal(s.y,0);assert.equal(s.alpha,1);}
  for(const p of [.1,.34,.54,.9])assert.ok(Math.abs(sample(a,'outro',p-1e-7).x-sample(a,'outro',p+1e-7).x)<1e-4);
  assert.match(sample(a,'outro',.3).pose,/-rear-ground-support$/);assert.match(sample(a,'outro',.8).pose,/-front-ground-support$/);assert.equal(sample({...a,facing:-1},'outro',1).x,20);assert.deepEqual(a,before);
  const fixed={...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,canMove:false}}};assert.equal(lorePresentation(fixed,'outro').hasComposedOutro,false);assert.equal(Math.abs(sample(fixed,'outro',1).x),0);
});

function engine(id){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter('sh2_bubble_head_nurse_024'),stage:STAGES.find(s=>s.id==='midwich'),mode:'local',roundsToWin:2,timeLimit:99,seed:2811,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false});engines.add(e);return e;
}
function ticks(e,n){for(let tick=0;tick<n;tick++)e.update();}
function knockout(e,winner=0){const loser=e.actors[1-winner];loser.health=0;loser.lastHit={attackerIndex:winner,isSuper:false,environmental:false};e.resolveKnockouts();}

test('ten real engine matches exercise all thirty contexts through reversible rounds and final results without new abilities',()=>{
  const seen=new Set();for(const id of IDS)for(const wins of [true,false]){const e=engine(id),a=e.actors[0],weapon=a.data.visual.weapon;
    assert.equal(a.presentation.key,'intro');assert.equal(a.presentation.lore.authored,true);seen.add(id+':intro');ticks(e,e.phaseTimer);knockout(e,wins?0:1);
    const first=wins?'winRound':'loseRound';assert.equal(a.presentation.key,first);assert.equal(a.presentation.reversible,true);assert.equal(a.presentation.lore.authored,true);seen.add(id+':'+(TYPES[first]||first));
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.equal(a.health,a.maxHealth);assert.equal(a.data.visual.weapon,weapon);knockout(e,wins?0:1);
    const final=wins?'winMatch':'loseMatch';assert.equal(a.presentation.key,final);assert.equal(a.presentation.lore.authored,true);assert.equal(a.presentation.reversible,false);seen.add(id+':'+final);
    assert.equal(e.fatality,null);assert.equal(e.actors.length,2);assert.equal(e.projectiles.length,0);assert.ok(e.actors.every(a=>a.stats.fatalities===0));ticks(e,e.phaseTimer);assert.equal(e.phase,'matchEnd');
    if(wins){assert.equal(a.presentation.key,'outro');assert.equal(a.presentation.lore.authored,true);seen.add(id+':outro');}else assert.equal(a.presentation.key,'loseMatch');
    e.destroy();engines.delete(e);
  }assert.deepEqual(seen,new Set(ledger.items.map(i=>i.rowId)));
});

test('the actual Agile exit owns ninety ticks and freezes on focus loss without moving gameplay bodies or revealing results early',()=>{
  for(const boundary of ['blur','hidden']){const e=engine(AGILE),a=e.actors[0];ticks(e,e.phaseTimer);knockout(e);ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);knockout(e);ticks(e,e.phaseTimer);
    const physical=e.actors.map(a=>[a.x,a.y,a.health,a.ammo,a.profile.moves]);assert.equal(e.isPresentingOutro(),true);assert.equal(a.presentation.stagingDuration,OUTRO_TICKS);assert.equal(a.presentation.clipDuration,0);let overlays=0;e.ctx.fillRect=()=>overlays++;e.renderMatchEnd(e.ctx);assert.equal(overlays,0);
    ticks(e,29);const frame=a.presentation.frame;if(boundary==='blur')e.onFocusLoss();else{document.hidden=true;e.onVisibilityChange();}assert.equal(e.paused,true);ticks(e,20);assert.equal(a.presentation.frame,frame);assert.equal(e.isPresentingOutro(),true);
    if(boundary==='hidden'){assert.equal(e.togglePause(false),false);document.hidden=false;e.onVisibilityChange();assert.equal(e.paused,true);}e.togglePause(false);ticks(e,OUTRO_TICKS-frame);assert.equal(a.presentation.complete,true);assert.equal(e.isPresentingOutro(),false);assert.deepEqual(e.actors.map(a=>[a.x,a.y,a.health,a.ammo,a.profile.moves]),physical);
    e.renderMatchEnd(e.ctx);assert.ok(overlays>0);e.destroy();engines.delete(e);
  }
});
