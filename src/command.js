import { drawRasterMonster, spriteCache, spriteFor } from './sprite-system.js';
import { getFighter } from './data.js';
import { CONTENT_STATS, SAVE_KEY, VERSION } from './data.js';
import { readState, writeState, exportMemory, importMemory, KEYS } from './save-store.js';
import { loadRun, validateRun } from './run-progress.js';
import { validControls } from './player-input.js';

const SETTINGS_KEY = 'sh-halo-of-flesh-settings-v1';
const DEFAULT_SETTINGS = {
  scanlines: true,
  grain: true,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  highContrast: matchMedia('(prefers-contrast: more)').matches,
  vibration: true,
  masterVolume: 65,
  difficulty: 'normal',
  otherworldShift: true,
  stageHazards: true,
  radioWarning: true,
  screenShake: true,
  adaptiveAI: true,
  fatalities: true,
  stageFatalities: true,
  stageAnimations: true
};

const modes = {
  continue: {
    kicker: 'REPRISE DU SIGNAL',
    title: 'RETOUR<br><span>DANS LA BRUME.</span>',
    text: 'Le dernier cauchemar reprend avec la même manifestation, la même arène et le même Rite.',
    choices: ['DERNIER CAUCHEMAR','MÉMOIRE LOCALE'],
    scene: 'fog', frequency: '106.7', code: 'SHHF/00', signal: 'MÉMOIRE', data: ['MÉMOIRE LOCALE','BRUME VERROUILLÉE']
  },
  chronicles: {
    kicker: 'ROUTES NARRATIVES',
    title: 'CHRONIQUES<br><span>DE LA BRUME.</span>',
    text: `${CONTENT_STATS.chronicles} routes relient affrontements, dossiers, lieux, rangs et conséquences.`,
    choices: [`${CONTENT_STATS.chronicles} ROUTES`,'RANGS S–D','BOSS FINAUX'],
    scene: 'chronicles', frequency: '87.9', code: 'SHHF/15', signal: 'RÉCIT', data: [`${CONTENT_STATS.chronicles} ROUTES`,'RELEVÉ LOCAL']
  },
  versus: {
    kicker: 'CONTACT DE MANIFESTATION',
    title: 'CHOISIS<br><span>TON CAUCHEMAR.</span>',
    text: `Sélection des sujets I/II, ${CONTENT_STATS.fighters} manifestations, ${CONTENT_STATS.moves} coups documentés, ordinateur, local et ${CONTENT_STATS.stages} arènes.`,
    choices: ['SUJET I VS MANIFESTATION','DEUX SUJETS LOCAUX',`MOVESETS ${CONTENT_STATS.moves / CONTENT_STATS.fighters} COMMANDES`],
    scene: 'duel', frequency: '93.1', code: 'SHHF/VS', signal: 'CONTACT', data: [`${CONTENT_STATS.fighters} FORMES`,`${CONTENT_STATS.moves} COUPS`]
  },
  arcade: {
    kicker: 'DESCENTE ALÉATOIRE',
    title: 'TRAVERSE<br><span>L’OTHERWORLD.</span>',
    text: 'Un parcours de sept rencontres, difficulté progressive, Otherworld dynamique et dernier boss aléatoire.',
    choices: ['7 COMBATS','DANGERS D’ARÈNE','RECORD'],
    scene: 'arcade', frequency: '101.3', code: 'SHHF/07', signal: 'DESCENTE', data: ['7 RENCONTRES','AUCUN RETOUR']
  },
  ritual: {
    kicker: 'ÉPREUVE DES SCEAUX',
    title: 'LES RITES<br><span>DU JUGEMENT.</span>',
    text: `${CONTENT_STATS.rituals - 1} altérations successives, endurance persistante, phases de boss et classement local.`,
    choices: [`${CONTENT_STATS.rituals - 1} RITES`,'ENDURANCE','PHASES DE BOSS'],
    scene: 'ritual', frequency: '66.6', code: 'SHHF/RT', signal: 'RITUEL', data: [`${CONTENT_STATS.rituals - 1} SCEAUX`,'ENDURANCE']
  },
  boss: {
    kicker: 'GRANDS TOURMENTS',
    title: 'LES GRANDS<br><span>TOURMENTS.</span>',
    text: 'Un circuit réservé aux manifestations majeures et aux boss, avec endurance persistante.',
    choices: [`${CONTENT_STATS.bosses} BOSS`,'ENDURANCE','CLASSEMENT LOCAL'],
    scene: 'boss', frequency: '120.4', code: 'SHHF/BX', signal: 'TOURMENT', data: [`${CONTENT_STATS.bosses} BOSS`,`${CONTENT_STATS.bossPhases} PHASES`]
  },
  training: {
    kicker: 'CELLULE D’OBSERVATION',
    title: 'ÉTUDIE<br><span>LA MANIFESTATION.</span>',
    text: 'Frame data, vingt commandes par manifestation, ripostes contextuelles, hitboxes, traits, afflictions, parade parfaite et Otherworld forcé.',
    choices: [`${CONTENT_STATS.moves / CONTENT_STATS.fighters} COMMANDES`,'RIPOSTES CONTEXTUELLES','FORCER OTHERWORLD'],
    scene: 'training', frequency: '104.8', code: 'SHHF/OB', signal: 'OBSERVATION', data: [`${CONTENT_STATS.moves / CONTENT_STATS.fighters} COMMANDES`,'DONNÉES DE FRAMES']
  },
  archive: {
    kicker: 'BESTIAIRE ET PREUVES',
    title: 'ARCHIVES<br><span>DE L’OTHERWORLD.</span>',
    text: `Catalogue filtrable, ${CONTENT_STATS.moves.toLocaleString('fr-FR')} coups, comportement canonique, adaptation versus et matrice de fidélité.`,
    choices: [`${CONTENT_STATS.fighters} PROFILS`,`${CONTENT_STATS.moves} COUPS`,`${CONTENT_STATS.stages} LIEUX`],
    scene: 'archive', frequency: '108.2', code: 'SHHF/AR', signal: 'PREUVES', data: [`${CONTENT_STATS.moves} COUPS`,`${CONTENT_STATS.sources} SOURCES`]
  },
  options: {
    kicker: 'RÉGLAGES DU SYSTÈME',
    title: 'RÈGLE<br><span>LE SIGNAL.</span>',
    text: 'Affichage, confort, audio, IA adaptative, terrains, mise en scène des lieux, Otherworld et dangers d’arène.',
    choices: ['ACCESSIBILITÉ','RÈGLES DYNAMIQUES','SAUVEGARDE'],
    scene: 'options', frequency: '88.3', code: 'SHHF/OP', signal: 'RÉGLAGES', data: ['ACCESSIBILITÉ','LOCAL UNIQUEMENT']
  }
};

