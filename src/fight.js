import {actorSpriteState,advanceSpriteClock} from './sprite-animation.js';
import {combatFraming} from './sprite-framing.js';
import { AFFLICTIONS, STAGE_HAZARDS, createCombatProfile, getRitualModifier } from './data.js';
import { drawHitboxOverlay, drawMonster, drawStage } from './renderers.js';
import { stageEventDefinition, stageHazardDeck, stageTerrainProfile, stageShiftStyle } from './stage-director.js';
import { bodyBox, bodyProfile, bodyPushRadius, hasGroundContact, moveBox, overlaps, hazardVolumes, hazardTouches, hazardCounterplay } from './combat-geometry.js';
import { drawHazardObjects } from './stage-hazard-renderer.js';
import { audio, clamp, loadSettings, seededRandom, vibrate } from './shared.js';
import { takeDamage, interruptAction, timeoutWinner, sweptProjectileContact } from './combat-resolution.js';
import { localHazardAllowed } from './stage-lore-policy.js';
import { loadControls, GamepadSlots } from './player-input.js';

const WIDTH = 1280;
const HEIGHT = 720;
const FLOOR = 594;
const FPS = 60;
const STEP = 1 / FPS;
const TAU = Math.PI * 2;

const P1_KEYS = {
  left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', down: 'ArrowDown', guard: 'Space',
  light: 'KeyJ', heavy: 'KeyK', special: 'KeyI', throw: 'KeyU', super: 'KeyO', dodge: 'KeyL'
};
const P2_KEYS = {
  left: 'KeyQ', right: 'KeyD', jump: 'KeyZ', down: 'KeyS', guard: 'KeyA',
  light: 'KeyF', heavy: 'KeyG', special: 'KeyH', throw: 'KeyR', super: 'KeyT', dodge: 'KeyV'
};
const ATTACK_ACTIONS = ['light', 'heavy', 'special', 'throw', 'super'];
const IMPULSE_ACTIONS = [...ATTACK_ACTIONS, 'dodge', 'jump'];

class InputState {
  constructor(bindings) {
    this.bindings = bindings;
    this.held = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.enabled = true;
    this.onDown = (event) => {
      if (!this.enabled || event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey ||
        event.target?.isContentEditable || event.target?.closest?.('input,textarea,select,button,dialog')) return;
      if (!this.bindings.players.some(p => Object.values(p).includes(event.code))) return;
      // A repeat delivered after a focus/reset boundary is not a new physical press.
      if (event.repeat && !this.held.has(event.code)) return;
      if (!this.held.has(event.code)) this.pressed.add(event.code);
      this.held.add(event.code);
      if (this.bindings.players.some(p => Object.values(p).includes(event.code))) event.preventDefault();
    };
    this.onUp = (event) => {
      if (this.held.delete(event.code)) this.released.add(event.code);
    };
    addEventListener('keydown', this.onDown, { passive: false });
    addEventListener('keyup', this.onUp);
  }

  isDown(code) { return this.held.has(code); }
  wasPressed(code) { return this.pressed.has(code); }
  wasReleased(code) { return this.released.has(code); }
  endFrame() { this.pressed.clear(); this.released.clear(); }
  clear() { this.held.clear(); this.pressed.clear(); this.released.clear(); }
  destroy() {
    this.clear();
    removeEventListener('keydown', this.onDown);
    removeEventListener('keyup', this.onUp);
  }
}

function emptyStats() {
  return {
    damageDealt: 0,
    damageTaken: 0,
    perfectGuards: 0,
    counters: 0,
    throws: 0,
    backThrows: 0,
    dodgeAttacks: 0,
    guardCounters: 0,
    wakeupAttacks: 0,
    armorBreaks: 0,
    groundBounces: 0,
    statusesApplied: 0,
    maxCombo: 0,
    hazardsTaken: 0,
    bossPhasesTriggered: 0,
    ritualDamage: 0,
    fatalities: 0,
    stageFatalities: 0
  };
}

function makeActor(data, index, ritual = {}) {
  const rawProfile = createCombatProfile(data);
  const profile = {
    ...rawProfile,
    speed: rawProfile.speed * (ritual.speedScale || 1),
    guard: Math.round(rawProfile.guard * (ritual.guardScale || 1))
  };
  const scale = bodyProfile(data).scale;
  return {
    index,
    data,
    profile,
    scale,
    x: index === 0 ? 310 : 970,
    y: FLOOR,
    vx: 0,
    vy: 0,
    facing: index === 0 ? 1 : -1,
    health: profile.maxHealth,
    maxHealth: profile.maxHealth,
    guard: profile.guard,
    maxGuard: profile.guard,
    meter: ritual.startMeter || 0,
    grounded: true,
    crouching: false,
    blocking: false,
    state: 'intro',
    stateFrame: 0,
    attack: null,
    attackId: 0,
    hurtFrames: 0,
    invuln: 0,
    stun: 0,
    dodgeCooldown: 0,
    dodgeFrames: 0,
    dodgeFollowupWindow: 0,
    guardBreak: 0,
    guardCounterWindow: 0,
    knockdownTimer: 0,
    wakeupWindow: 0,
    combo: 0,
    comboTimer: 0,
    hitFlash: 0,
    ko: false,
    koProgress: 0,
    roundWins: 0,
    lastHitBy: null,
    lastHit: null,
    aiTimer: 0,
    aiIntent: {},
    aiRead: null,
    parryWindow: 0,
    armorCooldown: 0,
    status: null,
    lastMoveKey: null,
    moveVariety: new Set(),
    traitPulse: 0,
    bossPhases: profile.bossPhases || [],
    bossPhaseIndex: -1,
    phasePower: 1,
    phaseSpeed: 1,
    phaseArmor: 0,
    phaseLock: 0,
    phaseName: null,
    counterStance: 0,
    trapCooldown: 0,
    auraCooldown: 0,
    stats: emptyStats()
  };
}

function actorBox(actor) { return bodyBox(actor); }
function attackBox(actor, move) { return moveBox(actor, move); }
function intersects(a, b) { return overlaps(a, b); }

function healthRatio(actor) { return clamp(actor.health / actor.maxHealth, 0, 1); }
function actorPhasePower(actor) { return actor?.phasePower || 1; }
function statusSpeed(actor) {
  if (!actor.status) return 1;
  if (actor.status.id === 'static') return .82;
  if (actor.status.id === 'bind') return .48;
  if (actor.status.id === 'frost') return .68;
  if (actor.status.id === 'bloom') return Math.abs(actor.x - WIDTH / 2) < 230 ? .58 : .82;
  return 1;
}
function statusMeterScale(actor) { return actor.status?.id === 'static' ? .7 : 1; }
function canDodge(actor) { return actor.status?.id !== 'bind'; }

function isNightmareMove(move) {
  return ['nightmare','desperation'].includes(move?.category);
}
function isHeavyMove(move) {
  return move?.button === 'heavy' || ['nightmare','desperation'].includes(move?.category);
}
function relativeDirection(actor, controls) {
  return {
    toward: actor.facing > 0 ? Boolean(controls.right) : Boolean(controls.left),
    away: actor.facing > 0 ? Boolean(controls.left) : Boolean(controls.right)
  };
}
export function resolveMoveKey(actor, controls, button) {
  const direction = relativeDirection(actor, controls);
  if (button === 'throw') return direction.away ? 'backThrow' : 'throw';
  if (button === 'super') return healthRatio(actor) <= (actor.profile.moves.desperation?.healthRequirement || .3) ? 'desperation' : 'super';
  if (button === 'light') {
    if (!actor.grounded) return 'airLight';
    if (controls.down) return 'crouchLight';
    if (direction.toward) return 'forwardLight';
    return 'neutralLight';
  }
  if (button === 'heavy') {
    if (!actor.grounded) return 'airHeavy';
    if (controls.down) return 'crouchHeavy';
    if (direction.toward) return 'forwardHeavy';
    return 'neutralHeavy';
  }
  if (button === 'special') {
    if (!actor.grounded) return 'airSpecial';
    if (controls.down) return 'downSpecial';
    if (direction.toward) return 'forwardSpecial';
    if (direction.away) return 'backSpecial';
    return 'neutralSpecial';
  }
  return null;
}

export function chronicleGrade(stats = {}) {
  const health = clamp(stats.healthRatio ?? 0, 0, 1);
  const combo = Math.max(0, stats.maxCombo || 0);
  const guards = Math.max(0, stats.perfectGuards || 0);
  const hazards = Math.max(0, stats.hazardsTaken || 0);
  const fatalities = Math.max(0, stats.fatalities || 0) + Math.max(0, stats.stageFatalities || 0);
  const contextualMastery = Math.max(0, stats.guardCounters || 0) + Math.max(0, stats.dodgeAttacks || 0) + Math.max(0, stats.wakeupAttacks || 0) + Math.max(0, stats.backThrows || 0);
  const score = health * 60 + Math.min(18, combo * 2.5) + Math.min(16, guards * 4) + Math.min(8, fatalities * 4) + Math.min(8, contextualMastery * 2) - Math.min(20, hazards * 5);
  if (score >= 86) return 'S';
  if (score >= 72) return 'A';
  if (score >= 56) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}


function createStageRuntime(stage) {
  const director = stage?.director || {};
  return {
    eventTimer: Math.max(90, Number(director.initialDelay) || 240),
    eventCursor: 0,
    activeEvent: null,
    activeTimer: 0,
    darkness: 0,
    fogBoost: 0,
    radioBoost: 0,
    terrainOverride: null,
    terrainTimer: 0,
    pendingTerrain: null,
    suppressedHazards: 0,
    eventsTriggered: 0,
    lastEvent: null,
    eventHistory: [],
    hazardHistory: [],
    interactionTriggered: [],
    heavyImpactPending: false,
    lastHeavyImpact: null,
    lastTrigger: null
  };
}

function hazardContainsActor(hazard, actor, width = WIDTH) {
  return hazardTouches(hazard, actor, { width, floor: FLOOR });
}

export class FightEngine {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.settings = loadSettings();
    this.config = {
      mode: 'cpu',
      roundsToWin: 2,
      timeLimit: 99,
      difficulty: this.settings.difficulty || 'normal',
      training: false,
      showHitboxes: false,
      autoHeal: false,
      freeMeter: false,
      otherworldShift: this.settings.otherworldShift !== false,
      stageHazards: this.settings.stageHazards !== false,
      radioWarning: this.settings.radioWarning !== false,
      adaptiveAI: this.settings.adaptiveAI !== false,
      fatalities: this.settings.fatalities !== false,
      stageFatalities: this.settings.stageFatalities !== false,
      stageAnimations: this.settings.stageAnimations !== false,
      stageTerrain: this.settings.stageTerrain !== false,
      stageDirector: this.settings.stageDirector !== false,
      ritualId: 'none',
      initialHealthRatio: 1,
      initialMeter: null,
      seed: Date.now(),
      ...config
    };
    this.ritual = { id: this.config.ritualId || 'none', ...getRitualModifier(this.config.ritualId || 'none') };
    this.stage = this.config.stage;
    this.actors = [makeActor(this.config.p1, 0, this.ritual), makeActor(this.config.p2, 1, this.ritual)];
    const initialRatio = clamp(Number(this.config.initialHealthRatio ?? 1), .05, 1);
    this.actors[0].health = Math.round(this.actors[0].maxHealth * initialRatio);
    if (this.config.initialMeter != null) this.actors[0].meter = clamp(Number(this.config.initialMeter) || 0, 0, 100);
    this.bindings = loadControls();
    this.input = new InputState(this.bindings);
    this.padSlots = new GamepadSlots();
    this.padSystemPrevious = [false, false];
    this.running = false;
    this.destroyed = false;
    this.animationFrame = null;
    this.paused = false;
    this.accumulator = 0;
    this.lastTime = 0;
    this.frame = 0;
    this.matchTime = this.config.timeLimit === 0 ? Infinity : this.config.timeLimit;
    this.phase = 'intro';
    this.phaseTimer = 150;
    this.round = 1;
    this.projectiles = [];
    this.particles = [];
    this.texts = [];
    this.hazards = [];
    this.shake = 0;
    this.flash = 0;
    this.hitstop = 0;
    this.superOverlay = null;
    this.bossPhaseOverlay = null;
    this.fatality = null;
    this.lastFatality = null;
    this.winner = null;
    this.resultTimer = 0;
    this.rng = seededRandom(this.config.seed);
    this.fxRng = seededRandom(`${this.config.seed}:visual-effects`);
    this.touch = { p1: {}, p2: {} };
    this.callbacks = { onMatchEnd: () => {}, onRoundEnd: () => {}, onState: () => {}, canResume: () => true, ...config.callbacks };
    this.gamepadPrev = [];
    this.currentPads = [];
    this.playerPattern = { light: 0, heavy: 0, low: 0, special: 0, throw: 0, super: 0 };
    this.inputHistory = [];
    const stageShift = stageShiftStyle(this.stage);
    const ritualOtherworld = Boolean(this.ritual.startOtherworld || stageShift.startOtherworld);
    this.world = {
      phase: ritualOtherworld ? 'otherworld' : 'fog',
      amount: ritualOtherworld ? 1 : 0,
      triggered: ritualOtherworld,
      siren: 0,
      hazardTimer: Math.max(110, Math.round((this.stage?.director?.cadence || 300) * .82)),
      radio: 0,
      hazardsTriggered: 0
    };
    this.stageRuntime = createStageRuntime(this.stage);
    this.inputBuffer = [null, null];
    this.guardHeld = [false, false];
    this.inputEpoch = 0;
    this.boundLoop = (time) => this.loop(time);
    this.onFocusLoss = () => {
      if (this.phase !== 'matchEnd') this.togglePause(true);
      else this.clearInputs();
    };
    this.onVisibilityChange = () => { if (globalThis.document?.hidden) this.onFocusLoss(); };
    addEventListener('blur', this.onFocusLoss);
    globalThis.document?.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  start() {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.boundLoop);
    audio.ensure();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.running = false;
    if (this.animationFrame !== null) globalThis.cancelAnimationFrame?.(this.animationFrame);
    this.animationFrame = null;
    this.input.enabled = false;
    this.clearInputs();
    this.input.destroy();
    removeEventListener('blur', this.onFocusLoss);
    globalThis.document?.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  clearInputs() {
    this.inputEpoch++;
    this.guardHeld = [false, false];
    this.input.clear();
    this.touch = { p1: {}, p2: {} };
    this.inputBuffer = [null, null];
    this.gamepadPrev = (this.currentPads || []).map(p => p?.buttons?.map(b => !!b.pressed) || []);
  }

  togglePause(force) {
    if (this.destroyed) return false;
    const next = typeof force === 'boolean' ? force : !this.paused;
    // A gamepad is polled outside the DOM: modal inertness alone cannot stop Start.
    if (!next && (globalThis.document?.hidden || this.callbacks.canResume() === false)) return false;
    this.paused = next;
    this.accumulator = 0;
    this.input.enabled = !this.paused && this.phase !== 'matchEnd';
    this.clearInputs();
    this.callbacks.onState(this.snapshot());
    return true;
  }

  discardControlEdges() {
    // Intro / finish cinematics consume impulses equally on all devices.
    // Held movement and guard survive, but cannot become a fresh attack or parry.
    for (let i = 0; i < 2; i++) {
      const touch = this.touch[i === 0 ? 'p1' : 'p2'];
      const buttons = this.currentPads?.[i]?.buttons || [];
      for (const action of Object.keys(touch)) if (touch[action] === 'pressed') touch[action] = true;
      this.guardHeld[i] = this.input.isDown(this.bindings.players[i].guard) || !!touch.guard ||
        !!buttons[4]?.pressed || !!buttons[5]?.pressed;
      this.gamepadPrev[i] = buttons.map(b => !!b.pressed);
    }
    this.inputBuffer = [null, null];
    this.input.endFrame();
  }

  setTrainingOptions(options = {}) {
    Object.assign(this.config, options);
    if (options.stageHazards === false) {
      this.hazards.length = 0;
      if (this.stageRuntime) {
        this.stageRuntime.pendingTerrain = null;
        this.stageRuntime.terrainOverride = null;
        this.stageRuntime.terrainTimer = 0;
        this.stageRuntime.linkedHazard = null;
      }
    }
    if (this.config.freeMeter) this.actors.forEach((actor) => { actor.meter = 100; });
  }

  setTouch(player, action, value) {
    if (action === 'up') action = 'jump'; // Older tactile layouts.
    if (value !== false && (this.paused || !this.input.enabled || this.phase === 'matchEnd')) return;
    if (![true, false, 'pressed'].includes(value)) return;
    if (this.touch[player] && Object.hasOwn(this.bindings.players[0], action)) this.touch[player][action] = value;
  }

  setBindings(bindings) { this.bindings = bindings; this.input.bindings = bindings; this.clearInputs(); }

