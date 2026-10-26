/**
 * Authored versus staging, keyed to the research catalogue. Tick values, camera,
 * sound synthesis and compositing below are ORIGINAL adaptations, not footage
 * measurements. Moving a supplied PNG never counts as a new animated image.
 * Limbs, grips, weapons and poses still require independent contextual images.
 */
import { FIGHTER_REFERENCES, STAGE_REFERENCES } from './production-reference.js';
import { STAGE_BITMAPS } from './stage-bitmap-manifest.js';
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
const anatomyMatches=(recipe,data)=>(!recipe.attackerKind||bodyProfile(data).kind===recipe.attackerKind)&&
  (!recipe.attackerLimbs||data.visual?.limbs===recipe.attackerLimbs)&&(!recipe.attackerHead||data.visual?.head===recipe.attackerHead);
// A static pistol in the catalogue never restores Cybil's discarded runtime
// weapon. Match the existing ten-shot/low-health transition without mutating it.
function cybilWeaponState(actor) {
  const data=dataOf(actor);
  if(data.id!=='sh1_monster_cybil_017'||data.source!=='sh1')return null;
  if(actor.weaponDiscarded===true||actor.ammo===0||
    (Number.isFinite(actor.health)&&Number.isFinite(actor.maxHealth)&&actor.maxHealth>0&&actor.health>0&&actor.health<actor.maxHealth*.5))return 'unarmed';
  return actor.weaponDiscarded===false&&Number.isSafeInteger(actor.ammo)&&actor.ammo>0&&actor.ammo<=10?'armed':null;
}

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
  patientBedside:{targets:STANDING,weapon:'hammer',propsAny:['beds','gurneys'],steps:[
    beat('MARTEAU DANS LE PASSAGE',39,frame('hammer-drag',.16),frame('brace'), 'vignette','scrape',.98),
    beat('APPROCHE DU LIT',32,frame('hammer-ready',.51),frame('backstep',.09), 'vignette','step',.95),
    beat('COUP DERRIERE LE MOBILIER',26,frame('hammer-down',.72),frame('fall',.2,33,.4), 'shutter','heavy',.94),
    beat('BRAS AU REPOS',33,frame('hammer-low',.53),frame('occluded',.2,35,.18), 'vignette','breath',.98),
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
  ankleShadow:{attackerKind:'insect',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('SIX PATTES AU RAS DU SOL',34,frame('six-leg-approach',.28),frame('watch'), 'dust','scrape',.98),
    beat('MORSURE A LA CHEVILLE',26,frame('ankle-bite',.74),frame('unbalanced',.04,10), 'vignette','hit',.95),
    beat('PERTE DES APPUIS',29,frame('six-leg-brace',.71),frame('fall',.17,34), 'dust','cloth',.94),
    beat('OMBRE QUI TOMBE',39,frame('low-withdraw',.46),frame('occluded',.2,36,.18), 'vignette','silence',.98),
    beat('RETOUR A LA FISSURE',46,frame('six-leg-retreat',.25),frame('held',.2,36,.18), 'fog','scrape',1)
  ]},
  ceilingHook:{attackerKind:'insect',unarmed:true,targets:STANDING,maxTargetHeight:310,needsCeiling:true,steps:[
    beat('GRIFFES VERROUILLEES AU SUPPORT',42,frame('ceiling-claws-lock',.24,-120),frame('look-up'), 'vignette','scrape',.96),
    beat('CROCHET DEPUIS LE PLAFOND',31,frame('ceiling-hook',.69,-68),frame('gripped',.04,-8), 'vignette','creak',.93),
    beat('SAISIE SOUS LES GRIFFES',27,frame('ceiling-claws-held',.71,-76),frame('lifted',.05,-43), 'impact','hit',.94),
    beat('BALANCEMENT OCCULTE',35,frame('ceiling-claws-sway',.65,-95),frame('occluded',.05,-45,.12), 'blackout','silence',.97),
    beat('SUPPORT CONSERVE',47,frame('ceiling-claws-lock',.48,-120),frame('held',.05,-45,.12), 'vignette','scrape',1)
  ]},
  underGrateGrip:{attackerKind:'wall',unarmed:true,targets:STANDING,maxTargetHeight:310,propsAny:['grates'],steps:[
    beat('MAINS SOUS LA GRILLE',43,frame('under-grate-hands'),frame('watch'), 'rail-shadow','metal',.97),
    beat('PRISE SOUS LE PLANCHER',32,frame('under-grate-grip'),frame('gripped',-.16,7), 'rail-shadow','creak',.94),
    beat('TRACTION SOUS LE SUPPORT',29,frame('under-grate-pull'),frame('fall',-.29,29), 'vignette','heavy',.93),
    beat('ECRAN OBSCURCI',38,frame('under-grate-held'),frame('occluded',-.29,35,.12), 'blackout','silence',.97),
    beat('CORPS TOUJOURS SUSPENDU',44,frame('under-grate-hands'),frame('held',-.29,35,.12), 'rail-shadow','metal',1)
  ]},
  cageFootLift:{attackerKind:'cage',unarmed:true,targets:STANDING,maxTargetHeight:310,needsCeiling:true,steps:[
    beat('CAGE 2001 SUSPENDUE',42,frame('cage-2001-hold'),frame('look-up'), 'vignette','metal',.97),
    beat('EMPRISE DES PIEDS',33,frame('cage-feet-grip'),frame('gripped',-.17,-8), 'vignette','creak',.94),
    beat('SILHOUETTE RELEVEE',31,frame('cage-feet-lift'),frame('lifted',-.22,-66), 'vignette','cloth',.92),
    beat('COUPE AVANT LE DETAIL',33,frame('cage-feet-hold'),frame('occluded',-.22,-66,0), 'blackout','silence',.97),
    beat('CADRAGE DE LA CAGE SANS CIBLE',46,frame('cage-2001-hold'),frame('held',-.22,-66,0), 'vignette','metal',1)
  ]},
  organicFrameOcclusion:{attackerKind:'mass',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('POIDS DU CADRE EXISTANT',41,frame('organic-frame-approach',.2),frame('brace'), 'vignette','step',.97),
    beat('CADRE LEVE A PORTEE',34,frame('organic-frame-lift',.64),frame('backstep',.07), 'vignette','creak',.94),
    beat('SILHOUETTE OCCULTEE PAR LE CADRE',29,frame('organic-frame-occlude',.79),frame('occluded',.1,11,.12), 'vignette','cloth',.93),
    beat('IMPACT DANS LE NOIR',24,frame('organic-frame-held',.79),frame('occluded',.1,34,0), 'blackout','heavy',.97),
    beat('UNE SEULE STRUCTURE AU REPOS',48,frame('organic-frame-stable',.59),frame('held',.1,34,0), 'vignette','silence',1)
  ]},
  rotatingShadow:{attackerKind:'flyer',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('DEUX TORSES SANS AILES',38,frame('two-torso-rotation',-.1,-85),frame('watch'), 'wind','metal',.97),
    beat('CHANGEMENT D AXE',32,frame('two-torso-axis-change',.36,-54),frame('brace',.03), 'wind','scrape',.94),
    beat('PASSAGE DEVANT LA CAMERA',27,frame('two-torso-camera-pass',.85,-23),frame('occluded',.1,8,.2), 'vignette','rush',.92),
    beat('OMBRE IMMOBILE',35,frame('two-torso-points-held',1.07,-35),frame('fall',.16,35,.12), 'blackout','hit',.97),
    beat('ROTATION HORS DU PLAN',47,frame('two-torso-rotating-exit',1.22,-112,0),frame('held',.16,35,.12), 'vignette','silence',1)
  ]},
  waterSurfaceGrip:{attackerKind:'giant',unarmed:true,targets:STANDING,maxTargetHeight:310,propsAny:['water','canal','pool','pools'],steps:[
    beat('REMOUS A COURTE PORTEE',44,frame('water-emergence',.17,0,.7),frame('watch'), 'water','breath',.97),
    beat('PRISE DES BRAS EXISTANTS',33,frame('water-close-grip',.69),frame('gripped',.03,8), 'water','creak',.94),
    beat('RETRAIT SOUS LA SURFACE',31,frame('water-submerge',.6,18,.45),frame('pulled-under',-.05,35,.45), 'water','heavy',.93),
    beat('EAU DEVANT LES SILHOUETTES',36,frame('water-submerged',.6,23,.12),frame('occluded',-.05,42,.08), 'water','silence',.97),
    beat('SURFACE FERMEE',43,frame('water-surface-held',.6,23,.08),frame('held',-.05,42,.08), 'water','breath',1)
  ]},
  buzzingCameraPass:{attackerKind:'flyer',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('PETIT VOL INSTABLE',35,frame('small-wing-hover',-.11,-61),frame('track'), 'wind','wing',.98),
    beat('PASSAGE MORDANT',28,frame('small-wing-bite-pass',.76,-25),frame('recoil',.08,8), 'wind','rush',.94),
    beat('PRES DU PREMIER PLAN',24,frame('small-wing-camera-pass',1.1,-51),frame('occluded',.14,14,.22), 'vignette','wing',.93),
    beat('OMBRE QUI S EFFONDRE',35,frame('small-wing-depart',1.28,-92),frame('fall',.19,35,.12), 'vignette','hit',.97),
    beat('BOURDONNEMENT QUI S ELOIGNE',48,frame('small-wing-exit',1.4,-138,0),frame('held',.19,35,.12), 'vignette','silence',1)
  ]},
  wallSupportPull:{attackerKind:'wall',unarmed:true,targets:STANDING,maxTargetHeight:310,propsAny:['walls','wall','organic-wall'],steps:[
    beat('TORSE FIXE AU MUR',44,frame('wall-torso-emerge'),frame('watch'), 'vignette','creak',.98),
    beat('BRAS VERS LA CIBLE',33,frame('wall-arm-reach'),frame('gripped',-.18,3), 'vignette','cloth',.95),
    beat('TRACTION CONTRE LE SUPPORT',29,frame('wall-arm-pull'),frame('recoil',-.38,16), 'impact','heavy',.93),
    beat('COUPE AVANT LE DETAIL',31,frame('wall-arms-held'),frame('occluded',-.38,29,.12), 'blackout','silence',.97),
    beat('RETRACTION DANS LE MEME MUR',47,frame('wall-torso-retract',0,0,.2),frame('held',-.38,29,.12), 'vignette','creak',1)
  ]},
  unarmedFurnitureStruggle:{attackerKind:'humanoid',unarmed:true,targets:STANDING,maxTargetHeight:310,propsAny:['desks','beds','gurneys','wheelchairs'],steps:[
    beat('MAINS VIDES PRES DU SOL',37,frame('old-type-empty-hands',.17),frame('brace'), 'vignette','breath',.98),
    beat('LUTTE RAPPROCHEE',32,frame('old-type-close-struggle',.68),frame('gripped',.04,8), 'vignette','cloth',.95),
    beat('MOBILIER AU PREMIER PLAN',34,frame('old-type-body-occlude',.77),frame('occluded',.12,22,.22), 'shutter','creak',.94),
    beat('COUP DE POING OCCULTE',25,frame('old-type-unarmed-strike',.77),frame('fall',.17,35,.12), 'blackout','hit',.97),
    beat('AUCUNE ARME PRISE',45,frame('old-type-empty-hands',.47),frame('held',.17,35,.12), 'vignette','silence',1)
  ]},
  blueTerminalExposure:{attackerKind:'deity',unarmed:true,targets:PHYSICAL,steps:[
    beat('FORME LUMINEUSE IMMOBILE',43,frame('incubator-standing-light'),frame('brace'), 'vignette','lowDrone',.97),
    beat('DECHARGE BLEUE ANNONCEE',34,frame('incubator-blue-discharge'),frame('recoil',.04,8), 'blue-exposure','hiss',.94),
    beat('SUREXPOSITION DE LA SILHOUETTE',32,frame('incubator-light-held'),frame('occluded',.08,21,.25), 'blue-exposure','lowDrone',.93),
    beat('SILHOUETTE QUI S ETEINT',35,frame('incubator-standing-light'),frame('fall',.1,35,0), 'vignette','silence',.97),
    beat('AUCUNE TRANSFORMATION AILEE',45,frame('incubator-standing-light'),frame('held',.1,35,0), 'vignette','silence',1)
  ]},
  redSuspendedExposure:{attackerKind:'deity',unarmed:true,targets:PHYSICAL,steps:[
    beat('SILHOUETTE AILEE SUSPENDUE',45,frame('incubus-suspended-wings'),frame('watch'), 'vignette','lowDrone',.97),
    beat('FOUDRE ROUGE DE CETTE BRANCHE',31,frame('incubus-red-discharge'),frame('recoil',.05,6), 'red-exposure','hiss',.94),
    beat('SILHOUETTE DEVANT L ECLAT',34,frame('incubus-red-light-held'),frame('occluded',.1,19,.23), 'red-exposure','lowDrone',.92),
    beat('EXTINCTION DU PLAN CIBLE',32,frame('incubus-wings-held'),frame('fall',.13,35,0), 'blackout','silence',.97),
    beat('FORME AILEE CONSERVEE',47,frame('incubus-suspended-wings'),frame('held',.13,35,0), 'vignette','silence',1)
  ]},
  sh2LowShadowBite:{attackerKind:'insect',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('ECHELLE BASSE DE LA VERSION SH2',39,frame('sh2-six-leg-low-approach',.22),frame('watch'), 'dust','scrape',.98),
    beat('MORSURE BASSE A PORTEE',28,frame('sh2-six-leg-bite',.71),frame('unbalanced',.03,9), 'vignette','hit',.95),
    beat('APPUI ADVERSE QUI CEDE',31,frame('sh2-six-leg-retract',.6),frame('fall',.15,34), 'dust','cloth',.94),
    beat('ARRET SUR L OMBRE',36,frame('sh2-six-leg-still',.49),frame('occluded',.15,36,.16), 'vignette','silence',.98),
    beat('CORPS SH2 AU RAS DU SOL',44,frame('sh2-six-leg-retreat',.26),frame('held',.15,36,.16), 'fog','scrape',1)
  ]},
  incompleteBodyFireline:{attackerKind:'deity',unarmed:true,targets:PHYSICAL.filter(k=>k!=='flyer'),steps:[
    beat('BUSTE MASSIF SANS MARCHE',46,frame('god-incomplete-body-high'),frame('brace'), 'vignette','breath',.97),
    beat('FEU PROJETE SUR LE SOL',36,frame('god-ground-fire'),frame('backstep',.06), 'embers','hiss',.94),
    beat('FEU AUTOUR DE LA SILHOUETTE',33,frame('god-incomplete-body-low'),frame('occluded',.09,15,.25), 'embers','lowDrone',.93),
    beat('OBSCURITE FINALE',34,frame('god-low-held'),frame('fall',.12,35,.08), 'blackout','silence',.97),
    beat('BUSTE ET FAIBLE BRAISE',46,frame('god-incomplete-body-high'),frame('held',.12,35,.08), 'embers','breath',1)
  ]},
  closedTorsoLegRelease:{attackerKind:'humanoid',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('TORSE TOUJOURS FERME',38,frame('closed-torso-approach',.27),frame('brace'), 'vignette','breath',.98),
    beat('ENSERREMENT AVEC LES JAMBES',31,frame('closed-torso-leg-clamp',.7,-18),frame('leg-gripped',.04,7), 'vignette','cloth',.94),
    beat('RELACHEMENT DES JAMBES',28,frame('closed-torso-leg-release',.58),frame('unbalanced',.12,16), 'dust','creak',.95),
    beat('JET TERMINAL DE CETTE ENVELOPPE',32,frame('closed-torso-terminal-spray',.54),frame('occluded',.18,32,.23), 'spray','hiss',.94),
    beat('RETOUR AU TORSE CLOS',47,frame('closed-torso-held',.4),frame('held',.18,36,.16), 'mist','silence',1)
  ]},
  tetheredDollKicks:{attackerKind:'doll',unarmed:true,targets:STANDING,maxTargetHeight:310,needsCeiling:true,steps:[
    beat('ATTACHES AU DESSUS DU CADRE',43,frame('ariel-tethered-inverted',0,-94),frame('look-up'), 'vignette','creak',.97),
    beat('DESCENTE SUR LES ATTACHES',32,frame('ariel-tethered-descent',0,-34),frame('brace',-.12), 'vignette','cloth',.94),
    beat('COUPS DES JAMBES EXISTANTES',29,frame('ariel-tethered-leg-kicks'),frame('recoil',-.19,17), 'impact','hit',.93),
    beat('CIBLE OCCULTEE SOUS LE SUPPORT',34,frame('ariel-tethered-retract',0,-38),frame('fall',-.19,35,.15), 'vignette','silence',.97),
    beat('REMONTEE SANS VOL LIBRE',47,frame('ariel-tethered-ascent',0,-94),frame('held',-.19,35,.15), 'vignette','creak',1)
  ]},
  helenSuspendedWheel:{attackerKind:'cage',unarmed:true,targets:STANDING,maxTargetHeight:310,needsCeiling:true,steps:[
    beat('CABLES PORTEURS CONSERVES',46,frame('helen-cage-cables-held'),frame('watch'), 'vignette','metal',.97),
    beat('CAGE PIVOTANTE DANS SA PORTEE',33,frame('helen-cage-wheel-ready'),frame('brace',-.12), 'vignette','creak',.94),
    beat('ROUE AU CONTACT PROCHE',29,frame('helen-cage-wheel-close'),frame('recoil',-.19,12), 'vignette','scrape',.93),
    beat('NUAGE DEVANT LE CADRE',37,frame('helen-cage-near-cloud'),frame('occluded',-.19,31,.16), 'mist','hiss',.97),
    beat('CAGE TOUJOURS SUSPENDUE',45,frame('helen-cage-cables-held'),frame('held',-.19,35,.16), 'mist','silence',1)
  ]},
  richardWallTentacles:{attackerKind:'giant',unarmed:true,targets:STANDING,maxTargetHeight:310,propsAny:['walls','wall','organic-wall'],steps:[
    beat('MUR ET ATTACHES CORPORELLES',44,frame('richard-wall-head-held'),frame('watch'), 'vignette','breath',.98),
    beat('TENTACULES DEPUIS L ANCRAGE',34,frame('richard-wall-tentacles-reach'),frame('tentacle-gripped',-.18,5), 'vignette','cloth',.95),
    beat('CIBLE RAMENEE A PORTEE DE TETE',31,frame('richard-wall-neck-extended'),frame('pulled-close',-.38,13), 'vignette','creak',.93),
    beat('FERMETURE DU CADRE',33,frame('richard-wall-head-close'),frame('occluded',-.38,31,.12), 'blackout','heavy',.97),
    beat('AUCUN DETACHEMENT DU MUR',47,frame('richard-wall-head-held'),frame('held',-.38,35,.12), 'vignette','silence',1)
  ]},
  lurkerLowClawFold:{attackerKind:'humanoid',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('APPUI BAS DES MEMBRES EXISTANTS',37,frame('lurker-low-claw-support',-.08),frame('brace'), 'dust','scrape',.98),
    beat('BOND COURT GRIFFES OUVERTES',29,frame('lurker-short-claw-leap',.7,-25),frame('recoil',.04,7), 'wind','rush',.95),
    beat('RABATTEMENT DES GRIFFES',28,frame('lurker-claws-fold',.79),frame('fall',.15,34), 'slash','hit',.94),
    beat('CORPS BAS EN PREMIER PLAN',33,frame('lurker-low-occlusion',.75),frame('occluded',.15,35,.19), 'vignette','cloth',.97),
    beat('RETOUR AUX APPUIS BAS',46,frame('lurker-low-claw-support',.53),frame('held',.15,35,.19), 'vignette','breath',1)
  ]},
  smogExposedExhalation:{attackerKind:'humanoid',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('APPROCHE LENTE SANS CHARGE',43,frame('smog-closed-ribs-step',.24),frame('watch'), 'vignette','step',.98),
    beat('COTES OUVERTES POUMONS EXPOSES',35,frame('smog-ribs-open-lungs-exposed',.24),frame('brace',.03), 'mist','breath',.95),
    beat('EXHALATION RAPPROCHEE',36,frame('smog-lungs-exposed-exhale',.24),frame('stagger',.1,8), 'spray','hiss',.94),
    beat('NUAGE QUI REMPLIT LE CADRE',37,frame('smog-lungs-exposed-cloud',.24),frame('occluded',.17,32,.16), 'mist','hiss',.97),
    beat('FERMETURE DU THORAX AU REPOS',46,frame('smog-ribs-close-held',.24),frame('held',.17,35,.16), 'mist','silence',1)
  ]},
  bomTalonsCircle:{attackerKind:'flyer',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('CERCLE DE LA VERSION VITA',41,frame('bom-wing-room-circle',-.12,-74),frame('track'), 'wind','wing',.97),
    beat('PIQUE DES SERRES PROPOSE',29,frame('bom-talon-descent',.68,-22),frame('brace',.03), 'wind','rush',.94),
    beat('PASSAGE DES SERRES',24,frame('bom-hover-talon-slash',.78,-17),frame('recoil',.16,16), 'slash','hit',.93),
    beat('CIBLE SOUS LA TRAJECTOIRE',34,frame('bom-wing-circle-recover',.56,-59),frame('fall',.21,35,.22), 'vignette','wing',.97),
    beat('REPRISE DU VOL CIRCULAIRE',48,frame('bom-wing-room-circle',.23,-74),frame('held',.21,35,.22), 'wind','silence',1)
  ]},
  bomHammerStop:{attackerKind:'humanoid',weapon:'hammer',targets:STANDING,maxTargetHeight:310,steps:[
    beat('CIBLE CHOISIE SANS DETOUR',42,frame('bom-hammer-target-approach',.24),frame('brace'), 'vignette','step',.98),
    beat('ARMEMENT DU MARTEAU VITA',35,frame('bom-hammer-windup',.57),frame('backstep',.05), 'vignette','metal',.94),
    beat('ABATTEMENT PROPOSE SANS SAISIE',27,frame('bom-hammer-down',.72),frame('fall',.18,35), 'impact','heavy',.93),
    beat('POIDS IMMOBILISE',35,frame('bom-hammer-weight-stop',.69),frame('occluded',.18,36,.18), 'vignette','silence',.97),
    beat('REGARD ET MARTEAU CONSERVES',48,frame('bom-hammer-final-hold',.54),frame('held',.18,36,.18), 'vignette','breath',1)
  ]},
  bomCleaverPair:{attackerKind:'humanoid',weapon:'cleaver',targets:STANDING,maxTargetHeight:310,steps:[
    beat('GREAT CLEAVER DE CETTE VERSION',38,frame('bom-cleaver-close-ready',.22),frame('brace'), 'vignette','metal',.98),
    beat('PREMIER COUP COURT PROPOSE',27,frame('bom-cleaver-first-cut',.65),frame('recoil',.09,5), 'slash','hit',.94),
    beat('SECOND COUP COURT PROPOSE',29,frame('bom-cleaver-second-cut',.7),frame('fall',.18,34), 'slash','metal',.93),
    beat('RECUL DU BUSTE',33,frame('bom-cleaver-torso-recoil',.45),frame('occluded',.18,35,.18), 'vignette','cloth',.97),
    beat('LAME AU REPOS SANS PRISE AJOUTEE',47,frame('bom-cleaver-held',.4),frame('held',.18,35,.18), 'vignette','silence',1)
  ]},
  bomCirclingCharge:{attackerKind:'quadruped',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Encerclement et charge décrits par le bestiaire Vita. La morsure proposée dans le classeur reste à capturer ; elle n’est pas rejouée ici.',steps:[
    beat('ENCERCLEMENT DOCUMENTE VITA',39,frame('bom-dog-circle-appui',-.13),frame('track'), 'dust','growl',.98),
    beat('RESSERRER LES APPUIS',31,frame('bom-dog-circle-close',.2),frame('brace'), 'dust','step',.95),
    beat('CHARGE DE LA TETE FENDUE',27,frame('bom-dog-charge',.76),frame('recoil',.16,17), 'impact','hit',.93),
    beat('CIBLE DESEQUILIBREE',34,frame('bom-dog-charge-recover',.63),frame('fall',.24,35,.25), 'dust','cloth',.97),
    beat('POURSUITE CIRCULAIRE PROPOSEE',47,frame('bom-dog-circle-resume',.32),frame('held',.24,35,.25), 'vignette','growl',1)
  ]},
  bomToxicPresencePass:{attackerKind:'ghost',unarmed:true,targets:PHYSICAL,steps:[
    beat('DERIVE DE LA PRESENCE TOXIQUE',44,frame('bom-toxic-presence-approach',.2),frame('watch'), 'fog','lowDrone',.98),
    beat('PRESENCE AUTOUR DE LA CIBLE',36,frame('bom-toxic-presence-envelop',.68,-5,.85),frame('stagger',.04,7), 'mist','hiss',.95),
    beat('GLISSEMENT AU DELA',34,frame('bom-toxic-presence-pass',1.08,-5,.85),frame('occluded',.1,22,.22), 'mist','lowDrone',.94),
    beat('ESPACE ADVERSE QUI SE VIDE',33,frame('bom-toxic-presence-beyond',1.14),frame('fall',.13,35,.1), 'fog','silence',.97),
    beat('PRESENCE AU FOND CONSERVEE',48,frame('bom-toxic-presence-held',1.14),frame('held',.13,35,.1), 'vignette','lowDrone',1)
  ]},
  bomMassSpaceCrush:{attackerKind:'mass',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('MASSE QUI OCCUPE L ESPACE',43,frame('bom-mass-space-advance',.21),frame('brace'), 'dust','breath',.98),
    beat('FERMETURE DES APPUIS ADVERSES',34,frame('bom-mass-space-close',.61),frame('backstep',.08), 'vignette','creak',.95),
    beat('ECRASEMENT PAR LE POIDS',31,frame('bom-mass-weight-press',.82),frame('fall',.23,35), 'impact','heavy',.93),
    beat('MASSE EN PREMIER PLAN',33,frame('bom-mass-occlude',.86),frame('occluded',.23,36,.15), 'vignette','breath',.97),
    beat('VAINQUEUR INTACT SANS EXPLOSION',47,frame('bom-mass-weight-held',.7),frame('held',.23,36,.15), 'vignette','silence',1)
  ]},
  bomBladeCrossRetreat:{attackerKind:'spider',attackerLimbs:4,unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('QUATRE MEMBRES LAMES VITA',39,frame('bom-four-blades-support',.17),frame('brace'), 'vignette','metal',.98),
    beat('MEMBRES DEVANT LA TRAJECTOIRE',31,frame('bom-four-blades-open',.51),frame('backstep',.03), 'vignette','creak',.95),
    beat('CROISEMENT PROPOSE',27,frame('bom-four-blades-cross',.73),frame('recoil',.17,15), 'slash','hit',.93),
    beat('RECUL OBLIQUE',32,frame('bom-four-blades-oblique-retreat',.47),frame('fall',.22,35,.22), 'dust','scrape',.97),
    beat('APPUI SUR LES MEMBRES EXISTANTS',48,frame('bom-four-blades-support',.36),frame('held',.22,35,.22), 'vignette','silence',1)
  ]},
  bomGreatKnifeSweep:{attackerKind:'pyramid',weapon:'great_knife',targets:STANDING,maxTargetHeight:310,steps:[
    beat('LAME MASSIVE DE LA VERSION VITA',43,frame('bom-great-knife-drag',.18),frame('brace'), 'sparks','scrape',.98),
    beat('TRAJECTOIRE LATERALE PREPAREE',36,frame('bom-great-knife-sweep-ready',.49),frame('backstep',.05), 'vignette','metal',.94),
    beat('BALAYAGE PROPOSE',28,frame('bom-great-knife-sweep',.72),frame('fall',.2,35), 'slash','heavy',.93),
    beat('POIDS DE LA LAME MAINTENU',34,frame('bom-great-knife-weight-stop',.69),frame('occluded',.2,36,.15), 'vignette','scrape',.97),
    beat('LAME TENUE SANS ESTOC AJOUTE',49,frame('bom-great-knife-held',.54),frame('held',.2,36,.15), 'vignette','silence',1)
  ]},
  bomHeadBladeLunge:{attackerKind:'humanoid',attackerHead:'blade',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('OSCILLATION AVEUGLE',38,frame('bom-head-blade-sway',-.08),frame('watch'), 'vignette','breath',.98),
    beat('AXE FRONTAL VERS LE BRUIT',32,frame('bom-head-blade-align',.23),frame('brace'), 'vignette','creak',.95),
    beat('ELAN DE LA TETE LAME',27,frame('bom-head-blade-lunge',.76),frame('recoil',.17,13), 'slash','hit',.93),
    beat('REPLI SANS SAISIE AJOUTEE',34,frame('bom-head-blade-retract',.48),frame('fall',.23,35,.21), 'vignette','cloth',.97),
    beat('RETOUR A L OSCILLATION',47,frame('bom-head-blade-sway',.37),frame('held',.23,35,.21), 'vignette','breath',1)
  ]},
  bomClosedTorsoJet:{attackerKind:'humanoid',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('ENVELOPPE SANS BRAS LIBRES',41,frame('bom-closed-torso-contraction',.12),frame('brace'), 'vignette','breath',.98),
    beat('PREPARATION DU VOMISSEMENT ACIDE',34,frame('bom-closed-torso-jet-ready',.34),frame('backstep',.05), 'mist','breath',.95),
    beat('JET TERMINAL PROPOSE',35,frame('bom-closed-torso-acid-jet',.34),frame('stagger',.13,11), 'spray','hiss',.94),
    beat('CIBLE MASQUEE PAR LE JET',33,frame('bom-closed-torso-release',.29),frame('fall',.2,35,.2), 'mist','cloth',.97),
    beat('CORPS TOUJOURS CLOS',48,frame('bom-closed-torso-held',.24),frame('held',.2,35,.2), 'vignette','silence',1)
  ]},
  originsJoinedTackle:{attackerKind:'mass',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Tackle rapproché décrit par le guide Origins. Le maintien des deux corps et l’écrasement sont un montage versus ; projectile exclu faute de relevé.',steps:[
    beat('DEUX CORPS TOUJOURS SOLIDAIRES',42,frame('origins-joined-bodies-approach',.19),frame('brace'), 'vignette','breath',.98),
    beat('TACKLE RAPPROCHE ATTESTE',30,frame('origins-joined-bodies-tackle',.72),frame('recoil',.12,13), 'impact','heavy',.94),
    beat('MAINTIEN PROPOSE DU CORPS ASSEMBLE',32,frame('origins-joined-bodies-press',.81),frame('fall',.19,34), 'vignette','creak',.93),
    beat('RELACHEMENT SANS SEPARATION',34,frame('origins-joined-bodies-release',.63),frame('occluded',.19,35,.18), 'vignette','cloth',.97),
    beat('MEME ASSEMBLAGE AU REPOS',47,frame('origins-joined-bodies-held',.48),frame('held',.19,35,.18), 'vignette','silence',1)
  ]},
  amnionSupportedFrontLegs:{attackerKind:'spider',unarmed:true,targets:STANDING,maxTargetHeight:310,propsAny:['machines'],
    scopeNote:'Balayages des membres avant de première phase décrits par le guide Homecoming. Le choc rapproché du classeur utilise ce geste, sans smash ni prise de seconde phase ; nombre total des pattes non relevé.',steps:[
    beat('TORSE SUSPENDU SUR LE DISPOSITIF',45,frame('hc-amnion-hanging-supported'),frame('watch'), 'vignette','metal',.98),
    beat('FRAPPE DU MEMBRE AVANT',31,frame('hc-amnion-hanging-front-swing'),frame('recoil',-.14,8), 'impact','heavy',.95),
    beat('AUTRE MEMBRE AVANT PROPOSE',32,frame('hc-amnion-hanging-front-alternate'),frame('backstep',-.2,13), 'impact','metal',.94),
    beat('DERNIER BALAYAGE AVANT PROPOSE',29,frame('hc-amnion-hanging-close-swing'),frame('fall',-.24,35,.2), 'vignette','metal',.96),
    beat('APPUIS DE PREMIERE FORME CONSERVES',49,frame('hc-amnion-hanging-supported'),frame('held',-.24,35,.2), 'vignette','silence',1)
  ]},
  amnionExposedCloseGrip:{attackerKind:'mass',unarmed:true,targets:STANDING,maxTargetHeight:310,propsAny:['machines'],
    scopeNote:'Prise de seconde phase décrite par le guide Homecoming. La forme exposée est conservée, sans retour à la première stance ni ouverture de ventre du vainqueur.',steps:[
    beat('TORSE EXPOSE ENTRE LES APPUIS',43,frame('hc-amnion-exposed-supported'),frame('brace'), 'vignette','creak',.98),
    beat('PRISE DE SECONDE PHASE',34,frame('hc-amnion-exposed-close-grip'),frame('gripped',-.18,6), 'vignette','cloth',.95),
    beat('MEMBRES REFERMES A PORTEE DU TORSE',32,frame('hc-amnion-exposed-members-close'),frame('recoil',-.28,19), 'impact','heavy',.93),
    beat('CIBLE OCCULTEE PAR LE CADRE',33,frame('hc-amnion-exposed-held'),frame('occluded',-.28,34,.15), 'vignette','breath',.97),
    beat('MEME FORME EXPOSEE AU REPOS',48,frame('hc-amnion-exposed-supported'),frame('held',-.28,35,.15), 'vignette','silence',1)
  ]},
  bomPipePairStop:{attackerKind:'nurse',weapon:'pipe',targets:STANDING,maxTargetHeight:310,steps:[
    beat('TUYAU METALLIQUE DE LA VERSION VITA',39,frame('bom-nurse-pipe-held',.21),frame('brace'), 'vignette','metal',.98),
    beat('PREMIER COUP PROPOSE',28,frame('bom-nurse-pipe-first',.65),frame('recoil',.09,7), 'impact','hit',.95),
    beat('SECOND COUP PROPOSE',30,frame('bom-nurse-pipe-second',.72),frame('fall',.19,34), 'impact','metal',.94),
    beat('ARRET TREMBLANT DU TUYAU',34,frame('bom-nurse-pipe-trembling-stop',.59),frame('occluded',.19,35,.2), 'vignette','creak',.97),
    beat('TUYAU RETENU SANS SCALPEL AJOUTE',46,frame('bom-nurse-pipe-held',.47),frame('held',.19,35,.2), 'vignette','silence',1)
  ]},
  bomTremerLowPressure:{attackerKind:'insect',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Poursuite rampante décrite par le bestiaire Vita. La poussée de contact est une proposition versus ; aucun membre, morsure ou projectile ajouté.',steps:[
    beat('CORPS PULSATILE AU RAS DU SOL',41,frame('bom-tremer-low-approach',.17),frame('watch'), 'dust','scrape',.98),
    beat('POURSUITE DANS LE MEME AXE',33,frame('bom-tremer-low-extension',.49),frame('brace'), 'dust','cloth',.96),
    beat('POUSSEE DE CONTACT PROPOSEE',29,frame('bom-tremer-low-contact',.74),frame('unbalanced',.13,13), 'impact','hit',.94),
    beat('RELACHEMENT DU CORPS BAS',35,frame('bom-tremer-low-release',.57),frame('fall',.19,35,.25), 'dust','scrape',.97),
    beat('RETRAIT AU NIVEAU DU SOL',47,frame('bom-tremer-low-withdraw',.31),frame('held',.19,35,.25), 'vignette','silence',1)
  ]},
  bomFireHandsEmission:{attackerKind:'deity',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Flammes de bouche et de mains décrites par le bestiaire Vita. Bond et décharge corporelle du classeur restent à confirmer ; aucun des deux n’est rejoué ici.',steps:[
    beat('MASSE ET MAINS DANS LE CADRE',43,frame('bom-fire-hands-ready'),frame('brace'), 'vignette','breath',.98),
    beat('SOURCE DU FEU DANS LES MAINS',34,frame('bom-fire-hands-emit'),frame('backstep',.06), 'embers','hiss',.95),
    beat('FEU DEVANT LA CIBLE',35,frame('bom-fire-hands-held'),frame('stagger',.12,11), 'embers','lowDrone',.94),
    beat('OCCULTATION DU RESULTAT',34,frame('bom-fire-hands-release'),frame('occluded',.18,34,.15), 'blackout','silence',.97),
    beat('CORPS INTACT SANS AUTO EXPLOSION',48,frame('bom-fire-hands-rest'),frame('held',.18,35,.15), 'embers','breath',1)
  ]},
  bomHeartMaceArm:{attackerKind:'deity',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('COEUR LUMINEUX ET BRAS ORGANIQUE',44,frame('bom-light-heart-arm-ready',.15),frame('watch'), 'vignette','lowDrone',.98),
    beat('BRAS MASSE LEVE',35,frame('bom-light-mace-arm-raised',.48),frame('brace'), 'vignette','creak',.95),
    beat('ABATTEMENT DU BRAS EXISTANT',29,frame('bom-light-mace-arm-down',.72),frame('fall',.19,34), 'impact','heavy',.93),
    beat('PULSATION PROPOSEE DU COEUR',34,frame('bom-light-heart-held',.65),frame('occluded',.19,35,.16), 'vignette','lowDrone',.97),
    beat('BRAS AU REPOS SANS ARME INVOQUEE',48,frame('bom-light-mace-arm-rest',.48),frame('held',.19,35,.16), 'vignette','silence',1)
  ]},
  bomAquaticMembers:{attackerKind:'deity',unarmed:true,targets:STANDING,maxTargetHeight:310,propsAny:['pools','water','pool','canal'],steps:[
    beat('MASSE ET MEMBRES DANS LEUR EAU',45,frame('bom-water-members-surface'),frame('watch'), 'water','breath',.98),
    beat('MEMBRES VERS LA CIBLE',34,frame('bom-water-members-reach'),frame('gripped',-.16,7), 'water','creak',.95),
    beat('EAU RABATTUE A PORTEE',32,frame('bom-water-members-fold'),frame('pulled-under',-.25,30,.5), 'water','heavy',.94),
    beat('MEMBRES QUI REPLONGENT',35,frame('bom-water-members-submerge'),frame('occluded',-.25,40,.12), 'water','silence',.97),
    beat('SURFACE DU LIEU A NIVEAU FIXE',49,frame('bom-water-members-held'),frame('held',-.25,40,.12), 'water','breath',1)
  ]},
  bomDetachedMamaPounce:{attackerKind:'mass',unarmed:true,targets:STANDING,maxTargetHeight:310,steps:[
    beat('FORME DEJA DETACHEE DE SA BASE',42,frame('bom-mama-detached-ready',-.08),frame('brace'), 'dust','breath',.98),
    beat('RUEE DE LA FORME AUTONOME',31,frame('bom-mama-detached-rush',.47),frame('backstep',.06), 'dust','rush',.95),
    beat('BOND POURSUIVANT',29,frame('bom-mama-detached-pounce',.76,-29),frame('recoil',.13,12), 'wind','rush',.93),
    beat('RECEPTION LOURDE PROPOSEE',31,frame('bom-mama-detached-land',.83),frame('fall',.22,35,.2), 'impact','heavy',.96),
    beat('FORME DETACHEE TOUJOURS UNIQUE',48,frame('bom-mama-detached-held',.61),frame('held',.22,35,.2), 'vignette','silence',1)
  ]},
  sh1MothAbdomenPass:{attackerKind:'flyer',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Heurt d’abdomen documenté pour Floatstinger SH1. Passage et résultat sont composés pour le versus ; aucun toit, parapet, jet acide, chute mortelle ou cycle d’ailes original n’est créé par ces offsets.',steps:[
    beat('ABDOMEN DE LA FORME AILEE',43,frame('sh1-moth-abdomen-approach',.12,-23),frame('watch'), 'wind','wing',.98),
    beat('PASSAGE A COURTE PORTEE',32,frame('sh1-moth-abdomen-pass',.48,-18),frame('brace'), 'wind','rush',.95),
    beat('HEURT DE L ABDOMEN',26,frame('sh1-moth-abdomen-butt',.78,-10),frame('recoil',.17,16), 'impact','heavy',.94),
    beat('CIBLE OCCULTEE AU SOL',34,frame('sh1-moth-abdomen-recover',.59,-29),frame('occluded',.25,35,.2), 'vignette','wing',.97),
    beat('VOL CONSERVE SANS PARAPET AJOUTE',48,frame('sh1-moth-abdomen-hover',.39,-34),frame('held',.25,35,.2), 'fog','silence',1)
  ]},
  cybilArmedPistolButt:{attackerKind:'humanoid',weapon:'pistol',attackerState:'cybil-armed',targets:STANDING,maxTargetHeight:310,
    scopeNote:'Crosse de la Cybil possédée en phase armée uniquement. Le finisher ne tire pas, ne consomme ni ne restaure une balle et ne joue pas l’expulsion du parasite. Après abandon du pistolet, ce montage est bloqué ; les présentations restent désarmées.',steps:[
    beat('PISTOLET ENCORE EQUIPE',41,frame('sh1-cybil-armed-pistol-held',.12),frame('watch'), 'vignette','metal',.98),
    beat('APPROCHE DE LA CROSSE',31,frame('sh1-cybil-armed-pistol-close',.52),frame('brace'), 'vignette','step',.95),
    beat('COUP DE CROSSE DOCUMENTE',25,frame('sh1-cybil-armed-pistol-butt',.72),frame('recoil',.12,12), 'impact','hit',.94),
    beat('COUPE DEVANT LA CHUTE',35,frame('sh1-cybil-armed-pistol-retract',.57),frame('occluded',.21,35,.2), 'blackout','silence',.97),
    beat('ARME GARDEE SANS TIR NI GUERISON',47,frame('sh1-cybil-armed-pistol-held',.43),frame('held',.21,35,.2), 'vignette','breath',1)
  ]},
  eddieFreezerRevolverCut:{attackerKind:'humanoid',weapon:'revolver',targets:STANDING,maxTargetHeight:310,
    stageIds:['prison_meat_locker'],propsAll:['hooks','freezer'],
    scopeNote:'Revolver humain d’Eddie SH2 original 2001, dans la seconde chambre froide. Tir et chute sont masqués ; la carcasse du lieu doit déjà exister. Aucun projectile de gameplay, munition, transfert vers la salle suivante, vapeur ou rail mobile du remake 2024 n’est ajouté.',steps:[
    beat('REVOLVER DANS LA CHAMBRE FROIDE',44,frame('sh2-eddie-freezer-revolver-held',.1),frame('watch'), 'vignette','breath',.98),
    beat('LIGNE DE VISEE HUMAINE',34,frame('sh2-eddie-freezer-revolver-aim',.22),frame('brace'), 'vignette','metal',.95),
    beat('COUPE AVANT LE TIR',28,frame('sh2-eddie-freezer-revolver-offscreen-shot',.22),frame('occluded',.07,9,.12), 'blackout','hit',.94),
    beat('RESULTAT DERRIERE LE PREMIER PLAN',36,frame('sh2-eddie-freezer-revolver-lower',.16),frame('held',.1,35,.12), 'vignette','cloth',.97),
    beat('CROCHETS ET RAILS DU LIEU RESTENT FIXES',48,frame('sh2-eddie-freezer-revolver-held',.08),frame('held',.1,35,.12), 'vignette','silence',1)
  ]},
  mariaFinalMothClosure:{attackerKind:'deity',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Manifestation finale Maria SH2 original 2001 : cage déjà formée, essaim puis appendice noir. Montage versus propre à cette identité ; aucune transformation, apparition de lit, attribution d’une fin narrative ou image de Mary n’est fournie.',steps:[
    beat('CAGE DE MARIA DEJA FORMEE',45,frame('sh2-maria-final-cage-held'),frame('watch'), 'vignette','breath',.98),
    beat('MENACE D ESSAIM DOCUMENTEE',34,frame('sh2-maria-final-moth-threat'),frame('brace'), 'vignette','hiss',.95),
    beat('APPENDICE NOIR A COURTE PORTEE',31,frame('sh2-maria-final-black-tail-grip'),frame('gripped',-.08,-17), 'vignette','creak',.94),
    beat('CADRAGE FERME SUR L EMPRISE',35,frame('sh2-maria-final-black-tail-held'),frame('occluded',-.08,-17,.14), 'blackout','silence',.97),
    beat('CAGE DE MARIA CONSERVEE',49,frame('sh2-maria-final-cage-held'),frame('held',-.08,35,.14), 'vignette','breath',1)
  ]},
  maryFinalBlackTail:{attackerKind:'deity',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Manifestation finale Mary SH2 original 2001, conservée séparément de Maria. L’appendice et l’essaim appartiennent à cette famille de boss ; leur ordre et le résultat sont composés pour le versus. Pas de dialogue, transformation, fin narrative ou pixels empruntés à Maria.',steps:[
    beat('CAGE DE MARY DEJA FORMEE',46,frame('sh2-mary-final-cage-held'),frame('watch'), 'vignette','breath',.98),
    beat('APPENDICE NOIR EN APPROCHE',35,frame('sh2-mary-final-black-tail-reach'),frame('brace'), 'vignette','creak',.95),
    beat('EMPRISE DE LA MANIFESTATION',30,frame('sh2-mary-final-black-tail-grip'),frame('gripped',-.1,-19), 'impact','hit',.94),
    beat('ESSAIM SUGGERE PAR LE CADRAGE',37,frame('sh2-mary-final-moth-closure'),frame('occluded',-.1,-19,.13), 'blackout','hiss',.97),
    beat('CAGE DE MARY CONSERVEE',48,frame('sh2-mary-final-cage-held'),frame('held',-.1,35,.13), 'vignette','silence',1)
  ]},
  gumNewEquippedClub:{attackerKind:'humanoid',weapon:'club',targets:STANDING,maxTargetHeight:310,
    scopeNote:'Gum Head New Type SH4 avec le club déjà équipé par cette fiche versus. Coup armé documenté ; aucun vol d’inventaire, vol de bougie, nouvel objet ou geste du Old Type n’est joué. Le modèle de club et chaque pose restent à produire.',steps:[
    beat('CLUB DEJA DANS LA MAIN',41,frame('sh4-gum-new-club-held',.12),frame('watch'), 'vignette','breath',.98),
    beat('REPLACEMENT DU BRAS ARME',32,frame('sh4-gum-new-club-ready',.47),frame('brace'), 'vignette','creak',.95),
    beat('COUP DU CLUB EQUIPE',27,frame('sh4-gum-new-club-swing',.72),frame('recoil',.12,14), 'impact','heavy',.94),
    beat('CORPS DEVANT LE RESULTAT',35,frame('sh4-gum-new-club-retract',.62),frame('occluded',.2,35,.2), 'blackout','cloth',.97),
    beat('CLUB CONSERVE SANS OBJET CREE',47,frame('sh4-gum-new-club-held',.44),frame('held',.2,35,.2), 'vignette','silence',1)
  ]},
  bottomThreeHeadDive:{attackerKind:'giant',attackerLimbs:2,attackerHead:'three',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Bottom SH4 : deux bras et mains porteurs, deux têtes supérieures et une troisième inversée en bas, sans manteau du Twin Victim. Poursuite et plongeon documentés ; aucun pointage, seconde créature ou disparition de tête n’est ajouté.',steps:[
    beat('TROIS TETES ET DEUX APPUIS',43,frame('sh4-bottom-three-head-support',.1),frame('watch'), 'vignette','breath',.98),
    beat('POURSUITE SUR LES MAINS',31,frame('sh4-bottom-three-head-hand-run',.48),frame('brace'), 'dust','step',.95),
    beat('PLONGEON DU CORPS PROPRE',28,frame('sh4-bottom-three-head-dive',.79),frame('recoil',.15,16), 'impact','heavy',.94),
    beat('MASSE DEVANT LE RESULTAT',34,frame('sh4-bottom-three-head-land',.84),frame('occluded',.22,35,.17), 'vignette','cloth',.97),
    beat('TROIS TETES TOUJOURS DANS LE CADRE',48,frame('sh4-bottom-three-head-support',.64),frame('held',.22,35,.17), 'vignette','silence',1)
  ]},
  cynthiaStandingHairClosure:{attackerKind:'ghost',unarmed:true,targets:STANDING,maxTargetHeight:310,
    scopeNote:'Cynthia Victim 16 SH4 : cheveux qui maintiennent la cible debout, puis coupe de résultat versus. Aucun plaquage, projection, téléportation de Richard, portillon ou passage mural non présents dans le lieu n’est créé ; aucune élimination définitive du fantôme n’est affirmée.',steps:[
    beat('CHEVEUX DE CYNTHIA A PORTEE',43,frame('sh4-cynthia-standing-hair-ready',.1),frame('watch'), 'vignette','breath',.98),
    beat('CHEVEUX VERS LA CIBLE',34,frame('sh4-cynthia-standing-hair-reach',.46),frame('brace'), 'vignette','creak',.95),
    beat('ENTRAVE DEBOUT SANS PROJECTION',31,frame('sh4-cynthia-standing-hair-bind',.66),frame('standing-bound',0,0,1), 'vignette','cloth',.94),
    beat('COUPE SUR LA MEME EMPRISE',36,frame('sh4-cynthia-standing-hair-held',.66),frame('standing-occluded',0,0,.13), 'blackout','silence',.97),
    beat('MEME AXE SANS PORTILLON INVENTE',48,frame('sh4-cynthia-standing-hair-held',.54),frame('standing-held',0,0,.13), 'vignette','breath',1)
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
  downpour_screamer_104:'screamBackGrip',downpour_prisoner_juggernaut_110:'barredHeavyThrow',downpour_bogeyman_115:'hammerSentence',
  sh1_creeper_009:'ankleShadow',sh1_hanged_scratcher_011:'ceilingHook',sh2_mandarin_026:'underGrateGrip',
  sh2_flesh_lip_027:'cageFootLift',sh2_abstract_daddy_028:'organicFrameOcclusion',sh3_pendulum_039:'rotatingShadow',
  sh3_leonard_wolf_048:'waterSurfaceGrip',sh4_hummer_055:'buzzingCameraPass',sh4_wall_man_056:'wallSupportPull',
  sh4_gum_head_old_type_057:'unarmedFurnitureStruggle',
  sh1_incubator_018:'blueTerminalExposure',sh1_incubus_019:'redSuspendedExposure',sh2_creeper_025:'sh2LowShadowBite',
  sh3_god_050:'incompleteBodyFireline',origins_straight_jacket_074:'closedTorsoLegRelease',origins_ariel_078:'tetheredDollKicks',
  origins_memory_of_helen_grady_082:'helenSuspendedWheel',origins_memory_of_richard_grady_083:'richardWallTentacles',
  homecoming_lurker_085:'lurkerLowClawFold',homecoming_smog_087:'smogExposedExhalation',
  bom_air_screamer_121:'bomTalonsCircle',bom_bogeyman_122:'bomHammerStop',bom_butcher_123:'bomCleaverPair',
  bom_double_head_124:'bomCirclingCharge',bom_ghost_125:'bomToxicPresencePass',bom_insane_cancer_126:'bomMassSpaceCrush',
  bom_needler_127:'bomBladeCrossRetreat',bom_pyramid_head_129:'bomGreatKnifeSweep',bom_schism_130:'bomHeadBladeLunge',
  bom_straight_jacket_131:'bomClosedTorsoJet',origins_two_back_080:'originsJoinedTackle',
  homecoming_amnion_hanging_form_097:'amnionSupportedFrontLegs',homecoming_amnion_exposed_form_098:'amnionExposedCloseGrip',
  bom_nurse_128:'bomPipePairStop',bom_tremer_133:'bomTremerLowPressure',bom_fire_guardian_137:'bomFireHandsEmission',
  bom_light_guardian_140:'bomHeartMaceArm',bom_water_guardian_141:'bomAquaticMembers',bom_blood_mama_145:'bomDetachedMamaPounce',
  sh1_floatstinger_016:'sh1MothAbdomenPass',sh1_monster_cybil_017:'cybilArmedPistolButt',sh2_eddie_dombrowski_032:'eddieFreezerRevolverCut',
  sh2_maria_final_manifestation_033:'mariaFinalMothClosure',sh2_mary_final_manifestation_034:'maryFinalBlackTail',
  sh4_gum_head_new_type_058:'gumNewEquippedClub',sh4_bottom_065:'bottomThreeHeadDive',sh4_cynthia_velasquez_victim_16:'cynthiaStandingHairClosure'
});

