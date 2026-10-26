import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {lorePresentation,sampleLorePresentation,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';
import {OUTRO_TICKS} from '../src/presentation-sequences.js';

const IDS=['homecoming_order_soldier_091','bom_gray_child_147','bom_wood_sapling_139','shf_harai_katashiro_158','film_dark_nurse_171'];
const KEYS=['intro','winRound','loseRound','winMatch','loseMatch','outro'],TYPES={winRound:'winRound1',loseRound:'loseRound1'};
const HARAI='shf_harai_katashiro_158',NURSE='film_dark_nurse_171';
const ledger=JSON.parse(readFileSync(new URL('../docs/production/batches/lot10-cinematics.json',import.meta.url),'utf8'));
const fighter=id=>{const d=ROSTER.find(f=>f.id===id);assert.ok(d,id);return d;};
const actor=id=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index:0,x:320,y:594,facing:1,grounded:true});
const sample=(a,key,progress)=>sampleLorePresentation(a,{key,progress,lore:lorePresentation(a,key)});
const engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('lot10 owns exactly thirty new presentation rows on five identities without borrowing the lot9 rows',()=>{
  assert.equal(ledger.baseCommit,'79c64fe91590567253eb35630018e877d590d7a0');assert.equal(ledger.batch,'lot10');assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);
  const old=JSON.parse(readFileSync(new URL('../docs/production/batches/lot9-cinematics.json',import.meta.url),'utf8')).items.map(i=>i.rowId);
  assert.equal(new Set(ledger.items.map(i=>i.rowId)).size,30);assert.deepEqual(new Set(ledger.items.map(i=>i.entityId)),new Set(IDS));
  for(const row of ledger.items){
    assert.equal(row.collection,'presentations');assert.equal(row.status,'implemented-candidate');assert.equal(row.baselineAuthored,false);assert.ok(!old.includes(row.rowId));
    assert.equal(row.rowId,`${row.entityId}:${TYPES[row.contextKey]||row.contextKey}`);assert.ok(KEYS.includes(row.contextKey));assert.ok(row.artifacts.includes('src/lore-cinematics.js'));assert.ok(row.evidence.some(e=>e.startsWith('https://')));assert.match(row.sourceSha256,/^[a-f0-9]{64}$/);
    assert.equal(lorePresentation(actor(row.entityId),row.contextKey).authored,true);assert.equal(lorePresentation(fighter(row.entityId),row.contextKey).authored,true,'static catalogue authoring also keeps the exact edition');
  }
});

test('all thirty new contexts have distinct source-owned pose intents and pure reversible samples',()=>{
  const poses=new Set(),contexts=new Set();
  for(const id of IDS){const a=actor(id),before=structuredClone(a);
    for(const key of KEYS){const p=lorePresentation(a,key),proposal=FIGHTER_REFERENCES[id].proposals[TYPES[key]||key];
      assert.equal(p.authored,true);assert.equal(p.ownerId,id);assert.equal(p.source,a.data.source);assert.equal(p.description,proposal.description);assert.equal(p.clipKey,`${key}@${id}:${TYPES[key]||key}`);
      assert.ok(p.poseIntent&&p.stagingId&&p.scopeNote);assert.equal(p.artStatus,'contextual-images-missing');assert.equal(p.timingProvenance,'original-versus-ticks');assert.equal(p.reversible,['winRound','loseRound'].includes(key));poses.add(p.poseIntent);contexts.add(p.clipKey);
      for(const progress of [0,.22,.3,.5,.64,.8,1]){const s=sample(a,key,progress);assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.y)&&s.alpha>=0&&s.alpha<=1);assert.ok(s.pose.startsWith(p.poseIntent));}
    }
    assert.deepEqual(a,before);const recovered=sample(a,'loseRound',1);assert.ok(Math.abs(recovered.x)<1e-8);assert.equal(Math.abs(recovered.y),0);assert.equal(recovered.alpha,1);
  }
  assert.equal(poses.size,30);assert.equal(contexts.size,30);assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated,0);
});

