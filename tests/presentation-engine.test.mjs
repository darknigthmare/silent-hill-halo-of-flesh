import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { FightEngine } from '../src/fight.js';
import { ROSTER, STAGES } from '../src/data.js';
import { SPRITES } from '../src/sprite-manifest.js';
import { OUTRO_TICKS } from '../src/presentation-sequences.js';

const engines = new Set();
const restoredArt = new Map();
afterEach(() => {
  for (const engine of engines) engine.destroy();
  engines.clear();
  for (const [id, original] of restoredArt) {
    if (original === undefined) delete SPRITES[id];
    else SPRITES[id] = original;
  }
  restoredArt.clear();
});

function makeEngine(options = {}) {
  globalThis.window = {};
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  globalThis.document = { hidden: false, addEventListener() {}, removeEventListener() {} };
  Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => [], vibrate: () => false }, configurable: true });
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  const gradient = () => ({ addColorStop() {} });
  const context = new Proxy({ createLinearGradient: gradient, createRadialGradient: gradient, measureText: text => ({ width: String(text).length * 7 }) }, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
  const engine = new FightEngine({ getContext: () => context }, {
    p1: ROSTER[0], p2: ROSTER[1], stage: STAGES[0], mode: 'local', roundsToWin: 2,
    timeLimit: 60, seed: 411, stageHazards: false, stageDirector: false, otherworldShift: false,
    fatalities: true, stageFatalities: false, ...options
  });
  engines.add(engine);
  return engine;
}
function ticks(engine, count) { for (let index = 0; index < count; index++) engine.update(); }
function enterFight(engine) {
  const duration = engine.phaseTimer;
  ticks(engine, duration);
  assert.equal(engine.phase, 'fight');
}
function knockout(engine, winner = 0, isSuper = false) {
  const target = engine.actors[1 - winner];
  target.health = 0;
  target.lastHit = { attackerIndex: winner, isSuper, environmental: false };
  engine.resolveKnockouts();
}
const presentationKeys = engine => engine.actors.map(actor => actor.presentation?.key || null);
function importedClips(fighter, definitions) {
  if (!restoredArt.has(fighter.id)) restoredArt.set(fighter.id, SPRITES[fighter.id]);
  const frame = index => ({ path: `test-only-frame-${index}.png`, width: 100, height: 100, anchor: [.5, 1], bodyHeight: 1, facing: 1 });
  SPRITES[fighter.id] = {
    fighterId: fighter.id, source: fighter.source, frames: [frame(0), frame(1)],
    clips: Object.fromEntries(Object.entries(definitions).map(([key, durations]) => [key, {
      frames: durations.map((_, index) => index % 2), frameTicks: durations, ticksPerFrame: 1, loop: false
    }]))
  };
}
function ordinaryResult() {
  const engine = makeEngine({ roundsToWin: 1, fatalities: false });
  enterFight(engine); knockout(engine); ticks(engine, engine.phaseTimer);
  assert.equal(engine.phase, 'matchEnd');
  return engine;
}
const standardPad = index => ({ index, id: `presentation-pad-${index}`, mapping: 'standard', connected: true,
  axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) });

test('the first intro starts at tick zero, freezes on pause and hitstop, and leaves the combat timer untouched', () => {
  const engine = makeEngine();
  assert.deepEqual(presentationKeys(engine), ['intro', 'intro']);
  const [p1, p2] = engine.actors.map(actor => actor.presentation);
  assert.equal(p1.frame, 0); assert.equal(p2.frame, 0);
  assert.equal(p1.sequenceId, p2.sequenceId); assert.notEqual(p1.id, p2.id);
  assert.equal(p1.duration, 150);
  assert.deepEqual(engine.snapshot().p1.presentationSequence, p1);
  assert.deepEqual(engine.snapshot().p1.presentation, engine.actors[0].profile.moveset.presentation);
  ticks(engine, 20);
  assert.equal(p1.frame, 20); assert.equal(engine.matchTime, 60);
  engine.togglePause(true);
  const paused = engine.snapshot(); ticks(engine, 25);
  assert.deepEqual(engine.snapshot(), paused);
  engine.togglePause(false); engine.update();
  assert.equal(p1.frame, 21);
  engine.hitstop = 3; ticks(engine, 3);
  assert.equal(p1.frame, 21); assert.equal(engine.phaseTimer, 129);
  engine.update(); assert.equal(p1.frame, 22);
  ticks(engine, engine.phaseTimer);
  assert.equal(engine.phase, 'fight'); assert.deepEqual(presentationKeys(engine), [null, null]);
  assert.equal(engine.matchTime, 60);
  engine.update(); assert.equal(engine.matchTime, 60 - 1 / 60);
});