const moduleUrls = {
  chronicles: 'modules/chronicles.html',
  versus: 'modules/unified-versus.html?mode=versus',
  arcade: 'modules/unified-versus.html?mode=arcade',
  ritual: 'modules/unified-versus.html?mode=ritual',
  boss: 'modules/unified-versus.html?mode=boss',
  training: 'modules/unified-versus.html?mode=training',
  archive: 'modules/archive.html'
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const items = $$('.command-item');
const heroCanvas = $('#heroCanvas');
const ctx = heroCanvas.getContext('2d');
const bgCanvas = $('#command-bg');
const bg = bgCanvas.getContext('2d');
const player = $('#module-player');
const frame = $('#moduleFrame');
const loading = $('#loading');
const modal = $('#optionsModal');
const statusPanel = $('#systemStatus');
const statusText = $('#systemStatusText');
const statusAction = $('#systemStatusAction');
const statusDismiss = $('#systemStatusDismiss');
const MEMORY_PREFIX = 'sh-halo-of-flesh-';
const MEMORY_SCHEMA = 'shhf-memory-v1';
const BOOLEAN_SETTINGS = Object.keys(DEFAULT_SETTINGS).filter(key => typeof DEFAULT_SETTINGS[key] === 'boolean');
const VALID_DIFFICULTIES = new Set(['story','normal','hard']);
let active = 0;
let settings = normaliseSettings(readStoredObject(SETTINGS_KEY, DEFAULT_SETTINGS));
let raf = 0;
let radioTimer = 0;
let modalReturnFocus = null;
let deferredInstallPrompt = null;
let swRegistration = null;
let statusActionHandler = null;
let reloadingForWorker = false;

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function readStoredObject(key, fallback = {}) { return readState(key,fallback); }
function writeStoredObject(key,value) {
  const success = Boolean(writeState(key,value));
  if(!success)showStatus('LA MÉMOIRE LOCALE EST INACCESSIBLE.', { tone: 'error' });
  return success;
}
function normaliseSettings(candidate = {}) {
  const out = { ...DEFAULT_SETTINGS };
  for (const key of BOOLEAN_SETTINGS) out[key] = typeof candidate[key] === 'boolean' ? candidate[key] : DEFAULT_SETTINGS[key];
  const volume = Number(candidate.masterVolume);
  out.masterVolume = Number.isFinite(volume) ? Math.max(0, Math.min(100, Math.round(volume / 5) * 5)) : DEFAULT_SETTINGS.masterVolume;
  out.difficulty = VALID_DIFFICULTIES.has(candidate.difficulty) ? candidate.difficulty : DEFAULT_SETTINGS.difficulty;
  return out;
}
function showStatus(message, { actionLabel = '', action = null, tone = '', sticky = false } = {}) {
  statusText.textContent = message;
  statusPanel.classList.remove('hidden','offline','success','error');
  if (tone) statusPanel.classList.add(tone);
  statusActionHandler = typeof action === 'function' ? action : null;
  statusAction.textContent = actionLabel || 'APPLIQUER';
  statusAction.classList.toggle('hidden', !statusActionHandler);
  statusPanel.dataset.sticky = sticky ? 'true' : 'false';
  if (!sticky && !statusActionHandler) {
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(() => statusPanel.classList.add('hidden'), 4600);
  }
}
function hideStatus() {
  statusPanel.classList.add('hidden');
  statusActionHandler = null;
  statusAction.classList.add('hidden');
}
function saveSettings() {
  settings = normaliseSettings(settings);
  if (writeStoredObject(SETTINGS_KEY, settings)) {
    window.dispatchEvent(new CustomEvent('shhf-settings-changed', { detail: { ...settings } }));
  }
}
function applySettings() {
  document.querySelector('.scanlines')?.classList.toggle('hidden', !settings.scanlines);
  document.querySelector('.grain')?.classList.toggle('hidden', !settings.grain);
  document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
  document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  for (const button of $$('[data-setting]')) {
    const key = button.dataset.setting;
    const activeSetting = Boolean(settings[key]);
    button.classList.toggle('on', activeSetting);
    button.textContent = activeSetting ? 'ACTIF' : 'INACTIF';
    button.setAttribute('aria-pressed', String(activeSetting));
  }
  const volume = $('[data-range="masterVolume"]');
  if (volume) volume.value = String(settings.masterVolume);
  if ($('#difficulty')) $('#difficulty').value = settings.difficulty;
  syncAnimation();
}
function currentMode() { return items[active]?.dataset.mode || 'continue'; }
function select(index, { focus = false } = {}) {
  active = (index + items.length) % items.length;
  items.forEach((item,i) => {
    const selected = i === active;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-current', selected ? 'true' : 'false');
    if (selected && focus) item.focus({ preventScroll: true });
  });
  const mode = currentMode();
  const data = modes[mode];
  $('#heroKicker').textContent = data.kicker;
  $('#heroTitle').innerHTML = data.title;
  $('#heroText').textContent = data.text;
  $('#heroChoices').innerHTML = data.choices.map((label,i)=>`<span class="hero-choice ${i===0?'active':''}">${label}</span>`).join('');
  $('#heroData').innerHTML = (data.data || []).map(label=>`<span>${label}</span>`).join('');
  $('#signalFrequency').textContent = data.frequency || '106.7';
  $('#signalState').textContent = data.signal || 'STATIC';
  $('#caseStamp').textContent = `DOSSIER ${String(active).padStart(2,'0')} — ${(data.signal || data.scene).toUpperCase()}`;
  $('#evidenceCode').textContent = data.code || `SHHF/${String(active).padStart(2,'0')}`;
  document.documentElement.dataset.scene = data.scene;
  drawHero(data.scene, performance.now());
}
function launch(mode = currentMode()) {
  if (mode === 'options') return openOptions();
  let resumeUrl = null;
  if (mode === 'continue') {
    const run = loadRun();
    if (run && run.status !== 'complete') resumeUrl = `modules/unified-versus.html?preset=${run.mode}&resume=1`;
    const saved = readStoredObject(SAVE_KEY, {});
    mode = moduleUrls[saved.lastMode] ? saved.lastMode : 'versus';
  }
  const url = resumeUrl || moduleUrls[mode];
  if (!url) return;
  loading.classList.remove('hidden');
  player.classList.add('show');
  player.setAttribute('aria-hidden','false');
  frame.src = url;
  writeStoredObject(SAVE_KEY, { ...readStoredObject(SAVE_KEY, {}), lastMode: mode, lastOpened: Date.now() });
  syncAnimation();
}
function closeModule() {
  player.classList.remove('show');
  player.setAttribute('aria-hidden','true');
  frame.src = 'about:blank';
  loading.classList.remove('hidden');
  syncAnimation();
  items[active]?.focus({ preventScroll: true });
}
function focusableInModal() {
  return [...modal.querySelectorAll('button:not([disabled]),select:not([disabled]),input:not([disabled]),a[href]')]
    .filter(element => !element.hidden && getComputedStyle(element).display !== 'none');
}
function openOptions() {
  modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : items[active];
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  $('#shell').inert = true;
  requestAnimationFrame(() => ($('#closeOptions') || focusableInModal()[0])?.focus());
}
function closeOptions() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  $('#shell').inert = false;
  modalReturnFocus?.focus?.({ preventScroll: true });
}
function trapModalFocus(event) {
  if (event.key !== 'Tab' || modal.classList.contains('hidden')) return;
  const focusable = focusableInModal();
  if (!focusable.length) return;
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    showStatus('LE PLEIN ÉCRAN A ÉTÉ REFUSÉ.', { tone: 'error' });
  }
}
function syncFullscreenButton() {
  const button = $('#fullscreen');
  if (!button) return;
  const enabled = Boolean(document.fullscreenElement);
  button.textContent = enabled ? 'DÉSACTIVER' : 'ACTIVER';
  button.classList.toggle('on', enabled);
  button.setAttribute('aria-pressed', String(enabled));
}
function collectMemory() { return exportMemory(VERSION,undefined,{[KEYS.run]:validateRun,[KEYS.controls]:validControls}); }
function downloadMemory() {
  const blob = new Blob([`${JSON.stringify(collectMemory(), null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `HALO-OF-FLESH_MEMORY_v${VERSION}_${new Date().toISOString().slice(0,10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showStatus('MÉMOIRE EXPORTÉE.', { tone: 'success' });
}
async function importMemoryFile(file) {
  if (!file || file.size > 2_000_000) throw new Error('Fichier absent ou trop volumineux.');
  const payload = JSON.parse(await file.text());
  if (payload?.schema !== MEMORY_SCHEMA || !isPlainRecord(payload.entries)) throw new Error('Format de mémoire inconnu.');
  if(payload.entries[KEYS.run] && !validateRun(payload.entries[KEYS.run])) throw new Error('Parcours importé incompatible.');
  if(payload.entries[KEYS.controls] && !validControls(payload.entries[KEYS.controls])) throw new Error('Commandes importées invalides.');
  const restored = importMemory(payload);
  settings = normaliseSettings(readStoredObject(SETTINGS_KEY, DEFAULT_SETTINGS));
  applySettings();
  showStatus(`${restored} ENTRÉES DE MÉMOIRE RESTAURÉES.`, { tone: 'success' });
}
async function clearOfflineCache() {
  try {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHES' });
      showStatus('PURGE DU CACHE EN COURS…', { sticky: true });
    } else if ('caches' in window) {
      await Promise.all((await caches.keys()).filter(key => key.startsWith('halo-of-flesh-')).map(key => caches.delete(key)));
      showStatus('CACHE HORS LIGNE PURGÉ.', { tone: 'success' });
    }
  } catch {
    showStatus('PURGE DU CACHE IMPOSSIBLE.', { tone: 'error' });
  }
}
function removeProjectMemory() {
  try {
    const keys = [];
    for (let i=0;i<localStorage.length;i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(MEMORY_PREFIX)) keys.push(key);
    }
    keys.forEach(key => localStorage.removeItem(key));
  } catch {}
}
function shouldAnimate() {
  return !document.hidden && !player.classList.contains('show') && !settings.reducedMotion;
}
function syncAnimation() {
  cancelAnimationFrame(raf);
  raf = 0;
  drawCommandBackground(performance.now());
}

items.forEach((item,i)=>{
  item.addEventListener('mouseenter',()=>select(i));
  item.addEventListener('focus',()=>select(i));
  item.addEventListener('click',()=>{select(i);launch();});
});
frame.addEventListener('load',()=>window.setTimeout(()=>loading.classList.add('hidden'),160));
$('#returnCommand').addEventListener('click',closeModule);
$('#reloadModule').addEventListener('click',()=>{loading.classList.remove('hidden');frame.src = frame.src;});
$('#closeOptions').addEventListener('click',closeOptions);
modal.addEventListener('click',event=>{if(event.target===modal)closeOptions();});
modal.addEventListener('keydown',trapModalFocus);
$('#fullscreen').addEventListener('click',toggleFullscreen);
document.addEventListener('fullscreenchange',syncFullscreenButton);
statusDismiss.addEventListener('click',hideStatus);
statusAction.addEventListener('click',()=>statusActionHandler?.());
$('#exportMemory').addEventListener('click',downloadMemory);
$('#importMemory').addEventListener('click',()=>$('#importMemoryFile').click());
$('#importMemoryFile').addEventListener('change',async event=>{
  try { await importMemoryFile(event.target.files?.[0]); closeOptions(); }
  catch (error) { showStatus(`IMPORT REFUSÉ : ${error.message}`, { tone: 'error', sticky: true }); }
  finally { event.target.value = ''; }
});
$('#clearOfflineCache').addEventListener('click',clearOfflineCache);
$('#resetSave').addEventListener('click',()=>{
  if (confirm('Effacer toute la progression, les réglages, les relevés et le dernier cauchemar ?')) {
    removeProjectMemory();
    settings = normaliseSettings(DEFAULT_SETTINGS);
    applySettings();
    showStatus('MÉMOIRE LOCALE RÉINITIALISÉE.', { tone: 'success' });
  }
});
$$('[data-setting]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.setting;
  if (!(key in DEFAULT_SETTINGS)) return;
  settings[key]=!settings[key];
  saveSettings();
  applySettings();
}));
$('[data-range="masterVolume"]').addEventListener('input',event=>{settings.masterVolume=Number(event.target.value);saveSettings();});
$('#difficulty').addEventListener('change',event=>{settings.difficulty=event.target.value;saveSettings();applySettings();});

