/** Exact clip keys shared by authoring and playback. No inferred artwork or game timing. */
import {MOVESET_KEYS} from './movesets.js';

export const BASE_POSE_KEYS=Object.freeze(['idle','walk','crouch','jump','guard','dodge','hurt','knockdown','ko','phase']);
export const PRESENTATION_KEYS=Object.freeze(['intro','winRound','loseRound','winMatch','loseMatch','outro','finisher','finished']);
// Keep the original thirty indices stable; presentations extend the contract.
export const POSE_KEYS=Object.freeze([...BASE_POSE_KEYS,...MOVESET_KEYS,...PRESENTATION_KEYS]);
export const POSE_LABELS=Object.freeze({
 idle:'Repos',walk:'Locomotion',crouch:'Posture basse',jump:'Déplacement aérien',guard:'Garde',
 dodge:'Esquive',hurt:'Réaction au coup',knockdown:'Mise au sol',ko:'K.-O.',phase:'Changement de phase',
 intro:'Introduction',winRound:'Victoire de manche',loseRound:'Défaite de manche · réversible',
 winMatch:'Victoire finale',loseMatch:'Défaite finale',outro:'Sortie de scène',
 finisher:'Fatalité lore · exécutant',finished:'Fatalité lore · cible'
});
export const isPresentationPose=key=>PRESENTATION_KEYS.includes(key);
export const isOneShotPose=key=>MOVESET_KEYS.includes(key)||isPresentationPose(key);
export const poseLabel=key=>Object.hasOwn(POSE_LABELS,key)?POSE_LABELS[key]:key;