test('render frequency cannot change presentation tracks or consume combat RNG', () => {
  const rendered = makeEngine(), headless = makeEngine();
  for (let tick = 0; tick < 70; tick++) {
    rendered.update(); headless.update();
    rendered.render(tick * 20); rendered.render(tick * 20 + 99999);
  }
  assert.deepEqual(rendered.actors.map(actor => actor.presentation), headless.actors.map(actor => actor.presentation));
  assert.equal(rendered.frame, headless.frame); assert.equal(rendered.matchTime, headless.matchTime);
  assert.equal(rendered.rng(), headless.rng());
});

test('an intermediate knockout uses reversible round clips and the following countdown does not replay the intro', () => {
  const rounds = [];
  const engine = makeEngine({ callbacks: { onRoundEnd: result => rounds.push(result) } });
  enterFight(engine); knockout(engine, 0, true);
  assert.equal(engine.phase, 'roundEnd'); assert.equal(engine.fatality, null);
  assert.deepEqual(presentationKeys(engine), ['winRound', 'loseRound']);
  assert.ok(engine.actors.every(actor => actor.presentation.reversible && actor.presentation.frame === 0));
  assert.deepEqual(engine.actors.map(actor => actor.roundWins), [1, 0]);
  assert.equal(rounds.length, 1); assert.equal(rounds[0].snapshot.p2.presentationSequence.key, 'loseRound');
  ticks(engine, 145);
  assert.equal(engine.round, 2); assert.equal(engine.phase, 'intro');
  assert.deepEqual(presentationKeys(engine), [null, null]);
  assert.equal(engine.actors[1].health, engine.actors[1].maxHealth); assert.equal(engine.actors[1].ko, false);
  ticks(engine, 15);
  assert.ok(!engine.texts.some(text => text.kind === 'intro'));
  ticks(engine, engine.phaseTimer);
  assert.equal(engine.phase, 'fight'); assert.equal(engine.matchTime, 60);
  assert.equal(engine.actors[0].stats.fatalities, 0);
});

test('double knockouts and tied timeouts keep both result tracks reversible without declaring a match winner', () => {
  for (const reason of ['double-ko', 'timeout']) {
    const rounds = [], matches = [];
    const engine = makeEngine({ roundsToWin: 1, callbacks: { onRoundEnd: result => rounds.push(result), onMatchEnd: result => matches.push(result) } });
    enterFight(engine);
    if (reason === 'double-ko') {
      engine.actors.forEach(actor => { actor.health = 0; }); engine.resolveKnockouts();
    } else { engine.matchTime = 1 / 60; engine.update(); }
    assert.deepEqual(presentationKeys(engine), ['loseRound', 'loseRound']);
    assert.ok(engine.actors.every(actor => actor.presentation.reversible && actor.presentation.role === 'draw'));
    assert.equal(engine.fatality, null); assert.deepEqual(engine.actors.map(actor => actor.roundWins), [0, 0]);
    assert.equal(rounds[0].winner, null);
    ticks(engine, engine.phaseTimer);
    assert.equal(engine.round, 2); assert.equal(engine.phase, 'intro'); assert.equal(matches.length, 0);
    assert.ok(engine.actors.every(actor => !actor.ko && actor.health === actor.maxHealth));
  }
});

test('a final ordinary knockout settles once, then only the winner exits while the losing pose holds', () => {
  const rounds = [], matches = [];
  const engine = makeEngine({ roundsToWin: 1, fatalities: false, callbacks: { onRoundEnd: result => rounds.push(result), onMatchEnd: result => matches.push(result) } });
  enterFight(engine);
  const [attacker, target] = engine.actors;
  target.health = 1; engine.applyHit(attacker, target, attacker.profile.moves.neutralLight, 1); engine.resolveKnockouts();
  const damage = attacker.stats.damageDealt, frozenTime = engine.matchTime;
  assert.ok(damage > 0); assert.deepEqual(presentationKeys(engine), ['winMatch', 'loseMatch']);
  assert.ok(engine.actors.every(actor => !actor.presentation.reversible));
  ticks(engine, engine.hitstop + engine.phaseTimer - 1);
  assert.equal(matches.length, 0);
  engine.update();
  assert.equal(matches.length, 1); assert.equal(rounds.length, 1); assert.equal(engine.phase, 'matchEnd');
  assert.equal(matches[0].snapshot.p1.presentationSequence.key, 'winMatch');
  assert.equal(matches[0].snapshot.p1.presentationSequence.complete, true);
  assert.deepEqual(presentationKeys(engine), ['outro', 'loseMatch']);
  assert.equal(attacker.presentation.frame, 0); assert.equal(target.presentation.complete, true);
  assert.equal(attacker.presentation.clipDuration, 0);
  let overlays = 0; engine.ctx.fillRect = () => overlays++;
  engine.renderMatchEnd(engine.ctx); assert.equal(overlays, 1, 'without an imported exit clip the result display keeps its existing timing');
  const heldDefeat = { ...target.presentation };
  engine.togglePause(true); ticks(engine, 30); assert.equal(attacker.presentation.frame, 0);
  engine.togglePause(false); ticks(engine, OUTRO_TICKS + 30);
  assert.equal(attacker.presentation.frame, OUTRO_TICKS - 1); assert.equal(attacker.presentation.complete, true);
  assert.deepEqual(target.presentation, heldDefeat);
  assert.equal(target.health, 0); assert.equal(target.ko, true); assert.equal(attacker.stats.damageDealt, damage);
  assert.equal(engine.matchTime, frozenTime); assert.equal(engine.input.enabled, false);
  engine.finishRoundTransition(); assert.equal(matches.length, 1);
});

