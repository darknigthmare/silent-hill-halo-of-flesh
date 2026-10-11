/*
 * SILENT HILL: HALO OF FLESH — movesets lore-first.
 *
 * Les mouvements sont séparés en trois niveaux de fidélité :
 * - direct-canonical : attaque ou comportement directement attesté dans le jeu source ;
 * - behavior-composite : combinaison jouable de plusieurs comportements attestés ;
 * - versus-adaptation : ajout nécessaire au format versus, explicitement signalé.
 */

export const MOVESET_KEYS = Object.freeze([
  'neutralLight','forwardLight','crouchLight','airLight',
  'neutralHeavy','forwardHeavy','crouchHeavy','airHeavy',
  'throw','backThrow','dodgeAttack','guardCounter','wakeupAttack',
  'neutralSpecial','forwardSpecial','backSpecial','downSpecial','airSpecial',
  'super','desperation'
]);

export const MOVE_INPUTS = Object.freeze({
  neutralLight: 'L',
  forwardLight: '→ + L',
  crouchLight: '↓ + L',
  airLight: 'AIR + L',
  neutralHeavy: 'H',
  forwardHeavy: '→ + H',
  crouchHeavy: '↓ + H',
  airHeavy: 'AIR + H',
  throw: 'T',
  backThrow: '← + T',
  dodgeAttack: 'DODGE + L',
  guardCounter: 'P-GUARD + H',
  wakeupAttack: 'RISE + S',
  neutralSpecial: 'S',
  forwardSpecial: '→ + S',
  backSpecial: '← + S',
  downSpecial: '↓ + S',
  airSpecial: 'AIR + S',
  super: 'N',
  desperation: '≤ 30% HP + N'
});

export const MOVE_FIDELITY = Object.freeze({
  'direct-canonical': {
    label: 'DIRECTEMENT ATTESTÉ',
    description: 'Action, arme ou comportement directement observé dans la source.'
  },
  'behavior-composite': {
    label: 'COMPOSITE LORE-FRIENDLY',
    description: 'Combinaison jouable de comportements attestés sans prétendre reproduire une animation officielle image par image.'
  },
  'versus-adaptation': {
    label: 'ADAPTATION VERSUS',
    description: 'Action nécessaire à l’équilibre du jeu de combat, inspirée de la morphologie et du symbolisme.'
  }
});

const SLOT_SPECS = Object.freeze({
  neutralLight:  { button:'light', category:'normal', stance:'standing', startup:5, active:3, recovery:9, damage:34, reach:62, level:'mid', meter:6, cancelInto:['forwardLight','neutralHeavy','neutralSpecial'] },
  forwardLight:  { button:'light', category:'command-normal', stance:'standing', startup:7, active:4, recovery:12, damage:46, reach:82, level:'mid', meter:8, travel:1.45, cancelInto:['neutralHeavy','forwardHeavy','forwardSpecial'] },
  crouchLight:   { button:'light', category:'normal', stance:'crouching', startup:6, active:4, recovery:11, damage:38, reach:70, level:'low', meter:7, cancelInto:['crouchHeavy','downSpecial'] },
  airLight:      { button:'light', category:'aerial', stance:'air', startup:5, active:5, recovery:10, damage:40, reach:68, level:'overhead', meter:7, requiresAir:true, airControl:.55, cancelInto:['airHeavy','airSpecial'] },
  neutralHeavy:  { button:'heavy', category:'normal', stance:'standing', startup:12, active:6, recovery:21, damage:78, reach:96, level:'mid', meter:13, knockback:8, cancelInto:['neutralSpecial','forwardSpecial'] },
  forwardHeavy:  { button:'heavy', category:'command-normal', stance:'standing', startup:17, active:7, recovery:27, damage:102, reach:126, level:'overhead', meter:17, knockback:12, travel:2.25, guardDamage:1.2, cancelInto:['forwardSpecial'] },
  crouchHeavy:   { button:'heavy', category:'normal', stance:'crouching', startup:13, active:6, recovery:23, damage:72, reach:104, level:'low', meter:13, knockback:10, knockdown:true, cancelInto:['downSpecial'] },
  airHeavy:      { button:'heavy', category:'aerial', stance:'air', startup:13, active:7, recovery:22, damage:88, reach:96, level:'overhead', meter:14, requiresAir:true, verticalTravel:1.8, knockback:12 },
  throw:         { button:'throw', category:'throw', stance:'standing', startup:8, active:3, recovery:28, damage:94, reach:62, level:'throw', meter:16, knockback:13, effectMode:'throw' },
  backThrow:     { button:'throw', category:'throw', stance:'standing', startup:9, active:3, recovery:30, damage:90, reach:64, level:'throw', meter:17, knockback:11, launch:7.2, effectMode:'throw', trigger:'back-throw', sideSwitch:true, hardKnockdown:true },
  dodgeAttack:   { button:'dodge', category:'reversal', stance:'any', startup:6, active:5, recovery:18, damage:58, reach:92, level:'mid', meter:11, knockback:8, travel:2.6, invulnFrames:4, trigger:'dodge-followup', cancelInto:['neutralSpecial','forwardSpecial'] },
  guardCounter:  { button:'guard', category:'counter', stance:'standing', startup:5, active:5, recovery:22, damage:98, reach:108, level:'mid', meter:18, knockback:13, guardDamage:1.45, armorBreak:true, trigger:'perfect-guard', cancelInto:['forwardSpecial'] },
  wakeupAttack:  { button:'special', category:'reversal', stance:'grounded-recovery', startup:8, active:8, recovery:28, damage:84, reach:120, level:'low', meter:14, knockback:10, invulnFrames:6, knockdown:true, groundBounce:true, trigger:'wakeup', effectMode:'signature' },
  neutralSpecial:{ button:'special', category:'special', stance:'standing', startup:15, active:6, recovery:26, damage:112, reach:150, level:'mid', meter:20, knockback:10, effectMode:'signature' },
  forwardSpecial:{ button:'special', category:'special', stance:'standing', startup:13, active:10, recovery:29, damage:124, reach:176, level:'mid', meter:22, travel:3.35, knockback:13, effectMode:'signature' },
  backSpecial:   { button:'special', category:'special', stance:'standing', startup:10, active:5, recovery:24, damage:78, reach:150, level:'mid', meter:18, travel:-2.6, invulnFrames:6, effectMode:'signature' },
  downSpecial:   { button:'special', category:'special', stance:'crouching', startup:19, active:10, recovery:31, damage:104, reach:190, level:'low', meter:21, knockback:8, effectMode:'signature' },
  airSpecial:    { button:'special', category:'special', stance:'air', startup:14, active:9, recovery:24, damage:118, reach:165, level:'overhead', meter:22, requiresAir:true, verticalTravel:2.6, effectMode:'signature' },
  super:         { button:'super', category:'nightmare', stance:'any', startup:27, active:14, recovery:43, damage:238, reach:245, level:'mid', meterCost:100, knockback:20, hits:3, hitInterval:5, effectMode:'super' },
  desperation:   { button:'super', category:'desperation', stance:'any', startup:34, active:18, recovery:52, damage:282, reach:285, level:'unblockable', meterCost:100, knockback:24, hits:4, hitInterval:5, healthRequirement:.3, effectMode:'super' }
});

