import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, STAGES, createCombatProfile } from '../src/data.js';
import { FightEngine } from '../src/fight.js';
import { SPRITES } from '../src/sprite-manifest.js';
import { sampleSpriteClip } from '../src/sprite-animation.js';
import { presentationClipDuration } from '../src/presentation-sequences.js';
import { FIGHTER_REFERENCES } from '../src/production-reference.js';
import {
  LORE_CINEMATIC_COVERAGE, loreFinisher, cinematicSummary, lorePresentation,
  sampleLoreCinematic, retimeLoreCinematic, sampleLorePresentation, drawLoreCinematic,
  createLoreAudioPlayer
} from '../src/lore-cinematics.js';

const fighter = id => {
  const entry = ROSTER.find(f => f.id === id);
  assert.ok(entry, id);
  return entry;
};
const stage = id => {
  const entry = STAGES.find(s => s.id === id);
  assert.ok(entry, id);
  return entry;
};
const AIR = 'sh1_air_screamer_001', NURSE = 'sh2_bubble_head_nurse_024';
const actorFor = (id, index = 0) => ({ data: fighter(id), profile: createCombatProfile(fighter(id)), index, x: index ? 720 : 500, y: 594, grounded: true, facing: index ? -1 : 1 });
const definitionFor = (actor, type = 'signature') => actor.data.fatalities.find(f => f.type === type);
const planFor = (id = AIR, type = 'signature', options = {}) => {
  const attacker = actorFor(id), target = actorFor(NURSE, 1);
  return loreFinisher({ attacker, target, stage: stage('midwich'), definition: definitionFor(attacker, type), ...options });
};
const engines = new Set(), restoredArt = new Map();
afterEach(() => {
  for (const engine of engines) engine.destroy();
  engines.clear();
  for (const [id, original] of restoredArt) {
    if (original === undefined) delete SPRITES[id]; else SPRITES[id] = original;
  }
  restoredArt.clear();
});
function canvasContext() {
  const gradient = () => ({ addColorStop() {} });
  return new Proxy({ createLinearGradient: gradient, createRadialGradient: gradient, measureText: text => ({ width: String(text).length * 7 }) }, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}
function engineFor(options = {}) {
  globalThis.window = {};
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  globalThis.document = { hidden: false, addEventListener() {}, removeEventListener() {} };
  Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => [], vibrate: () => false }, configurable: true });
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  const context = canvasContext();
  const engine = new FightEngine({ getContext: () => context }, {
    p1: fighter(AIR), p2: fighter(NURSE), stage: stage('midwich'), mode: 'local', roundsToWin: 1,
    timeLimit: 99, seed: 419, stageHazards: false, stageDirector: false, otherworldShift: false,
    fatalities: true, stageFatalities: false, ...options
  });
  engines.add(engine);
  return engine;
}
function ticks(engine, count) { for (let i = 0; i < count; i++) engine.update(); }
function enterFight(engine) { ticks(engine, engine.phaseTimer); assert.equal(engine.phase, 'fight'); }
function prepareKnockout(engine, type = 'signature') {
  const [attacker, target] = engine.actors;
  target.health = 0;
  target.lastHit = { attackerIndex: 0, isSuper: type === 'nightmare', environmental: false };
  engine.resolveKnockouts();
  return { attacker, target };
}
function fixtureClips(id, definitions) {
  // Metadata fixture only: no generated artwork and no visual fidelity claim.
  if (!restoredArt.has(id)) restoredArt.set(id, SPRITES[id]);
  SPRITES[id] = {
    fighterId: id, source: fighter(id).source,
    frames: [0, 1].map(i => ({ path: `fixture-${i}.png`, width: 100, height: 100, anchor: [.5, 1], bodyHeight: 1, facing: 1 })),
    clips: Object.fromEntries(Object.entries(definitions).map(([key, duration]) => [key, { frames: [0, 1], frameTicks: [1, duration - 1], ticksPerFrame: 1, loop: false }]))
  };
}

