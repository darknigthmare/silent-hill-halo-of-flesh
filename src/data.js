import { buildLoreMoveset, MOVESET_KEYS, MOVE_INPUTS, MOVE_FIDELITY } from './movesets.js';
import { enrichStage, STAGE_TERRAINS, STAGE_SHIFT_STYLES, STAGE_EVENTS, STAGE_INTERACTION_TRIGGERS, stageDirectorSummary } from './stage-director.js';

/*
 * SILENT HILL: HALO OF FLESH — catalogue de prototype.
 * Les noms identifient les créatures de la franchise à des fins de documentation
 * et de fan-game non commercial. Les statistiques, timings et silhouettes sont
 * des adaptations originales ; aucun asset officiel n'est inclus.
 */

export const VERSION = '0.7.0';
export const SAVE_KEY = 'sh-halo-of-flesh-save-v1';

export const SOURCE_META = Object.freeze({
  sh1: { label: 'SILENT HILL', year: 1999, short: 'SH1', stage: 'midwich' },
  sh2: { label: 'SILENT HILL 2', year: 2001, short: 'SH2', stage: 'woodside' },
  sh3: { label: 'SILENT HILL 3', year: 2003, short: 'SH3', stage: 'shopping_mall' },
  sh4: { label: 'SILENT HILL 4: THE ROOM', year: 2004, short: 'SH4', stage: 'room_302' },
  origins: { label: 'SILENT HILL: ORIGINS', year: 2007, short: '0RIGINS', stage: 'cedar_grove' },
  homecoming: { label: 'SILENT HILL: HOMECOMING', year: 2008, short: 'HC', stage: 'shepherds_glen' },
  shattered: { label: 'SILENT HILL: SHATTERED MEMORIES', year: 2009, short: 'SM', stage: 'nightmare_school' },
  downpour: { label: 'SILENT HILL: DOWNPOUR', year: 2012, short: 'DP', stage: 'overlook' },
  arcade: { label: 'SILENT HILL: THE ARCADE', year: 2007, short: 'ARCADE', stage: 'arcade_ship' },
  bom: { label: 'SILENT HILL: BOOK OF MEMORIES', year: 2012, short: 'BOM', stage: 'book_zone' },
  pt: { label: 'P.T.', year: 2014, short: 'P.T.', stage: 'looping_hall' },
  shortmessage: { label: 'SILENT HILL: THE SHORT MESSAGE', year: 2024, short: 'TSM', stage: 'villa' },
  shf: { label: 'SILENT HILL f', year: 2025, short: 'SH f', stage: 'ebisugaoka' },
  film: { label: 'SILENT HILL — FILM UNIVERSE', year: 2006, short: 'FILMS', stage: 'film_midwich' },
  ascension: { label: 'SILENT HILL: ASCENSION', year: 2023, short: 'ASC', stage: 'hope_junction' },
  townfall: { label: 'SILENT HILL: TOWNFALL', year: 2026, short: 'TOWNFALL', stage: 'st_amelia_marina' }
});

export const ARCHETYPES = Object.freeze({
  balanced: { health: 1000, speed: 5.2, jump: 12.7, power: 1, reach: 1, guard: 100, meterGain: 1 },
  rushdown: { health: 890, speed: 6.6, jump: 13.5, power: .9, reach: .88, guard: 86, meterGain: 1.18 },
  juggernaut: { health: 1290, speed: 3.55, jump: 9.5, power: 1.3, reach: 1.18, guard: 122, meterGain: .88 },
  grappler: { health: 1180, speed: 4.1, jump: 10.4, power: 1.22, reach: .98, guard: 114, meterGain: .94 },
  zoner: { health: 880, speed: 4.8, jump: 12.2, power: .94, reach: 1.32, guard: 88, meterGain: 1.05 },
  flyer: { health: 820, speed: 6.25, jump: 15.2, power: .86, reach: 1.18, guard: 78, meterGain: 1.22 },
  swarm: { health: 760, speed: 7.15, jump: 11.8, power: .8, reach: .75, guard: 72, meterGain: 1.28 },
  ghost: { health: 910, speed: 5, jump: 11.4, power: 1.02, reach: 1.12, guard: 92, meterGain: 1.1 },
  puppet: { health: 940, speed: 5.5, jump: 12.1, power: .98, reach: 1.05, guard: 92, meterGain: 1.1 },
  trickster: { health: 870, speed: 6, jump: 13.2, power: .9, reach: 1.08, guard: 82, meterGain: 1.2 },
  artillery: { health: 1020, speed: 3.9, jump: 9.8, power: 1.15, reach: 1.48, guard: 104, meterGain: .95 },
  boss: { health: 1450, speed: 4.25, jump: 9.6, power: 1.34, reach: 1.3, guard: 135, meterGain: .82 }
});

export const MANIFESTATION_TRAITS = Object.freeze({
  echo: { name: 'ÉCHO PERSISTANT', description: 'Profil équilibré : la jauge monte légèrement lorsque la manifestation varie ses attaques.', meterVariety: .08 },
  relentless: { name: 'POURSUITE OBSESSIONNELLE', description: 'Gagne de la jauge en avançant vers sa cible et conserve mieux son élan.', forwardMeter: .055, speed: 1.04 },
  rustArmor: { name: 'ARMURE DE ROUILLE', description: 'Absorbe périodiquement une partie du recul et du hitstun.', damageReduction: .07, armorCooldown: 280 },
  constriction: { name: 'CONSTRICTION', description: 'Les saisies infligent davantage de dégâts et appliquent Entrave.', throwDamage: 1.2, throwEffect: 'bind' },
  staticField: { name: 'CHAMP PARASITE', description: 'Les projectiles sont plus larges et appliquent Parasites radio.', projectileScale: 1.18, effect: 'static' },
  aerialInstinct: { name: 'INSTINCT AÉRIEN', description: 'Saut plus haut et esquive plus longue.', jump: 1.12, dodgeInvuln: 3 },
  lowProfile: { name: 'PROFIL RAMPANT', description: 'Hurtbox réduite au sol et attaque basse accélérée.', lowProfile: .72, lowStartup: -2 },
  phaseWalk: { name: 'MARCHE SPECTRALE', description: 'L’esquive traverse plus longtemps les attaques et applique Effroi sur technique.', dodgeInvuln: 5, effect: 'dread' },
  convulsion: { name: 'CONVULSION', description: 'Les chaînes frappe → lourd → technique disposent d’une fenêtre d’annulation élargie.', cancelWindow: 6 },
  falsePresence: { name: 'FAUSSE PRÉSENCE', description: 'Une esquive parfaite rend brièvement intangible et accélère la prochaine technique.', dodgeInvuln: 4, recoveryScale: .92 },
  suppression: { name: 'SUPPRESSION', description: 'Projectiles lourds, garde adverse davantage entamée.', projectileScale: 1.3, guardDamage: 1.18 },
  nightmareArmor: { name: 'ARMURE DU CAUCHEMAR', description: 'Résistance accrue au recul et au hitstun tant que la vitalité dépasse un tiers.', damageReduction: .08, hitstunScale: .82, armorCooldown: 190 }
});

export const AFFLICTIONS = Object.freeze({
  bleed: { name: 'HÉMORRAGIE', duration: 180, color: '#a8323d', description: 'Perd périodiquement de la vitalité.' },
  static: { name: 'PARASITES RADIO', duration: 150, color: '#c9c8a4', description: 'Vitesse réduite et brouillage de jauge.' },
  bind: { name: 'ENTRAVE', duration: 90, color: '#8d735b', description: 'Déplacement et esquive fortement limités.' },
  decay: { name: 'CORROSION', duration: 180, color: '#8b7848', description: 'La garde ne se régénère plus et s’érode.' },
  burn: { name: 'BRÛLURE', duration: 150, color: '#cf5938', description: 'Dégâts réguliers plus intenses.' },
  dread: { name: 'EFFROI', duration: 150, color: '#776080', description: 'La jauge Nightmare se dissipe progressivement.' },
  frost: { name: 'GEL', duration: 120, color: '#7ba5b4', description: 'Vitesse et accélération réduites.' },
  bloom: { name: 'FLORAISON', duration: 135, color: '#bd6674', description: 'Ralentissement qui s’intensifie près du centre de l’arène.' }
});

const traitByArchetype = Object.freeze({
  balanced: 'echo', rushdown: 'relentless', juggernaut: 'rustArmor', grappler: 'constriction',
  zoner: 'staticField', flyer: 'aerialInstinct', swarm: 'lowProfile', ghost: 'phaseWalk',
  puppet: 'convulsion', trickster: 'falsePresence', artillery: 'suppression', boss: 'nightmareArmor'
});

const afflictionByArchetype = Object.freeze({
  balanced: 'bleed', rushdown: 'bleed', juggernaut: 'decay', grappler: 'bind', zoner: 'static',
  flyer: 'static', swarm: 'decay', ghost: 'dread', puppet: 'bleed', trickster: 'dread',
  artillery: 'burn', boss: 'dread'
});

export const STAGE_HAZARDS = Object.freeze({
  staticBurst: { name: 'SURSAUT RADIO', telegraph: 85, radius: 165, damage: 34, effect: 'static', shape: 'circle', targetMode: 'fighter', knockback: 7, visual: 'static' },
  fallingDebris: { name: 'CHUTE DE DÉBRIS', telegraph: 90, radius: 118, damage: 62, effect: 'decay', shape: 'circle', targetMode: 'fighter', knockback: 9, visual: 'debris' },
  bloodTide: { name: 'MARÉE DE SANG', telegraph: 105, radius: 220, damage: 45, effect: 'bleed', shape: 'lane', targetMode: 'center', knockback: 6, visual: 'blood' },
  frostWave: { name: 'VAGUE DE GEL', telegraph: 95, radius: 205, damage: 26, effect: 'frost', shape: 'lane', targetMode: 'fighter', knockback: 5, visual: 'ice' },
  petalBloom: { name: 'FLORAISON ROUGE', telegraph: 100, radius: 190, damage: 38, effect: 'bloom', shape: 'circle', targetMode: 'fighter', knockback: 4, visual: 'petals' },
  emberFall: { name: 'PLUIE DE CENDRES', telegraph: 82, radius: 135, damage: 50, effect: 'burn', shape: 'circle', targetMode: 'fighter', knockback: 7, visual: 'embers' },
  chainSweep: { name: 'BALAYAGE DE CHAÎNES', telegraph: 76, radius: 145, damage: 58, effect: 'bind', shape: 'sweep', targetMode: 'side', knockback: 10, visual: 'chains' },
  lockerSlam: { name: 'CLAQUEMENT DE CASIERS', telegraph: 66, radius: 105, damage: 38, effect: 'static', shape: 'lane', targetMode: 'fighter', knockback: 6, visual: 'locker' },
  gurneyRush: { name: 'CHARIOT LANCÉ', telegraph: 84, radius: 142, damage: 58, effect: 'bind', shape: 'sweep', targetMode: 'side', knockback: 12, visual: 'gurney' },
  roadCollapse: { name: 'RUPTURE DE CHAUSSÉE', telegraph: 112, radius: 188, damage: 68, effect: 'decay', shape: 'edge', targetMode: 'edge', knockback: 14, visual: 'chasm', unblockable: true },
  carouselSweep: { name: 'COURONNE DU MANÈGE', telegraph: 98, radius: 154, damage: 52, effect: 'bind', shape: 'sweep', targetMode: 'center', knockback: 9, visual: 'carousel' },
  trainRush: { name: 'PASSAGE DE LA RAME', telegraph: 124, radius: 210, damage: 82, effect: 'decay', shape: 'sweep', targetMode: 'side', knockback: 16, visual: 'train', unblockable: true },
  steamVent: { name: 'PURGE DE VAPEUR', telegraph: 74, radius: 112, damage: 44, effect: 'burn', shape: 'lane', targetMode: 'fighter', knockback: 7, visual: 'steam' },
  waterSurge: { name: 'VAGUE D’EAU NOIRE', telegraph: 106, radius: 235, damage: 40, effect: 'frost', shape: 'lane', targetMode: 'center', knockback: 8, visual: 'water' },
  mirrorFracture: { name: 'FRACTURE DU REFLET', telegraph: 88, radius: 152, damage: 46, effect: 'dread', shape: 'circle', targetMode: 'fighter', knockback: 7, visual: 'mirror' },
  rootSnare: { name: 'PRISE DES RACINES', telegraph: 92, radius: 172, damage: 34, effect: 'bloom', shape: 'circle', targetMode: 'fighter', knockback: 4, visual: 'roots' },
  spotlightSweep: { name: 'FAISCEAU DE SURVEILLANCE', telegraph: 80, radius: 148, damage: 32, effect: 'dread', shape: 'sweep', targetMode: 'side', knockback: 5, visual: 'spotlight' },
  crtvPulse: { name: 'VERROU CRTV', telegraph: 70, radius: 220, damage: 28, effect: 'static', shape: 'ring', targetMode: 'fighter', knockback: 4, visual: 'signal' },
  sirenShock: { name: 'ONDE DE SIRÈNE', telegraph: 94, radius: 270, damage: 38, effect: 'dread', shape: 'global', targetMode: 'center', knockback: 6, visual: 'siren' },
  voidPull: { name: 'ATTRACTION DU VIDE', telegraph: 108, radius: 238, damage: 42, effect: 'dread', shape: 'center', targetMode: 'center', knockback: -10, visual: 'void' },
  bellToll: { name: 'RÉSONANCE DE LA CLOCHE', telegraph: 96, radius: 260, damage: 30, effect: 'dread', shape: 'global', targetMode: 'center', knockback: 4, visual: 'bell' },
  portraitGaze: { name: 'REGARD DES PORTRAITS', telegraph: 90, radius: 176, damage: 34, effect: 'dread', shape: 'circle', targetMode: 'fighter', knockback: 4, visual: 'portrait' },
  elevatorDrop: { name: 'CHUTE D’ASCENSEUR', telegraph: 104, radius: 136, damage: 64, effect: 'decay', shape: 'lane', targetMode: 'fighter', knockback: 11, visual: 'elevator' },
  roomPulse: { name: 'CONTRACTION DE LA PIÈCE', telegraph: 92, radius: 230, damage: 36, effect: 'dread', shape: 'ring', targetMode: 'center', knockback: -5, visual: 'room' },
  lightningStrike: { name: 'IMPACT DE FOUDRE', telegraph: 78, radius: 96, damage: 62, effect: 'burn', shape: 'lane', targetMode: 'fighter', knockback: 10, visual: 'lightning' },
  iceFracture: { name: 'FISSURE DE GLACE', telegraph: 100, radius: 180, damage: 36, effect: 'frost', shape: 'edge', targetMode: 'fighter', knockback: 9, visual: 'ice-crack' },
  ritualSeal: { name: 'FERMETURE DU SCEAU', telegraph: 102, radius: 196, damage: 42, effect: 'dread', shape: 'ring', targetMode: 'center', knockback: -6, visual: 'ritual' },
  windShear: { name: 'RAFALE LATÉRALE', telegraph: 82, radius: 170, damage: 30, effect: 'frost', shape: 'sweep', targetMode: 'side', knockback: 13, visual: 'wind' },
  doorSlam: { name: 'PORTE CLAQUÉE', telegraph: 72, radius: 104, damage: 40, effect: 'bind', shape: 'edge', targetMode: 'edge', knockback: 7, visual: 'door' }
});


export const AI_PERSONALITIES = Object.freeze({
  balanced: { name: 'LECTURE PRUDENTE', preferredRange: 145, aggression: 1, defense: 1, mobility: 1 },
  rushdown: { name: 'POURSUITE DIRECTE', preferredRange: 92, aggression: 1.28, defense: .76, mobility: 1.18 },
  juggernaut: { name: 'PRESSION LOURDE', preferredRange: 112, aggression: 1.08, defense: 1.24, mobility: .72 },
  grappler: { name: 'CAPTURE RITUELLE', preferredRange: 68, aggression: 1.16, defense: .9, mobility: .82 },
  zoner: { name: 'CONTRÔLE DU SIGNAL', preferredRange: 330, aggression: .92, defense: 1.08, mobility: .9 },
  flyer: { name: 'TRAJECTOIRE AÉRIENNE', preferredRange: 245, aggression: 1.05, defense: .76, mobility: 1.3 },
  swarm: { name: 'PRESSION DE MEUTE', preferredRange: 78, aggression: 1.35, defense: .64, mobility: 1.34 },
  ghost: { name: 'APPARITION DIFFÉRÉE', preferredRange: 210, aggression: .94, defense: 1.12, mobility: 1.08 },
  puppet: { name: 'RYTHME CONVULSIF', preferredRange: 132, aggression: 1.12, defense: .92, mobility: 1.05 },
  trickster: { name: 'FAUSSE OUVERTURE', preferredRange: 182, aggression: 1, defense: 1.08, mobility: 1.16 },
  artillery: { name: 'SUPPRESSION DISTANTE', preferredRange: 390, aggression: .88, defense: 1.14, mobility: .7 },
  boss: { name: 'JUGEMENT ADAPTATIF', preferredRange: 126, aggression: 1.18, defense: 1.16, mobility: .9 }
});

export const RITUAL_MODIFIERS = Object.freeze({
  none: {
    name: 'AUCUN RITE', short: 'STANDARD', description: 'Règles équilibrées sans altération supplémentaire.'
  },
  denseFog: {
    name: 'BRUME ÉPAISSE', short: 'BRUME', description: 'Radio plus nerveuse, réaction de l’IA accélérée et transformation Otherworld plus précoce.',
    radioScale: 1.35, aiReactionScale: .88, shiftThreshold: .72
  },
  bloodDebt: {
    name: 'DETTE DE SANG', short: 'SANG', description: 'La vitalité s’érode lentement, mais les dégâts et la jauge augmentent.',
    lifeDrain: 1, damageScale: 1.08, meterGainScale: 1.16
  },
  fragileGuard: {
    name: 'GARDE FISSURÉE', short: 'GARDE', description: 'La garde est réduite, récupère plus lentement et les dégâts de garde sont renforcés.',
    guardScale: .62, guardRegenScale: .45, chipScale: 1.32
  },
  staticStorm: {
    name: 'ORAGE PARASITE', short: 'PARASITES', description: 'Les dangers surviennent plus souvent et la radio devient presque permanente.',
    hazardIntervalScale: .58, hazardDamageScale: .9, radioScale: 1.55
  },
  sacredSilence: {
    name: 'SILENCE SACRÉ', short: 'SILENCE', description: 'La radio se tait, la jauge monte moins vite, mais les techniques signatures frappent plus fort.',
    radioDisabled: true, meterGainScale: .72, specialDamageScale: 1.22
  },
  executionNight: {
    name: 'NUIT DE L’EXÉCUTION', short: 'EXÉCUTION', description: 'Les Nightmare coûtent moins cher, commencent plus tôt et deviennent plus destructeurs.',
    superCostScale: .75, superDamageScale: 1.3, startMeter: 25
  },
  noEscape: {
    name: 'AUCUNE ÉCHAPPATOIRE', short: 'CAGE', description: 'L’arène se resserre et les déplacements sont plus rapides.',
    arenaInset: 145, speedScale: 1.08
  },
  redJudgment: {
    name: 'JUGEMENT ROUGE', short: 'OTHERWORLD', description: 'Le combat commence dans l’Otherworld ; les boss et les dangers deviennent plus menaçants.',
    startOtherworld: true, bossPowerScale: 1.12, hazardIntervalScale: .76, hazardDamageScale: 1.08
  }
});

