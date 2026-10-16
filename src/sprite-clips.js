/** Clip authoring works only with already imported single-image frames.
 * It changes presentation timings, never gameplay timings, pixels or provenance.
 */
import {MOVESET_KEYS,createCombatProfile} from './data.js';
export const POSE_KEYS=Object.freeze(['idle','walk','crouch','jump','guard','dodge','hurt','knockdown','ko','phase',...MOVESET_KEYS]);
export const MAX_CLIP_STEPS=256;
export const MAX_CLIP_TICKS=36000;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const pixelKey=frame=>frame.pixelSHA256||frame.sha256||frame.path;
export function clipSummary(art,clip){
 const durations=clip?.frameTicks||clip?.frames?.map(()=>clip.ticksPerFrame)||[];
 const distinct=new Set((clip?.frames||[]).map(i=>art.frames[i]).filter(Boolean).map(pixelKey)).size;
 return {steps:clip?.frames?.length||0,distinct,total:durations.reduce((n,t)=>n+t,0),animated:distinct>1};
}
export function validateClip(art,pose,clip){
 if(!POSE_KEYS.includes(pose))throw new Error('Pose inconnue du moteur.');
 if(!clip||typeof clip!=='object'||Array.isArray(clip)||Object.keys(clip).some(k=>!['frames','frameTicks','ticksPerFrame','loop'].includes(k)))throw new Error('Structure de clip invalide.');
 if(!Array.isArray(clip.frames)||!clip.frames.length||clip.frames.length>MAX_CLIP_STEPS||clip.frames.some(i=>!Number.isInteger(i)||i<0||!art.frames[i]))throw new Error('Choisir de 1 à 256 étapes parmi les images importées.');
 if(!Number.isInteger(clip.ticksPerFrame)||clip.ticksPerFrame<1||clip.ticksPerFrame>600||typeof clip.loop!=='boolean')throw new Error('Durée entière de 1 à 600 ticks et boucle explicite requises.');
 const durations=clip.frameTicks===undefined?clip.frames.map(()=>clip.ticksPerFrame):clip.frameTicks;
 if(!Array.isArray(durations)||durations.length!==clip.frames.length||durations.some(t=>!Number.isInteger(t)||t<1||t>600))throw new Error('Chaque étape exige une durée entière de 1 à 600 ticks.');
 if(durations.reduce((n,t)=>n+t,0)>MAX_CLIP_TICKS)throw new Error('Durée totale maximale : 36 000 ticks.');
 if(MOVESET_KEYS.includes(pose)&&clip.loop)throw new Error('Une attaque ne doit pas boucler indépendamment du moteur.');
 return {frames:[...clip.frames],ticksPerFrame:clip.ticksPerFrame,frameTicks:[...durations],loop:clip.loop};
}
export function moveTiming(fighter,pose){
 if(!MOVESET_KEYS.includes(pose))return null;
 const m=createCombatProfile(fighter).moves[pose];
 return {name:m.name,startup:m.startup,active:m.active,recovery:m.recovery,total:m.startup+m.active+m.recovery};
}
export function clipPacket(fighter,original,draft,pose){
 if(draft.frames.length!==original.frames.length||draft.frames.some((f,i)=>f.path!==original.frames[i].path||f.sha256!==original.frames[i].sha256))throw new Error('Le montage ne peut pas changer les images importées.');
 const clip=validateClip(draft,pose,own(draft.clips,pose)?draft.clips[pose]:null);
 if(pose!=='idle'&&!own(original.clips,pose)){
  const idle=new Set(original.clips.idle.frames.map(i=>pixelKey(original.frames[i])));
  if(!clip.frames.some(i=>!idle.has(pixelKey(draft.frames[i]))))throw new Error('Importer une image dédiée : idle seul ne crée pas une nouvelle pose.');
 }
 return {schema:1,kind:'halo-sprite-clip',fighterId:fighter.id,source:fighter.source,pose,
  frameSet:original.frames.map(f=>({path:f.path,sha256:f.sha256})),
  previousClip:own(original.clips,pose)?structuredClone(original.clips[pose]):null,clip};
}
export function createClipDraft(art,pose){
 if(own(art.clips,pose))return validateClip(art,pose,art.clips[pose]);
 return {frames:[0],ticksPerFrame:1,frameTicks:[1],loop:false};
}
