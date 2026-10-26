import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ROSTER,createCombatProfile} from '../src/data.js';
import {combineResearch,validateResearch,buildProductionPlan,roleDecisionRuntimeCompatible} from '../scripts/build-production-plan.mjs';

const research=combineResearch(await Promise.all(['classic','extended'].map(async name=>
  JSON.parse(await readFile(new URL(`../docs/production/research/${name}.json`,import.meta.url))))));
const ids=['film_mannequin_monster_176','film_missionary_revelation_177'];
const edition='Silent Hill: Revelation (2012, film de Michael J. Bassett)';
const reviewedFilmIds=new Set([...ids,'film_armless_man_170','film_dark_nurse_171',
  'film_grey_child_film_172','film_creeper_swarm_film_173','film_colin_the_janitor_174','film_red_pyramid_film_175']);

test('Revelation scene identities close their role alone while keeping authored versus moves playable',()=>{
  assert.equal(validateResearch(research),true);
  const plan=buildProductionPlan(research);
  for(const id of ids){
    const reference=research.fighters.find(f=>f.id===id),fighter=ROSTER.find(f=>f.id===id),profile=createCombatProfile(fighter);
    assert.equal(reference.referenceEdition,edition);
    assert.equal(reference.combatRole,'scripted-encounter');
    assert.equal(reference.roleDecision.adaptationScope,'versus-scripted');
    assert.equal(roleDecisionRuntimeCompatible(reference.roleDecision,fighter,profile),true);
    assert.equal(profile.referencePolicy.edition,edition);
    assert.equal(profile.referencePolicy.combatEnabled,true);
    assert.ok(Object.values(profile.moves).some(move=>move.enabled));
    assert.equal(plan.tasks.find(t=>t.id===id+':role').status,'Validé');
    assert.ok(plan.tasks.filter(t=>t.entityId===id&&t.id!==id+':role').every(t=>t.status!=='Validé'));
    for(const move of plan.moves.filter(m=>m.fighterId===id)){
      assert.match(move.target,/prototype de versus/);
      for(const key of ['sourceFrameRate','sourceStart','sourceImpact','sourceEnd'])assert.equal(move[key],'');
    }
    assert.ok(plan.poses.filter(p=>p.fighterId===id).every(p=>/proposée pour adapter cette figure de scène/.test(p.description)));
  }
  assert.equal(plan.metrics.certifiedOneToOne,0);
});

test('a film role cannot move between the 2006, 2012 and Return editions even with a matching live policy',()=>{
  for(const id of reviewedFilmIds){
    const reference=research.fighters.find(f=>f.id===id),fighter=ROSTER.find(f=>f.id===id),profile=createCombatProfile(fighter);
    const editions=['Silent Hill (2006, film de Christophe Gans)',edition,'Return to Silent Hill (2026)'];
    for(const otherEdition of editions.filter(value=>value!==reference.referenceEdition)){
      const changed=structuredClone(profile);changed.referencePolicy.edition=otherEdition;
      assert.equal(roleDecisionRuntimeCompatible({...reference.roleDecision,edition:otherEdition},fighter,changed),false,id+' cannot borrow '+otherEdition);
      const altered=structuredClone(research),entry=altered.fighters.find(f=>f.id===id);
      entry.referenceEdition=entry.roleDecision.edition=otherEdition;
      assert.throws(()=>validateResearch(altered),/unsupported adaptation scope or exact film identity/);
    }
  }
});

test('the expanded film scope cannot resolve any of the other 222 source identities',()=>{
  const reference=research.fighters.find(f=>f.id===ids[0]);
  for(const fighter of ROSTER.filter(f=>!reviewedFilmIds.has(f.id))){
    const changed=structuredClone(createCombatProfile(ROSTER.find(f=>f.id===ids[0])));
    changed.referencePolicy.id=fighter.id;
    changed.referencePolicy.source=fighter.source;
    const decision={...reference.roleDecision,fighterId:fighter.id};
    assert.equal(roleDecisionRuntimeCompatible(decision,fighter,changed),false,fighter.id);
  }
  assert.equal(ROSTER.filter(f=>!reviewedFilmIds.has(f.id)).length,222);
});