const KIND_NAMES = Object.freeze({
  humanoid: {
    neutralLight:'Coup convulsif', forwardLight:'Pas brisé', crouchLight:'Balayage des chevilles', airLight:'Coude descendant',
    neutralHeavy:'Marteau du torse', forwardHeavy:'Ruée disloquée', crouchHeavy:'Fauchage au sol', airHeavy:'Chute du corps', throw:'Étreinte impossible'
  },
  child: {
    neutralLight:'Entaille hésitante', forwardLight:'Course du couloir', crouchLight:'Coup sous la garde', airLight:'Bond de l’ombre',
    neutralHeavy:'Double entaille', forwardHeavy:'Ruée enfantine', crouchHeavy:'Couteau au sol', airHeavy:'Chute sans visage', throw:'Étreinte de Midwich'
  },
  nurse: {
    neutralLight:'Piqûre clinique', forwardLight:'Pas de service', crouchLight:'Incision basse', airLight:'Scalpel descendant',
    neutralHeavy:'Coup d’instrument', forwardHeavy:'Charge du chariot', crouchHeavy:'Section du tendon', airHeavy:'Protocole aérien', throw:'Contention médicale'
  },
  quadruped: {
    neutralLight:'Morsure courte', forwardLight:'Ruée animale', crouchLight:'Croc au jarret', airLight:'Bond prédateur',
    neutralHeavy:'Double morsure', forwardHeavy:'Plaquage', crouchHeavy:'Balayage des pattes', airHeavy:'Chute de la meute', throw:'Mâchoire verrouillée'
  },
  flyer: {
    neutralLight:'Griffe d’aile', forwardLight:'Rase-mottes', crouchLight:'Serre basse', airLight:'Piqué court',
    neutralHeavy:'Battement tranchant', forwardHeavy:'Plongée', crouchHeavy:'Balayage d’aile', airHeavy:'Talon météore', throw:'Enlèvement aérien'
  },
  insect: {
    neutralLight:'Mandibule', forwardLight:'Ruée rampante', crouchLight:'Morsure sous la garde', airLight:'Saut parasite',
    neutralHeavy:'Carapace lancée', forwardHeavy:'Essaim frontal', crouchHeavy:'Fauchage chitineux', airHeavy:'Chute de vermine', throw:'Encerclement'
  },
  worm: {
    neutralLight:'Morsure annelée', forwardLight:'Percée du sol', crouchLight:'Anneau rampant', airLight:'Arc de la gueule',
    neutralHeavy:'Mâchoire verticale', forwardHeavy:'Surgissement', crouchHeavy:'Balayage du segment', airHeavy:'Retombée souterraine', throw:'Dévoration partielle'
  },
  giant: {
    neutralLight:'Poing de masse', forwardLight:'Pas sismique', crouchLight:'Écrasement bas', airLight:'Chute lourde',
    neutralHeavy:'Marteau colossal', forwardHeavy:'Charge monumentale', crouchHeavy:'Balayage du sol', airHeavy:'Impact terminal', throw:'Soulèvement écrasant'
  },
  ghost: {
    neutralLight:'Contact spectral', forwardLight:'Glissement mural', crouchLight:'Main sous le plancher', airLight:'Passage suspendu',
    neutralHeavy:'Saisie du cœur', forwardHeavy:'Traversée', crouchHeavy:'Aura au sol', airHeavy:'Chute intangible', throw:'Possession brève'
  },
  pyramid: {
    neutralLight:'Garde de l’exécuteur', forwardLight:'Traînée de lame', crouchLight:'Pointe au sol', airLight:'Poids du casque',
    neutralHeavy:'Sentence horizontale', forwardHeavy:'Grand arc', crouchHeavy:'Découpe basse', airHeavy:'Chute du bourreau', throw:'Condamnation'
  },
  mannequin: {
    neutralLight:'Jambe-ciseaux', forwardLight:'Pas articulé', crouchLight:'Crochet inférieur', airLight:'Rotation de membres',
    neutralHeavy:'Double frappe', forwardHeavy:'Embuscade', crouchHeavy:'Pliure basse', airHeavy:'Chute articulée', throw:'Nœud de jambes'
  },
  mass: {
    neutralLight:'Pulsation charnelle', forwardLight:'Avancée de chair', crouchLight:'Masse au sol', airLight:'Retombée organique',
    neutralHeavy:'Onde viscérale', forwardHeavy:'Écrasement de masse', crouchHeavy:'Rampe d’appendices', airHeavy:'Chute de tissus', throw:'Absorption'
  },
  wall: {
    neutralLight:'Bras de paroi', forwardLight:'Extension murale', crouchLight:'Main du sol', airLight:'Chute de plafond',
    neutralHeavy:'Claque structurelle', forwardHeavy:'Mur avançant', crouchHeavy:'Fissure basse', airHeavy:'Effondrement', throw:'Ensevelissement'
  },
  doll: {
    neutralLight:'Coup de poupée', forwardLight:'Pas mécanique', crouchLight:'Balayage de porcelaine', airLight:'Fil descendant',
    neutralHeavy:'Brisure articulée', forwardHeavy:'Charge de vitrine', crouchHeavy:'Section basse', airHeavy:'Marionnette tombante', throw:'Fils de contrôle'
  },
  flowerhead: {
    neutralLight:'Pétale-lame', forwardLight:'Ruée florale', crouchLight:'Racine basse', airLight:'Floraison aérienne',
    neutralHeavy:'Branche faucheuse', forwardHeavy:'Étreinte de pétales', crouchHeavy:'Ronces du sol', airHeavy:'Pluie rouge', throw:'Enracinement'
  },
  deity: {
    neutralLight:'Signe du culte', forwardLight:'Marche du jugement', crouchLight:'Sceau inférieur', airLight:'Main céleste',
    neutralHeavy:'Décret', forwardHeavy:'Colonne sacrée', crouchHeavy:'Cercle du sol', airHeavy:'Descente divine', throw:'Marquage rituel'
  },
  cage: {
    neutralLight:'Barreau vivant', forwardLight:'Balancement', crouchLight:'Crochet inférieur', airLight:'Chute suspendue',
    neutralHeavy:'Impact de cage', forwardHeavy:'Pendule', crouchHeavy:'Traction au sol', airHeavy:'Écrasement suspendu', throw:'Suspension'
  },
  fungus: {
    neutralLight:'Spore courte', forwardLight:'Poussée fongique', crouchLight:'Mycélium bas', airLight:'Nuage descendant',
    neutralHeavy:'Éclatement de spores', forwardHeavy:'Colonisation', crouchHeavy:'Racines fongiques', airHeavy:'Pluie toxique', throw:'Enveloppement mycélien'
  },
  wheelchair: {
    neutralLight:'Heurt de roue', forwardLight:'Charge roulante', crouchLight:'Axe bas', airLight:'Bond impossible',
    neutralHeavy:'Collision', forwardHeavy:'Percussion hantée', crouchHeavy:'Écrasement de roue', airHeavy:'Chute mécanique', throw:'Encastrement'
  },
  fox: {
    neutralLight:'Griffe rituelle', forwardLight:'Pas du renard', crouchLight:'Queue basse', airLight:'Bond du masque',
    neutralHeavy:'Éventail de queues', forwardHeavy:'Procession', crouchHeavy:'Cercle inférieur', airHeavy:'Descente du kitsune', throw:'Sceau nuptial'
  },
  spider: {
    neutralLight:'Patte-lame', forwardLight:'Ruée arachnéenne', crouchLight:'Fauche au sol', airLight:'Chute du plafond',
    neutralHeavy:'Double perforation', forwardHeavy:'Pounce', crouchHeavy:'Piège de pattes', airHeavy:'Descente du cocon', throw:'Cocon'
  },
  void: {
    neutralLight:'Distorsion', forwardLight:'Mur avançant', crouchLight:'Faille basse', airLight:'Chute du vide',
    neutralHeavy:'Effacement', forwardHeavy:'Vague d’oubli', crouchHeavy:'Aspiration du sol', airHeavy:'Renversement du plan', throw:'Absorption spatiale'
  },
  serpentine: {
    neutralLight:'Frappe de vrille', forwardLight:'Allonge annelée', crouchLight:'Fouet bas', airLight:'Arc serpent',
    neutralHeavy:'Double constriction', forwardHeavy:'Charge ondulante', crouchHeavy:'Nœud du sol', airHeavy:'Retombée de vrille', throw:'Constriction'
  }
});

