/** In-game inspection of actual frames, with export-only calibration. No network writes. */
import {MOVESET_KEYS} from './data.js';
import {spriteCache,drawRasterMonster} from './sprite-system.js';
import {sampleSpriteClip} from './sprite-animation.js';
import {visibleSpriteBox} from './sprite-framing.js';
import {bodyBox} from './combat-geometry.js';

export function calibrationPacket(fighter,original,draft){
 return {schema:1,kind:'halo-sprite-calibration',fighterId:fighter.id,source:fighter.source,
  frames:draft.frames.map((f,i)=>({path:original.frames[i].path,sha256:original.frames[i].sha256,
   anchor:[...f.anchor],bodyHeight:f.bodyHeight,facing:f.facing}))};
}
function stateFor(pose,tick){
 const names={idle:{},walk:{moving:true},crouch:{crouching:true},jump:{airborne:true},guard:{blocking:true},
  dodge:{dodging:true},hurt:{hurt:true},ko:{ko:true},knockdown:{knockdown:true},phase:{phase:true}};
 return {...(Object.hasOwn(names,pose)?names[pose]:{moveKey:pose}),frame:tick};
}
function downloadJSON(packet,name){
 const url=URL.createObjectURL(new Blob([JSON.stringify(packet,null,2)+'\n'],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function mountSpriteInspector({host,canvas,fighter,art}){
 const original=art,draft=structuredClone(art),registry={[fighter.id]:draft},panel=document.createElement('section');
 panel.className='sprite-inspector';panel.setAttribute('aria-label','Inspection et calibration du sprite');
 panel.innerHTML=`<h3>INSPECTION DES POSES</h3><p class="inspector-note">Seuls les fichiers présents sont affichés. Une pose absente reste signalée, sans animation artificielle.</p>
 <div class="inspector-row"><label>Pose<select data-inspect="pose"></select></label><button type="button" class="ui-button" data-inspect="play">LIRE</button><button type="button" class="ui-button" data-inspect="flip">VOIR VERS LA GAUCHE</button></div>
 <label class="inspector-timeline">Temps de simulation<input data-inspect="tick" type="range" min="0" max="0" step="1" value="0"></label>
 <p data-inspect="status" role="status"></p><div class="inspector-row"><label>Zoom<select data-inspect="zoom"><option value="0.5">50 %</option><option value="1" selected>100 %</option><option value="1.5">150 %</option><option value="2">200 %</option></select></label><label><input data-inspect="boxes" type="checkbox" checked> Repères et collision</label></div>
 <details><summary>CALIBRER CETTE IMAGE</summary><p>Le point d’appui et la hauteur de référence ne modifient pas les collisions du moteur. Exporter ne modifie ni le dépôt ni la sauvegarde.</p><div class="inspector-fields">
 <label>Ancre X<input data-inspect="anchorX" type="number" min="0" max="1" step="0.001"></label><label>Ancre Y<input data-inspect="anchorY" type="number" min="0" max="1" step="0.001"></label><label>Hauteur de référence<input data-inspect="bodyHeight" type="number" min="0.05" max="1" step="0.001"></label><label>Orientation native<select data-inspect="facing"><option value="1">Droite</option><option value="-1">Gauche</option></select></label></div>
 <div class="inspector-row"><button type="button" class="ui-button" data-inspect="reset">RÉINITIALISER</button><button type="button" class="ui-button" data-inspect="export">EXPORTER LA CALIBRATION</button></div><p data-inspect="error" role="alert"></p></details>`;
 host.append(panel);const $=key=>panel.querySelector(`[data-inspect="${key}"]`),ctx=canvas.getContext('2d');
 const poses=[...new Set(['idle','walk','crouch','jump','guard','dodge','hurt','knockdown','ko','phase',...MOVESET_KEYS,...Object.keys(art.clips)])];
 for(const key of poses){const o=document.createElement('option');o.value=key;o.textContent=key+(Object.hasOwn(art.clips,key)?' · présent':' · À PRODUIRE');$('pose').append(o);}
 let disposed=false,playing=false,tick=0,lastTime=0,accumulator=0,raf=0,presentation=1,currentIndex=-1;
 const dirty=new Set(),waiting=new Set();
 function selected(){return sampleSpriteClip(draft,stateFor($('pose').value,tick));}
 function fields(){const sample=selected();if(!sample)return;const frame=sample.frame;currentIndex=sample.frameIndex;
  $('anchorX').value=frame.anchor[0];$('anchorY').value=frame.anchor[1];$('bodyHeight').value=frame.bodyHeight;$('facing').value=frame.facing;
 }
 function draw(){if(disposed)return;const sample=selected();if(!sample)return;
  if(currentIndex!==sample.frameIndex)fields();
  const frame=sample.frame,w=canvas.width,h=canvas.height,zoom=Number($('zoom').value)*.9,x=w/2,y=h*.86;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#0b100d';ctx.fillRect(0,0,w,h);
  if($('boxes').checked){ctx.strokeStyle='#28382d';ctx.lineWidth=1;ctx.beginPath();
   for(let i=x%36;i<w;i+=36){ctx.moveTo(i,0);ctx.lineTo(i,h);}for(let i=y%36;i<h;i+=36){ctx.moveTo(0,i);ctx.lineTo(w,i);}ctx.stroke();
   ctx.strokeStyle='#a4ad83';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.save();ctx.translate(x,y);ctx.scale(zoom,zoom);
  const rendered=drawRasterMonster(ctx,fighter,0,0,{registry,state:stateFor($('pose').value,tick),facing:presentation,shadow:false});
  if(rendered.kind==='loading'&&!waiting.has(frame.path)){waiting.add(frame.path);void spriteCache.load(frame).then(()=>{waiting.delete(frame.path);if(!disposed)draw();});}
  const visible=visibleSpriteBox(fighter,frame,0,0,presentation);
  if($('boxes').checked){const collision=bodyBox({data:fighter,x:0,y:0,crouching:$('pose').value==='crouch'});
   ctx.lineWidth=1/zoom;ctx.strokeStyle='#77d694';ctx.strokeRect(collision.x,collision.y,collision.w,collision.h);
   ctx.setLineDash([5/zoom,4/zoom]);ctx.strokeStyle='#d9bd83';ctx.strokeRect(visible.x,visible.y,visible.w,visible.h);ctx.setLineDash([]);
   ctx.strokeStyle='#e8c775';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.stroke();}
  ctx.restore();canvas.dataset.spriteId=fighter.id;canvas.dataset.artStatus=rendered.kind;
  canvas.dataset.pose=sample.pose;canvas.dataset.requestedPose=sample.requested;canvas.dataset.frameIndex=sample.frameIndex;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',fighter.name+' — '+sample.requested+(sample.fallback?' absente, aperçu idle':''));
  const clipped=x+visible.x*zoom<0||x+(visible.x+visible.w)*zoom>w||y+visible.y*zoom<0||y+(visible.y+visible.h)*zoom>h;
  $('status').textContent=(sample.fallback?'POSE À PRODUIRE — aperçu idle. ':'')+`Image ${sample.index+1}/${draft.clips[sample.pose].frames.length} · tick ${tick}/${sample.total-1} · ${frame.width} × ${frame.height}`+(clipped?' · Déborde de l’aperçu : réduire le zoom.':'')+(dirty.size?' · Calibration locale non appliquée.':'');
  $('tick').max=sample.total-1;$('tick').value=tick;
  $('play').disabled=sample.fallback||draft.clips[sample.pose].frames.length<2;
 }
 function stop(){playing=false;cancelAnimationFrame(raf);raf=0;$('play').textContent='LIRE';}
 function loop(now){if(!playing||disposed)return;
  accumulator+=Math.min(250,now-lastTime);lastTime=now;
  const frames=Math.floor(accumulator/(1000/60));if(frames){accumulator-=frames*1000/60;const sample=selected(),clip=draft.clips[sample.pose];
   tick+=frames;if(clip.loop)tick%=sample.total;else if(tick>=sample.total-1){tick=sample.total-1;stop();}draw();}
  if(playing)raf=requestAnimationFrame(loop);
 }
 $('play').onclick=()=>{if(playing)return stop();if($('play').disabled)return;playing=true;lastTime=performance.now();accumulator=0;if(tick>=selected().total-1)tick=0;$('play').textContent='PAUSE';raf=requestAnimationFrame(loop);};
 $('pose').onchange=()=>{stop();tick=0;currentIndex=-1;draw();};$('tick').oninput=()=>{stop();tick=Number($('tick').value);draw();};
 $('flip').onclick=()=>{presentation*=-1;$('flip').textContent=presentation===1?'VOIR VERS LA GAUCHE':'VOIR VERS LA DROITE';draw();};
 $('boxes').onchange=draw;$('zoom').onchange=draw;
 for(const key of ['anchorX','anchorY','bodyHeight','facing'])$(key).addEventListener('change',()=>{
  const inputs=['anchorX','anchorY','bodyHeight'].map(k=>$(k));
  if(inputs.some(i=>!i.value.trim()||!i.checkValidity()||!Number.isFinite(Number(i.value)))){$('error').textContent='Valeurs invalides : ancre 0–1, hauteur 0,05–1.';return;}
  const frame=selected().frame;frame.anchor=inputs.slice(0,2).map(i=>Number(i.value));frame.bodyHeight=Number(inputs[2].value);frame.facing=Number($('facing').value);
  dirty.add(currentIndex);$('error').textContent='';draw();
 });
 $('reset').onclick=()=>{stop();draft.frames=structuredClone(original.frames);dirty.clear();$('error').textContent='';fields();draw();};
 $('export').onclick=()=>{downloadJSON(calibrationPacket(fighter,original,draft),'HALO_CALIBRATION_'+fighter.id+'.json');$('error').textContent='Export effectué. Appliquer avec scripts/apply-sprite-calibration.py --apply, puis reconstruire le jeu.';};
 const onHidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',onHidden);
 draw();
 return ()=>{disposed=true;stop();document.removeEventListener('visibilitychange',onHidden);panel.remove();};
}
