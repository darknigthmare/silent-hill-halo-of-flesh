/** Phase-one production catalogue. Documentation only; never imported by the game. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {ROSTER, STAGES, SOURCE_META, createCombatProfile, STAGE_EVENTS, STAGE_HAZARDS, MOVESET_KEYS} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {validateStageBitmap} from '../src/stage-bitmaps.js';
import {PRESENTATION_KEYS} from '../src/sprite-poses.js';
import {nonDamagingStagger} from '../src/combat-reference-policy.js';
import {cinematicSummary,lorePresentation} from '../src/lore-cinematics.js';
import {SOURCE_TIMING_SCHEMA,SOURCE_TIMING_BATCH_SCHEMA,SOURCE_TIMING_REVIEW_SCHEMA} from './source-timing.mjs';

export const PLAN_SCHEMA = 1;
export const BASE_COMMIT = 'd11cf4e8c03668aa535631cb2ef60767ee51e75b';
export const IMPLEMENTATION_REVISION = 'excel-runtime-integration-2026-10-17';
export const PRESENTATION_CLIPS = Object.freeze({intro:'intro',taunt:'taunt',winRound1:'winRound',loseRound1:'loseRound',winMatch:'winMatch',loseMatch:'loseMatch',outro:'outro'});
export const PROPOSAL_KEYS = ['intro','taunt','winRound1','loseRound1','winMatch','loseMatch','outro','super','finisher'];
export const CORE_POSES = ['idle','walk','crouch','jump','guard','dodge','hurt','knockdown','ko','phase'];
export const COMBAT_ROLES = ['combatant','stationary-boss','multi-body','scripted-encounter','environmental-obstacle','noncombatant','unverified'];
const root = fileURLToPath(new URL('../', import.meta.url));
const planDir = path.join(root, 'docs/production');
const stageAnimationBaseline=JSON.parse(await fs.readFile(path.join(planDir,'research/stage-animation-baseline.json'),'utf8')).rows;
const text = value => typeof value === 'string' ? value : value == null ? '' : Array.isArray(value) ? value.map(text).join(' / ') : JSON.stringify(value);
const genitiveName = name => /^[aeiouyàâéèêëîïôûùüœ]/i.test(name)?`d’${name}`:`de ${name}`;
const unique = values => [...new Set(values.filter(Boolean))];
const sha256 = value => createHash('sha256').update(value).digest('hex');
const isBlocked = status => /bloqu|unverified|unconfirmed|non.vérif|non.verif|reference-required|unresolved|unknown|[àa].v[ée]rifier|[àa].r[ée]f[ée]rencer|a.confirmer|non.confirme|documentation.partielle|a.reconcilier/i.test(status || '');
const isNonCombat = status => /non.combat|non.applicable|non.hostil|passi[ fv]|set.piece|environment|obstacle|scenery/i.test(status || '');
const productionState = (locked,noncombat,proposalStatus='') => locked||isBlocked(proposalStatus)?'À référencer':noncombat||isNonCombat(proposalStatus)?'Rôle à décider':'À produire';
const RESOLVED_NONCOMBAT_ROLES = new Set(['noncombatant','environmental-obstacle','scripted-encounter']);
const FILM_2006_EDITION = 'Silent Hill (2006, film de Christophe Gans)';
const FILM_2012_EDITION = 'Silent Hill: Revelation (2012, film de Michael J. Bassett)';
// Each film identity has its own reviewed source-role decision and exact edition.
// Their playable versus adaptation is not an original interactive film combat.
const SCRIPTED_FILM_ADAPTATIONS = new Map([
  ...['film_armless_man_170','film_dark_nurse_171','film_grey_child_film_172',
    'film_creeper_swarm_film_173','film_colin_the_janitor_174','film_red_pyramid_film_175'].map(id=>[id,FILM_2006_EDITION]),
  ...['film_mannequin_monster_176','film_missionary_revelation_177'].map(id=>[id,FILM_2012_EDITION])
]);
function playableRoleDecision(decision,fighter){
  return decision?.adaptationScope==='versus-scripted'&&decision.decision==='scripted-encounter'&&
    fighter?.source==='film'&&SCRIPTED_FILM_ADAPTATIONS.has(fighter.id)&&
    decision.edition===SCRIPTED_FILM_ADAPTATIONS.get(fighter.id);
}
const roleNames = {noncombatant:'non-combattant', 'environmental-obstacle':'obstacle du décor', 'scripted-encounter':'rencontre scénarisée sans combat autonome'};
const roleDescription=decision=>decision.adaptationScope==='versus-scripted'?'figure de scène adaptée au versus':roleNames[decision.decision];
const validReviewDate = value => typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const poseNames = {idle:'Repos',walk:'Locomotion',crouch:'Posture basse',jump:'Déplacement aérien',guard:'Réaction défensive',dodge:'Évitement',hurt:'Réaction à un impact',knockdown:'Chute de manche',ko:'Défaite',phase:'Changement de phase'};
const presentationNames = {intro:'Introduction',taunt:'Attitude / provocation',winRound1:'Victoire première manche',loseRound1:'Défaite première manche',winMatch:'Pose de victoire finale',loseMatch:'Pose de défaite finale',outro:'Sortie de combat'};
const presentationTriggers = {intro:'Avant la première manche, commandes suspendues',taunt:'Commande P (sujet I), N (sujet II), bouton tactile ou clic du stick gauche. Annulable par déplacement, garde, attaque ou impact ; aucun dégât ni gain de jauge.',winRound1:'Manche gagnée, dont la première, quand le match continue',loseRound1:'Manche perdue ou nulle, dont la première, quand le match continue',winMatch:'Victoire du match confirmée',loseMatch:'Défaite finale sans finisher. Après un finisher, tenir la dernière image de la piste cible.',outro:'Sortie du vainqueur après la pose finale. La cible conserve sa défaite finale.'};
const categoryNames = {normal:'Normal', 'command-normal':'Normal directionnel',aerial:'Attaque aérienne',throw:'Saisie',special:'Technique',counter:'Contre',reversal:'Relèvement',nightmare:'Super',desperation:'Super de désespoir','dodge-attack':'Attaque après évitement'};

export function combineResearch(parts) {
  const combined = {sources:[],fighters:[],stages:[]};
  for (const part of parts) {
    for (const key of Object.keys(combined)) {
      if (!Array.isArray(part[key])) throw new Error(`Research ${key} must be an array.`);
      combined[key].push(...part[key]);
    }
  }
  // Identical sources may be shared across research batches, never conflicting IDs.
  const sources = new Map();
  for (const source of combined.sources) {
    if (sources.has(source.id) && sources.get(source.id).url !== source.url) throw new Error(`Conflicting source ID: ${source.id}`);
    if (!sources.has(source.id)) sources.set(source.id, source);
  }
  combined.sources = [...sources.values()];
  return combined;
}

export function validateResearch(research, roster=ROSTER, stages=STAGES) {
  const errors=[];
  const ids = (items,label) => {
    const seen=new Set();
    for (const item of items) {
      if (!item?.id || seen.has(item.id)) errors.push(`${label}: missing/duplicate ID ${item?.id}`);
      seen.add(item?.id);
    }
    return seen;
  };
  const sourceIds=ids(research.sources,'source'), fighterIds=ids(research.fighters,'fighter'), stageIds=ids(research.stages,'stage');
  const rosterById=new Map(roster.map(f=>[f.id,f]));
  const checkScope=(expected,actual,label)=>{
    for(const id of expected)if(!actual.has(id))errors.push(`${label}: missing ${id}`);
    for(const id of actual)if(!expected.has(id))errors.push(`${label}: unknown ${id}`);
  };
  checkScope(new Set(roster.map(f=>f.id)),fighterIds,'fighter');
  checkScope(new Set(stages.map(s=>s.id)),stageIds,'stage');
  for(const source of research.sources){
    if(!/^https:\/\//.test(source.url || ''))errors.push(`source: missing HTTPS URL ${source.id}`);
    for(const key of ['title','type','scope','consultedAt'])if(!source[key])errors.push(`source ${source.id}: missing ${key}`);
  }
  const checkEvidence=(refs,label)=>{
    if(refs != null && !Array.isArray(refs)){errors.push(`${label}: references must be an array`);return;}
    for(const ref of refs||[])if(!sourceIds.has(ref))errors.push(`${label}: unknown source ${ref}`);
  };
  for(const fighter of research.fighters){
    if(!fighter.identityStatus || !fighter.identityNote)errors.push(`fighter ${fighter.id}: missing identity decision`);
    if(!COMBAT_ROLES.includes(fighter.combatRole))errors.push(`fighter ${fighter.id}: missing/unknown combat role ${fighter.combatRole}`);
    checkEvidence(fighter.referenceIds, fighter.id);
    const decision=fighter.roleDecision;
    if(decision!==undefined){
      const label=`fighter ${fighter.id}: role decision`;
      if(decision?.adaptationScope!==undefined&&!playableRoleDecision(decision,fighter))errors.push(`${label}: unsupported adaptation scope or exact film identity`);
      if(!decision||typeof decision!=='object'||Array.isArray(decision)||!['pending','resolved'].includes(decision.status))errors.push(`${label}: unsupported status`);
      else if(decision.status==='resolved'){
        if(decision.fighterId!==fighter.id||fighter.source!==rosterById.get(fighter.id)?.source)errors.push(`${label}: identity/source mismatch`);
        if(!RESOLVED_NONCOMBAT_ROLES.has(decision.decision)||decision.decision!==fighter.combatRole||isBlocked(fighter.identityStatus))errors.push(`${label}: incompatible role or unresolved identity`);
        if(!fighter.referenceEdition||decision.edition!==fighter.referenceEdition)errors.push(`${label}: exact researched edition required`);
        if(typeof decision.rationale!=='string'||!decision.rationale.trim()||!validReviewDate(decision.reviewedAt))errors.push(`${label}: rationale and valid review date required`);
        if(!Array.isArray(decision.evidence)||!decision.evidence.length||new Set(decision.evidence).size!==decision.evidence.length||decision.evidence.some(id=>typeof id!=='string'||!fighter.referenceIds?.includes(id)))errors.push(`${label}: evidence must belong to this fighter`);
        checkEvidence(decision.evidence,label);
      }
    }
    if(fighter.baseId && !fighterIds.has(fighter.baseId))errors.push(`fighter ${fighter.id}: unknown base ${fighter.baseId}`);
    if(!Array.isArray(fighter.observedMoves) || !Array.isArray(fighter.constraints))errors.push(`fighter ${fighter.id}: missing observations/constraints`);
    for(const observed of fighter.observedMoves||[]){
      checkEvidence(observed.evidence,`${fighter.id} observation`);
      if(!observed.name || !observed.description || !observed.status)errors.push(`fighter ${fighter.id}: incomplete observation`);
      if(!observed.evidence?.length && !isBlocked(observed.status) && !isNonCombat(observed.status))errors.push(`fighter ${fighter.id}: sourced observation without evidence`);
    }
    for(const key of PROPOSAL_KEYS){
      const p=fighter.proposals?.[key];
      if(!p?.name || !p.description || !p.status)errors.push(`fighter ${fighter.id}: missing proposal ${key}`);
      if(p?.status && /^(?:canon|verified|documenté|documente|attesté|atteste|1:1)/i.test(p.status) && !p.evidence?.length)errors.push(`fighter ${fighter.id}: unsupported canonical proposal ${key}`);
      checkEvidence(p?.evidence,`${fighter.id} proposal ${key}`);
      if(Array.isArray(p?.basis))checkEvidence(p.basis,`${fighter.id} proposal ${key} basis`);
    }
  }
  const bases=new Map(research.fighters.map(f=>[f.id,f.baseId]));
  for(const fighter of research.fighters){
    const visited=new Set([fighter.id]);
    let base=fighter.baseId;
    while(base && bases.has(base)){
      if(visited.has(base)){errors.push(`fighter ${fighter.id}: cyclic base ${base}`);break;}
      visited.add(base);base=bases.get(base);
    }
  }
  for(const stage of research.stages){
    if(!stage.locationStatus || !stage.locationNote || !Array.isArray(stage.animations) || !stage.animations.length)errors.push(`stage ${stage.id}: missing location/animation plan`);
    checkEvidence(stage.referenceIds,stage.id);
    for(const a of stage.animations||[]){
      if(!a.name || !a.description || !a.status)errors.push(`stage ${stage.id}: incomplete animation`);
      checkEvidence(a.evidence,`${stage.id} animation`);
      if(a.status && /^(?:canon|verified|documenté|documente|attesté|atteste|1:1)/i.test(a.status) && !a.evidence?.length)errors.push(`stage ${stage.id}: unsupported canonical animation`);
    }
  }
  if(errors.length)throw new Error(errors.join('\n'));
  return true;
}

function referenceEdition(fighter, reference={}) {
  if(reference.referenceEdition)return reference.referenceEdition;
  if (fighter.source==='sh2' && /remake/i.test(fighter.variant||'')) return 'Silent Hill 2 — remake (2024)';
  if (/versus adaptation/i.test(fighter.variant||'')) return `${fighter.game} — forme de versus, édition canonique non établie`;
  if (fighter.variant) return /silent hill/i.test(fighter.variant) ? fighter.variant : `${fighter.game} (${fighter.year}) — ${fighter.variant}`;
  if (/return_to_silent_hill|fused_mattress.*return/.test(fighter.id)) return 'Return to Silent Hill (2026)';
  if (/revelation|mannequin_monster/.test(fighter.id) && fighter.source==='film') return 'Silent Hill: Revelation (2012)';
  if (fighter.source==='film') return 'Silent Hill (2006)';
  return `${fighter.game} (${fighter.year})`;
}
function rowRefs(refs) {return unique(refs||[]).join(', ');}

export function roleDecisionRuntimeCompatible(decision,fighter,profile){
  const policy=profile?.referencePolicy;
  const nativeSlots=profile?.moves&&!Array.isArray(profile.moves)&&
    Object.keys(profile.moves).length===MOVESET_KEYS.length&&
    MOVESET_KEYS.every(key=>Object.hasOwn(profile.moves,key)&&profile.moves[key]?.key===key)&&
    Array.isArray(profile.moveset?.order)&&profile.moveset.order.length===MOVESET_KEYS.length&&
    profile.moveset.order.every((key,index)=>key===MOVESET_KEYS[index]);
  const compatible=Boolean(typeof fighter?.id==='string'&&decision?.status==='resolved'&&decision.fighterId===fighter.id&&
    RESOLVED_NONCOMBAT_ROLES.has(decision.decision)&&policy?.id===fighter.id&&policy.source===fighter.source&&
    policy.edition===decision.edition&&policy.role===decision.decision&&policy.capabilities?.reviewed===true&&
    nativeSlots);
  if(!compatible)return false;
  if(decision.adaptationScope!==undefined)return Boolean(playableRoleDecision(decision,fighter)&&
    policy.adaptationMode==='versus-scripted'&&policy.combatEnabled===true&&
    Object.values(profile.moves).every(move=>typeof move?.enabled==='boolean')&&Object.values(profile.moves).some(move=>move.enabled===true));
  return policy.combatEnabled===false&&policy.canMove===false&&policy.canJump===false&&policy.canDodge===false&&policy.superEnabled===false&&
    Object.values(profile.moves).every(move=>move?.enabled===false);
}

function roleDecisionNote(decision){
  return `Rôle confirmé le ${decision.reviewedAt} : ${roleDescription(decision)} (${decision.edition}). ${decision.rationale} Preuves : ${rowRefs(decision.evidence)}. Cette décision ne valide ni image, ni animation, ni mouvement offensif.`;
}

function stageBitmapProgress(stage){
  const art=STAGE_BITMAPS[stage.id];
  if(!art)return null;
  validateStageBitmap(stage,art);
  return {layers:art.layers.length,files:new Set(art.layers.flatMap(layer=>layer.frames.map(frame=>frame.path))).size,
    layerNames:art.layers.map(layer=>layer.id),mode:art.mode,scene:art.scene||'',
    static:art.layers.every(layer=>new Set(layer.frames.map(frame=>frame.path)).size===1)};
}
function plannedPose(fighter, ref, pose) {
  const base=`Conserver les contraintes de la fiche ${fighter.id}.`;
  if(isBlocked(ref.identityStatus)||ref.combatRole==='unverified')return 'Attendre une référence de cette version avant de dessiner cette pose.';
  if(isNonCombat(ref.identityStatus)||['scripted-encounter','environmental-obstacle','noncombatant'].includes(ref.combatRole))return 'Vérifier le rôle dans la fiche : ne pas forcer une posture de combattant sur une apparition, un obstacle ou un élément de décor.';
  if(ref.combatRole==='stationary-boss'){
    const fixed={
      idle:'Boucle de présence avec ancrage au mur, au plafond ou au support propre à cette forme. Relever le mouvement des parties libres.',
      walk:'Aucune marche libre à supposer. Prévoir un emplacement fixe et mesurer les extensions ou retraits autorisés par le support.',
      crouch:'Ne pas imposer un accroupissement humanoïde. Relever seulement le repli du corps ou des appendices compatible avec son ancrage.',
      jump:'Aucun saut libre à ajouter à ce boss fixe. Une rupture ou un changement de support exige une phase explicitement documentée.',
      guard:'Réaction défensive localisée sans déplacer l’ancrage ; reprise exacte d’une protection ou d’une rétraction seulement si observée.',
      dodge:'Aucune roulade ou esquive translatée. Définir la réponse du boss depuis ses extensions, retraits et fenêtres de vulnérabilité.',
      hurt:'Impact transmis aux parties mobiles tandis que le support reste cohérent. Éviter un recul qui arrache arbitrairement le boss au décor.',
      knockdown:'Affaissement temporaire sur son support, avec reprise possible. La rupture définitive de l’ancrage appartient à une éventuelle séquence finale.',
      ko:'Pose finale propre à cette forme et à son support. Séparer inertie du corps, chute d’accessoires et résultat scénaristique.',
      phase:'Relever chaque phase et son éventuel changement d’ancrage dans cette édition. Ne pas emprunter la phase mobile d’un remake différent.'
    };
    return `${fixed[pose]} ${base}`;
  }
  const plans={
    idle:`Boucle de présence et de respiration propre à ${fighter.name}. Relever appuis, amplitude et orientation sur la version indiquée.`,
    walk:`Cycle d'approche et de retrait ${genitiveName(fighter.name)}, appuis stables. Ne pas remplacer ramper, voler ou glisser par une marche humanoïde.`,
    crouch:`Posture basse ${genitiveName(fighter.name)} seulement si son anatomie et les références la permettent. Sinon prévoir une règle de combat adaptée.`,
    jump:`Relever les bonds, vols ou chutes existants ${genitiveName(fighter.name)}. Un saut générique reste une adaptation à justifier.`,
    guard:`Réponse défensive propre à ${fighter.name} : protection par l'arme, recul ou résistance selon la référence. Pas de garde de boxeur automatique.`,
    dodge:`Évitement ${genitiveName(fighter.name)} depuis la locomotion documentée. Roulade, téléportation et invulnérabilité nécessitent une justification distincte.`,
    hurt:`Réaction ${genitiveName(fighter.name)} à l'impact avec conservation des membres, accessoires et point d'appui. Caler le clip sur le hitstun du moteur.`,
    knockdown:`Chute puis récupération ${genitiveName(fighter.name)} compatible avec une manche suivante. Séparer de sa mort scénaristique.`,
    ko:`Reprendre la proposition de défaite ${fighter.id}:loseMatch. Aucun décès permanent avant une reprise de manche.`,
    phase:`Transition de forme ${genitiveName(fighter.name)} uniquement si elle existe dans cette version. Les seuils de vitalité sont des règles de versus.`
  };
  return `${plans[pose]} ${base}`;
}

function runtimeReferenceNote(profile){
  const policy=profile.referencePolicy;
  if(policy.id==='homecoming_smog_087'&&policy.firearmExposure)return `Smog : seuls le souffle et ses déclinaisons de super sont actifs ; aucun coup ou prise ajoutés. Poumons exposés pendant préparation/activité du souffle ; dégâts des balles multipliés par ${policy.firearmExposure.damageScale} dans le versus. Ce multiplicateur et les fenêtres ne sont pas des mesures de Homecoming ; aucun timing source mesuré.`;
  if(policy.id==='homecoming_needler_088'&&policy.defense?.frontalMelee)return 'Needler : défense frontale des lames contre le contact physique et les balles, y compris silencieuses ; dos, attaque et chute vulnérables. Aucun contre gratuit ; commande d’attente et projection arrière retirées. Fenêtres et exceptions de garde adaptées au versus, sans timings source mesurés.';
  if(policy.id==='sh2_lying_figure_crawling_021')return 'Lying Figure rampante de SH2 original : percussion au sol sans jet acide, sans saisie ni projection arrière. Ne pas emprunter l’attaque à distance de la forme debout ; portée, vitesse et déclinaisons de super adaptées au versus.';
  if(['sh2_maria_final_manifestation_033','sh2_mary_final_manifestation_034'].includes(policy.id))return 'Essaim de Mary/Maria, SH2 original : le projectile applique une entrave locale du versus. La capture source avec lutte pour se libérer n’est pas reproduite ; durée, portée et restrictions ne sont pas des mesures de SH2.';
  const stagger=nonDamagingStagger({id:profile.referencePolicy.id,source:profile.referencePolicy.source},profile.moves.downSpecial);
  if(stagger)return `Coup de sol du Split Worm : 0 dégât de santé, déséquilibre local des cibles au sol ; pas de chip, riposte, vol de vie, jauge ni crédit de dégâts. ${stagger.frames} ticks de déséquilibre et garde accroupie adaptés au versus ; aucun timing source mesuré.`;
  const field=profile.referencePolicy.proximityField;
  if(field)return `Champ passif local d’Incubator : rayon ${field.radius} px, ${field.damage} dégât(s), chute ${field.knockdown} ticks, récupération ${field.cooldown} ticks ; aucune jauge ni combo gratuits. Portée, dégâts et durées adaptés au versus. Décharges bleues, RGB de travail sans palette source certifiée.`;
  if(profile.referencePolicy.id==='sh1_incubus_019')return 'Décharges rouges propres à Incubus ; RGB de travail sans palette source certifiée. Aucun champ passif de proximité emprunté à Incubator.';
  if(profile.referencePolicy.id==='sh3_missionary_047'&&profile.referencePolicy.defense?.frontalVisibleBullets)return 'Défense du Missionary SH3 : balles visibles arrêtées de face en posture disponible ; dos, chute, attaque et tir silencieux restent vulnérables. Aucun contre ni gain de jauge automatique. États et fenêtres adaptés au versus, sans timings source mesurés.';
  const phases=profile.moveset.weaponPhases;
  if(phases?.length){
    const art=SPRITES[profile.referencePolicy.id],missing=phases.filter(p=>!art?.clips[`idle@${profile.referencePolicy.id}:weapon:${p.id}`]);
    return `Phases d’armes : ${phases.map(p=>p.name).join(' → ')}. Ordre séquentiel et récupération verrouillée ; budgets de vitalité, rafales et durées adaptés au versus, sans mesures officielles. Images fixes d’armes : ${phases.length-missing.length}/${phases.length} candidates ; ${missing.length?'à produire : '+missing.map(p=>p.name).join(', '):'comparaison visuelle encore ouverte'}. Aucun emprunt d’image entre armes, ni animation source certifiée.`;
  }
  const ammo=profile.moveset.ammoProfile;
  if(ammo?.disarmBelowHealthRatio)return `Pistolet : ${ammo.capacity} tirs ; abandon après épuisement ou santé strictement sous ${ammo.disarmBelowHealthRatio*100} %. La balle renverse la cible ; dégâts et durée de chute restent ceux du versus. Phase désarmée persistante, balles non tirées conservées mais inutilisables ; raccord de versus sans animation source certifiée.`;
  return '';
}

function applyRuntimeProgress(plan){
  const fighters=new Map(ROSTER.map(f=>[f.id,f])),stages=new Map(STAGES.map(s=>[s.id,s]));
  const profiles=new Map(ROSTER.map(f=>[f.id,createCombatProfile(f)]));
  const summaries=new Map(plan.finishers.map(f=>[f.id,cinematicSummary(f.id)]));
  const resolvedRoles=new Map();
  for(const row of plan.fighters){
    const profile=profiles.get(row.id),p=profile.referencePolicy;
    row.runtimePolicy=p;
    row.roleResolved=roleDecisionRuntimeCompatible(row.roleDecision,fighters.get(row.id),profile);
    if(row.roleResolved){
      resolvedRoles.set(row.id,row.roleDecision);row.identityNote+='\n'+roleDecisionNote(row.roleDecision);
      row.productionStatus='En cours';
    }
    const weaponNote=runtimeReferenceNote(profile);
    if(weaponNote)row.identityNote+='\n'+weaponNote;
    row.enabledMoves=Object.values(profile.moves).filter(m=>m.enabled!==false).length;
    row.identityNote+=`\nMoteur : ${p.combatEnabled?'combat versus autorisé':'combat désactivé'} ; déplacement ${p.canMove?'autorisé':'désactivé'}, saut ${p.canJump?'autorisé':'désactivé'}, esquive ${p.canDodge?'autorisée':'désactivée'}.`;
    if(p.adaptationMode==='versus-scripted')row.identityNote+=' Rencontre scénarisée transposée explicitement en versus.';
    if(row.productionStatus==='À produire')row.productionStatus='En cours';
  }
  for(const row of plan.moves){
    const m=profiles.get(row.fighterId).moves[row.key];
    row.enabled=m.enabled!==false;row.disabledReason=m.disabledReason||'';
    row.canonicalVerification=(row.enabled?'Commande active ; règles de la fiche appliquées.':'Commande désactivée : '+row.disabledReason)+' Animation officielle non vérifiée.';
    const profile=profiles.get(row.fighterId),weaponNote=runtimeReferenceNote(profile);
    if(resolvedRoles.has(row.fighterId)){
      const decision=resolvedRoles.get(row.fighterId);
      row.canonicalVerification+=' '+roleDecisionNote(decision);
      row.target=decision.adaptationScope==='versus-scripted'?
        'Rôle de scène confirmé dans le film exact ; cette commande appartient au prototype de versus. Gestes, dégâts, fenêtres et entrées restent des propositions à comparer à la source, sans combat interactif original revendiqué.':
        `Rôle confirmé comme ${roleNames[decision.decision]}. Ne produire aucune attaque autonome ; vérifier que cette commande reste désactivée. Les chiffres du catalogue sont conservés comme paramètres inertes du versus.`;
      if(row.productionStatus==='Rôle à décider')row.productionStatus='À tester';
    }
    if(weaponNote)row.canonicalVerification+=' '+weaponNote;
    if(m.ammoCost)row.canonicalVerification+=` Consomme ${m.ammoCost} munition(s) ; réserve ${profiles.get(row.fighterId).moveset.ammoProfile?.capacity||0}.`;
    row.target=(row.enabled?'Règle active de versus : ':'Règle inactive : ')+(m.canonicalBasis||'')+'\n'+row.target;
    if(profile.moveset.weaponPhases?.length){
      row.target+='\nParamètres numériques : phase initiale. Variantes jouées : '+profile.moveset.weaponPhases.map(phase=>{
        const move=phase.moves[row.key];
        return `${phase.name} — ${move.name} (${move.projectile?'tir':'contact'}, ${move.startup}/${move.active}/${move.recovery} ticks, dégâts ${move.damage}, portée ${move.reach})`;
      }).join(' ; ')+'. Ces chiffres sont ceux du versus, non des mesures de SH3.';
    }
    if(row.productionStatus==='À produire')row.productionStatus='En cours';
  }
  for(const row of plan.finishers){
    const s=summaries.get(row.id);row.runtimeCinematic=s;
    row.actorTracks=`finisher@${row.id} / finished@${row.id}. Identités et durées synchronisées ; aucune substitution entre finishers.`;
    row.currentSequence=s.authored?s.beats.map(b=>`${b.from}–${b.to} : ${b.label}`).join(' → '):'Aucune chorégraphie automatique autorisée pour cet identifiant.';
    row.existing=s.authored?`Timeline de ${s.duration} ticks, caméra, offsets des acteurs, effets et sons branchés. ${s.beats.length} temps de mise en scène. PNG contextuels absents ; adaptation non certifiée.`:`Séquence non jouée : ${s.reason} PNG contextuels à produire.`;
    if(row.entityType==='Combattant'&&resolvedRoles.has(row.entityId)){
      row.existing+=' '+roleDecisionNote(resolvedRoles.get(row.entityId));
      if(row.productionStatus==='Rôle à décider')row.productionStatus='À produire';
    }
    if(s.authored){
      const r=s.requirements;
      const bodyNames={humanoid:'humanoïde',nurse:'infirmière',child:'petit corps',giant:'géant',pyramid:'corps pyramidal',mannequin:'mannequin',doll:'poupée',flowerhead:'tête florale',quadruped:'quadrupède',insect:'insecte',flyer:'créature volante',mass:'masse',spider:'araignée',fox:'renard'};
      const requirements=[`Corps compatibles : ${r.targets.map(kind=>bodyNames[kind]||kind).join(', ')}`,
        r.weapon?`arme ${r.weapon}`:null,r.props.length?`accessoires ${r.props.join(', ')}`:null,
        r.propsAny.length?`au moins un appui parmi ${r.propsAny.join(', ')}`:null,
        r.needsCeiling?'plafond confirmé requis':null,r.zone==='center'?'cible au centre':r.zone==='edge'?'cible près d’un bord':null].filter(Boolean);
      row.trigger='Victoire décisive uniquement. '+requirements.join(' ; ')+'.';
      if(row.productionStatus==='À produire')row.productionStatus='En cours';
    }
  }
  for(const row of plan.presentations){
    const key=PRESENTATION_CLIPS[row.id.slice(row.fighterId.length+1)],s=lorePresentation(fighters.get(row.fighterId),key),p=profiles.get(row.fighterId).referencePolicy;
    const art=SPRITES[row.fighterId],clip=art?.fighterId===row.fighterId&&art.source===fighters.get(row.fighterId).source?art.clips?.[s.clipKey]:null;
    const exactFrames=clip?.loop===false&&clip.frames?.length&&clip.frames.every(index=>Number.isSafeInteger(index)&&art.frames[index])?clip.frames.map(index=>art.frames[index]):[];
    const contextualImages=new Set(exactFrames.map(frame=>frame.pixelSHA256||frame.sha256||frame.path)).size;
    const imageNotice=contextualImages?`Clip exact non bouclé : ${contextualImages} image${contextualImages>1?'s':''} candidate${contextualImages>1?'s':''} déclarée${contextualImages>1?'s':''}. ${contextualImages===1?'Pose fixe, pas une animation produite. ':''}Chorégraphie artistique complète et comparaison source restent à produire ; aucune durée d’origine mesurée.`:'Images contextuelles à produire.';
    row.runtimePresentation=s;
    row.engineState=`Clé exacte ${s.clipKey}. ${s.authored?'Mise en scène du sujet branchée.':'Hook disponible ; mise en scène propre à produire.'} ${p.combatEnabled?'':'Combat désactivé pour ce rôle. '}${imageNotice}`;
    if(key==='taunt')row.engineState=`${s.clipKey}. ${s.authored?'Attitude jouée':'Hook disponible'}, 66 ticks de maintien versus ; annulable et sensible à la pause. ${imageNotice}`;
    if(resolvedRoles.has(row.fighterId)){
      row.engineState+=' '+roleDecisionNote(resolvedRoles.get(row.fighterId));
      if(row.productionStatus==='Rôle à décider')row.productionStatus='À produire';
    }
    if(s.authored&&row.productionStatus==='À produire')row.productionStatus='En cours';
  }
  for(const row of plan.poses)if(resolvedRoles.has(row.fighterId)){
    const decision=resolvedRoles.get(row.fighterId);
    row.description=(decision.adaptationScope==='versus-scripted'?
      `Pose ${poseNames[row.pose]} proposée pour adapter cette figure de scène au versus ; conserver son anatomie et ses accessoires de cette édition, sans prétendre à une posture de jeu originale. `:
      `Rôle confirmé comme ${roleNames[decision.decision]}. Ne pas forcer une posture de combattant ; relever seulement la présence ou interaction autorisée par la référence. `)+roleDecisionNote(decision);
    if(row.productionStatus==='Rôle à décider')row.productionStatus='À produire';
  }
  for(const row of plan.stages){
    const s=stages.get(row.id);row.runtimePolicy=s.referencePolicy;row.referenceTracks=s.referenceTracks;
    row.bitmapProgress=stageBitmapProgress(s);
    row.additionalBindings=plan.stageAnimations.filter(a=>a.stageId===row.id&&!stageAnimationBaseline.some(old=>old.id===a.id));
    row.shift=s.shift.enabled===false?`${s.shift.style} — ${s.shift.startOtherworld?'Otherworld fixe':'bascule désactivée'}`:s.shift.style;
    row.locationNote+=`\nMoteur : ${(s.referenceTracks||[]).length} piste(s) de la fiche, ${s.director.events.length} événement(s), ${s.director.hazardDeck.length} danger(s) autorisé(s).`;
    if(row.bitmapProgress){
      const bitmap=row.bitmapProgress;
      row.locationNote+=`\nDécor bitmap candidat : ${bitmap.layers} couche(s), ${bitmap.files} PNG indépendant(s), mode ${bitmap.mode}${bitmap.scene?' ; vue '+bitmap.scene:''} ; couches ${bitmap.layerNames.join(', ')}. Images de travail non certifiées ; profondeur, animation et comparaison source à vérifier.`;
      if(bitmap.mode==='replace')row.locationNote+=' Les pistes procédurales restent préparées mais sont masquées par cette vue bitmap.';
    }
    if(row.additionalBindings.length)row.locationNote+='\nNouveaux raccords de versus : '+row.additionalBindings.map(a=>`${a.id} — ${a.animationName} (${a.type})`).join(' ; ')+'. Ces règles de jeu ne certifient aucune action de l’œuvre.';
    if(row.productionStatus==='À produire')row.productionStatus='En cours';
  }
  const current=new Map(plan.stageAnimations.map(a=>[a.id,a]));
  // Keep every old workbook ID, including ideas now withdrawn. New contextual
  // event bindings belong to their existing ':reference:n' production row.
  plan.stageAnimations=stageAnimationBaseline.map(original=>{
    const stage=stages.get(original.stageId),candidate=current.get(original.id),track=stage.referenceTracks?.find(t=>t.id===original.id);
    const row={...(candidate||original),name:stage.name};
    if(track){
      const bitmap=plan.stages.find(s=>s.id===stage.id).bitmapProgress,masked=bitmap?.mode==='replace';
      row.existing=masked?`Piste de moteur préparée : ${track.implementedElement||track.name}, mais masquée par la vue bitmap${bitmap.static?' statique':''}${bitmap.scene?' '+bitmap.scene:''}. Aucun geste de cette piste n’est affiché dans cette vue ; animation contextuelle à produire.`:`Prototype Canvas partiel joué : ${track.implementedElement||track.name}. Aucune capture ni image d’animation créée.`;
      row.trigger=masked?'Non affichée dans la vue bitmap ; déclencheur préparé : '+track.trigger:track.trigger;
      row.layer=track.layer;row.productionStatus='En cours';row.runtimeTrack=track;row.runtimeTrackVisible=!masked;
    }else if(!candidate||(row.type==='Transformation'&&stage.shift.enabled===false)){
      row.existing='Désactivé après application de la fiche exacte. Conservé dans l’inventaire pour tracer le retrait.';
      row.trigger='Aucun déclenchement automatique';row.retired=true;
      row.status='Ancienne adaptation retirée du moteur';
      row.productionStatus=stage.reference?.blocked?'À référencer':'À tester';
    }
    if(plan.stages.find(s=>s.id===row.stageId).productionStatus==='À référencer'||candidate?.productionStatus==='À référencer')row.productionStatus='À référencer';
    return row;
  });
  for(const task of plan.tasks){
    if(task.id.endsWith(':role')&&resolvedRoles.has(task.entityId)){
      const decision=resolvedRoles.get(task.entityId);
      task.status='Validé';task.delivery='role-reference-review-'+decision.reviewedAt;
      task.reason=roleDecisionNote(decision)+(decision.adaptationScope==='versus-scripted'?
        ' Le moteur conserve une adaptation de versus explicitement proposée, sans valider les commandes ni les images du prototype.':
        ' Le moteur conserve toutes les commandes autonomes désactivées.');
      if(decision.adaptationScope==='versus-scripted')task.acceptance='Version et rôle de scène du film exacts ; adaptation du versus déclarée, sans validation de commande, image, animation ou durée originale.';
      task.referenceIds=rowRefs(decision.evidence);
    }else if(task.id.endsWith(':art')){
      const art=SPRITES[task.entityId];
      if(art?.frames.length>0){
        task.status='En cours';task.delivery=art.animatedClips>0?'reference-continuation-2026-10-23':'fidelity-source-pass-2026-10-23';
        task.reason=`${art.frames.length} images indépendantes, ${art.animatedClips} montage(s) animé(s) candidat(s). Poses ${Object.keys(art.clips).join(', ')} uniquement ; autres gestes et comparaison temporelle source encore à réaliser. Aucune fidélité 1:1 certifiée.`;
        if(task.entityId==='sh3_memory_of_alessa_049')task.reason+=' Couteau, pistolet et tuyau présents ; mitraillette manquante signalée par cartouche, sans image de remplacement.';
      }
    }else if(task.id.endsWith(':moves')){
      const p=profiles.get(task.entityId),enabled=Object.values(p.moves).filter(m=>m.enabled!==false).length;
      task.status='En cours';task.delivery=IMPLEMENTATION_REVISION;
      task.reason=`Politique de la fiche appliquée : ${enabled}/20 commandes actives. Projectiles, téléportation, effets et annulations limités aux recettes explicites. Captures, PNG et comparaison visuelle encore à réaliser.`;
      const weaponNote=runtimeReferenceNote(p);
      if(weaponNote){task.reason+=' '+weaponNote;task.delivery='reference-continuation-2026-10-23';}
    }else if(task.id.endsWith(':cinematics')&&(plan.finishers.some(f=>f.entityId===task.entityId&&summaries.get(f.id).authored)||plan.presentations.some(p=>p.fighterId===task.entityId&&p.runtimePresentation.authored))){
      task.status='En cours';task.delivery=IMPLEMENTATION_REVISION;
      const presentations=plan.presentations.filter(p=>p.fighterId===task.entityId),finishers=plan.finishers.filter(f=>f.entityId===task.entityId);
      task.reason=`${presentations.filter(p=>p.runtimePresentation.authored).length}/${presentations.length} présentations et ${finishers.filter(f=>summaries.get(f.id).authored).length}/${finishers.length} timelines de finisher composées. Clés contextuelles, séquences de résultat, provocation, caméra et sons branchés. Poses bitmap dédiées et validation visuelle restantes.`;
    }else if(task.id.endsWith(':stage')){
      const s=stages.get(task.entityId);task.status='En cours';task.delivery=IMPLEMENTATION_REVISION;
      const bitmap=plan.stages.find(row=>row.id===task.entityId).bitmapProgress;
      const tracks=s.referenceTracks?.length||0,masked=bitmap?.mode==='replace';
      task.reason=`Contraintes du lieu appliquées : ${masked?0:tracks} piste(s) de la fiche rendue(s)${masked?`, ${tracks} piste(s) préparée(s) mais masquée(s) par la vue bitmap`:''}. Météo, phase et dangers filtrés ; architecture et captures à vérifier.`;
      if(bitmap)task.reason+=` Décor bitmap candidat : ${bitmap.layers} couche(s), ${bitmap.files} PNG indépendant(s). Montage animé et fidélité à vérifier ; aucune certification.`;
    }
  }
  const hooks=plan.tasks.find(t=>t.id==='global:cinematic-clips');
  hooks.status='Validé';hooks.delivery='reference-continuation-2026-10-23';
  hooks.reason='Neuf hooks, contexte exact par finisher et par résultat, provocation annulable, timeline caméra/acteurs/son. Chargement atomique acteurs et couches bitmap du lieu : panne, reprise et annulation vérifiées ; ancien combat et images conservés en cas d’échec. Raccord technique validé ; PNG dédiés et décors restent à produire dans leurs actions artistiques.';
  const capture=plan.tasks.find(t=>t.id==='global:reference-capture');
  capture.status='En cours';capture.delivery='source-timing-pipeline-2026-10-23';
  capture.reason=`Outil scripts/source-timing.mjs disponible (format ${SOURCE_TIMING_SCHEMA}, lot ${SOURCE_TIMING_BATCH_SCHEMA}) : identité/édition exactes, URL source HTTPS, empreinte de capture, FPS rationnels, bornes début/impact/fin et timestamps vidéo vérifiés par ffprobe. Plusieurs slots d’une même capture peuvent être vérifiés en un seul décodage. La relecture facultative est liée par SHA256 aux annotations exactes ; son auteur reste déclaratif. Zéro relevé original livré ; les ${plan.moves.length} mouvements conservent leurs FPS/timecodes vides. Le paquet et sa relecture restent candidats et ne certifient ni le geste ni la fidélité 1:1.`;
  capture.reason+=' La commande review-preview extrait les images début/impact/fin du même snapshot vérifié par ffmpeg : index HTML local et manifeste SHA256, aperçus réduits à 640 pixels maximum, sans nouvelle attestation ni import Excel.';
  capture.reason+=' La commande verify-review compare en lecture seule les PNG, le manifeste et la page HTML à une extraction fraîche de cette capture avec la version actuelle de l’outil ; une image remplacée reste refusée même si son hash déclaré a été recalculé.';
  capture.reason+=' Les captures à plusieurs pistes vidéo peuvent déclarer videoStreamOrdinal (numérotation vidéo à partir de zéro) : même piste pour ffprobe et ffmpeg, sélection liée aux annotations et à la relecture. Les anciens paquets gardent la première piste et leurs empreintes.';
  capture.reason+=' Les aperçus de captures aux pixels non carrés conservent leur proportion affichée décodée, sans certifier le format du jeu original.';
  return {playableFighters:[...profiles.values()].filter(p=>p.referencePolicy.combatEnabled).length,
    reviewedCombatProfiles:[...profiles.values()].filter(p=>p.referencePolicy.capabilities.reviewed).length,
    disabledMoves:plan.moves.filter(m=>!m.enabled).length,authoredFinishers:[...summaries.values()].filter(s=>s.authored).length,
    authoredFighterFinishers:plan.finishers.filter(f=>f.entityType==='Combattant'&&summaries.get(f.id).authored).length,
    authoredStageFinishers:plan.finishers.filter(f=>f.entityType==='Arène'&&summaries.get(f.id).authored).length,
    authoredPresentations:plan.presentations.filter(p=>p.runtimePresentation.authored).length,
    resolvedRoleDecisions:resolvedRoles.size,
    stageBitmapCandidates:plan.stages.filter(s=>s.bitmapProgress).length,
    stageBitmapLayers:plan.stages.reduce((n,s)=>n+(s.bitmapProgress?.layers||0),0),
    stageBitmapFiles:plan.stages.reduce((n,s)=>n+(s.bitmapProgress?.files||0),0),
    sourceTimingSchema:SOURCE_TIMING_SCHEMA,
    sourceTimingBatchSchema:SOURCE_TIMING_BATCH_SCHEMA,
    sourceTimingReviewSchema:SOURCE_TIMING_REVIEW_SCHEMA,
    measuredSourceMoves:plan.moves.filter(m=>m.sourceFrameRate!==''&&m.sourceStart!==''&&m.sourceImpact!==''&&m.sourceEnd!=='').length,
    referenceStageTracks:STAGES.reduce((n,s)=>n+(s.referenceTracks?.length||0),0),retiredStageItems:plan.stageAnimations.filter(a=>a.retired).length,
    visibleReferenceStageTracks:plan.stageAnimations.filter(a=>a.runtimeTrack&&a.runtimeTrackVisible).length,
    maskedReferenceStageTracks:plan.stageAnimations.filter(a=>a.runtimeTrack&&!a.runtimeTrackVisible).length,
    additionalStageBindings:plan.stages.reduce((n,s)=>n+s.additionalBindings.length,0)};
}

export function buildProductionPlan(research) {
  validateResearch(research);
  const refs=new Map(research.fighters.map(f=>[f.id,f]));
  const stageRefs=new Map(research.stages.map(s=>[s.id,s]));
  const plan={schema:PLAN_SCHEMA,phase:1,date:'2026-10-17',baseCommit:BASE_COMMIT,implementationRevision:IMPLEMENTATION_REVISION,
    updatedAt:'2026-10-26',
    scope:'PR #4 et continuation des 23, 24, 25 et 26 octobre 2026. Suivi de l’intégration des fiches dans le moteur. Règles et prototypes de mise en scène séparés des images dédiées et de la certification visuelle.',
    fidelityPolicy:'Une identité ou un comportement documenté ne valide pas les 20 slots de versus. Supers, finishers et poses de manche sont des propositions. Les valeurs du moteur ne sont jamais des mesures officielles.',
    sources:research.sources,fighters:[],observations:[],moves:[],finishers:[],presentations:[],poses:[],stages:[],stageAnimations:[],tasks:[]};
  const task=(id,entityId,entityType,priority,title,reason,acceptance,referenceIds=[])=>plan.tasks.push({id,entityId,entityType,priority,title,reason,acceptance,referenceIds:rowRefs(referenceIds),status:'À faire',owner:'',delivery:''});
  for(const f of ROSTER){
    const ref=refs.get(f.id),profile=createCombatProfile(f),art=SPRITES[f.id];
    const observations=ref.observedMoves.map((move,index)=>({...move,id:`${f.id}:ref:${String(index+1).padStart(2,'0')}`,fighterId:f.id,fighterName:f.name,source:f.source,edition:referenceEdition(f,ref),referenceIds:rowRefs(move.evidence),sourceTiming:'Non mesuré image par image'}));
    plan.observations.push(...observations);
    const observationIds=observations.map(o=>o.id);
    const locked=isBlocked(ref.identityStatus)||ref.combatRole==='unverified';
    const noncombat=isNonCombat(ref.identityStatus)||['scripted-encounter','environmental-obstacle','noncombatant'].includes(ref.combatRole)||isNonCombat(ref.proposals.super.status);
    const artState=art ? 'PNG candidat, fidélité à valider' : 'PNG à produire';
    plan.fighters.push({id:f.id,name:f.name,source:f.source,game:f.game,sourceYear:f.year,edition:referenceEdition(f,ref),variant:f.variant||'',currentVariantLabel:f.variantOf||'',baseId:ref.baseId||'',category:f.category,boss:f.boss,
      currentRole:f.catalogueStatus,targetRole:ref.combatRole||'',currentEvidence:f.evidenceTier,identityStatus:ref.identityStatus,identityNote:ref.identityNote,
      roleDecision:ref.roleDecision?Object.fromEntries(['status','fighterId','decision','edition','evidence','rationale','reviewedAt','adaptationScope'].filter(key=>ref.roleDecision[key]!==undefined).map(key=>[key,structuredClone(ref.roleDecision[key])])):null,
      constraints:ref.constraints.join('\n'),referenceIds:rowRefs(ref.referenceIds),observationIds:observationIds.join(', '),documentedActions:observations.filter(o=>!isBlocked(o.status)&&!isNonCombat(o.status)).length,
      currentMoves:profile.moveset.order.length,currentFinishers:f.fatalities.length,artState,animatedClips:art?.animatedClips||0,oneToOneValidated:false,productionStatus:locked?'À référencer':noncombat?'Rôle à décider':'À produire'});

    for(const key of profile.moveset.order){
      const m=profile.moves[key],superMove=['super','desperation'].includes(key);
      const proposal=superMove?ref.proposals.super:null;
      const moveLocked=locked||isBlocked(proposal?.status),moveNoncombat=noncombat||isNonCombat(proposal?.status);
      plan.moves.push({id:`${f.id}:${key}`,fighterId:f.id,name:f.name,source:f.source,edition:referenceEdition(f,ref),key,category:categoryNames[m.category]||m.category,input:m.input,
        currentName:m.name,currentClaim:m.fidelity,canonicalVerification:'Animation officielle non vérifiée',
        target:moveLocked?'Référence de cette version et de cette technique requise avant chorégraphie':moveNoncombat?'Décider du rôle avant un moveset de versus':superMove?proposal.description+(key==='desperation'?' Déclinaison de désespoir à définir depuis cette même capacité ; le seuil de vitalité est une règle du versus.':''):`Chorégraphier le slot ${m.input} depuis les gestes référencés ${genitiveName(f.name)}, sans attribuer automatiquement le mouvement actuel au canon.`,
        proposalName:proposal?proposal.name+(key==='desperation'?' — déclinaison désespoir':''):'',proposalStatus:locked?'bloque-reference':noncombat?'non-applicable-lore':superMove?proposal.status:'slot-versus-a-choregraphier',
        observationIds:observationIds.join(', '),referenceIds:rowRefs(ref.referenceIds),startup:m.startup,active:m.active,recovery:m.recovery,damage:m.damage,reach:m.reach,meterCost:m.meterCost||0,hits:m.hits,
        projectile:!!m.projectile,effect:m.effect?.id||'',cancelInto:(m.cancelInto||[]).join(', '),engineClip:key,clipStatus:art?.clips?.[key]?'Clip candidat à vérifier':'Clip absent',
        sourceFrameRate:'',sourceStart:'',sourceImpact:'',sourceEnd:'',productionStatus:productionState(locked,noncombat,proposal?.status)});
    }
    for(const finisher of f.fatalities){
      const p=ref.proposals.finisher;
      plan.finishers.push({id:finisher.id,entityId:f.id,entityType:'Combattant',name:f.name,source:f.source,edition:referenceEdition(f,ref),type:finisher.type,currentName:finisher.name,currentSequence:finisher.sequence.join(' → '),
        proposalName:p.name+(finisher.type==='nightmare'?' — montage Nightmare':''),description:p.description+(finisher.type==='nightmare'?' Décliner le montage de cette capacité pour la variante Nightmare. Aucune nouvelle anatomie ou capacité n’est justifiée par la seule jauge.':''),status:p.status,basis:text(p.basis),referenceIds:rowRefs(p.evidence||ref.referenceIds),
        trigger:'Uniquement quand la victoire du match est acquise. Jamais à la fin de la première manche si une reprise est prévue.',
        actorTracks:'Hooks attaquant finisher et cible finished synchronisés. Montages distincts par finisher, caméra, accessoires, son et effets à produire.',existing:'Hooks finisher/finished disponibles sur le timer de la séquence. Chorégraphie bitmap dédiée absente.',productionStatus:productionState(locked,noncombat,p.status)});
    }
    for(const key of Object.keys(presentationNames)){
      const p=ref.proposals[key];
      plan.presentations.push({id:`${f.id}:${key}`,fighterId:f.id,name:f.name,source:f.source,edition:referenceEdition(f,ref),type:presentationNames[key],proposalName:p.name,description:p.description,status:p.status,basis:text(p.basis),referenceIds:rowRefs(p.evidence||ref.referenceIds),trigger:presentationTriggers[key],
        continuity:key==='winRound1'||key==='loseRound1'?'Transition réversible. Même personnage et équipements prêts pour la manche suivante.':'Respecter la forme et le rôle propres à cette œuvre.',
        engineState:PRESENTATION_CLIPS[key]?`Hook ${PRESENTATION_CLIPS[key]} disponible. ${art?.clips?.[PRESENTATION_CLIPS[key]]?'Clip candidat à vérifier.':'PNG dédiés à produire.'}`:'Commande et hook de provocation à définir.',productionStatus:productionState(locked,noncombat,p.status)});
    }
    for(const pose of CORE_POSES){
      const clip=art?.clips?.[pose];
      const distinct=clip?new Set(clip.frames.map(index=>art.frames[index].pixelSHA256||art.frames[index].sha256)).size:0;
      const ticks=clip?(clip.frameTicks||clip.frames.map(()=>clip.ticksPerFrame)).reduce((sum,n)=>sum+n,0):0;
      const weaponPoses=pose==='idle'&&profile.moveset.weaponPhases?.length?runtimeReferenceNote(profile):'';
      const existing=(distinct>1?`${distinct} images indépendantes, montage candidat de ${ticks} ticks du versus ; timing source et fidélité non certifiés.`:clip?'Image de repos candidate, aucune animation certifiée':'Aucun clip dédié')+(weaponPoses?' '+weaponPoses:'');
      plan.poses.push({id:`${f.id}:pose:${pose}`,fighterId:f.id,name:f.name,source:f.source,edition:referenceEdition(f,ref),pose,label:poseNames[pose],description:plannedPose(f,ref,pose),referenceIds:rowRefs(ref.referenceIds),status:'Adaptation à valider sur références',existing,
        spriteFormat:'Une image PNG transparente indépendante par pose/image. Corps et accessoires entièrement visibles.',
        qa:'Appuis, silhouette, proportions, membres, orientation, arme, contacts au sol. Pas de faux clip créé par duplication.',productionStatus:locked?'À référencer':noncombat?'Rôle à décider':distinct>1||(weaponPoses&&art?.frames.length>1)?'En cours':'À produire'});
    }
    if(locked||noncombat)task(`${f.id}:role`,f.id,'Combattant','P0','Confirmer identité et rôle',ref.identityNote,'Œuvre, forme, statut de combat et comportement vérifiés avant réalisation des attaques.',ref.referenceIds);
    task(`${f.id}:art`,f.id,'Combattant','P1','Produire et vérifier les PNG',artState,'Images indépendantes, anatomie validée sur cette version et clips composés de poses distinctes.',ref.referenceIds);
    task(`${f.id}:moves`,f.id,'Combattant',locked||noncombat?'P0':'P1','Réviser les mouvements actuels',`${profile.moveset.order.length} slots présents dans le moteur. Les gestes sourcés sont séparés des variantes de versus.`,'Aucun projectile, membre, arme ou déplacement ajouté sans justification. Paramètres moteur explicitement adaptés.',ref.referenceIds);
    task(`${f.id}:cinematics`,f.id,'Combattant','P2','Réaliser les séquences de présentation','Introduction, attitude, victoire/défaite de manche, victoire/défaite finale, sortie et finishers à produire.','Manche 1 réversible, finishers réservés au résultat définitif, caméra et cible synchronisées.',ref.referenceIds);
  }
  for(const s of STAGES){
    const ref=stageRefs.get(s.id),rids=rowRefs(ref.referenceIds);
    plan.stages.push({id:s.id,name:s.name,source:s.source,game:SOURCE_META[s.source]?.label||s.source,currentStatus:s.catalogueStatus,locationStatus:ref.locationStatus,locationNote:ref.locationNote,family:s.family,weather:s.weather,layers:s.layers.join(', '),props:s.props.join(', '),terrain:s.terrain.id,shift:s.shift.style,tracks:s.animationTracks.length,events:s.director.events.length,interactions:s.interactions.length,hazards:s.director.hazardDeck.length,referenceIds:rids,productionStatus:isBlocked(ref.locationStatus)?'À référencer':'À produire'});
    const add=(suffix,type,name,existing,trigger,layer,description,status='Adaptation de versus non certifiée',evidence=ref.referenceIds)=>plan.stageAnimations.push({id:`${s.id}:${suffix}`,stageId:s.id,name:s.name,source:s.source,type,animationName:name,existing,trigger,layer,description,status,referenceIds:rowRefs(evidence),productionStatus:isBlocked(ref.locationStatus)||isBlocked(status)?'À référencer':'À produire'});
    for(const a of s.animationTracks)add(`loop:${a.id}`,'Boucle',a.id,'Piste procédurale existante',`${a.phase}, ${a.cadence}`,a.layer,'Refaire la piste en éléments visuels indépendants après validation du lieu. Vérifier raccord de boucle, profondeur, réduction des mouvements et pause.');
    for(const key of s.director.events){const e=STAGE_EVENTS[key];add(`event:${key}`,'Événement',e?.name||key,'Événement procédural existant',`${e?.duration||0} ticks moteur`,e?.animation||'','Distinguer animation d’ambiance et danger actif. La présence du lieu ne prouve pas que cet événement s’y produit dans l’œuvre.');}
    for(const i of s.interactions)add(`interaction:${i.id}`,'Interaction',i.name,'Déclencheur de versus existant',i.trigger,'Gameplay',`${i.triggerDescription} Déclencheur à valider comme adaptation, sans le présenter comme événement canonique.`);
    for(const key of s.director.hazardDeck){const h=STAGE_HAZARDS[key];add(`hazard:${key}`,'Danger',h?.name||key,'Zone de dégâts procédurale existante',`${h?.telegraph||0} ticks de signal, ${h?.damage||0} dégâts moteur`,h?.visual||'','Prévoir anticipation visuelle, collision active et récupération. Le dégât, la zone sûre et le déclenchement restent des règles originales.');}
    add('shift','Transformation',s.shift.name,'Transformation procédurale existante',`${s.shift.duration} ticks moteur`,'Toutes les couches','Relever la transformation propre à cette œuvre. Ne pas appliquer une écorchure de peinture identique à tous les univers.');
    ref.animations.forEach((a,index)=>add(`reference:${index+1}`,'Proposition du lieu',a.name,'Non réalisée','Selon la fiche référencée','À séparer par profondeur',a.description,a.status,a.evidence||ref.referenceIds));
    plan.finishers.push({id:s.fatality.id,entityId:s.id,entityType:'Arène',name:s.name,source:s.source,edition:SOURCE_META[s.source]?.label||s.source,type:'stage',currentName:s.fatality.name,currentSequence:s.fatality.sequence.join(' → '),proposalName:s.fatality.name,
      description:'Réviser cette proposition depuis les motifs de la fiche du lieu. Rejeter toute action supposant un accessoire ou un danger non présent. Prévoir entrée de la cible, action du décor, occultation et plan de sortie.',
      status:'Adaptation environnementale à confirmer',basis:`Fiche lieu ${s.id}`,referenceIds:rids,trigger:'Victoire définitive du match, zone de décor compatible et option finisher activée',actorTracks:'Hooks attaquant/cible synchronisés. Pistes propres au décor, caméra, effets et son à produire.',existing:'Hooks finisher/finished disponibles. Décor procédural présent, séquence bitmap propre au lieu absente.',productionStatus:isBlocked(ref.locationStatus)?'À référencer':'À produire'});
    task(`${s.id}:stage`,s.id,'Arène',isBlocked(ref.locationStatus)?'P0':'P1','Réviser et animer le lieu',ref.locationNote,'Architecture, époque, profondeur, props et animations validés dans cette œuvre. Déclencheurs de versus identifiés.',ref.referenceIds);
  }
  task('global:round-boundaries','engine','Moteur','P0','Séparer fin de manche et fin de match','Les propositions nécessitent des états distincts de victoire et défaite de première manche.','Une défaite de manche ne lance pas une mort irréversible ni un finisher. Match, nul, reprise et départ anticipé couverts.');
  Object.assign(plan.tasks.at(-1),{status:'Validé',delivery:IMPLEMENTATION_REVISION});
  task('global:cinematic-clips','engine','Moteur','P1','Ajouter les hooks de présentation bitmap','Huit hooks de présentation disponibles, horloges synchronisées et montage à lecture unique. Pistes par finisher, accessoires, caméra, son et décors bitmap encore à réaliser.','Séquences interruptibles ou verrouillées explicitement, retour menu et pause sûrs, chargement atomique des acteurs et décors.');
  Object.assign(plan.tasks.at(-1),{status:'En cours',delivery:IMPLEMENTATION_REVISION});
  task('global:reference-capture','reference','Références','P1','Relever les séquences image par image','Les pages consultées attestent des comportements ou des lieux, pas de toutes les poses ni des timings.','Capture exacte avec œuvre/édition, durée, FPS, timecodes, gestes clés et différences entre versions. Aucune durée inventée.');
  const runtimeProgress=applyRuntimeProgress(plan);
  plan.metrics={fighters:plan.fighters.length,stages:plan.stages.length,moves:plan.moves.length,supers:plan.moves.filter(m=>['super','desperation'].includes(m.key)).length,fighterFinishers:plan.finishers.filter(f=>f.entityType==='Combattant').length,stageFinishers:plan.finishers.filter(f=>f.entityType==='Arène').length,presentations:plan.presentations.length,poses:plan.poses.length,stageAnimations:plan.stageAnimations.length,observations:plan.observations.length,sources:plan.sources.length,tasks:plan.tasks.length,pngCandidates:plan.fighters.filter(f=>SPRITES[f.id]).length,animatedClips:plan.fighters.reduce((n,f)=>n+f.animatedClips,0),certifiedOneToOne:0,newGameplaySequences:runtimeProgress.authoredFinishers,presentationHooks:PRESENTATION_KEYS.length,openActions:plan.tasks.filter(t=>t.status!=='Validé').length,openP0:plan.tasks.filter(t=>t.status!=='Validé'&&t.priority==='P0').length,...runtimeProgress};
  return plan;
}

export async function writePlan() {
  const parts=await Promise.all(['classic','extended'].map(async name=>JSON.parse(await fs.readFile(path.join(planDir,'research',`${name}.json`),'utf8'))));
  const research=combineResearch(parts),plan=buildProductionPlan(research);
  const payload=JSON.stringify(plan,null,2)+'\n';
  await fs.mkdir(planDir,{recursive:true});
  await fs.writeFile(path.join(planDir,'production-plan.json'),payload);
  await fs.writeFile(path.join(planDir,'production-plan-summary.json'),JSON.stringify({schema:PLAN_SCHEMA,date:plan.date,updatedAt:plan.updatedAt,baseCommit:BASE_COMMIT,implementationRevision:IMPLEMENTATION_REVISION,sha256:sha256(payload),metrics:plan.metrics},null,2)+'\n');
  console.log(JSON.stringify({output:'docs/production/production-plan.json',...plan.metrics},null,2));
  return plan;
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await writePlan();