test('a final timeout uses win and loss match clips without converting the living loser into a fatality', () => {
  const engine = makeEngine({ roundsToWin: 1 }); enterFight(engine);
  engine.actors[0].health = engine.actors[0].maxHealth / 2;
  const health = engine.actors.map(actor => actor.health);
  engine.matchTime = 1 / 60; engine.update();
  assert.deepEqual(presentationKeys(engine), ['loseMatch', 'winMatch']);
  assert.equal(engine.fatality, null);
  ticks(engine, engine.phaseTimer);
  assert.deepEqual(presentationKeys(engine), ['loseMatch', 'outro']);
  assert.deepEqual(engine.actors.map(actor => actor.health), health);
  assert.ok(engine.actors.every(actor => !actor.ko));
});

test('both signature and stage finishers synchronize attacker and target to the existing cinematic timer', () => {
  for (const stageBased of [false, true]) {
    const matches = [];
    const engine = makeEngine({ stageFatalities: stageBased, callbacks: { onMatchEnd: result => matches.push(result) } });
    enterFight(engine); engine.round = 2; engine.actors[1].roundWins = 1;
    knockout(engine, 1, stageBased);
    const { total, definition } = engine.fatality;
    assert.equal(total, Math.max(168, definition.sequence.length * 46));
    assert.deepEqual(presentationKeys(engine), ['finished', 'finisher']);
    assert.equal(engine.actors[0].presentation.sequenceId, engine.actors[1].presentation.sequenceId);
    for (const actor of engine.actors) {
      assert.equal(actor.presentation.frame, 0); assert.equal(actor.presentation.duration, total);
      assert.equal(actor.presentation.finisherId, definition.id); assert.equal(actor.presentation.stageId, engine.stage.id);
      assert.equal(actor.presentation.stageBased, stageBased);
    }
    ticks(engine, 23);
    assert.ok(engine.actors.every(actor => actor.presentation.frame === total - engine.fatality.timer));
    engine.togglePause(true); const frozen = engine.fatality.timer; ticks(engine, 10);
    assert.equal(engine.fatality.timer, frozen); engine.togglePause(false);
    engine.hitstop = 2; ticks(engine, 2);
    assert.equal(engine.fatality.timer, frozen);
    ticks(engine, engine.fatality.timer);
    assert.equal(engine.phase, 'roundEnd'); assert.deepEqual(presentationKeys(engine), ['finished', 'winMatch']);
    const target = engine.actors[0], attacker = engine.actors[1], held = { ...target.presentation };
    assert.equal(held.frame, total - 1); assert.equal(held.complete, true);
    assert.equal(target.health, 0); assert.equal(attacker.stats.fatalities, 1); assert.equal(attacker.roundWins, 2);
    ticks(engine, engine.phaseTimer);
    assert.deepEqual(presentationKeys(engine), ['finished', 'outro']); assert.deepEqual(target.presentation, held);
    assert.equal(matches.length, 1); assert.equal(matches[0].stats.lastFatality.id, definition.id);
  }
});

