/**
 * Authored versus staging, keyed to the research catalogue. Tick values, camera,
 * sound synthesis and compositing below are ORIGINAL adaptations, not footage
 * measurements. Moving a supplied PNG never counts as a new animated image.
 * Limbs, grips, weapons and poses still require independent contextual images.
 */
import { FIGHTER_REFERENCES, STAGE_REFERENCES } from './production-reference.js';
import { bodyProfile } from './combat-geometry.js';

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=t=>t*t*(3-2*t);
const neutral=()=>({x:0,y:0,alpha:1,pose:'hold'});
const frame=(pose,x=0,y=0,alpha=1)=>({pose,x,y,alpha});
const beat=(label,ticks,attacker,target,effect='fog',sound='breath',camera=.98)=>({label,ticks,attacker,target,effect,sound,camera});
const PHYSICAL=['humanoid','nurse','child','giant','pyramid','mannequin','doll','flowerhead','quadruped','insect','flyer','mass','spider','fox'];
const STANDING=['humanoid','nurse','child','pyramid','mannequin','doll','fox'];
const roleOf=actor=>actor?.profile?.referencePolicy?.role||actor?.profile?.moveset?.referencePolicy?.role||FIGHTER_REFERENCES[actor?.data?.id||actor?.id]?.combatRole;
const combatPolicy=actor=>actor?.profile?.referencePolicy||actor?.profile?.moveset?.referencePolicy||{};
const scriptedAllowed=actor=>combatPolicy(actor).combatEnabled===true&&combatPolicy(actor).adaptationMode==='versus-scripted';
const dataOf=actor=>actor?.data||actor||{};
const sourceOf=actor=>FIGHTER_REFERENCES[dataOf(actor).id];
const proposalKey=key=>({winRound:'winRound1',loseRound:'loseRound1'}[key]||key);
const proposalFor=(actor,key)=>sourceOf(actor)?.proposals?.[proposalKey(key)];
const approvedProposal=proposal=>proposal?.status==='adaptation-versus-proposee';

/* Each recipe is a deliberate action grammar. Variants share only actions
 * documented for their own IDs; the contextual artwork never crosses editions. */