const CONTEXT_NAMES = Object.freeze({
  humanoid:   { backThrow:'Projection brisée', dodgeAttack:'Retour convulsif', guardCounter:'Riposte du corps', wakeupAttack:'Reprise impossible' },
  child:      { backThrow:'Renversement du couloir', dodgeAttack:'Bond de fuite', guardCounter:'Couteau de réponse', wakeupAttack:'Réveil sous les pupitres' },
  nurse:      { backThrow:'Contention inversée', dodgeAttack:'Pas clinique', guardCounter:'Contre-protocole', wakeupAttack:'Reprise du service' },
  quadruped:  { backThrow:'Traction de la meute', dodgeAttack:'Bond latéral', guardCounter:'Morsure de riposte', wakeupAttack:'Relèvement animal' },
  flyer:      { backThrow:'Largage arrière', dodgeAttack:'Battement d’évasion', guardCounter:'Serre de riposte', wakeupAttack:'Redécollage' },
  insect:     { backThrow:'Renversement chitineux', dodgeAttack:'Écart parasite', guardCounter:'Mandibule de riposte', wakeupAttack:'Mue de reprise' },
  worm:       { backThrow:'Rejet annelé', dodgeAttack:'Surgissement latéral', guardCounter:'Mâchoire de réponse', wakeupAttack:'Retour souterrain' },
  giant:      { backThrow:'Jet monumental', dodgeAttack:'Pas de masse', guardCounter:'Contre-écrasement', wakeupAttack:'Relèvement sismique' },
  ghost:      { backThrow:'Possession inversée', dodgeAttack:'Déphasage offensif', guardCounter:'Retour spectral', wakeupAttack:'Réapparition du sol' },
  pyramid:    { backThrow:'Condamnation arrière', dodgeAttack:'Pas de l’exécuteur', guardCounter:'Sentence de riposte', wakeupAttack:'Relèvement du bourreau' },
  mannequin:  { backThrow:'Nœud inversé', dodgeAttack:'Pliure d’esquive', guardCounter:'Ciseaux de réponse', wakeupAttack:'Redressement articulé' },
  mass:       { backThrow:'Reflux charnel', dodgeAttack:'Débordement latéral', guardCounter:'Pulsation de riposte', wakeupAttack:'Reconstitution organique' },
  wall:       { backThrow:'Ensevelissement arrière', dodgeAttack:'Glissement de paroi', guardCounter:'Mur de réponse', wakeupAttack:'Émergence structurelle' },
  doll:       { backThrow:'Valse inversée', dodgeAttack:'Pas de poupée', guardCounter:'Fil de riposte', wakeupAttack:'Remontage du corps' },
  flowerhead: { backThrow:'Enracinement arrière', dodgeAttack:'Pas de pétales', guardCounter:'Floraison de riposte', wakeupAttack:'Repousse rouge' },
  deity:      { backThrow:'Rejet du jugement', dodgeAttack:'Glissement sacré', guardCounter:'Décret de riposte', wakeupAttack:'Résurrection rituelle' },
  cage:       { backThrow:'Balancement inversé', dodgeAttack:'Oscillation d’évasion', guardCounter:'Barreau de riposte', wakeupAttack:'Suspension retrouvée' },
  fungus:     { backThrow:'Rejet mycélien', dodgeAttack:'Poussée oblique', guardCounter:'Spore de riposte', wakeupAttack:'Repousse fongique' },
  wheelchair: { backThrow:'Marche arrière forcée', dodgeAttack:'Écart de roue', guardCounter:'Collision de riposte', wakeupAttack:'Redémarrage hanté' },
  fox:        { backThrow:'Sceau inversé', dodgeAttack:'Pas du masque', guardCounter:'Queue de riposte', wakeupAttack:'Retour du cortège' },
  spider:     { backThrow:'Traction du cocon', dodgeAttack:'Pas arachnéen', guardCounter:'Patte de riposte', wakeupAttack:'Remontée au fil' },
  void:       { backThrow:'Rejet hors du plan', dodgeAttack:'Décalage spatial', guardCounter:'Effacement de riposte', wakeupAttack:'Retour du néant' },
  serpentine: { backThrow:'Nœud inversé', dodgeAttack:'Ondulation d’évasion', guardCounter:'Vrille de riposte', wakeupAttack:'Reprise annelée' }
});

const SPECIAL_STYLE = Object.freeze({
  balanced:   { neutral:'Technique signature', forward:'Assaut signature', back:'Retrait trompeur', down:'Piège de proximité', air:'Descente signature' },
  rushdown:   { neutral:'Rafale signature', forward:'Poursuite signature', back:'Feinte arrière', down:'Fauchage signature', air:'Plongée signature' },
  juggernaut: { neutral:'Impact signature', forward:'Charge signature', back:'Armure du cauchemar', down:'Onde du sol', air:'Écrasement aérien' },
  grappler:   { neutral:'Saisie signature', forward:'Capture en marche', back:'Appel du corps', down:'Prise basse', air:'Projection aérienne' },
  zoner:      { neutral:'Projection signature', forward:'Tir en marche', back:'Repli armé', down:'Zone interdite', air:'Salve plongeante' },
  flyer:      { neutral:'Cri signature', forward:'Piqué signature', back:'Battement d’évasion', down:'Rase-mottes', air:'Plongée terminale' },
  swarm:      { neutral:'Nuée signature', forward:'Convergence', back:'Dispersion', down:'Infestation', air:'Essaim descendant' },
  ghost:      { neutral:'Hantise signature', forward:'Traversée', back:'Déphasage', down:'Aura persistante', air:'Apparition verticale' },
  puppet:     { neutral:'Geste signature', forward:'Danse articulée', back:'Fil de rappel', down:'Piège de poupée', air:'Chute de marionnette' },
  trickster:  { neutral:'Illusion signature', forward:'Fausse ouverture', back:'Disparition', down:'Leurre', air:'Attaque hors champ' },
  artillery:  { neutral:'Barrage signature', forward:'Canon mobile', back:'Recul de tir', down:'Mine organique', air:'Bombardement' },
  boss:       { neutral:'Pouvoir signature', forward:'Phase d’assaut', back:'Présence inviolable', down:'Rituel de zone', air:'Sentence descendante' }
});

