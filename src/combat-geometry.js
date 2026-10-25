/*
 * Shared geometry for the ORIGINAL procedural drawings, not canonical measurements.
 * Pixel units are versus balancing data. Weapons, halos and hanging supports are
 * excluded from body collision. One source of truth serves combat, AI and QA.
 */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const finite = (n, fallback) => Number.isFinite(Number(n)) ? Number(n) : fallback;
const BODIES = Object.freeze({
  humanoid: { width: 80, height: 215, push: 70 },
  nurse: { width: 80, height: 222, push: 70 },
  child: { width: 80, height: 215, push: 64 },
  giant: { width: 88, height: 215, push: 80 },
  pyramid: { width: 132, height: 215, push: 74 },
  mannequin: { width: 80, height: 235, push: 68 },
  doll: { width: 82, height: 219, push: 68 },
  flowerhead: { width: 126, height: 260, push: 72 },
  quadruped: { width: 180, height: 125, push: 137 },
  insect: { width: 132, height: 80, push: 96 },
  worm: { width: 258, height: 100, push: 208 },
  serpentine: { width: 272, height: 146, push: 202 },
  mass: { width: 185, height: 192, push: 153 },
  spider: { width: 252, height: 155, push: 151 },
  fungus: { width: 125, height: 137, push: 89 },
  wall: { width: 116, height: 224, push: 104 },
  cage: { width: 128, height: 202, push: 105, bottom: 24, floating: true },
  flyer: { width: 160, height: 190, push: 65, bottom: 34, floating: true },
  ghost: { width: 126, height: 215, push: 62, floating: true },
  wheelchair: { width: 144, height: 182, push: 123 },
  fox: { width: 115, height: 222, push: 74 },
  deity: { width: 170, height: 217, push: 109 },
  void: { width: 236, height: 234, push: 174, floating: true },
});

export function bodyProfile(fighter = {}, state = fighter) {
  const visual = fighter.visual || fighter.data?.visual || {};
  const kind = BODIES[visual.kind] ? visual.kind : 'humanoid';
  const data=fighter.data||fighter;
  // SH4 enemies_en.htm: melee bats this exact flying creature down. Removing
  // its hover offset is a versus translation, not a new death or hit pose.
  // Accept both simulation actors and the renderer's actorSpriteState flags.
  const downedHummer=data.id==='sh4_hummer_055'&&data.source==='sh4'&&
    (state?.ko===true||state?.knockdown===true||finite(state?.knockdownTimer,0)>0);
  // The exact SH1 Night Flutter candidate depicts its standing, folded-wing
  // pose. Keep that support on the floor; an airborne actor still uses the
  // flyer envelope. Static inspection has no airborne flag and shows standing.
  // These offsets remain versus calibration, not source geometry measurements.
  const standingNightFlutter=data.id==='sh1_night_flutter_002'&&data.source==='sh1'&&
    state?.airborne!==true&&state?.grounded!==false;
  return { kind, ...BODIES[kind], ...(downedHummer||standingNightFlutter?{bottom:0,floating:false}:{}),
    scale: clamp(finite(visual.scale, 1), .2, 4),
    provenance: 'procedural-render-envelope / versus-collision-adaptation' };
}

export function bodyBox(actor) {
  const p = bodyProfile(actor);
  const scale = p.scale;
  const stance = actor.crouching && !['insect','quadruped','worm','serpentine','fungus','wall','cage','flyer','void'].includes(p.kind) ? .68 : 1;
  const width = p.width * scale;
  const height = p.height * scale * stance;
  const bottom = finite(actor.y, 594) - (p.bottom || 0) * scale;
  return { x: finite(actor.x, 0) - width / 2, y: bottom - height, w: width, h: height };
}

export function bodyPushRadius(actor) {
  const p = bodyProfile(actor);
  return p.push * p.scale / 2;
}

export function hasGroundContact(actor) {
  return Boolean(actor.grounded) && !bodyProfile(actor).floating;
}