const RECIPES={
  aerialPass:{targets:PHYSICAL,steps:[
    beat('MONTEE COURTE',42,frame('takeoff',-.22,-115),frame('track'), 'wind','wing',.96),
    beat('PIQUE TRANSVERSAL',30,frame('dive',.68,-22),frame('brace',.08), 'wind','rush',.93),
    beat('CONTACT DES PATTES',18,frame('strike',.86,-8),frame('fall',.22,20), 'impact','hit',.94),
    beat('REPRISE DU VOL',42,frame('climb',1.05,-125),frame('fallen',.26,34,.65), 'fog','wing',.96),
    beat('BRUME ET COUPE SONORE',44,frame('exit',1.3,-175,0),frame('held',.26,34,.35), 'fog','silence',1)
  ]},
  canineClamp:{targets:PHYSICAL.filter(k=>!['flyer','giant','mass','spider'].includes(k)),steps:[
    beat('APPUI BAS',32,frame('crouch',-.08),frame('brace'), 'fog','growl'),
    beat('BOND MORDANT',24,frame('pounce',.67,-24),frame('recoil',.08), 'wind','rush',.95),
    beat('PLAQUAGE',25,frame('bite',.82),frame('fall',.19,38), 'impact','hit',.94),
    beat('MAINTIEN BREF',31,frame('clamp',.81),frame('held',.19,38,.6), 'fog','growl',.96),
    beat('RETRAIT DANS LA BRUME',64,frame('withdraw',.56),frame('held',.19,38,.25), 'fog','silence',1)
  ]},
  splitJaw:{targets:STANDING,maxTargetHeight:310,steps:[
    beat('RECUL DU MUSEAU',42,frame('jaw-shut',-.12),frame('brace'), 'fog','growl',.96),
    beat('OUVERTURE DE LA GUEULE',40,frame('jaw-open',.15),frame('recoil',.08), 'vignette','creak',.92),
    beat('RUEE A PORTEE',24,frame('jaw-lunge',.7),frame('gripped',.09), 'impact','hit',.93),
    beat('FERMETURE HORS CHAMP',32,frame('jaw-close',.72),frame('occluded',.09,0,0), 'blackout','hit',.96),
    beat('MAINTIEN DU CORPS UNIQUE',42,frame('hold',.64),frame('held',.09,0,0), 'vignette','silence',1)
  ]},
  constrainedBreath:{targets:PHYSICAL,steps:[
    beat('CONTRACTION DU TORSE',36,frame('inhale',-.07),frame('brace'), 'vignette','breath',.97),
    beat('APPROCHE A COURTE PORTEE',28,frame('lean',.42),frame('recoil',.06), 'mist','breath',.95),
    beat('DERNIER SOUFFLE',32,frame('spray',.43),frame('stagger',.17,9), 'spray','hiss',.94),
    beat('CHUTE DERRIERE LE VOILE',32,frame('release',.38),frame('fall',.22,36,.35), 'mist','hit',.97),
    beat('RETOUR A LA CONTRAINTE',48,frame('hold',.25),frame('held',.22,36,.35), 'mist','silence',1)
  ]},
  proneRam:{targets:STANDING,maxTargetHeight:310,steps:[
    beat('CORPS MAINTENU AU SOL',37,frame('prone-crawl',.12),frame('watch'), 'dust','scrape',.98),
    beat('PERCUSSION RAMPANTE',29,frame('prone-ram',.7),frame('unbalanced',.1,12), 'impact','hit',.95),
    beat('CIBLE DESEQUILIBREE',27,frame('prone-brace',.65),frame('fall',.22,35), 'dust','cloth',.94),
    beat('OCCULTATION BASSE',34,frame('prone-withdraw',.46),frame('occluded',.22,35,.24), 'vignette','silence',.98),
    beat('RETRAIT TOUJOURS COUCHE',49,frame('prone-crawl',.31),frame('held',.22,35,.24), 'vignette','scrape',1)
  ]},
  mannequinStillness:{targets:PHYSICAL,steps:[
    beat('IMMOBILITE',48,frame('still'),frame('watch'), 'vignette','silence'),
    beat('RUPTURE DE POSTURE',18,frame('leg-raise',.26),frame('brace'), 'wind','rush',.96),
    beat('FRAPPE DES MEMBRES',17,frame('kick',.67),frame('recoil',.17,8), 'slash','hit',.94),
    beat('RETOUR A LA VITRINE',33,frame('still',.32),frame('fall',.29,37,.7), 'vignette','creak',.98),
    beat('CIBLE DANS L OMBRE',60,frame('still',.32),frame('held',.29,37,.35), 'blackout','silence',1)
  ]},
  ceilingAmbush:{targets:PHYSICAL,needsCeiling:true,steps:[
    beat('APPUI AU PLAFOND',38,frame('ceiling',.2,-135),frame('look-up'), 'vignette','creak',.94),
    beat('DETACHEMENT',28,frame('drop',.56,-62),frame('brace',.03), 'wind','rush',.93),
    beat('RECEPTION BASSE',21,frame('land',.76),frame('fall',.18,35), 'impact','hit',.95),
    beat('REPLI DES MEMBRES',36,frame('retract',.61),frame('held',.2,35,.6), 'vignette','creak',.98),
    beat('CONTRE PLONGEE OBSCURE',55,frame('hold',.61),frame('held',.2,35,.4), 'blackout','silence',1)
  ]},
  clinicalDoor:{targets:STANDING,propsAny:['doors','door','curtains','ward','corridor'],steps:[
    beat('APPROCHE RAIDIE',35,frame('approach',.34),frame('brace'), 'vignette','step'),
    beat('PRISE A PORTEE',28,frame('grip',.68),frame('gripped',.04), 'vignette','creak',.95),
    beat('GESTE COURT',22,frame('cut',.69),frame('recoil',.12,6), 'slash','hit',.94),
    beat('FERMETURE DU PREMIER PLAN',42,frame('release',.54),frame('fall',.2,32,.35), 'shutter','scrape',.98),
    beat('CONSULTATION CLOSE',49,frame('hold',.35),frame('held',.2,32,.35), 'shutter','silence',1)
  ]},
  pipeCurtain:{targets:STANDING,propsAny:['curtains'],steps:[
    beat('LEVEE DU TUYAU',42,frame('pipe-up',.15),frame('brace'), 'vignette','creak',.96),
    beat('COUP DESCENDANT',22,frame('pipe-down',.65),frame('recoil',.1,11), 'slash','metal',.94),
    beat('CIBLE COUCHEE',27,frame('hold',.61),frame('fall',.26,34,.6), 'impact','hit',.96),
    beat('RIDEAU FERME',39,frame('withdraw',.4),frame('occluded',.26,34,.2), 'shutter','cloth',.99),
    beat('ARRET TREMBLANT',46,frame('hold',.31),frame('held',.26,34,.2), 'vignette','silence',1)
  ]},
  heavySentence:{targets:PHYSICAL.filter(k=>k!=='flyer'),weapon:'great_knife',steps:[
    beat('POIDS DE LA LAME',43,frame('drag',.13),frame('brace'), 'sparks','scrape',.96),
    beat('ARMEMENT PESANT',42,frame('raise',.4),frame('recoil',.06), 'vignette','metal',.92),
    beat('ABATTEMENT',23,frame('sentence',.7),frame('fall',.22,38), 'slash','heavy',.93),
    beat('COUPE AVANT CONTACT DETAILLE',25,frame('low-blade',.7),frame('occluded',.25,38,.28), 'blackout','silence',.96),
    beat('LAME AU REPOS',49,frame('hold',.52),frame('held',.25,38,.28), 'sparks','scrape',1)
  ]},
  spearThreshold:{targets:STANDING,weapon:'spear',propsAny:['doors','door','elevator'],steps:[
    beat('LIGNE DE L ESTOC',44,frame('level-spear',.2),frame('brace'), 'vignette','metal',.96),
    beat('SEUIL',31,frame('approach',.42),frame('backstep',.1), 'shutter','creak',.94),
    beat('MENACE D ESTOC',21,frame('thrust',.7),frame('recoil',.18), 'slash','rush',.93),
    beat('PORTE EN PREMIER PLAN',39,frame('hold',.65),frame('occluded',.22,25,.15), 'shutter','metal',.98),
    beat('RETRAIT DE LA LANCE',43,frame('withdraw',.4),frame('held',.22,25,.15), 'vignette','silence',1)
  ]},
  twinWitness:{targets:PHYSICAL,steps:[
    beat('DOIGT POINTE',47,frame('point'),frame('watch'), 'vignette','breath',.98),
    beat('DEUX APPUIS SUR LES MAINS',28,frame('hand-run',.43),frame('brace'), 'dust','step',.95),
    beat('PLONGEE DU CORPS UNIQUE',23,frame('body-lunge',.8),frame('recoil',.2,19), 'impact','heavy',.93),
    beat('CIBLE ECLIPSEE',31,frame('occlude',.86),frame('fall',.3,38,.25), 'vignette','silence',.96),
    beat('ARRET SUR LES DEUX TETES',49,frame('two-heads',.69),frame('held',.3,38,.25), 'vignette','breath',1)
  ]},
  lowDrag:{targets:STANDING,steps:[
    beat('APPROCHE AU RAS DU SOL',41,frame('crawl',.31),frame('watch'), 'dust','scrape',.97),
    beat('PRISE BASSE',29,frame('ankle-grip',.72),frame('unbalanced',.03,13), 'vignette','creak',.94),
    beat('TRACTION COURTE',27,frame('drag',.57),frame('fall',-.13,39), 'dust','hit',.93),
    beat('ESPACE SOMBRE',36,frame('withdraw',.37,0,.65),frame('occluded',-.23,40,.2), 'blackout','scrape',.97),
    beat('RETRAIT',43,frame('hold',.27),frame('held',-.23,40,.2), 'vignette','silence',1)
  ]},
  lowRam:{targets:PHYSICAL.filter(k=>k!=='flyer'),steps:[
    beat('REPRISE D EQUILIBRE',34,frame('brace',-.09),frame('watch'), 'dust','breath',.98),
    beat('HEURT BAS',26,frame('ram',.65),frame('recoil',.17,13), 'impact','hit',.94),
    beat('SECOND APPUI',24,frame('recover',.41),frame('fall',.28,36), 'dust','step',.95),
    beat('OBSTACLE HORS CHAMP',38,frame('hold',.48),frame('occluded',.42,36,.25), 'vignette','heavy',.98),
    beat('MAUVAIS EQUILIBRE',54,frame('hold',.38),frame('held',.42,36,.25), 'fog','silence',1)
  ]},
  massCollision:{targets:PHYSICAL.filter(k=>k!=='flyer'),steps:[
    beat('MASSE EN MOUVEMENT',42,frame('rise',.08),frame('brace'), 'dust','breath',.98),
    beat('CHARGE COURTE',30,frame('rush',.58),frame('backstep',.09), 'dust','rush',.95),
    beat('COLLISION LOURDE',27,frame('press',.84),frame('recoil',.29,29), 'impact','heavy',.94),
    beat('CORPS EN PREMIER PLAN',37,frame('occlude',.9),frame('occluded',.35,40,.15), 'vignette','breath',.97),
    beat('RETOUR DU POIDS',42,frame('hold',.78),frame('held',.35,40,.15), 'dust','silence',1)
  ]},
  pairedCuts:{targets:PHYSICAL,steps:[
    beat('LAMES REPLIEES',34,frame('ready',.12),frame('brace'), 'vignette','metal',.98),
    beat('PREMIERE TRAJECTOIRE',23,frame('cut-left',.62),frame('recoil',.12), 'slash','hit',.95),
    beat('SECONDE TRAJECTOIRE',25,frame('cut-right',.68),frame('recoil',.2,10), 'slash','metal',.94),
    beat('REPLI DES BRAS',34,frame('retract',.51),frame('fall',.29,35,.6), 'vignette','creak',.98),
    beat('ARRET SUR LES LAMES',60,frame('hold',.48),frame('held',.29,35,.35), 'vignette','silence',1)
  ]},
  needleCross:{targets:PHYSICAL,steps:[
    beat('ECARTEMENT DES MEMBRES',37,frame('open',.09),frame('brace'), 'vignette','metal',.98),
    beat('CROISEMENT DES LAMES',27,frame('cross',.65),frame('recoil',.14,6), 'slash','hit',.94),
    beat('BOND VERTICAL',25,frame('leap',.7,-72),frame('fall',.25,29), 'wind','rush',.92),
    beat('RECEPTION CONTROLEE',34,frame('land',.47),frame('held',.25,38,.55), 'impact','metal',.97),
    beat('REPLI OBLIQUE',53,frame('withdraw',.29),frame('held',.25,38,.3), 'vignette','silence',1)
  ]},
  headBlade:{targets:STANDING,steps:[
    beat('TETE LAME EN RETRAIT',39,frame('head-ready',.08),frame('brace'), 'vignette','breath',.98),
    beat('SAISIE COURTE',31,frame('grip',.65),frame('gripped',.04), 'vignette','creak',.95),
    beat('RABATTEMENT',23,frame('head-down',.72),frame('recoil',.12,16), 'slash','heavy',.93),
    beat('CIBLE OCCULTEE',31,frame('hold',.68),frame('fall',.2,36,.25), 'blackout','silence',.97),
    beat('REPLI DU COU',52,frame('head-retract',.49),frame('held',.2,36,.25), 'vignette','creak',1)
  ]},
  doubleDown:{targets:PHYSICAL.filter(k=>k!=='flyer'),steps:[
    beat('APPUI DU CORPS ASSEMBLE',34,frame('brace',.15),frame('brace'), 'vignette','breath',.98),
    beat('PREMIERE FRAPPE',29,frame('down-left',.64),frame('recoil',.13,17), 'impact','heavy',.95),
    beat('SECONDE FRAPPE',31,frame('down-right',.72),frame('fall',.24,38), 'impact','heavy',.94),
    beat('RETRACTION DES BRAS',35,frame('retract',.55),frame('held',.24,38,.45), 'vignette','creak',.98),
    beat('CORPS UNIQUE MAINTENU',47,frame('hold',.48),frame('held',.24,38,.25), 'vignette','silence',1)
  ]},
  clinicalInjection:{targets:STANDING,steps:[
    beat('APPROCHE RAIDIE',36,frame('approach',.32),frame('brace'), 'vignette','step',.98),
    beat('IMMOBILISATION BREVE',32,frame('grip',.69),frame('gripped',.04), 'vignette','creak',.95),
    beat('GESTE D INJECTION',24,frame('inject',.7),frame('recoil',.07,8), 'impact','hiss',.94),
    beat('RELACHEMENT',31,frame('release',.51),frame('fall',.16,35,.65), 'mist','breath',.98),
    beat('RECUL RAIDE',53,frame('withdraw',.25),frame('held',.16,35,.35), 'vignette','silence',1)
  ]},
  butcherClamp:{targets:STANDING,weapon:'cleaver',steps:[
    beat('PAS PESANT',37,frame('approach',.28),frame('brace'), 'dust','step',.98),
    beat('IMMOBILISATION D UNE MAIN',37,frame('one-hand-grip',.68),frame('gripped',.04), 'vignette','creak',.95),
    beat('LEVEE DU COUPERET',32,frame('cleaver-up',.67),frame('held',.04), 'vignette','metal',.92),
    beat('ABATTEMENT OCCULTE',26,frame('cleaver-down',.7),frame('fall',.13,36,.25), 'blackout','heavy',.96),
    beat('RELACHEMENT DU BRAS',46,frame('release',.47),frame('held',.13,36,.25), 'vignette','silence',1)
  ]},
  enclosingArms:{targets:STANDING,steps:[
    beat('DEPLOIEMENT DES MEMBRES',39,frame('unfold',.13),frame('brace'), 'vignette','creak',.97),
    beat('BALAYAGE ENVELOPPANT',32,frame('sweep',.62),frame('recoil',.09), 'wind','rush',.94),
    beat('FERMETURE DES BRAS',28,frame('enclose',.73),frame('gripped',.1,12), 'impact','heavy',.93),
    beat('CADRE FERME',31,frame('hold',.7),frame('occluded',.1,29,.2), 'vignette','breath',.97),
    beat('REPLI SANS NOUVEAU CORPS',48,frame('retract',.48),frame('held',.1,36,.2), 'vignette','silence',1)
  ]},
  childThreshold:{targets:STANDING,weapon:'knife',maxTargetHeight:310,propsAny:['door','doors','corridor'],steps:[
    beat('LAME PRES DU CORPS',39,frame('knife-close',.08),frame('watch'), 'vignette','breath',.98),
    beat('PRISE A HAUTEUR DES JAMBES',28,frame('low-grip',.71),frame('unbalanced',.03,12), 'vignette','cloth',.95),
    beat('CHUTE DEVANT LE SEUIL',24,frame('brace-low',.68),frame('fall',.12,35), 'impact','hit',.94),
    beat('COULOIR OCCULTE',41,frame('knife-held',.48),frame('occluded',.12,35,.22), 'shutter','silence',.97),
    beat('PETITE SILHOUETTE IMMOBILE',48,frame('hold',.4),frame('held',.12,35,.22), 'vignette','breath',1)
  ]},
  clawThreshold:{targets:STANDING,maxTargetHeight:310,propsAny:['door','doors','corridor'],steps:[
    beat('GRIFFES BASSES',36,frame('claws-low',.12),frame('watch'), 'dust','scrape',.98),
    beat('CROCHETAGE DES APPUIS',30,frame('claw-hook',.69),frame('unbalanced',.01,18), 'impact','cloth',.95),
    beat('TRACTION VERS LE SEUIL',33,frame('pull-low',.48),frame('fall',-.19,37), 'dust','scrape',.94),
    beat('REPLI DANS L ANGLE',31,frame('retract-claws',.33),frame('occluded',-.25,37,.2), 'blackout','silence',.98),
    beat('GRIFFES AU REPOS',47,frame('hold-low',.28),frame('held',-.25,37,.2), 'vignette','breath',1)
  ]},
  fourPointPin:{targets:STANDING,maxTargetHeight:310,steps:[
    beat('QUATRE APPUIS',33,frame('four-supports',-.1),frame('brace'), 'dust','breath',.98),
    beat('BOND DE PLAQUAGE',29,frame('pounce',.72,-31),frame('recoil',.08,10), 'wind','rush',.95),
    beat('APPUI AU DESSUS DE LA CIBLE',27,frame('pin-low',.83),frame('fall',.16,36), 'impact','heavy',.94),
    beat('OMBRE DU TORSE',38,frame('pin-hold',.8),frame('occluded',.16,36,.24), 'vignette','breath',.97),
    beat('MAINTIEN SUR LES MAINS',48,frame('four-supports',.67),frame('held',.16,36,.24), 'vignette','silence',1)
  ]},
  closingArmFrame:{targets:STANDING,maxTargetHeight:310,propsAny:['door','doors','corridor','hallway'],steps:[
    beat('BRAS DEVANT LE PASSAGE',43,frame('arms-forward',.14),frame('brace'), 'vignette','creak',.97),
    beat('POUSSEE DU BRAS',30,frame('arm-press',.64),frame('backstep',.15,5), 'impact','heavy',.94),
    beat('SILHOUETTE CONTRE L ENCADREMENT',29,frame('arm-hold',.74),frame('gripped',.24,13), 'vignette','creak',.93),
    beat('PASSAGE MASQUE',36,frame('occlude',.79),frame('occluded',.24,32,.17), 'shutter','silence',.97),
    beat('RETRAIT DES BRAS EXISTANTS',45,frame('arms-retract',.51),frame('held',.24,32,.17), 'vignette','breath',1)
  ]},
  revolverDoor:{targets:STANDING,weapon:'revolver',propsAny:['door','doors','corridor','ward'],steps:[
    beat('REVOLVER PRES DU TORSE',40,frame('revolver-held',.1),frame('watch'), 'vignette','metal',.98),
    beat('MENACE A COURTE PORTEE',32,frame('revolver-level',.49),frame('brace',.03), 'vignette','breath',.95),
    beat('CADRE DEVANT LE CONTACT',28,frame('approach',.66),frame('occluded',.08,6,.35), 'shutter','cloth',.94),
    beat('COUP DE CROSSE HORS CHAMP',24,frame('revolver-butt',.7),frame('fall',.14,35,.2), 'blackout','hit',.96),
    beat('ARME ABAISSEE SANS TIR AJOUTE',49,frame('revolver-lowered',.4),frame('held',.14,35,.2), 'vignette','silence',1)
  ]},
  patientBedside:{targets:STANDING,weapon:'club',propsAny:['beds','gurneys'],steps:[
    beat('CLUB DANS LE PASSAGE',39,frame('club-drag',.16),frame('brace'), 'vignette','scrape',.98),
    beat('APPROCHE DU LIT',32,frame('club-ready',.51),frame('backstep',.09), 'vignette','step',.95),
    beat('COUP DERRIERE LE MOBILIER',26,frame('club-down',.72),frame('fall',.2,33,.4), 'shutter','heavy',.94),
    beat('BRAS AU REPOS',33,frame('club-low',.53),frame('occluded',.2,35,.18), 'vignette','breath',.98),
    beat('SILENCE HOSPITALIER',48,frame('hold',.46),frame('held',.2,35,.18), 'vignette','silence',1)
  ]},
  screamBackGrip:{targets:STANDING,maxTargetHeight:310,steps:[
    beat('APPROCHE A DECOUVERT',37,frame('approach',.29),frame('watch'), 'vignette','step',.98),
    beat('CRI COURT SANS PROJECTILE',24,frame('scream',.45),frame('brace',.04), 'vignette','hiss',.95),
    beat('DEPLACEMENT VERS LE DOS',35,frame('pass-side',1.08),frame('turn',.05), 'wind','rush',.94),
    beat('SAISIE DORSALE',28,frame('back-grip',1.03),frame('fall',.08,34,.4), 'impact','hit',.95),
    beat('RETRAIT DU CORPS UNIQUE',51,frame('withdraw',.69),frame('held',.08,34,.24), 'vignette','breath',1)
  ]},
  barredHeavyThrow:{targets:STANDING,maxTargetHeight:310,propsAny:['bars','cells'],steps:[
    beat('PRESENCE DEVANT LA GRILLE',42,frame('heavy-stance',.11),frame('brace'), 'vignette','breath',.98),
    beat('SAISIE RAPPROCHEE',32,frame('two-hand-grip',.69),frame('gripped',.05,5), 'vignette','creak',.95),
    beat('PROJECTION LOURDE',28,frame('throw',.73),frame('thrown',.38,24), 'impact','heavy',.93),
    beat('GRILLE DEVANT LA CHUTE',32,frame('release',.57),frame('occluded',.43,38,.2), 'rail-shadow','metal',.97),
    beat('POIDS DE NOUVEAU STABLE',46,frame('heavy-stance',.47),frame('held',.43,38,.2), 'vignette','silence',1)
  ]},
  hammerSentence:{targets:STANDING,weapon:'hammer',maxTargetHeight:310,steps:[
    beat('MARTEAU PRES DU SOL',43,frame('hammer-low',.12),frame('brace'), 'vignette','scrape',.98),
    beat('IMMOBILISATION RAPPROCHEE',33,frame('one-hand-hold',.67),frame('gripped',.04), 'vignette','creak',.95),
    beat('ARMEMENT UNIQUE DU MARTEAU',35,frame('hammer-up',.68),frame('held',.04), 'vignette','metal',.92),
    beat('ABATTEMENT UNIQUE OCCULTE',25,frame('hammer-down',.72),frame('fall',.15,36,.22), 'blackout','heavy',.96),
    beat('MARTEAU CONSERVE',47,frame('hammer-low',.45),frame('held',.15,36,.22), 'vignette','silence',1)
  ]},
  filmGrip:{targets:STANDING,weapon:'great_knife',steps:[
    beat('CASQUE DANS LE HALO',45,frame('film-helmet',.1),frame('brace'), 'vignette','scrape',.97),
    beat('SAISIE DU FILM',39,frame('film-grip',.69),frame('gripped',.04,-8), 'vignette','creak',.94),
    beat('GESTE TERMINAL PESANT',27,frame('film-terminal',.73),frame('recoil',.16,17), 'slash','heavy',.93),
    beat('COUPE DU CADRAGE',30,frame('film-release',.69),frame('occluded',.24,38,.2), 'blackout','silence',.97),
    beat('CASQUE ET LAME CONSERVES',47,frame('film-hold',.46),frame('held',.24,38,.2), 'vignette','scrape',1)
  ]}
};

