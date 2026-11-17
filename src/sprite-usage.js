/** Artwork purpose is separate from fidelity, animation and combat role. */
export function hasCombatSprite(art){
 if(!art||art.combatView==='selection-only'||!Array.isArray(art.frames)||!art.frames.length)return false;
 const idle=art.clips?.idle;
 return Array.isArray(idle?.frames)&&idle.frames.length>0&&idle.frames.every(i=>Number.isInteger(i)&&i>=0&&art.frames[i]&&art.frames[i].purpose!=='selection');
}
export function spriteUsage(art){
 const selection=!!art?.portrait?.path,combat=hasCombatSprite(art);
 return {selection,combatView:combat?(art.combatView==='side-view-candidate'?'side-view-candidate':'legacy-unreviewed'):'missing',
  separateSelectionAndCombat:selection&&combat&&!art.frames.some(frame=>frame.path===art.portrait.path)};
}