test('every authored exact finisher has a viable real pairing and contiguous synchronized beats', () => {
  let plans = 0;
  for (const id of LORE_CINEMATIC_COVERAGE.fighterIds) {
    const attacker = actorFor(id), target = actorFor(NURSE, 1);
    for (const type of ['signature', 'nightmare']) {
      const definition = definitionFor(attacker, type);
      const candidates = STAGES.map(s => loreFinisher({ attacker, target, stage: s, definition }));
      const plan = candidates.find(p => p.allowed);
      assert.ok(plan, `${id}/${type}: ${candidates[0]?.reason}`);
      assert.equal(plan.id, `${id}_${type}`);
      assert.equal(plan.description, FIGHTER_REFERENCES[id].proposals.finisher.description);
      assert.equal(plan.steps[0].from, 0);
      assert.equal(plan.steps.at(-1).to, plan.duration);
      plan.steps.forEach((beat, index) => {
        assert.ok(Number.isSafeInteger(beat.ticks) && beat.ticks > 0);
        assert.equal(beat.from, index ? plan.steps[index - 1].to : 0);
        assert.ok(beat.attacker.pose && beat.target.pose && beat.sound && beat.effect);
      });
      assert.equal(plan.fidelity, 'original-versus-staging');
      assert.equal(plan.artStatus, 'contextual-images-missing');
      assert.deepEqual(cinematicSummary(plan.id).beats.map(b => [b.from, b.to]), plan.steps.map(b => [b.from, b.to]));
      plans++;
    }
  }
  assert.equal(plans, 144);
  assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated, 0);
});

test('signature, nightmare, anatomy and film edition change the edit instead of only changing its title', () => {
  const signature = planFor(), nightmare = planFor(AIR, 'nightmare');
  assert.ok(signature.allowed && nightmare.allowed);
  assert.notEqual(signature.duration, nightmare.duration);
  assert.notDeepEqual(signature.steps.map(s => [s.ticks, s.camera, s.sound, s.effect]), nightmare.steps.map(s => [s.ticks, s.camera, s.sound, s.effect]));
  assert.ok(nightmare.steps.some(s => s.sound === 'silence' && s.ticks === 19));
  const mannequin = planFor('sh2_mannequin_022');
  assert.notDeepEqual(signature.steps.map(s => s.attacker), mannequin.steps.map(s => s.attacker));
  const film = planFor('film_red_pyramid_film_175');
  const game = planFor('sh2_red_pyramid_thing_great_knife_029');
  assert.ok(film.allowed && game.allowed);
  assert.notEqual(film.recipeId, game.recipeId);
  const attacker = actorFor('sh2_red_pyramid_thing_great_knife_029');
  assert.equal(planFor(AIR, 'signature', { attacker, definition: definitionFor(actorFor('film_red_pyramid_film_175')) }).allowed, false);
  attacker.data = { ...attacker.data, source: 'film' };
  assert.equal(planFor(AIR, 'signature', { attacker, definition: definitionFor(attacker) }).allowed, false);
});

test('unknown, blocked, fixed-body, airborne and missing-prop pairings do not acquire a generic fatality', () => {
  assert.equal(cinematicSummary('invented_signature').authored, false);
  assert.equal(planFor('sh1_monster_cybil_017').allowed, false);
  for (const id of ['sh1_larval_stalker_007', 'sh4_wall_man_056']) assert.equal(planFor(AIR, 'signature', { target: actorFor(id, 1) }).allowed, false, id);
  assert.equal(planFor('sh1_groaner_003', 'signature', { target: actorFor(AIR, 1) }).allowed, false);
  assert.equal(planFor('sh2_red_pyramid_thing_spear_030', 'signature', { stage: { props: [], layers: [] } }).allowed, false);
  const doorway = STAGES.find(s => [...(s.props || []), ...(s.layers || [])].some(p => ['doors', 'door', 'elevator'].includes(p)) && !s.reference.blocked);
  assert.ok(doorway);
  assert.equal(planFor('sh2_red_pyramid_thing_spear_030', 'signature', { stage: { ...doorway, reference: { ...doorway.reference, blocked: true } } }).allowed, false, 'a prop-dependent actor finish also requires a reviewed location');
  const attacker = actorFor('sh2_red_pyramid_thing_great_knife_029');
  attacker.data = { ...attacker.data, visual: { ...attacker.data.visual, weapon: 'spear' } };
  assert.equal(planFor(AIR, 'signature', { attacker, definition: definitionFor(attacker) }).allowed, false);
});