const FIGHTER_RECIPES=Object.freeze({
  sh1_air_screamer_001:'aerialPass',sh1_night_flutter_002:'aerialPass',
  sh1_groaner_003:'canineClamp',sh1_wormhead_004:'canineClamp',sh3_double_head_040:'canineClamp',
  sh4_sniffer_dog_male_053:'canineClamp',sh4_sniffer_dog_female_054:'canineClamp',homecoming_feral_086:'canineClamp',
  sh1_split_head_014:'splitJaw',sh1_puppet_nurse_012:'clinicalDoor',sh1_puppet_doctor_013:'clinicalDoor',
  sh2_lying_figure_020:'constrainedBreath',sh2_lying_figure_crawling_021:'proneRam',
  sh2_mannequin_022:'mannequinStillness',sh2_mannequin_ambusher_023:'mannequinStillness',
  sh2_spider_mannequin:'ceilingAmbush',homecoming_scarlet_spider_form_095:'ceilingAmbush',
  sh2_bubble_head_nurse_024:'pipeCurtain',sh3_nurse_pipe_043:'clinicalDoor',
  sh2_red_pyramid_thing_great_knife_029:'heavySentence',sh2_red_pyramid_thing_spear_030:'spearThreshold',
  sh4_twin_victim_059:'twinWitness',sh3_slurper_042:'lowDrag',film_colin_the_janitor_174:'lowDrag',
  sh3_numb_body_small_037:'lowRam',sh3_numb_body_medium:'lowRam',sh3_numb_body_large_038:'lowRam',origins_carrion_076:'lowRam',
  sh3_insane_cancer_041:'massCollision',origins_caliban_079:'massCollision',
  sh3_missionary_047:'pairedCuts',sh3_scraper_045:'pairedCuts',homecoming_nurse:'pairedCuts',film_missionary_revelation_177:'pairedCuts',
  homecoming_needler_088:'needleCross',homecoming_schism_089:'headBlade',homecoming_siam_090:'doubleDown',
  homecoming_scarlet_doll_form_094:'doubleDown',origins_faceless_nurse:'clinicalInjection',origins_the_butcher_081:'butcherClamp',
  homecoming_asphyxia_096:'enclosingArms',film_mannequin_monster_176:'enclosingArms',
  film_red_pyramid_film_175:'filmGrip',
  sh1_grey_child_005:'childThreshold',sh1_mumbler_006:'clawThreshold',sh1_romper_010:'fourPointPin',
  sh3_closer_036:'closingArmFrame',sh3_nurse_revolver_044:'revolverDoor',sh4_patient_060:'patientBedside',
  downpour_screamer_104:'screamBackGrip',downpour_prisoner_juggernaut_110:'barredHeavyThrow',downpour_bogeyman_115:'hammerSentence'
});

