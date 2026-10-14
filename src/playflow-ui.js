import { ACTIONS, loadControls, saveControls, rebindControl, defaultControls, keyLabel } from './player-input.js';

/** Native dialogs provide keyboard focus containment and accessible pause actions. */
export function installPlayflowUI({engine,select,retry,onControlsChanged}) {
  const status=document.createElement('p');status.id='playStatus';status.className='play-status hidden';status.setAttribute('role','status');
  document.body.append(status);
  let statusTimer;
  function announce(message,persistent=false){clearTimeout(statusTimer);status.textContent=message;status.classList.remove('hidden');
    if(!persistent)statusTimer=setTimeout(()=>status.classList.add('hidden'),6000);}
  addEventListener('shhf-storage-status',e=>announce(e.detail.kind==='recovered'?'Mémoire précédente récupérée.':'Mémoire locale indisponible ou invalide. Exportez vos données depuis les réglages.',true));
  const pause=document.createElement('dialog');pause.className='play-dialog';pause.setAttribute('aria-labelledby','pauseTitle');
  pause.innerHTML=`<h2 id="pauseTitle">SIGNAL SUSPENDU</h2><p id="pauseReason">Le combat et les dangers sont arrêtés.</p><div class="play-actions"><button data-pause="resume" class="ui-button primary">REPRENDRE</button><button data-pause="controls" class="ui-button">COMMANDES</button><button data-pause="retry" class="ui-button">RECOMMENCER LE COMBAT</button><button data-pause="select" class="ui-button">RETOUR À LA SÉLECTION</button></div><p class="play-note">Les parcours sont conservés entre les combats. Une interruption en combat reprend au début de cette rencontre.</p>`;
  document.body.append(pause);
  pause.addEventListener('cancel',e=>{e.preventDefault();engine()?.togglePause(false);});
  pause.addEventListener('click',e=>{
    const action=e.target.closest('[data-pause]')?.dataset.pause;if(!action)return;
    if(action==='resume')engine()?.togglePause(false);
    if(action==='select'){pause.close();select();}
    if(action==='retry'&&confirm('Recommencer cette rencontre ?')){pause.close();retry();}
    if(action==='controls')openControls();
  });
  const controls=document.createElement('dialog');controls.className='play-dialog controls-dialog';controls.setAttribute('aria-labelledby','controlsTitle');
  controls.innerHTML=`<h2 id="controlsTitle">COMMANDES DU CONTACT</h2><p>Choisissez une action, puis une touche physique. Échap annule. Les conflits entre sujets sont refusés.</p><div class="play-actions"><label>Sujet <select id="bindingPlayer" class="ui-select"><option value="0">I</option><option value="1">II</option></select></label><button id="resetBindings" class="ui-button">RÉTABLIR LES TOUCHES</button><button id="closeBindings" class="ui-button primary">FERMER</button></div><div id="bindingGrid" class="binding-grid"></div><p id="bindingMessage" role="status"></p><label>Zone morte du stick <input id="bindingDeadzone" type="range" min="15" max="65" step="5"><output id="deadzoneValue"></output></label><p class="play-note">Manette standard : croix/stick déplacer · A saut · X léger · Y lourd · B technique · LB/RB garde · LT projection · RT Super · Retour esquive · Start pause. La validation sur manettes physiques reste à effectuer.</p><p class="play-note">Les variantes utilisent la direction tenue : bas + attaque, avant + attaque, garde relâchée + attaque. Les timings restent des adaptations Versus.</p>`;
  document.body.append(controls);
  let bindings=loadControls(),waiting=null;
  const find=id=>controls.querySelector(id), grid=find('#bindingGrid'),message=find('#bindingMessage');
  function renderBindings(){grid.textContent='';waiting=null;
    const player=+find('#bindingPlayer').value;
    for(const [action,label]of Object.entries(ACTIONS)){const b=document.createElement('button');b.type='button';b.className='ui-button';
      b.dataset.binding=action;b.textContent=`${label} : ${keyLabel(bindings.players[player][action])}`;
      b.addEventListener('click',()=>{waiting={player,action};message.textContent=`Nouvelle touche pour ${label}…`;});grid.append(b);}
    find('#bindingDeadzone').value=String(bindings.deadzone*100);find('#deadzoneValue').textContent=` ${Math.round(bindings.deadzone*100)} %`;
  }
  function persist(){if(!saveControls(bindings))message.textContent='Commandes non sauvegardées : stockage indisponible.';
    else message.textContent='Commandes enregistrées.';onControlsChanged(bindings);}
  function openControls(){bindings=loadControls();renderBindings();message.textContent='';
    if(engine()&&!engine().paused)engine().togglePause(true);
    if(!controls.open)controls.showModal();}
  controls.addEventListener('keydown',e=>{if(!waiting)return;e.preventDefault();e.stopPropagation();
    if(e.code==='Escape'){waiting=null;message.textContent='Affectation annulée.';return;}
    try{bindings=rebindControl(bindings,waiting.player,waiting.action,e.code);persist();renderBindings();}catch(error){message.textContent=error.message;}
  },true);
  find('#bindingPlayer').addEventListener('change',renderBindings);
  find('#resetBindings').addEventListener('click',()=>{bindings=defaultControls();persist();renderBindings();});
  find('#closeBindings').addEventListener('click',()=>controls.close());
  controls.addEventListener('close',()=>{waiting=null;engine()?.clearInputs();});
  find('#bindingDeadzone').addEventListener('input',e=>{bindings={...bindings,deadzone:+e.target.value/100};persist();find('#deadzoneValue').textContent=` ${e.target.value} %`;});
  document.querySelector('#openControls')?.addEventListener('click',openControls);
  return {announce,openControls,syncPause(snapshot){
    if(snapshot.paused&&engine()?.phase!=='matchEnd'){if(!pause.open)pause.showModal();}
    else if(pause.open){pause.close();document.querySelector('#game')?.focus({preventScroll:true});}
    const button=document.querySelector('#pauseBtn');if(button){button.textContent=snapshot.paused?'REPRENDRE':'PAUSE';button.setAttribute('aria-pressed',String(snapshot.paused));}
  },close(){controls.close();pause.close();}};
}
