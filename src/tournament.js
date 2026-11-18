// Tournoi et récits de manifestation : logique pure, déterministe et sans état.
// Le tournoi est une adaptation de versus ; un récit ne transfère jamais les
// capacités d'une autre œuvre et ne certifie aucune fidélité 1:1.
import {ROSTER, STAGES, getFighter} from './data.js';
import {buildLoreMoveset} from './movesets.js';
import {combatReferencePolicy} from './combat-reference-policy.js';
import {seededRandom} from './shared.js';

export const TOURNAMENT_FORMAT = 'rite-of-eight-v1';
export const STORY_FORMAT = 'monster-story-v1';
export const TOURNAMENT_SIZE = 8;
export const TOURNAMENT_ROUNDS = Object.freeze(['QUARTS DE FINALE', 'DEMI-FINALE', 'FINALE']);
export const TOURNAMENT_LABEL = 'LE RITE DES HUIT';

const stageById = new Map(STAGES.map((stage) => [stage.id, stage]));

/** Associated arena, restricted to the fighter's own work when possible. */
export function stageIdFor(fighter) {
  const associated = stageById.get(fighter?.stageId);
  if (associated?.source === fighter?.source) return associated.id;
  return (STAGES.find((stage) => stage.source === fighter?.source) || STAGES[0]).id;
}

function planRng(seed) {
  return seededRandom(Number(seed) >>> 0);
}

function shuffle(items, rng) {
  const out = [...items];
  for (let index = out.length - 1; index > 0; index--) {
    const swap = Math.floor(rng() * (index + 1));
    [out[index], out[swap]] = [out[swap], out[index]];
  }
  return out;
}