/* Presentation intent belongs to the exact subject. These world-space edits
 * stage its workbook proposal; they do not draw the absent limb/weapon poses. */
const PRESENTATION_STAGING=Object.freeze({
  sh1_grey_child_005:{id:'grey-child-knife-threshold',entry:18,retreat:48,recoil:6,poses:['knife-close-entry','knife-head-inclination','knife-side-held','seated-support-recovery','knife-return-to-threshold','knife-visible-final-hold','watchful-threshold-retreat']},
  sh1_mumbler_006:{id:'mumbler-low-claws',entry:26,retreat:43,recoil:9,poses:['low-claw-entry','claws-ground-threat','claws-supported-hold','low-body-regains-support','claws-turn-to-shadow','claws-relaxed-final-hold','low-shadow-retreat']},
  sh1_romper_010:{id:'romper-four-supports',entry:57,retreat:61,recoil:11,landing:34,poses:['four-support-landing','torso-threat-on-four-supports','four-support-watch','shoulder-recovery-to-four-supports','four-support-final-watch','side-support-final-hold','four-support-departure']},
  sh3_closer_036:{id:'closer-arms-in-passage',entry:17,retreat:24,recoil:8,poses:['closer-arms-entry','closer-arm-extension-threat','closer-arms-held','closer-arms-regain-support','closer-passage-held','closer-arms-final-hold','closer-arms-withdraw']},
  sh3_nurse_revolver_044:{id:'sh3-revolver-held',entry:12,retreat:30,recoil:8,poses:['revolver-close-entry','revolver-mute-threat','revolver-held-at-side','revolver-visible-recovery','revolver-lowered-final-watch','revolver-visible-final-hold','revolver-retained-exit']},
  sh4_patient_060:{id:'sh4-patient-club-weight',entry:20,retreat:29,recoil:10,poses:['patient-club-weighted-entry','patient-club-mute-threat','patient-club-stable-hold','patient-club-support-recovery','patient-club-final-watch','patient-club-final-hold','patient-club-weighted-retreat']},
  downpour_screamer_104:{id:'downpour-screamer-presence',entry:29,retreat:40,recoil:9,poses:['screamer-close-entry','screamer-mute-threat-without-wave','screamer-watch','screamer-regains-support','screamer-final-watch','screamer-final-hold','screamer-recedes']},
  downpour_prisoner_juggernaut_110:{id:'downpour-juggernaut-weight',entry:11,retreat:20,recoil:6,poses:['juggernaut-presence-awaiting-bar-pose','juggernaut-fist-threat','juggernaut-weight-stable','juggernaut-weight-recovery','juggernaut-final-watch','juggernaut-weight-final-hold','juggernaut-weight-retreat']},
  downpour_bogeyman_115:{id:'downpour-hammer-weight',entry:15,retreat:26,recoil:7,poses:['hammer-raised-entry','hammer-mute-threat','hammer-weight-stable','hammer-retained-recovery','hammer-lowered-final-watch','hammer-retained-final-hold','hammer-weighted-exit']}
});
const PRESENTATION_POSE_INDEX=Object.freeze({intro:0,taunt:1,winRound:2,loseRound:3,winMatch:4,loseMatch:5,outro:6});