/* Presentation intent belongs to the exact subject. These world-space edits
 * stage its workbook proposal; they do not draw the absent limb/weapon poses. */
const PRESENTATION_STAGING=Object.freeze({
  sh1_grey_child_005:{id:'grey-child-knife-threshold',entry:18,retreat:48,recoil:6,poses:['knife-close-entry','knife-head-inclination','knife-side-held','seated-support-recovery','knife-return-to-threshold','knife-visible-final-hold','watchful-threshold-retreat']},
  sh1_mumbler_006:{id:'mumbler-low-claws',entry:26,retreat:43,recoil:9,poses:['low-claw-entry','claws-ground-threat','claws-supported-hold','low-body-regains-support','claws-turn-to-shadow','claws-relaxed-final-hold','low-shadow-retreat']},
  sh1_romper_010:{id:'romper-four-supports',entry:57,retreat:61,recoil:11,landing:34,poses:['four-support-landing','torso-threat-on-four-supports','four-support-watch','shoulder-recovery-to-four-supports','four-support-final-watch','side-support-final-hold','four-support-departure']},
  sh3_closer_036:{id:'closer-arms-in-passage',entry:17,retreat:24,recoil:8,poses:['closer-arms-entry','closer-arm-extension-threat','closer-arms-held','closer-arms-regain-support','closer-passage-held','closer-arms-final-hold','closer-arms-withdraw']},
  sh3_nurse_revolver_044:{id:'sh3-revolver-held',entry:12,retreat:30,recoil:8,poses:['revolver-close-entry','revolver-mute-threat','revolver-held-at-side','revolver-visible-recovery','revolver-lowered-final-watch','revolver-visible-final-hold','revolver-retained-exit']},
  sh4_patient_060:{id:'sh4-patient-hammer-weight',entry:20,retreat:29,recoil:10,poses:['patient-hammer-weighted-entry','patient-hammer-mute-threat','patient-hammer-stable-hold','patient-hammer-support-recovery','patient-hammer-final-watch','patient-hammer-final-hold','patient-hammer-weighted-retreat']},
  downpour_screamer_104:{id:'downpour-screamer-presence',entry:29,retreat:40,recoil:9,poses:['screamer-close-entry','screamer-mute-threat-without-wave','screamer-watch','screamer-regains-support','screamer-final-watch','screamer-final-hold','screamer-recedes']},
  downpour_prisoner_juggernaut_110:{id:'downpour-juggernaut-weight',entry:11,retreat:20,recoil:6,poses:['juggernaut-presence-awaiting-bar-pose','juggernaut-fist-threat','juggernaut-weight-stable','juggernaut-weight-recovery','juggernaut-final-watch','juggernaut-weight-final-hold','juggernaut-weight-retreat']},
  downpour_bogeyman_115:{id:'downpour-hammer-weight',entry:15,retreat:26,recoil:7,poses:['hammer-raised-entry','hammer-mute-threat','hammer-weight-stable','hammer-retained-recovery','hammer-lowered-final-watch','hammer-retained-final-hold','hammer-weighted-exit']},
  sh1_creeper_009:{id:'sh1-creeper-six-legs',entry:41,retreat:70,recoil:4,poses:['six-leg-fissure-entry','six-leg-carapace-turn','six-leg-antennae-watch','six-leg-righting-recovery','six-leg-low-flightless-retreat','six-leg-final-stillness','six-leg-fissure-departure']},
  sh1_hanged_scratcher_011:{id:'sh1-scratcher-ceiling-claws',entry:0,retreat:0,recoil:0,poses:['ceiling-claws-descent-awaiting-support','ceiling-claws-scratch-without-wave','ceiling-claws-locked','ceiling-claws-rehook-recovery','ceiling-pipe-retreat','ceiling-claws-final-drop','ceiling-claws-support-ascent']},
  sh2_mandarin_026:{id:'sh2-mandarin-under-grate',entry:0,retreat:0,recoil:0,exitFade:true,poses:['under-grate-hands-entry','under-grate-three-muted-contacts','under-grate-suspended-watch','under-grate-hand-rehook','under-grate-hands-retract','under-grate-final-detachment','under-grate-departure']},
  sh2_flesh_lip_027:{id:'sh2-flesh-lip-2001-cage',entry:0,retreat:0,recoil:0,exitFade:true,poses:['cage-2001-supported-descent','cage-2001-frame-tinkle','cage-2001-contracted-hold','cage-2001-support-recovery','cage-2001-supported-rise','cage-2001-final-stillness','cage-2001-support-ascent']},
  sh2_abstract_daddy_028:{id:'sh2-organic-frame-weight',entry:16,retreat:24,recoil:6,poses:['organic-frame-doorway-entry','organic-frame-muted-inclination','organic-frame-stable-watch','organic-frame-regains-feet','organic-frame-doorway-retreat','organic-frame-final-stillness','organic-frame-whole-body-exit']},
  sh3_pendulum_039:{id:'sh3-pendulum-two-torsos',entry:23,retreat:43,recoil:5,landing:63,roundDip:16,ascent:76,poses:['two-torso-rotation-descent','two-torso-rotation-noise-without-wave','two-torso-slow-rotation','two-torso-points-support-recovery','two-torso-final-rotation','two-torso-points-final-rest','two-torso-rotating-ascent']},
  sh3_leonard_wolf_048:{id:'sh3-leonard-water-presence',entry:0,retreat:0,recoil:5,exitFade:true,poses:['water-ripple-emergence-awaiting-basin','water-shoulder-ripple-without-hit','water-torso-arms-watch','water-surface-recovery-awaiting-basin','water-basin-centre-watch','water-surface-final-stillness','water-back-submerge-awaiting-basin']},
  sh4_hummer_055:{id:'sh4-hummer-small-flight',entry:48,retreat:61,recoil:8,landing:37,roundDip:14,ascent:83,poses:['small-wing-background-entry','small-wing-acceleration-without-wave','small-wing-unstable-hover','small-wing-short-drop-recovery','small-wing-final-circle','small-wing-final-ground-rest','small-wing-ceiling-departure']},
  sh4_wall_man_056:{id:'sh4-wall-man-fixed-torso',entry:0,retreat:0,recoil:0,exitFade:true,poses:['wall-torso-emergence-awaiting-support','wall-single-arm-muted-threat','wall-torso-hands-held','wall-torso-partial-retraction-recovery','wall-torso-slow-retraction','wall-torso-final-retraction','wall-torso-support-retreat']},
  sh4_gum_head_old_type_057:{id:'sh4-old-gum-head-empty-hands',entry:35,retreat:39,recoil:12,landing:34,ascent:27,poses:['old-type-cornice-empty-hand-landing','old-type-upper-body-sway','old-type-low-empty-hands-watch','old-type-seated-rise-recovery','old-type-cornice-retreat','old-type-flexed-final-rest','old-type-platform-ascent']},
  sh1_incubator_018:{id:'sh1-incubator-blue-standing-light',entry:0,retreat:0,recoil:0,exitFade:true,poses:['incubator-standing-light-appearance','incubator-muted-light-pulse','incubator-relaxed-arms-held','incubator-unstable-light-recovery','incubator-final-background-light','incubator-final-light-extinction','incubator-immobile-light-fade']},
  sh1_incubus_019:{id:'sh1-incubus-red-suspended-wings',entry:0,retreat:0,recoil:0,exitFade:true,poses:['incubus-wings-emerge-suspended','incubus-muted-wing-discharge','incubus-wings-open-held','incubus-suspended-flight-recovery','incubus-final-suspended-circle','incubus-relaxed-wings-final-fall','incubus-wings-fold-in-darkness']},
  sh2_creeper_025:{id:'sh2-creeper-six-leg-scale',entry:31,retreat:58,recoil:4,poses:['sh2-six-leg-fissure-entry','sh2-six-leg-carapace-turn','sh2-six-leg-antennae-watch','sh2-six-leg-righting-recovery','sh2-six-leg-low-retreat','sh2-six-leg-final-rest','sh2-six-leg-fissure-departure']},
  sh3_god_050:{id:'sh3-god-incomplete-body-heights',entry:0,retreat:0,recoil:0,exitFade:true,poses:['god-incomplete-mass-appearance','god-muted-hand-embers','god-high-body-arm-held','god-low-to-high-body-recovery','god-final-body-background-embers','god-low-body-final-collapse','god-immobile-light-recedes']},
  origins_straight_jacket_074:{id:'origins-closed-torso-legs',entry:19,retreat:0,recoil:8,outroHold:true,poses:['closed-torso-unsteady-entry','closed-torso-muted-threat','closed-torso-stable-support','closed-torso-lowered-recovery','closed-torso-relaxed-final-watch','closed-torso-final-side-rest','closed-torso-held-result']},
  origins_ariel_078:{id:'origins-ariel-tethered-doll',entry:0,retreat:0,recoil:0,outroHold:true,poses:['ariel-tethered-inverted-entry','ariel-tethered-muted-tension','ariel-tethered-support-held','ariel-tethered-support-recovery','ariel-tethered-final-held','ariel-tethered-final-rest','ariel-tethered-result-held']},
  origins_memory_of_helen_grady_082:{id:'origins-helen-cage-cables',entry:0,retreat:0,recoil:0,poses:['helen-cage-wheel-reveal','helen-cage-muted-wheel-threat','helen-cage-cables-stable','helen-cage-cables-recovery','helen-cage-wheel-final-stop','helen-cage-final-mechanism-stop','helen-cage-suspended-result-held']},
  origins_memory_of_richard_grady_083:{id:'origins-richard-wall-neck',entry:0,retreat:0,recoil:0,poses:['richard-wall-neck-entry','richard-wall-muted-neck-threat','richard-wall-head-extended','richard-wall-neck-recovery','richard-wall-head-final-held','richard-wall-head-final-rest','richard-wall-attached-result-held']},
  homecoming_lurker_085:{id:'homecoming-lurker-low-claws',entry:29,retreat:35,recoil:7,poses:['lurker-water-edge-crawl-awaiting-water','lurker-low-claw-muted-threat','lurker-low-claw-support-held','lurker-low-body-support-recovery','lurker-watchful-low-retreat','lurker-final-side-rest','lurker-watchful-low-departure']},
  homecoming_smog_087:{id:'homecoming-smog-ribs-lungs',entry:12,retreat:0,recoil:7,outroHold:true,poses:['smog-lungs-lit-ribs-entry','smog-ribs-muted-threat','smog-stable-body-watch','smog-low-body-recovery','smog-relaxed-ribs-final-watch','smog-final-body-rest','smog-relaxed-ribs-result-held']},
  bom_air_screamer_121:{id:'bom-air-room-circle-talons',entry:39,retreat:34,recoil:7,landing:46,roundDip:14,ascent:64,poses:['bom-wing-room-circle-entry','bom-hover-talons-muted-threat','bom-wing-stable-hover','bom-wing-height-recovery','bom-wing-high-final-circle','bom-wing-final-support-rest','bom-wing-high-departure']},
  bom_bogeyman_122:{id:'bom-hammer-target-weight',entry:24,retreat:0,recoil:7,outroHold:true,poses:['bom-hammer-target-entry','bom-hammer-muted-threat','bom-hammer-stable-watch','bom-hammer-weight-recovery','bom-hammer-relaxed-final-watch','bom-hammer-final-body-rest','bom-hammer-held-result']},
  bom_butcher_123:{id:'bom-great-cleaver-close-cuts',entry:17,retreat:0,recoil:8,outroHold:true,poses:['bom-cleaver-hand-reposition-entry','bom-cleaver-muted-threat','bom-cleaver-stable-watch','bom-cleaver-low-body-recovery','bom-cleaver-relaxed-final-watch','bom-cleaver-final-body-rest','bom-cleaver-held-result']},
  bom_double_head_124:{id:'bom-dog-circling-appuis',entry:37,retreat:43,recoil:9,poses:['bom-dog-circle-entry','bom-dog-split-head-muted-threat','bom-dog-appuis-watch','bom-dog-low-appuis-recovery','bom-dog-watchful-final-retreat','bom-dog-final-side-rest','bom-dog-watchful-departure']},
  bom_ghost_125:{id:'bom-toxic-presence-drift',entry:18,retreat:0,recoil:0,roundDim:.4,finalFade:true,outroHold:true,poses:['bom-toxic-presence-opening-entry','bom-toxic-presence-muted-threat','bom-toxic-presence-suspended-watch','bom-toxic-presence-partial-return','bom-toxic-presence-final-background','bom-toxic-presence-final-dissipation','bom-toxic-presence-background-held']},
  bom_insane_cancer_126:{id:'bom-mass-with-final-defeat-only-explosion',entry:13,retreat:0,recoil:6,outroHold:true,poses:['bom-mass-room-entry','bom-mass-muted-threat','bom-mass-stable-watch','bom-mass-lowered-support-recovery','bom-mass-relaxed-final-watch','bom-mass-final-collapse-explosion-awaiting-frames','bom-mass-held-result']},
  bom_needler_127:{id:'bom-four-blades-oblique-retreat',entry:26,retreat:38,recoil:8,poses:['bom-four-blades-door-entry','bom-four-blades-muted-threat','bom-four-blades-appuis-watch','bom-four-blades-low-recovery','bom-four-blades-watchful-retreat','bom-four-blades-final-side-rest','bom-four-blades-oblique-departure']},
  bom_pyramid_head_129:{id:'bom-great-knife-lateral-weight',entry:16,retreat:0,recoil:6,outroHold:true,poses:['bom-great-knife-first-entry','bom-great-knife-muted-threat','bom-great-knife-stable-watch','bom-great-knife-low-body-recovery','bom-great-knife-relaxed-final-watch','bom-great-knife-final-body-rest','bom-great-knife-held-result']},
  bom_schism_130:{id:'bom-head-blade-forward-axis',entry:22,retreat:0,recoil:8,outroHold:true,poses:['bom-head-blade-noise-entry','bom-head-blade-muted-threat','bom-head-blade-stable-watch','bom-head-blade-low-body-recovery','bom-head-blade-relaxed-final-watch','bom-head-blade-final-body-rest','bom-head-blade-held-result']},
  bom_straight_jacket_131:{id:'bom-closed-torso-acid-jet',entry:12,retreat:0,recoil:7,outroHold:true,poses:['bom-closed-torso-contracted-entry','bom-closed-torso-muted-threat','bom-closed-torso-stable-watch','bom-closed-torso-low-body-recovery','bom-closed-torso-relaxed-final-watch','bom-closed-torso-final-body-rest','bom-closed-torso-held-result']},
  origins_two_back_080:{id:'origins-two-back-joined-corporeal',entry:17,retreat:0,recoil:7,outroHold:true,poses:['origins-joined-bodies-tense-entry','origins-joined-bodies-muted-threat','origins-joined-bodies-stable-watch','origins-joined-bodies-low-recovery','origins-joined-bodies-relaxed-final-watch','origins-joined-bodies-final-rest','origins-joined-bodies-held-result']},
  homecoming_amnion_hanging_form_097:{id:'hc-amnion-hanging-supported-members',entry:0,retreat:0,recoil:0,outroHold:true,poses:['hc-amnion-hanging-supports-entry','hc-amnion-hanging-muted-threat','hc-amnion-hanging-supports-held','hc-amnion-hanging-supports-recovery','hc-amnion-hanging-final-supports','hc-amnion-hanging-final-collapse','hc-amnion-hanging-held-result']},
  homecoming_amnion_exposed_form_098:{id:'hc-amnion-exposed-supported-members',entry:0,retreat:0,recoil:0,outroHold:true,poses:['hc-amnion-exposed-supports-entry','hc-amnion-exposed-muted-threat','hc-amnion-exposed-supports-held','hc-amnion-exposed-supports-recovery','hc-amnion-exposed-final-supports','hc-amnion-exposed-final-collapse','hc-amnion-exposed-held-result']},
  bom_nurse_128:{id:'bom-nurse-metal-pipe-stop',entry:14,retreat:0,recoil:8,outroHold:true,poses:['bom-nurse-pipe-floor-entry','bom-nurse-pipe-muted-threat','bom-nurse-pipe-stable-watch','bom-nurse-pipe-low-recovery','bom-nurse-pipe-relaxed-final-watch','bom-nurse-pipe-final-rest','bom-nurse-pipe-held-result']},
  bom_tremer_133:{id:'bom-tremer-low-body',entry:24,retreat:36,recoil:3,poses:['bom-tremer-low-pulse-entry','bom-tremer-low-muted-threat','bom-tremer-low-held','bom-tremer-low-contraction-recovery','bom-tremer-low-final-retreat','bom-tremer-low-final-rest','bom-tremer-low-withdrawal']},
  bom_fire_guardian_137:{id:'bom-fire-guardian-hand-origin',entry:0,retreat:0,recoil:5,outroHold:true,poses:['bom-fire-mass-rise-entry','bom-fire-hands-muted-threat','bom-fire-stable-appuis','bom-fire-low-appui-recovery','bom-fire-relaxed-final-watch','bom-fire-final-body-rest','bom-fire-held-result']},
  bom_light_guardian_140:{id:'bom-light-guardian-heart-and-arm',entry:16,retreat:0,recoil:6,outroHold:true,poses:['bom-light-heart-arm-entry','bom-light-heart-muted-threat','bom-light-mace-arm-stable','bom-light-mace-arm-low-recovery','bom-light-heart-relaxed-final-watch','bom-light-final-body-rest','bom-light-held-result']},
  bom_water_guardian_141:{id:'bom-water-guardian-aquatic-body',entry:0,retreat:0,recoil:0,outroHold:true,poses:['bom-water-members-emergence-awaiting-water','bom-water-members-muted-threat','bom-water-members-surface-held','bom-water-members-surface-recovery','bom-water-members-final-surface-held','bom-water-members-final-submerge','bom-water-members-held-result']},
  bom_blood_mama_145:{id:'bom-blood-mama-detached-pounce',entry:21,retreat:0,recoil:7,outroHold:true,poses:['bom-mama-detached-entry','bom-mama-detached-muted-threat','bom-mama-detached-stable-watch','bom-mama-detached-low-recovery','bom-mama-detached-relaxed-final-watch','bom-mama-detached-final-rest','bom-mama-detached-held-result']},
  sh1_floatstinger_016:{id:'sh1-moth-abdomen-and-flight',entry:31,retreat:42,recoil:8,landing:30,roundDip:17,ascent:42,poses:['sh1-moth-abdomen-flying-entry','sh1-moth-abdomen-muted-threat','sh1-moth-abdomen-hover-held','sh1-moth-abdomen-height-recovery','sh1-moth-abdomen-final-watch','sh1-moth-abdomen-final-ground-fall-awaiting-frames','sh1-moth-abdomen-horizontal-departure']},
  sh1_monster_cybil_017:{id:'sh1-cybil-runtime-weapon',entry:15,retreat:0,recoil:9,outroHold:true,
    poses:['sh1-cybil-armed-pistol-entry','sh1-cybil-armed-pistol-muted-threat','sh1-cybil-armed-pistol-watch','sh1-cybil-armed-pistol-recovery','sh1-cybil-armed-pistol-final-watch','sh1-cybil-armed-pistol-final-loss-no-cure','sh1-cybil-armed-pistol-held-result'],
    unarmedPoses:['sh1-cybil-unarmed-entry','sh1-cybil-unarmed-muted-threat','sh1-cybil-unarmed-watch','sh1-cybil-unarmed-recovery','sh1-cybil-unarmed-final-watch','sh1-cybil-unarmed-final-loss-no-cure','sh1-cybil-unarmed-held-result']},
  sh2_eddie_dombrowski_032:{id:'sh2-eddie-revolver-human',entry:15,retreat:0,recoil:9,outroHold:true,poses:['sh2-eddie-revolver-entry-awaiting-freezer','sh2-eddie-revolver-muted-threat','sh2-eddie-revolver-watch','sh2-eddie-revolver-human-recovery','sh2-eddie-revolver-final-lowered','sh2-eddie-revolver-human-final-loss','sh2-eddie-revolver-held-result']},
  sh2_maria_final_manifestation_033:{id:'sh2-maria-final-cage-identity',entry:0,retreat:0,recoil:0,outroHold:true,poses:['sh2-maria-final-cage-reveal-already-formed','sh2-maria-final-cage-muted-threat','sh2-maria-final-cage-hover-held','sh2-maria-final-cage-support-recovery','sh2-maria-final-cage-final-watch','sh2-maria-final-cage-terminal-fall-awaiting-frames','sh2-maria-final-cage-held-result']},
  sh2_mary_final_manifestation_034:{id:'sh2-mary-final-cage-identity',entry:0,retreat:0,recoil:0,outroHold:true,poses:['sh2-mary-final-cage-reveal-already-formed','sh2-mary-final-cage-muted-threat','sh2-mary-final-cage-hover-held','sh2-mary-final-cage-support-recovery','sh2-mary-final-cage-final-watch','sh2-mary-final-cage-terminal-fall-awaiting-frames','sh2-mary-final-cage-held-result']},
  sh4_gum_head_new_type_058:{id:'sh4-gum-new-already-equipped-club',entry:21,retreat:0,recoil:8,outroHold:true,poses:['sh4-gum-new-club-entry','sh4-gum-new-club-muted-threat','sh4-gum-new-club-stable-watch','sh4-gum-new-club-support-recovery','sh4-gum-new-club-final-watch','sh4-gum-new-club-final-body-rest','sh4-gum-new-club-held-result']},
  sh4_bottom_065:{id:'sh4-bottom-three-head-two-hands',entry:19,retreat:0,recoil:8,outroHold:true,poses:['sh4-bottom-three-head-hand-entry','sh4-bottom-three-head-muted-threat','sh4-bottom-three-head-support-watch','sh4-bottom-three-head-hand-recovery','sh4-bottom-three-head-final-watch','sh4-bottom-three-head-final-body-rest','sh4-bottom-three-head-held-result']},
  sh4_cynthia_velasquez_victim_16:{id:'sh4-cynthia-hair-standing-axis',entry:17,retreat:0,recoil:0,roundDim:.2,outroHold:true,poses:['sh4-cynthia-standing-hair-entry','sh4-cynthia-standing-hair-muted-threat','sh4-cynthia-standing-hair-watch','sh4-cynthia-standing-hair-low-recovery','sh4-cynthia-standing-hair-final-watch','sh4-cynthia-standing-hair-final-contained-awaiting-frames','sh4-cynthia-standing-hair-held-result']}
});
const PRESENTATION_POSE_INDEX=Object.freeze({intro:0,taunt:1,winRound:2,loseRound:3,winMatch:4,loseMatch:5,outro:6});
function presentationStaging(actor) {
  const staging=PRESENTATION_STAGING[dataOf(actor).id];
  if(!staging?.unarmedPoses)return staging;
  const state=cybilWeaponState(actor);
  return state==='armed'?staging:state==='unarmed'?{...staging,id:staging.id+'-unarmed',poses:staging.unarmedPoses}:null;
}

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
function hasCeiling(stage,set){
  const bitmap=STAGE_BITMAPS[stage?.id];
  if(bitmap){
    if(bitmap.stageId!==stage.id||bitmap.source!==stage.source)return false;
    // A full replacement owns the visible geometry. Neither its scene name nor
    // inherited procedural motifs may invent a support absent from its contract.
    if(bitmap.mode==='replace')return bitmap.geometry?.ceiling===true;
    if(bitmap.mode!=='overlay'||bitmap.geometry?.ceiling===false)return false;
  }
  return [...set].some(p=>/ceiling|tunnel|corridor|hallway|ward|room|nave/.test(p));
}

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
  if(!anatomyMatches(recipe,a))return blocked('Anatomie du sujet incompatible avec sa séquence exacte.',definition.id);
  if(recipe.unarmed&&a.visual?.weapon)return blocked('Cette variante exige ses membres sans arme ajoutée.',definition.id);
  if(recipe.weapon&&a.visual?.weapon!==recipe.weapon)return blocked('Arme exacte absente de cette variante.',definition.id);
  if(recipe.attackerState==='cybil-armed'&&cybilWeaponState(attacker)!=='armed')return blocked('Le pistolet de Cybil est abandonné ou sa phase armée n’est pas confirmée.',definition.id);
  if((recipe.propsAny||recipe.propsAll||recipe.stageIds||recipe.needsCeiling)&&(!STAGE_REFERENCES[stage?.id]||STAGE_REFERENCES[stage.id].source!==stage.source||stage?.reference?.blocked))return blocked('Lieu non confirmé pour cet appui ou cet accessoire.',definition.id);
  if(recipe.stageIds&&!recipe.stageIds.includes(stage.id))return blocked('Pièce exacte requise absente de ce lieu.',definition.id);
  const set=motifs(stage);
  if(recipe.propsAll&&!recipe.propsAll.every(prop=>set.has(prop)))return blocked('Premier plan requis absent du lieu.',definition.id);
  if(recipe.propsAny&&!recipe.propsAny.some(prop=>set.has(prop)))return blocked('Premier plan requis absent du lieu.',definition.id);
  if(recipe.needsCeiling&&!hasCeiling(stage,set))return blocked('Appui de plafond absent du lieu.',definition.id);
  const steps=compileRecipe(recipe,definition.type);
  return {allowed:true,id:definition.id,ownerId:a.id,source:a.source,type:definition.type,recipeId,steps,duration:steps.at(-1).to,
    description:ref.proposals.finisher.description,scopeNote:recipe.scopeNote||null,referenceIds:[...(ref.referenceIds||[])],
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
    description:stageBased?recipe.description:ref.proposals.finisher.description,scopeNote:recipe.scopeNote||null,referenceIds:[...(ref.referenceIds||[])],
    adaptationStatus:'adaptation-versus-scripted',fidelity:'original-versus-staging',artStatus:'contextual-images-missing',
    requirements:{targets:[...recipe.targets],props:[...(recipe.props||recipe.propsAll||[])],propsAny:[...(recipe.propsAny||[])],stageIds:[...(recipe.stageIds||[])],weapon:recipe.weapon||null,
      attackerState:recipe.attackerState||null,
      attackerKind:recipe.attackerKind||null,attackerLimbs:recipe.attackerLimbs||null,attackerHead:recipe.attackerHead||null,unarmed:!!recipe.unarmed,
      needsCeiling:!!recipe.needsCeiling,zone:recipe.zone||'combat-space',decisiveMatchOnly:true},
    beats:steps.map(s=>({label:s.label,from:s.from,to:s.to,attackerPose:s.attacker.pose,targetPose:s.target.pose,effect:s.effect,sound:s.sound,
      attacker:{...s.attacker},target:{...s.target},camera:s.camera}))};
}