document.addEventListener('visibilitychange',syncAnimation);
addEventListener('keydown',event=>{
  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.target?.isContentEditable) return;
  if (event.repeat && !['ArrowDown','ArrowUp'].includes(event.code)) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
  if (player.classList.contains('show')) {
    if (event.code==='Escape') { event.preventDefault(); closeModule(); }
    return;
  }
  if (!modal.classList.contains('hidden')) {
    if (event.code==='Escape') { event.preventDefault(); closeOptions(); }
    return;
  }
  if (event.code==='ArrowDown') { event.preventDefault(); select(active+1,{focus:true}); }
  if (event.code==='ArrowUp') { event.preventDefault(); select(active-1,{focus:true}); }
  if (event.code==='Enter') { event.preventDefault(); launch(); }
  if (event.code==='KeyF') { event.preventDefault(); void toggleFullscreen(); }
});
addEventListener('message',event=>{
  const expectedOrigin = location.origin === 'null' ? 'null' : location.origin;
  if (event.source !== frame.contentWindow || event.origin !== expectedOrigin || !isPlainRecord(event.data)) return;
  if (event.data.type==='SHHF_RETURN') closeModule();
  if (event.data.type==='SHHF_OPEN' && moduleUrls[event.data.mode]) launch(event.data.mode);
});