function compileRecipe(recipe,type) {
  const steps=recipe.steps.map(step=>({...step,attacker:{...step.attacker},target:{...step.target}}));
  if(type==='nightmare') {
    // A different edit of the SAME bodily capacity: anticipation, a silent
    // suspended cut, then the existing terminal action. No summoned anatomy.
    steps[0].ticks+=18;steps[0].camera=.92;steps[0].sound='lowDrone';
    const contact=Math.min(2,steps.length-1);
    steps.splice(contact,0,beat('SUSPENSION DU SON',19,{...steps[contact-1].attacker},{...steps[contact-1].target},'vignette','silence',.91));
    steps[contact+1].ticks=Math.max(12,steps[contact+1].ticks-5);
    steps[contact+1].sound='nightmareImpact';steps[contact+1].camera=.9;
    steps.at(-1).ticks+=17;steps.at(-1).effect='blackout';
  }
  let from=0;
  return steps.map(step=>{const out={...step,from,to:from+step.ticks};from=out.to;return out;});
}

const blocked=(reason,id=null)=>({allowed:false,reason,id,artStatus:'contextual-images-missing',fidelity:'original-versus-staging'});
const motifs=stage=>new Set([...(stage?.props||[]),...(stage?.layers||[])]);

/** Resolve only an authored exact ID. An unimplemented dossier is a normal KO,
 * never the same generic finisher under a different name. */
export function loreFinisher({attacker,target,stage,definition,stageBased=false,width=1280}={}) {
  if(!attacker||!target||!definition?.id)return blocked('Séquence sans acteurs ou identifiant exact.');
  if(attacker===target||attacker.index===target.index)return blocked('La cible doit être un autre acteur.',definition.id);
  const a=dataOf(attacker),t=dataOf(target),ref=sourceOf(attacker),targetRef=sourceOf(target);
  if(combatPolicy(attacker).combatEnabled===false||['noncombatant','environmental-obstacle','unverified'].includes(roleOf(attacker))||(roleOf(attacker)==='scripted-encounter'&&!scriptedAllowed(attacker)))return blocked('Rôle offensif non autorisé par la fiche.',definition.id);
  if(['noncombatant','environmental-obstacle','unverified','stationary-boss'].includes(roleOf(target))||(roleOf(target)==='scripted-encounter'&&!scriptedAllowed(target)))return blocked('Cette cible exige une conclusion scénarisée propre.',definition.id);
  if(!ref||!targetRef)return blocked('Identité de l’un des acteurs non reliée aux recherches.',definition.id);
  if(ref.source!==a.source||targetRef.source!==t.source)return blocked('L’œuvre ne correspond pas à l’identité de la fiche.',definition.id);
  if(stageBased)return stageFinisher({attacker,target,stage,definition,width});
  if(!a.fatalities?.some(entry=>entry.id===definition.id&&entry.type===definition.type))return blocked('Identifiant de finisher étranger au sujet.',definition.id);
  if(!['signature','nightmare'].includes(definition.type)||definition.id!==`${a.id}_${definition.type}`)return blocked('Contexte de finisher invalide.',definition.id);
  if(!approvedProposal(ref.proposals?.finisher))return blocked('Clôture bloquée par les références.',definition.id);
  const recipeId=FIGHTER_RECIPES[a.id],recipe=RECIPES[recipeId];
  if(!recipe)return blocked('Timeline propre à cette fiche encore à produire.',definition.id);
  const body=bodyProfile(t);
  if(!recipe.targets.includes(body.kind))return blocked('Anatomie de la cible incompatible avec cette prise ou trajectoire.',definition.id);
  if(recipe.maxTargetHeight&&body.height*body.scale>recipe.maxTargetHeight)return blocked('La cible dépasse la portée corporelle de cette séquence.',definition.id);
  if(recipe.weapon&&a.visual?.weapon!==recipe.weapon)return blocked('Arme exacte absente de cette variante.',definition.id);
  if((recipe.propsAny||recipe.needsCeiling)&&(!STAGE_REFERENCES[stage?.id]||STAGE_REFERENCES[stage.id].source!==stage.source||stage?.reference?.blocked))return blocked('Lieu non confirmé pour cet appui ou cet accessoire.',definition.id);
  const set=motifs(stage);
  if(recipe.propsAny&&!recipe.propsAny.some(prop=>set.has(prop)))return blocked('Premier plan requis absent du lieu.',definition.id);
  if(recipe.needsCeiling&&![...set].some(p=>/ceiling|tunnel|corridor|ward|room|nave/.test(p)))return blocked('Appui de plafond absent du lieu.',definition.id);
  const steps=compileRecipe(recipe,definition.type);
  return {allowed:true,id:definition.id,ownerId:a.id,source:a.source,type:definition.type,recipeId,steps,duration:steps.at(-1).to,
    description:ref.proposals.finisher.description,referenceIds:[...(ref.referenceIds||[])],
    artStatus:'contextual-images-missing',fidelity:'original-versus-staging',irreversible:true,stageBased:false,
    visualNotice:'MISE EN SCENE LORE · IMAGES DE POSES A PRODUIRE'};
}

/* Filled with exact, reviewed locations. Props alone never promote an invented
 * stage identity into an allowed finish. */