  forceOtherworldShift() {
    if (!this.world.triggered) this.triggerOtherworldShift();
    else { this.world.phase = 'otherworld'; this.world.amount = 1; this.world.siren = 0; }
    this.callbacks.onState(this.snapshot());
  }

  resetMatch() {
    if (this.destroyed) return;
    this.round = 1;
    this.actors.forEach((actor) => {
      actor.roundWins = 0;
      actor.stats = emptyStats();
    });
    this.winner = null;
    this.lastFatality = null;
    this.resetRound(true);
  }

  resetRound(full = false) {
    if (this.destroyed) return;
    this.input.enabled = !this.paused;
    this.winner = null;
    this.clearInputs();
    this.projectiles.length = 0;
    this.particles.length = 0;
    this.texts.length = 0;
    this.hazards.length = 0;
    this.matchTime = this.config.timeLimit === 0 ? Infinity : this.config.timeLimit;
    this.phase = 'intro';
    this.phaseTimer = 145;
    this.superOverlay = null;
    this.bossPhaseOverlay = null;
    this.fatality = null;
    this.shake = 0;
    this.flash = 0;
    this.hitstop = 0;
    const stageShift = stageShiftStyle(this.stage);
    const ritualOtherworld = Boolean(this.ritual.startOtherworld || stageShift.startOtherworld);
    this.world = {
      phase: ritualOtherworld ? 'otherworld' : 'fog', amount: ritualOtherworld ? 1 : 0, triggered: ritualOtherworld, siren: 0,
      hazardTimer: Math.round(((this.stage?.director?.cadence || 300) * (.78 + this.rng() * .34)) * (this.ritual.hazardIntervalScale || 1)), radio: 0, hazardsTriggered: 0
    };
    this.stageRuntime = createStageRuntime(this.stage);
    this.actors.forEach((actor, index) => {
      actor.x = index === 0 ? 310 : 970;
      actor.y = FLOOR;
      actor.vx = 0;
      actor.vy = 0;
      actor.facing = index === 0 ? 1 : -1;
      actor.health = actor.maxHealth;
      actor.guard = actor.maxGuard;
      actor.meter = full ? (this.ritual.startMeter || 0) : clamp(actor.meter * .35, 0, 55);
      actor.grounded = true;
      actor.crouching = false;
      actor.blocking = false;
      actor.state = 'intro';
      actor.stateFrame = 0;
      actor.spriteClock = null;
      actor.attack = null;
      actor.hurtFrames = 0;
      actor.invuln = 0;
      actor.stun = 0;
      actor.dodgeCooldown = 0;
      actor.dodgeFrames = 0;
      actor.dodgeFollowupWindow = 0;
      actor.guardBreak = 0;
      actor.guardCounterWindow = 0;
      actor.knockdownTimer = 0;
      actor.wakeupWindow = 0;
      actor.combo = 0;
      actor.comboTimer = 0;
      actor.hitFlash = 0;
      actor.ko = false;
      actor.koProgress = 0;
      actor.parryWindow = 0;
      actor.armorCooldown = 0;
      actor.phasePower = 1;
      actor.phaseSpeed = 1;
      actor.phaseArmor = 0;
      actor.phaseLock = 0;
      actor.phaseName = null;
      actor.bossPhaseIndex = -1;
      actor.status = null;
      actor.lastMoveKey = null;
      actor.lastHit = null;
      actor.lastHitBy = null;
      actor.aiTimer = 0;
      actor.aiIntent = {};
      actor.aiRead = null;
      actor.traitPulse = 0;
      actor.moveVariety.clear();
      actor.counterStance = 0;
      actor.trapCooldown = 0;
      actor.auraCooldown = 0;
    });
    this.callbacks.onState(this.snapshot());
  }

  loop(now) {
    this.animationFrame = null;
    if (!this.running || this.destroyed) return;
    const dt = Math.max(0, Math.min(.05, (now - this.lastTime) / 1000 || 0));
    this.lastTime = now;
    this.updateGamepads();
    if (!this.paused && !this.destroyed) {
      this.accumulator += dt;
      while (this.accumulator >= STEP && this.running && !this.destroyed && !this.paused) {
        this.accumulator -= STEP;
        this.update();
      }
    }
    if (!this.running || this.destroyed) return;
    this.render(now);
    if (this.running && !this.destroyed) this.animationFrame = requestAnimationFrame(this.boundLoop);
  }

  update() {
    if (this.paused || this.destroyed) return;
    const frozen = this.hitstop > 0;
    this.updateSimulation();
    if (!frozen && !this.paused && !this.destroyed) this.actors.forEach(advanceSpriteClock);
  }

  updateSimulation() {
    if (this.paused) return;
    this.frame++;
    if (this.phase !== 'fight') this.discardControlEdges();
    if (this.hitstop > 0) {
      this.updateGamepads();
      if (this.paused) return;
      for (const index of [0, 1]) {
        if (index === 1 && this.config.mode !== 'local' && !this.config.training) continue;
        const controls = this.getControls(index, true);
        if (this.phase === 'fight' && IMPULSE_ACTIONS.some(key => controls[key])) {
          this.inputBuffer[index] = {
            controls: Object.fromEntries(IMPULSE_ACTIONS.map(key => [key, !!controls[key]])),
            expires: this.frame + 8
          };
        }
      }
      this.hitstop--;
      this.input.endFrame();
      return;
    }
    this.updateGamepads();
    if (this.paused) return;
    if (this.phase !== 'fight') this.discardControlEdges();

    if (this.phase === 'intro') {
      this.phaseTimer--;
      if (this.phaseTimer === 130) {
        this.addText(this.actors[0].profile.moveset.presentation.intro, 318, 236, 'intro');
        this.addText(this.actors[1].profile.moveset.presentation.intro, WIDTH - 318, 236, 'intro');
      }
      if (this.phaseTimer === 90) this.addText(`ROUND ${this.round}`, WIDTH / 2, 280, 'round');
      if (this.phaseTimer === 30) this.addText('FIGHT', WIDTH / 2, 315, 'fight');
      if (this.phaseTimer <= 0) {
        this.phase = 'fight';
        this.actors.forEach((actor) => { actor.state = 'idle'; });
      }
      this.input.endFrame();
      return;
    }

    if (this.phase === 'fatality') {
      this.updateFatality();
      this.updateEffects();
      this.callbacks.onState(this.snapshot());
      this.input.endFrame();
      return;
    }

    if (this.phase === 'roundEnd') {
      this.phaseTimer--;
      this.actors.forEach((actor) => {
        if (actor.ko) actor.koProgress = clamp(actor.koProgress + .035, 0, 1);
      });
      if (this.phaseTimer <= 0) this.finishRoundTransition();
      this.updateEffects();
      this.input.endFrame();
      return;
    }

    if (this.phase === 'matchEnd') {
      this.resultTimer++;
      this.updateEffects();
      this.input.endFrame();
      return;
    }

    if (this.phase !== 'fight') {
      this.input.endFrame();
      return;
    }

    if (Number.isFinite(this.matchTime)) {
      this.matchTime -= STEP;
      if (this.matchTime <= 0) {
        this.matchTime = 0;
        const [p1, p2] = this.actors;
        this.endRound(timeoutWinner(p1, p2), 'TIME');
        this.callbacks.onState(this.snapshot());
        this.input.endFrame();
        return; // No stage impact or attack may change a round after time expires.
      }
    }

    this.updateWorld();
    this.updateStageDirector();
    this.applyRitualTick();
    this.actors.forEach((actor) => this.updateStatus(actor));
    // Resolve both damage-over-time ticks before any new action or boss transition.
    if (this.actors.some(actor => actor.health <= 0)) {
      this.resolveKnockouts();
      this.callbacks.onState(this.snapshot());
      this.input.endFrame();
      return;
    }
    this.checkBossPhases();
    this.updateActor(this.actors[0], 0);
    this.updateActor(this.actors[1], 1);
    this.resolveBodyCollision();
    this.updateProjectiles();
    this.updateHazards();
    this.updateEffects();

    this.resolveKnockouts();
    this.callbacks.onState(this.snapshot());
    this.input.endFrame();
  }

  getControls(index, raw = false) {
    const map = this.bindings.players[index];
    const touch = this.touch[index === 0 ? 'p1' : 'p2'] || {};
    const ai = index === 1 && this.config.mode !== 'local' && !this.config.training;
    if (ai) return this.computeAI(this.actors[index], this.actors[1 - index]);

    const pad = this.readGamepad(index);
    const held = (action) => this.input.isDown(map[action]) || Boolean(touch[action]) || Boolean(pad?.held?.[action]);
    const pressed = (action) => this.input.wasPressed(map[action]) || touch[action] === 'pressed' || Boolean(pad?.pressed?.[action]);
    const released = (action) => this.input.wasReleased(map[action]) || Boolean(pad?.released?.[action]);
    const guard = held('guard'), previousGuard = this.guardHeld[index];
    this.guardHeld[index] = guard;
    const controls = {
      left: held('left'), right: held('right'), down: held('down'), guard,
      guardPressed: guard && !previousGuard && pressed('guard'),
      guardReleased: !guard && (previousGuard || released('guard')), jump: pressed('jump'),
      light: pressed('light'), heavy: pressed('heavy'), special: pressed('special'), throw: pressed('throw'),
      super: pressed('super'), dodge: pressed('dodge')
    };
    for (const action of Object.keys(touch)) {
      if (touch[action] === 'pressed') touch[action] = true;
    }
    if (!raw && this.inputBuffer[index]) {
      const buffer = this.inputBuffer[index];
      this.inputBuffer[index] = null;
      const fresh = IMPULSE_ACTIONS.some(key => controls[key]);
      if (!fresh && buffer.expires >= this.frame) return {
        ...controls, ...Object.fromEntries(IMPULSE_ACTIONS.map(key => [key, !!buffer.controls[key]]))
      };
    }
    return controls;
  }

  readTelegraphedHazard(actor, reactionFrames = 13) {
    if (actor.ko || this.phase !== 'fight') return null;
    const visible = this.hazards.filter(h => h.timer > reactionFrames + 6 &&
      h.timer <= Math.max(42, reactionFrames * 2 + 35) &&
      hazardContainsActor(h, actor));
    if (!visible.length) return null;
    // Give priority to the soonest danger, not to an unpublished future roll.
    const hazard = visible.sort((a,b)=>a.timer-b.timer)[0];
    const inset = this.arenaInset(85);
    const stride = clamp(actor.profile.speed * Math.min(hazard.timer,60) * this.terrainForActor(actor).moveScale,75,260);
    const attempts = [-1,1].map(dir => {
      const candidateX = clamp(actor.x + dir * stride, inset, WIDTH-inset);
      const escaped = !hazardContainsActor(hazard, { ...actor, x:candidateX });
      const clearance = hazard.profile.shape === 'edge'
        ? Math.min(candidateX,WIDTH-candidateX)
        : Math.abs(candidateX-hazard.x);
      const unsafeCount = this.hazards.filter(h => (h.timer > 0 || h.active > 0) && hazardTouches(h, {...actor,x:candidateX}, {preview:true})).length;
      return {dir, candidateX, escaped, clearance, unsafeCount, distance:Math.abs(candidateX-actor.x)};
    }).filter(item=>item.distance>=25);
    attempts.sort((a,b)=>a.unsafeCount-b.unsafeCount||Number(b.escaped)-Number(a.escaped)||b.clearance-a.clearance||b.distance-a.distance);
    const best = attempts[0];
    // A global wave has no escape lane: blocking is the advertised counterplay.
    if (hazard.profile.shape === 'global' || !best) return hazard.profile.unblockable ? {} : {guard:true};
    if (!best.escaped && !hazard.profile.unblockable && hazard.timer < reactionFrames * 2)
      return {guard:true};
    const intent = best.dir > 0 ? {right:true} : {left:true};
    // Rushing archetypes can still dodge but only when the warning is explicit.
    if (hazard.timer < 32 && actor.dodgeCooldown === 0 && actor.profile.dodgeInvuln >= 8)
      intent.dodge = true;
    return intent;
  }

  computeAI(actor, enemy) {
    const distance = Math.abs(enemy.x - actor.x);
    const baseDiff = {
      story: { react: 24, block: .18, attack: .38, counter: .08 },
      normal: { react: 13, block: .35, attack: .57, counter: .2 },
      hard: { react: 7, block: .56, attack: .76, counter: .38 }
    }[this.config.difficulty] || { react: 13, block: .35, attack: .57, counter: .2 };
    const personality = actor.profile.ai || { preferredRange: 145, aggression: 1, defense: 1, mobility: 1 };
    const diff = {
      react: Math.max(4, Math.round(baseDiff.react * (this.ritual.aiReactionScale || 1) / Math.max(.65, personality.mobility || 1))),
      block: clamp(baseDiff.block * (personality.defense || 1), .05, .88),
      attack: clamp(baseDiff.attack * (personality.aggression || 1), .15, .94),
      counter: clamp(baseDiff.counter * (personality.defense || 1), .04, .72)
    };
    const preferred = personality.preferredRange || 145;

    // Stage awareness belongs to AI too: it reads the same visible telegraphs as humans.
    // No invisible knowledge of random upcoming events or hazard placement.
    const environmentalDefense = this.readTelegraphedHazard(actor, baseDiff.react);
    if (environmentalDefense) {
      actor.aiIntent = environmentalDefense;
      actor.aiTimer = Math.max(4,Math.round(baseDiff.react*.75));
      return { ...environmentalDefense };
    }

    if (actor.knockdownTimer > 0 && actor.grounded && actor.wakeupWindow > 0 && this.rng() < .74) return { special: true };
    if (actor.guardCounterWindow > 0 && this.rng() < .82) return { heavy: true };
    if (actor.dodgeFrames > 0 && actor.dodgeFollowupWindow > 0 && this.rng() < .68) return { light: true };

    actor.aiTimer--;
    if (actor.aiTimer <= 0) {
      actor.aiTimer = diff.react + Math.floor(this.rng() * Math.max(2, diff.react));
      const toward = enemy.x > actor.x ? 'right' : 'left';
      const away = enemy.x > actor.x ? 'left' : 'right';
      const intent = {};
      const threatened = enemy.attack && distance < Math.max(170, enemy.attack.move.reach * .9);
      const read = this.config.adaptiveAI ? this.dominantPlayerAction() : null;
      actor.aiRead = read?.count >= 3 ? read.key : null;

      if (actor.aiRead === 'throw' && distance < 118) {
        intent[away] = true;
        if (this.rng() < .38) intent.jump = true;
      } else if (actor.aiRead === 'special' && distance < 430 && this.rng() < diff.block + .16) {
        if (actor.dodgeCooldown === 0 && this.rng() < .5) intent.dodge = true;
        else intent.guard = true;
      } else if (actor.aiRead === 'heavy' && distance < 150 && this.rng() < diff.counter + .28) {
        intent.light = true;
      } else if (threatened && this.rng() < diff.block) {
        if (this.rng() < diff.counter && actor.dodgeCooldown === 0) intent.dodge = true;
        else intent.guard = true;
      } else if (distance > preferred + 80) {
        const ranged = ['zoner', 'artillery', 'flyer', 'ghost', 'trickster'].includes(actor.data.archetype);
        if (ranged && this.rng() < .62) {
          // Conserver une commande neutre lorsqu'un véritable projectile est disponible ;
          // sinon sélectionner l'assaut avant du moveset au lieu d'un spécial générique.
          if (actor.profile.moves.neutralSpecial?.projectile) intent.special = true;
          else { intent[toward] = true; intent.special = true; }
        } else intent[toward] = true;
      } else if (distance < preferred - 55 && ['zoner', 'artillery', 'ghost', 'trickster'].includes(actor.data.archetype)) {
        if (actor.profile.moves.backSpecial?.teleport || actor.profile.moves.backSpecial?.invulnFrames || actor.profile.moves.backSpecial?.armorFrames) {
          intent[away] = true;
          intent.special = true;
        } else {
          intent[away] = true;
          if (this.rng() < .24) intent.dodge = true;
          else if (this.rng() < .42) intent.light = true;
        }
      } else if (distance < 78 && ['grappler', 'juggernaut', 'boss'].includes(actor.data.archetype) && this.rng() < .45) {
        intent.throw = true;
        if (this.rng() < .42) intent[away] = true;
      } else if (this.rng() < diff.attack) {
        const roll = this.rng();
        if (actor.meter >= 100 && roll > .84) intent.super = true;
        else if (roll > .68) {
          intent.heavy = true;
          if (distance > 112 && actor.profile.moves.forwardHeavy?.travel) intent[toward] = true;
          else if (distance < 94 && this.rng() < .28) intent.down = true;
        } else if (roll > .37) {
          intent.special = true;
          const downMove = actor.profile.moves.downSpecial;
          const forwardMove = actor.profile.moves.forwardSpecial;
          const backMove = actor.profile.moves.backSpecial;
          if (distance > 235 && actor.profile.moves.neutralSpecial?.projectile) {
            // Neutral projectile.
          } else if (distance > 135 && (forwardMove?.travel || forwardMove?.projectile || forwardMove?.teleport)) {
            intent[toward] = true;
          } else if (distance < 92 && (backMove?.teleport || backMove?.invulnFrames || backMove?.armorFrames)) {
            intent[away] = true;
          } else if (downMove?.trap || downMove?.aura || downMove?.level === 'low') intent.down = true;
        } else {
          intent.light = true;
          if (distance > 86 && actor.profile.moves.forwardLight?.travel) intent[toward] = true;
          else if (distance < 72 && this.rng() < .3) intent.down = true;
        }
      } else if (distance > preferred) intent[toward] = true;
      else intent[away] = true;

      if (['flyer', 'trickster'].includes(actor.data.archetype) && this.rng() < .12) {
        intent.jump = true;
        if (actor.profile.moves.airSpecial && this.rng() < .55) intent.special = true;
      }
      actor.aiIntent = intent;
    }

    const result = { ...actor.aiIntent };
    if ((result.left || result.right) && actor.aiTimer < diff.react * .35) {
      result.left = false;
      result.right = false;
    }
    if (actor.aiTimer <= 1) actor.aiIntent = {};
    return result;
  }