test('the nurse curtain edit requires an actual curtain in both signature and nightmare versions', () => {
  const noCurtain = stage('nightmare_hospital_sm'), withCurtain = stage('alchemilla');
  assert.equal(noCurtain.reference.blocked, false);
  assert.ok(noCurtain.props.includes('beds'));
  assert.ok(![...noCurtain.props, ...noCurtain.layers].includes('curtains'));
  assert.ok(withCurtain.props.includes('curtains'));
  for (const type of ['signature', 'nightmare']) {
    const refused = planFor(NURSE, type, { stage: noCurtain });
    assert.equal(refused.allowed, false, `${type}: a bed is not a curtain`);
    assert.match(refused.reason, /absent du lieu/);
    const allowed = planFor(NURSE, type, { stage: withCurtain });
    assert.equal(allowed.allowed, true, `${type}: Alchemilla retains its real curtain`);
    assert.equal(allowed.recipeId, 'pipeCurtain');
    assert.ok(allowed.steps.some(beat => beat.label === 'RIDEAU FERME'));
    // Removing just the prop retains Alchemilla's ward and beds. Neither can
    // stand in for the missing foreground curtain.
    const wardOnly = { ...withCurtain, props: withCurtain.props.filter(p => p !== 'curtains'), layers: withCurtain.layers.filter(p => p !== 'curtains') };
    assert.equal(planFor(NURSE, type, { stage: wardOnly }).allowed, false);
  }
});

test('Canvas pause marks every disabled Wall Man command unavailable and keeps enabled commands legible', () => {
  const engine = engineFor({ p1: fighter('sh4_wall_man_056') }), actor = engine.actors[0];
  const context = canvasContext(), calls = [];
  context.fillText = (text, x, y, maxWidth) => calls.push({ text, x, y, maxWidth });
  engine.renderPause(context);
  const rows = calls.filter(call => call.x === 72 && call.y >= 224 && call.y <= 623);
  assert.equal(rows.length, actor.profile.moveset.order.length);
  let unavailable = 0;
  actor.profile.moveset.order.forEach((key, index) => {
    const move = actor.profile.moves[key], row = rows[index];
    assert.ok(row.text.startsWith(move.input), key);
    if (move.enabled === false) {
      unavailable++;
      assert.match(row.text, /INDISPONIBLE/, key);
      assert.ok(!row.text.includes(move.name), `${key}: no usable move name is advertised`);
      assert.ok(move.disabledReason, `${key}: the archive reason is preserved`);
    } else {
      assert.ok(row.text.includes(move.name), key);
      assert.ok(!row.text.includes('INDISPONIBLE'), key);
    }
  });
  assert.equal(unavailable, 5);
  assert.ok(rows.every(row => row.maxWidth > 0 && row.maxWidth <= 416), 'both labels and unavailable notices fit before the center panel');
  assert.ok(calls.some(call => /ARCHIVES > MOVESETS/.test(call.text) && /INDISPONIBILITÉ/.test(call.text)));
});

test('seven location edits require the reviewed location, its existing props, grounded target and actual zone', () => {
  const attacker = actorFor('film_red_pyramid_film_175'), target = actorFor(NURSE, 1);
  for (const id of LORE_CINEMATIC_COVERAGE.stageIds) {
    const location = stage(id), summary = cinematicSummary(`${id}_fatality`);
    target.x = summary.requirements.zone === 'center' ? 640 : 150;
    const options = { attacker, target, stage: location, definition: location.fatality, stageBased: true };
    assert.equal(loreFinisher(options).allowed, true, id);
    assert.equal(loreFinisher({ ...options, target: { ...target, grounded: false } }).allowed, false, id);
    assert.equal(loreFinisher({ ...options, target: { ...target, x: target.x === 640 ? 150 : 640 } }).allowed, false, id);
    assert.equal(loreFinisher({ ...options, stage: { ...location, reference: { ...location.reference, blocked: true } } }).allowed, false, id);
    assert.equal(loreFinisher({ ...options, stage: { ...location, props: [], layers: [] } }).allowed, false, id);
  }
  const location = stage('hazel_subway'); target.x = 150;
  assert.equal(loreFinisher({ attacker, target, stage: { ...location, referencePolicy: { ...location.referencePolicy, allowedHazards: [] } }, definition: location.fatality, stageBased: true }).allowed, false);
});