const STAGE_RECIPES={
  hazel_subway:{id:'hazel-platform-train',targets:STANDING,props:['rails','platform'],event:'trainRumble',hazard:'trainRush',zone:'edge',
    description:'Clôture versus originale : recul au bord du quai, annonce de rame, passage masquant la cible puis plan du quai vide. Le danger ferroviaire appartient à ce lieu ; les acteurs et timings sont adaptés.',steps:[
      beat('BORD DU QUAI',35,frame('hold',.18),frame('recoil',.03), 'vignette','step',.98),
      beat('ANNONCE DE LA RAME',47,frame('withdraw',.08),frame('brace',.04), 'rail-light','lowDrone',.94),
      beat('PASSAGE DEVANT LA CIBLE',33,frame('hold',.08),frame('occluded',.06,22,.1), 'train','heavy',.92),
      beat('DERNIER ESSIEU',35,frame('hold',.08),frame('held',.06,35,.1), 'train','metal',.96),
      beat('QUAI IMMOBILE',47,frame('hold',.08),frame('held',.06,35,.1), 'vignette','silence',1)
    ]},
  midwich_nightmare:{id:'nightmare-boiler-grate',targets:STANDING,props:['grates'],hazard:'emberFall',zone:'center',
    description:'Clôture versus originale dans le foyer sous la grille de la chaufferie : déséquilibre, lumière du foyer existant puis occultation. Aucun casier animé ni nouveau monstre.',steps:[
      beat('APPUI SUR LA GRILLE',36,frame('press',.31),frame('unbalanced'), 'sparks','metal',.98),
      beat('FOYER SOUS LE SOL',39,frame('withdraw',.22),frame('recoil',.05,10), 'embers','lowDrone',.94),
      beat('LUMIERE SOUS LA GRILLE',31,frame('hold',.2),frame('fall',.08,31,.5), 'embers','heavy',.93),
      beat('OCCULTATION DU CORPS',34,frame('hold',.2),frame('occluded',.08,35,.15), 'blackout','silence',.97),
      beat('LE FOYER RESTE EN PLACE',43,frame('hold',.2),frame('held',.08,35,.15), 'embers','breath',1)
    ]},
  blue_creek:{id:'blue-creek-stair-rail',targets:STANDING,props:['stairs','bars','water'],zone:'edge',
    description:'Clôture versus originale : la cible recule derrière la rampe des marches noyées ; chute et coupe à hauteur de l’eau, dont le niveau reste fixe. Aucun mécanisme de porte ni montée d’eau.',steps:[
      beat('DERNIERE MARCHE',34,frame('press',.35),frame('backstep',.02), 'vignette','step'),
      beat('APPUI PERDU',28,frame('stop',.35),frame('fall',.04,20), 'impact','hit',.95),
      beat('RAMPE EN PREMIER PLAN',40,frame('hold',.3),frame('occluded',.04,36,.35), 'rail-shadow','metal',.94),
      beat('NIVEAU D EAU FIXE',35,frame('hold',.3),frame('held',.04,36,.2), 'water','cloth',.98),
      beat('ESCALIER IMMOBILE',43,frame('hold',.3),frame('held',.04,36,.2), 'water','silence',1)
    ]},
  hotel_otherworld:{id:'lakeview-wet-floor',targets:PHYSICAL.filter(k=>k!=='flyer'),props:['stairs'],zone:'edge',
    description:'Clôture versus originale après l’incendie : appui qui glisse sur le carrelage mouillé, impact hors champ et reflet tenu. Aucun feu nouveau et aucun miroir qui attaque.',steps:[
      beat('CARRELAGE MOUILLE',38,frame('press',.26),frame('backstep',.03), 'water','step'),
      beat('PERTE D APPUI',31,frame('stop',.26),frame('slip',.08,17), 'water','rush',.95),
      beat('IMPACT HORS CHAMP',27,frame('hold',.24),frame('fall',.12,36,.5), 'vignette','heavy',.94),
      beat('REFLET SOUS LE PLAFOND BRULE',38,frame('hold',.24),frame('held',.12,36,.3), 'water','silence',.98),
      beat('SOUVENIR ETEINT',46,frame('hold',.24),frame('held',.12,36,.3), 'water','breath',1)
    ]},
  room_302:{id:'room302-closed-door',targets:STANDING,props:['chains','door'],zone:'edge',
    description:'Clôture versus originale contre la porte déjà fermée : choc, vibration des chaînes toujours fixées, puis cible hors champ. La porte ne s’ouvre pas et aucune hantise tardive n’est invoquée.',steps:[
      beat('PORTE DEJA FERMEE',38,frame('press',.36),frame('backstep',.03), 'vignette','step'),
      beat('IMPACT CONTRE LE SEUIL',26,frame('stop',.36),frame('recoil',.07,5), 'impact','heavy',.95),
      beat('CHAINES TOUJOURS FIXEES',38,frame('hold',.28),frame('fall',.07,31,.4), 'fixed-chain','metal',.94),
      beat('COUPE SOUS LA POIGNEE',34,frame('hold',.28),frame('held',.07,36,.2), 'blackout','silence',.98),
      beat('PORTE INCHANGEABLE',44,frame('hold',.28),frame('held',.07,36,.2), 'fixed-chain','creak',1)
    ]},
  sewers:{id:'sewers-grate-cutaway',targets:STANDING,props:['canal','grates'],zone:'edge',
    description:'Clôture versus originale : recul au bord du canal et chute masquée par la grille. Aucun sèche-cheveux créé, aucune décharge électrique et aucune noyade ajoutée.',steps:[
      beat('BORD DU CANAL',39,frame('press',.34),frame('backstep',.02), 'water','step'),
      beat('APPUI HUMIDE',29,frame('stop',.34),frame('unbalanced',.04,14), 'water','metal',.95),
      beat('GRILLE AU PREMIER PLAN',36,frame('hold',.3),frame('occluded',.05,31,.4), 'rail-shadow','hit',.94),
      beat('COUPE SUR LE CANAL',34,frame('hold',.3),frame('held',.05,35,.25), 'water','cloth',.98),
      beat('REFLETS DU CANAL',42,frame('hold',.3),frame('held',.05,35,.25), 'water','silence',1)
    ]},
  brookhaven_sh3:{id:'leonard-pool-cutaway',targets:STANDING,props:['water','pipes'],zone:'edge',
    description:'Clôture versus originale au bord du bassin de cette phase : déséquilibre, cible masquée par le bord et reflet final. Eau fixe, sans apparition de Leonard ou de tentacule.',steps:[
      beat('BORD DU BASSIN',41,frame('press',.3),frame('backstep',.02), 'water','step'),
      beat('DESEQUILIBRE',27,frame('stop',.3),frame('unbalanced',.04,13), 'vignette','hit',.95),
      beat('CORPS MASQUE PAR LE BORD',36,frame('hold',.26),frame('occluded',.04,32,.35), 'vignette','cloth',.94),
      beat('REFLET SANS MONTEE D EAU',35,frame('hold',.26),frame('held',.04,35,.2), 'water','silence',.98),
      beat('BASSIN IMMOBILE',42,frame('hold',.26),frame('held',.04,35,.2), 'water','breath',1)
    ]}
};
function stageFinisher({attacker,target,stage,definition,width}) {
  const ref=STAGE_REFERENCES[stage?.id],recipe=STAGE_RECIPES[stage?.id];
  if(!ref||stage?.reference?.blocked||stage?.referencePolicy?.automaticFinishers===false)return blocked('Lieu ou phase non autorisé pour une fatalité de décor.',definition.id);
  if(ref.source!==stage.source)return blocked('Le lieu ne correspond pas à cette œuvre.',definition.id);
  if(!recipe||definition.id!==stage.fatality?.id||definition.id!==`${stage.id}_fatality`)return blocked('Timeline exacte de ce lieu encore à produire.',definition.id);
  if(!recipe.targets.includes(bodyProfile(dataOf(target)).kind)||target.grounded===false)return blocked('Corps ou appui incompatible avec le mécanisme du lieu.',definition.id);
  const inZone=recipe.zone==='center'?target.x>=width*.35&&target.x<=width*.65:target.x<=190||target.x>=width-190;
  if(!inZone)return blocked('La cible ne se trouve pas dans la zone de décor requise.',definition.id);
  const props=motifs(stage);
  if(!recipe.props.every(prop=>props.has(prop)))return blocked('Accessoire nécessaire absent de ce lieu.',definition.id);
  if(recipe.event&&!stage.referencePolicy?.allowedEvents?.includes(recipe.event))return blocked('Mécanisme non validé pour ce lieu.',definition.id);
  if(recipe.hazard&&!stage.referencePolicy?.allowedHazards?.includes(recipe.hazard))return blocked('Danger matériel non autorisé dans cette phase du lieu.',definition.id);
  const steps=compileRecipe(recipe,'stage');
  return {allowed:true,id:definition.id,ownerId:stage.id,source:stage.source,type:'stage',recipeId:recipe.id,steps,duration:steps.at(-1).to,
    description:recipe.description,referenceIds:[...(ref.referenceIds||[])],stageBased:true,irreversible:true,
    artStatus:'contextual-images-missing',fidelity:'original-versus-staging',visualNotice:'MISE EN SCENE DU LIEU · IMAGES DE POSES A PRODUIRE'};
}

/** Read-only production/UI view; authored does not mean the current pairing is
 * eligible. The live gate still checks exact identity, role, body, props and zone. */
