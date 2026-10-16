import {clipPacket,clipSummary,createClipDraft,moveTiming,validateClip,MAX_CLIP_STEPS} from './sprite-clips.js';

/** Disposable local timeline. Draft/export are not acceptance of an artwork or a server write. */
export function mountClipEditor({host,fighter,original,draft,getPose,onChange}){
 const section=document.createElement('details');section.className='clip-editor';
 section.innerHTML=`<summary>MONTER LES IMAGES IMPORTÉES</summary>
 <p>Aucune image n’est générée ici. Chaque étape référence un PNG/WebP individuel déjà importé. Réutiliser une image ne crée pas une nouvelle pose.</p>
 <p data-clip="timing"></p><div data-clip="rows" class="clip-rows"></div>
 <div class="inspector-row"><button type="button" class="ui-button" data-clip="add">AJOUTER UNE ÉTAPE</button><label><input type="checkbox" data-clip="loop"> Boucler</label></div>
 <div class="inspector-row"><button type="button" class="ui-button" data-clip="preview">PRÉVISUALISER LE BROUILLON</button><button type="button" class="ui-button" data-clip="reset">ANNULER CE CLIP</button><button type="button" class="ui-button" data-clip="export">EXPORTER CE CLIP</button></div>
 <p data-clip="status" role="status"></p><p data-clip="error" role="alert"></p>`;
 host.append(section);const $=key=>section.querySelector(`[data-clip="${key}"]`);
 let pose=getPose(),working=createClipDraft(draft,pose),disposed=false;
 const workingPoses=new Map();
 function message(){const s=clipSummary(draft,working),timing=moveTiming(fighter,pose);
  $('status').textContent=`${s.steps} étapes · ${s.distinct} images distinctes · ${Number.isFinite(s.total)?s.total:'—'} ticks à 60 Hz`+(s.animated?' · séquence multi-images candidate':' · pose statique, pas une animation')+'. Brouillon local, non publié.';
  $('timing').textContent=timing?`${timing.name} — préparation ${timing.startup}, impact ${timing.active}, récupération ${timing.recovery} ticks. Le moteur dure ${timing.total} ticks ; les dégâts et fenêtres de collision ne sont pas modifiés.`:'Durées de présentation uniquement. Les images doivent représenter la pose choisie.';
  $('loop').disabled=!!timing;$('loop').checked=working.loop;$('add').disabled=working.frames.length>=MAX_CLIP_STEPS;
 }
 function render(){if(disposed)return;$('rows').textContent='';
  working.frames.forEach((frame,index)=>{const row=document.createElement('div');row.className='clip-row';row.dataset.step=index;
   const label=document.createElement('label');label.textContent=`Étape ${index+1} · image `;const select=document.createElement('select');select.dataset.clipFrame=index;select.setAttribute('aria-label',`Image de l’étape ${index+1}`);
   draft.frames.forEach((f,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${i+1} — ${f.width} × ${f.height} — ${f.sha256.slice(0,8)}`;select.append(option);});select.value=frame;label.append(select);row.append(label);
   const timeLabel=document.createElement('label');timeLabel.textContent='Ticks ';const input=document.createElement('input');Object.assign(input,{type:'number',min:'1',max:'600',step:'1',value:String(working.frameTicks[index])});input.dataset.clipTicks=index;input.setAttribute('aria-label',`Durée de l’étape ${index+1}`);timeLabel.append(input);row.append(timeLabel);
   select.onchange=()=>{working.frames[index]=Number(select.value);message();};
   input.oninput=()=>{working.frameTicks[index]=input.value.trim()?Number(input.value):NaN;message();};
   for(const [name,text,disabled,action] of [
    ['up','↑',index===0,()=>swap(index,index-1)],['down','↓',index===working.frames.length-1,()=>swap(index,index+1)],
    ['remove','RETIRER',working.frames.length===1,()=>{working.frames.splice(index,1);working.frameTicks.splice(index,1);render();}]
   ]){const b=document.createElement('button');b.type='button';b.className='ui-button';b.textContent=text;b.disabled=disabled;b.dataset.clipAction=name;b.setAttribute('aria-label',`${name==='up'?'Monter':name==='down'?'Descendre':'Retirer'} l’étape ${index+1}`);b.onclick=action;row.append(b);}
   $('rows').append(row);
  });message();
 }
 function swap(a,b){for(const list of [working.frames,working.frameTicks])[list[a],list[b]]=[list[b],list[a]];render();}
 function commitDraft(){working=validateClip(draft,pose,working);draft.clips[pose]=structuredClone(working);$('error').textContent='';onChange();message();}
 $('add').onclick=()=>{if(working.frames.length>=MAX_CLIP_STEPS)return;working.frames.push(working.frames.at(-1)||0);working.frameTicks.push(1);render();};
 $('loop').onchange=()=>{working.loop=$('loop').checked;message();};
 $('preview').onclick=()=>{try{commitDraft();}catch(e){$('error').textContent=e.message;}};
 $('reset').onclick=()=>{if(Object.hasOwn(original.clips,pose))draft.clips[pose]=structuredClone(original.clips[pose]);else delete draft.clips[pose];working=createClipDraft(draft,pose);$('error').textContent='';onChange();render();};
 $('export').onclick=()=>{try{
  commitDraft();const packet=clipPacket(fighter,original,draft,pose);
  const url=URL.createObjectURL(new Blob([JSON.stringify(packet,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`HALO_CLIP_${fighter.id}_${pose}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('status').textContent+=' Export JSON effectué ; vérifier avec apply-sprite-clip.py. Aucune image ni revue artistique livrée par cet export.';
 }catch(e){$('error').textContent=e.message;}};
 render();return {sync(){if(getPose()===pose)return;workingPoses.set(pose,structuredClone(working));pose=getPose();working=workingPoses.has(pose)?structuredClone(workingPoses.get(pose)):createClipDraft(draft,pose);$('error').textContent='';render();},dispose(){disposed=true;section.remove();}};
}