const BOSS_PHASE_STYLES = Object.freeze({
  deity: [
    { threshold: .68, name: 'ASCENSION', power: 1.08, speed: 1.04, armor: .03, meter: 18, otherworld: true },
    { threshold: .34, name: 'JUGEMENT', power: 1.18, speed: 1.09, armor: .06, meter: 32, hazardBurst: true }
  ],
  pyramid: [
    { threshold: .68, name: 'TRAQUE', power: 1.08, speed: 1.05, armor: .04, meter: 15 },
    { threshold: .34, name: 'SENTENCE', power: 1.2, speed: 1.1, armor: .08, meter: 30, otherworld: true }
  ],
  giant: [
    { threshold: .68, name: 'MASSE ÉVEILLÉE', power: 1.1, speed: 1.03, armor: .06, meter: 16 },
    { threshold: .34, name: 'EFFONDREMENT', power: 1.22, speed: 1.08, armor: .1, meter: 28, hazardBurst: true }
  ],
  cage: [
    { threshold: .68, name: 'SUSPENSION', power: 1.09, speed: 1.04, armor: .04, meter: 18 },
    { threshold: .34, name: 'CONDAMNATION', power: 1.19, speed: 1.08, armor: .07, meter: 32, otherworld: true }
  ],
  ghost: [
    { threshold: .68, name: 'APPARITION', power: 1.06, speed: 1.08, armor: .02, meter: 20 },
    { threshold: .34, name: 'HANTISE', power: 1.16, speed: 1.14, armor: .04, meter: 35, hazardBurst: true }
  ],
  generic: [
    { threshold: .68, name: 'RÉVÉLATION', power: 1.08, speed: 1.05, armor: .04, meter: 18 },
    { threshold: .34, name: 'FORME FINALE', power: 1.18, speed: 1.1, armor: .07, meter: 30, otherworld: true }
  ]
});

export function createBossPhases(fighter) {
  if (!fighter?.boss) return [];
  const style = BOSS_PHASE_STYLES[fighter.visual?.kind] || BOSS_PHASE_STYLES[fighter.visual?.body] || BOSS_PHASE_STYLES.generic;
  return style.map((phase, index) => ({
    id: `${fighter.id}_phase_${index + 1}`,
    index: index + 1,
    signature: fighter.signature,
    ...phase
  }));
}

export function getRitualModifier(id = 'none') {
  return RITUAL_MODIFIERS[id] || RITUAL_MODIFIERS.none;
}

const paletteBySource = {
  sh1: ['#6d6f61', '#b9b7a4'], sh2: ['#6d6259', '#c8b9a4'], sh3: ['#7b6a50', '#d1b777'],
  sh4: ['#6e665f', '#beb6aa'], origins: ['#705f55', '#caa38c'], homecoming: ['#5d5f58', '#b3a47a'],
  shattered: ['#58707b', '#b5d4dc'], downpour: ['#5c6770', '#b7c2c9'], arcade: ['#5d5652', '#c6a786'],
  bom: ['#655a64', '#bfa7bd'], pt: ['#6b5c54', '#be9c8c'], shortmessage: ['#5e4d52', '#cc8f9d'],
  shf: ['#6a4d4e', '#d0a5a7'], film: ['#5f514b', '#c2a38f'], ascension: ['#554b4b', '#b58d83'],
  townfall: ['#3f4b4d', '#a9b6ad']
};

const defaultsByKind = {
  humanoid: { scale: 1, body: 'human' }, child: { scale: .72, body: 'child' }, nurse: { scale: .98, body: 'human' },
  quadruped: { scale: .82, body: 'beast' }, flyer: { scale: .82, body: 'winged' }, insect: { scale: .66, body: 'insect' },
  worm: { scale: 1.15, body: 'worm' }, giant: { scale: 1.42, body: 'giant' }, ghost: { scale: 1.02, body: 'ghost' },
  pyramid: { scale: 1.22, body: 'human' }, mannequin: { scale: 1.04, body: 'human' }, mass: { scale: 1.28, body: 'mass' },
  wall: { scale: 1.22, body: 'wall' }, doll: { scale: .92, body: 'doll' }, flowerhead: { scale: 1.03, body: 'human' },
  deity: { scale: 1.34, body: 'divine' }, cage: { scale: 1.24, body: 'cage' }, fungus: { scale: .8, body: 'fungus' },
  wheelchair: { scale: 1.02, body: 'wheelchair' }, fox: { scale: 1.1, body: 'fox' }, spider: { scale: 1.03, body: 'spider' },
  void: { scale: 1.55, body: 'void' }, serpentine: { scale: 1.2, body: 'serpent' }
};

const LEGACY_IDS = Object.freeze({
  "sh1|Air Screamer": "sh1_air_screamer_001",
  "sh1|Night Flutter": "sh1_night_flutter_002",
  "sh1|Groaner": "sh1_groaner_003",
  "sh1|Wormhead": "sh1_wormhead_004",
  "sh1|Grey Child": "sh1_grey_child_005",
  "sh1|Mumbler": "sh1_mumbler_006",
  "sh1|Larval Stalker": "sh1_larval_stalker_007",
  "sh1|Stalker": "sh1_stalker_008",
  "sh1|Creeper": "sh1_creeper_009",
  "sh1|Romper": "sh1_romper_010",
  "sh1|Hanged Scratcher": "sh1_hanged_scratcher_011",
  "sh1|Puppet Nurse": "sh1_puppet_nurse_012",
  "sh1|Puppet Doctor": "sh1_puppet_doctor_013",
  "sh1|Split Head": "sh1_split_head_014",
  "sh1|Twinfeeler": "sh1_twinfeeler_015",
  "sh1|Floatstinger": "sh1_floatstinger_016",
  "sh1|Monster Cybil": "sh1_monster_cybil_017",
  "sh1|Incubator": "sh1_incubator_018",
  "sh1|Incubus": "sh1_incubus_019",
  "sh2|Lying Figure": "sh2_lying_figure_020",
  "sh2|Lying Figure — Crawling": "sh2_lying_figure_crawling_021",
  "sh2|Mannequin": "sh2_mannequin_022",
  "sh2|Mannequin — Ambusher": "sh2_mannequin_ambusher_023",
  "sh2|Bubble Head Nurse": "sh2_bubble_head_nurse_024",
  "sh2|Creeper": "sh2_creeper_025",
  "sh2|Mandarin": "sh2_mandarin_026",
  "sh2|Flesh Lip": "sh2_flesh_lip_027",
  "sh2|Abstract Daddy": "sh2_abstract_daddy_028",
  "sh2|Red Pyramid Thing — Great Knife": "sh2_red_pyramid_thing_great_knife_029",
  "sh2|Red Pyramid Thing — Spear": "sh2_red_pyramid_thing_spear_030",
  "sh2|Twin Pyramid Heads": "sh2_twin_pyramid_heads_031",
  "sh2|Eddie Dombrowski": "sh2_eddie_dombrowski_032",
  "sh2|Maria — Final Manifestation": "sh2_maria_final_manifestation_033",
  "sh2|Mary — Final Manifestation": "sh2_mary_final_manifestation_034",
  "sh2|Prisoner": "sh2_prisoner_035",
  "sh3|Closer": "sh3_closer_036",
  "sh3|Numb Body — Small": "sh3_numb_body_small_037",
  "sh3|Numb Body — Large": "sh3_numb_body_large_038",
  "sh3|Pendulum": "sh3_pendulum_039",
  "sh3|Double Head": "sh3_double_head_040",
  "sh3|Insane Cancer": "sh3_insane_cancer_041",
  "sh3|Slurper": "sh3_slurper_042",
  "sh3|Nurse — Pipe": "sh3_nurse_pipe_043",
  "sh3|Nurse — Revolver": "sh3_nurse_revolver_044",
  "sh3|Scraper": "sh3_scraper_045",
  "sh3|Split Worm": "sh3_split_worm_046",
  "sh3|Missionary": "sh3_missionary_047",
  "sh3|Leonard Wolf": "sh3_leonard_wolf_048",
  "sh3|Memory of Alessa": "sh3_memory_of_alessa_049",
  "sh3|God": "sh3_god_050",
  "sh3|Valtiel": "sh3_valtiel_051",
  "sh3|Sewer Creature": "sh3_sewer_creature_052",
  "sh4|Sniffer Dog — Male": "sh4_sniffer_dog_male_053",
  "sh4|Sniffer Dog — Female": "sh4_sniffer_dog_female_054",
  "sh4|Hummer": "sh4_hummer_055",
  "sh4|Wall Man": "sh4_wall_man_056",
  "sh4|Gum Head — Old Type": "sh4_gum_head_old_type_057",
  "sh4|Gum Head — New Type": "sh4_gum_head_new_type_058",
  "sh4|Twin Victim": "sh4_twin_victim_059",
  "sh4|Patient": "sh4_patient_060",
  "sh4|Toadstool": "sh4_toadstool_061",
  "sh4|Whitestool": "sh4_whitestool_062",
  "sh4|Tremer — Blue": "sh4_tremer_blue_063",
  "sh4|Tremer — Red": "sh4_tremer_red_064",
  "sh4|Bottom": "sh4_bottom_065",
  "sh4|Ghost — Victim": "sh4_ghost_victim_066",
  "sh4|Man with the Coat": "sh4_man_with_the_coat_067",
  "sh4|Wheelchair": "sh4_wheelchair_068",
  "sh4|Greedy Worm": "sh4_greedy_worm_069",
  "sh4|One Truth": "sh4_one_truth_070",
  "sh4|Sacrificed Walter": "sh4_sacrificed_walter_071",
  "sh4|Walter Sullivan": "sh4_walter_sullivan_072",
  "sh4|Eileen Head": "sh4_eileen_head_073",
  "origins|Straight-Jacket": "origins_straight_jacket_074",
  "origins|Nurse": "origins_nurse_075",
  "origins|Carrion": "origins_carrion_076",
  "origins|Remnant": "origins_remnant_077",
  "origins|Ariel": "origins_ariel_078",
  "origins|Caliban": "origins_caliban_079",
  "origins|Two-Back": "origins_two_back_080",
  "origins|The Butcher": "origins_the_butcher_081",
  "origins|Memory of Helen Grady": "origins_memory_of_helen_grady_082",
  "origins|Memory of Richard Grady": "origins_memory_of_richard_grady_083",
  "origins|Demon": "origins_demon_084",
  "homecoming|Lurker": "homecoming_lurker_085",
  "homecoming|Feral": "homecoming_feral_086",
  "homecoming|Smog": "homecoming_smog_087",
  "homecoming|Needler": "homecoming_needler_088",
  "homecoming|Schism": "homecoming_schism_089",
  "homecoming|Siam": "homecoming_siam_090",
  "homecoming|Order Soldier": "homecoming_order_soldier_091",
  "homecoming|Bogeyman": "homecoming_bogeyman_092",
  "homecoming|Sepulcher": "homecoming_sepulcher_093",
  "homecoming|Scarlet — Doll Form": "homecoming_scarlet_doll_form_094",
  "homecoming|Scarlet — Spider Form": "homecoming_scarlet_spider_form_095",
  "homecoming|Asphyxia": "homecoming_asphyxia_096",
  "homecoming|Amnion — Hanging Form": "homecoming_amnion_hanging_form_097",
  "homecoming|Amnion — Exposed Form": "homecoming_amnion_exposed_form_098",
  "shattered|Raw Shock — Base": "shattered_raw_shock_base_099",
  "shattered|Raw Shock — Feminine": "shattered_raw_shock_feminine_100",
  "shattered|Raw Shock — Diseased": "shattered_raw_shock_diseased_101",
  "shattered|Raw Shock — Abstract": "shattered_raw_shock_abstract_102",
  "shattered|Raw Shock — Atrophied": "shattered_raw_shock_atrophied_103",
  "downpour|Screamer": "downpour_screamer_104",
  "downpour|Weeping Bat": "downpour_weeping_bat_105",
  "downpour|Doll": "downpour_doll_106",
  "downpour|Shadow": "downpour_shadow_107",
  "downpour|Prisoner Minion — Brawler": "downpour_prisoner_minion_brawler_108",
  "downpour|Prisoner Minion — Agile": "downpour_prisoner_minion_agile_109",
  "downpour|Prisoner Juggernaut": "downpour_prisoner_juggernaut_110",
  "downpour|Tormented Soul": "downpour_tormented_soul_111",
  "downpour|Wall Corpse": "downpour_wall_corpse_112",
  "downpour|Void": "downpour_void_113",
  "downpour|Monocle Man": "downpour_monocle_man_114",
  "downpour|Bogeyman": "downpour_bogeyman_115",
  "downpour|Wheelman": "downpour_wheelman_116",
  "arcade|Mama": "arcade_mama_117",
  "arcade|Phantom": "arcade_phantom_118",
  "arcade|Greedy Worm — Arcade": "arcade_greedy_worm_arcade_119",
  "arcade|Split Head — Arcade": "arcade_split_head_arcade_120",
  "bom|Air Screamer": "bom_air_screamer_121",
  "bom|Bogeyman": "bom_bogeyman_122",
  "bom|Butcher": "bom_butcher_123",
  "bom|Double Head": "bom_double_head_124",
  "bom|Ghost": "bom_ghost_125",
  "bom|Insane Cancer": "bom_insane_cancer_126",
  "bom|Needler": "bom_needler_127",
  "bom|Nurse": "bom_nurse_128",
  "bom|Pyramid Head": "bom_pyramid_head_129",
  "bom|Schism": "bom_schism_130",
  "bom|Straight-Jacket": "bom_straight_jacket_131",
  "bom|Swarm": "bom_swarm_132",
  "bom|Tremer": "bom_tremer_133",
  "bom|Flesh Lips": "bom_flesh_lips_134",
  "bom|Mother": "bom_mother_135",
  "bom|Valtiel": "bom_valtiel_136",
  "bom|Fire Guardian": "bom_fire_guardian_137",
  "bom|Wood Guardian": "bom_wood_guardian_138",
  "bom|Wood Sapling": "bom_wood_sapling_139",
  "bom|Light Guardian": "bom_light_guardian_140",
  "bom|Water Guardian": "bom_water_guardian_141",
  "bom|Earth Guardian": "bom_earth_guardian_142",
  "bom|Blood Guardian": "bom_blood_guardian_143",
  "bom|Blood Baby": "bom_blood_baby_144",
  "bom|Blood Mama": "bom_blood_mama_145",
  "bom|Steel Guardian": "bom_steel_guardian_146",
  "bom|Gray Child": "bom_gray_child_147",
  "bom|Raw Shock": "bom_raw_shock_148",
  "pt|Lisa": "pt_lisa_149",
  "shortmessage|Sakura Head": "shortmessage_sakura_head_150",
  "shf|Kashimashi": "shf_kashimashi_151",
  "shf|Ayakakashi": "shf_ayakakashi_152",
  "shf|Ara-abare": "shf_ara_abare_153",
  "shf|Irohihi": "shf_irohihi_154",
  "shf|Corruptor": "shf_corruptor_155",
  "shf|Hatcher": "shf_hatcher_156",
  "shf|Kamugara": "shf_kamugara_157",
  "shf|Harai Katashiro": "shf_harai_katashiro_158",
  "shf|Oi-omoi": "shf_oi_omoi_159",
  "shf|Dark Hatcher": "shf_dark_hatcher_160",
  "shf|Drum Monster": "shf_drum_monster_161",
  "shf|Sakuko-Like Entity": "shf_sakuko_like_entity_162",
  "shf|Rinko-Like Entity": "shf_rinko_like_entity_163",
  "shf|Hinako’s Father": "shf_hinako_s_father_164",
  "shf|Hinako’s Mother": "shf_hinako_s_mother_165",
  "shf|Shiromuku": "shf_shiromuku_166",
  "shf|Tsukumogami": "shf_tsukumogami_167",
  "shf|Shichibi": "shf_shichibi_168",
  "shf|Kyubi": "shf_kyubi_169",
  "film|Armless Man": "film_armless_man_170",
  "film|Dark Nurse": "film_dark_nurse_171",
  "film|Grey Child — Film": "film_grey_child_film_172",
  "film|Creeper Swarm — Film": "film_creeper_swarm_film_173",
  "film|Colin the Janitor": "film_colin_the_janitor_174",
  "film|Red Pyramid — Film": "film_red_pyramid_film_175",
  "film|Mannequin Monster": "film_mannequin_monster_176",
  "film|Missionary — Revelation": "film_missionary_revelation_177",
  "ascension|Wanderer": "ascension_wanderer_178",
  "ascension|Fighter": "ascension_fighter_179",
  "ascension|Snarler": "ascension_snarler_180",
  "ascension|Stinger": "ascension_stinger_181",
  "ascension|The Immolator": "ascension_the_immolator_182",
  "ascension|The Collector": "ascension_the_collector_183",
  "ascension|Stilledalen Stinger": "ascension_stilledalen_stinger_184",
});

const RENAMED_LEGACY_IDS_BY_KEY = Object.freeze({
  'origins|Faceless Nurse': ['origins_nurse_075'],
  'arcade|Split Worm — Arcade': ['arcade_split_head_arcade_120']
});

let counter = 0;
function slug(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}