export function cinematicSummary(definitionId) {
  const match=String(definitionId).match(/^([a-z0-9_]+)_(signature|nightmare|fatality)$/);
  if(!match)return {id:definitionId,authored:false,reason:'Identifiant de cinématique inconnu.',beats:[]};
  const [,ownerId,suffix]=match,stageBased=suffix==='fatality',ref=(stageBased?STAGE_REFERENCES:FIGHTER_REFERENCES)[ownerId];
  const recipeId=stageBased?STAGE_RECIPES[ownerId]?.id:FIGHTER_RECIPES[ownerId];
  const recipe=stageBased?STAGE_RECIPES[ownerId]:RECIPES[recipeId];
  const proposed=stageBased?Boolean(ref):approvedProposal(ref?.proposals?.finisher);
  if(!recipe||!proposed)return {id:definitionId,ownerId,authored:false,reason:proposed?'Timeline propre encore à produire.':'Références insuffisantes ou proposition bloquée.',
    description:ref?.proposals?.finisher?.description||'',referenceIds:[...(ref?.referenceIds||[])],beats:[],fidelity:'original-versus-staging',artStatus:'contextual-images-missing'};
  const steps=compileRecipe(recipe,stageBased?'stage':suffix);
  return {id:definitionId,ownerId,source:ref.source,type:stageBased?'stage':suffix,authored:true,recipeId,duration:steps.at(-1).to,
    description:stageBased?recipe.description:ref.proposals.finisher.description,referenceIds:[...(ref.referenceIds||[])],
    adaptationStatus:'adaptation-versus-scripted',fidelity:'original-versus-staging',artStatus:'contextual-images-missing',
    requirements:{targets:[...recipe.targets],props:[...(recipe.props||[])],propsAny:[...(recipe.propsAny||[])],weapon:recipe.weapon||null,
      needsCeiling:!!recipe.needsCeiling,zone:recipe.zone||'combat-space',decisiveMatchOnly:true},
    beats:steps.map(s=>({label:s.label,from:s.from,to:s.to,attackerPose:s.attacker.pose,targetPose:s.target.pose,effect:s.effect,sound:s.sound,
      attacker:{...s.attacker},target:{...s.target},camera:s.camera}))};
}

export function lorePresentation(actor,key) {
  const data=dataOf(actor),ref=sourceOf(actor),proposal=proposalFor(actor,key);
  const contextId=`${data.id}:${proposalKey(key)}`;
  const recipe=RECIPES[FIGHTER_RECIPES[data.id]],staging=PRESENTATION_STAGING[data.id];
  return {ownerId:data.id,source:ref?.source,contextId,clipKey:`${key}@${contextId}`,name:proposal?.name||data.name||'',description:proposal?.description||'',referenceIds:[...(ref?.referenceIds||[])],
    adaptationStatus:proposal?.status||'bloque-reference',bodyKind:bodyProfile(data).kind,
    authored:ref?.source===data.source&&Object.hasOwn(PRESENTATION_POSE_INDEX,key)&&approvedProposal(proposal)&&Boolean(recipe)&&(!recipe.weapon||data.visual?.weapon===recipe.weapon),
    stagingId:staging?.id||null,poseIntent:staging?.poses[PRESENTATION_POSE_INDEX[key]]||null,
    reversible:['winRound','loseRound','taunt'].includes(key),artStatus:'contextual-images-missing',timingProvenance:'original-versus-ticks'};
}

/** Pure sampling. x offsets use the initial actor distance, y values are world
 * staging offsets. These are NOT rotations/deformations of a canonical pose. */
export function sampleLoreCinematic(plan,tick,{distance=180,direction=1}={}) {
  if(!plan?.allowed||!plan.steps?.length)return null;
  const elapsed=clamp(Math.floor(tick)||0,0,plan.duration-1);
  const index=Math.max(0,plan.steps.findIndex(step=>elapsed<step.to));
  const step=plan.steps[index],previous=index?plan.steps[index-1]:null;
  const progress=ease(clamp((elapsed-step.from)/Math.max(1,step.ticks-1)));
  const interpolate=(role)=>{
    const from=previous?.[role]||neutral(),to=step[role];
    return {x:(from.x+(to.x-from.x)*progress)*distance*direction,y:from.y+(to.y-from.y)*progress,
      alpha:from.alpha+(to.alpha-from.alpha)*progress,pose:to.pose};
  };
  return {id:plan.id,frame:elapsed,step:index,label:step.label,stepProgress:progress,
    attacker:interpolate('attacker'),target:interpolate('target'),
    camera:{scale:(previous?.camera||1)+(step.camera-(previous?.camera||1))*progress},
    effect:step.effect,effectPower:Math.sin(progress*Math.PI)*.65+.35,
    sound:step.sound,complete:tick>=plan.duration,fidelity:plan.fidelity};
}

/** Imported images may need longer than the original edit. Extend the authored
 * staging proportionally, keeping every camera/sound/contact cue on the common
 * 60 Hz clock. Never change an imported image's own tick sequence. */
export function retimeLoreCinematic(plan,duration) {
  if(!plan?.allowed||!Number.isSafeInteger(duration)||duration<plan.duration)return plan;
  if(duration===plan.duration)return plan;
  const ratio=duration/plan.duration;
  const steps=plan.steps.map((step,index)=>{
    const from=Math.round(step.from*ratio),to=index===plan.steps.length-1?duration:Math.round(step.to*ratio);
    return {...step,from,to,ticks:to-from};
  });
  return {...plan,sourceDuration:plan.sourceDuration||plan.duration,duration,steps,timingPolicy:'original-staging-follows-longest-contextual-clip'};
}

/** Source-specific text always survives, even while its bitmap pose is absent.
 * A missing authored presentation adds no arbitrary limb motion. */
export function sampleLorePresentation(actor,presentation) {
  const ref=presentation?.lore;if(!ref?.authored)return neutral();
  const data=dataOf(actor);
  if(ref.ownerId!==data.id||ref.source!==data.source)return neutral();
  const key=presentation.key,p=clamp(presentation.progress||0),body=ref.bodyKind;
  const locomotion=combatPolicy(actor).canMove!==false;
  const facing=actor.facing||1;
  const staging=PRESENTATION_STAGING[data.id];
  if(staging&&ref.stagingId===staging.id){
    const pose=staging.poses[PRESENTATION_POSE_INDEX[key]];
    if(key==='intro')return {x:locomotion?-facing*staging.entry*(1-ease(p)):0,
      y:locomotion&&combatPolicy(actor).canJump!==false&&staging.landing?-staging.landing*(1-ease(p)):0,
      alpha:clamp(p*4),pose};
    if(key==='loseRound')return {x:locomotion?-facing*staging.recoil*Math.sin(p*Math.PI):0,y:0,alpha:1,
      pose:p<.6?pose:pose+'-ready'};
    if(key==='outro'&&locomotion)return {x:-facing*staging.retreat*ease(p),y:0,alpha:1-clamp((p-.6)/.4),pose};
    return {...neutral(),pose:pose||'hold'};
  }
  if(key==='intro') {
    if(body==='flyer')return {x:-facing*55*(1-ease(p)),y:-95*(1-ease(p)),alpha:clamp(p*4),pose:'descent-to-support'};
    if(locomotion&&body==='quadruped')return {x:-facing*65*(1-ease(p)),y:0,alpha:clamp(p*5),pose:'low-approach'};
    if(locomotion&&body==='pyramid')return {x:-facing*34*(1-ease(p)),y:0,alpha:clamp(p*3),pose:'weighted-entry'};
    return {x:0,y:0,alpha:clamp(p*4),pose:'source-intro-pose'};
  }
  if(key==='loseRound')return {x:locomotion?-facing*15*Math.sin(p*Math.PI):0,y:0,alpha:1,pose:p<.6?'recoverable-stagger':'regain-support'};
  if(key==='winRound')return {...neutral(),pose:'watch-and-hold'};
  if(key==='loseMatch')return {...neutral(),pose:'final-defeat-held'};
  if(key==='winMatch')return {...neutral(),pose:'final-victory-held'};
  if(key==='taunt')return {...neutral(),pose:'source-threat-without-hitbox'};
  if(key==='outro'&&body==='flyer'&&locomotion)return {x:-facing*22*ease(p),y:-105*ease(p),alpha:1-clamp((p-.6)/.4),pose:'depart-into-fog'};
  return {...neutral(),pose:'source-exit-held'};
}

export const LORE_CINEMATIC_COVERAGE=Object.freeze({fighterIds:Object.freeze(Object.keys(FIGHTER_RECIPES)),recipes:Object.freeze(Object.keys(RECIPES)),
  presentationStagingIds:Object.freeze(Object.keys(PRESENTATION_STAGING)),
  stageIds:Object.freeze(Object.keys(STAGE_RECIPES)),fidelity:'original-versus-staging',animatedImagesCreated:0});

