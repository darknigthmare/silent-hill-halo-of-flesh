/** Clip authoring works only with already imported single-image frames.
 * It changes presentation timings, never gameplay timings, pixels or provenance.
 */
import {MOVESET_KEYS,createCombatProfile} from './data.js';
import {POSE_KEYS,PRESENTATION_KEYS,isOneShotPose,isPresentationPose,validSpriteClipKey,weaponIdleClipKeys} from './sprite-poses.js';
import {FIGHTER_REFERENCES} from './production-reference.js';
export {POSE_KEYS} from './sprite-poses.js';
export const MAX_CLIP_STEPS=256;
export const MAX_CLIP_TICKS=36000;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const pixelKey=frame=>frame.pixelSHA256||frame.sha256||frame.path;
function validateWeaponIdleClips(art,pose,clip){
 const clips={...art.clips,[pose]:clip},contexts=Object.keys(clips).filter(key=>key.includes(':weapon:'));
 if(!contexts.length)return;
 const keys=weaponIdleClipKeys(art);
 if(contexts.some(key=>!keys.includes(key)))throw new Error('Contexte d’arme invalide pour ce sujet et cette source.');
 const pixels=value=>{
  if(!Array.isArray(value?.frames)||!value.frames.length||value.frames.some(index=>!Number.isInteger(index)||!art.frames[index]))throw new Error('Une pose d’arme exige des images importées valides.');
  return new Set(value.frames.map(index=>pixelKey(art.frames[index])));
 };
 const generic=pixels(clips.idle),scoped=new Map(contexts.map(key=>[key,pixels(clips[key])]));
 for(const [key,selected] of scoped){
  if(key!==keys[0]&&[...selected].some(pixel=>generic.has(pixel)))throw new Error('Une arme différente exige une image dédiée, distincte du couteau idle.');
  if([...scoped].some(([other,images])=>other!==key&&[...selected].some(pixel=>images.has(pixel))))throw new Error('Une image d’arme ne peut pas être partagée entre deux armes.');
 }
}
export function clipSummary(art,clip){
 const durations=clip?.frameTicks||clip?.frames?.map(()=>clip.ticksPerFrame)||[];
 const distinct=new Set((clip?.frames||[]).map(i=>art.frames[i]).filter(Boolean).map(pixelKey)).size;
 return {steps:clip?.frames?.length||0,distinct,total:durations.reduce((n,t)=>n+t,0),animated:distinct>1};
}
export function presentationClipCoverage(art){
 const present=Object.keys(art?.clips||{}).filter(isPresentationPose);
 const ownedContext=key=>{
  // The seven subject presentations have one exact owner/proposal context.
  // One finisher context never stands for every attacker or victim sequence.
  if(!art?.fighterId||['finisher','finished'].includes(key)||FIGHTER_REFERENCES[art.fighterId]?.source!==art.source)return false;
  const proposal=({winRound:'winRound1',loseRound:'loseRound1'}[key]||key),exact=`${key}@${art.fighterId}:${proposal}`;
  if(!present.includes(exact)||!validSpriteClipKey(exact,art))return false;
  try{validateClip(art,exact,art.clips[exact]);return true;}catch{return false;}
 };
 return {present,missing:PRESENTATION_KEYS.filter(key=>!present.includes(key)&&!ownedContext(key)),animated:present.filter(key=>clipSummary(art,art.clips[key]).animated).length};
}
export function validateClip(art,pose,clip){
 if(!validSpriteClipKey(pose,art))throw new Error('Pose ou contexte inconnu du moteur pour ce sujet.');
 if(!clip||typeof clip!=='object'||Array.isArray(clip)||Object.keys(clip).some(k=>!['frames','frameTicks','ticksPerFrame','loop'].includes(k)))throw new Error('Structure de clip invalide.');
 if(!Array.isArray(clip.frames)||!clip.frames.length||clip.frames.length>MAX_CLIP_STEPS||clip.frames.some(i=>!Number.isInteger(i)||i<0||!art.frames[i]))throw new Error('Choisir de 1 à 256 étapes parmi les images importées.');
 if(!Number.isInteger(clip.ticksPerFrame)||clip.ticksPerFrame<1||clip.ticksPerFrame>600||typeof clip.loop!=='boolean')throw new Error('Durée entière de 1 à 600 ticks et boucle explicite requises.');
 const durations=clip.frameTicks===undefined?clip.frames.map(()=>clip.ticksPerFrame):clip.frameTicks;
 if(!Array.isArray(durations)||durations.length!==clip.frames.length||durations.some(t=>!Number.isInteger(t)||t<1||t>600))throw new Error('Chaque étape exige une durée entière de 1 à 600 ticks.');
 if(durations.reduce((n,t)=>n+t,0)>MAX_CLIP_TICKS)throw new Error('Durée totale maximale : 36 000 ticks.');
 if(isOneShotPose(pose)&&clip.loop)throw new Error(isPresentationPose(pose)?'Une séquence de présentation se lit une seule fois ; la boucle est interdite.':'Une attaque ne doit pas boucler indépendamment du moteur.');
 validateWeaponIdleClips(art,pose,clip);
 return {frames:[...clip.frames],ticksPerFrame:clip.ticksPerFrame,frameTicks:[...durations],loop:clip.loop};
}
export function moveTiming(fighter,pose){
 if(!MOVESET_KEYS.includes(pose))return null;
 const m=createCombatProfile(fighter).moves[pose];
 return {name:m.name,startup:m.startup,active:m.active,recovery:m.recovery,total:m.startup+m.active+m.recovery};
}
export function clipPacket(fighter,original,draft,pose){
 if([original,draft].some(art=>art.fighterId!==fighter.id||art.source!==fighter.source))throw new Error('Le profil et sa source doivent correspondre exactement aux images importées.');
 if(draft.frames.length!==original.frames.length||draft.frames.some((f,i)=>f.path!==original.frames[i].path||f.sha256!==original.frames[i].sha256))throw new Error('Le montage ne peut pas changer les images importées.');
 const clip=validateClip({...draft,frames:original.frames},pose,own(draft.clips,pose)?draft.clips[pose]:null);
 if(pose!=='idle'&&pose!==weaponIdleClipKeys(original)[0]&&!own(original.clips,pose)){
  const idle=new Set(original.clips.idle.frames.map(i=>pixelKey(original.frames[i])));
  if(!clip.frames.some(i=>!idle.has(pixelKey(original.frames[i]))))throw new Error('Importer une image dédiée : idle seul ne crée pas une nouvelle pose ou séquence.');
 }
 return {schema:1,kind:'halo-sprite-clip',fighterId:fighter.id,source:fighter.source,pose,
  frameSet:original.frames.map(f=>({path:f.path,sha256:f.sha256})),
  previousClip:own(original.clips,pose)?structuredClone(original.clips[pose]):null,clip};
}
export function createClipDraft(art,pose){
 if(!validSpriteClipKey(pose,art))throw new Error('Pose ou contexte inconnu du moteur pour ce sujet.');
 if(own(art.clips,pose))return validateClip(art,pose,art.clips[pose]);
 return {frames:[0],ticksPerFrame:1,frameTicks:[1],loop:false};
}