test('new presentations reject another work, year, weapon, body, policy owner or policy edition',()=>{
  for(const id of IDS){const a=actor(id);
    for(const data of [{...a.data,source:'borrowed-work'},{...a.data,year:1999},{...a.data,visual:{...a.data.visual,kind:'fox'}},{...a.data,visual:{...a.data.visual,weapon:'pistol'}}]){
      const forged={...a,data};for(const key of KEYS){assert.equal(lorePresentation(forged,key).authored,false);assert.equal(lorePresentation(forged,key).hasComposedOutro,false);assert.deepEqual(sample(forged,key,.8),{x:0,y:0,alpha:1,pose:'hold'});}
    }
    for(const patch of [{id:'other-subject'},{source:'other-work'},{edition:'other-edition'}])assert.equal(lorePresentation({...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,...patch}}},'intro').authored,false);
  }
  assert.equal(fighter(HARAI).visual.weapon,'knife');for(const id of ['homecoming_order_soldier_091','bom_gray_child_147',HARAI,NURSE])assert.equal(lorePresentation({...actor(id),data:{...fighter(id),visual:{...fighter(id).visual,weapon:null}}},'intro').authored,false);
});

test('the film nurse stays within her playable 2006 scripted adaptation and never gains an activation trigger or Revelation behavior',()=>{
  const a=actor(NURSE),before=structuredClone(a);assert.equal(a.profile.referencePolicy.adaptationMode,'versus-scripted');
  for(const patch of [{combatEnabled:false},{adaptationMode:'versus-transposition'},{role:'combatant'},{edition:'Silent Hill Revelation 2012'}]){
    const forged={...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,...patch}}};for(const key of KEYS)assert.equal(lorePresentation(forged,key).authored,false);
  }
  assert.equal(sample(a,'intro',0).x,sample(a,'intro',.3).x);assert.ok(sample(a,'intro',.6).x>sample(a,'intro',.3).x);
  for(const key of KEYS){assert.ok(lorePresentation(a,key).poseIntent.startsWith('film2006-nurse-'));assert.equal(lorePresentation(a,key).hasComposedOutro,false);}
  assert.match(lorePresentation(a,'intro').scopeNote,/aucun déclencheur réel de lumière/);assert.deepEqual(a,before);
});

test('the Vita Expansion Child keeps its existing knife and Sapling remains an autonomous wooden child without a parent or fragments being spawned',()=>{
  const id='bom_gray_child_147',ref=FIGHTER_REFERENCES[id],original=ref.constraints;
  try{ref.constraints=original.filter(c=>!c.startsWith('Contenu Expansion Pack;'));assert.equal(lorePresentation(actor(id),'intro').authored,false,'the source-specific DLC scope must remain explicit');}
  finally{ref.constraints=original;}
  for(const key of KEYS){assert.ok(lorePresentation(actor(id),key).poseIntent.startsWith('bom-expansion-child-'));assert.ok(lorePresentation(actor('bom_wood_sapling_139'),key).poseIntent.startsWith('bom-sapling-'));}
  assert.match(lorePresentation(actor(id),'intro').scopeNote,/Une seule créature déjà munie/);assert.match(lorePresentation(actor('bom_wood_sapling_139'),'intro').scopeNote,/pas une identification fongique/);
});

test('Harai withdraws through three continuous blade-support transfers without a teleport, vertical jump or rotated bitmap',()=>{
  const a=actor(HARAI),before=structuredClone(a);assert.equal(lorePresentation(a,'outro').hasComposedOutro,true);
  for(const [p,x] of [[0,0],[.22,-8],[.3,-8],[.64,-20],[.7,-20],[1,-28]]){const s=sample(a,'outro',p);assert.equal(Math.abs(s.x-x),0);assert.equal(s.y,0);assert.equal(s.alpha,1);}
  assert.match(sample(a,'outro',.1).pose,/-left-blade-support$/);assert.match(sample(a,'outro',.5).pose,/-right-blade-support$/);assert.match(sample(a,'outro',1).pose,/-both-blades-support$/);
  for(const p of [.22,.38,.64,.78])assert.ok(Math.abs(sample(a,'outro',p-1e-7).x-sample(a,'outro',p+1e-7).x)<1e-5,'continuous offsets cannot masquerade as a source teleport');
  assert.equal(sample({...a,facing:-1},'outro',1).x,28);assert.deepEqual(a,before);const fixed={...a,profile:{...a.profile,referencePolicy:{...a.profile.referencePolicy,canMove:false}}};assert.equal(lorePresentation(fixed,'outro').hasComposedOutro,false);assert.equal(sample(fixed,'outro',1).x,0);
});

