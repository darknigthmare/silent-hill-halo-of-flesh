import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, createCombatProfile } from '../src/data.js';
import { buildLoreMoveset, MOVESET_KEYS } from '../src/movesets.js';
import { combatReferencePolicy, combatReferenceRecipe } from '../src/combat-reference-policy.js';
import { FIGHTER_REFERENCES } from '../src/production-reference.js';

const fighter = id => {
  const found = ROSTER.find(f => f.id === id);
  assert.ok(found, id);
  return found;
};
const profile = id => createCombatProfile(fighter(id));
const activeMoves = id => Object.values(profile(id).moves).filter(move => move.enabled);

test('Air Screamer and Sorrowful use contact attacks instead of an invisible long-range projectile replacement', () => {
  for (const id of ['sh1_air_screamer_001', 'sh1_night_flutter_002', 'townfall_sorrowful']) {
    const p = profile(id);
    assert.ok(activeMoves(id).every(move => !move.projectile && !move.trap && !move.aura), id);
    assert.ok(p.moves.neutralSpecial.active > 1, id);
    assert.ok(p.moves.neutralSpecial.reach < 300, id);
    assert.equal(p.moves.neutralSpecial.effect, null, id);
  }
  assert.ok(profile('sh1_air_screamer_001').moves.super.travel > 0);
  assert.equal(profile('townfall_sorrowful').moves.forwardSpecial.level, 'throw');
  assert.ok(profile('townfall_sorrowful').moves.forwardSpecial.reach < 120);
});

test('hiding and rotating do not grant teleportation; Richard retains his documented short displacement', () => {
  for (const id of ['sh2_mannequin_022', 'sh2_mannequin_ambusher_023', 'sh2_spider_mannequin',
    'sh3_pendulum_039', 'townfall_fallen', 'shf_ayakakashi_152']) {
    assert.ok(activeMoves(id).every(move => !move.teleport), id);
  }
  const richard = profile('sh4_richard_braintree_victim_19');
  assert.equal(richard.moves.forwardSpecial.teleport, 'behind');
  assert.match(richard.moves.forwardSpecial.name, /pied-de-biche/);
  assert.equal(richard.moveset.referencePolicy.capabilities.teleport, true);
  assert.ok(activeMoves('sh4_cynthia_velasquez_victim_16').every(move => !move.teleport));
});

test('the two kinds of SH4 ghost danger remain distinct from generic fireballs and meter-draining radio effects', () => {
  const ghost = profile('sh4_ghost_victim_066');
  const jasper = profile('sh4_jasper_gein_victim_17');
  assert.equal(ghost.moves.downSpecial.aura, true);
  assert.equal(ghost.moves.downSpecial.effect, null);
  assert.equal(jasper.moves.neutralSpecial.aura, true);
  assert.equal(jasper.moves.neutralSpecial.effect?.id, 'burn');
  assert.ok(activeMoves('sh4_jasper_gein_victim_17').every(move => !move.projectile && !move.teleport));
  assert.ok(jasper.moves.super.reach < 300);
  const cynthia = profile('sh4_cynthia_velasquez_victim_16');
  assert.equal(cynthia.moves.throw.effect?.id, 'bind');
  assert.equal(cynthia.moves.neutralSpecial.level, 'throw');
});

test('documented jets, gunfire and the final SH2 insect swarm survive without granting every special a projectile', () => {
  for (const id of ['sh2_lying_figure_020', 'sh2_eddie_dombrowski_032',
    'sh2_maria_final_manifestation_033', 'sh2_mary_final_manifestation_034',
    'origins_straight_jacket_074', 'arcade_robbie_the_rabbit_shotgun']) {
    const p = profile(id);
    assert.equal(p.moves.neutralSpecial.projectile, true, id);
    assert.equal(p.moves.neutralSpecial.projectileCount, 1, id);
    const swarm=['sh2_maria_final_manifestation_033','sh2_mary_final_manifestation_034'].includes(id);
    assert.equal(p.moves.neutralSpecial.effect?.id??null, swarm?'bind':null, id);
    assert.equal(p.moves.forwardSpecial.projectile, false, id);
    assert.equal(p.moves.airSpecial.projectile, false, id);
  }
  assert.equal(profile('sh1_floatstinger_016').moves.airSpecial.projectile, true);
});