function drawCommandBackground(time=0) {
  const d=Math.min(devicePixelRatio||1,2);
  const w=innerWidth,h=innerHeight;
  if(bgCanvas.width!==Math.floor(w*d)||bgCanvas.height!==Math.floor(h*d)){bgCanvas.width=Math.floor(w*d);bgCanvas.height=Math.floor(h*d);}
  bg.setTransform(d,0,0,d,0,0);
  const g=bg.createRadialGradient(w*.73,h*.24,0,w*.73,h*.24,Math.max(w,h));
  g.addColorStop(0,'#2a312c');g.addColorStop(.38,'#101510');g.addColorStop(1,'#020302');
  bg.fillStyle=g;bg.fillRect(0,0,w,h);
  bg.globalAlpha=.13;
  const drift=settings.reducedMotion?0:Math.sin(time*.00014)*36;
  for(let i=0;i<9;i++){
    const y=h*(.14+i*.105)+Math.sin(time*.00018+i)*18;
    const fog=bg.createLinearGradient(0,y,w,y+70);
    fog.addColorStop(0,'transparent');fog.addColorStop(.44,'#b9beb7');fog.addColorStop(.63,'rgba(185,190,183,.1)');fog.addColorStop(1,'transparent');
    bg.fillStyle=fog;bg.beginPath();bg.moveTo(-120+drift,y);for(let x=-120;x<w+160;x+=80)bg.lineTo(x,y+Math.sin(x*.011+i)*25);bg.lineTo(w+100,y+92);bg.lineTo(-100,y+80);bg.closePath();bg.fill();
  }
  bg.globalAlpha=1;
  bg.strokeStyle='rgba(156,166,157,.055)';
  for(let x=-h;x<w;x+=58){bg.beginPath();bg.moveTo(x+drift*.2,0);bg.lineTo(x+h+drift*.2,h);bg.stroke();}
  if (shouldAnimate()) raf=requestAnimationFrame(drawCommandBackground);
  else raf=0;
}