const FATALITY_STYLE_BY_KIND = Object.freeze({
  humanoid: { pose: 'execution', effect: 'silhouette', sequence: ['stagger','close','strike','collapse'] },
  child: { pose: 'apparition', effect: 'static', sequence: ['freeze','vanish','echo','collapse'] },
  nurse: { pose: 'clinical', effect: 'flicker', sequence: ['stagger','approach','incision','blackout'] },
  quadruped: { pose: 'pounce', effect: 'scratch', sequence: ['circle','pounce','drag','silence'] },
  flyer: { pose: 'dive', effect: 'wind', sequence: ['lift','dive','impact','fall'] },
  insect: { pose: 'swarm', effect: 'static', sequence: ['scatter','surround','swarm','fade'] },
  worm: { pose: 'devour', effect: 'chasm', sequence: ['coil','open','devour','sink'] },
  giant: { pose: 'crush', effect: 'debris', sequence: ['stagger','raise','crush','dust'] },
  ghost: { pose: 'haunt', effect: 'dread', sequence: ['freeze','phase','possession','fade'] },
  pyramid: { pose: 'sentence', effect: 'rust', sequence: ['stagger','drag','sentence','siren'] },
  mannequin: { pose: 'fold', effect: 'flicker', sequence: ['lock','fold','snap','still'] },
  mass: { pose: 'absorb', effect: 'blood', sequence: ['bind','envelop','absorb','pulse'] },
  wall: { pose: 'entomb', effect: 'rust', sequence: ['bind','pull','entomb','seal'] },
  doll: { pose: 'puppet', effect: 'glass', sequence: ['freeze','strings','break','still'] },
  flowerhead: { pose: 'bloom', effect: 'petals', sequence: ['root','bloom','enclose','petals'] },
  deity: { pose: 'judgment', effect: 'light', sequence: ['levitate','mark','judgment','ash'] },
  cage: { pose: 'suspension', effect: 'chains', sequence: ['bind','lift','suspend','drop'] },
  fungus: { pose: 'spore', effect: 'spores', sequence: ['root','spores','overgrow','fade'] },
  wheelchair: { pose: 'collision', effect: 'static', sequence: ['lock','charge','impact','silence'] },
  fox: { pose: 'procession', effect: 'petals', sequence: ['circle','tails','procession','seal'] },
  spider: { pose: 'cocoon', effect: 'web', sequence: ['snare','lift','cocoon','drop'] },
  void: { pose: 'erase', effect: 'void', sequence: ['distort','pull','erase','static'] },
  serpentine: { pose: 'constrict', effect: 'blood', sequence: ['coil','constrict','strike','release'] }
});

function fatalityNameFor(options, kind, variant = 'signature') {
  if (variant === 'signature') return options.finisher || `Rituel de clôture — ${options.signature || 'Manifestation'}`;
  const suffix = {
    pyramid: 'Sentence de rouille', deity: 'Jugement de l’Otherworld', ghost: 'Hantise sans retour',
    flowerhead: 'Floraison terminale', void: 'Effacement du signal', spider: 'Cocon du cauchemar',
    worm: 'Dévoration souterraine', giant: 'Écrasement du souvenir', cage: 'Suspension finale',
    nurse: 'Dernier protocole', quadruped: 'Traque achevée', flyer: 'Chute sans ciel'
  }[kind] || 'Dernière manifestation';
  return `NIGHTMARE — ${suffix}`;
}

function createFatalityPack(id, name, source, options, kind) {
  const style = FATALITY_STYLE_BY_KIND[kind] || FATALITY_STYLE_BY_KIND.humanoid;
  const basis = options.fatalityBasis || options.behavior || `Comportement documenté de ${name}.`;
  const signatureSequence = options.fatalitySequence || style.sequence;
  const nightmareSequence = options.nightmareSequence || [...style.sequence.slice(0, 2), 'otherworld', style.sequence.at(-1)];
  return [
    {
      id: `${id}_signature`, type: 'signature', name: fatalityNameFor(options, kind, 'signature'),
      trigger: 'decisive-special', pose: style.pose, effect: style.effect, sequence: signatureSequence,
      canonicalBasis: basis, fidelity: options.fatalityFidelity || 'adapted-from-canonical-behavior',
      intensity: options.fatalityIntensity || (options.boss ? 3 : 2)
    },
    {
      id: `${id}_nightmare`, type: 'nightmare', name: fatalityNameFor(options, kind, 'nightmare'),
      trigger: 'decisive-super', pose: style.pose, effect: options.nightmareEffect || style.effect,
      sequence: nightmareSequence, canonicalBasis: basis,
      fidelity: options.fatalityFidelity || 'adapted-from-canonical-behavior', intensity: options.boss ? 4 : 3
    }
  ];
}

function monster(source, name, options = {}) {
  const meta = SOURCE_META[source];
  if (!meta) throw new Error(`Source inconnue: ${source}`);
  const kind = options.kind || 'humanoid';
  const palette = paletteBySource[source];
  const key = `${source}|${name}`;
  const id = options.id || LEGACY_IDS[key] || `${source}_${slug(name)}`;
  counter += 1;
  const boss = Boolean(options.boss);
  const fatalities = options.fatalities || createFatalityPack(id, name, source, options, kind);
  const archetype = options.archetype || (boss ? 'boss' : 'balanced');
  const visualBase = defaultsByKind[kind] || defaultsByKind.humanoid;
  return {
    id,
    name,
    source,
    legacyIds: [...(RENAMED_LEGACY_IDS_BY_KEY[key] || []), ...(options.legacyIds || [])],
    game: meta.label,
    year: meta.year,
    category: boss ? 'BOSS' : (options.category || 'CREATURE'),
    boss,
    variant: options.variant || null,
    variantOf: options.variantOf || null,
    archetype,
    aiProfile: options.aiProfile || archetype,
    phaseStyle: options.phaseStyle || kind,
    stageId: options.stageId || meta.stage,
    signature: options.signature || 'Manifestation',
    trait: options.trait || traitByArchetype[archetype] || 'echo',
    affliction: options.affliction || afflictionByArchetype[archetype] || 'bleed',
    finisher: fatalities[0]?.name || options.finisher || `Rituel de clôture — ${options.signature || name}`,
    fatalities,
    canonicalBehavior: options.behavior || 'Approche, pression et attaque de proximité adaptées à son apparition d’origine.',
    adaptation: options.adaptation || 'Les timings, dégâts et règles de versus sont une adaptation de jeu de combat.',
    lore: options.lore || `Manifestation associée à ${meta.label}.`,
    catalogueStatus: options.catalogueStatus || (options.category === 'SET PIECE' ? 'canon-set-piece-adapted' : 'canon-combatant'),
    nameStatus: options.nameStatus || 'official-or-established',
    evidenceTier: options.evidenceTier || 'verified-secondary',
    visual: {
      kind,
      body: visualBase.body,
      scale: options.scale || visualBase.scale,
      primary: options.color || palette[0],
      accent: options.accent || palette[1],
      secondary: options.secondary || '#2d2b29',
      motif: options.motif || null,
      weapon: options.weapon || null,
      head: options.head || null,
      limbs: options.limbs || null,
      aura: options.aura || null
    },
    tags: [meta.short, archetype, kind, options.trait || traitByArchetype[archetype] || 'echo', options.affliction || afflictionByArchetype[archetype] || 'bleed', ...(options.tags || [])],
    unlock: options.unlock || 'base'
  };
}

