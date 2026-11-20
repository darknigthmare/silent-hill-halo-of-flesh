import { CHRONICLES, ROSTER, SOURCE_META, createCombatProfile, getFighter, getStage } from './data.js';
import { combatSpriteFor } from './sprite-system.js';
import { chronicleEncounterPlan } from './run-progress.js';
import { drawStage, renderPortrait } from './renderers.js';
import { chronicleArtwork, setChronicleImage } from './chronicle-art.js';
import { attachGlobalAudioUnlock, audio, escapeHTML, loadJSON, writeJSON, CHRONICLES_KEY, returnToCommand } from './shared.js';

attachGlobalAudioUnlock();
const $=(selector)=>document.querySelector(selector);
const progress=loadJSON(CHRONICLES_KEY,{completed:[],attempts:{},grades:{},bestStats:{}});
let selected=CHRONICLES[0];

const els={
  routeList:$('#routeList'),routeCanvas:$('#routeCanvas'),routeSource:$('#routeSource'),routeTitle:$('#routeTitle'),routeSubtitle:$('#routeSubtitle'),
  routeIntro:$('#routeIntro'),routeOutro:$('#routeOutro'),playerFighter:$('#playerFighter'),encounterPath:$('#encounterPath'),routeState:$('#routeState'),
  progressBadge:$('#progressBadge'),launchRoute:$('#launchRoute'),previewRoster:$('#previewRoster'),rosterModal:$('#rosterModal'),modalRouteTitle:$('#modalRouteTitle'),
  modalRoster:$('#modalRoster'),closeRoster:$('#closeRoster'),resetProgress:$('#resetProgress'),backCommand:$('#backCommand')
};