function stableHash(text) {
  let hash = 2166136261;
  for (const character of String(text)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function combatPool(excludeId = null) {
  return ROSTER.filter((fighter) => fighter.id !== excludeId && combatReferencePolicy(fighter).combatEnabled);
}

/**
 * Single-elimination bracket of eight. The player fights one opponent per
 * round; the rival always waits in the final. Opponents come from different
 * works first so the rite remains a convergence, never one work's clone army.
 */
export function tournamentPlan(playerId, seed = 0) {
  const player = ROSTER.find((fighter) => fighter.id === playerId);
  if (!player) throw new Error('Manifestation inconnue pour le tournoi.');
  if (!combatReferencePolicy(player).combatEnabled) {
    throw new Error('Le rôle documenté de ce sujet ne permet pas le tournoi ; sa fiche reste consultable.');
  }
  const rng = planRng(stableHash(playerId) ^ seed);
  const eligible = combatPool(playerId);
  const rival = eligible.find((fighter) => fighter.source === player.source && fighter.boss)
    || eligible.find((fighter) => fighter.boss)
    || eligible.find((fighter) => fighter.source === player.source)
    || eligible[0];
  if (!rival) throw new Error('Aucun adversaire compatible pour ce tournoi.');

  const remaining = shuffle(eligible.filter((fighter) => fighter.id !== rival.id), rng);
  const picked = [];
  const usedSources = new Set([player.source]);
  // One representative per work first.
  for (const fighter of remaining) {
    if (picked.length >= TOURNAMENT_SIZE - 2) break;
    if (usedSources.has(fighter.source)) continue;
    picked.push(fighter); usedSources.add(fighter.source);
  }
  for (const fighter of remaining) {
    if (picked.length >= TOURNAMENT_SIZE - 2) break;
    if (!picked.includes(fighter)) picked.push(fighter);
  }
  if (picked.length < TOURNAMENT_SIZE - 2) throw new Error('Le roster ne contient pas assez de sujets combattants pour un tournoi de huit.');

  const [seedOpponent, sideA, sideB, sideC, sideD, sideE] = picked;
  const participants = [player.id, seedOpponent.id, sideA.id, sideB.id, sideC.id, sideD.id, sideE.id, rival.id];
  const quarterOpponent = seedOpponent;
  const semifinalOpponent = rng() < 0.5 ? sideA : sideB;
  // sideE and the rival share the lower half; the rival reaches the final.
  const quarters = [
    [participants[0], participants[1]],
    [participants[2], participants[3]],
    [participants[4], participants[5]],
    [participants[6], participants[7]],
  ];
  const queue = [quarterOpponent.id, semifinalOpponent.id, rival.id];
  const stages = queue.map((id) => stageIdFor(getFighter(id)));
  const rounds = queue.map((_, index) => TOURNAMENT_ROUNDS[index]);
  return {
    format: TOURNAMENT_FORMAT,
    label: TOURNAMENT_LABEL,
    playerId,
    seed: Number(seed) >>> 0,
    participants,
    rivalId: rival.id,
    quarters,
    queue,
    stages,
    rounds,
    opponents: queue.map((id, index) => ({
      fighterId: id,
      stageId: stages[index],
      round: rounds[index],
      rival: id === rival.id,
    })),
  };
}

/**
 * Lore-ordered story for one manifestation: its own documented intro, three
 * trials from its own work, then its rival (a same-work boss when documented).
 * Every string comes from existing project data; nothing is invented here.
 */
export function storyPlan(fighterId) {
  const fighter = ROSTER.find((item) => item.id === fighterId);
  if (!fighter) throw new Error('Manifestation inconnue pour le récit.');
  const policy = combatReferencePolicy(fighter);
  const pool = combatPool(fighter.id).filter((candidate) => candidate.source === fighter.source);
  const rival = pool.find((candidate) => candidate.boss)
    || pool.find((candidate) => combatReferencePolicy(candidate).role === 'stationary-boss')
    || null;
  const trials = shuffle(pool.filter((candidate) => candidate.id !== rival?.id), planRng(stableHash(fighter.id)))
    .slice(0, 3);
  const chapters = [
    ...trials.map((candidate, index) => ({
      fighterId: candidate.id,
      stageId: stageIdFor(candidate),
      label: `ÉPREUVE ${index + 1}`,
      rival: false,
    })),
    ...(rival ? [{fighterId: rival.id, stageId: stageIdFor(rival), label: 'RIVAL', rival: true}] : []),
  ];
  const presentation = buildLoreMoveset(fighter).presentation || {};
  const intro = presentation.intro || fighter.canonicalBehavior || fighter.lore;
  const victory = String(presentation.victory || '').trim();
  const lore = String(fighter.lore || '').trim();
  const endingText = [victory && `${victory.replace(/[.!?]$/, '')}.`, lore].filter(Boolean).join(' ');
  const rivalFighter = rival ? getFighter(rival.id) : null;
  return {
    format: STORY_FORMAT,
    playerId: fighter.id,
    title: `LE CAUCHEMAR — ${String(fighter.name).toUpperCase()}`,
    source: fighter.source,
    combatEnabled: policy.combatEnabled,
    intro,
    chapterCount: chapters.length,
    chapters,
    queue: chapters.map((chapter) => chapter.fighterId),
    stages: chapters.map((chapter) => chapter.stageId),
    rivalId: rivalFighter?.id ?? null,
    rivalName: rivalFighter?.name ?? null,
    ending: {
      title: `CLÔTURE — ${fighter.name}`,
      text: endingText || `Le dossier de ${fighter.name} est clos dans cette adaptation.`,
      note: 'Issue de versus dérivée des textes du catalogue ; aucune fidélité 1:1 certifiée.',
    },
  };
}

export function storyCatalog() {
  return ROSTER.map((fighter) => {
    const plan = storyPlan(fighter.id);
    return {id: fighter.id, name: fighter.name, source: fighter.source, title: plan.title,
      combatEnabled: plan.combatEnabled, chapterCount: plan.chapterCount, rivalName: plan.rivalName};
  });
}
