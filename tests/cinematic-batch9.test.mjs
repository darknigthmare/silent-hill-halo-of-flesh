import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {lorePresentation,sampleLorePresentation,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';
import {OUTRO_TICKS} from '../src/presentation-sequences.js';

const IDS=['sh3_closer_church_variant','sh4_jasper_gein_victim_17','sh4_andrew_desalvo_victim_18','sh4_richard_braintree_victim_19','homecoming_swarm'];
const KEYS=['intro','winRound','loseRound','winMatch','loseMatch','outro'];
const TYPES={winRound:'winRound1',loseRound:'loseRound1'};
const ledger=JSON.parse(readFileSync(new URL('../docs/production/batches/lot9-cinematics.json',import.meta.url),'utf8'));
const fighter=id=>{const d=ROSTER.find(f=>f.id===id);assert.ok(d,id);return d;};
const actor=id=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index:0,x:320,y:594,facing:1,grounded:true});
const sample=(a,key,progress)=>sampleLorePresentation(a,{key,progress,lore:lorePresentation(a,key)});
const engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('the lot9 ledger owns exactly thirty previously missing presentation rows and no finisher or taunt',()=>{
  assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);assert.equal(new Set(ledger.items.map(i=>i.rowId)).size,30);
  assert.equal(ledger.baseCommit,'98ccc47a4c26bd05fd90b2751705730783ef8eaa');
  assert.deepEqual(new Set(ledger.items.map(i=>i.entityId)),new Set(IDS));
  for(const row of ledger.items){
    assert.equal(row.collection,'presentations');assert.equal(row.status,'implemented-candidate');assert.equal(row.baselineAuthored,false);
    assert.equal(row.rowId,`${row.entityId}:${TYPES[row.contextKey]||row.contextKey}`);assert.ok(KEYS.includes(row.contextKey));
    assert.ok(row.artifacts.includes('src/lore-cinematics.js'));assert.ok(row.evidence.some(e=>e.startsWith('https://')));assert.match(row.sourceSha256,/^[a-f0-9]{64}$/);
    assert.equal(lorePresentation(actor(row.entityId),row.contextKey).authored,true);assert.ok(row.limits.includes('1:1 non certifiée'));
  }
});

test('thirty exact authored contexts have separate pose intents, reversible round results and pure source-scoped samples',()=>{
  const contexts=new Set(),poses=new Set();
  for(const id of IDS){
    const a=actor(id),before=structuredClone(a);
    for(const key of KEYS){
      const p=lorePresentation(a,key),r=FIGHTER_REFERENCES[id].proposals[TYPES[key]||key];
      assert.equal(p.authored,true);assert.equal(p.ownerId,id);assert.equal(p.source,a.data.source);assert.equal(p.description,r.description);
      assert.equal(p.clipKey,`${key}@${id}:${TYPES[key]||key}`);assert.ok(p.poseIntent&&p.stagingId&&p.scopeNote);assert.equal(p.artStatus,'contextual-images-missing');assert.equal(p.timingProvenance,'original-versus-ticks');
      assert.equal(p.reversible,['winRound','loseRound'].includes(key));contexts.add(p.clipKey);poses.add(p.poseIntent);
      for(const progress of [0,.2,.5,.64,.8,1]){const s=sample(a,key,progress);assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.y)&&s.alpha>=0&&s.alpha<=1);assert.ok(s.pose.startsWith(p.poseIntent));}
    }
    assert.deepEqual(a,before);const s=sample(a,'loseRound',1);assert.ok(Math.abs(s.x)<1e-8);assert.ok(Math.abs(s.y)<1e-8);assert.equal(s.alpha,1);
  }
  assert.equal(contexts.size,30);assert.equal(poses.size,30);assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated,0);
});

test('adding these presentations does not activate their missing taunts or either finisher',()=>{
  assert.deepEqual(LORE_CINEMATIC_COVERAGE.presentationOnlyIds,IDS);
  for(const id of IDS){assert.equal(lorePresentation(actor(id),'taunt').authored,false);for(const type of ['signature','nightmare'])assert.equal(cinematicSummary(`${id}_${type}`).authored,false);}
  assert.equal(LORE_CINEMATIC_COVERAGE.fighterIds.length,99);assert.equal(LORE_CINEMATIC_COVERAGE.recipes.length,79);
});