  updateActor(actor, index) {
    if (actor.ko || actor.health <= 0) return;
    const enemy = this.actors[1 - index];
    const controls = this.getControls(index);
    const profile = actor.profile;

    actor.hitFlash = Math.max(0, actor.hitFlash - 1);
    actor.invuln = Math.max(0, actor.invuln - 1);
    actor.dodgeCooldown = Math.max(0, actor.dodgeCooldown - 1);
    actor.dodgeFollowupWindow = Math.max(0, actor.dodgeFollowupWindow - 1);
    actor.comboTimer = Math.max(0, actor.comboTimer - 1);
    actor.parryWindow = Math.max(0, actor.parryWindow - 1);
    actor.guardCounterWindow = Math.max(0, actor.guardCounterWindow - 1);
    actor.wakeupWindow = Math.max(0, actor.wakeupWindow - 1);
    actor.armorCooldown = Math.max(0, actor.armorCooldown - 1);
    actor.traitPulse = Math.max(0, actor.traitPulse - 1);
    actor.counterStance = Math.max(0, actor.counterStance - 1);
    actor.trapCooldown = Math.max(0, actor.trapCooldown - 1);
    actor.auraCooldown = Math.max(0, actor.auraCooldown - 1);
    if (actor.comboTimer === 0) actor.combo = 0;
    if (this.config.freeMeter) actor.meter = 100;
    if (this.config.autoHeal && this.frame % 30 === 0 && actor.health < actor.maxHealth) actor.health = Math.min(actor.maxHealth, actor.health + 4);

    if (actor.phaseLock > 0) {
      actor.phaseLock--;
      actor.state = 'phase';
      actor.vx *= .72;
      if (actor.phaseLock % 7 === 0) this.spawnImpact(actor.x + (this.fxRng() - .5) * 80, actor.y - 120 - this.fxRng() * 80, actor.data.visual.accent, false, 5);
      this.physics(actor);
      return;
    }
    if (actor.knockdownTimer > 0) {
      actor.blocking = false;
      actor.crouching = false;
      actor.state = 'knockdown';
      if (!actor.grounded) {
        actor.knockdownTimer = Math.max(1, actor.knockdownTimer - 1);
        this.physics(actor);
        return;
      }
      if (actor.wakeupWindow === 0) actor.wakeupWindow = Math.min(18, actor.knockdownTimer);
      if (controls.special && actor.wakeupWindow > 0) {
        actor.knockdownTimer = 0;
        actor.wakeupWindow = 0;
        actor.hurtFrames = 0;
        this.addText('WAKE-UP', actor.x, actor.y - 210, 'counter');
        this.beginAttack(actor, 'wakeupAttack', { context: true });
        this.physics(actor);
        return;
      }
      actor.knockdownTimer--;
      if (actor.knockdownTimer <= 0) actor.state = 'idle';
      this.physics(actor);
      return;
    }
    if (actor.hurtFrames > 0) {
      actor.hurtFrames--;
      actor.state = 'hurt';
      actor.vx *= .9;
      if (actor.hurtFrames === 0) actor.state = 'idle';
      this.physics(actor);
      return;
    }
    if (actor.guardBreak > 0) {
      actor.guardBreak--;
      actor.state = 'guardBreak';
      this.physics(actor);
      return;
    }
    if (actor.attack) {
      this.updateAttack(actor, enemy, controls);
      this.physics(actor);
      return;
    }

    if (actor.dodgeFrames > 0) {
      if (controls.light && actor.dodgeFollowupWindow > 0) {
        actor.dodgeFrames = 0;
        actor.dodgeFollowupWindow = 0;
        this.addText('DODGE ATTACK', actor.x, actor.y - 205, 'chain');
        this.beginAttack(actor, 'dodgeAttack', { context: true });
      } else {
        actor.dodgeFrames--;
        actor.state = 'dodge';
        actor.blocking = false;
        actor.crouching = false;
      }
      this.physics(actor);
      return;
    }

    if (controls.heavy && actor.guardCounterWindow > 0) {
      actor.guardCounterWindow = 0;
      actor.parryWindow = 0;
      this.addText('GUARD COUNTER', actor.x, actor.y - 218, 'perfect');
      this.beginAttack(actor, 'guardCounter', { context: true });
      this.physics(actor);
      return;
    }

    if (controls.guardPressed && actor.grounded) {
      actor.parryWindow = 7;
      this.logInput(actor, 'GARDE');
    }
    actor.blocking = Boolean(controls.guard && actor.grounded);
    actor.crouching = Boolean(controls.down && actor.grounded);
    actor.state = actor.blocking ? (actor.crouching ? 'crouchBlock' : 'block') : actor.crouching ? 'crouch' : actor.counterStance > 0 ? 'counterStance' : 'idle';

    if (controls.dodge && actor.dodgeCooldown === 0 && canDodge(actor)) {
      actor.state = 'dodge';
      this.logInput(actor, 'ESQUIVE');
      actor.invuln = profile.dodgeInvuln;
      actor.dodgeCooldown = 42;
      actor.dodgeFrames = Math.max(10, profile.dodgeInvuln + 5);
      actor.dodgeFollowupWindow = Math.max(8, profile.dodgeInvuln + 2);
      const terrain = this.terrainForActor(actor);
      const dodgeDirection = controls.left !== controls.right ? (controls.left ? -1 : 1) : -actor.facing;
      actor.vx = dodgeDirection * (10.2 + (profile.trait.id === 'falsePresence' ? 1.4 : 0)) * terrain.dodgeScale;
      this.spawnDust(actor.x, actor.y);
      audio.tone({ freq: 110, duration: .1, gain: .025, slide: 90 });
    } else if (controls.jump && actor.grounded) {
      actor.vy = -profile.jump * this.terrainForActor(actor).jumpScale;
      this.logInput(actor, 'SAUT');
      actor.grounded = false;
      actor.state = 'jump';
      audio.tone({ freq: 90, duration: .06, gain: .018, slide: 40 });
    } else if (controls.super) this.beginAttack(actor, resolveMoveKey(actor, controls, 'super'));
    else if (controls.throw) this.beginAttack(actor, resolveMoveKey(actor, controls, 'throw'));
    else if (controls.special) this.beginAttack(actor, resolveMoveKey(actor, controls, 'special'));
    else if (controls.heavy) this.beginAttack(actor, resolveMoveKey(actor, controls, 'heavy'));
    else if (controls.light) this.beginAttack(actor, resolveMoveKey(actor, controls, 'light'));
    else if (!actor.blocking && !actor.crouching && actor.counterStance === 0) {
      let movement = 0;
      if (controls.left) movement--;
      if (controls.right) movement++;
      if (movement) {
        const terrain = this.terrainForActor(actor);
        const speed = profile.speed * actor.phaseSpeed * statusSpeed(actor) * terrain.moveScale;
        actor.vx = terrain.slip ? actor.vx * .64 + movement * speed * .48 : movement * speed;
        actor.state = actor.grounded ? 'walk' : 'jump';
        const advancing = Math.sign(enemy.x - actor.x) === movement;
        if (advancing && profile.trait.forwardMeter && this.frame % 8 === 0) {
          actor.meter = clamp(actor.meter + profile.trait.forwardMeter * 8, 0, 100);
          actor.traitPulse = 8;
        }
      } else actor.vx *= hasGroundContact(actor) ? .68 : .98;
    } else actor.vx *= .75;

    if (!actor.attack && actor.hurtFrames === 0 && Math.abs(enemy.x - actor.x) > 8) actor.facing = enemy.x > actor.x ? 1 : -1;
    this.physics(actor);
  }

  physics(actor) {
    if (!actor.grounded) {
      actor.vy += .65;
      actor.y += actor.vy;
      if (actor.y >= FLOOR) {
        actor.y = FLOOR;
        actor.vy = 0;
        actor.grounded = true;
        if (!actor.attack && actor.hurtFrames === 0) actor.state = actor.knockdownTimer > 0 ? 'knockdown' : 'idle';
        this.spawnDust(actor.x, actor.y);
      }
    }
    actor.x += actor.vx;
    const inset = Math.max(this.arenaInset(70), actorBox(actor).w / 2 + 16);
    actor.x = clamp(actor.x, inset, WIDTH - inset);
    if (actor.grounded && actor.state !== 'dodge') {
      const terrain = this.terrainForActor(actor);
      const baseFriction = actor.status?.id === 'frost' ? Math.max(.91, terrain.friction) : terrain.friction;
      actor.vx *= baseFriction;
    }
  }

  beginAttack(actor, key, { cancelled = false, context = false } = {}) {
    if (actor.ko || actor.health <= 0 || actor.phaseLock > 0) return false;
    const move = actor.profile.moves[key];
    if (!move) return false;
    if (move.requiresAir && actor.grounded) return false;
    if (move.requiresGround && !actor.grounded) return false;
    if (move.healthRequirement != null && healthRatio(actor) > move.healthRequirement) return false;
    if (['dodge-followup','perfect-guard','wakeup'].includes(move.trigger) && !context) return false;

    if (isNightmareMove(move)) {
      const ritualCost = Math.round((move.meterCost || 100) * (this.ritual.superCostScale || 1));
      if (actor.meter < ritualCost) return false;
      actor.meter -= ritualCost;
      this.superOverlay = { actor, timer: move.category === 'desperation' ? 66 : 50, name: move.name };
      audio.super();
      vibrate(move.category === 'desperation' ? [30, 22, 35, 22, 75] : [20, 25, 20, 25, 55]);
    }

    actor.attack = {
      key,
      move,
      frame: cancelled ? 2 : 0,
      spawned: false,
      hit: false,
      hitCount: 0,
      nextHitFrame: 0,
      teleported: false,
      counterReady: false,
      id: ++actor.attackId,
      cancelled
    };
    actor.state = 'attack';
    actor.blocking = false;
    actor.crouching = move.stance === 'crouching';
    if (move.button === 'throw') {
      actor.vx = actor.facing * 2.2;
      actor.stats.throws++;
    }
    if (key === 'backThrow') actor.stats.backThrows++;
    if (key === 'dodgeAttack') actor.stats.dodgeAttacks++;
    if (key === 'guardCounter') actor.stats.guardCounters++;
    if (key === 'wakeupAttack') actor.stats.wakeupAttacks++;
    if (move.verticalTravel && actor.grounded && !move.requiresAir) {
      actor.vy = -Math.min(actor.profile.jump * .72, Math.abs(move.verticalTravel) * 2.2);
      actor.grounded = false;
    }
    if (move.meterGain) actor.meter = clamp(actor.meter + move.meterGain, 0, 100);

    if (actor.profile.trait.meterVariety && !actor.moveVariety.has(key)) {
      actor.moveVariety.add(key);
      actor.meter = clamp(actor.meter + actor.profile.trait.meterVariety * 100, 0, 100);
      actor.traitPulse = 16;
      if (actor.moveVariety.size >= 6) actor.moveVariety.clear();
    }
    actor.lastMoveKey = key;
    this.logInput(actor, `${move.input || ''} ${move.name}`.trim());
    if (actor.index === 0 && Object.prototype.hasOwnProperty.call(this.playerPattern, move.button)) this.playerPattern[move.button]++;
    return true;
  }

  updateAttack(actor, enemy, controls) {
    const attack = actor.attack;
    const move = attack.move;
    attack.frame++;
    const total = move.startup + move.active + move.recovery;
    const activeStart = move.startup;
    const activeEnd = move.startup + move.active;

    if (move.invulnFrames && attack.frame <= move.invulnFrames) actor.invuln = Math.max(actor.invuln, 2);

    if (move.teleport && !attack.teleported && attack.frame >= Math.max(1, move.startup - 2)) {
      attack.teleported = true;
      const inset = this.arenaInset(70);
      if (move.teleport === 'behind') {
        const side = enemy.facing > 0 ? -1 : 1;
        actor.x = clamp(enemy.x + side * 86, inset, WIDTH - inset);
      } else if (move.teleport === 'cross') {
        const side = actor.x < enemy.x ? 1 : -1;
        actor.x = clamp(enemy.x + side * 116, inset, WIDTH - inset);
      }
      actor.facing = enemy.x > actor.x ? 1 : -1;
      actor.invuln = Math.max(actor.invuln, 5);
      this.spawnImpact(actor.x, actor.y - 110, actor.data.visual.accent, true, 11);
      audio.tone({ freq: 74, duration: .13, gain: .028, slide: 180 });
    }

    if ((move.projectile || move.trap) && !attack.spawned && attack.frame >= move.startup) {
      attack.spawned = true;
      this.spawnProjectile(actor, move, attack.id);
    }

    const active = attack.frame >= activeStart && attack.frame < activeEnd;
    if (!move.projectile && !move.trap && active && attack.hitCount < (move.hits || 1) && attack.frame >= attack.nextHitFrame) {
      const box = attackBox(actor, move);
      if (move.aura) {
        box.x = actor.x - move.reach;
        box.w = move.reach * 2;
        box.y = actor.y - 230;
        box.h = 245;
      }
      if (intersects(box, actorBox(enemy))) {
        const result = this.applyHit(actor, enemy, move, attack.id, attack.hitCount > 0 ? .72 : 1);
        if (result !== false) {
          attack.hit = true;
          attack.hitCount++;
          attack.nextHitFrame = attack.frame + (move.hitInterval || 4);
        }
        if (actor.attack !== attack) return; // A parry/counter interrupted THIS swing.
      }
    }

    if (move.counterStance && !attack.counterReady && attack.frame >= move.startup) {
      attack.counterReady = true;
      actor.counterStance = Math.max(actor.counterStance, move.active + 18);
      actor.invuln = Math.max(actor.invuln, 2);
      this.addText('COUNTER STANCE', actor.x, actor.y - 220, 'perfect');
    }

    if (attack.frame < activeEnd) {
      if (move.travel) actor.vx = actor.facing * move.travel;
      if (!actor.grounded && move.verticalTravel) actor.vy += Math.sign(move.verticalTravel) * Math.abs(move.verticalTravel) * .035;
    }

    const cancelStart = move.startup + Math.max(1, move.active - 2);
    const cancelEnd = cancelStart + actor.profile.cancelWindow;
    if (attack.hit && attack.frame >= cancelStart && attack.frame <= cancelEnd && move.cancelInto?.length) {
      const button = controls.special ? 'special' : controls.heavy ? 'heavy' : controls.light ? 'light' : null;
      const requested = button ? resolveMoveKey(actor, controls, button) : null;
      if (requested && move.cancelInto.includes(requested)) {
        this.addText('CHAIN', actor.x, actorBox(actor).y - 18, 'chain');
        this.beginAttack(actor, requested, { cancelled: true });
        return;
      }
    }

    if (attack.frame >= total) {
      actor.attack = null;
      actor.state = actor.grounded ? (actor.counterStance > 0 ? 'counterStance' : 'idle') : 'jump';
      actor.vx *= .45;
      actor.crouching = false;
    }
  }