test('retry and departure cancel a pending finisher without stale tracks or result callbacks', () => {
  let results = 0;
  const engine = makeEngine({ callbacks: { onMatchEnd: () => results++ } }); enterFight(engine);
  engine.actors[0].roundWins = 1; knockout(engine);
  const abandoned = engine.actors[0].presentation.id;
  ticks(engine, 12); engine.togglePause(true); engine.resetMatch();
  assert.equal(engine.fatality, null); assert.equal(engine.lastFatality, null); assert.equal(engine.round, 1);
  assert.deepEqual(presentationKeys(engine), ['intro', 'intro']);
  assert.notEqual(engine.actors[0].presentation.id, abandoned);
  assert.ok(engine.actors.every(actor => actor.presentation.frame === 0 && actor.roundWins === 0 && actor.stats.fatalities === 0));
  ticks(engine, 200); assert.equal(engine.actors[0].presentation.frame, 0);
  engine.togglePause(false); enterFight(engine);
  engine.actors[0].roundWins = 1; knockout(engine); ticks(engine, 9);
  const scores = engine.actors.map(actor => actor.roundWins), health = engine.actors.map(actor => actor.health);
  const pending = engine.fatality;
  engine.destroy(); ticks(engine, pending.total + 200); engine.completeFatality(); engine.updateFatality();
  engine.startFatality(engine.actors[0], engine.actors[1], pending.definition);
  assert.deepEqual(presentationKeys(engine), [null, null]);
  assert.deepEqual(engine.actors.map(actor => actor.roundWins), scores);
  assert.deepEqual(engine.actors.map(actor => actor.health), health); assert.equal(results, 0);
});

test('a reentrant result callback can retry or leave without an outro replacing the new lifecycle', () => {
  for (const action of ['resetMatch', 'destroy']) {
    let engine, results = 0;
    engine = makeEngine({ roundsToWin: 1, fatalities: false, callbacks: { onMatchEnd: () => { results++; engine[action](); } } });
    enterFight(engine); knockout(engine); ticks(engine, engine.phaseTimer);
    assert.equal(results, 1);
    assert.deepEqual(presentationKeys(engine), action === 'resetMatch' ? ['intro', 'intro'] : [null, null]);
    if (action === 'resetMatch') {
      assert.equal(engine.phase, 'intro'); assert.equal(engine.round, 1);
      assert.ok(engine.actors.every(actor => actor.presentation.frame === 0 && actor.roundWins === 0));
    }
  }
});

test('imported presentation clips extend both actor tracks without altering combat timings or the match clock', () => {
  importedClips(ROSTER[0], { intro: [180, 170], winRound: [190, 170], winMatch: [170, 170], outro: [110, 90], finisher: [180, 180] });
  importedClips(ROSTER[1], { intro: [190, 190], loseRound: [150, 150], loseMatch: [190, 190], finished: [190, 210] });
  const matches = [];
  const engine = makeEngine({ callbacks: { onMatchEnd: result => matches.push(result) } });
  const gameplay = { ...engine.actors[0].profile.moves.neutralLight };
  assert.equal(engine.phaseTimer, 380); assert.ok(engine.actors.every(actor => actor.presentation.duration === 380));
  enterFight(engine); assert.equal(engine.matchTime, 60);
  knockout(engine); assert.equal(engine.phaseTimer, 360);
  ticks(engine, 359); assert.equal(engine.actors[0].presentation.frame, 359); assert.equal(engine.phase, 'roundEnd');
  engine.update(); assert.equal(engine.phase, 'intro'); assert.equal(engine.phaseTimer, 145);
  enterFight(engine); knockout(engine);
  assert.equal(engine.fatality.total, 400); assert.ok(engine.actors.every(actor => actor.presentation.duration === 400));
  ticks(engine, 399); assert.equal(engine.phase, 'fatality'); assert.equal(engine.actors[1].presentation.frame, 399);
  engine.update(); assert.equal(engine.phase, 'roundEnd'); assert.equal(engine.phaseTimer, 340);
  ticks(engine, 340); assert.equal(matches.length, 1); assert.equal(engine.phase, 'matchEnd');
  assert.equal(engine.actors[0].presentation.duration, 200);
  assert.equal(engine.actors[0].presentation.clipDuration, 200);
  const overlays = []; engine.ctx.fillRect = () => overlays.push(engine.ctx.fillStyle);
  engine.renderMatchEnd(engine.ctx); assert.deepEqual(overlays, []);
  ticks(engine, 199); assert.equal(engine.actors[0].presentation.complete, false);
  engine.renderMatchEnd(engine.ctx); assert.deepEqual(overlays, []);
  engine.update(); assert.equal(engine.actors[0].presentation.complete, true);
  engine.renderMatchEnd(engine.ctx); assert.deepEqual(overlays, ['rgba(2,3,2,0)']);
  assert.equal(engine.matchTime, 60); assert.deepEqual(engine.actors[0].profile.moves.neutralLight, gameplay);
  assert.equal(engine.actors[0].stats.fatalities, 1); assert.equal(engine.actors[0].roundWins, 2);
  const ordinary = makeEngine({ roundsToWin: 1, fatalities: false });
  enterFight(ordinary); knockout(ordinary);
  assert.equal(ordinary.phaseTimer, 380, 'an ordinary final result also waits for the longer losing clip');
});