const SPECIFIC_OVERRIDES = Object.freeze({
  sh1_air_screamer_001: {
    neutralSpecial:{name:'Cri d’approche', projectile:true, projectileCount:2, projectileArc:.22, fidelity:'direct-canonical'},
    forwardSpecial:{name:'Plongée lacérante', travel:5.2, hits:2, fidelity:'direct-canonical'},
    airSpecial:{name:'Piqué en spirale', travel:4.6, verticalTravel:4.4, fidelity:'behavior-composite'},
    dodgeAttack:{name:'Battement d’écart puis serre', travel:3.4, verticalTravel:1.2, fidelity:'behavior-composite'}
  },
  sh1_split_head_014: {
    forwardHeavy:{name:'Charge à gueule ouverte', reach:170, guardDamage:1.45, fidelity:'direct-canonical'},
    throw:{name:'Mâchoire verticale', damageScale:1.25, fidelity:'direct-canonical'},
    neutralSpecial:{name:'Dévoration frontale', unblockable:true, startupAdd:5, fidelity:'direct-canonical'}
  },
  sh1_incubus_019: {
    neutralSpecial:{name:'Salve de foudre', projectile:true, projectileCount:3, projectileArc:.26, fidelity:'direct-canonical'},
    downSpecial:{name:'Éclairs verticaux', projectile:true, projectileCount:2, projectileGravity:-.04, fidelity:'direct-canonical'},
    airSpecial:{name:'Foudre plongeante', projectile:true, projectileCount:3, fidelity:'behavior-composite'}
  },
  sh2_lying_figure_020: {
    neutralSpecial:{name:'Jet corrosif', projectile:true, projectileCount:1, fidelity:'direct-canonical'},
    crouchHeavy:{name:'Ruée rampante', travel:3.4, fidelity:'direct-canonical'},
    backSpecial:{name:'Repli dans l’enveloppe', armorFrames:12, fidelity:'behavior-composite'}
  },
  sh2_mannequin_022: {
    forwardLight:{name:'Embuscade immobile', teleport:'behind', fidelity:'direct-canonical'},
    neutralHeavy:{name:'Ciseaux de jambes', hits:2, fidelity:'direct-canonical'},
    throw:{name:'Verrou à quatre jambes', hits:3, fidelity:'behavior-composite'}
  },
  sh2_bubble_head_nurse_024: {
    neutralLight:{name:'Coup de tuyau', fidelity:'direct-canonical'},
    forwardHeavy:{name:'Marche convulsive', hits:2, fidelity:'behavior-composite'},
    neutralSpecial:{name:'Rafale du service', hits:3, fidelity:'behavior-composite'},
    dodgeAttack:{name:'Pas convulsif — coup de tuyau', travel:2.9, fidelity:'behavior-composite'},
    wakeupAttack:{name:'Relèvement saccadé', hits:2, fidelity:'behavior-composite'}
  },
  sh2_abstract_daddy_028: {
    forwardHeavy:{name:'Charge du cadre', armorFrames:16, travel:3.2, fidelity:'direct-canonical'},
    throw:{name:'Écrasement oppressant', damageScale:1.35, fidelity:'direct-canonical'},
    downSpecial:{name:'Enfermement du couloir', level:'unblockable', startupAdd:7, fidelity:'behavior-composite'}
  },
  sh2_red_pyramid_thing_great_knife_029: {
    neutralLight:{name:'Poignée du Grand Couteau', fidelity:'behavior-composite'},
    neutralHeavy:{name:'Grand Couteau — Vertical', damageScale:1.2, startupAdd:3, guardDamage:1.4, fidelity:'direct-canonical'},
    forwardHeavy:{name:'Grand Couteau — Balayage', reach:190, damageScale:1.15, fidelity:'direct-canonical'},
    crouchHeavy:{name:'Traînée du Grand Couteau', level:'low', travel:2.2, fidelity:'direct-canonical'},
    backThrow:{name:'Traction derrière l’exécuteur', damageScale:1.22, hardKnockdown:true, fidelity:'behavior-composite'},
    guardCounter:{name:'Réponse du Grand Couteau', damageScale:1.18, armorBreak:true, fidelity:'behavior-composite'},
    wakeupAttack:{name:'Relèvement silencieux du bourreau', armorFrames:18, fidelity:'behavior-composite'},
    neutralSpecial:{name:'Sentence lente', level:'unblockable', armorFrames:18, startupAdd:8, fidelity:'behavior-composite'},
    forwardSpecial:{name:'Poursuite de l’exécuteur', travel:4.1, armorFrames:14, fidelity:'direct-canonical'}
  },
  sh2_red_pyramid_thing_spear_030: {
    neutralLight:{name:'Pointe de lance', reach:100, fidelity:'direct-canonical'},
    neutralHeavy:{name:'Estoc de la sentence', reach:170, fidelity:'direct-canonical'},
    backThrow:{name:'Renversement à la hampe', reach:96, hardKnockdown:true, fidelity:'behavior-composite'},
    guardCounter:{name:'Riposte de la lance', reach:178, damageScale:1.12, fidelity:'behavior-composite'},
    forwardSpecial:{name:'Percée de la lance', reach:230, travel:3.8, fidelity:'direct-canonical'},
    downSpecial:{name:'Balayage double', hits:2, fidelity:'behavior-composite'}
  },
  sh2_eddie_dombrowski_032: {
    neutralSpecial:{name:'Tir du réfrigérateur', projectile:true, projectileCount:1, fidelity:'direct-canonical'},
    backSpecial:{name:'Repli derrière la carcasse', travel:-3.8, invulnFrames:9, fidelity:'direct-canonical'},
    downSpecial:{name:'Tir depuis la couverture', projectile:true, projectileCount:2, fidelity:'behavior-composite'}
  },
  sh3_pendulum_039: {
    neutralSpecial:{name:'Rotation métallique', hits:4, travel:1.2, fidelity:'direct-canonical'},
    forwardSpecial:{name:'Trajectoire erratique', teleport:'cross', hits:3, fidelity:'direct-canonical'},
    airSpecial:{name:'Pendule plongeant', hits:3, verticalTravel:4.1, fidelity:'direct-canonical'}
  },
  sh3_god_050: {
    neutralSpecial:{name:'Colonne de feu', projectile:true, projectileCount:3, projectileArc:.38, fidelity:'direct-canonical'},
    forwardHeavy:{name:'Griffe divine', reach:210, fidelity:'direct-canonical'},
    downSpecial:{name:'Brasier du sol', projectile:true, projectileCount:4, projectileGravity:-.08, fidelity:'direct-canonical'}
  },
  sh3_valtiel_051: {
    backSpecial:{name:'Rotation de la valve', armorFrames:20, meterGain:10, fidelity:'direct-canonical'},
    neutralSpecial:{name:'Gardien de la naissance', hits:2, fidelity:'behavior-composite'},
    downSpecial:{name:'Traction sous la grille', teleport:'behind', fidelity:'behavior-composite'}
  },
  sh4_ghost_victim_066: {
    neutralHeavy:{name:'Main dans le cœur', effectOverride:'dread', fidelity:'direct-canonical'},
    backThrow:{name:'Possession inversée', teleport:'behind', effectOverride:'dread', fidelity:'behavior-composite'},
    dodgeAttack:{name:'Déphasage offensif', teleport:'cross', invulnFrames:9, effectOverride:'dread', fidelity:'direct-canonical'},
    guardCounter:{name:'Retour spectral', teleport:'behind', effectOverride:'dread', fidelity:'behavior-composite'},
    wakeupAttack:{name:'Émergence depuis le sol', teleport:'behind', effectOverride:'dread', fidelity:'behavior-composite'},
    forwardSpecial:{name:'Émergence du mur', teleport:'behind', fidelity:'direct-canonical'},
    downSpecial:{name:'Aura de céphalée', aura:true, effectOverride:'dread', fidelity:'direct-canonical'}
  },
  sh4_wheelchair_068: {
    forwardHeavy:{name:'Charge invulnérable', armorFrames:22, travel:4.4, fidelity:'direct-canonical'},
    backThrow:{name:'Marche arrière hantée', sideSwitch:true, hardKnockdown:true, fidelity:'behavior-composite'},
    dodgeAttack:{name:'Écart de roue autonome', travel:4.4, invulnFrames:10, fidelity:'behavior-composite'},
    guardCounter:{name:'Collision de riposte', armorBreak:true, travel:3.8, fidelity:'behavior-composite'},
    wakeupAttack:{name:'Redémarrage impossible', armorFrames:20, fidelity:'behavior-composite'},
    neutralSpecial:{name:'Percussion hantée', hits:3, armorFrames:16, fidelity:'direct-canonical'},
    backSpecial:{name:'Recul autonome', travel:-4.2, invulnFrames:10, fidelity:'behavior-composite'}
  },
  sh4_walter_sullivan_072: {
    neutralLight:{name:'Coup de tuyau', fidelity:'direct-canonical'},
    neutralHeavy:{name:'Tronçonneuse rituelle', hits:4, fidelity:'direct-canonical'},
    neutralSpecial:{name:'Tir du ritualiste', projectile:true, projectileCount:2, fidelity:'direct-canonical'},
    forwardSpecial:{name:'Poursuite de Walter', travel:4.2, armorFrames:8, fidelity:'direct-canonical'}
  },
  origins_caliban_079: {
    forwardHeavy:{name:'Charge de Caliban', travel:4.5, knockbackAdd:5, fidelity:'direct-canonical'},
    crouchHeavy:{name:'Fauchage à quatre membres', hits:2, fidelity:'behavior-composite'},
    airSpecial:{name:'Lunge contorsionné', verticalTravel:3.6, fidelity:'direct-canonical'}
  },
  origins_the_butcher_081: {
    neutralHeavy:{name:'Couperet du boucher', damageScale:1.2, fidelity:'direct-canonical'},
    forwardHeavy:{name:'Marche du couperet', armorFrames:14, reach:175, fidelity:'direct-canonical'},
    neutralSpecial:{name:'Exécution du motel', level:'unblockable', startupAdd:6, fidelity:'behavior-composite'}
  },
  homecoming_smog_087: {
    neutralSpecial:{name:'Nuage de smog', projectile:true, projectileCount:3, projectileArc:.4, effectOverride:'decay', fidelity:'direct-canonical'},
    downSpecial:{name:'Cage thoracique ouverte', aura:true, effectOverride:'decay', fidelity:'direct-canonical'}
  },
  homecoming_needler_088: {
    neutralHeavy:{name:'Parade des quatre lames', armorFrames:10, hits:2, fidelity:'direct-canonical'},
    guardCounter:{name:'Riposte des quatre lames', hits:2, armorBreak:true, fidelity:'direct-canonical'},
    dodgeAttack:{name:'Bond oblique du Needler', travel:3.8, hits:2, fidelity:'behavior-composite'},
    forwardSpecial:{name:'Pounce du Needler', travel:4.7, hits:3, fidelity:'direct-canonical'},
    backSpecial:{name:'Garde frontale', armorFrames:20, fidelity:'direct-canonical'}
  },
  homecoming_scarlet_doll_form_094: {
    neutralSpecial:{name:'Danse de porcelaine', hits:4, fidelity:'direct-canonical'},
    forwardSpecial:{name:'Bris de membres', armorFrames:10, hits:3, fidelity:'direct-canonical'},
    backSpecial:{name:'Recomposition', meterGain:12, armorFrames:12, fidelity:'behavior-composite'}
  },
  homecoming_scarlet_spider_form_095: {
    airLight:{name:'Chute du plafond', fidelity:'direct-canonical'},
    forwardSpecial:{name:'Mue arachnéenne', teleport:'behind', hits:3, fidelity:'direct-canonical'},
    downSpecial:{name:'Piège de porcelaine', trap:true, fidelity:'behavior-composite'}
  },
  homecoming_asphyxia_096: {
    neutralHeavy:{name:'Anneau de bras', hits:4, reach:175, fidelity:'direct-canonical'},
    forwardSpecial:{name:'Balayage circulaire', hits:5, fidelity:'direct-canonical'},
    throw:{name:'Étreinte asphyxiante', damageScale:1.3, effectOverride:'bind', fidelity:'direct-canonical'}
  },
  shattered_raw_shock_base_099: {
    forwardSpecial:{name:'Poursuite du cauchemar', travel:4.8, armorFrames:6, fidelity:'direct-canonical'},
    throw:{name:'Étreinte glacée', effectOverride:'frost', fidelity:'direct-canonical'},
    dodgeAttack:{name:'Écart de poursuite', travel:4.2, effectOverride:'frost', fidelity:'behavior-composite'},
    wakeupAttack:{name:'Relèvement dans la glace', effectOverride:'frost', fidelity:'behavior-composite'},
    backSpecial:{name:'Déformation psychologique', teleport:'cross', fidelity:'behavior-composite'}
  },
  downpour_void_113: {
    neutralSpecial:{name:'Mur du Void', projectile:true, projectileCount:1, projectileScale:2.4, projectileSpeed:5.5, fidelity:'direct-canonical'},
    forwardSpecial:{name:'Dévoration de l’espace', level:'unblockable', travel:2.8, armorFrames:24, fidelity:'direct-canonical'},
    dodgeAttack:{name:'Décalage du corridor', teleport:'cross', invulnFrames:12, fidelity:'direct-canonical'},
    guardCounter:{name:'Effacement de riposte', projectile:true, projectileScale:1.8, projectileSpeed:6.2, armorBreak:true, fidelity:'behavior-composite'},
    wakeupAttack:{name:'Retour du néant', teleport:'cross', fidelity:'behavior-composite'},
    backSpecial:{name:'Repli impossible', teleport:'cross', fidelity:'behavior-composite'},
    downSpecial:{name:'Sol effacé', trap:true, effectOverride:'dread', fidelity:'behavior-composite'}
  },
  downpour_wheelman_116: {
    neutralSpecial:{name:'Décharge des câbles', projectile:true, projectileCount:3, effectOverride:'static', fidelity:'direct-canonical'},
    forwardHeavy:{name:'Charge du Wheelman', travel:4.0, armorFrames:18, fidelity:'direct-canonical'},
    throw:{name:'Câbles de contention', effectOverride:'bind', hits:2, fidelity:'direct-canonical'}
  },
  arcade_tuberculosis: {
    neutralSpecial:{name:'Souffle de Brookhaven', projectile:true, projectileCount:4, projectileArc:.48, effectOverride:'decay', fidelity:'direct-canonical'},
    downSpecial:{name:'Appendices pulmonaires', hits:3, effectOverride:'bind', fidelity:'direct-canonical'}
  },
  pt_lisa_149: {
    neutralLight:{name:'Tremblement derrière soi', teleport:'behind', fidelity:'direct-canonical'},
    backThrow:{name:'Saisie derrière l’épaule', teleport:'behind', effectOverride:'dread', fidelity:'behavior-composite'},
    dodgeAttack:{name:'Apparition après l’angle mort', teleport:'cross', invulnFrames:12, effectOverride:'dread', fidelity:'direct-canonical'},
    guardCounter:{name:'Retour derrière soi', teleport:'behind', effectOverride:'static', fidelity:'behavior-composite'},
    wakeupAttack:{name:'Réapparition dans la boucle', teleport:'cross', effectOverride:'dread', fidelity:'behavior-composite'},
    forwardSpecial:{name:'Apparition de Lisa', teleport:'behind', hits:2, effectOverride:'dread', fidelity:'direct-canonical'},
    backSpecial:{name:'Boucle du couloir', teleport:'cross', invulnFrames:12, fidelity:'direct-canonical'},
    downSpecial:{name:'Présence au miroir', trap:true, effectOverride:'static', fidelity:'behavior-composite'}
  },
  shortmessage_sakura_head_150: {
    neutralLight:{name:'Branche de cerisier', fidelity:'direct-canonical'},
    dodgeAttack:{name:'Accélération de pétales', travel:4.8, hits:2, effectOverride:'bloom', fidelity:'direct-canonical'},
    guardCounter:{name:'Branches de riposte', hits:3, effectOverride:'bloom', fidelity:'behavior-composite'},
    wakeupAttack:{name:'Repousse écarlate', effectOverride:'bloom', groundBounce:true, fidelity:'behavior-composite'},
    forwardSpecial:{name:'Poursuite des pétales', travel:5.0, hits:3, effectOverride:'bloom', fidelity:'direct-canonical'},
    downSpecial:{name:'Racines de Maya', trap:true, effectOverride:'bloom', fidelity:'behavior-composite'},
    airSpecial:{name:'Floraison plongeante', verticalTravel:4.2, effectOverride:'bloom', fidelity:'direct-canonical'}
  },
  shf_kashimashi_151: {
    neutralLight:{name:'Couteau de poupée', fidelity:'direct-canonical'},
    forwardLight:{name:'Rafale au couteau', hits:3, fidelity:'direct-canonical'},
    throw:{name:'Saisie florale', effectOverride:'bloom', fidelity:'direct-canonical'},
    neutralSpecial:{name:'Convulsion de Kashimashi', hits:5, fidelity:'behavior-composite'}
  },
  shf_ayakakashi_152: {
    neutralLight:{name:'Quick Cut', fidelity:'direct-canonical'},
    neutralHeavy:{name:'Downward Strike', fidelity:'direct-canonical'},
    forwardHeavy:{name:'5-Hit Attack', hits:5, fidelity:'direct-canonical'},
    crouchHeavy:{name:'Upward Slash', launch:8, fidelity:'direct-canonical'},
    backSpecial:{name:'Imitation d’épouvantail', counterStance:true, fidelity:'direct-canonical'}
  },
  shf_ara_abare_153: {
    neutralHeavy:{name:'Bras-lame colossal', reach:175, damageScale:1.2, fidelity:'direct-canonical'},
    forwardHeavy:{name:'Charge bestiale', travel:4.3, armorFrames:18, fidelity:'direct-canonical'},
    downSpecial:{name:'Onde du sol', projectile:true, projectileCount:2, projectileGravity:-.06, fidelity:'direct-canonical'},
    desperation:{name:'Rage qui se relève', armorFrames:30, hits:5, fidelity:'behavior-composite'}
  },
  shf_oi_omoi_159: {
    neutralSpecial:{name:'Deafening Cry', aura:true, effectOverride:'static', fidelity:'direct-canonical'},
    forwardSpecial:{name:'Flailing Attack', hits:5, travel:2.1, fidelity:'direct-canonical'},
    backSpecial:{name:'Repli des poupées', armorFrames:12, fidelity:'behavior-composite'}
  },
  shf_sakuko_like_entity_162: {
    neutralLight:{name:'Kusarigama — Faux', reach:110, fidelity:'direct-canonical'},
    neutralHeavy:{name:'Masse et cloche', fidelity:'direct-canonical'},
    forwardSpecial:{name:'Chaîne du sanctuaire', projectile:true, projectileCount:1, projectileScale:1.4, fidelity:'direct-canonical'},
    backSpecial:{name:'Retraite de la prêtresse', travel:-4.0, invulnFrames:8, fidelity:'direct-canonical'}
  },
  shf_shiromuku_166: {
    backSpecial:{name:'Contre du Shiromuku', counterStance:true, armorFrames:16, fidelity:'direct-canonical'},
    forwardSpecial:{name:'Rubans tranchants', hits:4, reach:190, fidelity:'direct-canonical'},
    airSpecial:{name:'Procession blanche', teleport:'behind', hits:3, fidelity:'behavior-composite'}
  },
  shf_kyubi_169: {
    neutralHeavy:{name:'Éventail des neuf queues', hits:5, reach:185, fidelity:'direct-canonical'},
    neutralSpecial:{name:'Feu du renard', projectile:true, projectileCount:5, projectileArc:.55, fidelity:'behavior-composite'},
    forwardSpecial:{name:'Assaut de Kyubi', teleport:'cross', hits:4, fidelity:'direct-canonical'}
  },
  townfall_lunger: {
    neutralLight:{name:'Coup de tête-lame', fidelity:'direct-canonical'},
    forwardHeavy:{name:'Charge du Lunger', travel:5.1, armorFrames:6, fidelity:'direct-canonical'},
    neutralSpecial:{name:'Headbutt à tête de hache', damageScale:1.1, guardDamage:1.35, fidelity:'direct-canonical'},
    backSpecial:{name:'Ouverture de porte', travel:2.4, armorFrames:8, fidelity:'behavior-composite'}
  },
  townfall_sorrowful: {
    neutralSpecial:{name:'Cordon thoracique', projectile:true, projectileCount:1, projectileScale:1.5, effectOverride:'bind', fidelity:'direct-canonical'},
    forwardSpecial:{name:'Saisie du Sorrowful', level:'throw', reach:145, effectOverride:'bind', fidelity:'direct-canonical'},
    backSpecial:{name:'Repli voûté', travel:-3.4, fidelity:'behavior-composite'}
  },
  townfall_fallen: {
    backSpecial:{name:'Cadavre immobile', counterStance:true, invulnFrames:10, fidelity:'direct-canonical'},
    dodgeAttack:{name:'Ruée depuis l’immobilité', teleport:'behind', hits:2, fidelity:'behavior-composite'},
    guardCounter:{name:'Fausse mort — riposte', counterStance:true, fidelity:'behavior-composite'},
    wakeupAttack:{name:'Réveil soudain du Fallen', teleport:'behind', hits:2, fidelity:'direct-canonical'},
    forwardSpecial:{name:'Réveil soudain', teleport:'behind', hits:2, fidelity:'direct-canonical'},
    crouchHeavy:{name:'Ambuscade du sol', travel:3.2, fidelity:'direct-canonical'}
  },
  townfall_widow: {
    neutralLight:{name:'Coup de couteau', fidelity:'direct-canonical'},
    backThrow:{name:'Renversement au couteau', hits:2, fidelity:'behavior-composite'},
    dodgeAttack:{name:'Pounce depuis l’angle mort', teleport:'behind', hits:3, fidelity:'direct-canonical'},
    guardCounter:{name:'Couteau de riposte', teleport:'behind', fidelity:'behavior-composite'},
    forwardSpecial:{name:'Pounce dans le dos', teleport:'behind', hits:3, fidelity:'direct-canonical'},
    backSpecial:{name:'Angle mort', teleport:'cross', invulnFrames:10, fidelity:'direct-canonical'},
    downSpecial:{name:'Attente dans l’ombre', trap:true, fidelity:'behavior-composite'}
  },
  townfall_the_weight: {
    neutralLight:{name:'Main du fardeau', fidelity:'direct-canonical'},
    backThrow:{name:'Rejet du captif', damageScale:1.3, hardKnockdown:true, fidelity:'behavior-composite'},
    dodgeAttack:{name:'Pas de chasse lourd', travel:3.2, armorFrames:18, fidelity:'behavior-composite'},
    guardCounter:{name:'Fardeau de riposte', damageScale:1.25, armorBreak:true, armorFrames:24, fidelity:'behavior-composite'},
    wakeupAttack:{name:'Relèvement du fardeau', armorFrames:30, groundBounce:true, fidelity:'behavior-composite'},
    forwardHeavy:{name:'Charge du Weight', travel:4.0, armorFrames:28, level:'unblockable', fidelity:'direct-canonical'},
    neutralSpecial:{name:'Saisie létale', level:'throw', damageScale:1.45, fidelity:'direct-canonical'},
    backSpecial:{name:'Fardeau inviolable', armorFrames:32, fidelity:'direct-canonical'},
    downSpecial:{name:'Barres arrachées', projectile:true, projectileCount:2, fidelity:'behavior-composite'}
  }
});