test('exact contextual clips never borrow another finisher while old intro clips remain compatible', () => {
  const owner = actorFor(AIR), id = `${AIR}_signature`, other = `${AIR}_nightmare`;
  fixtureClips(AIR, { idle: 4, finisher: 500, intro: 200, [`finisher@${id}`]: 73 });
  const art = SPRITES[AIR], state = (key, contextId) => ({ presentation: { key, contextId, clipKey: `${key}@${contextId}`, frame: 100 } });
  const exact = sampleSpriteClip(art, state('finisher', id));
  assert.equal(exact.pose, `finisher@${id}`); assert.equal(exact.frameIndex, 1); assert.equal(exact.total, 73);
  const missing = sampleSpriteClip(art, state('finisher', other));
  assert.equal(missing.pose, 'idle'); assert.equal(missing.fallbackReason, 'missing-contextual-finisher');
  assert.equal(presentationClipDuration(owner, state('finisher', other).presentation), 0);
  const intro = sampleSpriteClip(art, state('intro', `${AIR}:intro`));
  assert.equal(intro.pose, 'intro'); assert.equal(intro.fallbackReason, 'generic-presentation');
  assert.equal(presentationClipDuration(owner, state('intro', `${AIR}:intro`).presentation), 200);
  art.clips[`finisher@${id}`].loop = true;
  assert.equal(sampleSpriteClip(art, state('finisher', id)).pose, 'idle');
});

test('pure sampling preserves the plan, holds its end and retimes all staging channels to the longest clip', () => {
  const plan = planFor(), original = structuredClone(plan);
  const extended = retimeLoreCinematic(plan, 601);
  assert.equal(extended.duration, 601); assert.equal(extended.sourceDuration, plan.duration);
  assert.equal(extended.steps.at(-1).to, 601);
  const last = sampleLoreCinematic(extended, 9999);
  assert.equal(last.frame, 600); assert.equal(last.complete, true);
  assert.deepEqual(last.attacker, sampleLoreCinematic(extended, 600).attacker);
  const camera = [], positions = [];
  for (let tick = 0; tick < extended.duration; tick += 13) {
    const sample = sampleLoreCinematic(extended, tick);
    camera.push(sample.camera.scale); positions.push(sample.attacker.y);
    drawLoreCinematic(canvasContext(), sample, { reducedMotion: false });
    drawLoreCinematic(canvasContext(), sample, { reducedMotion: true });
  }
  assert.ok(Math.min(...camera) < 1); assert.ok(Math.min(...positions) < -100);
  assert.deepEqual(plan, original);
});

test('round defeat is reversible and research descriptions survive missing presentation images', () => {
  const actor = actorFor(AIR), lore = lorePresentation(actor, 'loseRound');
  assert.equal(lore.contextId, `${AIR}:loseRound1`);
  assert.equal(lore.description, FIGHTER_REFERENCES[AIR].proposals.loseRound1.description);
  assert.equal(lore.reversible, true); assert.equal(lore.artStatus, 'contextual-images-missing');
  for (const progress of [0, .25, .5, .75, 1]) {
    const sampled = sampleLorePresentation(actor, { key: 'loseRound', lore, progress });
    assert.equal(sampled.alpha, 1); assert.equal(sampled.y, 0);
  }
  assert.ok(Math.abs(sampleLorePresentation(actor, { key: 'loseRound', lore, progress: 1 }).x) < 1e-10);
  const blocked = actorFor('sh1_larval_stalker_007');
  assert.deepEqual(sampleLorePresentation(blocked, { key: 'intro', lore: lorePresentation(blocked, 'intro'), progress: .5 }), { x: 0, y: 0, alpha: 1, pose: 'hold' });
});

