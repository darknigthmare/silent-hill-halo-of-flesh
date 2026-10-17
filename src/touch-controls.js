/** A pointer belongs to one input generation. Old releases must not affect a new match. */
export function bindTouchButton(button,getEngine,player,action){
 const pointers=new Set();let owner=null,epoch=-1;
 const down=event=>{
  event.preventDefault();const engine=getEngine();
  if(!engine||engine.paused||!engine.input.enabled||engine.phase==='matchEnd')return;
  if(owner!==engine||epoch!==engine.inputEpoch){pointers.clear();owner=engine;epoch=engine.inputEpoch;}
  if(pointers.has(event.pointerId))return;
  pointers.add(event.pointerId);button.setPointerCapture?.(event.pointerId);
  if(pointers.size===1)engine.setTouch(player,action,'pressed');
 };
 const release=event=>{
  event.preventDefault();if(!pointers.delete(event.pointerId))return;
  if(!pointers.size&&owner===getEngine()&&epoch===owner?.inputEpoch)owner.setTouch(player,action,false);
 };
 button.style.touchAction='none';button.addEventListener('pointerdown',down);
 const ends=['pointerup','pointercancel','lostpointercapture'];for(const name of ends)button.addEventListener(name,release);
 return ()=>{if(pointers.size&&owner===getEngine()&&epoch===owner?.inputEpoch)owner.setTouch(player,action,false);
  pointers.clear();button.removeEventListener('pointerdown',down);for(const name of ends)button.removeEventListener(name,release);};
}