function clone(value) {
  return value && typeof value === 'object' ? structuredClone(value) : value;
}

function normaliseKind(fighter) {
  return KIND_NAMES[fighter.visual?.kind] ? fighter.visual.kind : 'humanoid';
}

function rangedArchetype(fighter) {
  return ['zoner','artillery','flyer','ghost','trickster'].includes(fighter.archetype);
}

function grapplerArchetype(fighter) {
  return ['grappler','juggernaut','boss'].includes(fighter.archetype);
}

function defaultName(slot, fighter, kind) {
  const normal = KIND_NAMES[kind] || KIND_NAMES.humanoid;
  if (normal[slot]) return normal[slot];
  const context = CONTEXT_NAMES[kind] || CONTEXT_NAMES.humanoid;
  if (context[slot]) return `${fighter.signature} — ${context[slot]}`;
  const style = SPECIAL_STYLE[fighter.archetype] || SPECIAL_STYLE.balanced;
  if (slot === 'neutralSpecial') return fighter.signature || style.neutral;
  if (slot === 'forwardSpecial') return `${fighter.signature} — ${style.forward}`;
  if (slot === 'backSpecial') return `${fighter.signature} — ${style.back}`;
  if (slot === 'downSpecial') return `${fighter.signature} — ${style.down}`;
  if (slot === 'airSpecial') return `${fighter.signature} — ${style.air}`;
  if (slot === 'super') return `NIGHTMARE — ${fighter.signature}`;
  if (slot === 'desperation') return `OTHERWORLD — ${fighter.signature}`;
  return fighter.signature || 'Manifestation';
}