test('the engine plays cues once on the shared tick and freezes both staged bodies on pause and hitstop', () => {
  const engine = engineFor(), rendered = engineFor(); enterFight(engine); enterFight(rendered);
  prepareKnockout(engine); prepareKnockout(rendered);
  const originalPosition = engine.actors.map(a => [a.x, a.y]);
  ticks(engine, 43); ticks(rendered, 43);
  for (let i = 0; i < 8; i++) rendered.render(i * 10000);
  assert.deepEqual(rendered.actors.map(a => a.presentation), engine.actors.map(a => a.presentation));
  assert.deepEqual(rendered.fatality.cueHistory, engine.fatality.cueHistory);
  assert.equal(rendered.rng(), engine.rng());
  assert.deepEqual(engine.actors.map(a => [a.x, a.y]), originalPosition, 'compositing does not alter combat geometry');
  engine.togglePause(true);
  const frozen = structuredClone(engine.actors.map(a => a.presentation)), cues = structuredClone(engine.fatality.cueHistory);
  ticks(engine, 20); assert.deepEqual(engine.actors.map(a => a.presentation), frozen); assert.deepEqual(engine.fatality.cueHistory, cues);
  engine.togglePause(false); engine.hitstop = 4; ticks(engine, 4);
  assert.deepEqual(engine.actors.map(a => a.presentation), frozen);
  const expectedSteps = engine.fatality.choreography.steps.length;
  ticks(engine, engine.fatality.timer);
  assert.equal(engine.lastFatality.cueHistory.length, expectedSteps);
  assert.equal(new Set(engine.lastFatality.cueHistory.map(c => c.step)).size, expectedSteps);
  assert.equal(engine.actors[1].presentation.key, 'finished'); assert.equal(engine.actors[1].presentation.complete, true);
  assert.equal(engine.actors[0].stats.fatalities, 1); assert.equal(engine.actors[0].roundWins, 1);
});

test('contextual attacker and victim clips extend the engine edit together without accepting generic finisher art', () => {
  const id = `${AIR}_signature`;
  fixtureClips(AIR, { idle: 4, finisher: 1100, [`finisher@${id}`]: 401 });
  fixtureClips(NURSE, { idle: 4, finished: 1200, [`finished@${id}`]: 503 });
  const engine = engineFor(); enterFight(engine); prepareKnockout(engine);
  assert.equal(engine.fatality.total, 503); assert.equal(engine.fatality.choreography.duration, 503);
  assert.equal(engine.actors[0].presentation.clipDuration, 401); assert.equal(engine.actors[1].presentation.clipDuration, 503);
  ticks(engine, 402);
  assert.equal(engine.actors[0].presentation.frame, engine.actors[1].presentation.frame);
  assert.equal(engine.fatality.sample.frame, 402); assert.equal(engine.actors[1].health, 1);
  ticks(engine, 101);
  assert.equal(engine.lastFatality.actualDuration, 503);
  assert.ok(engine.lastFatality.baseChoreographyDuration < 503);
});

test('a direct request cannot finish a healthy or intermediate-round target and an unauthored ending remains an ordinary KO', () => {
  const engine = engineFor({ roundsToWin: 2 }); enterFight(engine);
  const [attacker, target] = engine.actors, definition = definitionFor(attacker);
  assert.equal(engine.startFatality(attacker, target, definition), false);
  target.health = 0; assert.equal(engine.startFatality(attacker, target, definition), false);
  engine.resolveKnockouts(); assert.equal(engine.phase, 'roundEnd'); assert.equal(target.presentation.key, 'loseRound');
  assert.equal(target.presentation.reversible, true); assert.equal(attacker.stats.fatalities, 0);
  const other = engineFor({ p1: fighter('sh1_monster_cybil_017') }); enterFight(other); prepareKnockout(other);
  assert.equal(other.phase, 'roundEnd'); assert.equal(other.fatality, null); assert.equal(other.actors[0].stats.fatalities, 0);
});