export const ROSTER = [
  // SILENT HILL (1999)
  monster('sh1','Air Screamer',{kind:'flyer',archetype:'flyer',signature:'Plongée lacérante',behavior:'Patrouille aérienne, cri et piqué rapide.',lore:'Créature volante de l’Otherworld de Silent Hill.'}),
  monster('sh1','Night Flutter',{kind:'flyer',archetype:'flyer',signature:'Nuée nocturne',behavior:'Version nocturne plus agressive, sensible à la lumière.',variantOf:'Air Screamer'}),
  monster('sh1','Groaner',{kind:'quadruped',archetype:'rushdown',signature:'Morsure en course',behavior:'Charge canine basse et harcèlement rapide.'}),
  monster('sh1','Wormhead',{kind:'quadruped',archetype:'rushdown',signature:'Mâchoire annelée',behavior:'Variante nocturne du Groaner, attaque en bond.',variantOf:'Groaner'}),
  monster('sh1','Grey Child',{kind:'child',archetype:'grappler',signature:'Étreinte au couteau',behavior:'Approche hésitante puis agrippement et frappe courte.',weapon:'knife'}),
  monster('sh1','Mumbler',{kind:'child',archetype:'rushdown',signature:'Griffes courtes',behavior:'Se rue sur la cible et enchaîne des coups bas.'}),
  monster('sh1','Larval Stalker',{kind:'ghost',archetype:'ghost',signature:'Ombre traversante',behavior:'Apparition non offensive adaptée ici en leurre intangible.',adaptation:'Son absence de menace directe devient une mécanique de feinte et d’esquive.',unlock:'archive'}),
  monster('sh1','Stalker',{kind:'child',archetype:'ghost',signature:'Traque invisible',behavior:'Silhouette enfantine qui frappe après une brève disparition.'}),
  monster('sh1','Creeper',{kind:'insect',archetype:'swarm',signature:'Essaim rampant',behavior:'Très bas au sol, rapide, difficile à toucher debout.'}),
  monster('sh1','Romper',{kind:'humanoid',archetype:'rushdown',signature:'Bond de contention',behavior:'Bondit, plaque la cible et frappe au sol.'}),
  monster('sh1','Hanged Scratcher',{kind:'insect',archetype:'trickster',signature:'Griffe du plafond',behavior:'Se déplace sur les parois et tombe sur la cible.',limbs:6}),
  monster('sh1','Puppet Nurse',{kind:'nurse',archetype:'balanced',signature:'Scalpel parasité',behavior:'Marche irrégulière, attaque au couteau et sursaut du parasite.',weapon:'scalpel'}),
  monster('sh1','Puppet Doctor',{kind:'humanoid',archetype:'juggernaut',signature:'Impact parasité',behavior:'Plus robuste que les infirmières, coups lourds et lents.',weapon:'scalpel'}),
  monster('sh1','Split Head',{kind:'giant',archetype:'boss',boss:true,signature:'Mâchoire séparée',behavior:'Immense gueule verticale, charge et saisie dévorante.',stageId:'nowhere',head:'split'}),
  monster('sh1','Twinfeeler',{kind:'insect',archetype:'boss',boss:true,signature:'Anneaux souterrains',behavior:'Larve géante qui surgit du sol et balaie l’arène.',stageId:'shopping_mall',limbs:8}),
  monster('sh1','Floatstinger',{kind:'flyer',archetype:'boss',boss:true,signature:'Dard aérien',behavior:'Boss volant, rafales de poison et piqués.',stageId:'old_silent_hill'}),
  monster('sh1','Monster Cybil',{kind:'humanoid',archetype:'zoner',boss:true,signature:'Service possédé',behavior:'Tirs de pistolet et pression rapprochée sous contrôle parasitaire.',weapon:'pistol',stageId:'lakeside_amusement'}),
  monster('sh1','Incubator',{kind:'deity',archetype:'boss',boss:true,signature:'Éclair blanc',behavior:'Flotte et projette des éclairs verticaux.',stageId:'nowhere',aura:'white'}),
  monster('sh1','Incubus',{kind:'deity',archetype:'boss',boss:true,signature:'Foudre du démon',behavior:'Entité ailée lançant des salves électriques.',stageId:'nowhere',aura:'black',limbs:6}),
  monster('sh1','Bloodsucker',{kind:'serpentine',archetype:'grappler',category:'SET PIECE',signature:'Vrilles hématophages',behavior:'Masse de tentacules fixée au décor, attirée par le sang et neutralisée par diversion.',stageId:'hospital_nightmare',adaptation:'Obstacle non combattu directement dans le jeu source ; sa jauge représente son ancrage au décor.',catalogueStatus:'canon-set-piece-adapted',unlock:'archive',affliction:'bleed'}),

  // SILENT HILL 2
  monster('sh2','Lying Figure',{kind:'humanoid',archetype:'zoner',signature:'Jet acide',behavior:'Se traîne dans une enveloppe charnelle et crache un fluide corrosif.',head:'wrapped'}),
  monster('sh2','Lying Figure — Crawling',{kind:'humanoid',archetype:'rushdown',signature:'Ruée rampante',behavior:'Variante au sol qui fonce sous les attaques hautes.',variantOf:'Lying Figure',variant:'Remake encounter variant',scale:.82}),
  monster('sh2','Mannequin',{kind:'mannequin',archetype:'trickster',signature:'Ciseaux de jambes',behavior:'Reste immobile puis attaque avec ses membres doubles.',limbs:4}),
  monster('sh2','Mannequin — Ambusher',{kind:'mannequin',archetype:'trickster',signature:'Embuscade murale',behavior:'Variante d’embuscade adaptée des rencontres du remake.',variantOf:'Mannequin',variant:'Remake encounter variant',limbs:4}),
  monster('sh2','Bubble Head Nurse',{kind:'nurse',archetype:'balanced',signature:'Tube d’urgence',behavior:'Déplacements saccadés et coups de tuyau.',weapon:'pipe'}),
  monster('sh2','Creeper',{kind:'insect',archetype:'swarm',signature:'Passage sous la garde',behavior:'Insecte rapide au ras du sol.',variant:'Silent Hill 2'}),
  monster('sh2','Mandarin',{kind:'wall',archetype:'zoner',signature:'Langue pendulaire',behavior:'Attaque depuis une grille ou un rebord avec de longs appendices.',stageId:'hotel_otherworld'}),
  monster('sh2','Flesh Lip',{kind:'cage',archetype:'grappler',boss:true,signature:'Cage suspendue',behavior:'Corps enfermé dans un cadre métallique, saisies et chutes verticales.',stageId:'brookhaven_sh2'}),
  monster('sh2','Abstract Daddy',{kind:'mass',archetype:'grappler',boss:true,signature:'Écrasement du cadre',behavior:'Charge lourde et saisie oppressante dans un espace étroit.',stageId:'labyrinth'}),
  monster('sh2','Red Pyramid Thing — Great Knife',{kind:'pyramid',archetype:'juggernaut',boss:true,signature:'Traînée du Grand Couteau',behavior:'Avance lente, portée immense, coups télégraphiés extrêmement puissants.',weapon:'great_knife',stageId:'blue_creek'}),
  monster('sh2','Red Pyramid Thing — Spear',{kind:'pyramid',archetype:'zoner',boss:true,signature:'Percée de la lance',behavior:'Version finale plus mobile, attaques de lance et pression à distance.',weapon:'spear',stageId:'hotel_otherworld',variantOf:'Red Pyramid Thing'}),
  monster('sh2','Twin Pyramid Heads',{kind:'pyramid',archetype:'boss',boss:true,signature:'Sentence jumelle',behavior:'Duo synchronisé adapté en combattant unique à doubles frappes.',weapon:'spear',stageId:'hotel_otherworld',limbs:4}),
  monster('sh2','Eddie Dombrowski',{kind:'humanoid',archetype:'zoner',boss:true,category:'HUMAN BOSS',signature:'Tir de l’abattoir',behavior:'Tire, change de ligne et utilise le décor froid comme couverture.',weapon:'revolver',stageId:'toluca_prison'}),
  monster('sh2','Maria — Final Manifestation',{kind:'deity',archetype:'boss',boss:true,signature:'Essaim de papillons',behavior:'Entité suspendue qui harcèle par insectes et vrilles.',stageId:'hotel_otherworld',aura:'moths'}),
  monster('sh2','Mary — Final Manifestation',{kind:'deity',archetype:'boss',boss:true,signature:'Lit de souffrance',behavior:'Variante narrative de la manifestation finale.',variantOf:'Maria — Final Manifestation',stageId:'hotel_otherworld',aura:'moths'}),
  monster('sh2','Prisoner',{kind:'ghost',archetype:'ghost',signature:'Rituel derrière les barreaux',behavior:'Présence invisible adaptée en ondes sonores et frappes hors champ.',stageId:'toluca_prison',unlock:'archive'}),
  monster('sh2','Spider Mannequin',{kind:'spider',archetype:'trickster',signature:'Embuscade arachnéenne',behavior:'Variante du remake qui s’agrippe aux murs et plafonds avant de bondir.',variantOf:'Mannequin',variant:'Silent Hill 2 remake',stageId:'blue_creek',limbs:8,nameStatus:'official-or-established',evidenceTier:'screen-verified'}),
  monster('sh2','Mandarin — Floor Form',{kind:'wall',archetype:'zoner',signature:'Langue du plancher',behavior:'Adaptation au sol de la manifestation suspendue sous les grilles, conservant sa langue pendulaire.',variantOf:'Mandarin',variant:'Versus adaptation',stageId:'hotel_otherworld',catalogueStatus:'canon-variant-adapted'}),

  // SILENT HILL 3
  monster('sh3','Closer',{kind:'giant',archetype:'juggernaut',signature:'Bras pendulaires',behavior:'Grande créature aux bras massifs, frappe large et lente.'}),
  monster('sh3','Closer — Church Variant',{kind:'giant',archetype:'juggernaut',signature:'Lame ecclésiale',behavior:'Variante verdâtre de fin de jeu, plus rapide et plus forte dans l’Église.',variantOf:'Closer',variant:'Church transformation',stageId:'church',color:'#53634d',accent:'#a9a36f'}),
  monster('sh3','Numb Body — Small',{kind:'humanoid',archetype:'rushdown',signature:'Percussion sans visage',behavior:'Petit corps rapide qui fonce en groupe.',scale:.72}),
  monster('sh3','Numb Body — Medium',{kind:'humanoid',archetype:'balanced',signature:'Bélier engourdi',behavior:'Taille intermédiaire documentée entre les petites et grandes formes.',variantOf:'Numb Body',scale:.94}),
  monster('sh3','Numb Body — Large',{kind:'giant',archetype:'juggernaut',signature:'Charge engourdie',behavior:'Variante plus grande et résistante.',variantOf:'Numb Body',scale:1.2}),
  monster('sh3','Pendulum',{kind:'insect',archetype:'flyer',signature:'Lames oscillantes',behavior:'Créature aérienne métallique, trajectoires imprévisibles.',limbs:6}),
  monster('sh3','Double Head',{kind:'quadruped',archetype:'rushdown',signature:'Double morsure',behavior:'Canidé bandé, bond et morsure prolongée.',head:'double'}),
  monster('sh3','Insane Cancer',{kind:'mass',archetype:'juggernaut',signature:'Masse cancéreuse',behavior:'Lent, immense, encaisse puis écrase.'}),
  monster('sh3','Slurper',{kind:'humanoid',archetype:'rushdown',signature:'Rapt au sol',behavior:'Rampe rapidement et tente de renverser la cible.',scale:.78}),
  monster('sh3','Nurse — Pipe',{kind:'nurse',archetype:'balanced',signature:'Tuyau clinique',behavior:'Enchaînement de coups de tuyau.',weapon:'pipe'}),
  monster('sh3','Nurse — Revolver',{kind:'nurse',archetype:'zoner',signature:'Décharge clinique',behavior:'Variante armée capable de tirer.',weapon:'revolver',variantOf:'Nurse'}),
  monster('sh3','Scraper',{kind:'humanoid',archetype:'rushdown',signature:'Lames de l’ordre',behavior:'Serviteur masqué, enchaînements rapides.',weapon:'blades'}),
  monster('sh3','Split Worm',{kind:'worm',archetype:'boss',boss:true,signature:'Gueule du tunnel',behavior:'Surgit des ouvertures, mord puis se retire.',stageId:'shopping_mall',head:'split'}),
  monster('sh3','Missionary',{kind:'humanoid',archetype:'boss',boss:true,signature:'Lames du missionnaire',behavior:'Bloque les tirs et attaque avec deux armes courtes.',weapon:'tonfas',stageId:'apartment_roof'}),
  monster('sh3','Leonard Wolf',{kind:'giant',archetype:'boss',boss:true,signature:'Assaut submergé',behavior:'Boss massif, charges et émergences aquatiques.',stageId:'brookhaven_sh3'}),
  monster('sh3','Memory of Alessa',{kind:'humanoid',archetype:'trickster',boss:true,signature:'Arsenal des souvenirs',behavior:'Change d’arme et reproduit plusieurs styles de Heather.',weapon:'arsenal',stageId:'lakeside_amusement'}),
  monster('sh3','God',{kind:'deity',archetype:'boss',boss:true,signature:'Brasier divin',behavior:'Entité gigantesque, griffes et colonnes de feu.',stageId:'church',aura:'fire'}),
  monster('sh3','Valtiel',{kind:'humanoid',archetype:'ghost',category:'SECRET',signature:'Rotation du sceau',behavior:'Présence habituellement non combattue, adaptée en gardien rituel.',weapon:'none',stageId:'church',unlock:'archive'}),
  monster('sh3','Sewer Creature',{kind:'serpentine',archetype:'boss',boss:true,category:'SET PIECE',signature:'Tentacule du canal',behavior:'Tentacule aquatique attaquant depuis plusieurs conduits.',stageId:'sewers'}),
  monster('sh3','Glutton',{kind:'giant',archetype:'grappler',category:'SET PIECE',signature:'Gueule du conte',behavior:'Créature bloquant un passage, neutralisée dans le jeu source par la récitation d’un conte de fées.',stageId:'nightmare_hilltop',adaptation:'Obstacle narratif non combattu directement ; adapté en gardien de seuil dont la défense se brise par rythme.',catalogueStatus:'canon-set-piece-adapted',unlock:'archive'}),

  // SILENT HILL 4
  monster('sh4','Sniffer Dog — Male',{kind:'quadruped',archetype:'rushdown',signature:'Morsure renifleuse',behavior:'Canidé rapide, attaque en meute.'}),
  monster('sh4','Sniffer Dog — Female',{kind:'quadruped',archetype:'rushdown',signature:'Bond de la femelle',behavior:'Variante plus agressive.',variantOf:'Sniffer Dog'}),
  monster('sh4','Hummer',{kind:'flyer',archetype:'swarm',signature:'Nuée bourdonnante',behavior:'Petite créature volante attaquant en groupe.'}),
  monster('sh4','Wall Man',{kind:'wall',archetype:'artillery',signature:'Bras mural',behavior:'Émerge d’une paroi et contrôle une zone verticale.',stageId:'subway_world'}),
  monster('sh4','Gum Head — Old Type',{kind:'humanoid',archetype:'balanced',signature:'Clé volée',behavior:'Humanoïde simiesque capable de saisir et d’utiliser des objets.',weapon:'club'}),
  monster('sh4','Gum Head — New Type',{kind:'humanoid',archetype:'rushdown',signature:'Ruée simiesque',behavior:'Variante plus rapide et agressive.',variantOf:'Gum Head',weapon:'club'}),
  monster('sh4','Twin Victim',{kind:'giant',archetype:'juggernaut',signature:'Marche des deux corps',behavior:'Grand corps à deux têtes qui charge et martèle.',head:'twin'}),
  monster('sh4','Patient',{kind:'humanoid',archetype:'juggernaut',signature:'Escalier de l’hôpital',behavior:'Frappe avec une arme lourde et produit des sons discordants.',weapon:'club'}),
  monster('sh4','Toadstool',{kind:'fungus',archetype:'swarm',signature:'Spore toxique',behavior:'Champignon mobile qui libère une petite zone nocive.'}),
  monster('sh4','Whitestool',{kind:'fungus',archetype:'swarm',signature:'Poussée pâle',behavior:'Variante de Toadstool.',variantOf:'Toadstool'}),
  monster('sh4','Tremer — Blue',{kind:'insect',archetype:'swarm',signature:'Fourmillement bleu',behavior:'Très petite créature rapide.',color:'#405c6c'}),
  monster('sh4','Tremer — Red',{kind:'insect',archetype:'swarm',signature:'Fourmillement rouge',behavior:'Variante plus agressive.',variantOf:'Tremer',color:'#713f3d'}),
  monster('sh4','Bottom',{kind:'mass',archetype:'juggernaut',signature:'Masse inférieure',behavior:'Version renforcée du Twin Victim.',variantOf:'Twin Victim',head:'twin'}),
  monster('sh4','Ghost — Victim',{kind:'ghost',archetype:'ghost',signature:'Étreinte persistante',behavior:'Victime immortelle qui traverse les obstacles et inflige une aura.',aura:'pain'}),

  monster('sh4','Jimmy Stone — Victim 1',{kind:'ghost',archetype:'ghost',signature:'Red Devil',behavior:'Fantôme ancien particulièrement persistant, associé au premier sacrifice.',stageId:'forest_world',variantOf:'Ghost — Victim',weapon:'pistol',aura:'pain'}),
  monster('sh4','Steve Garland — Victim 4',{kind:'ghost',archetype:'grappler',signature:'Truelle du vendeur',behavior:'Fantôme ancien armé d’une truelle, pression de proximité et saisies.',stageId:'subway_world',variantOf:'Ghost — Victim',weapon:'knife'}),
  monster('sh4','Eric Walsh — Victim 10',{kind:'ghost',archetype:'rushdown',signature:'Ruée du barman',behavior:'Fantôme ancien plus agressif, attaque par accélérations soudaines.',stageId:'building_world',variantOf:'Ghost — Victim'}),
  monster('sh4','Peter Walls — Victim 12',{kind:'ghost',archetype:'ghost',signature:'Vide du reporter',behavior:'Fantôme ancien qui traverse le décor et impose une aura de proximité.',stageId:'subway_world',variantOf:'Ghost — Victim'}),
  monster('sh4','Sharon Blake — Victim 13',{kind:'ghost',archetype:'trickster',signature:'Obscurité de Sharon',behavior:'Fantôme ancien utilisant disparitions et réapparitions latérales.',stageId:'forest_world',variantOf:'Ghost — Victim',aura:'dark'}),
  monster('sh4','Toby Archbolt — Victim 14',{kind:'ghost',archetype:'zoner',signature:'Gloom du pasteur',behavior:'Fantôme ancien contrôlant la distance par ondes de présence.',stageId:'forest_world',variantOf:'Ghost — Victim'}),
  monster('sh4','Joseph Schreiber — Victim 15',{kind:'ghost',archetype:'balanced',category:'SECRET',signature:'Désespoir du témoin',behavior:'Présence non hostile dans le jeu source, adaptée comme combattant d’archive défensif.',stageId:'room_302',variantOf:'Ghost — Victim',catalogueStatus:'canon-nonhostile-adapted',unlock:'archive'}),
  monster('sh4','Cynthia Velasquez — Victim 16',{kind:'ghost',archetype:'trickster',signature:'Temptation spectrale',behavior:'Fantôme de nouvelle génération, rapide et difficile à immobiliser.',stageId:'subway_world',variantOf:'Ghost — Victim'}),
  monster('sh4','Jasper Gein — Victim 17',{kind:'ghost',archetype:'artillery',signature:'Candélabre enflammé',behavior:'Fantôme de nouvelle génération, lié au feu et aux attaques à distance.',stageId:'forest_world',variantOf:'Ghost — Victim',weapon:'club',affliction:'burn',aura:'fire'}),
  monster('sh4','Andrew DeSalvo — Victim 18',{kind:'ghost',archetype:'juggernaut',signature:'Watchfulness',behavior:'Fantôme lourd et résistant, pression continue dans la prison.',stageId:'water_prison',variantOf:'Ghost — Victim'}),
  monster('sh4','Richard Braintree — Victim 19',{kind:'ghost',archetype:'rushdown',signature:'Crowbar du chaos',behavior:'Fantôme électrocuté armé d’un pied-de-biche, très agressif.',stageId:'building_world',variantOf:'Ghost — Victim',weapon:'club',affliction:'static'}),
  monster('sh4','Man with the Coat',{kind:'humanoid',archetype:'zoner',boss:true,signature:'Poursuite de Walter',behavior:'Traque avec arme à feu ou arme blanche.',weapon:'pistol',stageId:'apartment_world'}),
  monster('sh4','Wheelchair',{kind:'wheelchair',archetype:'ghost',signature:'Percussion hantée',behavior:'Objet invulnérable dans le jeu d’origine, adapté en charge spectrale.',adaptation:'La chaise ne peut être vaincue dans son apparition d’origine ; ici elle dispose d’une jauge de stabilité.',stageId:'hospital_world'}),
  monster('sh4','Greedy Worm',{kind:'worm',archetype:'artillery',signature:'Conduit vivant',behavior:'Structure vivante habituellement passive, adaptée en contrôle du terrain.',unlock:'archive'}),
  monster('sh4','One Truth',{kind:'giant',archetype:'boss',boss:true,signature:'Visages du puits',behavior:'Forme finale du Twin Victim, attaques lourdes et pulsations.',stageId:'water_prison'}),
  monster('sh4','Sacrificed Walter',{kind:'mass',archetype:'boss',boss:true,signature:'Rituel des vingt-et-un',behavior:'Corps monumental lié au rituel, invocations et ondes.',stageId:'apartment_world'}),
  monster('sh4','Walter Sullivan',{kind:'humanoid',archetype:'boss',boss:true,category:'HUMAN BOSS',signature:'Assaut du ritualiste',behavior:'Alterner arme à feu, tronçonneuse et déplacement agressif.',weapon:'chainsaw',stageId:'apartment_world'}),
  monster('sh4','Eileen Head',{kind:'giant',archetype:'artillery',category:'SET PIECE',signature:'Regard monumental',behavior:'Tête géante non combattue, adaptée en boss de décor.',stageId:'hospital_world',unlock:'archive'}),

  // ORIGINS
  monster('origins','Straight-Jacket',{kind:'humanoid',archetype:'zoner',signature:'Crachat contraint',behavior:'Corps enfermé qui projette un liquide et frappe du torse.'}),
  monster('origins','Faceless Nurse',{kind:'nurse',archetype:'balanced',signature:'Seringue de Cedar Grove',behavior:'Attaque au scalpel et mouvement irrégulier.',weapon:'scalpel'}),
  monster('origins','Carrion',{kind:'quadruped',archetype:'juggernaut',signature:'Masse charognarde',behavior:'Bête lourde qui charge au sol.'}),
  monster('origins','Remnant',{kind:'ghost',archetype:'ghost',signature:'Ombre miroir',behavior:'Silhouette projetée qui apparaît au contact des miroirs.'}),
  monster('origins','Ariel',{kind:'doll',archetype:'trickster',signature:'Fil de marionnette',behavior:'Mannequin suspendu, coups de jambes et chutes verticales.'}),
  monster('origins','Caliban',{kind:'giant',archetype:'juggernaut',signature:'Charge de Caliban',behavior:'Grande créature animale à membres disloqués.'}),
  monster('origins','Two-Back',{kind:'mass',archetype:'grappler',signature:'Étreinte double',behavior:'Masse à deux corps, saisie et écrasement.'}),
  monster('origins','The Butcher',{kind:'humanoid',archetype:'juggernaut',boss:true,signature:'Couperet du boucher',behavior:'Avance lente, immense portée au couperet.',weapon:'cleaver',stageId:'riverside_motel'}),
  monster('origins','Memory of Helen Grady',{kind:'cage',archetype:'boss',boss:true,signature:'Cage maternelle',behavior:'Boss suspendu, attaques de cage et projections.',stageId:'cedar_grove'}),
  monster('origins','Memory of Richard Grady',{kind:'giant',archetype:'boss',boss:true,signature:'Poings du père',behavior:'Boss massif, coups directs et charge.',stageId:'riverside_motel'}),
  monster('origins','Demon',{kind:'deity',archetype:'boss',boss:true,signature:'Flammes du Flauros',behavior:'Entité ailée, feu et frappes plongeantes.',stageId:'antique_shop',aura:'fire'}),

  // HOMECOMING
  monster('homecoming','Lurker',{kind:'humanoid',archetype:'rushdown',signature:'Lames rampantes',behavior:'Créature basse aux bras-lames, bond rapide.',limbs:4}),
  monster('homecoming','Feral',{kind:'quadruped',archetype:'rushdown',signature:'Traque férale',behavior:'Canidé écorché, esquive et morsure.'}),
  monster('homecoming','Smog',{kind:'humanoid',archetype:'zoner',signature:'Nuage de smog',behavior:'Ouvre sa cage thoracique pour libérer un nuage toxique.',aura:'smoke'}),
  monster('homecoming','Needler',{kind:'spider',archetype:'trickster',signature:'Garde des lames',behavior:'Bloque de face et frappe avec quatre membres-lames.',limbs:6}),
  monster('homecoming','Schism',{kind:'humanoid',archetype:'juggernaut',signature:'Crâne tranchant',behavior:'Tête en lame, coups verticaux puissants.',head:'blade'}),
  monster('homecoming','Siam',{kind:'giant',archetype:'grappler',signature:'Corps enlacés',behavior:'Deux corps liés, grande portée et saisie.'}),
  monster('homecoming','Order Soldier',{kind:'humanoid',archetype:'balanced',category:'HUMAN ENEMY',signature:'Matraque de l’Ordre',behavior:'Combattant humain armé.',weapon:'baton'}),
  monster('homecoming','Nurse',{kind:'nurse',archetype:'balanced',signature:'Scalpel de l’hôpital',behavior:'Réagit à la lumière et frappe au scalpel dans l’hôpital cauchemardesque.',weapon:'scalpel',stageId:'nightmare_hospital_hc'}),
  monster('homecoming','Swarm',{kind:'insect',archetype:'swarm',signature:'Nuée de cafards',behavior:'Petites créatures qui encerclent et attaquent au ras du sol.',stageId:'nightmare_hospital_hc'}),
  monster('homecoming','Curtis Ackers',{kind:'humanoid',archetype:'boss',boss:true,category:'HUMAN BOSS',signature:'Scie de Curtis',behavior:'Affrontement humain agressif dans l’atelier, utilisant une scie circulaire.',weapon:'chainsaw',stageId:'curtis_shop'}),
  monster('homecoming','Bogeyman',{kind:'pyramid',archetype:'juggernaut',boss:true,signature:'Grande lame du Bogeyman',behavior:'Exécuteur massif de Homecoming.',weapon:'great_knife'}),
  monster('homecoming','Sepulcher',{kind:'giant',archetype:'boss',boss:true,signature:'Frappe des racines',behavior:'Boss pendu qui écrase et frappe avec ses appendices.',stageId:'shepherds_glen',limbs:6}),
  monster('homecoming','Scarlet — Doll Form',{kind:'doll',archetype:'boss',boss:true,signature:'Danse de porcelaine',behavior:'Poupée géante, coups longs et bris de membres.',stageId:'grand_hotel'}),
  monster('homecoming','Scarlet — Spider Form',{kind:'spider',archetype:'boss',boss:true,signature:'Mue arachnéenne',behavior:'Seconde phase rapide au plafond.',variantOf:'Scarlet',stageId:'grand_hotel',limbs:8}),
  monster('homecoming','Asphyxia',{kind:'serpentine',archetype:'boss',boss:true,signature:'Anneau de bras',behavior:'Corps composé de multiples bras, balayages circulaires.',stageId:'church_hc',limbs:12}),
  monster('homecoming','Amnion — Hanging Form',{kind:'spider',archetype:'boss',boss:true,signature:'Pattes de la mère',behavior:'Boss arachnéen suspendu, frappes de pattes.',stageId:'underground_hc',limbs:8}),
  monster('homecoming','Amnion — Exposed Form',{kind:'mass',archetype:'boss',boss:true,signature:'Noyau exposé',behavior:'Seconde phase vulnérable mais agressive.',variantOf:'Amnion',stageId:'underground_hc'}),

  // SHATTERED MEMORIES
  monster('shattered','Raw Shock — Base',{kind:'humanoid',archetype:'rushdown',signature:'Étreinte glacée',behavior:'Poursuit et agrippe ; n’est pas affronté directement dans l’original.',adaptation:'Le gameplay original privilégie la fuite ; le versus transforme l’étreinte en projection.',affliction:'frost'}),
  monster('shattered','Raw Shock — Feminine',{kind:'humanoid',archetype:'grappler',signature:'Étreinte féminine',behavior:'Variation morphologique déterminée par le profil psychologique.',variantOf:'Raw Shock',affliction:'frost'}),
  monster('shattered','Raw Shock — Diseased',{kind:'humanoid',archetype:'ghost',signature:'Pulsation malade',behavior:'Variation couverte de lésions, aura affaiblissante.',variantOf:'Raw Shock',aura:'sick',affliction:'frost'}),
  monster('shattered','Raw Shock — Abstract',{kind:'mass',archetype:'trickster',signature:'Forme abstraite',behavior:'Variation géométrique, hitbox changeante.',variantOf:'Raw Shock',affliction:'frost'}),
  monster('shattered','Raw Shock — Atrophied',{kind:'child',archetype:'rushdown',signature:'Ruée atrophiée',behavior:'Variation plus petite et nerveuse.',variantOf:'Raw Shock',affliction:'frost'}),

  // DOWNPOUR
  monster('downpour','Screamer',{kind:'humanoid',archetype:'zoner',signature:'Cri incapacitant',behavior:'Cri à distance puis griffes rapprochées.'}),
  monster('downpour','Weeping Bat',{kind:'humanoid',archetype:'trickster',signature:'Chute de la chauve-souris',behavior:'Grimpe, se camoufle et bondit depuis les hauteurs.'}),
  monster('downpour','Doll',{kind:'doll',archetype:'trickster',signature:'Ombres de la poupée',behavior:'Projette des silhouettes et se cache derrière ses doubles.'}),
  monster('downpour','Shadow',{kind:'ghost',archetype:'ghost',signature:'Double intangible',behavior:'Projection invoquée par la Doll.',variantOf:'Doll'}),
  monster('downpour','Prisoner Minion — Brawler',{kind:'humanoid',archetype:'balanced',signature:'Combo du prisonnier',behavior:'Combattant rapide au corps à corps.'}),
  monster('downpour','Prisoner Minion — Agile',{kind:'humanoid',archetype:'rushdown',signature:'Esquive du prisonnier',behavior:'Variante plus mobile.',variantOf:'Prisoner Minion'}),
  monster('downpour','Prisoner Juggernaut',{kind:'giant',archetype:'juggernaut',signature:'Plaquage du juggernaut',behavior:'Très résistant, charge et projection.'}),
  monster('downpour','Tormented Soul',{kind:'ghost',archetype:'ghost',signature:'Souffle du tourment',behavior:'Apparition liée aux séquences de l’Otherworld.'}),
  monster('downpour','Wall Corpse',{kind:'wall',archetype:'artillery',signature:'Jet du cadavre mural',behavior:'Créature fixée au mur projetant des substances.'}),
  monster('downpour','Void',{kind:'void',archetype:'boss',boss:true,category:'CHASE BOSS',signature:'Dévoration de l’espace',behavior:'Poursuite de l’Otherworld adaptée en mur avançant.',stageId:'overlook',adaptation:'Le Void est une menace de poursuite ; ici sa jauge représente la distance restante avant absorption.'}),
  monster('downpour','Monocle Man',{kind:'humanoid',archetype:'ghost',signature:'Regard du monocle',behavior:'Apparition symbolique adaptée en combattant secret.',unlock:'archive'}),
  monster('downpour','Bogeyman',{kind:'humanoid',archetype:'juggernaut',boss:true,signature:'Marteau du Bogeyman',behavior:'Frappe au marteau, exécution lente et massive.',weapon:'hammer',stageId:'overlook'}),
  monster('downpour','Wheelman',{kind:'wheelchair',archetype:'boss',boss:true,signature:'Machine du Wheelman',behavior:'Boss final mécanisé, câbles et décharges.',stageId:'overlook',limbs:6}),
  monster('downpour','Anne Cunningham',{kind:'humanoid',archetype:'balanced',boss:true,category:'HUMAN BOSS',signature:'Interception d’Anne',behavior:'Affrontement narratif humain adapté depuis la confrontation finale et le scénario complémentaire.',weapon:'pistol',stageId:'anne_fight',catalogueStatus:'canon-human-boss-adapted'}),

  // THE ARCADE
  monster('arcade','Mama',{kind:'giant',archetype:'boss',boss:true,signature:'Étreinte de Mama',behavior:'Boss unique de The Arcade, coups massifs et invocations.',stageId:'arcade_ship'}),
  monster('arcade','Phantom',{kind:'ghost',archetype:'boss',boss:true,signature:'Assaut spectral',behavior:'Boss fantomatique unique, téléportations et projectiles.',stageId:'arcade_ship'}),
  monster('arcade','Greedy Worm — Arcade',{kind:'worm',archetype:'boss',boss:true,signature:'Tunnel de l’Arcade',behavior:'Adaptation active du Greedy Worm pour l’arcade.',variantOf:'Greedy Worm',stageId:'arcade_ship'}),
  monster('arcade','Split Worm — Arcade',{kind:'worm',archetype:'boss',boss:true,signature:'Gueule du tunnel d’arcade',behavior:'Retour du Split Worm dans un format rail-shooter.',variantOf:'Split Worm',stageId:'arcade_ship',head:'split'}),

  monster('arcade','Tremer — Arcade',{kind:'insect',archetype:'swarm',signature:'Fourmillement du rail',behavior:'Retour du Tremer dans les vagues de The Arcade.',variantOf:'Tremer',stageId:'arcade_historical'}),
  monster('arcade','Double Head — Arcade',{kind:'quadruped',archetype:'rushdown',signature:'Morsure sur rail',behavior:'Retour du Double Head dans les rues et couloirs de The Arcade.',variantOf:'Double Head',stageId:'arcade_city',head:'double'}),
  monster('arcade','Insane Cancer — Arcade',{kind:'mass',archetype:'juggernaut',signature:'Blocage du corridor',behavior:'Retour massif de l’Insane Cancer dans les séquences de tir.',variantOf:'Insane Cancer',stageId:'arcade_hospital'}),
  monster('arcade','Hummer — Arcade',{kind:'flyer',archetype:'swarm',signature:'Nuée de l’hôpital',behavior:'Retour des Hummers en essaims aériens.',variantOf:'Hummer',stageId:'arcade_hospital'}),
  monster('arcade','Numb Body — Arcade',{kind:'humanoid',archetype:'rushdown',signature:'Charge de la galerie',behavior:'Retour du Numb Body en vagues rapides.',variantOf:'Numb Body',stageId:'arcade_mall'}),
  monster('arcade','Nurse — Arcade',{kind:'nurse',archetype:'balanced',signature:'Service de Brookhaven',behavior:'Retour des infirmières dans Brookhaven.',variantOf:'Nurse',stageId:'arcade_hospital',weapon:'pipe'}),
  monster('arcade','Gum Head — Arcade',{kind:'humanoid',archetype:'balanced',signature:'Assaut du métro',behavior:'Retour du Gum Head, parfois armé, dans les vagues de The Arcade.',variantOf:'Gum Head',stageId:'arcade_prison',weapon:'club'}),
  monster('arcade','Red Pyramid Thing — Arcade',{kind:'pyramid',archetype:'boss',boss:true,signature:'Sentence sur rail',behavior:'Affrontement de Red Pyramid Thing adapté au rail-shooter.',variantOf:'Red Pyramid Thing',stageId:'arcade_historical',weapon:'great_knife'}),
  monster('arcade','Creeper — Arcade',{kind:'insect',archetype:'swarm',signature:'Essaim des égouts',behavior:'Retour des Creepers en groupes au ras du sol.',variantOf:'Creeper',stageId:'arcade_prison'}),
  monster('arcade','Scraper — Arcade',{kind:'humanoid',archetype:'rushdown',signature:'Lames sur rail',behavior:'Retour du Scraper dans les zones de culte.',variantOf:'Scraper',stageId:'arcade_1918',weapon:'blades'}),
  monster('arcade','Toadstool — Arcade',{kind:'fungus',archetype:'swarm',signature:'Spore du cimetière',behavior:'Retour du Toadstool dans les zones souterraines.',variantOf:'Toadstool',stageId:'arcade_graveyard'}),
  monster('arcade','Tuberculosis',{kind:'mass',archetype:'boss',boss:true,signature:'Poumon de Brookhaven',behavior:'Boss de toit de Brookhaven, masse respiratoire qui attaque par souffle et appendices.',stageId:'arcade_hospital_roof',affliction:'decay',aura:'sick'}),
  monster('arcade','Robbie the Rabbit — Axe',{kind:'doll',archetype:'rushdown',signature:'Hache de Robbie',behavior:'Mascotte hostile armée d’une hache dans The Arcade.',stageId:'arcade_amusement',weapon:'cleaver',catalogueStatus:'canon-enemy-variant'}),
  monster('arcade','Robbie the Rabbit — Chainsaw',{kind:'doll',archetype:'juggernaut',signature:'Tronçonneuse de Robbie',behavior:'Variante hostile de Robbie armée d’une tronçonneuse.',stageId:'arcade_amusement',weapon:'chainsaw',variantOf:'Robbie the Rabbit'}),
  monster('arcade','Robbie the Rabbit — Shotgun',{kind:'doll',archetype:'zoner',signature:'Décharge de Robbie',behavior:'Variante hostile de Robbie armée d’un fusil.',stageId:'arcade_amusement',weapon:'pistol',variantOf:'Robbie the Rabbit'}),

  // BOOK OF MEMORIES — variantes et gardiens du roster du jeu
  monster('bom','Air Screamer',{kind:'flyer',archetype:'flyer',signature:'Piqué du livre',behavior:'Version Book of Memories.',variantOf:'Air Screamer'}),
  monster('bom','Bogeyman',{kind:'humanoid',archetype:'juggernaut',signature:'Marteau du livre',behavior:'Version Book of Memories.',weapon:'hammer',variantOf:'Bogeyman'}),
  monster('bom','Butcher',{kind:'humanoid',archetype:'juggernaut',signature:'Couperet du livre',behavior:'Version Book of Memories.',weapon:'cleaver',variantOf:'The Butcher'}),
  monster('bom','Double Head',{kind:'quadruped',archetype:'rushdown',signature:'Morsure du livre',behavior:'Version Book of Memories.',variantOf:'Double Head'}),
  monster('bom','Ghost',{kind:'ghost',archetype:'ghost',signature:'Passage du livre',behavior:'Version Book of Memories.',variantOf:'Ghost — Victim'}),
  monster('bom','Insane Cancer',{kind:'mass',archetype:'juggernaut',signature:'Tumeur du livre',behavior:'Version Book of Memories.',variantOf:'Insane Cancer'}),
  monster('bom','Needler',{kind:'spider',archetype:'trickster',signature:'Garde du livre',behavior:'Version Book of Memories.',variantOf:'Needler',limbs:6}),
  monster('bom','Nurse',{kind:'nurse',archetype:'balanced',signature:'Soins du livre',behavior:'Version Book of Memories.',variantOf:'Nurse'}),
  monster('bom','Pyramid Head',{kind:'pyramid',archetype:'juggernaut',signature:'Jugement du livre',behavior:'Version Book of Memories.',variantOf:'Red Pyramid Thing',weapon:'great_knife'}),
  monster('bom','Schism',{kind:'humanoid',archetype:'juggernaut',signature:'Scission du livre',behavior:'Version Book of Memories.',variantOf:'Schism',head:'blade'}),
  monster('bom','Straight-Jacket',{kind:'humanoid',archetype:'zoner',signature:'Contrainte du livre',behavior:'Version Book of Memories.',variantOf:'Straight-Jacket'}),
  monster('bom','Swarm',{kind:'insect',archetype:'swarm',signature:'Nuée du livre',behavior:'Petites créatures en essaim.'}),
  monster('bom','Tremer',{kind:'insect',archetype:'swarm',signature:'Fourmillement du livre',behavior:'Version Book of Memories.',variantOf:'Tremer'}),
  monster('bom','Flesh Lips',{kind:'cage',archetype:'grappler',boss:true,signature:'Cage du livre',behavior:'Version Book of Memories.',variantOf:'Flesh Lip'}),
  monster('bom','Mother',{kind:'mass',archetype:'boss',boss:true,signature:'Matrice du livre',behavior:'Boss propre au Book of Memories, invocations et masse charnelle.',stageId:'book_zone'}),
  monster('bom','Valtiel',{kind:'humanoid',archetype:'boss',boss:true,signature:'Gardien du livre',behavior:'Version boss de Valtiel.',variantOf:'Valtiel',stageId:'book_zone'}),
  monster('bom','Fire Guardian',{kind:'deity',archetype:'boss',boss:true,signature:'Cercle de feu',behavior:'Gardien élémentaire du feu.',aura:'fire',stageId:'book_fire'}),
  monster('bom','Wood Guardian',{kind:'deity',archetype:'boss',boss:true,signature:'Racines du bois',behavior:'Gardien élémentaire du bois.',aura:'wood',stageId:'book_wood'}),
  monster('bom','Wood Sapling',{kind:'fungus',archetype:'swarm',signature:'Jeune racine',behavior:'Invocation du Wood Guardian.',variantOf:'Wood Guardian',stageId:'book_wood'}),
  monster('bom','Light Guardian',{kind:'deity',archetype:'boss',boss:true,signature:'Rayon de lumière',behavior:'Gardien élémentaire de la lumière.',aura:'light',stageId:'book_light'}),
  monster('bom','Water Guardian',{kind:'deity',archetype:'boss',boss:true,signature:'Vague du gardien',behavior:'Gardien élémentaire de l’eau.',aura:'water',stageId:'book_water'}),
  monster('bom','Earth Guardian',{kind:'giant',archetype:'boss',boss:true,signature:'Faille de terre',behavior:'Gardien élémentaire de la terre.',aura:'earth',stageId:'book_earth'}),
  monster('bom','Blood Guardian',{kind:'deity',archetype:'boss',boss:true,signature:'Marée de sang',behavior:'Gardien élémentaire du sang.',aura:'blood',stageId:'book_blood'}),
  monster('bom','Blood Baby',{kind:'child',archetype:'swarm',signature:'Morsure du sang',behavior:'Petite invocation de la zone sang.',stageId:'book_blood'}),
  monster('bom','Blood Mama',{kind:'mass',archetype:'grappler',signature:'Protection maternelle',behavior:'Créature de la zone sang.',stageId:'book_blood'}),
  monster('bom','Steel Guardian',{kind:'giant',archetype:'boss',boss:true,signature:'Marteau d’acier',behavior:'Gardien élémentaire de l’acier.',aura:'steel',stageId:'book_steel'}),
  monster('bom','Gray Child',{kind:'child',archetype:'grappler',signature:'Couteau mémoire',behavior:'Contenu d’extension de Book of Memories.',variantOf:'Grey Child',weapon:'knife'}),
  monster('bom','Raw Shock',{kind:'humanoid',archetype:'rushdown',signature:'Étreinte mémoire',behavior:'Contenu d’extension de Book of Memories.',variantOf:'Raw Shock'}),

  // P.T. / THE SHORT MESSAGE
  monster('pt','Lisa',{kind:'ghost',archetype:'ghost',signature:'Apparition derrière soi',behavior:'Apparition et saisie soudaine dans la boucle du couloir.',stageId:'looping_hall',adaptation:'P.T. ne propose pas de combat ; Lisa devient un personnage secret de type apparition.',unlock:'archive'}),
  monster('shortmessage','Sakura Head',{kind:'flowerhead',archetype:'rushdown',boss:true,signature:'Poursuite des pétales',behavior:'Traque rapide, frappes de branches et accélérations soudaines.',stageId:'villa',head:'flowers',aura:'petals',affliction:'bloom'}),

  // SILENT HILL f
  monster('shf','Kashimashi',{kind:'humanoid',archetype:'balanced',signature:'Murmure double',behavior:'Créature humanoïde aux attaques coordonnées.',affliction:'bloom'}),
  monster('shf','Ayakakashi',{kind:'humanoid',archetype:'trickster',signature:'Masque trompeur',behavior:'Feinte, disparition brève et frappe latérale.',head:'mask',affliction:'bloom'}),
  monster('shf','Ara-abare',{kind:'giant',archetype:'juggernaut',signature:'Fureur d’Ebisugaoka',behavior:'Charge brutale et large balayage.'}),
  monster('shf','Irohihi',{kind:'humanoid',archetype:'zoner',signature:'Fil coloré',behavior:'Contrôle de distance avec appendices.'}),
  monster('shf','Corruptor',{kind:'fungus',archetype:'artillery',signature:'Floraison corruptrice',behavior:'Propage des zones de corruption au sol.',aura:'rot'}),
  monster('shf','Hatcher',{kind:'mass',archetype:'grappler',signature:'Éclosion charnelle',behavior:'Ouvre son corps pour saisir et libérer des rejetons.'}),
  monster('shf','Kamugara',{kind:'deity',archetype:'boss',boss:true,signature:'Sentence du sanctuaire',behavior:'Grande entité rituelle, balayages et sceaux.',stageId:'dark_shrine'}),
  monster('shf','Harai Katashiro',{kind:'doll',archetype:'trickster',signature:'Purification inversée',behavior:'Effigie rituelle, leurres et déplacements secs.',stageId:'dark_shrine'}),
  monster('shf','Oi-omoi',{kind:'mass',archetype:'juggernaut',signature:'Poids du regret',behavior:'Masse lourde qui ralentit l’espace proche.'}),
  monster('shf','Dark Hatcher',{kind:'mass',archetype:'boss',boss:true,signature:'Éclosion obscure',behavior:'Variante renforcée du Hatcher.',variantOf:'Hatcher',stageId:'dark_shrine',aura:'dark'}),
  monster('shf','Drum Monster',{kind:'giant',archetype:'artillery',signature:'Battement du tambour',behavior:'Ondes rythmiques et impacts à distance.',stageId:'festival_square',motif:'drum'}),
  monster('shf','Sakuko-Like Entity',{kind:'humanoid',archetype:'boss',boss:true,signature:'Mémoire de Sakuko',behavior:'Manifestation boss associée à Sakuko.',stageId:'school_shf'}),
  monster('shf','Rinko-Like Entity',{kind:'humanoid',archetype:'boss',boss:true,signature:'Mémoire de Rinko',behavior:'Manifestation boss associée à Rinko.',stageId:'school_shf'}),
  monster('shf','Hinako’s Father',{kind:'giant',archetype:'boss',boss:true,signature:'Autorité du père',behavior:'Manifestation parentale, frappes lourdes.',stageId:'hinako_home'}),
  monster('shf','Hinako’s Mother',{kind:'mass',archetype:'boss',boss:true,signature:'Entrave de la mère',behavior:'Manifestation parentale, saisies et zones.',stageId:'hinako_home'}),
  monster('shf','Shiromuku',{kind:'fox',archetype:'boss',boss:true,signature:'Procession blanche',behavior:'Entité cérémonielle, dashs et rubans tranchants.',stageId:'dark_shrine',aura:'white'}),
  monster('shf','Tsukumogami',{kind:'doll',archetype:'boss',boss:true,signature:'Objets éveillés',behavior:'Boss d’objets animés, changement de forme.',stageId:'dark_shrine'}),
  monster('shf','Shichibi',{kind:'fox',archetype:'boss',boss:true,signature:'Sept queues',behavior:'Renard rituel à sept queues, combos multiples.',stageId:'dark_shrine',limbs:7}),
  monster('shf','Kyubi',{kind:'fox',archetype:'boss',boss:true,signature:'Neuf queues',behavior:'Forme majeure à neuf queues, assauts en éventail.',stageId:'dark_shrine',limbs:9}),

  // UNIVERS CINÉMATOGRAPHIQUE
  monster('film','Armless Man',{kind:'humanoid',archetype:'zoner',signature:'Projection corrosive',behavior:'Démarche contorsionnée, jet corrosif et pression lente.',stageId:'film_midwich',affliction:'decay',head:'wrapped'}),
  monster('film','Dark Nurse',{kind:'nurse',archetype:'puppet',signature:'Réflexe à la lumière',behavior:'Reste immobile dans l’obscurité puis frappe en réaction à la lumière et au mouvement.',stageId:'film_hospital',weapon:'knife',trait:'convulsion'}),
  monster('film','Grey Child — Film',{kind:'child',archetype:'swarm',signature:'Étreinte carbonisée',behavior:'Se déplace en groupe et agrippe la cible dans les ruelles en flammes.',stageId:'film_midwich',variantOf:'Grey Child',aura:'smoke'}),
  monster('film','Creeper Swarm — Film',{kind:'insect',archetype:'swarm',signature:'Déferlement de vermine',behavior:'Attaque en essaim et contourne les défenses au sol.',stageId:'film_midwich',variantOf:'Creeper'}),
  monster('film','Colin the Janitor',{kind:'ghost',archetype:'grappler',signature:'Barbelés du gardien',behavior:'Rampe, agrippe et propage la corruption autour de lui.',stageId:'film_midwich',affliction:'bind',aura:'rot'}),
  monster('film','Red Pyramid — Film',{kind:'pyramid',archetype:'boss',boss:true,signature:'Sentence du grand couteau',behavior:'Exécuteur massif, balayages très larges et saisie punitive.',stageId:'film_church',weapon:'great_knife',variantOf:'Red Pyramid Thing',affliction:'bleed'}),
  monster('film','Mannequin Monster',{kind:'spider',archetype:'boss',boss:true,signature:'Assemblage de membres',behavior:'Grimpe, bondit et referme ses membres autour de la cible.',stageId:'film_sanctuary',limbs:8,affliction:'bind'}),
  monster('film','Missionary — Revelation',{kind:'humanoid',archetype:'boss',boss:true,signature:'Couronne de lames',behavior:'Assauts rapides avec lames intégrées et parade agressive.',stageId:'film_sanctuary',weapon:'blades',head:'blade',affliction:'bleed'}),

  monster('film','Lying Figure — Return to Silent Hill',{kind:'humanoid',archetype:'zoner',signature:'Jet acide du retour',behavior:'Interprétation cinématographique 2026 du Lying Figure, conservant sa silhouette enveloppée.',stageId:'return_streets',variantOf:'Lying Figure',variant:'Return to Silent Hill (2026)',head:'wrapped',evidenceTier:'screen-verified'}),
  monster('film','Bubble Head Nurse — Return to Silent Hill',{kind:'nurse',archetype:'balanced',signature:'Service de Lakeview',behavior:'Interprétation cinématographique 2026 des Bubble Head Nurses.',stageId:'return_brookhaven',variantOf:'Bubble Head Nurse',variant:'Return to Silent Hill (2026)',weapon:'pipe',evidenceTier:'screen-verified'}),
  monster('film','Creeper — Return to Silent Hill',{kind:'insect',archetype:'swarm',signature:'Essaim du retour',behavior:'Interprétation cinématographique 2026 des Creepers.',stageId:'return_streets',variantOf:'Creeper',variant:'Return to Silent Hill (2026)',evidenceTier:'screen-verified'}),
  monster('film','Red Pyramid Thing — Return to Silent Hill',{kind:'pyramid',archetype:'boss',boss:true,signature:'Grand couteau du retour',behavior:'Interprétation cinématographique 2026 de Pyramid Head.',stageId:'return_portrait_room',variantOf:'Red Pyramid Thing',variant:'Return to Silent Hill (2026)',weapon:'great_knife',evidenceTier:'screen-verified'}),
  monster('film','Fused Mattress Manifestation — Return',{kind:'mass',archetype:'boss',boss:true,signature:'Fusion du souvenir',behavior:'Manifestation fusionnant corps et structure de lit dans la conclusion du film 2026.',stageId:'return_lakeview',variant:'Return to Silent Hill (2026)',nameStatus:'descriptive-screen-name',evidenceTier:'plot-and-screen-verified'}),

  // SILENT HILL: ASCENSION
  monster('ascension','Wanderer',{kind:'humanoid',archetype:'balanced',signature:'Marche du deuil',behavior:'Approche constante, coups irréguliers et pression de proximité.',stageId:'hope_junction',aura:'smoke'}),
  monster('ascension','Fighter',{kind:'humanoid',archetype:'rushdown',signature:'Assaut enveloppé',behavior:'Manifestation humanoïde agressive, rafales courtes et poursuite.',stageId:'hope_junction'}),
  monster('ascension','Snarler',{kind:'quadruped',archetype:'rushdown',signature:'Traque de la meute',behavior:'Prédateur canin rapide qui bondit après une courte mise en joue.',stageId:'stilledalen'}),
  monster('ascension','Stinger',{kind:'flyer',archetype:'flyer',signature:'Ailes barbelées',behavior:'Déploie ses ailes, prend de l’altitude puis plonge sur sa cible.',stageId:'stilledalen',head:'mask'}),
  monster('ascension','The Immolator',{kind:'giant',archetype:'artillery',boss:true,signature:'Feu intergénérationnel',behavior:'Grande manifestation embrasée qui ferme les voies avec des vagues de chaleur.',stageId:'ascension_otherworld',aura:'fire',affliction:'burn'}),
  monster('ascension','The Collector',{kind:'deity',archetype:'boss',boss:true,signature:'Porte entre les mondes',behavior:'Entité à plusieurs bras qui attire, enferme et projette depuis son torse ouvert.',stageId:'ascension_otherworld',limbs:4,affliction:'dread'}),
  monster('ascension','Stilledalen Stinger',{kind:'flyer',archetype:'trickster',signature:'Voile de tendons',behavior:'Variante de Stinger orientée feinte et attaque hors écran.',stageId:'stilledalen',variantOf:'Stinger',head:'mask',affliction:'static'})
,
  // SILENT HILL: TOWNFALL — les noms de monstres restent explicitement descriptifs quand Konami ne les officialise pas
  monster('townfall','Lunger',{kind:'humanoid',archetype:'rushdown',signature:'Charge à tête de hache',behavior:'Humanoïde aux bras entravés qui charge et frappe de la tête.',stageId:'st_amelia_residential',head:'blade',nameStatus:'guide-descriptive',evidenceTier:'release-week-guide-verified',catalogueStatus:'released-game-combatant'}),
  monster('townfall','Sorrowful',{kind:'serpentine',archetype:'zoner',signature:'Cordon thoracique',behavior:'Attaque à distance avec un appendice sortant du torse et saisit de près.',stageId:'townfall_medical',nameStatus:'guide-descriptive',evidenceTier:'release-week-guide-verified',catalogueStatus:'released-game-combatant'}),
  monster('townfall','Fallen',{kind:'humanoid',archetype:'trickster',signature:'Réveil du cadavre',behavior:'Reste immobile au sol ou dans le décor avant de charger soudainement.',stageId:'clara_woods',nameStatus:'guide-descriptive',evidenceTier:'release-week-guide-verified',catalogueStatus:'released-game-combatant'}),
  monster('townfall','Widow',{kind:'humanoid',archetype:'rushdown',signature:'Pounce au couteau',behavior:'Traque depuis les angles sombres et bondit lorsque la cible lui tourne le dos.',stageId:'ceg_tower',weapon:'knife',nameStatus:'guide-or-trophy-established',evidenceTier:'release-week-guide-verified',catalogueStatus:'released-game-combatant'}),
  monster('townfall','The Weight',{kind:'giant',archetype:'boss',boss:true,signature:'Poids impossible',behavior:'Poursuivant presque invulnérable qui cherche, chasse et agrippe sa cible avant l’affrontement final.',stageId:'clara_woods_different',nameStatus:'guide-established',evidenceTier:'release-week-guide-verified',catalogueStatus:'released-game-boss',adaptation:'Ses poursuites invulnérables deviennent une armure de phase ; ses agrippements infligent de lourds dégâts et seule la phase finale accepte les dégâts complets.'})

];