function fidelityFor(slot, override) {
  if (override?.fidelity) return override.fidelity;
  if (['backThrow','dodgeAttack','guardCounter','wakeupAttack','neutralSpecial','forwardSpecial','backSpecial','downSpecial','airSpecial'].includes(slot)) return 'behavior-composite';
  if (['super','desperation'].includes(slot)) return 'versus-adaptation';
  return 'behavior-composite';
}

function makeMove(slot, fighter, context, override = {}) {
  const spec = clone(SLOT_SPECS[slot]);
  const kind = normaliseKind(fighter);
  const power = context.power || 1;
  const reachScale = context.reach || 1;
  const recoveryScale = context.recoveryScale || 1;
  const bossScale = fighter.boss ? 1.05 : 1;
  const move = {
    key: slot,
    input: MOVE_INPUTS[slot],
    name: override.name || defaultName(slot, fighter, kind),
    button: spec.button,
    category: spec.category,
    stance: spec.stance,
    startup: Math.max(1, Math.round((spec.startup + (override.startupAdd || 0)) * (override.startupScale || 1))),
    active: Math.max(1, Math.round((override.active ?? spec.active) * (override.activeScale || 1))),
    recovery: Math.max(1, Math.round((spec.recovery + (override.recoveryAdd || 0)) * recoveryScale * (override.recoveryScale || 1))),
    damage: Math.max(1, Math.round(spec.damage * power * bossScale * (override.damageScale || 1))),
    reach: Math.max(34, Math.round((override.reach ?? spec.reach) * reachScale)),
    level: override.level || spec.level,
    meter: override.meter ?? spec.meter ?? 0,
    meterCost: override.meterCost ?? spec.meterCost,
    healthRequirement: override.healthRequirement ?? spec.healthRequirement,
    knockback: Math.max(0, Math.round((spec.knockback || 0) + (override.knockbackAdd || 0))),
    travel: override.travel ?? spec.travel ?? 0,
    verticalTravel: override.verticalTravel ?? spec.verticalTravel ?? 0,
    requiresAir: override.requiresAir ?? spec.requiresAir ?? false,
    requiresGround: override.requiresGround ?? !spec.requiresAir,
    airControl: override.airControl ?? spec.airControl ?? 0,
    hits: Math.max(1, override.hits ?? spec.hits ?? 1),
    hitInterval: Math.max(2, override.hitInterval ?? spec.hitInterval ?? 4),
    projectile: override.projectile ?? false,
    projectileCount: Math.max(1, override.projectileCount ?? 1),
    projectileSpeed: override.projectileSpeed ?? (10.5 + (context.speed || 5) * .58),
    projectileScale: override.projectileScale ?? context.projectileScale ?? 1,
    projectileArc: override.projectileArc ?? 0,
    projectileGravity: override.projectileGravity ?? 0,
    projectileLife: override.projectileLife ?? 82,
    homing: override.homing ?? 0,
    armorFrames: override.armorFrames ?? spec.armorFrames ?? 0,
    invulnFrames: override.invulnFrames ?? spec.invulnFrames ?? 0,
    guardDamage: override.guardDamage ?? spec.guardDamage ?? 1,
    unblockable: override.unblockable ?? spec.unblockable ?? spec.level === 'unblockable',
    knockdown: override.knockdown ?? spec.knockdown ?? false,
    launch: override.launch ?? spec.launch ?? 0,
    teleport: override.teleport ?? null,
    trap: Boolean(override.trap),
    aura: Boolean(override.aura),
    counterStance: Boolean(override.counterStance),
    trigger: override.trigger ?? spec.trigger ?? null,
    sideSwitch: override.sideSwitch ?? spec.sideSwitch ?? false,
    hardKnockdown: override.hardKnockdown ?? spec.hardKnockdown ?? false,
    groundBounce: override.groundBounce ?? spec.groundBounce ?? false,
    armorBreak: override.armorBreak ?? spec.armorBreak ?? false,
    meterGain: override.meterGain ?? 0,
    effect: null,
    cancelInto: [...(override.cancelInto || spec.cancelInto || [])],
    canonicalBasis: override.canonicalBasis || fighter.canonicalBehavior,
    fidelity: fidelityFor(slot, override),
    tags: [...new Set([kind, fighter.archetype, spec.category, ...(override.tags || [])])]
  };

  const wantsEffect = spec.effectMode || override.effectOverride;
  const effectId = override.effectOverride || context.effectId;
  if (wantsEffect && effectId) {
    move.effect = {
      id: effectId,
      duration: Math.round((context.effectDuration || 120) * (slot === 'super' || slot === 'desperation' ? 1.35 : 1)),
      potency: slot === 'desperation' ? 1.5 : slot === 'super' ? 1.35 : fighter.boss ? 1.15 : 1
    };
  }

  if (['throw','backThrow'].includes(slot) && grapplerArchetype(fighter)) {
    move.damage = Math.round(move.damage * 1.18 * (context.throwDamage || 1));
    move.effect ||= context.throwEffect ? { id: context.throwEffect, duration: context.throwEffectDuration || 90, potency: 1 } : null;
  }

  if (['neutralSpecial','downSpecial','airSpecial'].includes(slot) && rangedArchetype(fighter) && override.projectile == null) {
    move.projectile = true;
    move.active = 1;
    move.reach = Math.max(move.reach, slot === 'airSpecial' ? 560 : 720);
    move.projectileCount = slot === 'downSpecial' ? 2 : 1;
  }

  if (slot === 'super' && rangedArchetype(fighter) && override.projectile == null) {
    move.projectile = true;
    move.active = 1;
    move.reach = 980;
    move.projectileCount = fighter.boss ? 5 : 3;
    move.projectileScale *= 1.22;
    move.projectileSpeed = 14.5;
  }

  if (slot === 'desperation') {
    move.projectile = rangedArchetype(fighter) && override.projectile !== false;
    move.projectileCount = move.projectile ? Math.max(5, move.projectileCount) : move.projectileCount;
    move.projectileScale *= 1.35;
    move.armorFrames = Math.max(move.armorFrames, fighter.boss ? 28 : 16);
  }

  return move;
}