test('taunt grants no combat resource, keeps its own clock and yields immediately to movement, guard, attack or impact', () => {
  for (const cancel of ['left', 'guard', 'light', 'impact']) {
    const engine = engineFor({ fatalities: false }); enterFight(engine);
    const [actor, enemy] = engine.actors;
    const resources = [actor.health, enemy.health, actor.meter, actor.guard, actor.invuln, actor.stats.damageDealt];
    assert.equal(engine.beginTaunt(actor), true);
    ticks(engine, 9); assert.equal(actor.presentation.frame, 9); assert.equal(actor.state, 'taunt');
    assert.deepEqual([actor.health, enemy.health, actor.meter, actor.guard, actor.invuln, actor.stats.damageDealt], resources);
    assert.equal(actor.attack, null); assert.equal(engine.projectiles.length, 0);
    engine.togglePause(true); ticks(engine, 10); assert.equal(actor.presentation.frame, 9);
    engine.togglePause(false); engine.hitstop = 3; ticks(engine, 3); assert.equal(actor.presentation.frame, 9);
    if (cancel === 'impact') engine.applyHit(enemy, actor, enemy.profile.moves.neutralLight, 100);
    else { engine.getControls = index => index ? {} : { [cancel]: true }; engine.update(); }
    assert.equal(actor.presentation, null, cancel);
  }
  const engine = engineFor(); enterFight(engine);
  engine.getControls = index => index ? {} : { taunt: true, right: true };
  const actor = engine.actors[0], x = actor.x;
  engine.update(); assert.equal(actor.presentation, null); assert.ok(actor.x > x);
  engine.getControls = () => ({}); assert.equal(engine.beginTaunt(actor), true);
  engine.destroy(); assert.equal(actor.presentation, null); assert.equal(engine.beginTaunt(actor), false);
});

test('Cybil spends exactly ten accepted shots, changes all exhausted attacks, preserves ammunition between rounds and reloads on full retry', () => {
  const engine = engineFor({ p1: fighter('sh1_monster_cybil_017'), roundsToWin: 2, fatalities: false }); enterFight(engine);
  const [actor, target] = engine.actors;
  actor.x = 110; target.x = 1150;
  assert.equal(actor.ammo, 10);
  engine.togglePause(true); assert.equal(engine.beginAttack(actor, 'neutralSpecial'), false); assert.equal(actor.ammo, 10); engine.togglePause(false);
  for (let shot = 0; shot < 10; shot++) {
    assert.equal(engine.beginAttack(actor, 'neutralSpecial'), true);
    assert.equal(actor.attack.move.projectile, true); assert.equal(actor.ammo, 9 - shot);
    let guard = 240;
    while ((actor.attack || engine.hitstop) && guard-- > 0) engine.update();
    assert.ok(guard > 0, `shot ${shot + 1} settled`);
  }
  assert.equal(engine.beginAttack(actor, 'neutralSpecial'), true);
  assert.equal(actor.attack.move.projectile, false); assert.equal(actor.attack.move, actor.profile.moves.neutralSpecial.exhaustedMove); assert.equal(actor.ammo, 0);
  let guard = 240; while ((actor.attack || engine.hitstop) && guard-- > 0) engine.update();
  const contact = Object.entries(actor.profile.moves).find(([, move]) => move.enabled && !move.ammoCost && move.exhaustedMove);
  assert.ok(contact); assert.equal(engine.beginAttack(actor, contact[0]), true); assert.equal(actor.attack.move, contact[1].exhaustedMove);
  target.health = 0; target.lastHit = { attackerIndex: 0, isSuper: false }; engine.resolveKnockouts();
  ticks(engine, engine.hitstop + engine.phaseTimer);
  assert.equal(engine.round, 2); assert.equal(actor.ammo, 0);
  engine.resetMatch(); assert.equal(actor.ammo, 10); assert.equal(engine.round, 1); assert.equal(actor.presentation.key, 'intro');
});

