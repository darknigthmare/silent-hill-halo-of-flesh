import { AFFLICTIONS, STAGE_HAZARDS, createCombatProfile, getRitualModifier } from './data.js';
import { drawHitboxOverlay, drawMonster, drawStage } from './renderers.js';
import { audio, clamp, loadSettings, seededRandom, vibrate } from './shared.js';

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

class InputState {
  constructor() {
    this.held = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.enabled = true;
    this.onDown = (event) => {
      if (!this.enabled) return;
      if (!this.held.has(event.code)) this.pressed.add(event.code);
      this.held.add(event.code);
      if ([...Object.values(P1_KEYS), ...Object.values(P2_KEYS)].includes(event.code)) event.preventDefault();
    };
    this.onUp = (event) => {
      this.held.delete(event.code);
      this.released.add(event.code);
    };
    addEventListener('keydown', this.onDown, { passive: false });
    addEventListener('keyup', this.onUp);
  }

  isDown(code) { return this.held.has(code); }
  wasPressed(code) { return this.pressed.has(code); }
  wasReleased(code) { return this.released.has(code); }
  endFrame() { this.pressed.clear(); this.released.clear(); }
  destroy() {
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
    statusesApplied: 0,
    maxCombo: 0,
    hazardsTaken: 0,
    bossPhasesTriggered: 0,
    ritualDamage: 0
  };
}

function makeActor(data, index, ritual = {}) {
  const rawProfile = createCombatProfile(data);
  const profile = {
    ...rawProfile,
    speed: rawProfile.speed * (ritual.speedScale || 1),
    guard: Math.round(rawProfile.guard * (ritual.guardScale || 1))
  };
  const scale = clamp(data.visual.scale || 1, .62, 1.62);
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
    guardBreak: 0,
    combo: 0,
    comboTimer: 0,
    hitFlash: 0,
    ko: false,
    koProgress: 0,
    roundWins: 0,
    lastHitBy: null,
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
    stats: emptyStats()
  };
}

function actorBox(actor) {
  const baseW = clamp(72 * actor.scale, 48, 126);
  const baseH = clamp(188 * actor.scale, 122, 300);
  const crouchScale = actor.crouching ? .7 : 1;
  const lowProfile = actor.crouching || actor.data.visual.kind === 'insect' || actor.data.visual.kind === 'quadruped'
    ? actor.profile.lowProfile
    : 1;
  const h = baseH * crouchScale * lowProfile;
  const w = baseW * (lowProfile < 1 ? .92 : 1);
  return { x: actor.x - w / 2, y: actor.y - h, w, h };
}