const MOVE_ROLE_LABELS = Object.freeze({
  neutralLight: 'contact', forwardLight: 'poursuite', crouchLight: 'attaque basse', airLight: 'attaque aérienne',
  neutralHeavy: 'brise-garde', forwardHeavy: 'charge', crouchHeavy: 'fauchage', airHeavy: 'retombée',
  throw: 'saisie', backThrow: 'projection arrière', dodgeAttack: 'riposte d’esquive', guardCounter: 'contre de garde', wakeupAttack: 'reprise',
  neutralSpecial: 'signature', forwardSpecial: 'assaut', backSpecial: 'repli',
  downSpecial: 'terrain', airSpecial: 'plongée', super: 'Nightmare', desperation: 'désespoir'
});

function disambiguateMoveNames(moves) {
  const groups = new Map();
  for (const key of MOVESET_KEYS) {
    const name = moves[key].name;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(key);
  }
  for (const [name, keys] of groups) {
    if (keys.length < 2) continue;
    for (const key of keys) moves[key].name = `${name} — ${MOVE_ROLE_LABELS[key] || key}`;
  }
}

function applyBehaviorEvidence(moves, fighter, overrides = {}) {
  const text = `${fighter.canonicalBehavior || ''} ${fighter.signature || ''}`.toLowerCase();
  const eligible = !String(fighter.catalogueStatus || '').includes('adapted');
  const markDirect = (key, tag) => {
    if (!eligible || overrides[key]?.fidelity) return;
    moves[key].fidelity = 'direct-canonical';
    moves[key].tags = [...new Set([...(moves[key].tags || []), `evidence:${tag}`])];
  };
  const rename = (key, suffix) => {
    if (overrides[key]?.name) return;
    moves[key].name = `${fighter.signature} — ${suffix}`;
  };

  if (eligible) markDirect('neutralSpecial', 'signature');

  if (/(crache|projett|tir|salve|éclair|foudre|feu|poison|cri|onde|fluide|nuage|souffle|dard|rafale)/.test(text)) {
    const move = moves.neutralSpecial;
    move.projectile = true;
    move.active = 1;
    move.reach = Math.max(move.reach, 680);
    move.projectileCount = /(salve|rafale|plusieurs|multiples)/.test(text) ? Math.max(move.projectileCount, 3) : Math.max(move.projectileCount, 1);
    move.projectileScale = Math.max(move.projectileScale, fighter.boss ? 1.24 : 1.05);
    markDirect('neutralSpecial', 'projectile');
  }
  if (/(charge|ruée|bond|plonge|piqué|fonce|poursuit|accélération|dash)/.test(text)) {
    const move = moves.forwardSpecial;
    move.travel = Math.max(Math.abs(move.travel || 0), fighter.boss ? 4.1 : 3.55);
    move.reach = Math.max(move.reach, 178);
    move.knockback = Math.max(move.knockback, 13);
    rename('forwardSpecial', 'assaut attesté');
    markDirect('forwardSpecial', 'rush');
  }
  if (/(agripp|saisi|attire|enferme|plaque|étreinte|verrou|morsure prolongée|dévor|contention|capture)/.test(text)) {
    const move = moves.throw;
    const backMove = moves.backThrow;
    move.reach = Math.max(move.reach, 72);
    move.damage = Math.round(move.damage * 1.08);
    backMove.reach = Math.max(backMove.reach, 72);
    backMove.damage = Math.round(backMove.damage * 1.06);
    rename('throw', 'saisie attestée');
    rename('backThrow', 'retournement de la saisie');
    markDirect('throw', 'grab');
    if (/(projette|projection|renverse|jette derrière)/.test(text)) markDirect('backThrow', 'grab-reversal');
  }
  if (/(vol|aérien|plonge|piqué|ailes|plafond|hauteur|suspendu)/.test(text)) {
    const move = moves.airSpecial;
    move.requiresAir = true;
    move.requiresGround = false;
    move.verticalTravel = Math.max(Math.abs(move.verticalTravel || 0), 2.8);
    rename('airSpecial', 'attaque aérienne');
    markDirect('airSpecial', 'aerial');
  }
  if (/(dispari|réappar|traverse|téléport|intangible|camoufle|hors écran|miroir|illusion|leurre)/.test(text)) {
    const move = moves.backSpecial;
    move.teleport ||= 'behind';
    move.invulnFrames = Math.max(move.invulnFrames, 7);
    moves.dodgeAttack.invulnFrames = Math.max(moves.dodgeAttack.invulnFrames, 6);
    moves.dodgeAttack.teleport ||= /(?:dispari|réappar|téléport|hors écran|miroir)/.test(text) ? 'cross' : null;
    rename('backSpecial', 'apparition attestée');
    rename('dodgeAttack', 'riposte d’apparition');
    markDirect('backSpecial', 'phase');
    markDirect('dodgeAttack', 'evasive-strike');
  }
  if (/(sol|souterrain|surgit|rampe|grille|conduit|paroi|mur|plancher|racine)/.test(text)) {
    const move = moves.downSpecial;
    move.level = 'low';
    move.trap ||= /(souterrain|sol|racine|grille|conduit)/.test(text);
    move.reach = Math.max(move.reach, move.trap ? 250 : 195);
    rename('downSpecial', 'attaque du terrain');
    markDirect('downSpecial', 'ground');
  }
  if (/(bloque|invulnérable|encaisse|carapace|résistant|parade|armure|immobile)/.test(text)) {
    const move = moves.backSpecial;
    move.armorFrames = Math.max(move.armorFrames, fighter.boss ? 22 : 12);
    move.counterStance ||= /(bloque|parade|immobile)/.test(text);
    moves.guardCounter.guardDamage = Math.max(moves.guardCounter.guardDamage, fighter.boss ? 1.65 : 1.5);
    moves.guardCounter.armorBreak = true;
    rename('backSpecial', 'garde attestée');
    rename('guardCounter', 'riposte de garde');
    markDirect('backSpecial', 'defense');
    if (/(bloque|parade|contre-attaque|riposte)/.test(text)) markDirect('guardCounter', 'guard-counter');
  }
  if (/(sol|allong|couch|gisant|immobile|cadavre|relève|redresse|réveille|joue mort|play dead)/.test(text)) {
    moves.wakeupAttack.invulnFrames = Math.max(moves.wakeupAttack.invulnFrames, 7);
    moves.wakeupAttack.knockdown = true;
    rename('wakeupAttack', 'reprise depuis le sol');
    if (/(relève|redresse|réveille|joue mort|play dead)/.test(text)) markDirect('wakeupAttack', 'ground-recovery');
  }
  if (/(groupe|meute|essaim|multiples|plusieurs|deux corps|double|deux têtes|invocations)/.test(text)) {
    const move = moves.neutralSpecial;
    move.hits = Math.max(move.hits, 2);
    move.hitInterval = Math.min(move.hitInterval, 4);
    if (move.projectile) move.projectileCount = Math.max(move.projectileCount, 2);
    markDirect('neutralSpecial', 'multi');
  }

  // Les adaptations explicites restent déclarées et ne sont jamais promues en action canonique.
  if (!eligible) {
    for (const move of Object.values(moves)) {
      if (move.fidelity === 'direct-canonical' && !overrides[move.key]?.fidelity) move.fidelity = 'behavior-composite';
    }
  }
}