test('the five new presentation dossiers reject borrowed works, body classes and substituted weapons',()=>{
  for(const id of IDS){
    const a=actor(id);
    for(const data of [{...a.data,source:'borrowed-work'},{...a.data,year:2024},{...a.data,visual:{...a.data.visual,kind:'fox'}},{...a.data,visual:{...a.data.visual,weapon:'pistol'}}]){
      const other={...a,data};for(const key of KEYS){const p=lorePresentation(other,key);assert.equal(p.authored,false,`${id}/${key}`);assert.equal(p.hasComposedOutro,false);assert.deepEqual(sample(other,key,.7),{x:0,y:0,alpha:1,pose:'hold'});}
    }
    for(const patch of [{id:'borrowed-subject'},{source:'borrowed-work'},{edition:'another-edition'}]){
      const other={...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,...patch}}};
      assert.equal(lorePresentation(other,'outro').authored,false);assert.equal(lorePresentation(other,'outro').hasComposedOutro,false);
    }
  }
  for(const id of ['sh4_jasper_gein_victim_17','sh4_richard_braintree_victim_19'])assert.equal(lorePresentation({...actor(id),data:{...fighter(id),visual:{...fighter(id).visual,weapon:null}}},'outro').authored,false);
});

test('Ghost final losses retain their own complete bodies and equipment without a new sword or permanent death effect',()=>{
  for(const id of IDS.filter(id=>id.startsWith('sh4_'))){
    const a=actor(id),before=structuredClone(a),end=sample(a,'loseMatch',1);
    assert.ok(end.alpha>.5&&end.alpha<1);assert.equal(Math.abs(end.x),0);assert.equal(end.y,0);assert.match(end.pose,/retained|suppressed/);
    assert.deepEqual(a,before);assert.equal(lorePresentation(a,'loseMatch').hasComposedOutro,false);
  }
  const a=actor('sh4_andrew_desalvo_victim_18');assert.match(lorePresentation(a,'loseMatch').poseIntent,/without-sword/);assert.match(lorePresentation(a,'winMatch').poseIntent,/barrel-roll/);
});

test('the church variant waits on its own arm weight and the Homecoming group recovers before leaving as a group',()=>{
  const c=actor('sh3_closer_church_variant');assert.equal(sample(c,'intro',0).x,sample(c,'intro',.2).x);assert.ok(sample(c,'intro',.4).x>sample(c,'intro',.2).x);
  assert.match(lorePresentation(c,'loseRound').poseIntent,/heavy-arm-support/);assert.equal(lorePresentation(c,'outro').hasComposedOutro,false);
  const s=actor('homecoming_swarm');assert.equal(sample(s,'loseRound',0).alpha,1);assert.ok(sample(s,'loseRound',.5).alpha<1);assert.equal(sample(s,'loseRound',1).alpha,1);
  assert.equal(lorePresentation(s,'outro').hasComposedOutro,true);assert.ok(sample(s,'outro',1).x<0);assert.equal(sample(s,'outro',1).alpha,0);
});

test('Richard alone makes a short discontinuous positional shift, retaining his body, feet and crowbar at the exit',()=>{
  const a=actor('sh4_richard_braintree_victim_19'),before=structuredClone(a);
  assert.equal(sample(a,'outro',.639999).x,0);assert.equal(sample(a,'outro',.64).x,-43);assert.equal(sample(a,'outro',.9).x,-43);assert.equal(sample(a,'outro',1).alpha,1);
  assert.equal(sample(a,'outro',.64).y,0);assert.equal(sample(a,'outro',.64).alpha,0);assert.match(sample(a,'outro',.64).pose,/-after-shift$/);
  assert.equal(sample({...a,facing:-1},'outro',.64).x,43);assert.deepEqual(a,before);
  for(const id of IDS.filter(id=>id!==a.data.id))assert.ok(!sample(actor(id),'outro',.64).pose.includes('position-shift'));
  const pinned={...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,canMove:false}}};assert.equal(lorePresentation(pinned,'outro').hasComposedOutro,false);assert.equal(sample(pinned,'outro',.8).x,0);
});

