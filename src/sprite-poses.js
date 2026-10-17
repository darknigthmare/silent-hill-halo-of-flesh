/** Exact clip keys shared by authoring and playback. No inferred artwork or game timing. */
import {MOVESET_KEYS} from './movesets.js';
import {FIGHTER_REFERENCES,STAGE_REFERENCES} from './production-reference.js';

export const BASE_POSE_KEYS=Object.freeze(['idle','walk','crouch','jump','guard','dodge','hurt','knockdown','ko','phase']);
export const PRESENTATION_KEYS=Object.freeze(['intro','winRound','loseRound','winMatch','loseMatch','outro','finisher','finished','taunt']);
// Keep the original thirty indices stable; presentations extend the contract.
export const POSE_KEYS=Object.freeze([...BASE_POSE_KEYS,...MOVESET_KEYS,...PRESENTATION_KEYS]);
export const POSE_LABELS=Object.freeze({
 idle:'Repos',walk:'Locomotion',crouch:'Posture basse',jump:'Déplacement aérien',guard:'Garde',
 dodge:'Esquive',hurt:'Réaction au coup',knockdown:'Mise au sol',ko:'K.-O.',phase:'Changement de phase',
 intro:'Introduction',winRound:'Victoire de manche',loseRound:'Défaite de manche · réversible',
 winMatch:'Victoire finale',loseMatch:'Défaite finale',outro:'Sortie de scène',
 finisher:'Fatalité lore · exécutant',finished:'Fatalité lore · cible',taunt:'Attitude / provocation'
});
export const splitSpriteClipKey=key=>{const [pose,contextId,...extra]=String(key).split('@');return {pose,contextId:contextId||null,validParts:extra.length===0};};
export const isPresentationPose=key=>PRESENTATION_KEYS.includes(splitSpriteClipKey(key).pose);
export const isOneShotPose=key=>MOVESET_KEYS.includes(key)||isPresentationPose(key);
export const poseLabel=key=>{const {pose,contextId}=splitSpriteClipKey(key);return (Object.hasOwn(POSE_LABELS,pose)?POSE_LABELS[pose]:pose)+(contextId?' · '+contextId:'');};
const productionType={winRound:'winRound1',loseRound:'loseRound1'};
/** Context is the production entity, never another edition's alias or a free-form path. */
export function validSpriteClipKey(key,art={}){
 const {pose,contextId,validParts}=splitSpriteClipKey(key);
 if(!validParts||!POSE_KEYS.includes(pose))return false;
 if(contextId===null)return key===pose;
 if(!PRESENTATION_KEYS.includes(pose)||key.length>240)return false;
 if(pose==='finisher'||pose==='finished'){
  const match=contextId.match(/^([a-z0-9_]+)_(signature|nightmare|fatality)$/);
  if(!match)return false;
  const [,id,type]=match;
  if(type==='fatality')return Object.hasOwn(STAGE_REFERENCES,id);
  return Object.hasOwn(FIGHTER_REFERENCES,id)&&(pose==='finished'||id===art.fighterId);
 }
 return Object.hasOwn(FIGHTER_REFERENCES,art.fighterId||'')&&contextId===`${art.fighterId}:${productionType[pose]||pose}`;
}
export function contextualPresentationKeys(fighterId){
 const own=PRESENTATION_KEYS.filter(key=>!['finisher','finished'].includes(key)).map(key=>`${key}@${fighterId}:${productionType[key]||key}`);
 return [...own,...['signature','nightmare'].map(type=>`finisher@${fighterId}_${type}`)];
}