function completed(id){return (progress.completed||[]).includes(id)}
function grade(id){return progress.grades?.[id]||null}
function renderProgress(){const count=(progress.completed||[]).length;els.progressBadge.textContent=`${count}/${CHRONICLES.length} TERMINÉE${count>1?'S':''}`;}
function renderRoutes(){
  els.routeList.textContent='';
  CHRONICLES.forEach((route,index)=>{
    const button=document.createElement('button');button.className=`route-button${route.id===selected.id?' active':''}${completed(route.id)?' completed':''}`;
    const routeGrade=grade(route.id);button.innerHTML=`<span class="route-index">${String(index+1).padStart(2,'0')}</span><span><b>${escapeHTML(route.title)}</b><small>${escapeHTML(SOURCE_META[route.source].short)} · ${escapeHTML(route.subtitle)}</small></span><span class="route-status${routeGrade?' graded':''}">${routeGrade?`RANG ${escapeHTML(routeGrade)}`:completed(route.id)?'ARCHIVÉE':'OUVERTE'}</span>`;
    button.addEventListener('click',()=>{selected=route;audio.ui();renderRoutes();renderSelected();});els.routeList.append(button);
  });
}
function fillPlayerFighters(){
  const previous=els.playerFighter.value;
  els.playerFighter.textContent='';
  const sameSource=ROSTER.filter(f=>f.source===selected.source);
  const recommended=[...sameSource.filter(f=>!f.boss),...sameSource.filter(f=>f.boss),...ROSTER.filter(f=>f.source!==selected.source)];
  recommended.forEach(f=>{const option=document.createElement('option');option.value=f.id;option.textContent=`${f.name} · ${SOURCE_META[f.source].short}`;els.playerFighter.append(option);});
  const preferred=previous&&ROSTER.some(f=>f.id===previous)?previous:(sameSource.find(f=>!f.boss)?.id||ROSTER[0].id);els.playerFighter.value=preferred;
}
const dossierObservation = $('#dossierObservation');
const observationImage = dossierObservation.querySelector('img');
let displayedObservation = null;
dossierObservation.addEventListener('toggle', () => {
  if (dossierObservation.open && !dossierObservation.hidden) {
    setChronicleImage(observationImage, displayedObservation);
  }
});
const dossierEnding = $('#dossierEnding');
const dossierImage = $('#dossierEndingImage');
dossierEnding.addEventListener('toggle', () => {
  if (dossierEnding.open && !dossierEnding.hidden) setChronicleImage(dossierImage, chronicleArtwork(selected.id)?.ending);
});
function renderSelected(){
  const firstStage=getStage(selected.stages[0]);drawStage(els.routeCanvas.getContext('2d'),firstStage,performance.now(),{width:els.routeCanvas.width,height:els.routeCanvas.height,cinematic:true,otherworld:completed(selected.id)?.72:.18,radio:.2});
  const art = chronicleArtwork(selected.id);
  setChronicleImage($('#routeIllustration'), art?.intro);
  dossierEnding.open = false;
  const { queue: encounters } = chronicleEncounterPlan(selected.id);
  const waitingForArt = encounters.some(fighterId => !combatSpriteFor(fighterId));
  const observation = art?.observation || (waitingForArt ? art?.rival : null);
  displayedObservation = observation && selected.fighters.includes(observation.fighterId) ? observation : null;
  dossierObservation.open = false;
  dossierObservation.hidden = !displayedObservation;
  dossierObservation.querySelector('summary').textContent = observation?.title || '';
  dossierObservation.querySelector('p').textContent = observation?.caption || '';
  setChronicleImage(observationImage, null);
  dossierEnding.hidden = !art?.ending || (encounters.length > 0 && !waitingForArt);
  dossierEnding.querySelector('summary').textContent = waitingForArt
    ? 'Voir le dénouement illustré · parcours en attente de sprites'
    : 'Voir le dénouement illustré';
  setChronicleImage(dossierImage, null);
  els.routeSource.textContent=`${SOURCE_META[selected.source].label} · DOSSIER ${String(CHRONICLES.indexOf(selected)+1).padStart(2,'0')}`;
  els.routeTitle.textContent=selected.title;els.routeSubtitle.textContent=selected.subtitle;els.routeIntro.textContent=selected.intro;els.routeOutro.textContent=selected.outro;
  const attempts=progress.attempts?.[selected.id]||0;const best=grade(selected.id);els.routeState.textContent=best?`RANG ${best} · ${attempts} TENTATIVE${attempts>1?'S':''}`:completed(selected.id)?'CHRONIQUE ARCHIVÉE':`${attempts} TENTATIVE${attempts>1?'S':''}`;
  fillPlayerFighters();renderEncounterPath();
}
function renderEncounterPath(){
  els.encounterPath.textContent='';
  selected.fighters.forEach((id,index)=>{
    const f=getFighter(id),card=document.createElement('article');card.className=`encounter${f.boss?' boss':''}`;
    const canvas=document.createElement('canvas');canvas.width=220;canvas.height=135;card.append(canvas);
    const badge=document.createElement('span');badge.className='encounter-number';badge.textContent=`${String(index+1).padStart(2,'0')} · ${getStage(selected.stages[index%selected.stages.length]).name}`;card.append(badge);
    const profile=createCombatProfile(f);const copy=document.createElement('div');copy.className='encounter-copy';copy.innerHTML=`<b>${escapeHTML(f.name)}</b><small>${escapeHTML(profile.trait.name)} · ${escapeHTML(profile.affliction.name)}</small>`;card.append(copy);els.encounterPath.append(card);renderPortrait(canvas,f,{time:performance.now()+index*240});
  });
}
function openRoster(){
  els.modalRouteTitle.textContent=selected.title;els.modalRoster.textContent='';
  const sighting = chronicleArtwork(selected.id)?.sighting;
  if (sighting && selected.fighters.includes(sighting.fighterId)) {
    const figure = document.createElement('figure');
    figure.className = 'manifestation-scene';
    const image = document.createElement('img');
    const caption = document.createElement('figcaption');
    caption.textContent = sighting.caption;
    figure.append(image, caption);
    els.modalRoster.append(figure);
    setChronicleImage(image, sighting);
  }
  selected.fighters.forEach(id=>{const f=getFighter(id),card=document.createElement('article');card.className='modal-fighter';const canvas=document.createElement('canvas');canvas.width=300;canvas.height=230;card.append(canvas);const copy=document.createElement('div');copy.innerHTML=`<b>${escapeHTML(f.name)}</b><small>${escapeHTML(f.game)} · ${escapeHTML(f.signature)}</small>`;card.append(copy);els.modalRoster.append(card);renderPortrait(canvas,f,{time:performance.now()});});
  els.rosterModal.classList.remove('hidden');
}
function launch(){
  // The run controller counts the attempt when the first encounter actually starts.
  const query=new URLSearchParams({preset:'chronicle',p1:els.playerFighter.value,p2:selected.fighters[0],queue:selected.fighters.join(','),stages:selected.stages.join(','),route:selected.id,autostart:'1'});
  location.href=`unified-versus.html?${query}`;
}
function resetProgress(){if(!confirm('Effacer les Chroniques, rangs et tentatives ?'))return;progress.completed=[];progress.attempts={};progress.grades={};progress.bestStats={};writeJSON(CHRONICLES_KEY,progress);renderProgress();renderRoutes();renderSelected();}

els.launchRoute.addEventListener('click',launch);els.previewRoster.addEventListener('click',openRoster);els.closeRoster.addEventListener('click',()=>els.rosterModal.classList.add('hidden'));els.rosterModal.addEventListener('click',e=>{if(e.target===els.rosterModal)els.rosterModal.classList.add('hidden')});els.resetProgress.addEventListener('click',resetProgress);els.backCommand.addEventListener('click',returnToCommand);
addEventListener('keydown',e=>{if(e.code==='Escape'){if(!els.rosterModal.classList.contains('hidden'))els.rosterModal.classList.add('hidden');else returnToCommand();}});
renderProgress();renderRoutes();renderSelected();