function attackBox(actor, move) {
  const h = move.level === 'low' ? 58 : move.level === 'throw' ? 125 : 105;
  const y = actor.y - (move.level === 'low' ? 45 : move.level === 'throw' ? 135 : 150);
  const reach = clamp(move.reach, 48, 940);
  return actor.facing > 0
    ? { x: actor.x + 22, y, w: reach, h }
    : { x: actor.x - 22 - reach, y, w: reach, h };
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

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

export function chronicleGrade(stats = {}) {
  const health = clamp(stats.healthRatio ?? 0, 0, 1);
  const combo = Math.max(0, stats.maxCombo || 0);
  const guards = Math.max(0, stats.perfectGuards || 0);
  const hazards = Math.max(0, stats.hazardsTaken || 0);
  const score = health * 62 + Math.min(18, combo * 2.5) + Math.min(16, guards * 4) - Math.min(20, hazards * 5);
  if (score >= 86) return 'S';
  if (score >= 72) return 'A';
  if (score >= 56) return 'B';
  if (score >= 40) return 'C';
  return 'D';
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
    this.input = new InputState();
    this.running = false;
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
    this.winner = null;
    this.resultTimer = 0;
    this.rng = seededRandom(this.config.seed);
    this.touch = { p1: {}, p2: {} };
    this.callbacks = { onMatchEnd: () => {}, onRoundEnd: () => {}, onState: () => {}, ...config.callbacks };
    this.gamepadPrev = [];
    this.currentPads = [];
    this.playerPattern = { light: 0, heavy: 0, low: 0, special: 0, throw: 0, super: 0 };
    this.inputHistory = [];
    const ritualOtherworld = Boolean(this.ritual.startOtherworld);
    this.world = {
      phase: ritualOtherworld ? 'otherworld' : 'fog',
      amount: ritualOtherworld ? 1 : 0,
      triggered: ritualOtherworld,
      siren: 0,
      hazardTimer: 260,
      radio: 0,
      hazardsTriggered: 0
    };
    this.boundLoop = (time) => this.loop(time);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.boundLoop);
    audio.ensure();
  }

  destroy() {
    this.running = false;
    this.input.destroy();
  }

  togglePause(force) {
    this.paused = typeof force === 'boolean' ? force : !this.paused;
    this.callbacks.onState(this.snapshot());
  }

  setTrainingOptions(options = {}) {
    Object.assign(this.config, options);
    if (this.config.freeMeter) this.actors.forEach((actor) => { actor.meter = 100; });
  }

  setTouch(player, action, value) {
    if (this.touch[player]) this.touch[player][action] = value;
  }

  forceOtherworldShift() {
    if (!this.world.triggered) this.triggerOtherworldShift();
    else { this.world.phase = 'otherworld'; this.world.amount = 1; this.world.siren = 0; }
    this.callbacks.onState(this.snapshot());
  }

  resetMatch() {
    this.round = 1;
    this.actors.forEach((actor) => {
      actor.roundWins = 0;
      actor.stats = emptyStats();
    });
    this.winner = null;
    this.resetRound(true);
  }

  resetRound(full = false) {
    this.projectiles.length = 0;
    this.particles.length = 0;
    this.texts.length = 0;
    this.hazards.length = 0;
    this.matchTime = this.config.timeLimit === 0 ? Infinity : this.config.timeLimit;
    this.phase = 'intro';
    this.phaseTimer = 145;
    this.superOverlay = null;
    this.flash = 0;
    this.hitstop = 0;
    const ritualOtherworld = Boolean(this.ritual.startOtherworld);
    this.world = {
      phase: ritualOtherworld ? 'otherworld' : 'fog', amount: ritualOtherworld ? 1 : 0, triggered: ritualOtherworld, siren: 0,
      hazardTimer: Math.round((230 + Math.floor(this.rng() * 80)) * (this.ritual.hazardIntervalScale || 1)), radio: 0, hazardsTriggered: 0
    };
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
      actor.attack = null;
      actor.hurtFrames = 0;
      actor.invuln = 0;
      actor.stun = 0;
      actor.dodgeCooldown = 0;
      actor.guardBreak = 0;
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
      actor.moveVariety.clear();
    });
    this.callbacks.onState(this.snapshot());
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(.05, (now - this.lastTime) / 1000 || 0);
    this.lastTime = now;
    if (!this.paused) {
      this.accumulator += dt;
      while (this.accumulator >= STEP) {
        this.update();
        this.accumulator -= STEP;
      }
    }
    this.render(now);
    requestAnimationFrame(this.boundLoop);
  }

  update() {
    this.frame++;
    if (this.hitstop > 0) {
      this.hitstop--;
      this.input.endFrame();
      return;
    }
    this.updateGamepads();

    if (this.phase === 'intro') {
      this.phaseTimer--;
      if (this.phaseTimer === 90) this.addText(`ROUND ${this.round}`, WIDTH / 2, 280, 'round');
      if (this.phaseTimer === 30) this.addText('FIGHT', WIDTH / 2, 315, 'fight');
      if (this.phaseTimer <= 0) {
        this.phase = 'fight';
        this.actors.forEach((actor) => { actor.state = 'idle'; });
      }
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
        this.endRound(p1.health === p2.health ? null : (p1.health > p2.health ? p1 : p2), 'TIME');
      }
    }

    this.updateWorld();
    this.applyRitualTick();
    this.actors.forEach((actor) => this.updateStatus(actor));
    this.checkBossPhases();
    this.updateActor(this.actors[0], 0);
    this.updateActor(this.actors[1], 1);
    this.resolveBodyCollision();
    this.updateProjectiles();
    this.updateHazards();
    this.updateEffects();

    this.actors.forEach((actor) => {
      if (actor.health <= 0 && !actor.ko) {
        actor.health = 0;
        actor.ko = true;
        actor.state = 'ko';
        audio.ko();
        vibrate([45, 25, 90]);
        this.endRound(this.actors[1 - actor.index], 'K.O.');
      }
    });
    this.callbacks.onState(this.snapshot());
    this.input.endFrame();
  }

  getControls(index) {
    const map = index === 0 ? P1_KEYS : P2_KEYS;
    const touch = this.touch[index === 0 ? 'p1' : 'p2'] || {};
    const ai = index === 1 && this.config.mode !== 'local' && !this.config.training;
    if (ai) return this.computeAI(this.actors[index], this.actors[1 - index]);

    const pad = this.readGamepad(index);
    const held = (action) => this.input.isDown(map[action]) || Boolean(touch[action]) || Boolean(pad?.held?.[action]);
    const pressed = (action) => this.input.wasPressed(map[action]) || touch[action] === 'pressed' || Boolean(pad?.pressed?.[action]);
    const released = (action) => this.input.wasReleased(map[action]) || Boolean(pad?.released?.[action]);
    const controls = {
      left: held('left'), right: held('right'), down: held('down'), guard: held('guard'),
      guardPressed: pressed('guard'), guardReleased: released('guard'), jump: pressed('jump'),
      light: pressed('light'), heavy: pressed('heavy'), special: pressed('special'), throw: pressed('throw'),
      super: pressed('super'), dodge: pressed('dodge')
    };
    for (const action of [...ATTACK_ACTIONS, 'jump', 'dodge']) {
      if (touch[action] === 'pressed') touch[action] = true;
    }
    return controls;
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
        intent[toward] = true;
        if (['zoner', 'artillery', 'flyer', 'ghost', 'trickster'].includes(actor.data.archetype) && this.rng() < .55) intent.special = true;
      } else if (distance < preferred - 55 && ['zoner', 'artillery', 'ghost', 'trickster'].includes(actor.data.archetype)) {
        intent[away] = true;
        if (this.rng() < .24) intent.dodge = true;
        else if (this.rng() < .42) intent.light = true;
      } else if (distance < 78 && ['grappler', 'juggernaut', 'boss'].includes(actor.data.archetype) && this.rng() < .45) {
        intent.throw = true;
      } else if (this.rng() < diff.attack) {
        const roll = this.rng();
        if (actor.meter >= 100 && roll > .84) intent.super = true;
        else if (roll > .68) intent.heavy = true;
        else if (roll > .37) intent.special = true;
        else intent.light = true;
      } else if (distance > preferred) intent[toward] = true;
      else intent[away] = true;

      if (['flyer', 'trickster'].includes(actor.data.archetype) && this.rng() < .12) intent.jump = true;
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
    const enemy = this.actors[1 - index];
    const controls = this.getControls(index);
    const profile = actor.profile;

    actor.hitFlash = Math.max(0, actor.hitFlash - 1);
    actor.invuln = Math.max(0, actor.invuln - 1);
    actor.dodgeCooldown = Math.max(0, actor.dodgeCooldown - 1);
    actor.comboTimer = Math.max(0, actor.comboTimer - 1);
    actor.parryWindow = Math.max(0, actor.parryWindow - 1);
    actor.armorCooldown = Math.max(0, actor.armorCooldown - 1);
    actor.traitPulse = Math.max(0, actor.traitPulse - 1);
    if (actor.comboTimer === 0) actor.combo = 0;
    if (this.config.freeMeter) actor.meter = 100;
    if (this.config.autoHeal && this.frame % 30 === 0 && actor.health < actor.maxHealth) actor.health = Math.min(actor.maxHealth, actor.health + 4);

    if (actor.phaseLock > 0) {
      actor.phaseLock--;
      actor.state = 'phase';
      actor.vx *= .72;
      if (actor.phaseLock % 7 === 0) this.spawnImpact(actor.x + (this.rng() - .5) * 80, actor.y - 120 - this.rng() * 80, actor.data.visual.accent, false, 5);
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

    if (controls.guardPressed && actor.grounded) {
      actor.parryWindow = 7;
      this.logInput(actor, 'GARDE');
    }
    actor.blocking = Boolean(controls.guard && actor.grounded);
    actor.crouching = Boolean(controls.down && actor.grounded && !actor.blocking);
    actor.state = actor.blocking ? 'block' : actor.crouching ? 'crouch' : 'idle';

    if (controls.dodge && actor.dodgeCooldown === 0 && canDodge(actor)) {
      actor.state = 'dodge';
      this.logInput(actor, 'ESQUIVE');
      actor.invuln = profile.dodgeInvuln;
      actor.dodgeCooldown = 42;
      actor.vx = -actor.facing * (10.2 + (profile.trait.id === 'falsePresence' ? 1.4 : 0));
      this.spawnDust(actor.x, actor.y);
      audio.tone({ freq: 110, duration: .1, gain: .025, slide: 90 });
    } else if (controls.jump && actor.grounded) {
      actor.vy = -profile.jump;
      this.logInput(actor, 'SAUT');
      actor.grounded = false;
      actor.state = 'jump';
      audio.tone({ freq: 90, duration: .06, gain: .018, slide: 40 });
    } else if (controls.super && actor.meter >= 100) this.beginAttack(actor, 'super');
    else if (controls.throw) this.beginAttack(actor, 'throw');
    else if (controls.special) this.beginAttack(actor, 'special');
    else if (controls.heavy) this.beginAttack(actor, 'heavy');
    else if (controls.light) this.beginAttack(actor, controls.down ? 'low' : 'light');
    else if (!actor.blocking && !actor.crouching) {
      let movement = 0;
      if (controls.left) movement--;
      if (controls.right) movement++;
      if (movement) {
        const speed = profile.speed * actor.phaseSpeed * statusSpeed(actor);
        actor.vx = movement * speed;
        actor.state = actor.grounded ? 'walk' : 'jump';
        const advancing = Math.sign(enemy.x - actor.x) === movement;
        if (advancing && profile.trait.forwardMeter && this.frame % 8 === 0) {
          actor.meter = clamp(actor.meter + profile.trait.forwardMeter * 8, 0, 100);
          actor.traitPulse = 8;
        }
      } else actor.vx *= actor.grounded ? .68 : .98;
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
        if (!actor.attack && actor.hurtFrames === 0) actor.state = 'idle';
        this.spawnDust(actor.x, actor.y);
      }
    }
    actor.x += actor.vx;
    const inset = clamp(this.ritual.arenaInset || 70, 70, 260);
    actor.x = clamp(actor.x, inset, WIDTH - inset);
    if (actor.grounded && actor.state !== 'dodge') actor.vx *= actor.status?.id === 'frost' ? .91 : .84;
  }

  beginAttack(actor, key, { cancelled = false } = {}) {
    const move = actor.profile.moves[key];
    if (!move) return false;
    if (key === 'super') {
      const ritualCost = Math.round(move.meterCost * (this.ritual.superCostScale || 1));
      if (actor.meter < ritualCost) return false;
      actor.meter -= ritualCost;
      this.superOverlay = { actor, timer: 50, name: move.name };
      audio.super();
      vibrate([20, 25, 20, 25, 55]);
    }
    actor.attack = { key, move, frame: cancelled ? 2 : 0, spawned: false, hit: false, id: ++actor.attackId, cancelled };
    actor.state = 'attack';
    actor.blocking = false;
    actor.crouching = false;
    if (key === 'throw') actor.vx = actor.facing * 2.2;
    if (key === 'throw') actor.stats.throws++;

    if (actor.profile.trait.meterVariety && !actor.moveVariety.has(key)) {
      actor.moveVariety.add(key);
      actor.meter = clamp(actor.meter + actor.profile.trait.meterVariety * 100, 0, 100);
      actor.traitPulse = 16;
      if (actor.moveVariety.size >= 4) actor.moveVariety.clear();
    }
    actor.lastMoveKey = key;
    this.logInput(actor, move.name);
    if (actor.index === 0 && Object.prototype.hasOwnProperty.call(this.playerPattern, key)) this.playerPattern[key]++;
    return true;
  }

  updateAttack(actor, enemy, controls) {
    const attack = actor.attack;
    const move = attack.move;
    attack.frame++;
    const total = move.startup + move.active + move.recovery;

    if (move.projectile && !attack.spawned && attack.frame >= move.startup) {
      attack.spawned = true;
      this.spawnProjectile(actor, move, attack.id);
    }
    if (!move.projectile && attack.frame >= move.startup && attack.frame < move.startup + move.active && !attack.hit) {
      if (intersects(attackBox(actor, move), actorBox(enemy))) {
        attack.hit = true;
        this.applyHit(actor, enemy, move, attack.id);
      }
    }

    if (attack.key === 'heavy' && attack.frame < move.startup) actor.vx = actor.facing * 1.8;
    if (attack.key === 'special' && !move.projectile && attack.frame < move.startup + move.active) actor.vx = actor.facing * 3.1;
    if (attack.key === 'super' && !move.projectile && attack.frame < move.startup + move.active) actor.vx = actor.facing * 4.1;

    const cancelStart = move.startup + Math.max(1, move.active - 1);
    const cancelEnd = cancelStart + actor.profile.cancelWindow;
    if (attack.hit && attack.frame >= cancelStart && attack.frame <= cancelEnd && move.cancelInto?.length) {
      const requested = controls.special ? 'special' : controls.heavy ? 'heavy' : controls.light ? 'light' : null;
      if (requested && move.cancelInto.includes(requested)) {
        this.addText('CHAIN', actor.x, actorBox(actor).y - 18, 'chain');
        this.beginAttack(actor, requested, { cancelled: true });
        return;
      }
    }

    if (attack.frame >= total) {
      actor.attack = null;
      actor.state = actor.grounded ? 'idle' : 'jump';
      actor.vx *= .45;
    }
  }

  spawnProjectile(actor, move, attackId) {
    const isSuper = actor.attack?.key === 'super';
    const count = isSuper ? 3 : (actor.profile.trait.id === 'suppression' ? 2 : 1);
    const scale = move.projectileScale || 1;
    for (let index = 0; index < count; index++) {
      this.projectiles.push({
        owner: actor,
        attackId,
        move,
        x: actor.x + actor.facing * (55 + index * 22),
        y: actor.y - (115 + index * 28),
        vx: actor.facing * (move.projectileSpeed || 13) * (1 - index * .08),
        vy: (index - (count - 1) / 2) * .8,
        radius: (isSuper ? 18 : 12) * scale,
        life: isSuper ? 90 : 72,
        super: isSuper,
        color: actor.data.visual.accent,
        hit: false
      });
    }
    audio.tone({ freq: isSuper ? 85 : 150, duration: .1, gain: .04, slide: isSuper ? 120 : 40 });
  }

  updateProjectiles() {
    for (const projectile of this.projectiles) {
      projectile.x += projectile.vx;
      projectile.y += projectile.vy;
      projectile.life--;
      if (projectile.super) projectile.vy += Math.sin((90 - projectile.life) * .22) * .035;
      const enemy = this.actors[1 - projectile.owner.index];
      if (!projectile.hit && enemy.invuln === 0) {
        const box = { x: projectile.x - projectile.radius, y: projectile.y - projectile.radius, w: projectile.radius * 2, h: projectile.radius * 2 };
        if (intersects(box, actorBox(enemy))) {
          projectile.hit = true;
          projectile.life = 0;
          this.applyHit(projectile.owner, enemy, projectile.move, projectile.attackId, projectile.super ? 1.06 : .92);
        }
      }
    }
    this.projectiles = this.projectiles.filter((projectile) => projectile.life > 0 && projectile.x > -80 && projectile.x < 1360);
  }

  applyHit(attacker, target, move, attackId, scale = 1) {
    if (target.invuln > 0 || target.ko) return;
    const isThrow = move.level === 'throw';
    const blocked = target.blocking && !isThrow && target.grounded;
    const counter = Boolean(target.attack && target.attack.frame <= target.attack.move.startup + 1);
    const guardScale = attacker.profile.trait.guardDamage || 1;
    let ritualDamage = this.ritual.damageScale || 1;
    if (move === attacker.profile.moves.special) ritualDamage *= this.ritual.specialDamageScale || 1;
    if (move === attacker.profile.moves.super) ritualDamage *= this.ritual.superDamageScale || 1;
    if (attacker.data.boss) ritualDamage *= this.ritual.bossPowerScale || 1;
    let damage = Math.round(move.damage * scale * (counter ? 1.18 : 1) * ritualDamage * actorPhasePower(attacker));

    if (blocked) {
      const perfect = target.parryWindow > 0;
      const guardDamage = Math.max(6, Math.round(damage * (perfect ? .1 : .34) * guardScale));
      target.guard -= guardDamage;
      if (perfect) {
        target.stats.perfectGuards++;
        target.meter = clamp(target.meter + 14, 0, 100);
        attacker.meter = clamp(attacker.meter + 2, 0, 100);
        attacker.hurtFrames = Math.max(attacker.hurtFrames, 11);
        attacker.vx = -attacker.facing * 5;
        this.addText('PERFECT GUARD', target.x, target.y - 245, 'perfect');
        this.hitstop = 6;
        this.shake = Math.max(this.shake, 5);
        audio.perfectGuard?.();
      } else {
        const chip = Math.round(damage * .14 * (this.ritual.chipScale || 1));
        target.health -= chip;
        target.stats.damageTaken += chip;
        attacker.stats.damageDealt += chip;
        target.meter = clamp(target.meter + 5 * (this.ritual.meterGainScale || 1), 0, 100);
        attacker.meter = clamp(attacker.meter + (move.meter || 0) * .45 * attacker.profile.meterGain * (this.ritual.meterGainScale || 1), 0, 100);
        target.vx = attacker.facing * (move.knockback || 4) * .42;
        this.hitstop = 3;
      }
      audio.guard();
      this.spawnImpact(target.x, target.y - 115, target.data.visual.accent, true);
      if (target.guard <= 0) {
        target.guard = 0;
        target.guardBreak = 70;
        target.blocking = false;
        this.addText('GUARD BREAK', target.x, target.y - 240, 'break');
        audio.tone({ freq: 70, duration: .35, gain: .06, slide: 190 });
      }
      return;
    }

    const armorActive = target.armorCooldown === 0 && (
      target.profile.trait.id === 'rustArmor' ||
      (target.profile.trait.id === 'nightmareArmor' && healthRatio(target) > .33)
    );
    damage = Math.round(damage * (1 - clamp((target.profile.armor || 0) + (target.phaseArmor || 0), 0, .45)));
    target.health -= damage;
    attacker.stats.damageDealt += damage;
    target.stats.damageTaken += damage;
    if (counter) {
      attacker.stats.counters++;
      this.addText('COUNTER', target.x, target.y - 226, 'counter');
    }

    let hitstun = move === attacker.profile.moves.super ? 38 : move === attacker.profile.moves.heavy ? 24 : 14;
    hitstun = Math.round(hitstun * (target.profile.hitstunScale || 1) * (counter ? 1.22 : 1));
    if (armorActive) {
      target.armorCooldown = target.profile.trait.armorCooldown || 240;
      hitstun = Math.max(7, Math.round(hitstun * .55));
      this.addText(target.profile.trait.id === 'rustArmor' ? 'RUST ARMOR' : 'NIGHTMARE ARMOR', target.x, target.y - 246, 'armor');
    }
    target.hurtFrames = hitstun;
    target.invuln = 4;
    target.hitFlash = 7;
    target.vx = attacker.facing * (move.knockback || 6) * (armorActive ? .45 : 1);
    if (move.level === 'low') target.vy = -2.5;
    if (move.level === 'throw') {
      target.vy = -6.5;
      target.grounded = false;
    }

    const gainScale = statusMeterScale(attacker);
    attacker.meter = clamp(attacker.meter + (move.meter || 0) * attacker.profile.meterGain * gainScale * (this.ritual.meterGainScale || 1), 0, 100);
    target.meter = clamp(target.meter + Math.max(6, (move.meter || 0) * .55) * (this.ritual.meterGainScale || 1), 0, 100);
    attacker.combo++;
    attacker.comboTimer = 72;
    attacker.stats.maxCombo = Math.max(attacker.stats.maxCombo, attacker.combo);
    target.lastHitBy = attacker.index;

    if (move.effect) this.applyStatus(target, move.effect, attacker);

    this.shake = Math.max(this.shake, move === attacker.profile.moves.super ? 18 : move === attacker.profile.moves.heavy ? 10 : 6);
    this.flash = move === attacker.profile.moves.super ? 9 : 3;
    this.hitstop = move === attacker.profile.moves.super ? 11 : move === attacker.profile.moves.heavy ? 7 : 4;
    audio.hit(move === attacker.profile.moves.super ? 1.8 : move === attacker.profile.moves.heavy ? 1.25 : .85);
    vibrate(move === attacker.profile.moves.super ? [35, 20, 55] : [18]);
    this.spawnImpact(target.x, target.y - 125, attacker.data.visual.accent, false, move === attacker.profile.moves.super ? 26 : 14);
    if (attacker.combo > 1) this.addText(`${attacker.combo} HITS`, attacker.x, actorBox(attacker).y - 22, 'combo');
  }

  applyStatus(target, effect, source = null) {
    const definition = AFFLICTIONS[effect.id];
    if (!definition) return;
    const duration = Math.round((effect.duration || definition.duration) * (effect.potency || 1));
    if (target.status?.id === effect.id) {
      target.status.timer = Math.max(target.status.timer, duration);
      target.status.potency = Math.max(target.status.potency, effect.potency || 1);
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
    if (actor.ko || this.phase !== 'fight') return;
    actor.health -= damage;
    actor.stats.damageTaken += damage;
    actor.hitFlash = Math.max(actor.hitFlash, 2);
    this.spawnImpact(actor.x, actor.y - 100, AFFLICTIONS[actor.status?.id]?.color || '#a8323d', false, 4);
  }

  updateWorld() {
    const [p1, p2] = this.actors;
    const distance = Math.abs(p1.x - p2.x);
    const attackNoise = p1.attack || p2.attack ? .22 : 0;
    const radioScale = this.ritual.radioDisabled ? 0 : (this.ritual.radioScale || 1);
    this.world.radio = clamp((1 - distance / 620 + this.world.amount * .34 + attackNoise) * radioScale, 0, 1);

    if (this.config.otherworldShift && !this.world.triggered && this.frame > 260) {
      const lowHealth = Math.min(healthRatio(p1), healthRatio(p2)) <= (this.ritual.shiftThreshold || .58);
      const lateTimer = Number.isFinite(this.matchTime) && this.config.timeLimit > 0 && this.matchTime <= this.config.timeLimit * .58;
      const finalRound = this.round >= this.config.roundsToWin * 2 - 1;
      if (lowHealth || lateTimer || finalRound) this.triggerOtherworldShift();
    }

    if (this.world.phase === 'shifting') {
      this.world.amount = clamp(this.world.amount + 1 / 150, 0, 1);
      this.world.siren--;
      if (this.world.amount >= 1) this.world.phase = 'otherworld';
    }

    if (this.config.stageHazards && this.world.amount >= .55) {
      this.world.hazardTimer--;
      if (this.world.hazardTimer <= 0) {
        this.spawnHazard();
        this.world.hazardTimer = Math.round((250 + Math.floor(this.rng() * 170)) * (this.ritual.hazardIntervalScale || 1));
      }
    }
  }

  triggerOtherworldShift() {
    this.world.triggered = true;
    this.world.phase = 'shifting';
    this.world.siren = 150;
    this.addText('SIREN — OTHERWORLD SHIFT', WIDTH / 2, 238, 'shift');
    audio.siren?.();
    vibrate([40, 45, 40, 45, 80]);
    this.flash = 7;
  }

  spawnHazard() {
    const id = this.stage?.hazard && STAGE_HAZARDS[this.stage.hazard] ? this.stage.hazard : 'staticBurst';
    const profile = STAGE_HAZARDS[id];
    const target = this.actors[Math.floor(this.rng() * this.actors.length)];
    const spread = (this.rng() - .5) * 250;
    const inset = clamp(this.ritual.arenaInset || 120, 120, 280);
    const x = clamp(target.x + spread, inset, WIDTH - inset);
    this.hazards.push({ id, profile, x, y: FLOOR, timer: profile.telegraph, maxTimer: profile.telegraph, active: 0, resolved: false });
    this.world.hazardsTriggered++;
  }

  updateHazards() {
    for (const hazard of this.hazards) {
      if (hazard.timer > 0) {
        hazard.timer--;
        if (hazard.timer === 0) {
          hazard.active = 34;
          this.resolveHazard(hazard);
        }
      } else if (hazard.active > 0) hazard.active--;
    }
    this.hazards = this.hazards.filter((hazard) => hazard.timer > 0 || hazard.active > 0);
  }

  resolveHazard(hazard) {
    if (hazard.resolved) return;
    hazard.resolved = true;
    for (const actor of this.actors) {
      const distance = Math.abs(actor.x - hazard.x);
      if (distance > hazard.profile.radius || actor.invuln > 0) continue;
      const guarded = actor.blocking && actor.grounded;
      const damage = Math.round(hazard.profile.damage * (this.ritual.hazardDamageScale || 1) * (guarded ? .28 : 1));
      actor.health -= damage;
      actor.stats.damageTaken += damage;
      actor.stats.hazardsTaken++;
      actor.hitFlash = 6;
      actor.hurtFrames = guarded ? 5 : 16;
      actor.vx = (actor.x >= hazard.x ? 1 : -1) * (guarded ? 3 : 8);
      if (hazard.profile.effect) this.applyStatus(actor, { id: hazard.profile.effect, duration: AFFLICTIONS[hazard.profile.effect]?.duration || 120, potency: .8 });
      this.spawnImpact(actor.x, actor.y - 80, AFFLICTIONS[hazard.profile.effect]?.color || '#b24a42', false, 18);
    }
    this.shake = Math.max(this.shake, 11);
    this.flash = 5;
    audio.hazard?.();
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
      if (!actor.data.boss || !actor.bossPhases.length || actor.ko) continue;
      const next = actor.bossPhases[actor.bossPhaseIndex + 1];
      if (next && healthRatio(actor) <= next.threshold) this.advanceBossPhase(actor, next);
    }
  }

  forceBossPhase(index = 1) {
    const actor = this.actors[index]?.data.boss ? this.actors[index] : this.actors.find((entry) => entry.data.boss);
    if (!actor) return false;
    const next = actor.bossPhases[actor.bossPhaseIndex + 1];
    if (!next) return false;
    this.advanceBossPhase(actor, next, true);
    this.callbacks.onState(this.snapshot());
    return true;
  }

  advanceBossPhase(actor, phase, forced = false) {
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
    const minimum = 55 * (p1.scale + p2.scale) * .5;
    const delta = p2.x - p1.x;
    if (Math.abs(delta) < minimum) {
      const push = (minimum - Math.abs(delta)) * .5 * (delta >= 0 ? 1 : -1);
      p1.x = clamp(p1.x - push, 70, 1210);
      p2.x = clamp(p2.x + push, 70, 1210);
    }
  }

  spawnImpact(x, y, color, guard = false, count = 14) {
    for (let index = 0; index < count; index++) {
      const angle = this.rng() * TAU;
      const speed = 2 + this.rng() * 9;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (guard ? 0 : 2),
        life: 18 + this.rng() * 22,
        max: 40,
        size: 2 + this.rng() * 5,
        color: guard ? '#d8d5c9' : color,
        kind: guard ? 'spark' : 'blood'
      });
    }
  }

  spawnDust(x, y) {
    for (let index = 0; index < 8; index++) {
      this.particles.push({
        x: x + (this.rng() - .5) * 38,
        y: y - 5,
        vx: (this.rng() - .5) * 3,
        vy: -this.rng() * 2,
        life: 18 + this.rng() * 12,
        max: 30,
        size: 5 + this.rng() * 9,
        color: '#aaa696',
        kind: 'dust'
      });
    }
  }

  addText(text, x, y, kind = 'default') {
    const persistent = ['round', 'fight', 'shift'].includes(kind);
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
      if (!['round', 'fight', 'shift'].includes(text.kind)) text.y -= .45;
      text.life--;
    }
    this.texts = this.texts.filter((text) => text.life > 0);
    for (const actor of this.actors) {
      const decay = actor.status?.id === 'decay';
      if (!actor.blocking && !decay && actor.guard < actor.maxGuard && this.frame % 5 === 0) {
        actor.guard = Math.min(actor.maxGuard, actor.guard + (this.ritual.guardRegenScale || 1));
      }
    }
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
    const matchWinner = this.actors.find((actor) => actor.roundWins >= this.config.roundsToWin);
    if (matchWinner) {
      this.phase = 'matchEnd';
      this.winner = matchWinner;
      this.resultTimer = 0;
      const loser = this.actors[1 - matchWinner.index];
      this.callbacks.onMatchEnd({
        winner: matchWinner.data,
        loser: loser.data,
        rounds: this.round,
        snapshot: this.snapshot(),
        stats: {
          winner: { ...matchWinner.stats, healthRatio: healthRatio(matchWinner), grade: chronicleGrade({ ...matchWinner.stats, healthRatio: healthRatio(matchWinner) }) },
          loser: { ...loser.stats, healthRatio: healthRatio(loser) },
          worldShiftTriggered: this.world.triggered,
          hazardsTriggered: this.world.hazardsTriggered
        }
      });
    } else {
      this.round++;
      this.resetRound(false);
    }
  }

  updateGamepads() {
    const pads = navigator.getGamepads?.() || [];
    this.currentPads = [pads[0], pads[1]];
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
      left: axes[0] < -.35 || down(14),
      right: axes[0] > .35 || down(15),
      down: axes[1] > .45 || down(13),
      guard: down(4) || down(5)
    };
    const pressedActions = {
      guard: pressed(4) || pressed(5),
      jump: pressed(0) || pressed(12),
      light: pressed(2), heavy: pressed(3), special: pressed(1), throw: pressed(6), super: pressed(7), dodge: pressed(8)
    };
    const releasedActions = { guard: released(4) || released(5) };
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
      stats: { ...actor.stats }
    });
    return {
      phase: this.phase,
      round: this.round,
      time: this.matchTime,
      p1: actorSnapshot(p1),
      p2: actorSnapshot(p2),
      world: { ...this.world },
      ritual: { id: this.ritual.id, name: this.ritual.name },
      inputHistory: [...this.inputHistory],
      winner: this.winner?.data?.name || null,
      paused: this.paused
    };
  }

  render(time) {
    const context = this.ctx;
    context.save();
    const allowShake = !this.settings.reducedMotion && this.settings.screenShake !== false;
    const shakeX = allowShake && this.shake ? (this.rng() - .5) * this.shake : 0;
    const shakeY = allowShake && this.shake ? (this.rng() - .5) * this.shake * .5 : 0;
    context.translate(shakeX, shakeY);
    drawStage(context, this.stage, time, {
      width: WIDTH,
      height: HEIGHT,
      cinematic: Boolean(this.superOverlay),
      otherworld: this.world.amount,
      radio: this.config.radioWarning ? this.world.radio : 0
    });
    this.renderHazards(context, time);
    this.renderProjectiles(context);
    const sortedActors = [...this.actors].sort((left, right) => left.y - right.y);
    for (const actor of sortedActors) {
      const attackProgress = actor.attack
        ? clamp((actor.attack.frame - actor.attack.move.startup * .5) / (actor.attack.move.active + actor.attack.move.startup), 0, 1)
        : 0;
      drawMonster(context, actor.data, actor.x, actor.y, {
        facing: actor.facing,
        state: {
          moving: actor.state === 'walk', crouching: actor.crouching, attackProgress,
          hurt: actor.hurtFrames > 0, hitFlash: actor.hitFlash > 0, ko: actor.ko, koProgress: actor.koProgress,
          status: actor.status?.id || null, traitPulse: actor.traitPulse
        },
        time,
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
    this.renderHUD(context);
    this.renderTexts(context);
    if (this.superOverlay) this.renderSuperOverlay(context);
    if (this.bossPhaseOverlay) this.renderBossPhaseOverlay(context);
    this.renderRitualOverlay(context);
    if (this.paused) this.renderPause(context);
    if (this.phase === 'matchEnd') this.renderMatchEnd(context);
    if (this.flash) {
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
    for (const hazard of this.hazards) {
      const progress = hazard.timer > 0 ? 1 - hazard.timer / hazard.maxTimer : 1;
      const pulse = .55 + Math.sin(time * .012) * .25;
      context.save();
      context.translate(hazard.x, FLOOR + 2);
      if (hazard.timer > 0) {
        context.strokeStyle = `rgba(184,58,68,${.28 + progress * .5})`;
        context.lineWidth = 3 + progress * 4;
        context.setLineDash([12, 9]);
        context.beginPath();
        context.ellipse(0, 0, hazard.profile.radius * (.45 + progress * .55), 24 + progress * 8, 0, 0, TAU);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = `rgba(142,36,43,${.05 + progress * .12})`;
        context.beginPath();
        context.ellipse(0, 0, hazard.profile.radius, 34, 0, 0, TAU);
        context.fill();
        context.textAlign = 'center';
        context.fillStyle = `rgba(239,225,210,${pulse})`;
        context.font = '900 10px ui-monospace';
        context.fillText(hazard.profile.name, 0, -38);
      } else {
        context.globalCompositeOperation = 'screen';
        const gradient = context.createRadialGradient(0, -40, 4, 0, -40, hazard.profile.radius);
        gradient.addColorStop(0, 'rgba(255,235,210,.75)');
        gradient.addColorStop(.35, 'rgba(164,44,51,.42)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = gradient;
        context.fillRect(-hazard.profile.radius, -280, hazard.profile.radius * 2, 320);
      }
      context.restore();
    }
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
    context.fillText(this.stage.name, WIDTH / 2, 86);
    context.fillStyle = this.ritual.id === 'none' ? '#59615b' : '#c34a52';
    context.font = '900 8px ui-monospace';
    context.fillText(`RITE · ${this.ritual.name}`, WIDTH / 2, 99);

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

    if (this.config.training) {
      context.fillStyle = 'rgba(4,7,5,.74)';
      context.fillRect(18, 143, 380, 180);
      context.strokeStyle = '#3b433d';
      context.strokeRect(18, 143, 380, 180);
      context.textAlign = 'left';
      context.fillStyle = '#c13e46';
      context.font = '900 10px ui-monospace';
      context.fillText('OBSERVATION DATA', 33, 164);
      context.fillStyle = '#b9b9ae';
      context.font = '700 10px ui-monospace';
      const attack = p1.attack;
      context.fillText(`P1 STATE   ${p1.state.toUpperCase()}`, 33, 185);
      context.fillText(`FRAME      ${attack ? attack.frame : '—'}`, 33, 203);
      context.fillText(`MOVE       ${attack ? attack.move.name : '—'}`, 33, 221);
      context.fillText(`DISTANCE   ${Math.round(Math.abs(p1.x - p2.x))}`, 33, 239);
      context.fillText(`TRAIT      ${p1.profile.trait.name}`, 33, 257);
      context.fillText(`STATUS     ${p1.status ? AFFLICTIONS[p1.status.id]?.name : '—'}`, 33, 273);
      context.fillText(`BOSS PHASE ${p2.phaseName || '—'}`, 33, 291);
      context.fillStyle = '#747d75';
      context.font = '700 9px ui-monospace';
      context.fillText(`INPUTS     ${this.inputHistory.slice(-6).map((entry) => entry.label).join(' › ') || '—'}`, 33, 311);
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
      } else if (text.kind === 'shift' || text.kind === 'phase') {
        context.font = '900 30px ui-monospace'; context.fillStyle = '#d4c7b2'; context.shadowColor = '#a62d36'; context.shadowBlur = 22;
      } else if (['break', 'perfect', 'counter', 'armor'].includes(text.kind)) {
        context.font = '900 20px ui-monospace'; context.fillStyle = text.kind === 'perfect' ? '#e7d9a8' : text.kind === 'counter' ? '#d86a70' : '#e6b45d';
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
    context.fillStyle = 'rgba(1,2,1,.88)';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.textAlign = 'center';
    context.fillStyle = '#efe9dc';
    context.font = '900 62px ui-monospace';
    context.fillText('PAUSE', WIDTH / 2, 205);
    context.fillStyle = '#a7aca4';
    context.font = '700 13px ui-monospace';
    context.fillText('ÉCHAP / START POUR REPRENDRE', WIDTH / 2, 237);
    const drawMoveList = (actor, x, align) => {
      context.textAlign = align;
      context.fillStyle = '#b83b44';
      context.font = '900 16px ui-monospace';
      context.fillText(actor.data.name.toUpperCase(), x, 305);
      context.fillStyle = '#d8d1c4';
      context.font = '700 12px ui-monospace';
      context.fillText(actor.profile.trait.name, x, 330);
      context.fillStyle = '#979e97';
      context.fillText(actor.profile.trait.description, x, 352, 470);
      context.fillStyle = '#d8d1c4';
      context.fillText(`TECHNIQUE · ${actor.profile.moves.special.name}`, x, 390);
      context.fillText(`NIGHTMARE · ${actor.profile.moves.super.name.replace('NIGHTMARE — ', '')}`, x, 414);
      context.fillText(`AFFLICTION · ${actor.profile.affliction.name}`, x, 438);
    };
    drawMoveList(p1, 110, 'left');
    drawMoveList(p2, WIDTH - 110, 'right');
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
      context.fillText(`${winner.stats.maxCombo} COMBO MAX · ${winner.stats.perfectGuards} GARDES PARFAITES · ${winner.stats.counters} CONTRES`, WIDTH / 2, 390);
    }
    context.fillStyle = '#858d86';
    context.font = '700 12px ui-monospace';
    context.fillText('LE DOSSIER DE RÉSULTAT EST DISPONIBLE HORS DE L’ARÈNE', WIDTH / 2, 425);
    context.restore();
  }
}

export const CONTROL_LABELS = {
  p1: '← → mouvement · ↑ saut · ESPACE garde/parade · J frappe · K lourd · I technique · U saisie · O cauchemar · L esquive',
  p2: 'Q D mouvement · Z saut · A garde/parade · F frappe · G lourd · H technique · R saisie · T cauchemar · V esquive'
};