/** Procedural light, mist and cutaways only. Never draw a replacement monster,
 * limb or weapon. Rendering reads no gameplay RNG and fires no audio callbacks. */
export function drawLoreCinematic(ctx,sample,{width=1280,height=720,reducedMotion=false,color='#a6aaa0',focusX=width*.55,focusY=height*.63}={}) {
  if(!sample)return;
  const power=sample.effectPower,frame=sample.frame;
  ctx.save();
  switch(sample.effect) {
    case 'rail-light':{
      const glow=ctx.createRadialGradient(focusX,focusY-60,2,focusX,focusY-60,190);glow.addColorStop(0,`rgba(218,215,182,${.16+power*.3})`);glow.addColorStop(1,'rgba(180,190,170,0)');ctx.fillStyle=glow;ctx.fillRect(0,82,width,height-174);break;
    }
    case 'train':{
      const travel=reducedMotion?.5:sample.stepProgress,x=-width*.7+travel*width*1.8;
      ctx.fillStyle='#1b2425';ctx.fillRect(x,155,width*.82,height*.58);
      ctx.fillStyle='#68716b';ctx.fillRect(x,158,width*.82,7);ctx.fillRect(x,height*.77,width*.82,9);
      for(let i=0;i<8;i++){ctx.fillStyle='#090e0e';ctx.fillRect(x+25+i*125,204,86,117);ctx.fillStyle='rgba(162,181,163,.16)';ctx.fillRect(x+30+i*125,209,76,107);}break;
    }
    case 'embers':{
      ctx.fillStyle=`rgba(137,56,31,${.08+power*.1})`;ctx.fillRect(0,height*.75,width,height*.13);
      ctx.strokeStyle='rgba(161,112,65,.27)';ctx.lineWidth=2;
      for(let i=0;i<17;i++){const x=focusX-115+i*14,y=height*.79-(reducedMotion?14:(frame*1.7+i*13)%75);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2,y-5);ctx.stroke();}break;
    }
    case 'water':{
      ctx.fillStyle='rgba(43,70,76,.14)';ctx.fillRect(0,height*.79,width,height*.08);
      ctx.strokeStyle='rgba(140,170,168,.22)';ctx.lineWidth=1.5;
      for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(focusX,height*.8+i*8,37+i*18+(reducedMotion?8:sample.stepProgress*12),3+i*1.2,0,0,Math.PI*2);ctx.stroke();}break;
    }
    case 'rail-shadow':{
      ctx.strokeStyle='rgba(12,18,18,.82)';ctx.lineWidth=11;
      for(let i=-2;i<3;i++){ctx.beginPath();ctx.moveTo(focusX+i*39,185);ctx.lineTo(focusX+i*39,height-110);ctx.stroke();}
      ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(focusX-110,185);ctx.lineTo(focusX+110,210);ctx.stroke();break;
    }
    case 'fixed-chain':{
      ctx.strokeStyle='rgba(120,127,112,.4)';ctx.lineWidth=3;
      const sway=reducedMotion?0:Math.sin(frame*.19)*power*3;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(focusX-103,focusY-112+i*32);ctx.quadraticCurveTo(focusX+sway,focusY-84+i*31,focusX+95,focusY-111+i*32);ctx.stroke();}break;
    }
    case 'blackout':case 'shutter':{
      const cover=sample.effect==='shutter'?power*.52:power*.38;
      ctx.fillStyle=`rgba(3,4,4,${cover})`;ctx.fillRect(0,82,width,height-174);
      if(sample.effect==='shutter') {ctx.fillStyle='#080b0b';const w=width*clamp(power)*.18;ctx.fillRect(0,82,w,height-174);ctx.fillRect(width-w,82,w,height-174);}break;
    }
    case 'wind':case 'slash':{
      ctx.strokeStyle=color;ctx.globalAlpha=sample.effect==='slash'?.18:.09;ctx.lineWidth=sample.effect==='slash'?3:1;
      const drift=reducedMotion?0:frame*3;
      for(let i=0;i<7;i++){const x=(i*179+drift)%(width+170)-85,y=175+i*45;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+110+power*90,y-38);ctx.stroke();}break;
    }
    case 'spray':case 'mist':case 'fog':{
      const mist=ctx.createLinearGradient(0,height*.36,0,height);mist.addColorStop(0,'rgba(30,39,35,0)');mist.addColorStop(1,`rgba(115,130,119,${.12+power*.19})`);
      ctx.fillStyle=mist;ctx.fillRect(0,82,width,height-174);
      if(sample.effect==='spray'){ctx.fillStyle=`rgba(138,155,124,${power*.1})`;ctx.beginPath();ctx.moveTo(width*.4,height*.52);ctx.lineTo(width*.66,height*.33);ctx.lineTo(width*.67,height*.77);ctx.closePath();ctx.fill();}break;
    }
    case 'impact':case 'dust':case 'sparks':{
      ctx.strokeStyle=color;ctx.globalAlpha=.15+power*.15;ctx.lineWidth=2;
      const count=sample.effect==='sparks'?8:3;for(let i=0;i<count;i++){ctx.beginPath();ctx.ellipse(focusX,height*.79,45+i*26+power*22,5+i*3,0,0,Math.PI*2);ctx.stroke();}break;
    }
    default:{const gradient=ctx.createRadialGradient(width/2,height*.52,85,width/2,height*.52,width*.58);gradient.addColorStop(0,'rgba(0,0,0,0)');gradient.addColorStop(1,`rgba(0,0,0,${.25+power*.22})`);ctx.fillStyle=gradient;ctx.fillRect(0,82,width,height-174);}
  }
  ctx.restore();
}

export function loreSound(id) {
  // Synthesized cues are an original mix; no dialogue or extracted game audio.
  return {silence:null,breath:{freq:94,duration:.15,gain:.012,slide:-19},wing:{freq:137,duration:.13,gain:.018,slide:-75},
    rush:{freq:186,duration:.12,gain:.023,slide:-102},growl:{freq:61,duration:.24,gain:.027,slide:-17},
    creak:{freq:123,duration:.21,gain:.016,slide:-48},hiss:{freq:480,duration:.22,gain:.013,slide:-230},
    step:{freq:66,duration:.09,gain:.021,slide:-27},scrape:{freq:114,duration:.3,gain:.021,slide:-64},
    metal:{freq:243,duration:.18,gain:.025,slide:-173},cloth:{freq:176,duration:.18,gain:.012,slide:-90},
    hit:{freq:89,duration:.12,gain:.035,slide:-46},heavy:{freq:52,duration:.24,gain:.047,slide:-26},
    lowDrone:{freq:46,duration:.36,gain:.022,slide:-8},nightmareImpact:{freq:39,duration:.29,gain:.048,slide:-15}}[id]||null;
}

/** Cues belong to this engine only. Pause, silence cuts, reset and destruction
 * stop their nodes instead of leaving delayed audio from a retired sequence. */
export function createLoreAudioPlayer(audio) {
  const voices=new Set();
  const stop=()=>{for(const voice of voices){try{voice.oscillator.stop();voice.oscillator.disconnect();voice.gain.disconnect();}catch{}}voices.clear();};
  const play=id=>{
    stop();const sound=loreSound(id);if(!sound||!audio?.ensure?.())return false;
    const ctx=audio.context;if(!ctx?.createOscillator||!audio.master)return false;
    try{
      const oscillator=ctx.createOscillator(),gain=ctx.createGain(),time=ctx.currentTime;
      oscillator.type='triangle';oscillator.frequency.setValueAtTime(sound.freq,time);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,sound.freq+sound.slide),time+sound.duration);
      gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(sound.gain,time+.008);
      gain.gain.exponentialRampToValueAtTime(.0001,time+sound.duration);
      oscillator.connect(gain);gain.connect(audio.master);
      const voice={oscillator,gain};voices.add(voice);
      oscillator.onended=()=>{voices.delete(voice);try{oscillator.disconnect();gain.disconnect();}catch{}};
      oscillator.start(time);oscillator.stop(time+sound.duration+.02);return true;
    }catch{return false;}
  };
  return {play,stop,get activeVoices(){return voices.size;}};
}