export function buildLoreMoveset(fighter, context = {}) {
  const overrides = SPECIFIC_OVERRIDES[fighter.id] || {};
  const moves = {};
  for (const slot of MOVESET_KEYS) moves[slot] = makeMove(slot, fighter, context, overrides[slot] || {});

  // Le coup signature doit toujours porter le nom et l’identité du profil.
  if (!overrides.neutralSpecial?.name) moves.neutralSpecial.name = fighter.signature;
  moves.super.name = overrides.super?.name || `NIGHTMARE — ${fighter.signature}`;
  moves.desperation.name = overrides.desperation?.name || `OTHERWORLD — ${fighter.signature}`;

  applyBehaviorEvidence(moves, fighter, overrides);
  disambiguateMoveNames(moves);

  // Les annulations ne doivent jamais pointer vers une entrée inexistante.
  for (const move of Object.values(moves)) move.cancelInto = move.cancelInto.filter((key) => moves[key]);

  const direct = Object.values(moves).filter((move) => move.fidelity === 'direct-canonical').length;
  const composite = Object.values(moves).filter((move) => move.fidelity === 'behavior-composite').length;
  const adapted = Object.values(moves).filter((move) => move.fidelity === 'versus-adaptation').length;

  return {
    moves,
    order: MOVESET_KEYS,
    inputMap: MOVE_INPUTS,
    presentation: {
      intro: fighter.boss ? `L’arène se déforme autour de ${fighter.name}.` : `${fighter.name} émerge de la brume.`,
      taunt: fighter.canonicalBehavior,
      victory: fighter.fatalities?.[0]?.name || fighter.signature,
      defeat: fighter.boss ? 'La phase du cauchemar se brise.' : 'La manifestation se dissout dans le brouillard.'
    },
    fidelitySummary: { direct, composite, adapted, total: MOVESET_KEYS.length },
    canonicalBasis: fighter.canonicalBehavior,
    adaptationNote: fighter.adaptation
  };
}

export function moveInputLabel(moveOrKey) {
  const key = typeof moveOrKey === 'string' ? moveOrKey : moveOrKey?.key;
  return MOVE_INPUTS[key] || key || '—';
}
