import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ROSTER,createCombatProfile} from '../src/data.js';
import {combineResearch,validateResearch,buildProductionPlan,roleDecisionRuntimeCompatible} from '../scripts/build-production-plan.mjs';

const research=combineResearch(await Promise.all(['classic','extended'].map(async name=>
 JSON.parse(await readFile(new URL(`../docs/production/research/${name}.json`,import.meta.url))))));
const ids=['film_armless_man_170','film_dark_nurse_171','film_grey_child_film_172',
 'film_creeper_swarm_film_173','film_colin_the_janitor_174','film_red_pyramid_film_175'];
const ref=id=>research.fighters.find(f=>f.id===id);
const live=id=>ROSTER.find(f=>f.id===id);

test('six reviewed film scene identities retain explicit playable versus adaptations',()=>{
 assert.equal(validateResearch(research),true);
 const plan=buildProductionPlan(research);
 for(const id of ids){
  const reference=ref(id),fighter=live(id),profile=createCombatProfile(fighter),row=plan.fighters.find(f=>f.id===id);
  assert.equal(reference.roleDecision.adaptationScope,'versus-scripted');
  assert.equal(row.roleDecision.adaptationScope,'versus-scripted','normalization keeps the reviewed scope');
  assert.equal(row.roleResolved,true);assert.equal(profile.referencePolicy.combatEnabled,true);
  assert.equal(profile.referencePolicy.adaptationMode,'versus-scripted');
  assert.equal(roleDecisionRuntimeCompatible(reference.roleDecision,fighter,profile),true);
  assert.ok(Object.values(profile.moves).some(move=>move.enabled));
  const role=plan.tasks.find(t=>t.id===id+':role');assert.equal(role.status,'Validé');
  assert.match(role.reason,/adaptation de versus explicitement proposée/);
  assert.doesNotMatch(role.reason,/toutes les commandes autonomes désactivées/);
  assert.ok(plan.tasks.filter(t=>t.entityId===id&&!t.id.endsWith(':role')).every(t=>t.status!=='Validé'));
  for(const move of plan.moves.filter(m=>m.fighterId===id)){
   assert.match(move.target,/prototype de versus/);assert.doesNotMatch(move.target,/Ne produire aucune attaque autonome/);
   for(const key of ['sourceFrameRate','sourceStart','sourceImpact','sourceEnd'])assert.equal(move[key],'');
  }
  for(const pose of plan.poses.filter(p=>p.fighterId===id)){
   assert.match(pose.description,/proposée pour adapter cette figure de scène/);
   assert.doesNotMatch(pose.description,/Ne pas forcer une posture de combattant/);
  }
 }
 assert.equal(plan.metrics.certifiedOneToOne,0);
});

test('an adaptation scope cannot confer a reviewed role on another work, film edition or role',()=>{
 const id=ids[0],reference=ref(id),fighter=live(id),profile=createCombatProfile(fighter),decision=reference.roleDecision;
 for(const changed of [
  {...decision,adaptationScope:'canonical-gameplay'},
  {...decision,adaptationScope:null},
  {...decision,edition:'Silent Hill: Revelation (2012)'},
  {...decision,decision:'combatant'},
  {...decision,fighterId:ids[1]}
 ])assert.equal(roleDecisionRuntimeCompatible(changed,fighter,profile),false);
 for(const change of [f=>{f.roleDecision.adaptationScope='unknown';},f=>{f.roleDecision.decision='combatant';},f=>{f.roleDecision.edition=f.referenceEdition='Silent Hill: Revelation (2012)';},f=>{f.roleDecision.evidence=['EXT47','not-a-source'];}]){
  const altered=structuredClone(research);change(altered.fighters.find(f=>f.id===id));assert.throws(()=>validateResearch(altered));
 }
 const other=live('homecoming_bogeyman_092');
 assert.equal(roleDecisionRuntimeCompatible({...decision,fighterId:other.id},other,createCombatProfile(other)),false);
});

test('playable film role closure requires the reviewed live policy and actual active slots',()=>{
 const id=ids[5],reference=ref(id),fighter=live(id),profile=createCombatProfile(fighter);
 for(const change of [
  p=>{p.referencePolicy.adaptationMode='canonical';},p=>{p.referencePolicy.combatEnabled=false;},
  p=>{p.referencePolicy.capabilities.reviewed=false;},p=>{p.referencePolicy.source='sh2';},
  p=>{p.referencePolicy.id=ids[0];},p=>{p.referencePolicy.edition='Silent Hill (2006)';},
  p=>{for(const move of Object.values(p.moves))move.enabled=false;},p=>{p.moves={};},
  p=>{for(const move of Object.values(p.moves))move.enabled=false;p.moves.unregisteredProbe={enabled:true};},
  p=>{p.moves.neutralLight.key='super';},p=>{delete p.moves.neutralLight;},
  p=>{p.moveset.order.push('unregisteredProbe');}
 ]){const altered=structuredClone(profile);change(altered);assert.equal(roleDecisionRuntimeCompatible(reference.roleDecision,fighter,altered),false);}
 assert.equal(roleDecisionRuntimeCompatible({...reference.roleDecision,adaptationScope:undefined},fighter,profile),false,'the legacy dossier path never accepts a playable profile');
});

test('the twenty-five earlier dossier decisions keep all autonomous commands disabled',()=>{
 const dossiers=research.fighters.filter(f=>f.roleDecision?.status==='resolved'&&f.roleDecision.adaptationScope===undefined);
 assert.equal(dossiers.length,25);
 for(const reference of dossiers){
  const fighter=live(reference.id),profile=createCombatProfile(fighter);
  assert.equal(roleDecisionRuntimeCompatible(reference.roleDecision,fighter,profile),true,reference.id);
  assert.equal(profile.referencePolicy.combatEnabled,false,reference.id);
  assert.ok(Object.values(profile.moves).every(move=>move.enabled===false),reference.id);
 }
});