export const STAGES = [
  {id:'midwich',name:'MIDWICH ELEMENTARY',source:'sh1',family:'school',sky:['#27302b','#090c0b','#020303'],weather:'fog',props:['lockers','desks','fences']},
  {id:'alchemilla',name:'ALCHEMILLA HOSPITAL',source:'sh1',family:'hospital',sky:['#38403a','#141715','#050606'],weather:'ash',props:['beds','curtains','lamps']},
  {id:'old_silent_hill',name:'OLD SILENT HILL',source:'sh1',family:'street',sky:['#3e4540','#161a17','#050606'],weather:'fog',props:['road','shops','chasm']},
  {id:'nowhere',name:'NOWHERE',source:'sh1',family:'otherworld',sky:['#301d1d','#0e0808','#020202'],weather:'embers',props:['grates','chains','fans']},
  {id:'lakeside_amusement',name:'LAKESIDE AMUSEMENT PARK',source:'sh1',family:'amusement',sky:['#26313b','#0e1218','#030405'],weather:'rain',props:['carousel','wheel','booths']},
  {id:'woodside',name:'WOOD SIDE APARTMENTS',source:'sh2',family:'apartment',sky:['#37372f','#141510','#040504'],weather:'fog',props:['stairs','doors','trash']},
  {id:'blue_creek',name:'BLUE CREEK — STAIRWELL',source:'sh2',family:'apartment',sky:['#332a26','#120d0b','#030303'],weather:'dust',props:['stairs','bars','water']},
  {id:'brookhaven_sh2',name:'BROOKHAVEN — BASEMENT',source:'sh2',family:'hospital',sky:['#34332e','#12120f','#040404'],weather:'dust',props:['beds','cages','elevator']},
  {id:'toluca_prison',name:'TOLUCA PRISON',source:'sh2',family:'prison',sky:['#2e3331','#0d100f','#020303'],weather:'cold',props:['cells','gallows','meat']},
  {id:'labyrinth',name:'THE LABYRINTH',source:'sh2',family:'labyrinth',sky:['#2d2521','#0c0908','#020202'],weather:'water',props:['walls','door','pit']},
  {id:'hotel_otherworld',name:'LAKEVIEW HOTEL — OTHERWORLD',source:'sh2',family:'hotel',sky:['#39342e','#15110d','#030303'],weather:'embers',props:['stairs','fire','mirrors']},
  {id:'shopping_mall',name:'CENTRAL SQUARE MALL',source:'sh3',family:'mall',sky:['#424039','#18150f','#050403'],weather:'dust',props:['shops','shutters','signs']},
  {id:'brookhaven_sh3',name:'BROOKHAVEN — FLOODED ROOM',source:'sh3',family:'hospital',sky:['#24343a','#0a1316','#020304'],weather:'water',props:['water','pipes','doors']},
  {id:'church',name:'THE CHURCH',source:'sh3',family:'church',sky:['#3d2622','#130a08','#020202'],weather:'embers',props:['altar','fans','flesh']},
  {id:'apartment_roof',name:'DAISY VILLA ROOFTOP',source:'sh3',family:'roof',sky:['#42464a','#171b1e','#050607'],weather:'rain',props:['fence','water','antenna']},
  {id:'sewers',name:'SEWER CHANNEL',source:'sh3',family:'sewer',sky:['#29342e','#0b100d','#020302'],weather:'water',props:['canal','pipes','grates']},
  {id:'room_302',name:'ROOM 302',source:'sh4',family:'room',sky:['#3d392f','#16130e','#040403'],weather:'dust',props:['window','chains','door']},
  {id:'subway_world',name:'SUBWAY WORLD',source:'sh4',family:'subway',sky:['#343634','#111313','#030303'],weather:'sparks',props:['train','tiles','turnstile']},
  {id:'water_prison',name:'WATER PRISON WORLD',source:'sh4',family:'prison',sky:['#263038','#0b1014','#020303'],weather:'water',props:['tower','cells','spotlight']},
  {id:'apartment_world',name:'APARTMENT WORLD',source:'sh4',family:'apartment',sky:['#35302d','#120f0d','#030303'],weather:'ash',props:['hall','doors','umbilical']},
  {id:'hospital_world',name:'HOSPITAL WORLD',source:'sh4',family:'hospital',sky:['#3a3735','#131110','#030303'],weather:'dust',props:['wheelchairs','beds','head']},
  {id:'cedar_grove',name:'CEDAR GROVE SANITARIUM',source:'origins',family:'hospital',sky:['#3e3934','#17120f','#040303'],weather:'ash',props:['cells','mirrors','gurneys']},
  {id:'riverside_motel',name:'RIVERSIDE MOTEL',source:'origins',family:'motel',sky:['#3a342f','#15110e','#040303'],weather:'rain',props:['rooms','neon','pool']},
  {id:'shepherds_glen',name:'SHEPHERD’S GLEN',source:'homecoming',family:'street',sky:['#3d423e','#161a17','#040504'],weather:'fog',props:['townhall','road','trees']},
  {id:'grand_hotel',name:'GRAND HOTEL',source:'homecoming',family:'hotel',sky:['#3e302c','#150d0a','#030202'],weather:'embers',props:['elevator','dolls','boiler']},
  {id:'nightmare_school',name:'FROZEN SCHOOL',source:'shattered',family:'ice',sky:['#27414b','#0c1a20','#020405'],weather:'snow',props:['ice','lockers','maze']},
  {id:'overlook',name:'OVERLOOK PENITENTIARY',source:'downpour',family:'prison',sky:['#2d3740','#0d1318','#020304'],weather:'rain',props:['cells','towers','flood']},
  {id:'arcade_ship',name:'LITTLE BARONESS',source:'arcade',family:'ship',sky:['#2e3436','#0c1113','#020303'],weather:'water',props:['deck','crates','chains']},
  {id:'book_zone',name:'BOOK OF MEMORIES — NEXUS',source:'bom',family:'book',sky:['#3b3040','#140d18','#030204'],weather:'runes',props:['pages','doors','altar']},
  {id:'looping_hall',name:'204863 — LOOPING HALL',source:'pt',family:'hall',sky:['#3c3730','#16120d','#040302'],weather:'flicker',props:['radio','bathroom','clock']},
  {id:'villa',name:'KETTENSTADT VILLA',source:'shortmessage',family:'villa',sky:['#3a3437','#140f11','#030203'],weather:'petals',props:['graffiti','stairs','fence']},
  {id:'ebisugaoka',name:'EBISUGAOKA — MAIN STREET',source:'shf',family:'village',sky:['#454039','#18130f','#050403'],weather:'fog',props:['shops','phone','flowers']},
  {id:'dark_shrine',name:'DARK SHRINE',source:'shf',family:'shrine',sky:['#3b2326','#14080a','#030102'],weather:'petals',props:['torii','lanterns','roots']},
  {id:'school_shf',name:'EBISUGAOKA MIDDLE SCHOOL',source:'shf',family:'school',sky:['#3d3b35','#15140f','#040403'],weather:'dust',props:['desks','corridor','flowers']},
  {id:'hinako_home',name:'HINAKO’S HOME',source:'shf',family:'house',sky:['#3b322f','#140f0d','#030302'],weather:'dust',props:['tatami','doors','roots']},
  {id:'festival_square',name:'FESTIVAL SQUARE',source:'shf',family:'festival',sky:['#412b2a','#160b0b','#030202'],weather:'embers',props:['drums','stalls','lanterns']},
  {id:'book_fire',name:'FIRE ZONE',source:'bom',family:'elemental',sky:['#4d221a','#170704','#030101'],weather:'embers',props:['lava','runes','pillars']},
  {id:'book_wood',name:'WOOD ZONE',source:'bom',family:'elemental',sky:['#30402b','#0d150a','#020402'],weather:'spores',props:['roots','moss','runes']},
  {id:'book_light',name:'LIGHT ZONE',source:'bom',family:'elemental',sky:['#4a493d','#17160e','#030302'],weather:'light',props:['mirrors','runes','pillars']},
  {id:'book_water',name:'WATER ZONE',source:'bom',family:'elemental',sky:['#263e4b','#09151b','#020304'],weather:'water',props:['pools','runes','bridges']},
  {id:'book_earth',name:'EARTH ZONE',source:'bom',family:'elemental',sky:['#40372a','#151008','#030302'],weather:'dust',props:['rocks','runes','cracks']},
  {id:'book_blood',name:'BLOOD ZONE',source:'bom',family:'elemental',sky:['#471e22','#160607','#030101'],weather:'blood',props:['veins','runes','pools']},
  {id:'book_steel',name:'STEEL ZONE',source:'bom',family:'elemental',sky:['#333a40','#0f1316','#030405'],weather:'sparks',props:['gears','runes','chains']},
  {id:'antique_shop',name:'GREEN LION ANTIQUES',source:'origins',family:'otherworld',sky:['#3c2b27','#150c09','#030202'],weather:'embers',props:['flauros','altar','fire']},
  {id:'church_hc',name:'SHEPHERD’S GLEN CHURCH',source:'homecoming',family:'church',sky:['#3d2926','#140a08','#030202'],weather:'embers',props:['organ','altar','chains']},
  {id:'underground_hc',name:'UNDERGROUND LAIR',source:'homecoming',family:'lair',sky:['#302a28','#0e0a09','#020202'],weather:'dust',props:['webs','machines','cocoons']},
  {id:'film_midwich',name:'MIDWICH — FILM OTHERWORLD',source:'film',family:'school',sky:['#392d29','#120a08','#020202'],weather:'embers',props:['lockers','fence','chains'],hazard:'fallingDebris'},
  {id:'film_hospital',name:'BROOKHAVEN — DARK WARD',source:'film',family:'hospital',sky:['#34322e','#100e0c','#020202'],weather:'flicker',props:['beds','gurneys','chains'],hazard:'staticBurst'},
  {id:'film_church',name:'CHURCH OF THE ORDER',source:'film',family:'church',sky:['#3b2522','#120706','#020101'],weather:'embers',props:['altar','chains','flesh'],hazard:'chainSweep'},
  {id:'film_sanctuary',name:'SANCTUARY — REVELATION',source:'film',family:'lair',sky:['#332629','#100709','#020102'],weather:'ash',props:['chains','cages','altar'],hazard:'bloodTide'},
  {id:'hope_junction',name:'HOPE’S JUNCTION',source:'ascension',family:'street',sky:['#3b3e3c','#121514','#030404'],weather:'fog',props:['road','shops','fence'],hazard:'staticBurst'},
  {id:'stilledalen',name:'STILLEDALEN WOODS',source:'ascension',family:'village',sky:['#303933','#0d120f','#020302'],weather:'rain',props:['trees','roots','lanterns'],hazard:'fallingDebris'},
  {id:'ascension_otherworld',name:'ASCENSION — OPEN GATE',source:'ascension',family:'otherworld',sky:['#392323','#110606','#020101'],weather:'embers',props:['runes','chains','altar'],hazard:'emberFall'}

  ,{id:'hospital_nightmare',name:'ALCHEMILLA — NIGHTMARE WARD',source:'sh1',family:'hospital',sky:['#311d1d','#100808','#020202'],weather:'flicker',props:['beds','chains','fans'],animations:['lightFlicker','chainSway','fanSpin','hospitalMonitor']},
  {id:'midwich_nightmare',name:'MIDWICH — NIGHTMARE SCHOOL',source:'sh1',family:'school',sky:['#331f1c','#110807','#020202'],weather:'embers',props:['lockers','chains','grates'],animations:['sirenPulse','chainSway','lockerRattle']},
  {id:'central_nightmare',name:'CENTRAL SILENT HILL — OTHERWORLD',source:'sh1',family:'street',sky:['#35201d','#120808','#020202'],weather:'embers',props:['road','chasm','fence'],animations:['sirenPulse','streetLightFlicker','chasmPulse']},
  {id:'sewer_resort',name:'SEWERS TO THE RESORT',source:'sh1',family:'sewer',sky:['#25302d','#0b1110','#020303'],weather:'water',props:['water','grates','pipes'],animations:['waterRipple','pipeSteam','shadowPass']},
  {id:'south_vale',name:'SOUTH VALE STREETS',source:'sh2',family:'street',sky:['#41433d','#171916','#050606'],weather:'fog',props:['road','shops','fence'],animations:['fogDrift','streetLightFlicker','shadowPass']},
  {id:'brookhaven_roof',name:'BROOKHAVEN — ROOFTOP',source:'sh2',family:'hospital',sky:['#383b38','#111413','#030404'],weather:'rain',props:['fence','elevator','water'],animations:['rainSheets','elevatorBlink','lightning']},
  {id:'historical_society',name:'SILENT HILL HISTORICAL SOCIETY',source:'sh2',family:'museum',sky:['#302e28','#100f0c','#030303'],weather:'dust',props:['portraits','stairs','doors'],animations:['portraitBlink','shadowPass','lightFlicker']},
  {id:'prison_meat_locker',name:'TOLUCA PRISON — MEAT LOCKER',source:'sh2',family:'prison',sky:['#2b2926','#0d0c0b','#020202'],weather:'cold',props:['hooks','chains','freezer'],animations:['chainSway','coldBreath','lightFlicker']},
  {id:'lakeview',name:'LAKEVIEW HOTEL — FOG WORLD',source:'sh2',family:'hotel',sky:['#3e4038','#161713','#040504'],weather:'fog',props:['doors','portraits','lamps'],animations:['fogDrift','portraitBlink','lampFlicker']},
  {id:'baldwin_mansion',name:'BALDWIN MANSION',source:'sh2',family:'house',sky:['#34322c','#12110e','#030303'],weather:'dust',props:['portraits','stairs','fireplace'],animations:['portraitBlink','firePulse','shadowPass']},
  {id:'nightmare_mall',name:'CENTRAL SQUARE — NIGHTMARE MALL',source:'sh3',family:'mall',sky:['#34211d','#120908','#020202'],weather:'embers',props:['shops','grates','fans'],animations:['sirenPulse','fanSpin','storeShutters']},
  {id:'hazel_subway',name:'HAZEL STREET SUBWAY',source:'sh3',family:'subway',sky:['#303431','#101311','#030404'],weather:'flicker',props:['rails','platform','lights'],animations:['trainPass','lightFlicker','tunnelWind']},
  {id:'underpass_sh3',name:'UNDERPASS',source:'sh3',family:'sewer',sky:['#29312f','#0d1110','#020303'],weather:'water',props:['water','pipes','grates'],animations:['waterRipple','pipeSteam','shadowPass']},
  {id:'hilltop_center',name:'HILLTOP CENTER',source:'sh3',family:'office',sky:['#373832','#13140f','#030403'],weather:'flicker',props:['desks','elevator','windows'],animations:['elevatorBlink','lightFlicker','windowShadow']},
  {id:'nightmare_hilltop',name:'HILLTOP CENTER — OTHERWORLD',source:'sh3',family:'otherworld',sky:['#351f1b','#120807','#020202'],weather:'embers',props:['grates','fans','blood'],animations:['sirenPulse','fanSpin','bloodPulse']},
  {id:'nightmare_hospital_sh3',name:'BROOKHAVEN — NIGHTMARE HOSPITAL',source:'sh3',family:'hospital',sky:['#33201e','#110807','#020202'],weather:'flicker',props:['beds','mirrors','chains'],animations:['hospitalMonitor','lightFlicker','mirrorGlitch']},
  {id:'lakeside_sh3',name:'LAKESIDE AMUSEMENT PARK — SH3',source:'sh3',family:'amusement',sky:['#2b3038','#0d1116','#020304'],weather:'rain',props:['carousel','wheel','booths'],animations:['carouselTurn','ferrisWheel','rainSheets']},
  {id:'forest_world',name:'FOREST WORLD',source:'sh4',family:'forest',sky:['#2b342e','#0d120f','#020302'],weather:'rain',props:['trees','roots','wish_house'],animations:['forestWind','rootsCreep','rainSheets']},
  {id:'building_world',name:'BUILDING WORLD',source:'sh4',family:'building',sky:['#32302d','#10100d','#030303'],weather:'flicker',props:['stairs','signs','elevator'],animations:['elevatorBlink','neonFlicker','shadowPass']},
  {id:'outside_room_302',name:'OUTSIDE ROOM 302',source:'sh4',family:'apartment',sky:['#34332f','#12120f','#030303'],weather:'fog',props:['doors','windows','chains'],animations:['doorPulse','windowShadow','fogDrift']},
  {id:'wish_house',name:'WISH HOUSE',source:'sh4',family:'house',sky:['#31342d','#10130e','#030303'],weather:'rain',props:['trees','fence','altar'],animations:['forestWind','rainSheets','ritualGlyph']},
  {id:'final_sacrament',name:'21 SACRAMENTS — FINAL CHAMBER',source:'sh4',family:'otherworld',sky:['#321e1d','#100706','#020202'],weather:'blood',props:['altar','chains','runes'],animations:['ritualGlyph','chainSway','bloodPulse']},
  {id:'alchemilla_origins',name:'ALCHEMILLA HOSPITAL — ORIGINS',source:'origins',family:'hospital',sky:['#3b3a34','#15140f','#040403'],weather:'flicker',props:['beds','mirrors','lights'],animations:['mirrorGlitch','hospitalMonitor','lightFlicker']},
  {id:'artaud_theater',name:'ARTAUD THEATER',source:'origins',family:'theater',sky:['#382d27','#130e0b','#030202'],weather:'dust',props:['stage','curtains','spotlights'],animations:['curtainSway','spotlightSweep','shadowPass']},
  {id:'nightmare_theater',name:'ARTAUD THEATER — NIGHTMARE',source:'origins',family:'theater',sky:['#351d1c','#110706','#020202'],weather:'embers',props:['stage','chains','flesh'],animations:['sirenPulse','curtainSway','firePulse']},
  {id:'nightmare_hospital_hc',name:'ALCHEMILLA — HOMECOMING NIGHTMARE',source:'homecoming',family:'hospital',sky:['#321f1d','#100706','#020202'],weather:'flicker',props:['beds','fans','chains'],animations:['fanSpin','hospitalMonitor','lightFlicker']},
  {id:'police_station_hc',name:'SHEPHERD’S GLEN POLICE STATION',source:'homecoming',family:'office',sky:['#353833','#121410','#030403'],weather:'rain',props:['desks','bars','lights'],animations:['rainSheets','radioPulse','lightFlicker']},
  {id:'town_hall_hc',name:'SHEPHERD’S GLEN TOWN HALL',source:'homecoming',family:'hall',sky:['#37342d','#13110d','#030302'],weather:'dust',props:['portraits','stairs','flags'],animations:['portraitBlink','flagSway','shadowPass']},
  {id:'prison_hc',name:'SHEPHERD’S GLEN PENITENTIARY',source:'homecoming',family:'prison',sky:['#2f302c','#0f100d','#030303'],weather:'flicker',props:['bars','chains','lights'],animations:['chainSway','lightFlicker','cellShadow']},
  {id:'shepherd_house_hc',name:'SHEPHERD HOUSE — ATTIC',source:'homecoming',family:'house',sky:['#332f29','#110f0c','#030302'],weather:'dust',props:['portraits','stairs','mirrors'],animations:['portraitBlink','mirrorGlitch','floorCreak']},
  {id:'scarlet_chamber',name:'SCARLET’S CHAMBER',source:'homecoming',family:'lair',sky:['#3b2427','#13080a','#020102'],weather:'blood',props:['dolls','mirrors','flesh'],animations:['dollTurn','mirrorGlitch','bloodPulse']},
  {id:'curtis_shop',name:'CURTIS’S JUNKYARD WORKSHOP',source:'homecoming',family:'workshop',sky:['#34322c','#11100d','#030302'],weather:'sparks',props:['tools','chains','saws'],animations:['chainSway','sawSpin','sparks']},
  {id:'frozen_streets',name:'SILENT HILL — FROZEN STREETS',source:'shattered',family:'ice',sky:['#48616b','#17272d','#05090b'],weather:'snow',props:['road','cars','ice'],animations:['snowGust','iceCrack','headlightSweep']},
  {id:'nightmare_hospital_sm',name:'FROZEN HOSPITAL',source:'shattered',family:'ice',sky:['#455e68','#16252b','#05090b'],weather:'snow',props:['beds','ice','lights'],animations:['snowGust','iceCrack','lightFlicker']},
  {id:'nightmare_mall_sm',name:'FROZEN MALL',source:'shattered',family:'ice',sky:['#465e67','#17252b','#05090b'],weather:'snow',props:['shops','ice','escalator'],animations:['snowGust','iceCrack','storeShutters']},
  {id:'lighthouse_sm',name:'LIGHTHOUSE / THERAPY REVELATION',source:'shattered',family:'lighthouse',sky:['#4d6873','#172a31','#05090b'],weather:'snow',props:['water','beam','ice'],animations:['lighthouseBeam','waves','snowGust']},
  {id:'devils_pit',name:'DEVIL’S PIT',source:'downpour',family:'mine',sky:['#303632','#101310','#030403'],weather:'rain',props:['rails','cave','water'],animations:['mineCart','rainSheets','waterRipple']},
  {id:'centennial_building',name:'CENTENNIAL BUILDING',source:'downpour',family:'office',sky:['#373a37','#121513','#030404'],weather:'rain',props:['desks','elevator','windows'],animations:['elevatorBlink','rainSheets','windowShadow']},
  {id:'st_marias',name:'ST. MARIA’S MONASTERY',source:'downpour',family:'church',sky:['#343630','#11130f','#030403'],weather:'rain',props:['altar','bells','windows'],animations:['bellSwing','rainSheets','lightning']},
  {id:'downpour_streets',name:'SILENT HILL — DOWNPOUR STREETS',source:'downpour',family:'street',sky:['#3a4140','#131817','#040505'],weather:'rain',props:['road','shops','cars'],animations:['rainSheets','streetLightFlicker','waterRipple']},
  {id:'otherworld_void',name:'DOWNPOUR — VOID CHASE',source:'downpour',family:'void',sky:['#242b2d','#090d0f','#010202'],weather:'runes',props:['stairs','doors','void'],animations:['voidSurge','doorPulse','gravityTilt']},
  {id:'anne_fight',name:'FULL CIRCLE — ANNE’S CONFRONTATION',source:'downpour',family:'prison',sky:['#302d2b','#0f0d0c','#020202'],weather:'flicker',props:['bars','lights','water'],animations:['lightFlicker','waterRipple','shadowPass']},
  {id:'arcade_city',name:'THE ARCADE — CITY / JACK’S INN',source:'arcade',family:'street',sky:['#393c38','#131612','#040504'],weather:'fog',props:['road','shops','signs'],animations:['fogDrift','neonFlicker','shadowPass']},
  {id:'arcade_hospital',name:'THE ARCADE — BROOKHAVEN HOSPITAL',source:'arcade',family:'hospital',sky:['#363630','#12120f','#040404'],weather:'flicker',props:['beds','elevator','lights'],animations:['hospitalMonitor','elevatorBlink','lightFlicker']},
  {id:'arcade_hospital_roof',name:'THE ARCADE — HOSPITAL ROOF',source:'arcade',family:'hospital',sky:['#343936','#111512','#030404'],weather:'rain',props:['fence','vents','water'],animations:['rainSheets','lightning','ventSteam']},
  {id:'arcade_historical',name:'THE ARCADE — HISTORICAL SOCIETY',source:'arcade',family:'museum',sky:['#332f29','#110f0c','#030302'],weather:'dust',props:['portraits','stairs','doors'],animations:['portraitBlink','shadowPass','lightFlicker']},
  {id:'arcade_prison',name:'THE ARCADE — TOLUCA PRISON',source:'arcade',family:'prison',sky:['#2f302d','#0f100e','#030303'],weather:'flicker',props:['bars','chains','lights'],animations:['chainSway','cellShadow','lightFlicker']},
  {id:'arcade_graveyard',name:'THE ARCADE — UNDERGROUND GRAVEYARD',source:'arcade',family:'graveyard',sky:['#2e332e','#0e120f','#020302'],weather:'fog',props:['graves','roots','altar'],animations:['fogDrift','rootsCreep','shadowPass']},
  {id:'arcade_toluca_lake',name:'THE ARCADE — TOLUCA LAKE',source:'arcade',family:'lake',sky:['#344149','#10191d','#030506'],weather:'water',props:['water','boat','fog'],animations:['waves','boatRock','fogDrift']},
  {id:'arcade_1918',name:'THE ARCADE — 1918',source:'arcade',family:'otherworld',sky:['#35211d','#110807','#020202'],weather:'embers',props:['runes','chains','altar'],animations:['ritualGlyph','chainSway','sirenPulse']},
  {id:'arcade_1993',name:'THE ARCADE — 1993 PHANTOM FRONT',source:'arcade',family:'otherworld',sky:['#30222d','#0e0710','#020102'],weather:'runes',props:['portraits','void','lights'],animations:['portraitBlink','voidSurge','lightFlicker']},
  {id:'arcade_mall',name:'THE ARCADE — SHOPPING MALL',source:'arcade',family:'mall',sky:['#353631','#12130f','#030403'],weather:'flicker',props:['shops','escalator','lights'],animations:['storeShutters','lightFlicker','shadowPass']},
  {id:'arcade_amusement',name:'THE ARCADE — AMUSEMENT PARK',source:'arcade',family:'amusement',sky:['#29313b','#0d1218','#030405'],weather:'rain',props:['carousel','wheel','booths'],animations:['carouselTurn','ferrisWheel','rainSheets']},
  {id:'villa_rooftop',name:'KETTENSTADT VILLA — ROOFTOP',source:'shortmessage',family:'rooftop',sky:['#53424b','#1b1116','#050305'],weather:'petals',props:['fence','antenna','flowers'],animations:['petalSpiral','windGust','lightning']},
  {id:'villa_stairwell',name:'KETTENSTADT VILLA — STAIRWELL',source:'shortmessage',family:'building',sky:['#3c3035','#140d10','#030203'],weather:'flicker',props:['stairs','graffiti','lights'],animations:['lightFlicker','shadowPass','doorPulse']},
  {id:'dark_shrine_corridors',name:'DARK SHRINE — CORRIDORS',source:'shf',family:'shrine',sky:['#3a2728','#12090a','#020202'],weather:'petals',props:['lanterns','runes','roots'],animations:['petalSpiral','lanternSway','rootsCreep']},
  {id:'shimizu_residence',name:'SHIMIZU RESIDENCE',source:'shf',family:'house',sky:['#403235','#160e10','#040203'],weather:'petals',props:['screens','lanterns','portraits'],animations:['lanternSway','screenSlide','portraitBlink']},
  {id:'dark_shrine_main',name:'DARK SHRINE — MAIN HALL',source:'shf',family:'shrine',sky:['#3d2728','#13090a','#020202'],weather:'embers',props:['altar','lanterns','runes'],animations:['ritualGlyph','lanternSway','firePulse']},
  {id:'corrupted_ebisugaoka',name:'EBISUGAOKA — CORRUPTED PROCESSION',source:'shf',family:'festival',sky:['#43272c','#15080c','#030102'],weather:'petals',props:['lanterns','roots','booths'],animations:['petalSpiral','lanternSway','rootsCreep']},
  {id:'return_streets',name:'RETURN TO SILENT HILL — STREETS',source:'film',family:'street',sky:['#43453f','#171916','#050606'],weather:'fog',props:['road','shops','chasm'],animations:['fogDrift','streetLightFlicker','shadowPass']},
  {id:'return_brookhaven',name:'RETURN TO SILENT HILL — BROOKHAVEN',source:'film',family:'hospital',sky:['#36352f','#12120f','#040404'],weather:'flicker',props:['beds','elevator','lights'],animations:['hospitalMonitor','elevatorBlink','lightFlicker']},
  {id:'return_lakeview',name:'RETURN TO SILENT HILL — BURNING LAKEVIEW',source:'film',family:'hotel',sky:['#422a23','#160b08','#030201'],weather:'embers',props:['portraits','fireplace','windows'],animations:['firePulse','portraitBlink','ashFall']},
  {id:'return_portrait_room',name:'RETURN TO SILENT HILL — PORTRAIT ROOM',source:'film',family:'gallery',sky:['#33272a','#10090b','#020202'],weather:'flicker',props:['portraits','elevator','lights'],animations:['portraitBlink','elevatorBlink','lightFlicker']},
  {id:'st_amelia_marina',name:'ST. AMELIA MARINA',source:'townfall',family:'marina',sky:['#3b4a4d','#111a1c','#030506'],weather:'fog',props:['water','boats','crtv'],animations:['waves','boatRock','fogDrift','tvStatic']},
  {id:'st_amelia_residential',name:'ST. AMELIA — RESIDENTIAL DISTRICT',source:'townfall',family:'village',sky:['#3d4846','#141a18','#040505'],weather:'rain',props:['road','houses','crtv'],animations:['rainSheets','streetLightFlicker','tvStatic']},
  {id:'townfall_medical',name:'ST. AMELIA MEDICAL CENTRE',source:'townfall',family:'hospital',sky:['#38403d','#121714','#030404'],weather:'flicker',props:['beds','monitors','crtv'],animations:['hospitalMonitor','lightFlicker','tvStatic']},
  {id:'ceg_tower',name:'CEG TOWER',source:'townfall',family:'office',sky:['#343a38','#111513','#030404'],weather:'flicker',props:['desks','elevator','crtv'],animations:['elevatorBlink','lightFlicker','tvStatic']},
  {id:'clara_woods',name:'CLARA WOODS',source:'townfall',family:'forest',sky:['#303b35','#0f1511','#020403'],weather:'fog',props:['trees','roots','crtv'],animations:['forestWind','fogDrift','tvStatic']},
  {id:'clara_woods_different',name:'CLARA WOODS — DIFFERENT',source:'townfall',family:'otherworld',sky:['#302325','#0e090a','#020202'],weather:'runes',props:['trees','metal','crtv'],animations:['voidSurge','metalPulse','tvStatic']},
  {id:'alternate_facility',name:'ST. AMELIA — ALTERNATE FACILITY',source:'townfall',family:'otherworld',sky:['#302526','#0f0909','#020202'],weather:'flicker',props:['pipes','monitors','metal'],animations:['pipeSteam','hospitalMonitor','metalPulse']}

];

