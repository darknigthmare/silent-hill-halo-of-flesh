/** Phase-one production catalogue. Documentation only; never imported by the game. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {ROSTER, STAGES, SOURCE_META, createCombatProfile, STAGE_EVENTS, STAGE_HAZARDS} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {PRESENTATION_KEYS} from '../src/sprite-poses.js';

export const PLAN_SCHEMA = 1;
export const BASE_COMMIT = 'd11cf4e8c03668aa535631cb2ef60767ee51e75b';
export const IMPLEMENTATION_REVISION = 'presentation-hooks-2026-10-17';
export const PRESENTATION_CLIPS = Object.freeze({intro:'intro',winRound1:'winRound',loseRound1:'loseRound',winMatch:'winMatch',loseMatch:'loseMatch',outro:'outro'});
export const PROPOSAL_KEYS = ['intro','taunt','winRound1','loseRound1','winMatch','loseMatch','outro','super','finisher'];
export const CORE_POSES = ['idle','walk','crouch','jump','guard','dodge','hurt','knockdown','ko','phase'];
export const COMBAT_ROLES = ['combatant','stationary-boss','multi-body','scripted-encounter','environmental-obstacle','noncombatant','unverified'];
const root = fileURLToPath(new URL('../', import.meta.url));
const planDir = path.join(root, 'docs/production');
const text = value => typeof value === 'string' ? value : value == null ? '' : Array.isArray(value) ? value.map(text).join(' / ') : JSON.stringify(value);
const genitiveName = name => /^[aeiouyàâéèêëîïôûùüœ]/i.test(name)?`d’${name}`:`de ${name}`;
const unique = values => [...new Set(values.filter(Boolean))];
const sha256 = value => createHash('sha256').update(value).digest('hex');
const isBlocked = status => /bloqu|unverified|unconfirmed|non.vérif|non.verif|reference-required|unresolved|unknown|[àa].v[ée]rifier|[àa].r[ée]f[ée]rencer|a.confirmer|non.confirme|documentation.partielle|a.reconcilier/i.test(status || '');
const isNonCombat = status => /non.combat|non.applicable|non.hostil|passi[ fv]|set.piece|environment|obstacle|scenery/i.test(status || '');
const productionState = (locked,noncombat,proposalStatus='') => locked||isBlocked(proposalStatus)?'À référencer':noncombat||isNonCombat(proposalStatus)?'Rôle à décider':'À produire';
const poseNames = {idle:'Repos',walk:'Locomotion',crouch:'Posture basse',jump:'Déplacement aérien',guard:'Réaction défensive',dodge:'Évitement',hurt:'Réaction à un impact',knockdown:'Chute de manche',ko:'Défaite',phase:'Changement de phase'};
const presentationNames = {intro:'Introduction',taunt:'Attitude / provocation',winRound1:'Victoire première manche',loseRound1:'Défaite première manche',winMatch:'Pose de victoire finale',loseMatch:'Pose de défaite finale',outro:'Sortie de combat'};
const presentationTriggers = {intro:'Avant la première manche, commandes suspendues',taunt:'Commande future à définir, hors hitstun',winRound1:'Manche gagnée, dont la première, quand le match continue',loseRound1:'Manche perdue ou nulle, dont la première, quand le match continue',winMatch:'Victoire du match confirmée',loseMatch:'Défaite finale sans finisher. Après un finisher, tenir la dernière image de la piste cible.',outro:'Sortie du vainqueur après la pose finale. La cible conserve sa défaite finale.'};
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

export function buildProductionPlan(research) {
  validateResearch(research);
  const refs=new Map(research.fighters.map(f=>[f.id,f]));
  const stageRefs=new Map(research.stages.map(s=>[s.id,s]));
  const plan={schema:PLAN_SCHEMA,phase:1,date:'2026-10-17',baseCommit:BASE_COMMIT,implementationRevision:IMPLEMENTATION_REVISION,
    scope:'PR #4. Inventaire de production uniquement : aucune nouvelle attaque, cinématique ou image publiée par ce catalogue.',
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
      plan.poses.push({id:`${f.id}:pose:${pose}`,fighterId:f.id,name:f.name,source:f.source,edition:referenceEdition(f,ref),pose,label:poseNames[pose],description:plannedPose(f,ref,pose),referenceIds:rowRefs(ref.referenceIds),status:'Adaptation à valider sur références',existing:clip?'Image de repos candidate, aucune animation certifiée':'Aucun clip dédié',
        spriteFormat:'Une image PNG transparente indépendante par pose/image. Corps et accessoires entièrement visibles.',
        qa:'Appuis, silhouette, proportions, membres, orientation, arme, contacts au sol. Pas de faux clip créé par duplication.',productionStatus:locked?'À référencer':noncombat?'Rôle à décider':'À produire'});
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
  plan.metrics={fighters:plan.fighters.length,stages:plan.stages.length,moves:plan.moves.length,supers:plan.moves.filter(m=>['super','desperation'].includes(m.key)).length,fighterFinishers:plan.finishers.filter(f=>f.entityType==='Combattant').length,stageFinishers:plan.finishers.filter(f=>f.entityType==='Arène').length,presentations:plan.presentations.length,poses:plan.poses.length,stageAnimations:plan.stageAnimations.length,observations:plan.observations.length,sources:plan.sources.length,tasks:plan.tasks.length,pngCandidates:plan.fighters.filter(f=>SPRITES[f.id]).length,animatedClips:plan.fighters.reduce((n,f)=>n+f.animatedClips,0),certifiedOneToOne:0,newGameplaySequences:0,presentationHooks:PRESENTATION_KEYS.length};
  return plan;
}

export async function writePlan() {
  const parts=await Promise.all(['classic','extended'].map(async name=>JSON.parse(await fs.readFile(path.join(planDir,'research',`${name}.json`),'utf8'))));
  const research=combineResearch(parts),plan=buildProductionPlan(research);
  const payload=JSON.stringify(plan,null,2)+'\n';
  await fs.mkdir(planDir,{recursive:true});
  await fs.writeFile(path.join(planDir,'production-plan.json'),payload);
  await fs.writeFile(path.join(planDir,'production-plan-summary.json'),JSON.stringify({schema:PLAN_SCHEMA,date:plan.date,baseCommit:BASE_COMMIT,implementationRevision:IMPLEMENTATION_REVISION,sha256:sha256(payload),metrics:plan.metrics},null,2)+'\n');
  console.log(JSON.stringify({output:'docs/production/production-plan.json',...plan.metrics},null,2));
  return plan;
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await writePlan();