function drawHero(scene,time){
  const w=heroCanvas.width,h=heroCanvas.height;ctx.clearRect(0,0,w,h);
  const palettes={fog:['#263029','#060907'],chronicles:['#34352e','#070907'],duel:['#302c28','#080706'],arcade:['#332427','#080405'],ritual:['#351e22','#070304'],boss:['#3b2022','#080303'],training:['#20332c','#040806'],archive:['#2f3430','#060806'],options:['#29302c','#050705']};
  const p=palettes[scene]||palettes.fog;const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(182,191,182,.055)';for(let x=-h;x<w;x+=52){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+h,h);ctx.stroke();}
  for(let i=0;i<7;i++){ctx.fillStyle=`rgba(210,214,205,${.014+i*.006})`;ctx.beginPath();ctx.moveTo(0,120+i*78);for(let x=0;x<w;x+=60)ctx.lineTo(x,120+i*78+Math.sin(x*.012+i)*26);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();}
  // Only real, isolated bitmap candidates. No geometric nurse/flower/executioner fallback.
  const lead=getFighter('film_red_pyramid_film_175'),flyer=getFighter('sh1_air_screamer_001');
  ctx.save();ctx.translate(885,650);ctx.scale(1.32,1.32);drawRasterMonster(ctx,lead,0,0,{shadow:false});ctx.restore();
  if(scene!=='training'){ctx.save();ctx.translate(1120,425);ctx.scale(.62,.62);drawRasterMonster(ctx,flyer,0,0,{facing:-1,shadow:false,alpha:.65});ctx.restore();}
  ctx.fillStyle='#bfb6a6';ctx.font='11px system-ui';ctx.textAlign='right';ctx.fillText('IMAGES CANDIDATES · 2 / 230 · POSES STATIQUES',w-24,h-20);

}