test('Cybil keeps the pistol at exactly half health and discards it strictly below without spending the remaining ammunition', () => {
  const engine = engineFor({ p1: fighter('sh1_monster_cybil_017'), fatalities: false }); enterFight(engine);
  const [actor, target] = engine.actors;
  actor.health = actor.maxHealth / 2;
  assert.equal(engine.beginAttack(actor, 'neutralSpecial'), true);
  assert.equal(actor.attack.move.projectile, true);
  assert.equal(actor.weaponDiscarded, false);
  assert.equal(actor.ammo, 9);

  // A real damage path crosses the strict source boundary; unused rounds are
  // retained as ammunition, rather than fabricated as nine additional shots.
  engine.applyStatusDamage(actor, 1);
  assert.equal(actor.health, actor.maxHealth / 2 - 1);
  assert.equal(actor.weaponDiscarded, true);
  assert.equal(actor.ammo, 9);
  assert.equal(engine.snapshot().p1.weaponDiscarded, true);
  assert.equal(actor.attack.move.projectile, true, 'the already accepted shot is not rewritten');
  ticks(engine, 120); // Allow the existing versus boss-phase recovery to finish.
  assert.equal(actor.phaseLock, 0);
  actor.x = 110; target.x = 1150;
  const targetHealth = target.health;
  assert.equal(engine.beginAttack(actor, 'neutralSpecial'), true);
  const unarmed = actor.attack.move;
  assert.equal(unarmed, actor.profile.moves.neutralSpecial.exhaustedMove);
  assert.equal(unarmed.projectile, false);
  assert.equal(unarmed.level, 'throw');
  assert.ok(unarmed.reach < 100);
  ticks(engine, unarmed.startup + unarmed.active + unarmed.recovery + 4);
  assert.equal(engine.projectiles.length, 0);
  assert.equal(target.health, targetHealth, 'the discarded pistol cannot damage a distant target');
  assert.equal(actor.ammo, 9);
});

test('Cybil cannot recover a discarded pistol by healing or changing rounds; a full retry restores the armed encounter', () => {
  const engine = engineFor({ p1: fighter('sh1_monster_cybil_017'), roundsToWin: 2, fatalities: false }); enterFight(engine);
  const actor = engine.actors[0];
  actor.health = actor.maxHealth / 2 - 1;
  actor.hurtFrames = 5;
  engine.update();
  assert.equal(actor.weaponDiscarded, true, 'the health transition is observed even during recovery');
  assert.equal(actor.ammo, 10);
  actor.health = actor.maxHealth;
  ticks(engine, 60);
  assert.equal(actor.weaponDiscarded, true);
  engine.resetRound(); enterFight(engine);
  assert.equal(actor.health, actor.maxHealth);
  assert.equal(actor.weaponDiscarded, true);
  assert.equal(actor.ammo, 10);
  assert.equal(engine.beginAttack(actor, 'neutralSpecial'), true);
  assert.equal(actor.attack.move.projectile, false);
  assert.equal(actor.ammo, 10);

  engine.resetMatch(); enterFight(engine);
  assert.equal(actor.weaponDiscarded, false);
  assert.equal(actor.ammo, 10);
  assert.equal(engine.beginAttack(actor, 'neutralSpecial'), true);
  assert.equal(actor.attack.move.projectile, true);
  assert.equal(actor.ammo, 9);

  // Retain the engine's explicit reload-each-round override for custom rules.
  actor.profile.moveset.ammoProfile = { ...actor.profile.moveset.ammoProfile, reloadEachRound: true };
  actor.health = actor.maxHealth / 2 - 1;
  engine.resetRound(); enterFight(engine);
  assert.equal(actor.weaponDiscarded, false);
  assert.equal(actor.ammo, 10);
});

test('passive roles cannot leak damage through projectiles, status or counters and attached bodies resist locomotion and pushing', () => {
  const passive = engineFor({ p1: fighter('sh1_larval_stalker_007'), fatalities: false }); enterFight(passive);
  const [actor, target] = passive.actors, copiedMove = { ...target.profile.moves.neutralLight, enabled: true, projectile: true };
  const health = target.health;
  assert.equal(passive.beginAttack(actor, 'neutralLight'), false);
  assert.equal(passive.spawnProjectile(actor, copiedMove, 1), false);
  assert.equal(passive.applyHit(actor, target, copiedMove, 1), false);
  assert.equal(passive.applyStatus(target, { id: 'burn' }, actor), false);
  target.status = { id: 'burn', source: 0, tick: 23, timer: 100, potency: 1 };
  passive.updateStatus(target); assert.equal(target.status, null); assert.equal(target.health, health);
  const fixed = engineFor({ p1: fighter('sh4_wall_man_056'), fatalities: false }); enterFight(fixed);
  const wall = fixed.actors[0], foe = fixed.actors[1], x = wall.x;
  fixed.getControls = index => index ? {} : { right: true, jump: true, dodge: true };
  fixed.update(); assert.equal(wall.x, x); assert.equal(wall.y, 594); assert.equal(wall.grounded, true);
  foe.x = wall.x + 1; fixed.resolveBodyCollision(); assert.equal(wall.x, x); assert.ok(foe.x > wall.x + 1);
  fixed.applyHit(foe, wall, foe.profile.moves.neutralHeavy, 25);
  fixed.physics(wall); assert.equal(wall.x, x); assert.equal(wall.y, 594); assert.equal(wall.vx, 0);
  wall.invuln = 0;
  const beforeThrow = [wall.x, foe.x];
  assert.equal(foe.profile.moves.backThrow.enabled, true);
  assert.equal(foe.profile.moves.backThrow.sideSwitch, true);
  fixed.applyHit(foe, wall, foe.profile.moves.backThrow, 26);
  assert.deepEqual([wall.x, foe.x], beforeThrow, 'a legal back throw cannot exchange an attached body’s world anchor');
  assert.equal(wall.grounded, true); assert.equal(wall.vy, 0); assert.equal(wall.vx, 0);
  fixed.physics(wall); assert.equal(wall.x, x);
});