test('an imported outro pauses on focus loss or hidden tab and resumes only after a visible user action', () => {
  for (const boundary of ['blur', 'hidden']) {
    importedClips(ROSTER[0], { outro: [270, 270] });
    const engine = ordinaryResult(); ticks(engine, 20);
    if (boundary === 'hidden') { document.hidden = true; engine.onVisibilityChange(); }
    else engine.onFocusLoss();
    assert.equal(engine.paused, true, `${boundary}: a real unfinished exit must pause`);
    assert.equal(engine.isPresentingOutro(), true, 'the UI must still recognize a paused exit');
    const clock = { ...engine.actors[0].presentation }, frame = engine.frame, resultTimer = engine.resultTimer;
    ticks(engine, 700);
    assert.deepEqual(engine.actors[0].presentation, clock);
    assert.equal(engine.frame, frame); assert.equal(engine.resultTimer, resultTimer);
    if (boundary === 'hidden') {
      assert.equal(engine.togglePause(false), false);
      document.hidden = false; engine.onVisibilityChange();
      assert.equal(engine.paused, true, 'visibility alone does not resume a cinematic');
    }
    assert.equal(engine.togglePause(false), true); engine.update();
    assert.equal(engine.actors[0].presentation.frame, clock.frame + 1);
    assert.equal(engine.input.enabled, false, 'resuming the exit never reenables combat controls');
  }
});

test('an imported outro handles Start edges and controller loss with the same pause arbitration as combat', () => {
  importedClips(ROSTER[0], { outro: [270, 270] });
  const engine = ordinaryResult(), p1 = standardPad(0), p2 = standardPad(1);
  let pads = [p1, p2]; navigator.getGamepads = () => pads; engine.updateGamepads();
  p1.buttons[9].pressed = p2.buttons[9].pressed = true; engine.updateGamepads();
  assert.equal(engine.paused, true, 'simultaneous Start edges pause once');
  const before = engine.actors[0].presentation.frame;
  engine.updateGamepads(); ticks(engine, 20); assert.equal(engine.paused, true);
  assert.equal(engine.actors[0].presentation.frame, before);
  p1.buttons[9].pressed = p2.buttons[9].pressed = false; engine.updateGamepads();
  p1.buttons[9].pressed = true; engine.updateGamepads();
  assert.equal(engine.paused, false); assert.equal(engine.input.enabled, false);
  engine.update(); assert.equal(engine.actors[0].presentation.frame, before + 1);
  p1.buttons[9].pressed = false; engine.updateGamepads();
  pads = [null, p2]; p2.buttons[9].pressed = true; engine.updateGamepads();
  assert.equal(engine.paused, true, 'controller loss wins over the other Start edge');
  assert.equal(engine.isPresentingOutro(), true);
  const disconnected = engine.actors[0].presentation.frame; ticks(engine, 40);
  assert.equal(engine.actors[0].presentation.frame, disconnected);
  p2.buttons[9].pressed = false; engine.updateGamepads();
  pads = [p1, p2]; engine.updateGamepads();
  assert.equal(engine.paused, true, 'reconnection alone does not resume');
  p1.buttons[9].pressed = true; engine.updateGamepads();
  assert.equal(engine.paused, false); engine.update();
  assert.equal(engine.actors[0].presentation.frame, disconnected + 1);
});

test('completed and unimported outros retain the existing settled-result focus and gamepad behavior', () => {
  for (const imported of [true, false]) {
    importedClips(ROSTER[0], imported ? { outro: [270, 270] } : { idle: [270, 270] });
    const engine = ordinaryResult();
    if (imported) ticks(engine, engine.actors[0].presentation.duration);
    assert.equal(engine.isPresentingOutro(), false);
    engine.onFocusLoss(); document.hidden = true; engine.onVisibilityChange();
    assert.equal(engine.paused, false);
    document.hidden = false;
    const controller = standardPad(0); let pads = [controller];
    navigator.getGamepads = () => pads; engine.updateGamepads();
    controller.buttons[9].pressed = true; engine.updateGamepads();
    assert.equal(engine.paused, false);
    pads = []; engine.updateGamepads(); assert.equal(engine.paused, false);
    const timer = engine.resultTimer; engine.update(); assert.equal(engine.resultTimer, timer + 1);
    assert.equal(engine.input.enabled, false);
  }
});