$('#contentCount').textContent = `v${VERSION} · ${CONTENT_STATS.fighters} MANIFESTATIONS · ${CONTENT_STATS.moves} COUPS · ${CONTENT_STATS.bosses} BOSS · ${CONTENT_STATS.stages} ARÈNES`;
document.documentElement.dataset.version = VERSION;
radioTimer = window.setInterval(()=>{
  if(!shouldAnimate())return;
  const bars=$$('.radio-bars b');
  bars.forEach((bar,index)=>bar.style.height=`${4+Math.round((.5+.5*Math.sin(performance.now()*.006+index*1.7))*15)}px`);
},110);

function promptWorkerUpdate(registration) {
  if (!registration?.waiting) return;
  showStatus('UNE NOUVELLE TRANSMISSION EST PRÊTE.', {
    actionLabel: 'APPLIQUER',
    sticky: true,
    action: () => {
      reloadingForWorker = true;
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  try {
    swRegistration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/', updateViaCache: 'none' });
    promptWorkerUpdate(swRegistration);
    swRegistration.addEventListener('updatefound',()=>{
      const installing = swRegistration.installing;
      installing?.addEventListener('statechange',()=>{
        if (installing.state === 'installed' && navigator.serviceWorker.controller) promptWorkerUpdate(swRegistration);
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if (reloadingForWorker) location.reload();
      else showStatus('LE NOUVEAU SIGNAL EST ACTIF.', { tone: 'success' });
    });
    navigator.serviceWorker.addEventListener('message',event=>{
      if (event.data?.type === 'SHHF_SW_ACTIVATED') showStatus(`CACHE HORS LIGNE v${event.data.version} ACTIF.`, { tone: 'success' });
      if (event.data?.type === 'SHHF_CACHES_CLEARED') showStatus('CACHE HORS LIGNE PURGÉ ET RÉARMÉ.', { tone: 'success' });
    });
    window.setTimeout(()=>void swRegistration.update().catch(()=>{}), 1600);
  } catch {
    showStatus('LE MODE HORS LIGNE N’A PAS PU ÊTRE ARMÉ.', { tone: 'error' });
  }
}
function syncNetworkStatus() {
  if (!navigator.onLine) showStatus('SIGNAL RÉSEAU PERDU — MODE HORS LIGNE.', { tone: 'offline', sticky: true });
  else if (statusPanel.classList.contains('offline')) showStatus('SIGNAL RÉSEAU RÉTABLI.', { tone: 'success' });
}
addEventListener('online',syncNetworkStatus);
addEventListener('offline',syncNetworkStatus);
addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredInstallPrompt = event;
  $('#installRow').classList.remove('hidden');
});
addEventListener('appinstalled',()=>{
  deferredInstallPrompt = null;
  $('#installRow').classList.add('hidden');
  showStatus('ARCHIVE INSTALLÉE SUR CET APPAREIL.', { tone: 'success' });
});
$('#installApp').addEventListener('click',async()=>{
  if (!deferredInstallPrompt) return;
  await deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice.catch(()=>null);
  deferredInstallPrompt = null;
  $('#installRow').classList.add('hidden');
});

applySettings();
select(0);
syncFullscreenButton();
syncNetworkStatus();
void registerServiceWorker();
const query=new URLSearchParams(location.search);
if(query.get('module')&&moduleUrls[query.get('module')])launch(query.get('module'));

Promise.all(['film_red_pyramid_film_175','sh1_air_screamer_001'].map(id=>spriteCache.load(spriteFor(id)?.frames[0]))).then(()=>{drawHero(modes[currentMode()]?.scene||'fog',0);}).catch(()=>{});