  spawnProjectile(actor, move, attackId) {
    const isSuper = isNightmareMove(move);
    const count = Math.max(1, move.projectileCount || (actor.profile.trait.id === 'suppression' ? 2 : 1));
    const scale = move.projectileScale || 1;
    for (let index = 0; index < count; index++) {
      const spread = index - (count - 1) / 2;
      const trap = Boolean(move.trap);
      this.projectiles.push({
        owner: actor,
        attackId,
        move,
        x: trap ? clamp(actor.x + actor.facing * Math.min(move.reach * .72, 220), this.arenaInset(24), WIDTH - this.arenaInset(24)) : actor.x + actor.facing * (actorBox(actor).w * .45 + Math.abs(spread) * 18),
        y: trap ? FLOOR - 24 : actorBox(actor).y + actorBox(actor).h * .45 - Math.abs(spread) * 16,
        vx: trap ? 0 : actor.facing * (move.projectileSpeed || 13) * (1 - Math.abs(spread) * .045),
        vy: trap ? 0 : spread * (move.projectileArc || .8),
        gravity: move.projectileGravity || 0,
        homing: move.homing || 0,
        radius: (trap ? 32 : isSuper ? 18 : 12) * scale,
        life: trap ? Math.max(90, move.projectileLife || 150) : move.projectileLife || (isSuper ? 96 : 78),
        maxLife: trap ? Math.max(90, move.projectileLife || 150) : move.projectileLife || (isSuper ? 96 : 78),
        super: isSuper,
        trap,
        color: actor.data.visual.accent,
        hit: false,
        damageScale: count > 1 ? Math.max(.52, 1 - (count - 1) * .085) : 1
      });
    }
    audio.tone({ freq: isSuper ? 85 : 150, duration: .1, gain: .04, slide: isSuper ? 120 : 40 });
  }

  updateProjectiles() {
    if (this.phase !== 'fight') return;
    for (const projectile of this.projectiles) {
      const enemy = this.actors[1 - projectile.owner.index];
      if (projectile.homing && enemy) {
        const targetBody = actorBox(enemy);
        const desired = Math.atan2(targetBody.y + targetBody.h * .5 - projectile.y, enemy.x - projectile.x);
        const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
        const current = Math.atan2(projectile.vy, projectile.vx);
        let delta = desired - current;
        while (delta > Math.PI) delta -= TAU;
        while (delta < -Math.PI) delta += TAU;
        const angle = current + clamp(delta, -projectile.homing, projectile.homing);
        projectile.vx = Math.cos(angle) * speed;
        projectile.vy = Math.sin(angle) * speed;
      }
      const previous = { x: projectile.x, y: projectile.y };
      projectile.vy += projectile.gravity || 0;
      projectile.x += projectile.vx;
      projectile.y += projectile.vy;
      projectile.life--;
      if (projectile.super && !projectile.trap) projectile.vy += Math.sin((projectile.maxLife - projectile.life) * .22) * .035;
      if (!projectile.hit && enemy.health > 0 && !enemy.ko && enemy.invuln === 0) {
        const contact = sweptProjectileContact(previous, projectile, projectile.radius, actorBox(enemy));
        if (contact) {
          projectile.hit = true;
          projectile.life = 0;
          projectile.x = contact.x; projectile.y = contact.y;
          this.applyHit(projectile.owner, enemy, projectile.move, projectile.attackId, (projectile.super ? 1.02 : .9) * projectile.damageScale, { ranged: true, direction: Math.sign(projectile.vx) || Math.sign(enemy.x - previous.x) || projectile.owner.facing });
        }
      }
    }
    this.projectiles = this.projectiles.filter((projectile) => projectile.life > 0 && projectile.x > -120 && projectile.x < 1400 && projectile.y > -160 && projectile.y < 820);
  }

  applyHit(attacker, target, move, attackId, scale = 1, contact = {}) {
    if (this.phase !== 'fight' || target.health <= 0 || target.invuln > 0 || target.ko) return false;
    const ranged = Boolean(contact.ranged || move.projectile || move.trap);
    const hitDirection = contact.direction || attacker.facing || 1;

    const isThrow = move.level === 'throw' || move.category === 'throw';
    const isNightmare = isNightmareMove(move);
    const isHeavy = isHeavyMove(move);
    const isSpecial = ['special','counter','reversal'].includes(move.category);
    const unblockable = Boolean(move.unblockable || move.level === 'unblockable');
    if (this.stageRuntime && (isHeavy || isNightmare || move.armorBreak || move.groundBounce)) {
      this.stageRuntime.heavyImpactPending = true;
      this.stageRuntime.lastHeavyImpact = {
        frame: this.frame,
        moveKey: move.key || null,
        attackerIndex: attacker.index,
      };
    }
    const lowGuardValid = move.level !== 'low' || target.crouching;
    const overheadGuardValid = move.level !== 'overhead' || !target.crouching;
    const blocked = target.blocking && target.grounded && !isThrow && !unblockable && lowGuardValid && overheadGuardValid;
    const counter = Boolean(target.attack && target.attack.frame <= target.attack.move.startup + 1);

    if (target.counterStance > 0 && !isThrow && !isNightmare && !ranged) {
      target.counterStance = 0;
      target.attack = null;
      target.state = 'idle';
      const retaliation = takeDamage(attacker, Math.max(14, Math.round(move.damage * .34)));
      interruptAction(attacker);
      attacker.hurtFrames = Math.max(attacker.hurtFrames, 19);
      attacker.invuln = Math.max(attacker.invuln, 3);
      attacker.vx = -attacker.facing * Math.max(5, (move.knockback || 6) * .7) * this.currentTerrain().knockbackScale;
      attacker.hitFlash = Math.max(attacker.hitFlash, 7);
      target.meter = clamp(target.meter + 15, 0, 100);
      target.stats.counters++;
      target.stats.damageDealt += retaliation;
      attacker.stats.damageTaken += retaliation;
      attacker.lastHit = { attackerIndex: target.index, moveKey: 'counter-stance', isSuper: false, environmental: false, frame: this.frame };
      this.addText('COUNTER', attacker.x, actorBox(attacker).y - 26, 'counter');
      this.hitstop = 7;
      this.shake = Math.max(this.shake, 7);
      this.spawnImpact(attacker.x, attacker.y - 120, target.data.visual.accent, false, 16);
      audio.perfectGuard?.();
      return;
    }

    const guardScale = attacker.profile.trait.guardDamage || 1;
    let ritualDamage = this.ritual.damageScale || 1;
    if (isSpecial) ritualDamage *= this.ritual.specialDamageScale || 1;
    if (isNightmare) ritualDamage *= this.ritual.superDamageScale || 1;
    if (attacker.data.boss) ritualDamage *= this.ritual.bossPowerScale || 1;
    let damage = Math.round(move.damage * scale * (counter ? 1.18 : 1) * ritualDamage * actorPhasePower(attacker));

    if (blocked) {
      const perfect = target.parryWindow > 0;
      const moveGuardScale = move.guardDamage || 1;
      const guardDamage = Math.max(6, Math.round(damage * (perfect ? .1 : .34) * guardScale * moveGuardScale));
      target.guard -= guardDamage;
      if (perfect) {
        target.stats.perfectGuards++;
        target.guardCounterWindow = Math.max(target.guardCounterWindow, 18);
        target.meter = clamp(target.meter + 14, 0, 100);
        attacker.meter = clamp(attacker.meter + 2, 0, 100);
        if (!ranged) {
          interruptAction(attacker);
          attacker.hurtFrames = Math.max(attacker.hurtFrames, 11);
          attacker.vx = -hitDirection * 5;
        }
        this.addText('PERFECT GUARD', target.x, target.y - 245, 'perfect');
        this.hitstop = 6;
        this.shake = Math.max(this.shake, 5);
        audio.perfectGuard?.();
      } else {
        const chipScale = isNightmare ? .2 : isSpecial ? .17 : .14;
        const chip = takeDamage(target, damage * chipScale * (this.ritual.chipScale || 1));
        target.lastHit = { attackerIndex: attacker.index, moveKey: `${move.key || 'move'}-guard-chip`, isSuper: isNightmare, environmental: false, frame: this.frame };
        target.stats.damageTaken += chip;
        attacker.stats.damageDealt += chip;
        target.meter = clamp(target.meter + 5 * (this.ritual.meterGainScale || 1), 0, 100);
        attacker.meter = clamp(attacker.meter + (move.meter || 0) * .45 * attacker.profile.meterGain * (this.ritual.meterGainScale || 1), 0, 100);
        target.vx = hitDirection * (move.knockback || 4) * .42 * this.currentTerrain().knockbackScale;
        this.hitstop = isNightmare ? 6 : 3;
      }
      audio.guard();
      this.spawnImpact(target.x, target.y - 115, target.data.visual.accent, true, isNightmare ? 20 : 12);
      if (target.guard <= 0) {
        target.guard = 0;
        target.guardBreak = 70;
        target.blocking = false;
        this.addText('GUARD BREAK', target.x, target.y - 240, 'break');
        audio.tone({ freq: 70, duration: .35, gain: .06, slide: 190 });
      }
      return;
    }

    const traitArmorActive = target.armorCooldown === 0 && (
      target.profile.trait.id === 'rustArmor' ||
      (target.profile.trait.id === 'nightmareArmor' && healthRatio(target) > .33)
    );
    const moveArmorActive = Boolean(target.attack?.move?.armorFrames && target.attack.frame <= target.attack.move.armorFrames);
    const armorWasActive = traitArmorActive || moveArmorActive;
    const armorActive = armorWasActive && !move.armorBreak;
    const effectiveArmor = move.armorBreak ? 0 : clamp((target.profile.armor || 0) + (target.phaseArmor || 0) + (moveArmorActive ? .1 : 0), 0, .5);
    damage = takeDamage(target, damage * (1 - effectiveArmor));
    target.lastHit = {
      attackerIndex: attacker.index,
      moveKey: move.key || 'unknown-move',
      moveName: move.name,
      isSuper: isNightmare,
      environmental: false,
      frame: this.frame
    };
    attacker.stats.damageDealt += damage;
    target.stats.damageTaken += damage;
    if (counter) {
      attacker.stats.counters++;
      this.addText('COUNTER', target.x, target.y - 226, 'counter');
    }
    if (move.armorBreak && (armorWasActive || (target.profile.armor || 0) + (target.phaseArmor || 0) > .05)) {
      attacker.stats.armorBreaks++;
      target.armorCooldown = Math.max(target.armorCooldown, 180);
      this.addText('ARMOR BREAK', target.x, target.y - 246, 'break');
    }

    if (move.sideSwitch) {
      const direction = attacker.facing || 1;
      const midpoint = (attacker.x + target.x) * .5;
      const inset = this.arenaInset(70);
      target.x = clamp(midpoint - direction * 46, inset, WIDTH - inset);
      attacker.x = clamp(midpoint + direction * 58, inset, WIDTH - inset);
      attacker.facing = -direction;
      target.facing = direction;
    }

    let hitstun = isNightmare ? 38 : isHeavy ? 24 : isSpecial ? 20 : 14;
    hitstun = Math.round(hitstun * (target.profile.hitstunScale || 1) * (counter ? 1.22 : 1));
    if (armorActive) {
      if (traitArmorActive) target.armorCooldown = target.profile.trait.armorCooldown || 240;
      hitstun = Math.max(5, Math.round(hitstun * (moveArmorActive ? .36 : .55)));
      const armorLabel = moveArmorActive ? 'MOVE ARMOR' : target.profile.trait.id === 'rustArmor' ? 'RUST ARMOR' : 'NIGHTMARE ARMOR';
      this.addText(armorLabel, target.x, target.y - 246, 'armor');
    }
    const staggered = !armorActive || isThrow || move.armorBreak || move.launch || move.knockdown || move.hardKnockdown || move.groundBounce;
    if (staggered) interruptAction(target);
    target.hurtFrames = staggered ? hitstun : 0;
    target.invuln = 4;
    target.hitFlash = 7;
    target.vx = hitDirection * (move.knockback || 6) * (armorActive ? .45 : 1) * this.currentTerrain().knockbackScale;

    if (move.groundBounce) {
      target.vy = -Math.max(8.2, Math.abs(move.launch || 0));
      target.grounded = false;
      attacker.stats.groundBounces++;
    } else if (move.launch) {
      target.vy = -Math.abs(move.launch);
      target.grounded = false;
    } else if (move.level === 'low') {
      target.vy = move.knockdown ? -4.2 : -2.5;
      if (move.knockdown) target.grounded = false;
    }
    if (isThrow) {
      target.vy = -Math.max(6.5, Math.abs(move.launch || 0));
      target.grounded = false;
    }
    if (move.knockdown || isThrow || move.hardKnockdown || move.groundBounce) {
      target.hurtFrames = 0;
      target.knockdownTimer = Math.max(target.knockdownTimer, move.hardKnockdown ? 56 : isThrow ? 42 : move.groundBounce ? 46 : 34);
      target.wakeupWindow = 0;
      target.state = 'knockdown';
    }

    const gainScale = statusMeterScale(attacker);
    attacker.meter = clamp(attacker.meter + (move.meter || 0) * attacker.profile.meterGain * gainScale * (this.ritual.meterGainScale || 1), 0, 100);
    target.meter = clamp(target.meter + Math.max(6, (move.meter || 0) * .55) * (this.ritual.meterGainScale || 1), 0, 100);
    attacker.combo++;
    attacker.comboTimer = 72;
    attacker.stats.maxCombo = Math.max(attacker.stats.maxCombo, attacker.combo);
    target.lastHitBy = attacker.index;

    if (move.effect) this.applyStatus(target, move.effect, attacker);

    const impactPower = isNightmare ? 1.8 : isHeavy ? 1.25 : isSpecial ? 1.08 : .85;
    this.shake = Math.max(this.shake, isNightmare ? 18 : isHeavy ? 10 : isSpecial ? 8 : 6);
    this.flash = isNightmare ? 9 : isHeavy ? 5 : 3;
    this.hitstop = isNightmare ? 11 : isHeavy ? 7 : isSpecial ? 6 : 4;
    audio.hit(impactPower);
    vibrate(isNightmare ? [35, 20, 55] : isHeavy ? [24] : [18]);
    this.spawnImpact(target.x, target.y - 125, attacker.data.visual.accent, false, isNightmare ? 26 : isHeavy ? 19 : 14);
    if (attacker.combo > 1) this.addText(`${attacker.combo} HITS`, attacker.x, actorBox(attacker).y - 22, 'combo');
  }

  applyStatus(target, effect, source = null) {
    const definition = AFFLICTIONS[effect.id];
    if (!definition) return;
    const duration = Math.round((effect.duration || definition.duration) * (effect.potency || 1));
    if (target.status?.id === effect.id) {
      target.status.timer = Math.max(target.status.timer, duration);
      target.status.potency = Math.max(target.status.potency, effect.potency || 1);
      target.status.source = source?.index ?? null; // The refresh owns subsequent ticks.
    } else {
      target.status = { id: effect.id, timer: duration, potency: effect.potency || 1, tick: 0, source: source?.index ?? null };
      this.addText(definition.name, target.x, target.y - 208, 'status');
    }
    if (source) source.stats.statusesApplied++;
  }

  updateStatus(actor) {
    if (!actor.status) return;
    const status = actor.status;
    status.timer--;
    status.tick++;
    if (status.id === 'bleed' && status.tick % 30 === 0) this.applyStatusDamage(actor, Math.round(5 * status.potency));
    if (status.id === 'burn' && status.tick % 24 === 0) this.applyStatusDamage(actor, Math.round(7 * status.potency));
    if (status.id === 'decay' && status.tick % 18 === 0) actor.guard = Math.max(0, actor.guard - Math.round(2 * status.potency));
    if (status.id === 'dread') actor.meter = Math.max(0, actor.meter - .1 * status.potency);
    if (status.timer <= 0) actor.status = null;
  }

  applyStatusDamage(actor, damage) {
    if (actor.ko || actor.health <= 0 || this.phase !== 'fight') return;
    damage = takeDamage(actor, damage);
    const sourceIndex = actor.status?.source;
    actor.lastHit = { attackerIndex: sourceIndex ?? null, moveKey: actor.status?.id || 'status', isSuper: false, environmental: sourceIndex == null, frame: this.frame };
    if (sourceIndex != null && this.actors[sourceIndex]) {
      this.actors[sourceIndex].stats.damageDealt += damage;
      actor.lastHitBy = sourceIndex;
    }
    actor.stats.damageTaken += damage;
    actor.hitFlash = Math.max(actor.hitFlash, 2);
    this.spawnImpact(actor.x, actor.y - 100, AFFLICTIONS[actor.status?.id]?.color || '#a8323d', false, 4);
  }

  arenaInset(minimum = 70) {
    const stageInset = this.config.stageTerrain !== false ? Number(this.stage?.director?.arenaInset || this.stage?.gameplay?.arenaInset || minimum) : minimum;
    const ritualInset = Number(this.ritual.arenaInset || 0);
    return clamp(Math.max(minimum, stageInset, ritualInset), minimum, 280);
  }

  currentTerrain() {
    if (this.config.stageTerrain === false) return stageTerrainProfile({ terrain: { id: 'concrete' } });
    return stageTerrainProfile(this.stage, this.stageRuntime?.terrainOverride || null);
  }