const hazardByStage = Object.freeze({
  fog: 'staticBurst', rain: 'fallingDebris', water: 'bloodTide', cold: 'frostWave', snow: 'frostWave',
  petals: 'petalBloom', embers: 'emberFall', ash: 'fallingDebris', dust: 'fallingDebris', sparks: 'chainSweep',
  blood: 'bloodTide', flicker: 'staticBurst', runes: 'staticBurst', spores: 'petalBloom', light: 'staticBurst'
});
for (const stage of STAGES) stage.hazard ||= hazardByStage[stage.weather] || (stage.family === 'otherworld' ? 'chainSweep' : 'staticBurst');


const defaultAnimationsByFamily = Object.freeze({
  street: ['fogDrift','streetLightFlicker'], village: ['fogDrift','windowShadow'], hospital: ['lightFlicker','hospitalMonitor'],
  school: ['lightFlicker','lockerRattle'], apartment: ['doorPulse','windowShadow'], hotel: ['lampFlicker','portraitBlink'],
  prison: ['chainSway','cellShadow'], church: ['bellSwing','ritualGlyph'], otherworld: ['sirenPulse','chainSway'],
  amusement: ['carouselTurn','ferrisWheel'], shrine: ['lanternSway','ritualGlyph'], festival: ['lanternSway','petalSpiral'],
  ice: ['snowGust','iceCrack'], ship: ['boatRock','waves'], forest: ['forestWind','rootsCreep'],
  subway: ['trainPass','lightFlicker'], sewer: ['waterRipple','pipeSteam'], office: ['elevatorBlink','lightFlicker'],
  house: ['portraitBlink','floorCreak'], gallery: ['portraitBlink','lightFlicker'], marina: ['waves','boatRock'],
  void: ['voidSurge','gravityTilt'], lake: ['waves','fogDrift'], theater: ['curtainSway','spotlightSweep'],
  labyrinth: ['chainSway','doorPulse','gravityTilt'], mall: ['storeShutters','lightFlicker','shadowPass'],
  roof: ['rainSheets','lightning','ventSteam'], room: ['doorPulse','windowShadow','bloodPulse'],
  motel: ['neonFlicker','rainSheets','windowShadow'], book: ['ritualGlyph','mirrorGlitch','screenSlide'],
  hall: ['doorPulse','lightFlicker','mirrorGlitch'], villa: ['lightFlicker','petalSpiral','shadowPass'],
  elemental: ['ritualGlyph','sirenPulse','metalPulse'], lair: ['rootsCreep','bloodPulse','pipeSteam']
});