function engine(id){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter('sh2_bubble_head_nurse_024'),stage:STAGES.find(s=>s.id==='midwich'),mode:'local',roundsToWin:2,timeLimit:99,seed:2639,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false});engines.add(e);return e;
}
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function knockout(e,winner=0){const loser=e.actors[1-winner];loser.health=0;loser.lastHit={attackerIndex:winner,isSuper:false,environmental:false};e.resolveKnockouts();}

test('ten actual two-round matches exercise every one of the thirty owned contexts without new offensive sequences',()=>{
  const seen=new Set();
  for(const id of IDS)for(const wins of [true,false]){
    const e=engine(id),a=e.actors[0];assert.equal(a.presentation.key,'intro');assert.equal(a.presentation.lore.authored,true);seen.add(id+':intro');ticks(e,e.phaseTimer);
    knockout(e,wins?0:1);const first=wins?'winRound':'loseRound';assert.equal(e.phase,'roundEnd');assert.equal(a.presentation.key,first);assert.equal(a.presentation.reversible,true);assert.equal(a.presentation.lore.authored,true);seen.add(id+':'+(TYPES[first]||first));
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.equal(a.health,a.maxHealth);knockout(e,wins?0:1);
    const final=wins?'winMatch':'loseMatch';assert.equal(a.presentation.key,final);assert.equal(a.presentation.reversible,false);assert.equal(a.presentation.lore.authored,true);seen.add(id+':'+final);
    assert.equal(e.fatality,null);assert.equal(e.actors[0].stats.fatalities,0);assert.equal(e.actors[1].stats.fatalities,0);assert.equal(e.actors.length,2);assert.equal(e.projectiles.length,0);
    ticks(e,e.phaseTimer);assert.equal(e.phase,'matchEnd');
    if(wins){assert.equal(a.presentation.key,'outro');assert.equal(a.presentation.lore.authored,true);seen.add(id+':outro');}
    else assert.equal(a.presentation.key,'loseMatch','the loser never performs the winner exit');
    e.destroy();engines.delete(e);
  }
  assert.deepEqual(seen,new Set(ledger.items.map(i=>i.rowId)));
});

test('the two moving exits keep their full authored clock, pause on focus loss and defer the result veil until completion',()=>{
  for(const id of ['sh4_richard_braintree_victim_19','homecoming_swarm'])for(const boundary of ['blur','hidden']){
    const e=engine(id),a=e.actors[0];ticks(e,e.phaseTimer);knockout(e);ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);knockout(e);ticks(e,e.phaseTimer);
    const physical=e.actors.map(a=>[a.x,a.y,a.health,a.ammo,a.profile.moves]);assert.equal(e.isPresentingOutro(),true);assert.equal(a.presentation.stagingDuration,OUTRO_TICKS);assert.equal(a.presentation.clipDuration,0);
    let overlays=0;e.ctx.fillRect=()=>overlays++;e.renderMatchEnd(e.ctx);assert.equal(overlays,0);
    ticks(e,39);const frame=a.presentation.frame;if(boundary==='blur')e.onFocusLoss();else{document.hidden=true;e.onVisibilityChange();}
    assert.equal(e.paused,true);ticks(e,20);assert.equal(a.presentation.frame,frame);assert.equal(e.isPresentingOutro(),true);
    if(boundary==='hidden'){assert.equal(e.togglePause(false),false);document.hidden=false;e.onVisibilityChange();assert.equal(e.paused,true);}
    e.togglePause(false);ticks(e,OUTRO_TICKS-frame);assert.equal(a.presentation.complete,true);assert.equal(e.isPresentingOutro(),false);assert.deepEqual(e.actors.map(a=>[a.x,a.y,a.health,a.ammo,a.profile.moves]),physical);
    e.destroy();engines.delete(e);
  }
});
