/**
 * Scoped compositions for exact authored bitmap candidates.
 *
 * The PNG already contains the complete tent. Do not repaint the procedural
 * tent silhouette. This helper only modulates narrow folds inside that fabric.
 * It consumes the existing presentation clock; it owns no simulation state.
 */
const BACKGROUND_SHA = 'd6410e6a7d3b43e677865f44da90ec5c00d54b09792ef747a1cb7665e9c27beb';
const NATIVE_WIDTH = 1672, NATIVE_HEIGHT = 941;
const EMPTY = () => ({handled: false, roundHandled: false, trackIds: []});
const clamp01 = value => Math.max(0, Math.min(1, value));

export function drawAlessaBitmapComposition(ctx, w, h, stage, art, presentation, trackAllowed) {
  const layer = art?.layers?.find(item => item.id === 'alessa-isolation-room');
  const frame = layer?.frames?.[0];
  if (stage?.id !== 'film_hospital' || stage.source !== 'film' ||
      stage.reference?.blocked || art?.scene !== 'alessa-isolation-room-2006' ||
      art.mode !== 'replace' || layer?.fit !== 'cover' ||
      layer.frames.length !== 1 || (layer.parallaxX || 0) !== 0 ||
      frame?.sha256 !== BACKGROUND_SHA || frame.width !== NATIVE_WIDTH ||
      frame.height !== NATIVE_HEIGHT ||
      ![0, 0, 1, 1].every((value, index) => layer.rect?.[index] === value) ||
      typeof trackAllowed !== 'function' || !(w > 0 && h > 0)) return EMPTY();

  const ambient = (stage.referenceTracks || []).find(track =>
    track.key === 'gansAlessaTentCloth' && !track.event &&
    track.trigger !== 'match-phase' && trackAllowed(stage, track));
  const round = presentation?.track;
  const roundHandled = round?.key === 'alessaRoomRoundRest' && trackAllowed(stage, round);
  const strength = roundHandled && Number.isFinite(presentation?.strength)
    ? clamp01(presentation.strength) : 0;
  if (!ambient && strength <= 0) return {handled: true, roundHandled: !!roundHandled, trackIds: []};

  const time = Number.isFinite(presentation?.time) ? Math.max(0, presentation.time) : 0;
  const sway = Math.sin(time * .0008) * 2;
  const pulse = .5 + .5 * Math.sin(time * .0012);
  const scale = Math.max(w / NATIVE_WIDTH, h / NATIVE_HEIGHT);
  const x = (w - NATIVE_WIDTH * scale) / 2;
  const y = (h - NATIVE_HEIGHT * scale) / 2;
  const trackIds = [];

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Interior of the right plastic panel, in native PNG coordinates.
  // This polygon excludes the frame, floor, aperture, walls and fighting lane.
  ctx.beginPath();
  ctx.moveTo(1238, 302);
  ctx.lineTo(1304, 397);
  ctx.lineTo(1492, 410);
  ctx.lineTo(1597, 300);
  ctx.lineTo(1605, 544);
  ctx.lineTo(1421, 584);
  ctx.lineTo(1243, 562);
  ctx.closePath();
  ctx.clip();
  ctx.lineCap = 'round';

  const fold = (offset, width, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(1253, 420 + offset);
    ctx.bezierCurveTo(1328, 491 + offset, 1440, 551 + offset, 1585, 435 + offset);
    ctx.stroke();
  };
  if (ambient) {
    // The old procedural cue used the same .0008 sway and .0012 pulse clocks.
    // Two native pixels of drift, with no complete fabric silhouette or mask.
    fold(sway, 8, `rgba(12,5,8,${.025 + pulse * .02})`);
    fold(sway - 2, 1.6, `rgba(190,125,113,${.035 + pulse * .025})`);
    trackIds.push(ambient.id);
  }
  if (strength > 0) {
    // Let one low-contrast fold retain light during the existing round rest.
    // No new phase, duration, event, attack or terrain state is introduced.
    fold(-2, 1.8, `rgba(196,148,128,${strength * .10})`);
    trackIds.push(round.id);
  }
  ctx.restore();
  return {handled: true, roundHandled: !!roundHandled, trackIds};
}

/** Keep the existing hearth pulse inside the painted SH1 fire, without another cage. */
export function drawMidwichHearthBitmapComposition(ctx, w, h, stage, art, presentation, trackAllowed) {
  const layer = art?.layers?.find(item => item.id === 'hearth');
  const frame = layer?.frames?.[0];
  if (stage?.id !== 'midwich_nightmare' || stage.source !== 'sh1' ||
      stage.reference?.blocked || art?.scene !== 'otherworld-boiler-hearth' ||
      art.mode !== 'replace' || layer?.fit !== 'cover' ||
      layer.frames.length !== 1 || (layer.parallaxX || 0) !== 0 ||
      frame?.sha256 !== '862c9df53e36a477d92d8f9881181f303a57e9020cd82b6164a90a553b7b2f71' ||
      frame.width !== NATIVE_WIDTH || frame.height !== NATIVE_HEIGHT ||
      ![0, 0, 1, 1].every((value, index) => layer.rect?.[index] === value) ||
      typeof trackAllowed !== 'function' || !(w > 0 && h > 0)) return EMPTY();
  const track = (stage.referenceTracks || []).find(item =>
    item.key === 'boilerHearthGlow' && !item.event &&
    item.trigger !== 'match-phase' && trackAllowed(stage, item));
  if (!track) return {handled: true, roundHandled: false, trackIds: []};

  const time = Number.isFinite(presentation?.time) ? Math.max(0, presentation.time) : 0;
  const pulse = .5 + .5 * Math.sin(time * .0012);
  const scale = Math.max(w / NATIVE_WIDTH, h / NATIVE_HEIGHT);
  ctx.save();
  ctx.translate((w - NATIVE_WIDTH * scale) / 2, (h - NATIVE_HEIGHT * scale) / 2);
  ctx.scale(scale, scale);
  // Native coordinates exclude the metal rim, fighting floor and foreground.
  // Only existing fire cells below the rim receive a low-contrast light change.
  ctx.beginPath();
  for (const [x, y, width, height] of [[611, 516, 68, 75], [708, 516, 143, 82], [884, 516, 88, 80], [993, 518, 53, 67]]) {
    ctx.rect(x, y, width, height);
  }
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = `rgba(221,99,31,${.018 + pulse * .042})`;
  ctx.fillRect(600, 510, 455, 90);
  ctx.restore();
  return {handled: true, roundHandled: false, trackIds: [track.id]};
}
