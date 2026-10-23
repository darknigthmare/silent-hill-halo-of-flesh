/**
 * Memory of Alessa's documented weapon order, scoped to SH3 (2003).
 * Sources: silenthillmemories.net/sh3/bosses_en.htm and
 * silenthillmemories.net/sh3/walkthrough_13_lakeside_amusement_park_en.htm.
 * The guides describe four deaths/reappearances, not measured frame data.
 * Quarter-health budgets and the existing 52-tick versus phase recovery are
 * explicit gameplay adaptations; they are not the source game's HP or timings.
 */
export const ALESSA_FIGHTER_ID = 'sh3_memory_of_alessa_049';
export const ALESSA_WEAPON_PHASES = Object.freeze([
  Object.freeze({id:'knife',name:'COUTEAU',weapon:'Couteau',threshold:1}),
  Object.freeze({id:'handgun',name:'PISTOLET',weapon:'Pistolet',threshold:.75}),
  Object.freeze({id:'pipe',name:'TUYAU',weapon:'Tuyau',threshold:.5}),
  Object.freeze({id:'smg',name:'MITRAILLETTE',weapon:'Mitraillette',threshold:.25})
]);

function phasesFor(actor) {
  return actor?.data?.id===ALESSA_FIGHTER_ID&&actor.data.source==='sh3'
    ? actor.profile?.moveset?.weaponPhases : null;
}

export function weaponPhase(actor) {
  return phasesFor(actor)?.[actor.weaponPhaseIndex??0]||null;
}

export function nextWeaponPhase(actor) {
  return phasesFor(actor)?.[(actor.weaponPhaseIndex??0)+1]||null;
}

export function weaponPhaseBoundary(actor) {
  const next=nextWeaponPhase(actor);
  return next&&Number.isFinite(actor.maxHealth)?Math.ceil(actor.maxHealth*next.threshold):0;
}

/** Retain one phase's damage budget: an overkill cannot skip an equipped weapon.
 * Accounting returns the actual HP removed and never heals an externally
 * prepared low-health/KO scene. The last phase has no floor and can die normally.
 */
export function preserveWeaponPhaseBoundary(actor,beforeHealth) {
  const boundary=weaponPhaseBoundary(actor);
  if(boundary>0&&Number.isFinite(beforeHealth)&&beforeHealth>0&&actor.health<boundary){
    actor.health=Math.min(beforeHealth,boundary);
  }
  return beforeHealth-actor.health;
}

export function weaponPhaseReady(actor) {
  return Boolean(nextWeaponPhase(actor)&&!actor.weaponTransition&&actor.health>0&&
    actor.health<=weaponPhaseBoundary(actor));
}
