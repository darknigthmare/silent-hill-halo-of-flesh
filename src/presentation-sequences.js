import { PRESENTATION_KEYS } from './sprite-poses.js';
import { spriteFor } from './sprite-system.js';
import { clipSummary } from './sprite-clips.js';
import { sampleSpriteClip } from './sprite-animation.js';

/** Presentation durations are engine ticks, never measurements of source footage. */
export const OUTRO_TICKS = 90;

/** Imported clips can lengthen a presentation, without borrowing the idle fallback. */
export function presentationClipDuration(actor, keyOrTrack, registry) {
  const track=typeof keyOrTrack==='string'?{key:keyOrTrack}:keyOrTrack;
  const art = track?.key && spriteFor(actor.data, registry);
  const sampled=art&&sampleSpriteClip(art,{presentation:{...track,frame:0}});
  const clip = sampled&&sampled.pose!=='idle' ? art.clips[sampled.pose] : null;
  if (!clip?.frames?.length || clip.loop !== false || clip.frames.some(frame => !art.frames[frame])) return 0;
  const ticks = clipSummary(art, clip).total;
  return Number.isSafeInteger(ticks) && ticks > 0 ? ticks : 0;
}

export function presentationDuration(actors, tracks, minimum, registry) {
  return actors.reduce((duration, actor, index) => Math.max(duration, presentationClipDuration(actor, tracks[index], registry)), minimum);
}

/** A clip owns only its display clock; it cannot write combat state or consume RNG. */
export function createActorPresentation({ key, sequenceId, actorIndex, duration, round, role, reversible = false, clipDuration = 0, stagingDuration = 0, finisherId = null, stageId = null, stageBased = false, contextId = null, clipKey = null, lore = null }) {
  if (!PRESENTATION_KEYS.includes(key)) throw new Error(`Unknown presentation key: ${key}`);
  if (!Number.isSafeInteger(duration) || duration < 1) throw new Error('Presentation duration must be positive engine ticks');
  return {
    key,
    id: `presentation:${sequenceId}:${actorIndex}:${key}${contextId?':'+contextId:''}`,
    sequenceId,
    frame: 0,
    duration,
    clipDuration,
    stagingDuration,
    progress: 0,
    complete: false,
    role,
    round,
    reversible,
    finisherId,
    stageId,
    stageBased,
    contextId,
    clipKey: clipKey || (contextId ? `${key}@${contextId}` : key),
    lore
  };
}

/** Clamp one-shots to their last tick so an ended defeat can remain on screen. */
export function seekActorPresentation(presentation, elapsed) {
  if (!presentation) return;
  const tick = Number.isFinite(elapsed) ? Math.max(0, Math.floor(elapsed)) : 0;
  presentation.frame = Math.min(tick, presentation.duration - 1);
  presentation.progress = Math.min(tick / presentation.duration, 1);
  presentation.complete = tick >= presentation.duration;
}