export function lorePresentation(actor,key) {
  const data=dataOf(actor),ref=sourceOf(actor),proposal=proposalFor(actor,key);
  const contextId=`${data.id}:${proposalKey(key)}`;
  const recipe=RECIPES[FIGHTER_RECIPES[data.id]],staging=presentationStaging(actor);
  return {ownerId:data.id,source:ref?.source,contextId,clipKey:`${key}@${contextId}`,name:proposal?.name||data.name||'',description:proposal?.description||'',referenceIds:[...(ref?.referenceIds||[])],
    adaptationStatus:proposal?.status||'bloque-reference',bodyKind:bodyProfile(data).kind,
    authored:ref?.source===data.source&&Object.hasOwn(PRESENTATION_POSE_INDEX,key)&&approvedProposal(proposal)&&Boolean(recipe)&&(!recipe.attackerState||Boolean(staging))&&(!recipe.weapon||data.visual?.weapon===recipe.weapon)&&(!recipe.unarmed||!data.visual?.weapon)&&anatomyMatches(recipe,data),
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
  const staging=presentationStaging(actor);
  if(staging&&ref.stagingId===staging.id){
    const pose=staging.poses[PRESENTATION_POSE_INDEX[key]];
    if(key==='intro')return {x:locomotion?-facing*staging.entry*(1-ease(p)):0,
      y:locomotion&&combatPolicy(actor).canJump!==false&&staging.landing?-staging.landing*(1-ease(p)):0,
      alpha:clamp(p*4),pose};
    if(key==='loseRound')return {x:locomotion?-facing*staging.recoil*Math.sin(p*Math.PI):0,
      y:locomotion&&combatPolicy(actor).canJump!==false?(staging.roundDip||0)*Math.sin(p*Math.PI):0,alpha:1-(staging.roundDim||0)*Math.sin(p*Math.PI),
      pose:p<.6?pose:pose+'-ready'};
    if(key==='loseMatch'&&staging.finalFade)return {x:0,y:0,alpha:1-ease(p),pose};
    if(key==='outro'&&staging.outroHold)return {...neutral(),pose};
    if(key==='outro'&&(locomotion||staging.exitFade))return {x:locomotion?-facing*staging.retreat*ease(p):0,
      y:locomotion&&combatPolicy(actor).canJump!==false?-(staging.ascent||0)*ease(p):0,alpha:1-clamp((p-.6)/.4),pose};
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
    case 'blue-exposure':case 'red-exposure':{
      const rgb=sample.effect==='blue-exposure'?'128,169,223':'207,102,85';
      // One smooth exposure per authored beat, softened further by reduced
      // motion. This is compositing light, never a new creature image or hitbox.
      const exposure=(reducedMotion?.11:.23)*power;
      const glow=ctx.createRadialGradient(focusX,focusY-90,15,focusX,focusY-90,width*.65);
      glow.addColorStop(0,`rgba(${rgb},${exposure})`);glow.addColorStop(1,`rgba(${rgb},0)`);
      ctx.fillStyle=glow;ctx.fillRect(0,82,width,height-174);break;
    }
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