export function moveBox(actor, move) {
  const body = bodyBox(actor);
  const foot = body.y + body.h;
  const low = move.level === 'low';
  const grab = move.level === 'throw';
  const height = low ? clamp(body.h * .32, 35, 78) : grab ? body.h * .92 : clamp(body.h * .46, 42, 136);
  const middle = low ? foot - height * .48 : grab ? foot - body.h * .48 : foot - body.h * .64;
  const reach = clamp(finite(move.reach, 80), 32, 940);
  const inset = Math.min(body.w * .28, 38);
  return { x: actor.facing > 0 ? actor.x + inset : actor.x - inset - reach,
    y: middle - height / 2, w: reach, h: height };
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/* Low physical threats are escapable by clearing their actual vertical extent.
 * Psychic / full-height phenomena are never silently made jumpable.
 */
const GROUND_HEIGHTS = Object.freeze({
  roadCollapse: 26, rootSnare: 66, iceFracture: 42, bloodTide: 92,
  frostWave: 96, waterSurge: 122, petalBloom: 122, gurneyRush: 122,
  trainRush: 210, carouselSweep: 154,
});

export function hazardVolumes(hazard, { width = 1280, floor = 594, ceiling = 128, preview = false } = {}) {
  const p = hazard.profile || {};
  const radius = clamp(finite(p.radius, 140), 1, width);
  const center = p.shape === 'center' ? width / 2 : clamp(finite(hazard.x, width / 2), 0, width);
  let intervals;
  switch (p.shape) {
    case 'global': intervals = [[0, width]]; break;
    case 'ring': intervals = [[center - radius, center - radius * .42], [center + radius * .42, center + radius]]; break;
    case 'edge':
      // targetMode=fighter is a LOCAL crack, not a screen-edge strike.
      intervals = p.targetMode === 'edge'
        ? (center < width / 2 ? [[0, radius]] : [[width - radius, width]])
        : [[center - radius, center + radius]];
      break;
    case 'sweep': intervals = [[finite(hazard.zoneMin, center - radius), finite(hazard.zoneMax, center + radius)]]; break;
    case 'lane': intervals = [[center - radius * .72, center + radius * .72]]; break;
    default: intervals = [[center - radius, center + radius]];
  }
  const height = GROUND_HEIGHTS[hazard.id] || floor - ceiling;
  const volumes = intervals.map(([lo, hi]) => {
    const x = clamp(Math.min(lo, hi), 0, width), right = clamp(Math.max(lo, hi), 0, width);
    return { x, y: floor - height, w: right - x, h: height + 3 };
  }).filter(r => r.w > 0);
  if (!preview && ['trainRush','gurneyRush'].includes(hazard.id) && hazard.timer <= 0 && hazard.active > 0) {
    const progress = clamp(((hazard.maxActive || 34) - hazard.active) / Math.max(1,(hazard.maxActive || 34) - 1),0,1);
    return volumes.map(z => {
      const breadth = Math.min(z.w,hazard.id==='trainRush'?240:144);
      const position = hazard.side < 0 ? 1-progress : progress;
      return {...z,x:z.x+(z.w-breadth)*position,w:breadth};
    });
  }
  return volumes;
}

export function hazardTouches(hazard, actor, dimensions) {
  const body = actor.data ? bodyBox(actor) : { x: actor.x - .5, y: finite(actor.y, 594) - 1, w: 1, h: 1 };
  return hazardVolumes(hazard, dimensions).some(zone => overlaps(zone, body));
}

export function hazardCounterplay(hazard) {
  const low = Object.hasOwn(GROUND_HEIGHTS, hazard.id) && GROUND_HEIGHTS[hazard.id] <= 122;
  return [low ? 'SAUT OU DÉPLACEMENT' : 'DÉPLACEMENT', hazard.profile?.unblockable ? null : 'GARDE'].filter(Boolean).join(' OU ');
}

export const COLLISION_KINDS = Object.freeze(Object.keys(BODIES));