  terrainForActor(actor) {
    return hasGroundContact(actor) ? this.currentTerrain() : {
      ...stageTerrainProfile({ terrain: { id: 'concrete' } }),
      id: 'air', friction: .98, description: 'Le sol ne freine pas un corps sans contact.'
    };
  }

  updateWorld() {
    const [p1, p2] = this.actors;
    const distance = Math.abs(p1.x - p2.x);
    const attackNoise = p1.attack || p2.attack ? .22 : 0;
    const visibilityScale = this.stage?.visibility?.radioScale || 1;
    const eventBoost = this.stageRuntime?.radioBoost || 0;
    const radioScale = this.ritual.radioDisabled ? 0 : (this.ritual.radioScale || 1) * visibilityScale;
    this.world.radio = clamp((1 - distance / 620 + this.world.amount * .34 + attackNoise + eventBoost) * radioScale, 0, 1);

    const shift = stageShiftStyle(this.stage);
    if (this.config.otherworldShift && !this.world.triggered && this.frame > 180) {
      const threshold = Math.max(Number(this.ritual.shiftThreshold || 0), Number(shift.threshold || .58));
      const timerRatio = Math.max(.18, Math.min(.9, Number(shift.timerRatio || .58)));
      const lowHealth = Math.min(healthRatio(p1), healthRatio(p2)) <= threshold;
      const lateTimer = Number.isFinite(this.matchTime) && this.config.timeLimit > 0 && this.matchTime <= this.config.timeLimit * timerRatio;
      const finalRound = this.round >= this.config.roundsToWin * 2 - 1;
      if (lowHealth || lateTimer || finalRound) this.triggerOtherworldShift();
    }

    if (this.world.phase === 'shifting') {
      this.world.amount = clamp(this.world.amount + 1 / Math.max(70, shift.duration || 150), 0, 1);
      this.world.siren--;
      if (this.world.amount >= 1) this.world.phase = 'otherworld';
    }

    if (this.config.stageHazards) {
      const stageReady = this.world.amount >= .38 || this.stage?.shift?.startOtherworld || this.stageRuntime?.activeEvent?.hazard;
      if (stageReady) {
        this.world.hazardTimer--;
        if (this.world.hazardTimer <= 0) {
          this.spawnHazard();
          const cadence = this.stage?.director?.cadence || 310;
          this.world.hazardTimer = Math.round((cadence * (.85 + this.rng() * .55)) * (this.ritual.hazardIntervalScale || 1));
        }
      }
    }
  }

  updateStageDirector() {
    const runtime = this.stageRuntime;
    if (!runtime || this.config.stageDirector === false) return;
    runtime.darkness *= .965;
    runtime.fogBoost *= .97;
    runtime.radioBoost *= .955;
    if (runtime.terrainTimer > 0) {
      runtime.terrainTimer--;
      if (runtime.terrainTimer <= 0) runtime.terrainOverride = null;
    }
    if (runtime.activeTimer > 0) {
      runtime.activeTimer--;
      if (runtime.activeTimer <= 0) runtime.activeEvent = null;
    }

    const events = this.stage?.director?.events || [];
    if (!events.length || runtime.activeEvent) return;
    runtime.eventTimer--;
    if (this.tryStageInteraction()) return;
    if (runtime.eventTimer > 0) return;
    const id = events[runtime.eventCursor % events.length];
    runtime.eventCursor++;
    this.triggerStageEvent(id, { trigger: 'director-cadence' });
    const cadence = this.stage?.director?.cadence || 320;
    runtime.eventTimer = Math.round(cadence * (.82 + this.rng() * .46));
  }

  tryStageInteraction() {
    const runtime = this.stageRuntime;
    const interactions = this.stage?.interactions || [];
    if (!runtime || runtime.activeEvent || !interactions.length) return false;
    const triggered = new Set(runtime.interactionTriggered || []);
    const lowHealth = Math.min(...this.actors.map((actor) => healthRatio(actor))) <= .32;
    const lateRound = Number.isFinite(this.matchTime) && this.config.timeLimit > 0 && this.matchTime <= this.config.timeLimit * .24;
    for (const interaction of interactions) {
      if (triggered.has(interaction.id)) continue;
      let ready = false;
      if (interaction.trigger === 'time-or-first-heavy-impact') ready = runtime.heavyImpactPending || runtime.eventTimer <= 0;
      else if (interaction.trigger === 'otherworld-halfway') ready = this.world.amount >= .5;
      else if (interaction.trigger === 'low-health-or-late-round') ready = lowHealth || lateRound;
      if (!ready) continue;
      const fired = this.triggerStageEvent(interaction.event, { trigger: interaction.trigger, interactionId: interaction.id });
      if (fired) {
        runtime.interactionTriggered.push(interaction.id);
        runtime.heavyImpactPending = false;
        const cadence = this.stage?.director?.cadence || 320;
        runtime.eventTimer = Math.round(cadence * (.92 + this.rng() * .38));
        return true;
      }
    }
    return false;
  }

  triggerStageEvent(id, metadata = {}) {
    const definition = stageEventDefinition(id);
    if (!definition || !this.stageRuntime) return false;
    const runtime = this.stageRuntime;
    const linkedHazard = definition.hazard && this.config.stageHazards ? this.spawnHazard(definition.hazard, { sourceEvent: id }) : null;
    // No orphaned physical cue when its collision could not be scheduled.
    if (definition.hazard && this.config.stageHazards && !linkedHazard) return false;
    runtime.activeEvent = { id, ...definition, trigger: metadata.trigger || 'manual' };
    runtime.linkedHazard = linkedHazard;
    runtime.activeTimer = definition.duration || 120;
    runtime.darkness = Math.max(runtime.darkness, definition.darkness || 0);
    runtime.fogBoost = Math.max(runtime.fogBoost, definition.fogBoost || Math.max(0, (definition.darkness || 0) * .22));
    runtime.radioBoost = Math.max(runtime.radioBoost, definition.radioBoost || 0);
    runtime.lastEvent = id;
    runtime.lastTrigger = metadata.trigger || 'manual';
    runtime.eventsTriggered++;
    runtime.eventHistory.push(id);
    if (runtime.eventHistory.length > 8) runtime.eventHistory.shift();
    runtime.pendingTerrain = null;
    // Changes in traction start with the announced impact, never at warning start.
    // In ambience-only play, visual events cannot silently change the controls.
    this.addText(definition.message || definition.name, WIDTH / 2, 206, 'stage');
    if (definition.hazard && this.config.stageHazards) {
      if (runtime.linkedHazard && definition.terrainPulse && this.config.stageTerrain) {
        runtime.linkedHazard.terrainPulse = definition.terrainPulse;
        runtime.linkedHazard.terrainDuration = definition.duration || 120;
        runtime.pendingTerrain = { id: definition.terrainPulse, hazard: runtime.linkedHazard };
      }
      this.world.hazardTimer = Math.max(this.world.hazardTimer, Math.round((definition.duration || 100) * .75));
    }
    this.shake = Math.max(this.shake, definition.hazard ? 7 : 3);
    this.flash = Math.max(this.flash, definition.darkness > .5 ? 2 : 4);
    if (id === 'sirenCall') audio.siren?.();
    else if (definition.hazard) audio.hazard?.();
    else audio.tone({ freq: 72 + runtime.eventsTriggered * 5, duration: .18, gain: .025, slide: -18 });
    return true;
  }

  triggerOtherworldShift() {
    const shift = stageShiftStyle(this.stage);
    this.world.triggered = true;
    this.world.phase = 'shifting';
    this.world.siren = shift.duration || 150;
    this.addText(`${shift.cue || 'SIRÈNE'} — ${shift.name || 'OTHERWORLD'}`, WIDTH / 2, 238, 'shift');
    audio.siren?.();
    vibrate([40, 45, 40, 45, 80]);
    this.flash = 7;
  }

  spawnHazard(forcedId = null, metadata = {}) {
    const deck = stageHazardDeck(this.stage, this.world.phase === 'otherworld' ? 'otherworld' : 'fog').filter((id) => STAGE_HAZARDS[id]);
    let id = forcedId && STAGE_HAZARDS[forcedId] ? forcedId : deck[Math.floor(this.rng() * Math.max(1, deck.length))];
    const automatic = !forcedId || Boolean(metadata.sourceEvent);
    if (!id || !STAGE_HAZARDS[id] || (automatic && (!this.config.stageHazards || !localHazardAllowed(this.stage, id)))) return null;
    if (automatic && this.hazards.filter(h => h.timer > 0 || h.active > 0).length >= 2) {
      if (this.stageRuntime) this.stageRuntime.suppressedHazards++;
      return null;
    }
    const history = this.stageRuntime?.hazardHistory || [];
    if (!forcedId && deck.length > 1 && history.at(-1) === id) id = deck[(deck.indexOf(id) + 1) % deck.length];
    const profile = STAGE_HAZARDS[id];
    const target = this.actors[Math.floor(this.rng() * this.actors.length)];
    const inset = this.arenaInset(90);
    let x = target.x;
    let side = this.rng() < .5 ? -1 : 1;
    switch (profile.targetMode) {
      case 'center': x = WIDTH / 2; break;
      case 'edge': x = side < 0 ? inset : WIDTH - inset; break;
      case 'side': x = side < 0 ? inset + profile.radius * .45 : WIDTH - inset - profile.radius * .45; break;
      case 'fighter':
      default: x = clamp(target.x + (this.rng() - .5) * 210, inset, WIDTH - inset); break;
    }
    const zoneWidth = profile.shape === 'sweep' ? Math.max(260, profile.radius * 2.15) : profile.radius * 2;
    const hazard = {
      id, profile, x, y: FLOOR,
      timer: profile.telegraph, maxTimer: profile.telegraph,
      active: 0, maxActive: 34, resolved: false, hitActors: new Set(), side,
      zoneMin: clamp(x - zoneWidth * .5, 0, WIDTH),
      zoneMax: clamp(x + zoneWidth * .5, 0, WIDTH),
      sourceEvent: metadata.sourceEvent || null,
      diagnostic: Boolean(forcedId && !metadata.sourceEvent)
    };
    this.hazards.push(hazard);
    this.world.hazardsTriggered++;
    if (this.stageRuntime) {
      this.stageRuntime.hazardHistory.push(id);
      if (this.stageRuntime.hazardHistory.length > 6) this.stageRuntime.hazardHistory.shift();
    }
    return hazard;
  }

  updateHazards() {
    if (this.phase !== 'fight') return;
    for (const hazard of this.hazards) {
      if (hazard.timer > 0) {
        hazard.timer--;
        if (hazard.timer === 0) {
          hazard.active = hazard.maxActive || 34;
          if (hazard.terrainPulse && this.config.stageTerrain && this.stageRuntime) {
            this.stageRuntime.terrainOverride = hazard.terrainPulse;
            this.stageRuntime.terrainTimer = hazard.terrainDuration;
            if (this.stageRuntime.pendingTerrain?.hazard === hazard) this.stageRuntime.pendingTerrain = null;
          }
          this.resolveHazard(hazard);
        }
      } else if (hazard.active > 0) {
        hazard.active--;
        if (hazard.active > 0 && ['trainRush','gurneyRush','rootSnare','steamVent','waterSurge','roadCollapse','chainSweep','iceFracture'].includes(hazard.id))
          this.resolveHazard(hazard, true);
      }
    }
    this.hazards = this.hazards.filter(hazard => hazard.timer > 0 || hazard.active > 0);
  }

  resolveHazard(hazard, continuing = false) {
    if (this.phase !== 'fight' || !hazard || (hazard.resolved && !continuing)) return;
    const first = !hazard.resolved;
    hazard.resolved = true;
    hazard.hitActors ||= new Set();
    let hitCount = 0;
    for (const actor of this.actors) {
      if (actor.ko || actor.health <= 0 || hazard.hitActors.has(actor.index) || !hazardContainsActor(hazard, actor) || actor.invuln > 0) continue;
      hazard.hitActors.add(actor.index);
      hitCount++;
      const guarded = actor.blocking && actor.grounded && !hazard.profile.unblockable;
      const damage = takeDamage(actor, hazard.profile.damage * (this.ritual.hazardDamageScale || 1) * (guarded ? .28 : 1));
      actor.lastHit = { attackerIndex: null, moveKey: hazard.id, isSuper: false, environmental: true, frame: this.frame };
      actor.stats.damageTaken += damage;
      actor.stats.hazardsTaken++;
      actor.hitFlash = 6;
      actor.hurtFrames = guarded ? 5 : 16;
      if (!guarded) {
        interruptAction(actor);
      }
      const force = (hazard.profile.knockback ?? 8) * this.terrainForActor(actor).knockbackScale * (guarded ? .38 : 1);
      actor.vx = force < 0 ? Math.sign(WIDTH / 2 - actor.x || 1) * Math.abs(force) : Math.sign(actor.x - hazard.x || hazard.side || 1) * force;
      if (hazard.profile.effect) this.applyStatus(actor, { id: hazard.profile.effect, duration: AFFLICTIONS[hazard.profile.effect]?.duration || 120, potency: .8 });
      this.spawnImpact(actor.x, actorBox(actor).y + actorBox(actor).h * .6, AFFLICTIONS[hazard.profile.effect]?.color || '#b24a42', false, 18);
    }
    if (first || hitCount) {
      this.shake = Math.max(this.shake, hazard.profile.unblockable ? 15 : 11);
      this.flash = 5;
      audio.hazard?.();
    }
  }

  logInput(actor, label) {
    if (actor.index !== 0 || !label) return;
    const last = this.inputHistory[this.inputHistory.length - 1];
    if (last?.label === label && this.frame - last.frame < 8) return;
    this.inputHistory.push({ label, frame: this.frame });
    if (this.inputHistory.length > 12) this.inputHistory.shift();
  }

  dominantPlayerAction() {
    const entries = Object.entries(this.playerPattern);
    if (!entries.length) return null;
    const [key, count] = entries.sort((left, right) => right[1] - left[1])[0];
    return { key, count };
  }

  applyRitualTick() {
    if (!this.ritual.lifeDrain || this.frame % 60 !== 0 || this.phase !== 'fight') return;
    for (const actor of this.actors) {
      if (actor.health <= 1 || actor.ko) continue;
      const damage = Math.min(actor.health - 1, this.ritual.lifeDrain);
      actor.health -= damage;
      actor.stats.damageTaken += damage;
      actor.stats.ritualDamage += damage;
    }
  }

  checkBossPhases() {
    for (const actor of this.actors) {
      if (!actor.data.boss || !actor.bossPhases.length || actor.ko || actor.health <= 0 || actor.phaseLock > 0) continue;
      const next = actor.bossPhases[actor.bossPhaseIndex + 1];
      if (next && healthRatio(actor) <= next.threshold) this.advanceBossPhase(actor, next);
    }
  }

  forceBossPhase(index = 1) {
    const actor = this.actors[index]?.data.boss ? this.actors[index] : this.actors.find((entry) => entry.data.boss);
    if (!actor || actor.ko || actor.health <= 0) return false;
    const next = actor.bossPhases[actor.bossPhaseIndex + 1];
    if (!next) return false;
    this.advanceBossPhase(actor, next, true);
    this.callbacks.onState(this.snapshot());
    return true;
  }

  advanceBossPhase(actor, phase, forced = false) {
    if (actor.ko || actor.health <= 0 || (!forced && actor.phaseLock > 0)) return false;
    interruptAction(actor, 'phase');
    actor.hurtFrames = 0; actor.knockdownTimer = 0; actor.wakeupWindow = 0;
    actor.bossPhaseIndex++;
    actor.phaseName = phase.name;
    actor.phasePower = phase.power || 1;
    actor.phaseSpeed = phase.speed || 1;
    actor.phaseArmor = phase.armor || 0;
    actor.phaseLock = forced ? 28 : 52;
    actor.invuln = Math.max(actor.invuln, actor.phaseLock + 8);
    actor.meter = clamp(actor.meter + (phase.meter || 0), 0, 100);
    actor.stats.bossPhasesTriggered++;
    this.bossPhaseOverlay = { actor, phase, timer: 92 };
    this.addText(`PHASE ${actor.bossPhaseIndex + 1} — ${phase.name}`, WIDTH / 2, 244, 'phase');
    this.shake = Math.max(this.shake, 16);
    this.flash = 9;
    audio.siren?.();
    vibrate([35, 25, 35, 25, 85]);
    if (phase.otherworld && !this.world.triggered) this.triggerOtherworldShift();
    if (phase.hazardBurst && this.config.stageHazards) {
      this.spawnHazard();
      this.world.hazardTimer = Math.round(90 * (this.ritual.hazardIntervalScale || 1));
    }
  }