test('role constraints disable autonomous offense and fixed-body locomotion while keeping a surface-moving boss mobile', () => {
  for (const id of ['sh1_larval_stalker_007', 'sh3_valtiel_051', 'sh4_greedy_worm_069',
    'sh4_toadstool_061', 'downpour_doll_106', 'townfall_widow',
    'sh3_sewer_creature_052', 'sh4_sacrificed_walter_071']) {
    const p = profile(id);
    assert.equal(p.moveset.referencePolicy.combatEnabled, false, id);
    for (const move of Object.values(p.moves)) {
      assert.equal(move.enabled, false, `${id}/${move.key}`);
      assert.ok(move.disabledReason);
      assert.deepEqual(move.cancelInto, []);
      assert.equal(move.projectile || move.trap || move.aura || Boolean(move.teleport || move.effect), false);
    }
  }
  for (const id of ['sh4_wall_man_056', 'sh4_one_truth_070', 'sh2_flesh_lip_027',
    'origins_memory_of_richard_grady_083', 'downpour_wheelman_116']) {
    const p = profile(id);
    assert.equal(p.moveset.referencePolicy.canMove, false, id);
    assert.equal(p.moveset.referencePolicy.canJump, false, id);
    assert.equal(p.moveset.referencePolicy.canDodge, false, id);
    assert.equal(p.moves.airSpecial.enabled, false, id);
    assert.equal(p.moves.backThrow.enabled, false, id);
    assert.ok(Object.values(p.moves).every(move => move.travel === 0 && move.verticalTravel === 0), id);
  }
  const twinfeeler = profile('sh1_twinfeeler_015');
  assert.equal(twinfeeler.moveset.referencePolicy.canMove, true);
  assert.equal(twinfeeler.moveset.referencePolicy.canJump, false);
  assert.ok(twinfeeler.moves.forwardSpecial.travel > 0);
});

test('known identities do not unlock blocked supers; scripted film scenes retain an explicit prototype adaptation', () => {
  for (const id of ['origins_remnant_077', 'downpour_weeping_bat_105',
    'arcade_phantom_118', 'homecoming_curtis_ackers', 'townfall_the_weight']) {
    const p = profile(id);
    assert.notEqual(FIGHTER_REFERENCES[id].combatRole, 'unverified', id);
    assert.equal(p.moves.super.enabled, false, id);
    assert.equal(p.moves.desperation.enabled, false, id);
    assert.ok(p.moves.super.disabledReason, id);
  }
  const film = profile('film_dark_nurse_171');
  assert.equal(film.moveset.referencePolicy.combatEnabled, true);
  assert.equal(film.moveset.referencePolicy.adaptationMode, 'versus-scripted');
  assert.ok(Object.values(film.moves).every(move => move.fidelity === 'versus-adaptation'));
});

test('edition and identity checks do not copy powers from a similarly named source or an invented fighter', () => {
  const original = fighter('sh2_lying_figure_crawling_021');
  assert.match(combatReferencePolicy(original).edition, /2001/);
  assert.match(combatReferencePolicy(fighter('sh2_mannequin_ambusher_023')).edition, /2024/);
  const wrongWork = {...fighter('sh4_richard_braintree_victim_19'), source:'film'};
  const mismatched = buildLoreMoveset(wrongWork);
  assert.equal(mismatched.referencePolicy.combatEnabled, false);
  assert.equal(mismatched.referencePolicy.capabilities.teleport, false);
  assert.ok(Object.values(mismatched.moves).every(move => !move.enabled && !move.teleport));
  assert.deepEqual(combatReferenceRecipe(wrongWork), {});
  const renamed = {...original, id:'sh2_invented_crawling_variant'};
  assert.equal(combatReferencePolicy(renamed).combatEnabled, false);
});

test('archetypes and legacy lore keywords cannot promote a sourced contact fighter into a magic kit', () => {
  const base = fighter('sh1_air_screamer_001');
  const misleading = {...base, archetype:'artillery', canonicalBehavior:'Cri, miroir, illusion, sol, immobile, foudre, onde, racine, feu.',
    signature:'Téléportation — salve de feu'};
  const moves = buildLoreMoveset(misleading).moves;
  assert.ok(Object.values(moves).every(move => !move.projectile && !move.trap && !move.teleport && !move.aura && !move.effect));
  assert.ok(Object.values(moves).every(move => move.fidelity !== 'direct-canonical'));
  assert.match(moves.neutralSpecial.canonicalBasis, /pattes en vol plané \(GlideScratchAttack\)/);
  assert.doesNotMatch(moves.neutralSpecial.canonicalBasis, /salve de feu/);
});