const stageFatalityByFamily = Object.freeze({
  hospital: { name: 'PROTOCOLE TERMINAL', effect: 'flicker', sequence: ['lights-out','gurney','monitor-flatline'] },
  school: { name: 'SONNERIE DE MINUIT', effect: 'static', sequence: ['locker-slam','bell','corridor-dark'] },
  street: { name: 'CHUTE DANS LA BRUME', effect: 'chasm', sequence: ['siren','road-split','fog-close'] },
  apartment: { name: 'PORTE SANS RETOUR', effect: 'door', sequence: ['hallway','door-open','door-seal'] },
  hotel: { name: 'CHAMBRE DU SOUVENIR', effect: 'fire', sequence: ['portrait','fire','ash'] },
  prison: { name: 'CELLULE DU JUGEMENT', effect: 'chains', sequence: ['bars-close','chains','blackout'] },
  church: { name: 'AUTEL DU SACRIFICE', effect: 'ritual', sequence: ['mark','altar','siren'] },
  otherworld: { name: 'GRILLE DE ROUILLE', effect: 'rust', sequence: ['siren','grate-open','seal'] },
  amusement: { name: 'DERNIER TOUR DE MANÈGE', effect: 'carousel', sequence: ['lights','carousel','silence'] },
  forest: { name: 'RACINES DU BOIS', effect: 'roots', sequence: ['roots-rise','bind','earth-close'] },
  ice: { name: 'SOUS LA GLACE', effect: 'frost', sequence: ['crack','fall','freeze'] },
  shrine: { name: 'SCELLEMENT DU SANCTUAIRE', effect: 'petals', sequence: ['torii','seal','petal-storm'] },
  festival: { name: 'PROCESSION FINALE', effect: 'petals', sequence: ['lanterns','procession','mask-close'] },
  ship: { name: 'FOND DU LAC', effect: 'water', sequence: ['deck-tilt','rail-break','water-close'] },
  marina: { name: 'MARÉE SANS RETOUR', effect: 'water', sequence: ['signal','wave','submerge'] },
  void: { name: 'EFFACEMENT DU COULOIR', effect: 'void', sequence: ['distort','pull','erase'] },
  default: { name: 'OTHERWORLD STAGE FATALITY', effect: 'rust', sequence: ['siren','impact','blackout'] }
});