test('the new thirty contexts preserve both prior moving exits and do not enable any of their own taunts or finishers',()=>{
  for(const id of IDS){assert.equal(lorePresentation(actor(id),'taunt').authored,false);for(const type of ['signature','nightmare'])assert.equal(cinematicSummary(id+'_'+type).authored,false);}
  assert.equal(lorePresentation(actor('sh4_richard_braintree_victim_19'),'outro').hasComposedOutro,true);assert.equal(lorePresentation(actor('homecoming_swarm'),'outro').hasComposedOutro,true);
  assert.equal(LORE_CINEMATIC_COVERAGE.fighterIds.length,99);assert.equal(LORE_CINEMATIC_COVERAGE.recipes.length,79);assert.equal(LORE_CINEMATIC_COVERAGE.presentationOnlyIds.length,10);
  const staticCount=ROSTER.reduce((n,f)=>n+['intro','winRound','loseRound','winMatch','loseMatch','outro','taunt'].filter(k=>lorePresentation(f,k).authored).length,0);assert.equal(staticCount,746);
});

function engine(id){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter('sh2_bubble_head_nurse_024'),stage:STAGES.find(s=>s.id==='midwich'),mode:'local',roundsToWin:2,timeLimit:99,seed:2640,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false});engines.add(e);return e;
}
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function knockout(e,winner=0){const loser=e.actors[1-winner];loser.health=0;loser.lastHit={attackerIndex:winner,isSuper:false,environmental:false};e.resolveKnockouts();}

test('ten actual menu-equivalent two-round matches exercise all thirty added contexts and keep roles, bodies and weapons intact',()=>{
  const seen=new Set();for(const id of IDS)for(const wins of [true,false]){
    const e=engine(id),a=e.actors[0],body=a.data.id,weapon=a.data.visual.weapon;assert.equal(a.presentation.key,'intro');assert.equal(a.presentation.lore.authored,true);seen.add(id+':intro');ticks(e,e.phaseTimer);knockout(e,wins?0:1);
    const first=wins?'winRound':'loseRound';assert.equal(e.phase,'roundEnd');assert.equal(a.presentation.key,first);assert.equal(a.presentation.reversible,true);assert.equal(a.presentation.lore.authored,true);seen.add(id+':'+(TYPES[first]||first));
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.equal(a.health,a.maxHealth);knockout(e,wins?0:1);const final=wins?'winMatch':'loseMatch';assert.equal(a.presentation.key,final);assert.equal(a.presentation.lore.authored,true);assert.equal(a.presentation.reversible,false);seen.add(id+':'+final);
    assert.equal(e.fatality,null);assert.equal(e.actors.length,2);assert.equal(e.projectiles.length,0);assert.equal(a.data.id,body);assert.equal(a.data.visual.weapon,weapon);assert.ok(e.actors.every(a=>a.stats.fatalities===0));ticks(e,e.phaseTimer);assert.equal(e.phase,'matchEnd');
    if(wins){assert.equal(a.presentation.key,'outro');assert.equal(a.presentation.lore.authored,true);seen.add(id+':outro');}else assert.equal(a.presentation.key,'loseMatch');
    e.destroy();engines.delete(e);
  }
  assert.deepEqual(seen,new Set(ledger.items.map(i=>i.rowId)));
});

test('Harais real composed exit owns ninety ticks, pauses on focus loss and defers the result veil while preserving physical coordinates',()=>{
  for(const boundary of ['blur','hidden']){const e=engine(HARAI),a=e.actors[0];ticks(e,e.phaseTimer);knockout(e);ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);knockout(e);ticks(e,e.phaseTimer);
    const physical=e.actors.map(a=>[a.x,a.y,a.health,a.ammo,a.profile.moves]);assert.equal(e.isPresentingOutro(),true);assert.equal(a.presentation.stagingDuration,OUTRO_TICKS);assert.equal(a.presentation.clipDuration,0);let overlays=0;e.ctx.fillRect=()=>overlays++;e.renderMatchEnd(e.ctx);assert.equal(overlays,0);
    ticks(e,38);const frame=a.presentation.frame;if(boundary==='blur')e.onFocusLoss();else{document.hidden=true;e.onVisibilityChange();}assert.equal(e.paused,true);ticks(e,20);assert.equal(a.presentation.frame,frame);assert.equal(e.isPresentingOutro(),true);
    if(boundary==='hidden'){assert.equal(e.togglePause(false),false);document.hidden=false;e.onVisibilityChange();assert.equal(e.paused,true);}e.togglePause(false);ticks(e,OUTRO_TICKS-frame);assert.equal(a.presentation.complete,true);assert.equal(e.isPresentingOutro(),false);assert.deepEqual(e.actors.map(a=>[a.x,a.y,a.health,a.ammo,a.profile.moves]),physical);
    e.destroy();engines.delete(e);
  }
});