test('weapons and enclosed bodies preserve the restrictions recorded for their own edition', () => {
  const weapons = [
    ['origins_faceless_nurse', /Seringue/, /Scalpel|Tuyau/],
    ['homecoming_nurse', /Scalpel/, /Seringue|Tuyau/],
    ['sh2_bubble_head_nurse_024', /Tuyau/, /Seringue|Scalpel/],
    ['sh1_mumbler_006', /Griffes/, /Couteau/]
  ];
  for (const [id, correct, wrong] of weapons) {
    const p = profile(id);
    for (const key of ['neutralLight', 'neutralHeavy', 'neutralSpecial', 'airHeavy']) {
      assert.match(p.moves[key].name, correct, `${id}/${key}`);
      assert.doesNotMatch(p.moves[key].name, wrong, `${id}/${key}`);
    }
  }
  for (const id of ['sh2_lying_figure_020', 'sh3_numb_body_small_037', 'townfall_lunger']) {
    const p = profile(id);
    assert.equal(p.moves.throw.enabled, false, id);
    assert.equal(p.moves.backThrow.enabled, false, id);
    assert.doesNotMatch(p.moves.neutralLight.name, /Poing|Coude/);
  }
});

test('Silent Hill f attacks use the recorded limb and fire behaviors without transferring floral fields or fox fire', () => {
  for (const id of ['shf_kashimashi_151', 'shf_oi_omoi_159', 'shf_ara_abare_153',
    'shf_shichibi_168', 'shf_kyubi_169']) {
    assert.ok(activeMoves(id).every(move => !move.projectile && !move.aura && !move.trap && !move.effect && !move.teleport), id);
  }
  const shiromuku = profile('shf_shiromuku_166');
  assert.match(shiromuku.moves.neutralSpecial.name, /Bras-renard/);
  assert.equal(shiromuku.moves.neutralSpecial.teleport, 'behind');
  assert.equal(shiromuku.moves.neutralSpecial.hits, 3);
  assert.ok(shiromuku.moves.neutralSpecial.active >= 9, 'three spaced contact windows fit the versus timeline');
  assert.ok(Object.values(shiromuku.moves).every(move => !/rubans/i.test(move.name)));
  const rinko = profile('shf_rinko_like_entity_163');
  assert.equal(rinko.moves.neutralSpecial.projectile, true);
  assert.equal(rinko.moves.neutralSpecial.effect?.id, 'burn');
  assert.equal(rinko.moves.super.projectile, false);
});

test('Cybil provides a finite pistol phase and independent unarmed fallback; Alessa does not mix four weapons', () => {
  const cybil = profile('sh1_monster_cybil_017');
  assert.deepEqual(cybil.moveset.ammoProfile, {capacity:10, exhaustion:'unarmed', disarmBelowHealthRatio:.5});
  assert.equal(cybil.moves.neutralSpecial.ammoCost, 1);
  const unarmed = cybil.moves.neutralSpecial.exhaustedMove;
  assert.equal(unarmed.enabled, true);
  assert.equal(unarmed.projectile, false);
  assert.equal(unarmed.level, 'throw');
  assert.equal(unarmed.ammoCost, 0);
  assert.ok(unarmed.reach < 100);
  assert.ok(unarmed.active > 1);
  assert.match(cybil.moves.neutralLight.exhaustedMove.name, /désarmé/);
  unarmed.damage = 0;
  assert.ok(cybil.moves.neutralSpecial.damage > 0);
  assert.ok(profile('sh1_monster_cybil_017').moves.neutralSpecial.exhaustedMove.damage > 0);
  assert.equal(cybil.moves.super.enabled, false);
  const alessa = profile('sh3_memory_of_alessa_049');
  assert.ok(activeMoves('sh3_memory_of_alessa_049').every(move => !move.projectile));
  assert.match(alessa.moves.neutralHeavy.name, /Couteau/);
  assert.equal(alessa.moves.super.enabled, true);
  assert.deepEqual(alessa.moveset.weaponPhases.map(phase=>phase.id),['knife','handgun','pipe','smg']);
});

test('all roster moves respect enabled cancellation targets, scoped capabilities and unmeasured source timing', () => {
  for (const f of ROSTER) {
    const p = createCombatProfile(f);
    const policy = p.moveset.referencePolicy;
    assert.deepEqual(p.moveset.order, MOVESET_KEYS, f.id);
    assert.equal(policy.capabilities.reviewed, true, f.id);
    assert.ok(policy.referenceIds.length > 0, f.id);
    for (const move of Object.values(p.moves)) {
      assert.equal(typeof move.enabled, 'boolean', `${f.id}/${move.key}`);
      assert.equal(move.sourceTimingMeasured, false);
      assert.notEqual(move.fidelity, 'direct-canonical');
      assert.ok(move.cancelInto.every(key => p.moves[key]?.enabled), `${f.id}/${move.key}`);
      for (const feature of ['projectile', 'teleport', 'trap', 'aura']) {
        if (move[feature]) assert.equal(policy.capabilities[feature], true, `${f.id}/${move.key}/${feature}`);
      }
      if (move.effect) assert.ok(policy.capabilities.effects.includes(move.effect.id), `${f.id}/${move.key}/effect`);
      if (!move.enabled) assert.ok(move.disabledReason);
    }
  }
});
