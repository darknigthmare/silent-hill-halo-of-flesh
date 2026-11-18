import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../src/data.js';
import {combatReferencePolicy} from '../src/combat-reference-policy.js';
import {TOURNAMENT_FORMAT, TOURNAMENT_ROUNDS, TOURNAMENT_SIZE, STORY_FORMAT, tournamentPlan, storyPlan, storyCatalog} from '../src/tournament.js';
import {createRun, validateRun, settleRun, resumeRun, saveRun, loadRun} from '../src/run-progress.js';
import {KEYS} from '../src/save-store.js';

const player = ROSTER.find((fighter) => fighter.id === 'sh1_air_screamer_001');
const nonCombat = ROSTER.find((fighter) => !combatReferencePolicy(fighter).combatEnabled);
const memory = () => { const store = new Map(); return {getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key)}; };
const win = {winnerIndex: 0, stats: {winner: {healthRatio: .8}, loser: {}}, snapshot: {p1: {meter: 40}}};

test('the Rite of Eight seeds a deterministic bracket of eight distinct fighters', () => {
  const plan = tournamentPlan(player.id, 12345);
  assert.equal(plan.format, TOURNAMENT_FORMAT);
  assert.equal(plan.participants.length, TOURNAMENT_SIZE);
  assert.equal(new Set(plan.participants).size, TOURNAMENT_SIZE);
  assert.ok(plan.participants.includes(player.id));
  assert.equal(plan.queue.length, 3);
  assert.deepEqual(plan.rounds, [...TOURNAMENT_ROUNDS]);
  assert.deepEqual(tournamentPlan(player.id, 12345), plan);
});

test('the rival is a documented boss and waits in the final', () => {
  const plan = tournamentPlan(player.id, 7);
  const rival = ROSTER.find((fighter) => fighter.id === plan.rivalId);
  assert.ok(rival);
  assert.equal(plan.queue[2], rival.id);
  assert.ok(combatReferencePolicy(rival).combatEnabled);
  assert.ok(rival.boss || combatReferencePolicy(rival).role === 'stationary-boss');
});

test('every tournament opponent and arena belongs to that opponent work', () => {
  for (const seed of [0, 1, 99, 4294967295]) {
    const plan = tournamentPlan(player.id, seed);
    for (const opponent of plan.opponents) {
      const fighter = ROSTER.find((item) => item.id === opponent.fighterId);
      assert.ok(combatReferencePolicy(fighter).combatEnabled, opponent.fighterId);
      const expected = tournamentPlan(player.id, seed).stages[plan.opponents.indexOf(opponent)];
      assert.equal(opponent.stageId, expected);
    }
    assert.equal(new Set(plan.queue).size, 3);
  }
});

test('tournament runs validate, refuse tampering, and complete after three wins', () => {
  let run = createRun({mode: 'tournament', playerId: player.id, seed: 2026});
  assert.ok(validateRun(run));
  for (const change of [
    (copy) => { copy.tournamentFormat = 'other'; },
    (copy) => { copy.queue = copy.queue.slice().reverse(); },
    (copy) => { copy.stages = copy.stages.map(() => 'midwich'); },
  ]) { const copy = structuredClone(run); change(copy); assert.equal(validateRun(copy), false); }
  while (run.status !== 'complete') {
    run = settleRun(run, win);
    if (run.status === 'won') run = resumeRun(run);
  }
  assert.equal(run.wins, 3);
  assert.ok(validateRun(run));
  assert.equal(saveRun(run, memory())?.status, 'complete');
});

test('every roster profile has a readable story with intro, chapters and ending', () => {
  const catalog = storyCatalog();
  assert.equal(catalog.length, ROSTER.length);
  for (const fighter of ROSTER) {
    const plan = storyPlan(fighter.id);
    assert.equal(plan.format, STORY_FORMAT);
    assert.equal(plan.playerId, fighter.id);
    assert.ok(plan.intro.trim().length > 0, fighter.id);
    assert.ok(plan.ending.text.trim().length > 0, fighter.id);
    assert.match(plan.ending.note, /aucune fidélité 1:1 certifiée/i);
    assert.ok(plan.chapterCount <= 4);
    assert.equal(plan.queue.length, plan.chapterCount);
    assert.equal(new Set(plan.queue).size, plan.queue.length);
    assert.ok(!plan.queue.includes(fighter.id), fighter.id);
    for (const chapter of plan.chapters) {
      const opponent = ROSTER.find((item) => item.id === chapter.fighterId);
      assert.equal(opponent.source, fighter.source, `${fighter.id} → ${chapter.fighterId}`);
      assert.ok(combatReferencePolicy(opponent).combatEnabled, chapter.fighterId);
    }
    if (plan.rivalId) assert.equal(plan.queue.at(-1), plan.rivalId);
  }
});

test('stories never borrow an opponent or a rival from another work', () => {
  for (const fighter of ROSTER) {
    const plan = storyPlan(fighter.id);
    for (const chapter of plan.chapters) {
      assert.equal(ROSTER.find((item) => item.id === chapter.fighterId).source, fighter.source);
    }
  }
});

test('non-combatant profiles keep a readable story but cannot start a run', () => {
  assert.ok(nonCombat, 'a non-combatant profile is expected');
  const plan = storyPlan(nonCombat.id);
  assert.equal(plan.combatEnabled, false);
  assert.ok(plan.intro.length > 0);
  assert.throws(() => createRun({mode: 'story', playerId: nonCombat.id, seed: 1}), /récit|rôle/i);
  assert.throws(() => tournamentPlan(nonCombat.id, 1), /rôle|tournoi/i);
});

test('story runs validate, reject a forged chapter, and restore from storage', () => {
  const run = createRun({mode: 'story', playerId: player.id, seed: 9});
  assert.ok(validateRun(run));
  assert.equal(run.storyFighterId, player.id);
  const forged = structuredClone(run);
  forged.queue = [...forged.queue].reverse();
  assert.equal(validateRun(forged), false);
  const store = memory();
  saveRun(run, store);
  assert.deepEqual(loadRun(store), run);
});

test('a lost encounter keeps the same story plan and can be resumed', () => {
  const run = createRun({mode: 'story', playerId: player.id, seed: 3});
  const lost = settleRun(run, {winnerIndex: 1, stats: {winner: {}, loser: {}}, snapshot: {p1: {meter: 0}}});
  assert.equal(lost.status, 'lost');
  assert.equal(lost.queue.length, run.queue.length);
  assert.equal(resumeRun(lost).status, 'ready');
});