  resolveBodyCollision() {
    const [p1, p2] = this.actors;
    const a = actorBox(p1), b = actorBox(p2);
    if (a.y + a.h <= b.y || b.y + b.h <= a.y) return; // An actual jump can cross over.
    const minimum = bodyPushRadius(p1) + bodyPushRadius(p2);
    const direction = p2.x >= p1.x ? 1 : -1;
    const missing = minimum - Math.abs(p2.x - p1.x);
    if (missing <= 0) return;
    const clampActor = (actor, x) => {
      const inset = Math.max(this.arenaInset(70), actorBox(actor).w / 2 + 16);
      return clamp(x, inset, WIDTH - inset);
    };
    const old1 = p1.x, old2 = p2.x;
    p1.x = clampActor(p1, p1.x - direction * missing / 2);
    p2.x = clampActor(p2, p2.x + direction * missing / 2);
    const remainder = Math.max(0, minimum - Math.abs(p2.x - p1.x));
    if (remainder > 0) {
      if (Math.abs(p1.x-old1) < Math.abs(p2.x-old2)) p2.x = clampActor(p2, p2.x + direction * remainder);
      else p1.x = clampActor(p1, p1.x - direction * remainder);
    }
  }

  spawnImpact(x, y, color, guard = false, count = 14) {
    for (let index = 0; index < count; index++) {
      const angle = this.fxRng() * TAU;
      const speed = 2 + this.fxRng() * 9;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (guard ? 0 : 2),
        life: 18 + this.fxRng() * 22,
        max: 40,
        size: 2 + this.fxRng() * 5,
        color: guard ? '#d8d5c9' : color,
        kind: guard ? 'spark' : 'blood'
      });
    }
  }

  spawnDust(x, y) {
    for (let index = 0; index < 8; index++) {
      this.particles.push({
        x: x + (this.fxRng() - .5) * 38,
        y: y - 5,
        vx: (this.fxRng() - .5) * 3,
        vy: -this.fxRng() * 2,
        life: 18 + this.fxRng() * 12,
        max: 30,
        size: 5 + this.fxRng() * 9,
        color: '#aaa696',
        kind: 'dust'
      });
    }
  }

  addText(text, x, y, kind = 'default') {
    const persistent = ['round', 'fight', 'shift', 'intro', 'stage'].includes(kind);
    this.texts.push({ text, x, y, life: persistent ? 78 : 55, max: persistent ? 78 : 55, kind });
  }

  updateEffects() {
    if (this.superOverlay) {
      this.superOverlay.timer--;
      if (this.superOverlay.timer <= 0) this.superOverlay = null;
    }
    if (this.bossPhaseOverlay) {
      this.bossPhaseOverlay.timer--;
      if (this.bossPhaseOverlay.timer <= 0) this.bossPhaseOverlay = null;
    }
    this.shake *= .82;
    this.flash = Math.max(0, this.flash - 1);
    for (const particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.kind === 'dust' ? .02 : .28;
      particle.vx *= .96;
      particle.life--;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
    for (const text of this.texts) {
      if (!['round', 'fight', 'shift', 'stage'].includes(text.kind)) text.y -= .45;
      text.life--;
    }
    this.texts = this.texts.filter((text) => text.life > 0);
    for (const actor of this.actors) {
      const decay = actor.status?.id === 'decay';
      if (!actor.blocking && !decay && actor.guard < actor.maxGuard && this.frame % 5 === 0) {
        actor.guard = Math.min(actor.maxGuard, actor.guard + (this.ritual.guardRegenScale || 1) * this.currentTerrain().guardRegenScale);
      }
    }
  }


  resolveKnockouts() {
    const defeated = this.actors.filter((actor) => actor.health <= 0 && !actor.ko);
    if (!defeated.length || this.phase !== 'fight') return;
    if (defeated.length > 1) {
      for (const actor of defeated) {
        actor.health = 0;
        actor.ko = true;
        actor.state = 'ko';
      }
      audio.ko();
      vibrate([45, 25, 90]);
      this.endRound(null, 'DOUBLE K.O.');
      return;
    }

    const target = defeated[0];
    const hit = target.lastHit || { attackerIndex: 1 - target.index, moveKey: 'unknown', isSuper: false, environmental: false };
    const attacker = hit.attackerIndex == null ? this.actors[1 - target.index] : this.actors[hit.attackerIndex];
    const nearEdge = target.x < 190 || target.x > WIDTH - 190;
    const stageBased = this.config.stageFatalities !== false && Boolean(this.stage?.fatality) && (hit.environmental || hit.isSuper || nearEdge);
    const fighterFatalities = attacker?.data?.fatalities || [];
    const fighterDefinition = fighterFatalities.find((entry) => entry.type === (hit.isSuper ? 'nightmare' : 'signature')) || fighterFatalities[0];
    const definition = stageBased ? this.stage.fatality : fighterDefinition;

    if (this.config.fatalities !== false && attacker && definition) {
      this.startFatality(attacker, target, definition, stageBased, hit);
      return;
    }

    target.health = 0;
    target.ko = true;
    target.state = 'ko';
    audio.ko();
    vibrate([45, 25, 90]);
    this.endRound(attacker, 'K.O.');
  }

  startFatality(attacker, target, definition, stageBased = false, hit = {}) {
    const sequence = Array.isArray(definition.sequence) && definition.sequence.length
      ? definition.sequence
      : ['stagger', 'judgment', 'collapse'];
    const total = Math.max(168, sequence.length * 46);
    target.health = 1;
    target.attack = null;
    target.blocking = false;
    target.hurtFrames = 0;
    target.invuln = 0;
    target.vx = 0;
    target.vy = 0;
    target.grounded = true;
    target.state = 'fatalityTarget';
    attacker.attack = null;
    attacker.blocking = false;
    attacker.vx = 0;
    attacker.vy = 0;
    attacker.state = 'fatality';
    this.projectiles.length = 0;
    this.hazards.length = 0;
    this.phase = 'fatality';
    this.fatality = {
      attackerIndex: attacker.index,
      targetIndex: target.index,
      definition,
      stageBased,
      hit,
      sequence,
      step: 0,
      lastStep: -1,
      timer: total,
      total,
      startedAt: this.frame
    };
    this.world.triggered = true;
    this.world.phase = 'otherworld';
    this.world.amount = Math.max(this.world.amount, stageBased || definition.type === 'nightmare' ? 1 : .78);
    this.world.siren = Math.max(this.world.siren, 90);
    this.addText(stageBased ? 'STAGE FATALITY' : 'FATALITY', WIDTH / 2, 252, 'fatality');
    this.flash = 12;
    this.shake = 16;
    audio.siren?.();
    audio.tone?.({ freq: stageBased ? 54 : 68, duration: .42, gain: .065, slide: 44 });
    vibrate([60, 35, 80, 45, 110]);
  }

  updateFatality() {
    const fatality = this.fatality;
    if (!fatality) {
      this.phase = 'fight';
      return;
    }
    const attacker = this.actors[fatality.attackerIndex];
    const target = this.actors[fatality.targetIndex];
    const elapsed = fatality.total - fatality.timer;
    const progress = clamp(elapsed / fatality.total, 0, 1);
    const stepLength = fatality.total / fatality.sequence.length;
    fatality.step = Math.min(fatality.sequence.length - 1, Math.floor(elapsed / stepLength));

    const edgeRight = target.x >= WIDTH / 2;
    const targetGoal = fatality.stageBased ? (edgeRight ? WIDTH - 118 : 118) : WIDTH / 2 + (edgeRight ? 82 : -82);
    const attackerGoal = fatality.stageBased ? (edgeRight ? WIDTH - 255 : 255) : WIDTH / 2 + (edgeRight ? -78 : 78);
    target.x += (targetGoal - target.x) * .075;
    attacker.x += (attackerGoal - attacker.x) * .075;
    attacker.facing = target.x > attacker.x ? 1 : -1;
    target.facing = -attacker.facing;
    attacker.state = 'fatality';
    target.state = progress > .78 ? 'ko' : 'fatalityTarget';
    target.koProgress = progress > .76 ? clamp((progress - .76) / .24, 0, .82) : 0;

    if (fatality.step !== fatality.lastStep) {
      fatality.lastStep = fatality.step;
      const label = String(fatality.sequence[fatality.step] || 'JUDGMENT').replace(/[-_]/g, ' ').toUpperCase();
      this.addText(label, target.x, target.y - 245, fatality.stageBased ? 'stageFatality' : 'fatalityStep');
      const color = fatality.stageBased ? '#b4474c' : attacker.data.visual.accent;
      this.spawnImpact(target.x, target.y - 115, color, false, 20 + fatality.step * 5);
      this.shake = Math.max(this.shake, 8 + fatality.step * 3);
      this.flash = Math.max(this.flash, 4 + fatality.step * 2);
      audio.tone?.({ freq: Math.max(38, 112 - fatality.step * 17), duration: .18, gain: .045, slide: 35 });
      if (label.includes('SIREN') || label.includes('OTHERWORLD') || label.includes('BLACKOUT')) this.world.amount = 1;
    }

    if (fatality.definition.effect === 'chains' || fatality.definition.effect === 'rust') {
      if (this.frame % 7 === 0) this.spawnImpact(target.x + (this.rng() - .5) * 95, target.y - 60 - this.rng() * 160, '#8f5748', false, 4);
    } else if (fatality.definition.effect === 'petals' || fatality.definition.effect === 'spores') {
      if (this.frame % 5 === 0) this.spawnImpact(target.x + (this.rng() - .5) * 130, target.y - 90 - this.rng() * 150, '#b85f76', false, 3);
    } else if (fatality.definition.effect === 'water' || fatality.definition.effect === 'frost') {
      if (this.frame % 6 === 0) this.spawnImpact(target.x + (this.rng() - .5) * 110, target.y - 15, '#7aa3ae', true, 5);
    } else if (fatality.definition.effect === 'fire' || fatality.definition.effect === 'blood') {
      if (this.frame % 5 === 0) this.spawnImpact(target.x + (this.rng() - .5) * 100, target.y - 40 - this.rng() * 130, '#b63d38', false, 4);
    }

    fatality.timer--;
    if (fatality.timer <= 0) this.completeFatality();
  }

  completeFatality() {
    const fatality = this.fatality;
    if (!fatality) return;
    const attacker = this.actors[fatality.attackerIndex];
    const target = this.actors[fatality.targetIndex];
    target.health = 0;
    target.ko = true;
    target.state = 'ko';
    target.koProgress = .22;
    attacker.state = 'idle';
    attacker.stats.fatalities++;
    if (fatality.stageBased) attacker.stats.stageFatalities++;
    this.lastFatality = {
      id: fatality.definition.id || null,
      name: fatality.definition.name,
      stageBased: fatality.stageBased,
      stage: this.stage?.name || null,
      performer: attacker.data.name,
      victim: target.data.name,
      effect: fatality.definition.effect || null,
      sequence: [...fatality.sequence]
    };
    this.fatality = null;
    this.phase = 'fight';
    audio.ko();
    audio.tone?.({ freq: 38, duration: .55, gain: .07, slide: 22 });
    vibrate([90, 50, 130]);
    this.endRound(attacker, this.lastFatality.stageBased ? 'STAGE FATALITY' : 'FATALITY');
  }

  endRound(winner, label) {
    if (this.phase !== 'fight') return;
    this.phase = 'roundEnd';
    this.phaseTimer = 145;
    if (winner) winner.roundWins++;
    this.winner = winner;
    this.addText(label || 'K.O.', WIDTH / 2, 290, label === 'TIME' ? 'round' : 'ko');
    this.callbacks.onRoundEnd({ winner: winner?.data || null, round: this.round, reason: label, snapshot: this.snapshot() });
  }

  finishRoundTransition() {
    if (this.destroyed || this.phase !== 'roundEnd') return;
    const matchWinner = this.actors.find((actor) => actor.roundWins >= this.config.roundsToWin);
    if (matchWinner) {
      this.phase = 'matchEnd';
      this.input.enabled = false;
      this.clearInputs();
      this.winner = matchWinner;
      this.resultTimer = 0;
      const loser = this.actors[1 - matchWinner.index];
      this.callbacks.onMatchEnd({
        winnerIndex: matchWinner.index,
        loserIndex: loser.index,
        winner: matchWinner.data,
        loser: loser.data,
        rounds: this.round,
        snapshot: this.snapshot(),
        stats: {
          winner: { ...matchWinner.stats, healthRatio: healthRatio(matchWinner), grade: chronicleGrade({ ...matchWinner.stats, healthRatio: healthRatio(matchWinner) }) },
          loser: { ...loser.stats, healthRatio: healthRatio(loser) },
          worldShiftTriggered: this.world.triggered,
          hazardsTriggered: this.world.hazardsTriggered,
          lastFatality: this.lastFatality ? { ...this.lastFatality } : null
        }
      });
    } else {
      this.round++;
      this.resetRound(false);
    }
  }

  updateGamepads() {
    if (this.destroyed) return;
    let pads = [];
    // Permissions Policy may forbid getGamepads; keyboard and touch remain usable.
    try { pads = globalThis.navigator?.getGamepads?.() || []; } catch { /* Treat it as device loss. */ }
    const state = this.padSlots.poll(pads);
    this.currentPads = state.pads;
    let lost = false, startPressed = false;
    for (let i = 0; i < 2; i++) {
      const pad = state.pads[i], active = i === 0 || this.config.mode === 'local' || this.config.training;
      if (state.changed[i]) this.gamepadPrev[i] = pad.buttons.map(b => !!b.pressed);
      const start = !!pad?.buttons?.[9]?.pressed;
      lost ||= state.lost[i] && active;
      startPressed ||= start && !this.padSystemPrevious[i] && !state.changed[i] && active;
      this.padSystemPrevious[i] = start;
    }
    // Update ALL physical edges first, then one system decision. Loss always wins.
    if (this.phase !== 'matchEnd') {
      if (lost) this.togglePause(true);
      else if (startPressed) this.togglePause();
    }
  }

  readGamepad(index) {
    const pad = this.currentPads?.[index];
    if (!pad) return null;
    const previous = this.gamepadPrev[index] || [];
    const down = (button) => Boolean(pad.buttons[button]?.pressed);
    const pressed = (button) => down(button) && !previous[button];
    const released = (button) => !down(button) && Boolean(previous[button]);
    const axes = pad.axes || [];
    const held = {
      left: axes[0] < -this.bindings.deadzone || down(14),
      right: axes[0] > this.bindings.deadzone || down(15),
      down: axes[1] > this.bindings.deadzone || down(13),
      guard: down(4) || down(5)
    };
    const pressedActions = {
      guard: (down(4) || down(5)) && !(previous[4] || previous[5]),
      jump: pressed(0) || pressed(12),
      light: pressed(2), heavy: pressed(3), special: pressed(1), throw: pressed(6), super: pressed(7), dodge: pressed(8)
    };
    const releasedActions = { guard: !(down(4) || down(5)) && Boolean(previous[4] || previous[5]) };
    this.gamepadPrev[index] = pad.buttons.map((button) => button.pressed);
    return { held, pressed: pressedActions, released: releasedActions };
  }

  snapshot() {
    const [p1, p2] = this.actors;
    const actorSnapshot = (actor) => ({
      name: actor.data.name,
      health: actor.health,
      maxHealth: actor.maxHealth,
      guard: actor.guard,
      maxGuard: actor.maxGuard,
      meter: actor.meter,
      wins: actor.roundWins,
      combo: actor.combo,
      status: actor.status?.id || null,
      trait: actor.profile.trait.id,
      bossPhase: actor.bossPhaseIndex + 1,
      bossPhaseName: actor.phaseName,
      contextWindows: {
        dodgeFollowup: actor.dodgeFollowupWindow,
        guardCounter: actor.guardCounterWindow,
        wakeup: actor.wakeupWindow,
        knockdown: actor.knockdownTimer
      },
      currentMove: actor.attack ? {
        key: actor.attack.key,
        input: actor.attack.move.input,
        name: actor.attack.move.name,
        fidelity: actor.attack.move.fidelity,
        frame: actor.attack.frame
      } : null,
      lastMoveKey: actor.lastMoveKey || null,
      presentation: { ...actor.profile.moveset.presentation },
      movesetFidelity: { ...actor.profile.moveset.fidelitySummary },
      body: actorBox(actor), groundContact: hasGroundContact(actor),
      stats: { ...actor.stats }
    });
    return {
      phase: this.phase,
      round: this.round,
      time: this.matchTime,
      p1: actorSnapshot(p1),
      p2: actorSnapshot(p2),
      world: {
        ...this.world,
        terrain: this.currentTerrain(),
        shift: stageShiftStyle(this.stage),
        director: this.stageRuntime ? {
          activeEvent: this.stageRuntime.activeEvent?.id || null,
          activeEventName: this.stageRuntime.activeEvent?.name || null,
          eventTimer: this.stageRuntime.eventTimer,
          eventsTriggered: this.stageRuntime.eventsTriggered,
          interactionTriggered: [...this.stageRuntime.interactionTriggered],
          lastTrigger: this.stageRuntime.lastTrigger,
          heavyImpactPending: this.stageRuntime.heavyImpactPending,
          terrainOverride: this.stageRuntime.terrainOverride,
          pendingTerrain: this.stageRuntime.pendingTerrain ? { id: this.stageRuntime.pendingTerrain.id, frames: this.stageRuntime.pendingTerrain.hazard.timer } : null,
          ambienceOnly: !this.stage?.director?.hazardDeck?.length,
          suppressedHazards: this.stageRuntime.suppressedHazards,
        hazardWarnings: this.hazards.filter(h=>h.timer>0).map(h=>({
          id: h.id, label: h.profile.name, frames: h.timer, diagnostic: h.diagnostic,
          terrainAfterImpact: h.terrainPulse || null,
          center: h.x, shape: h.profile.shape, zoneMin:h.zoneMin, zoneMax:h.zoneMax,
          counterplay: hazardCounterplay(h), zones: hazardVolumes(h), travelZones: hazardVolumes(h,{preview:true})
        })),
          darkness: this.stageRuntime.darkness,
          fogBoost: this.stageRuntime.fogBoost
        } : null
      },
      ritual: { id: this.ritual.id, name: this.ritual.name },
      inputHistory: [...this.inputHistory],
      fatality: this.fatality ? { name: this.fatality.definition.name, stageBased: this.fatality.stageBased, step: this.fatality.step, timer: this.fatality.timer } : null,
      lastFatality: this.lastFatality ? { ...this.lastFatality } : null,
      winner: this.winner?.data?.name || null,
      paused: this.paused
    };
  }

  render(time) {
    time = this.frame * (1000 / FPS); // Pause and rendering FPS cannot advance stage machinery.
    const context = this.ctx;
    context.save();
    const allowShake = !this.settings.reducedMotion && this.settings.screenShake !== false;
    // Drawing never samples combat RNG: two clients update identically at different render FPS.
    const shakeX = allowShake && this.shake ? Math.sin(this.frame * 12.9898 + 1.34) * this.shake * .5 : 0;
    const shakeY = allowShake && this.shake ? Math.sin(this.frame * 78.233 + 4.79) * this.shake * .25 : 0;
    context.fillStyle = '#080b09';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    const camera = combatFraming(this.actors);
    this.presentationCamera = camera;
    context.save();
    context.translate(camera.x + shakeX, camera.y + shakeY);
    context.scale(camera.scale, camera.scale);
    drawStage(context, this.stage, time, {
      width: WIDTH,
      height: HEIGHT,
      cinematic: Boolean(this.superOverlay),
      otherworld: this.world.amount,
      radio: this.config.radioWarning ? this.world.radio : 0,
      animationsEnabled: this.config.stageAnimations !== false,
      director: this.stageRuntime,
      terrain: this.currentTerrain(),
      shift: stageShiftStyle(this.stage),
      reducedMotion: Boolean(this.settings.reducedMotion)
    });
    this.renderHazards(context, time);
    this.renderProjectiles(context);
    const sortedActors = [...this.actors].sort((left, right) => left.y - right.y);
    for (const actor of sortedActors) {
      const fatalityProgress = this.fatality ? clamp((this.fatality.total - this.fatality.timer) / this.fatality.total, 0, 1) : 0;
      const attackProgress = this.fatality && actor.index === this.fatality.attackerIndex
        ? Math.sin(Math.min(1, fatalityProgress * 1.35) * Math.PI)
        : actor.attack
          ? clamp((actor.attack.frame - actor.attack.move.startup * .5) / (actor.attack.move.active + actor.attack.move.startup), 0, 1)
          : 0;
      drawMonster(context, actor.data, actor.x, actor.y, {
        facing: actor.facing,
        state: { ...actorSpriteState(actor), attackProgress, status: actor.status?.id || null },
        time, diagnostic: Boolean(this.config.artDiagnostic),
        alpha: actor.invuln > 0 && this.frame % 4 < 2 ? .55 : 1
      });
      if (this.config.showHitboxes) {
        drawHitboxOverlay(context, actorBox(actor), actor.index === 0 ? '#55d37c' : '#5ca8df', 'HURT');
        if (actor.attack && actor.attack.frame >= actor.attack.move.startup && actor.attack.frame < actor.attack.move.startup + actor.attack.move.active && !actor.attack.move.projectile) {
          drawHitboxOverlay(context, attackBox(actor, actor.attack.move), '#e34b50', 'HIT');
        }
      }
    }
    this.renderParticles(context);
    this.renderHazardLabels(context);
    this.renderTexts(context);
    context.restore(); // Leave world/camera space before drawing full-size readable HUD.
    this.renderHUD(context);
    if (this.superOverlay) this.renderSuperOverlay(context);
    if (this.bossPhaseOverlay) this.renderBossPhaseOverlay(context);
    if (this.fatality) this.renderFatalityOverlay(context);
    this.renderRitualOverlay(context);
    if (this.paused) this.renderPause(context);
    if (this.phase === 'matchEnd') this.renderMatchEnd(context);
    if (this.flash && !this.settings.reducedMotion) {
      context.fillStyle = `rgba(255,245,224,${this.flash * .025})`;
      context.fillRect(-shakeX, -shakeY, WIDTH, HEIGHT);
    }
    context.restore();
  }

  renderProjectiles(context) {
    for (const projectile of this.projectiles) {
      context.save();
      context.globalCompositeOperation = 'screen';
      const gradient = context.createRadialGradient(projectile.x, projectile.y, 1, projectile.x, projectile.y, projectile.radius * 2.5);
      gradient.addColorStop(0, 'rgba(255,245,220,.9)');
      gradient.addColorStop(.35, projectile.color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(projectile.x, projectile.y, projectile.radius * 2.5, 0, TAU);
      context.fill();
      context.restore();
      for (let index = 0; index < 3; index++) {
        context.fillStyle = `rgba(180,60,66,${.13 - index * .025})`;
        context.beginPath();
        context.arc(projectile.x - projectile.vx * (index + 1) * 1.8, projectile.y, projectile.radius * (1 - index * .15), 0, TAU);
        context.fill();
      }
    }
  }

  renderHazards(context, time) {
    const reduce = Boolean(this.settings.reducedMotion);
    for (const hazard of this.hazards) {
      const progress = hazard.timer > 0 ? 1 - hazard.timer / Math.max(1,hazard.maxTimer) : 1;
      const active = hazard.timer <= 0;
      const zones = hazardVolumes(hazard);
      context.save();
      context.strokeStyle = active ? 'rgba(222,91,94,.85)' : `rgba(188,97,97,${.4+progress*.4})`;
      context.fillStyle = active ? 'rgba(154,50,58,.13)' : 'rgba(121,78,68,.07)';
      context.lineWidth = active ? 3 : 2;
      context.setLineDash(active ? [] : [10,8]);
      for (const zone of zones) {
        context.fillRect(zone.x,zone.y,zone.w,zone.h);
        context.strokeRect(zone.x,zone.y,zone.w,zone.h);
        // Floor marks repeat the ACTUAL bounds; ring center remains safe.
        context.fillRect(zone.x,FLOOR-2,zone.w,4);
      }
      context.setLineDash([]);
      context.restore();
      this.renderHazardSetpiece(context,hazard,reduce?0:time);
    }
  }

  renderHazardLabels(context) {
    // Foreground UI layer: a weapon or monster may never hide its warning.
    this.hazards.forEach((hazard, index) => {
      const zones = hazardVolumes(hazard);
      if (!zones.length) return;
      const lines = [hazard.profile.name, hazardCounterplay(hazard)];
      if (hazard.terrainPulse && hazard.timer > 0) lines.push(`SOL À L’IMPACT : ${stageTerrainProfile(this.stage, hazard.terrainPulse).name}`);
      context.save();context.font='800 12px ui-monospace';context.textAlign='center';
      const width=Math.min(410,Math.max(230,...lines.map(line=>context.measureText(line).width+28)));
      const x=clamp(hazard.profile.shape==='center'?WIDTH/2:hazard.x,width/2+16,WIDTH-width/2-16);
      const y=Math.max(158+index*48,Math.min(...zones.map(z=>z.y))-22);
      context.fillStyle='rgba(9,10,9,.94)';context.fillRect(x-width/2,y-15,width,lines.length*14+7);
      lines.forEach((line,i)=>{context.font=i?'600 10px ui-monospace':'800 12px ui-monospace';context.fillStyle=i?'#d6d1c2':'#eee3cd';context.fillText(line,x,y+i*14);});
      context.restore();
    });
  }

  renderHazardSetpiece(context, hazard, time) {
    drawHazardObjects(context, hazard, time, { reducedMotion: Boolean(this.settings.reducedMotion) });
  }

  renderParticles(context) {
    for (const particle of this.particles) {
      context.save();
      context.globalAlpha = clamp(particle.life / particle.max, 0, 1);
      context.fillStyle = particle.color;
      if (particle.kind === 'spark') {
        context.strokeStyle = particle.color;
        context.lineWidth = particle.size * .45;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy * 2);
        context.stroke();
      } else {
        context.beginPath();
        context.ellipse(particle.x, particle.y, particle.size, particle.kind === 'dust' ? particle.size * .45 : particle.size * .75, 0, 0, TAU);
        context.fill();
      }
      context.restore();
    }
  }

  renderHUD(context) {
    const [p1, p2] = this.actors;
    context.save();
    context.fillStyle = 'rgba(3,5,4,.78)';
    context.fillRect(0, 0, WIDTH, 128);
    context.strokeStyle = 'rgba(173,170,151,.18)';
    context.beginPath();
    context.moveTo(0, 127);
    context.lineTo(WIDTH, 127);
    context.stroke();

    const drawSide = (actor, left) => {
      const x = left ? 42 : WIDTH - 42;
      const width = 460;
      const barX = left ? x : x - width;
      const health = healthRatio(actor);
      const guard = clamp(actor.guard / actor.maxGuard, 0, 1);
      const meter = clamp(actor.meter / 100, 0, 1);
      context.textAlign = left ? 'left' : 'right';
      context.fillStyle = '#f0ebdf';
      context.font = '900 24px ui-monospace';
      context.fillText(actor.data.name.toUpperCase(), x, 31);
      context.fillStyle = '#9da299';
      context.font = '700 10px ui-monospace';
      context.fillText(`${actor.data.game} · ${actor.profile.trait.name}`, x, 49);
      context.fillStyle = 'rgba(255,255,255,.1)';
      context.fillRect(barX, 59, width, 21);
      const healthGradient = context.createLinearGradient(barX, 0, barX + width, 0);
      healthGradient.addColorStop(0, left ? '#8b242c' : '#d2c6a5');
      healthGradient.addColorStop(1, left ? '#d2c6a5' : '#8b242c');
      context.fillStyle = healthGradient;
      if (left) context.fillRect(barX, 59, width * health, 21);
      else context.fillRect(barX + width * (1 - health), 59, width * health, 21);
      context.strokeStyle = '#444942';
      context.strokeRect(barX, 59, width, 21);
      context.fillStyle = 'rgba(255,255,255,.08)';
      context.fillRect(barX, 85, width, 7);
      context.fillStyle = '#85908a';
      if (left) context.fillRect(barX, 85, width * guard, 7);
      else context.fillRect(barX + width * (1 - guard), 85, width * guard, 7);
      context.fillStyle = 'rgba(255,255,255,.08)';
      context.fillRect(barX, 97, width, 8);
      context.fillStyle = '#a52e37';
      if (left) context.fillRect(barX, 97, width * meter, 8);
      else context.fillRect(barX + width * (1 - meter), 97, width * meter, 8);
      if (actor.status) {
        const status = AFFLICTIONS[actor.status.id];
        context.fillStyle = status?.color || '#c0b8a7';
        context.font = '900 9px ui-monospace';
        context.fillText(`${status?.name || actor.status.id} ${Math.ceil(actor.status.timer / 60)}s`, x, 119);
      }
      for (let index = 0; index < this.config.roundsToWin; index++) {
        const circleX = left ? barX + index * 18 : barX + width - index * 18 - 9;
        context.fillStyle = index < actor.roundWins ? '#b73942' : '#262c27';
        context.beginPath();
        context.arc(circleX + 5, 116, 5, 0, TAU);
        context.fill();
      }
    };

    drawSide(p1, true);
    drawSide(p2, false);
    context.textAlign = 'center';
    context.fillStyle = '#e5dfd0';
    context.font = '900 33px ui-monospace';
    context.fillText(Number.isFinite(this.matchTime) ? String(Math.ceil(this.matchTime)).padStart(2, '0') : '∞', WIDTH / 2, 47);
    context.fillStyle = this.world.phase === 'fog' ? '#8d9690' : '#b73942';
    context.font = '900 10px ui-monospace';
    context.fillText(`ROUND ${this.round} · ${this.world.phase === 'fog' ? 'FOG WORLD' : this.world.phase === 'shifting' ? 'SIREN' : 'OTHERWORLD'}`, WIDTH / 2, 68);
    context.fillStyle = '#7f877f';
    context.font = '700 9px ui-monospace';
    context.fillText(this.stage.name, WIDTH / 2, 84);
    const terrain = this.currentTerrain();
    const activeEvent = this.stageRuntime?.activeEvent;
    context.fillStyle = activeEvent ? '#c7b790' : '#667068';
    context.font = '900 8px ui-monospace';
    context.fillText(activeEvent ? `${activeEvent.name} · ${terrain.name}` : terrain.name, WIDTH / 2, 96);
    context.fillStyle = this.ritual.id === 'none' ? '#59615b' : '#c34a52';
    context.font = '900 8px ui-monospace';
    context.fillText(`RITE · ${this.ritual.name}`, WIDTH / 2, 107);

    if (this.config.radioWarning && !this.ritual.radioDisabled) {
      const bars = 8;
      const active = Math.ceil(this.world.radio * bars);
      const startX = WIDTH / 2 - 44;
      for (let index = 0; index < bars; index++) {
        const height = 3 + index * 1.4;
        context.fillStyle = index < active ? (this.world.amount > .55 ? '#b73942' : '#b7b8a8') : 'rgba(255,255,255,.09)';
        context.fillRect(startX + index * 12, 110 - height, 7, height);
      }
      context.fillStyle = '#737b74';
      context.font = '700 8px ui-monospace';
      context.fillText('RADIO', WIDTH / 2, 122);
    }

    if (!this.config.training) {
      const drawContextPrompt = (actor, left) => {
        let label = '';
        if (actor.guardCounterWindow > 0) label = 'P-GUARD + H · RIPOSTE';
        else if (actor.dodgeFollowupWindow > 0) label = 'ESQUIVE + L · CONTRE-ATTAQUE';
        else if (actor.wakeupWindow > 0) label = 'RELEVÉE + S · REVERSAL';
        if (!label) return;
        const width = 222;
        const x = left ? 32 : WIDTH - 32 - width;
        context.fillStyle = 'rgba(4,7,5,.82)';
        context.fillRect(x, 138, width, 25);
        context.strokeStyle = actor.guardCounterWindow > 0 ? '#d6c88f' : '#8d3b43';
        context.strokeRect(x, 138, width, 25);
        context.textAlign = 'center';
        context.fillStyle = actor.guardCounterWindow > 0 ? '#e7ddb2' : '#d8c8ba';
        context.font = '900 9px ui-monospace';
        context.fillText(label, x + width / 2, 154);
      };
      drawContextPrompt(p1, true);
      drawContextPrompt(p2, false);
    }

    if (this.config.training) {
      context.fillStyle = 'rgba(4,7,5,.74)';
      context.fillRect(18, 143, 430, 202);
      context.strokeStyle = '#3b433d';
      context.strokeRect(18, 143, 430, 202);
      context.textAlign = 'left';
      context.fillStyle = '#c13e46';
      context.font = '900 10px ui-monospace';
      context.fillText('OBSERVATION DATA', 33, 164);
      context.fillStyle = '#b9b9ae';
      context.font = '700 10px ui-monospace';
      const attack = p1.attack;
      context.fillText(`SUJET I    ${p1.state.toUpperCase()}`, 33, 185);
      context.fillText(`FRAME      ${attack ? attack.frame : '—'}`, 33, 203);
      context.fillText(`MOVE       ${attack ? `${attack.move.input} · ${attack.move.name}` : '—'}`, 33, 221);
      context.fillText(`FIDELITY   ${attack ? attack.move.fidelity.toUpperCase() : '—'}`, 33, 239);
      context.fillText(`DISTANCE   ${Math.round(Math.abs(p1.x - p2.x))}`, 33, 257);
      context.fillText(`TRAIT      ${p1.profile.trait.name}`, 33, 275);
      context.fillText(`STATUS     ${p1.status ? AFFLICTIONS[p1.status.id]?.name : '—'}`, 33, 291);
      context.fillText(`CONTEXT    DODGE ${p1.dodgeFollowupWindow || 0} · P-GUARD ${p1.guardCounterWindow || 0} · RISE ${p1.wakeupWindow || 0}`, 33, 309);
      context.fillStyle = '#747d75';
      context.font = '700 9px ui-monospace';
      context.fillText(`INPUTS     ${this.inputHistory.slice(-5).map((entry) => entry.label).join(' › ') || '—'}`, 33, 329);
    }
    context.restore();
  }

  renderTexts(context) {
    for (const text of this.texts) {
      const alpha = clamp(text.life / Math.min(22, text.max), 0, 1);
      context.save();
      context.globalAlpha = alpha;
      context.textAlign = 'center';
      if (text.kind === 'round') {
        context.font = '900 34px ui-monospace'; context.fillStyle = '#e6dfcf';
      } else if (['fight', 'ko'].includes(text.kind)) {
        context.font = '900 82px ui-monospace'; context.fillStyle = '#a62d36'; context.shadowColor = '#000'; context.shadowBlur = 18;
      } else if (text.kind === 'fatality') {
        context.font = '900 68px ui-monospace'; context.fillStyle = '#b01f2c'; context.shadowColor = '#000'; context.shadowBlur = 24;
      } else if (text.kind === 'fatalityStep' || text.kind === 'stageFatality') {
        context.font = '900 21px ui-monospace'; context.fillStyle = text.kind === 'stageFatality' ? '#d5ad78' : '#e3d2c1'; context.shadowColor = '#7f1722'; context.shadowBlur = 14;
      } else if (text.kind === 'shift' || text.kind === 'phase') {
        context.font = '900 30px ui-monospace'; context.fillStyle = '#d4c7b2'; context.shadowColor = '#a62d36'; context.shadowBlur = 22;
      } else if (['break', 'perfect', 'counter', 'armor'].includes(text.kind)) {
        context.font = '900 20px ui-monospace'; context.fillStyle = text.kind === 'perfect' ? '#e7d9a8' : text.kind === 'counter' ? '#d86a70' : '#e6b45d';
      } else if (text.kind === 'intro') {
        context.font = '900 11px ui-monospace'; context.fillStyle = '#c6c1b5'; context.shadowColor = '#000'; context.shadowBlur = 8;
      } else if (text.kind === 'status') {
        context.font = '900 15px ui-monospace'; context.fillStyle = '#c6b9a9';
      } else if (text.kind === 'chain') {
        context.font = '900 14px ui-monospace'; context.fillStyle = '#9bb6a8';
      } else {
        context.font = '900 18px ui-monospace'; context.fillStyle = '#e8ddd0';
      }
      context.fillText(text.text, text.x, text.y);
      context.restore();
    }
  }

  renderSuperOverlay(context) {
    const overlay = this.superOverlay;
    const progress = 1 - overlay.timer / 50;
    context.save();
    context.fillStyle = `rgba(7,1,2,${.2 + Math.sin(progress * Math.PI) * .6})`;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.translate(WIDTH * .5, HEIGHT * .5);
    context.rotate(-.06);
    context.fillStyle = 'rgba(148,31,39,.88)';
    context.fillRect(-WIDTH * .65, -55, WIDTH * 1.3, 110);
    context.rotate(.06);
    context.textAlign = 'center';
    context.fillStyle = '#f3e9db';
    context.font = '900 44px ui-monospace';
    context.fillText(overlay.actor.data.name.toUpperCase(), 0, -2);
    context.fillStyle = '#180405';
    context.font = '900 18px ui-monospace';
    context.fillText(overlay.name.toUpperCase(), 0, 30);
    context.restore();
  }

  renderBossPhaseOverlay(context) {
    const overlay = this.bossPhaseOverlay;
    const progress = 1 - overlay.timer / 92;
    context.save();
    context.globalAlpha = Math.sin(Math.min(1, progress * 1.5) * Math.PI) * .92;
    context.fillStyle = 'rgba(8,1,2,.78)';
    context.fillRect(0, 178, WIDTH, 190);
    context.strokeStyle = overlay.actor.data.visual.accent || '#b83a43';
    context.lineWidth = 2;
    context.beginPath(); context.moveTo(0, 179); context.lineTo(WIDTH, 179); context.moveTo(0, 367); context.lineTo(WIDTH, 367); context.stroke();
    context.textAlign = 'center';
    context.fillStyle = '#c4444d';
    context.font = '900 15px ui-monospace';
    context.fillText(`PHASE ${overlay.actor.bossPhaseIndex + 1}`, WIDTH / 2, 228);
    context.fillStyle = '#f1eadf';
    context.font = '900 54px ui-monospace';
    context.fillText(overlay.phase.name, WIDTH / 2, 292);
    context.fillStyle = '#9ea49c';
    context.font = '700 12px ui-monospace';
    context.fillText(`${overlay.actor.data.name.toUpperCase()} · ${overlay.actor.data.signature.toUpperCase()}`, WIDTH / 2, 324);
    context.restore();
  }


  renderFatalityOverlay(context) {
    const fatality = this.fatality;
    if (!fatality) return;
    const attacker = this.actors[fatality.attackerIndex];
    const target = this.actors[fatality.targetIndex];
    const progress = clamp((fatality.total - fatality.timer) / fatality.total, 0, 1);
    const pulse = .5 + .5 * Math.sin(this.frame * .18);
    const effect = fatality.definition.effect || 'rust';
    context.save();
    context.fillStyle = `rgba(2,0,1,${.22 + Math.sin(Math.min(1, progress * 1.4) * Math.PI) * .42})`;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = '#020202';
    context.fillRect(0, 0, WIDTH, 82);
    context.fillRect(0, HEIGHT - 92, WIDTH, 92);

    if (effect === 'static' || effect === 'flicker' || effect === 'void') {
      context.globalCompositeOperation = 'screen';
      for (let y = 92; y < HEIGHT - 92; y += 8) {
        context.fillStyle = `rgba(224,221,200,${.012 + ((y + this.frame * 5) % 31 === 0 ? .09 : 0)})`;
        context.fillRect(0, y, WIDTH, 1 + (y % 3));
      }
    } else if (effect === 'blood' || effect === 'fire' || effect === 'rust') {
      const gradient = context.createRadialGradient(WIDTH / 2, FLOOR - 80, 20, WIDTH / 2, FLOOR - 80, 520);
      gradient.addColorStop(0, `rgba(155,26,33,${.09 + pulse * .12})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 82, WIDTH, HEIGHT - 174);
    } else if (effect === 'petals' || effect === 'spores') {
      context.globalCompositeOperation = 'screen';
      for (let index = 0; index < 26; index++) {
        const x = (index * 97 + this.frame * (1 + index % 4)) % WIDTH;
        const y = 100 + ((index * 43 + this.frame * 1.8) % (HEIGHT - 210));
        context.save(); context.translate(x, y); context.rotate(this.frame * .03 + index);
        context.fillStyle = 'rgba(181,74,96,.28)'; context.fillRect(-5, -1, 10, 3); context.restore();
      }
    } else if (effect === 'water' || effect === 'frost') {
      context.fillStyle = `rgba(71,111,123,${.045 + pulse * .055})`;
      context.fillRect(0, 82, WIDTH, HEIGHT - 174);
      context.strokeStyle = 'rgba(179,207,211,.16)';
      for (let index = 0; index < 7; index++) {
        context.beginPath(); context.ellipse(WIDTH / 2, FLOOR + index * 15, 120 + index * 75 + pulse * 12, 6 + index, 0, 0, TAU); context.stroke();
      }
    } else if (effect === 'chains') {
      context.strokeStyle = 'rgba(143,134,112,.34)'; context.lineWidth = 4;
      for (let index = 0; index < 7; index++) {
        const x = 70 + index * 190; const sway = Math.sin(this.frame * .025 + index) * 30;
        context.beginPath(); context.moveTo(x, 82); context.quadraticCurveTo(x + sway, HEIGHT * .45, x - sway * .4, HEIGHT - 92); context.stroke();
      }
    }
    context.globalCompositeOperation = 'source-over';

    context.textAlign = 'left';
    context.fillStyle = fatality.stageBased ? '#d5a86f' : '#b8303b';
    context.font = '900 12px ui-monospace';
    context.fillText(fatality.stageBased ? 'ENVIRONMENTAL JUDGMENT' : 'SIGNATURE JUDGMENT', 38, 36);
    context.fillStyle = '#f0e8db';
    context.font = '900 25px ui-monospace';
    context.fillText(String(fatality.definition.name || 'FATALITY').toUpperCase(), 38, 65);
    context.textAlign = 'right';
    context.fillStyle = '#969b94';
    context.font = '700 10px ui-monospace';
    context.fillText(`${attacker.data.name.toUpperCase()} → ${target.data.name.toUpperCase()}`, WIDTH - 38, 39);
    context.fillText(fatality.stageBased ? this.stage.name.toUpperCase() : attacker.data.game.toUpperCase(), WIDTH - 38, 59);

    const step = String(fatality.sequence[fatality.step] || '').replace(/[-_]/g, ' ').toUpperCase();
    context.textAlign = 'center';
    context.fillStyle = '#d8d0c3';
    context.font = '900 14px ui-monospace';
    context.fillText(step, WIDTH / 2, HEIGHT - 53);
    const segmentWidth = Math.min(580, WIDTH * .52) / fatality.sequence.length;
    const startX = WIDTH / 2 - segmentWidth * fatality.sequence.length / 2;
    for (let index = 0; index < fatality.sequence.length; index++) {
      context.fillStyle = index <= fatality.step ? (fatality.stageBased ? '#b88754' : '#9e2631') : '#242824';
      context.fillRect(startX + index * segmentWidth + 3, HEIGHT - 33, segmentWidth - 6, 4);
    }
    context.restore();
  }

  renderRitualOverlay(context) {
    if (this.ritual.id === 'none') return;
    context.save();
    if (this.ritual.id === 'denseFog') {
      const fog = context.createLinearGradient(0, 0, WIDTH, 0);
      fog.addColorStop(0, 'rgba(210,214,204,.08)'); fog.addColorStop(.5, 'rgba(220,220,210,.02)'); fog.addColorStop(1, 'rgba(210,214,204,.08)');
      context.fillStyle = fog; context.fillRect(0, 126, WIDTH, HEIGHT - 126);
    } else if (this.ritual.id === 'bloodDebt') {
      context.fillStyle = 'rgba(92,0,8,.045)'; context.fillRect(0, 126, WIDTH, HEIGHT - 126);
    } else if (this.ritual.id === 'staticStorm') {
      context.globalAlpha = .08 + this.world.radio * .08;
      context.fillStyle = '#e8eadf';
      for (let y = 130; y < HEIGHT; y += 7) context.fillRect(0, y + ((this.frame + y) % 5), WIDTH, 1);
    } else if (this.ritual.id === 'redJudgment') {
      context.fillStyle = 'rgba(112,0,8,.07)'; context.fillRect(0, 126, WIDTH, HEIGHT - 126);
    }
    context.restore();
  }

  renderPause(context) {
    const [p1, p2] = this.actors;
    context.save();
    context.fillStyle = 'rgba(1,2,1,.91)';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.textAlign = 'center';
    context.fillStyle = '#efe9dc';
    context.font = '900 58px ui-monospace';
    context.fillText('PAUSE', WIDTH / 2, 96);
    context.fillStyle = '#a7aca4';
    context.font = '700 12px ui-monospace';
    context.fillText('ÉCHAP / START POUR REPRENDRE · LISTE COMPLÈTE DANS ARCHIVES > MOVESETS', WIDTH / 2, 123);

    const drawMoveList = (actor, x, align) => {
      context.textAlign = align;
      context.fillStyle = '#b83b44';
      context.font = '900 16px ui-monospace';
      context.fillText(actor.data.name.toUpperCase(), x, 164);
      context.fillStyle = '#d8d1c4';
      context.font = '700 11px ui-monospace';
      context.fillText(`${actor.profile.trait.name} · ${actor.profile.affliction.name}`, x, 184);
      context.fillStyle = '#747d75';
      context.font = '700 9px ui-monospace';
      const summary = actor.profile.moveset.fidelitySummary;
      context.fillText(`${summary.direct} DIRECTS · ${summary.composite} COMPOSITES · ${summary.adapted} ADAPTATIONS`, x, 202);

      let y = 224;
      for (const key of actor.profile.moveset.order) {
        const move = actor.profile.moves[key];
        if (!move) continue;
        const label = `${move.input.padEnd(10, ' ')} ${move.name}`;
        context.fillStyle = move.fidelity === 'direct-canonical' ? '#e4ddd0' : move.fidelity === 'behavior-composite' ? '#b8b3a8' : '#8c918b';
        context.font = key === 'desperation' || key === 'super' ? '900 9px ui-monospace' : '700 8.5px ui-monospace';
        context.fillText(label, x, y);
        y += 21;
      }
    };
    drawMoveList(p1, 72, 'left');
    drawMoveList(p2, WIDTH - 72, 'right');

    context.textAlign = 'center';
    context.fillStyle = 'rgba(180,52,62,.16)';
    context.fillRect(WIDTH / 2 - 132, 160, 264, 438);
    context.strokeStyle = 'rgba(183,59,68,.38)';
    context.strokeRect(WIDTH / 2 - 132, 160, 264, 438);
    context.fillStyle = '#b83b44';
    context.font = '900 12px ui-monospace';
    context.fillText('PROTOCOLE DU SIGNAL', WIDTH / 2, 200);
    context.fillStyle = '#c7c2b6';
    context.font = '700 10px ui-monospace';
    const controls = ['L · ATTAQUE LÉGÈRE','H · ATTAQUE LOURDE','S · TECHNIQUE','T · SAISIE','← + T · PROJECTION ARRIÈRE','ESQUIVE + L · RIPOSTE','P-GUARD + H · CONTRE','RELEVÉE + S · REVERSAL','N · NIGHTMARE','≤30% HP + N · OTHERWORLD'];
    controls.forEach((line,index)=>context.fillText(line,WIDTH/2,234+index*31));
    context.restore();
  }

  renderMatchEnd(context) {
    const winner = this.winner;
    context.save();
    const alpha = clamp(this.resultTimer / 35, 0, .9);
    context.fillStyle = `rgba(2,3,2,${alpha})`;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.textAlign = 'center';
    context.fillStyle = '#9f2b34';
    context.font = '900 18px ui-monospace';
    context.fillText('MANIFESTATION DOMINANTE', WIDTH / 2, 230);
    context.fillStyle = '#f1ecdf';
    context.font = '900 62px ui-monospace';
    context.fillText((winner?.data.name || 'DRAW').toUpperCase(), WIDTH / 2, 308);
    if (winner) {
      const grade = chronicleGrade({ ...winner.stats, healthRatio: healthRatio(winner) });
      context.fillStyle = '#b73942';
      context.font = '900 36px ui-monospace';
      context.fillText(`RANG ${grade}`, WIDTH / 2, 356);
      context.fillStyle = '#a6aaa3';
      context.font = '700 13px ui-monospace';
      context.fillText(`${winner.stats.maxCombo} COMBO MAX · ${winner.stats.perfectGuards} GARDES PARFAITES · ${winner.stats.guardCounters} RIPOSTES · ${winner.stats.wakeupAttacks} RELEVÉES`, WIDTH / 2, 390);
      context.fillStyle = '#777f78';
      context.font = '700 10px ui-monospace';
      context.fillText(winner.profile.moveset.presentation.victory.toUpperCase(), WIDTH / 2, 410);
      if (this.lastFatality) {
        context.fillStyle = this.lastFatality.stageBased ? '#d0a36f' : '#b83b44';
        context.font = '900 11px ui-monospace';
        context.fillText(`${this.lastFatality.stageBased ? 'STAGE FATALITY' : 'FATALITY'} · ${this.lastFatality.name.toUpperCase()}`, WIDTH / 2, 434);
      }
    }
    context.fillStyle = '#858d86';
    context.font = '700 12px ui-monospace';
    context.fillText('LE DOSSIER DE RÉSULTAT EST DISPONIBLE HORS DE L’ARÈNE', WIDTH / 2, this.lastFatality ? 468 : 446);
    context.restore();
  }
}

export const CONTROL_LABELS = {
  p1: '← → mouvement · ↑ saut · ESPACE garde/parade · J frappe · K lourd · I technique · U saisie · O cauchemar · L esquive · ←+U projection arrière · esquive+J riposte · parade+K contre · relevée+I reversal',
  p2: 'Q D mouvement · Z saut · A garde/parade · F frappe · G lourd · H technique · R saisie · T cauchemar · V esquive · arrière+R projection · esquive+F riposte · parade+G contre · relevée+H reversal'
};