for (const stage of STAGES) {
  stage.animations = [...new Set([...(stage.animations || []), ...(defaultAnimationsByFamily[stage.family] || [])])];
  const fatality = stageFatalityByFamily[stage.family] || stageFatalityByFamily.default;
  stage.fatality ||= {
    id: `${stage.id}_fatality`,
    ...fatality,
    triggerZone: stage.family === 'street' || stage.family === 'marina' || stage.family === 'ship' ? 'edge' : 'either-edge',
    fidelity: 'environmental-adaptation',
    canonicalBasis: `Décor et dangers documentés de ${stage.name}.`
  };
  stage.catalogueStatus ||= 'verified-location';
}

for (const stage of STAGES) enrichStage(stage);

export const CHRONICLES = [
  {id:'fog_of_alessa',source:'sh1',title:'LA BRUME D’ALESSA',subtitle:'Midwich → Nowhere',fighters:['sh1_grey_child_005','sh1_split_head_014','sh1_incubus_019'],stages:['midwich','lakeside_amusement','nowhere'],intro:'La ville recommence son cauchemar. Chaque victoire révèle une couche différente du rituel.',outro:'Le monde rouille, puis retient son souffle.'},
  {id:'james_sentence',source:'sh2',title:'LA SENTENCE DE JAMES',subtitle:'Apartments → Lakeview',fighters:[],stages:['woodside','labyrinth','hotel_otherworld'],intro:'La culpabilité prend des formes qui savent combattre.',outro:'Le lac ne donne pas de réponse, seulement un reflet.'},
  {id:'heather_birth',source:'sh3',title:'NAÎTRE DEUX FOIS',subtitle:'Mall → Church',fighters:[],stages:['shopping_mall','brookhaven_sh3','church'],intro:'Une mémoire héritée traverse la ville et refuse le destin qu’on lui a préparé.',outro:'Le dieu tombe, mais la mémoire reste.'},
  {id:'room_21',source:'sh4',title:'LES VINGT-ET-UN SACREMENTS',subtitle:'Room 302 → Apartment World',fighters:[],stages:['room_302','water_prison','apartment_world'],intro:'La chambre est une porte. Chaque victime devient une règle du rituel.',outro:'La chaîne se tend jusqu’au dernier nom.'},
  {id:'travis_mirrors',source:'origins',title:'LES MIROIRS DE TRAVIS',subtitle:'Sanitarium → Antique Shop',fighters:[],stages:['cedar_grove','riverside_motel','antique_shop'],intro:'Les miroirs ne montrent pas un autre monde : ils montrent ce qui attend déjà.',outro:'Le Flauros se referme sur un passé impossible.'},
  {id:'alex_home',source:'homecoming',title:'LE FILS QUI REVIENT',subtitle:'Shepherd’s Glen → Underground',fighters:[],stages:['shepherds_glen','grand_hotel','underground_hc'],intro:'Les familles ont bâti leur paix sur une dette de sang.',outro:'La ville réclame ce qu’on lui avait promis.'},
  {id:'harry_ice',source:'shattered',title:'MÉMOIRE SOUS LA GLACE',subtitle:'Frozen School',fighters:[],stages:['nightmare_school'],intro:'Le profil psychologique transforme chaque poursuivant.',outro:'La glace craque autour d’un souvenir recomposé.'},
  {id:'murphy_rain',source:'downpour',title:'PLUIE SUR RYALL',subtitle:'Overlook',fighters:[],stages:['overlook'],intro:'La pluie enferme Murphy dans une prison plus vaste que ses murs.',outro:'Le pardon n’est pas une porte ; c’est une décision.'},
  {id:'book_elements',source:'bom',title:'LES GARDIENS DU LIVRE',subtitle:'Nexus élémentaire',fighters:[],stages:['book_fire','book_wood','book_water','book_blood','book_steel'],intro:'Chaque page donne une forme physique à l’équilibre intérieur.',outro:'Le livre se ferme, mais conserve toutes les traces.'},
  {id:'loop_204863',source:'pt',title:'204863',subtitle:'Couloir en boucle',fighters:[],stages:['looping_hall'],intro:'Une porte s’ouvre sur le même couloir. Lisa attend derrière le joueur.',outro:'La boucle ne se termine pas ; elle cesse simplement de répondre.'},
  {id:'maya_villa',source:'shortmessage',title:'LES PÉTALES DE MAYA',subtitle:'Kettenstadt Villa',fighters:[],stages:['villa'],intro:'Les murs répètent les messages que personne n’a voulu lire.',outro:'Les fleurs desserrent leur étreinte.'},
  {id:'hinako_f',source:'shf',title:'LA PROCESSION D’HINAKO',subtitle:'Ebisugaoka → Dark Shrine',fighters:[],stages:['ebisugaoka','school_shf','dark_shrine'],intro:'Ebisugaoka fleurit de l’intérieur. Chaque masque exige un choix.',outro:'La procession atteint le sanctuaire, mais le visage reste à choisir.'},
  {id:'ashes_of_alessa',source:'film',title:'LES CENDRES D’ALESSA',subtitle:'Midwich → Sanctuary',fighters:[],stages:['film_midwich','film_hospital','film_church','film_sanctuary'],intro:'Les sirènes ouvrent un Otherworld de métal brûlé où chaque lumière attire une silhouette.',outro:'La congrégation tombe, mais les cendres continuent de respirer.'},
  {id:'trauma_together',source:'ascension',title:'LE TRAUMA PARTAGÉ',subtitle:'Hope’s Junction → Open Gate',fighters:[],stages:['hope_junction','stilledalen','ascension_otherworld'],intro:'Deux communautés portent des blessures qui se répondent de part et d’autre du monde.',outro:'La porte reste entrouverte, nourrie par les choix accumulés.'},
  {id:'static_beneath_st_amelia',source:'townfall',title:'LE SIGNAL SOUS ST. AMELIA',subtitle:'Marina → Clara Woods',fighters:[],stages:['st_amelia_marina','st_amelia_residential','townfall_medical','ceg_tower','clara_woods_different'],intro:'Le CRTV accroche des fragments de vérité dans la brume froide de l’île.',outro:'Le signal cesse, mais le poids demeure dans le silence.'}
];

// Renseigne automatiquement les adversaires des Chroniques avec des boss/figures du jeu concerné.
for (const route of CHRONICLES) {
  if (!route.fighters.length) {
    const pool = ROSTER.filter(f => f.source === route.source);
    const bosses = pool.filter(f => f.boss);
    const regular = pool.filter(f => !f.boss);
    route.fighters = [...regular.slice(0, 2), ...bosses.slice(0, 4)].map(f => f.id).slice(0, 6);
  }
}



export const SOURCE_COVERAGE_TARGETS = Object.freeze({
  sh1: { minFighters: 20, minStages: 9, requiredNames: ['Bloodsucker','Incubus','Incubator','Monster Cybil'] },
  sh2: { minFighters: 18, minStages: 12, requiredNames: ['Spider Mannequin','Mary — Final Manifestation','Eddie Dombrowski'] },
  sh3: { minFighters: 20, minStages: 12, requiredNames: ['Numb Body — Medium','Closer — Church Variant','Glutton','God'] },
  sh4: { minFighters: 32, minStages: 10, requiredNames: ['Jimmy Stone — Victim 1','Cynthia Velasquez — Victim 16','Richard Braintree — Victim 19','Walter Sullivan'] },
  origins: { minFighters: 11, minStages: 6, requiredNames: ['Faceless Nurse','The Butcher','Demon'] },
  homecoming: { minFighters: 17, minStages: 11, requiredNames: ['Nurse','Swarm','Curtis Ackers','Amnion — Exposed Form'] },
  shattered: { minFighters: 5, minStages: 5, requiredNames: ['Raw Shock — Base','Raw Shock — Atrophied'] },
  downpour: { minFighters: 14, minStages: 7, requiredNames: ['Anne Cunningham','Wheelman','Void'] },
  arcade: { minFighters: 19, minStages: 12, requiredNames: ['Tuberculosis','Mama','Phantom','Robbie the Rabbit — Shotgun','Split Worm — Arcade'] },
  bom: { minFighters: 28, minStages: 8, requiredNames: ['Mother','Valtiel','Steel Guardian'] },
  pt: { minFighters: 1, minStages: 1, requiredNames: ['Lisa'] },
  shortmessage: { minFighters: 1, minStages: 3, requiredNames: ['Sakura Head'] },
  shf: { minFighters: 19, minStages: 9, requiredNames: ['Shiromuku','Kyubi'] },
  film: { minFighters: 13, minStages: 8, requiredNames: ['Red Pyramid — Film','Mannequin Monster','Red Pyramid Thing — Return to Silent Hill'] },
  ascension: { minFighters: 7, minStages: 3, requiredNames: ['The Immolator','The Collector'] },
  townfall: { minFighters: 5, minStages: 6, requiredNames: ['Lunger','Sorrowful','Fallen','Widow','The Weight'], namingNote: 'L’annonce officielle ne publie pas de bestiaire nommé ; les appellations de guides post-sortie restent balisées comme telles.' }
});

export function coverageAudit() {
  const sources = {};
  for (const [source, target] of Object.entries(SOURCE_COVERAGE_TARGETS)) {
    const fighters = ROSTER.filter((fighter) => fighter.source === source);
    const stages = STAGES.filter((stage) => stage.source === source);
    const names = new Set(fighters.map((fighter) => fighter.name));
    const missing = target.requiredNames.filter((name) => !names.has(name));
    sources[source] = {
      fighters: fighters.length,
      stages: stages.length,
      minFighters: target.minFighters,
      minStages: target.minStages,
      missing,
      complete: fighters.length >= target.minFighters && stages.length >= target.minStages && missing.length === 0,
      namingNote: target.namingNote || null
    };
  }
  return {
    version: VERSION,
    scope: 'Manifestations, boss, humains hostiles et set-pieces adaptables des 16 packs média inclus.',
    policy: 'Distingue nom officiel/établi, nom de guide post-sortie, variante d’écran et nom descriptif ; aucune lacune connue dans ce périmètre après audit v0.7.0.',
    sources,
    complete: Object.values(sources).every((entry) => entry.complete)
  };
}

export function getFighter(id) { return ROSTER.find(f => f.id === id || f.legacyIds?.includes(id)) || ROSTER[0]; }
export function getStage(id) { return STAGES.find(s => s.id === id) || STAGES[0]; }
export function sourceLabel(source) { return SOURCE_META[source]?.label || source; }

export function createCombatProfile(fighter) {
  const base = ARCHETYPES[fighter.archetype] || ARCHETYPES.balanced;
  const trait = MANIFESTATION_TRAITS[fighter.trait] || MANIFESTATION_TRAITS.echo;
  const affliction = AFFLICTIONS[fighter.affliction] || AFFLICTIONS.bleed;
  const scalePower = fighter.boss ? 1.03 : 1;
  const ranged = ['zoner','artillery','flyer','ghost','trickster'].includes(fighter.archetype);
  const grappler = ['grappler','juggernaut','boss'].includes(fighter.archetype);
  const speed = base.speed * (trait.speed || 1);
  const jump = base.jump * (trait.jump || 1);
  const power = base.power;
  const reach = base.reach;
  const recoveryScale = trait.recoveryScale || 1;
  const effect = fighter.affliction;
  const specialEffect = { id: effect, duration: affliction.duration, potency: fighter.boss ? 1.15 : 1 };
  const ai = AI_PERSONALITIES[fighter.aiProfile || fighter.archetype] || AI_PERSONALITIES.balanced;
  const bossPhases = createBossPhases(fighter);
  const loreMoveset = buildLoreMoveset(fighter, {
    power, reach, speed, recoveryScale,
    projectileScale: trait.projectileScale || 1,
    throwDamage: trait.throwDamage || 1,
    throwEffect: trait.throwEffect || null,
    throwEffectDuration: trait.throwEffect ? AFFLICTIONS[trait.throwEffect]?.duration : null,
    effectId: effect,
    effectDuration: affliction.duration
  });
  return {
    ...base,
    speed,
    jump,
    power,
    reach,
    trait: { id: fighter.trait, ...trait },
    affliction: { id: fighter.affliction, ...affliction },
    ai: { id: fighter.aiProfile || fighter.archetype, ...ai },
    bossPhases,
    maxHealth: Math.round(base.health * (fighter.boss ? 1.08 : 1)),
    armor: trait.damageReduction || 0,
    hitstunScale: trait.hitstunScale || 1,
    dodgeInvuln: 14 + (trait.dodgeInvuln || 0),
    cancelWindow: 5 + (trait.cancelWindow || 0),
    lowProfile: trait.lowProfile || 1,
    moves: loreMoveset.moves,
    moveset: loreMoveset
  };
}

export const CONTENT_STATS = Object.freeze({
  fighters: ROSTER.length,
  bosses: ROSTER.filter(f => f.boss).length,
  sources: Object.keys(SOURCE_META).length,
  stages: STAGES.length,
  chronicles: CHRONICLES.length,
  rituals: Object.keys(RITUAL_MODIFIERS).length,
  bossPhases: ROSTER.filter(f => f.boss).reduce((sum, fighter) => sum + createBossPhases(fighter).length, 0),
  fatalities: ROSTER.reduce((sum, fighter) => sum + fighter.fatalities.length, 0),
  stageFatalities: STAGES.filter(stage => stage.fatality).length,
  stageAnimations: STAGES.reduce((sum, stage) => sum + stage.animations.length, 0),
  stageDirectorEvents: STAGES.reduce((sum, stage) => sum + (stage.director?.events?.length || 0), 0),
  stageInteractions: STAGES.reduce((sum, stage) => sum + (stage.interactions?.length || 0), 0),
  stageHazardLinks: STAGES.reduce((sum, stage) => sum + (stage.director?.hazardDeck?.length || 0), 0),
  terrainProfiles: Object.keys(STAGE_TERRAINS).length,
  shiftStyles: Object.keys(STAGE_SHIFT_STYLES).length,
  moves: ROSTER.length * MOVESET_KEYS.length,
  directCanonicalMoves: ROSTER.reduce((sum, fighter) => sum + createCombatProfile(fighter).moveset.fidelitySummary.direct, 0),
  behaviorCompositeMoves: ROSTER.reduce((sum, fighter) => sum + createCombatProfile(fighter).moveset.fidelitySummary.composite, 0),
  versusAdaptationMoves: ROSTER.reduce((sum, fighter) => sum + createCombatProfile(fighter).moveset.fidelitySummary.adapted, 0),
  coverageComplete: coverageAudit().complete
});

export { MOVESET_KEYS, MOVE_INPUTS, MOVE_FIDELITY, STAGE_TERRAINS, STAGE_SHIFT_STYLES, STAGE_EVENTS, STAGE_INTERACTION_TRIGGERS, stageDirectorSummary };