test('reference-only stage reactions need a heavy contact in their actual zone and cannot change a fixed phase', () => {
  const location = stage('hotel_otherworld');
  const interaction = location.interactions.find(i => i.trigger === 'local-heavy-impact');
  assert.ok(interaction);
  const engine = engineFor({ stage: location, stageDirector: true, stageHazards: true, otherworldShift: true }); enterFight(engine);
  const runtime = engine.stageRuntime;
  runtime.eventTimer = -1; engine.updateStageDirector(); assert.equal(runtime.activeEvent, null);
  runtime.heavyImpactPending = true; runtime.lastHeavyImpact = { x: interaction.zone.x < .5 ? 1240 : 40 };
  assert.equal(engine.tryStageInteraction(), false);
  engine.actors[1].x = interaction.zone.x * 1280;
  engine.applyHit(engine.actors[0], engine.actors[1], engine.actors[0].profile.moves.neutralHeavy, 101);
  assert.equal(runtime.lastHeavyImpact.x, engine.actors[1].x);
  assert.equal(engine.tryStageInteraction(), true); assert.equal(runtime.activeEvent.id, interaction.event);
  assert.equal(engine.hazards.length, 0); assert.ok(runtime.interactionTriggered.includes(interaction.id));
  assert.equal(engine.triggerStageEvent('trainRumble'), false);
  assert.equal(engine.spawnHazard('trainRush'), null);
  const amount = engine.world.amount;
  assert.equal(engine.forceOtherworldShift(), false); assert.equal(engine.world.amount, amount);
  const initial = engineFor({ stage: stage('midwich'), ritualId: 'redJudgment' });
  assert.equal(initial.stage.shift.enabled, false);
  assert.equal(initial.world.amount, 0, 'a ritual cannot replace the documented initial phase');
  initial.resetRound(false); assert.equal(initial.world.amount, 0);
  const altered = engineFor({ stage: location, ritualId: 'redJudgment' });
  assert.equal(altered.world.amount, 1, 'an already altered location retains its fixed altered phase');
});

test('cinematic audio belongs to its engine and is explicitly stopped at silence and destruction boundaries', () => {
  const voices = [];
  const parameter = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
  const audio = { ensure: () => true, master: {}, context: {
    currentTime: 20,
    createOscillator() { const voice = { frequency: parameter(), stopped: [], disconnected: false, connect() {}, start() {}, stop(time) { this.stopped.push(time); }, disconnect() { this.disconnected = true; } }; voices.push(voice); return voice; },
    createGain: () => ({ gain: parameter(), connect() {}, disconnect() {} })
  } };
  const player = createLoreAudioPlayer(audio);
  assert.equal(player.play('wing'), true); assert.equal(player.activeVoices, 1);
  assert.equal(player.play('hit'), true); assert.equal(voices[0].disconnected, true); assert.equal(player.activeVoices, 1);
  assert.equal(player.play('silence'), false); assert.equal(player.activeVoices, 0); assert.equal(voices[1].disconnected, true);
  player.play('lowDrone'); player.stop(); player.stop(); assert.equal(player.activeVoices, 0); assert.equal(voices[2].disconnected, true);
  assert.equal(createLoreAudioPlayer({ ensure: () => false }).play('wing'), false);
});
