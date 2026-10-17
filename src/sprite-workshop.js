import {mountSpriteInspector} from './sprite-inspector.js';
import {ROSTER,SOURCE_META,VERSION} from './data.js';
import {spriteCoverage,spriteFor,spriteStatus,paintRasterPortrait,assetURL} from './sprite-system.js';
import {escapeHTML} from './shared.js';
import {presentationClipCoverage} from './sprite-clips.js';
import {PRESENTATION_KEYS,poseLabel} from './sprite-poses.js';
const $=s=>document.querySelector(s),stats=spriteCoverage(ROSTER),pageSize=18;
let disposeInspector=null;
let selected=ROSTER.find(f=>spriteFor(f)),page=0;
$('#coverage').textContent=`${stats.integrated} / ${stats.total} images intégrées · ${stats.missing.length} à produire · ${stats.certified} certifiées 1:1 · ${stats.animatedClips} clips animés`;
for(const [id,meta] of Object.entries(SOURCE_META)){const o=document.createElement('option');o.value=id;o.textContent=meta.label;$('#spriteSource').append(o);}
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filter(){const q=normalize($('#spriteSearch').value),source=$('#spriteSource').value,type=$('#spriteFilter').value;
 return ROSTER.filter(f=>(source==='all'||f.source===source)&&(type==='all'||(type==='ready'?!!spriteFor(f):!spriteFor(f)))&&normalize(f.name+' '+f.id+' '+f.game).includes(q));}
function details(){disposeInspector?.();disposeInspector=null;const f=selected,art=spriteFor(f),status=spriteStatus(f),el=$('#spriteDetail');el.textContent='';if(!f){el.textContent='Aucun profil sélectionné dans cette recherche.';return;}
 const c=document.createElement('canvas');c.width=720;c.height=500;el.append(c);if(!art)paintRasterPortrait(c,f);
 const presentations=presentationClipCoverage(art);
 const copy=document.createElement('div');copy.innerHTML=`<small>${escapeHTML(f.game)}</small><h2>${escapeHTML(f.name)}</h2><code>${escapeHTML(f.id)}</code><p>${escapeHTML(status.label)}</p><dl><dt>Images de poses</dt><dd>${status.frames}</dd><dt>Clips animés</dt><dd>${status.animatedClips}</dd><dt>Présentations importées</dt><dd>${presentations.present.length} / ${PRESENTATION_KEYS.length} · ${presentations.animated} animées</dd><dt>Fidélité visuelle</dt><dd>${art?'À valider':'Non évaluée'}</dd><dt>Affectation</dt><dd>Identifiant exact, sans clone</dd></dl><p>${escapeHTML(art?.notes||'Aucun bitmap de qualité accepté pour ce profil. Conserver sa variante et son média; ne pas réutiliser le dessin d’un autre monstre.')}</p><p data-presentation-coverage>${presentations.missing.length?'Séquences à produire : '+escapeHTML(presentations.missing.map(poseLabel).join(' ; '))+'.':'Les huit séquences sont importées ; leur présence ne certifie pas la fidélité visuelle.'}</p><p>Importer le prochain PNG individuel avec <code>python scripts/import-sprite.py --help</code>. Le contrôle technique n’atteste pas la fidélité canonique.</p>`;
 if(art){const link=document.createElement('a');link.href=`unified-versus.html?p1=${encodeURIComponent(f.id)}&p2=${encodeURIComponent(f.id)}`;link.className='ui-button';link.textContent='OBSERVER CE SPRITE EN DUEL MIROIR';copy.append(link);
  const image=document.createElement('a');image.href=assetURL(art.frames[0].path);image.textContent=' Ouvrir le bitmap individuel';copy.append(image);}
 el.append(copy);if(art)disposeInspector=mountSpriteInspector({host:copy,canvas:c,fighter:f,art});
}
function render(){const pool=filter(),count=Math.max(1,Math.ceil(pool.length/pageSize));page=Math.max(0,Math.min(page,count-1));const el=$('#spriteCards');el.textContent='';
 for(const f of pool.slice(page*pageSize,(page+1)*pageSize)){const b=document.createElement('button');b.className='sprite-card'+(selected?.id===f.id?' active':'');b.dataset.id=f.id;
 const c=document.createElement('canvas');c.width=300;c.height=200;b.append(c);const text=document.createElement('div');text.innerHTML=`<strong>${escapeHTML(f.name)}</strong><small>${escapeHTML(SOURCE_META[f.source].short)} · ${escapeHTML(spriteStatus(f).label)}</small>`;b.append(text);b.addEventListener('click',()=>{selected=f;render();details();});el.append(b);paintRasterPortrait(c,f);}
 if(!pool.length)el.textContent='Aucun profil dans cette recherche.';$('#spritePage').textContent=`${pool.length} profils · ${page+1}/${count}`;$('#spritePrev').disabled=page===0;$('#spriteNext').disabled=page>=count-1;
}
for(const id of ['spriteSearch','spriteSource','spriteFilter'])$('#'+id).addEventListener(id==='spriteSearch'?'input':'change',()=>{page=0;const pool=filter();if(!pool.slice(0,pageSize).some(f=>f.id===selected?.id))selected=pool[0]||null;render();details();});
function turnPage(delta){page+=delta;const pool=filter();selected=pool[Math.max(0,page)*pageSize]||pool[0]||null;render();details();}
$('#spritePrev').onclick=()=>turnPage(-1);$('#spriteNext').onclick=()=>turnPage(1);
$('#exportSpriteQueue').onclick=()=>{const payload={schema:1,version:VERSION,stats,presentationKeys:PRESENTATION_KEYS,queue:ROSTER.map(f=>({id:f.id,source:f.source,name:f.name,...spriteStatus(f),presentations:presentationClipCoverage(spriteFor(f))}))};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='HALO_SUIVI_SPRITES_v'+VERSION+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
render();details();
