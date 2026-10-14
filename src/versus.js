import {
  CHRONICLES, ROSTER, STAGES, SOURCE_META, ARCHETYPES, CONTENT_STATS, STAGE_HAZARDS,
  AFFLICTIONS, RITUAL_MODIFIERS, VERSION, getRitualModifier, getFighter, getStage, createCombatProfile, MOVESET_KEYS, MOVE_FIDELITY
} from './data.js';
import { KEYS, importMemory, MEMORY_SCHEMA, removeState } from './save-store.js';
import { createRun, loadRun, saveRun, resumeRun, settleRun, playerOutcome, runSummary, updateRecords, RULE_BOOLEANS } from './run-progress.js';
import { ACTIONS, loadControls, controlsLabel } from './player-input.js';
import { installPlayflowUI } from './playflow-ui.js';
import { FightEngine, CONTROL_LABELS, chronicleGrade } from './fight.js';
import { drawStage, renderPortrait } from './renderers.js';
import {
  attachGlobalAudioUnlock, audio, clamp, escapeHTML, loadJSON, loadSettings,
  returnToCommand, saveLastFront, writeJSON, RECORDS_KEY, CHRONICLES_KEY
} from './shared.js';

attachGlobalAudioUnlock();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const params = new URLSearchParams(location.search);
let preset = params.get('preset') || params.get('mode') || 'versus';
const PAGE_SIZE = 30;
const FAVORITES_KEY = 'sh-halo-of-flesh-favorites-v1';
const settings = loadSettings();
const GRADE_SCORE = Object.freeze({ D: 0, C: 1, B: 2, A: 3, S: 4 });

const defaults = {
  p1: ROSTER.find((f) => f.name === 'Red Pyramid Thing — Great Knife')?.id || ROSTER[0].id,
  p2: ROSTER.find((f) => f.name === 'Sakura Head')?.id || ROSTER.find((f) => f.boss)?.id || ROSTER[1].id,
  stage: STAGES.find((s) => s.id === 'hotel_otherworld')?.id || STAGES[0].id,
};

const state = {
  activeSlot: 1,
  p1: getFighter(params.get('p1') || defaults.p1),
  p2: getFighter(params.get('p2') || defaults.p2),
  stage: getStage(params.get('stage') || defaults.stage),
  page: 0,
  filtered: ROSTER,
  mode: preset,
  engine: null,
  run: null,
  lastResult: null, generation: 0, settled: false, resultTimer: null, matchId: null,
  touchEnabled: matchMedia('(pointer: coarse)').matches,
  favorites: new Set(loadJSON(FAVORITES_KEY, { ids: [] }).ids || []),
};

const els = {
  modeTitle: $('#modeTitle'), selectScreen: $('#selectScreen'), fightScreen: $('#fightScreen'),
  p1Card: $('#p1Card'), p2Card: $('#p2Card'), p1Portrait: $('#p1Portrait'), p2Portrait: $('#p2Portrait'),
  p1Info: $('#p1Info'), p2Info: $('#p2Info'), slotP1: $('#slotP1'), slotP2: $('#slotP2'),
  search: $('#search'), sourceFilter: $('#sourceFilter'), typeFilter: $('#typeFilter'),
  archetypeFilter: $('#archetypeFilter'), roster: $('#roster'), pageLabel: $('#pageLabel'),
  prevPage: $('#prevPage'), nextPage: $('#nextPage'), mode: $('#mode'), rounds: $('#rounds'), timer: $('#timer'),
  difficulty: $('#difficulty'), ritualSelect: $('#ritualSelect'), stageMini: $('#stageMini'), stageCanvas: $('#stageCanvas'), stageName: $('#stageName'),
  launch: $('#launch'), fighterDossier: $('#fighterDossier'), openGallery: $('#openGallery'), stageGallery: $('#stageGallery'),
  closeGallery: $('#closeGallery'), stageList: $('#stageList'), dossier: $('#dossier'), closeDossier: $('#closeDossier'),
  dossierPortrait: $('#dossierPortrait'), dossierCopy: $('#dossierCopy'), randomAll: $('#randomAll'), backCommand: $('#backCommand'),
  game: $('#game'), gameHelp: $('#gameHelp'), matchLabel: $('#matchLabel'), leaveFight: $('#leaveFight'),
  pauseBtn: $('#pauseBtn'), trainingToggle: $('#trainingToggle'), trainingPanel: $('#trainingPanel'),
  hitboxes: $('#hitboxes'), autoHeal: $('#autoHeal'), freeMeter: $('#freeMeter'), resetDojo: $('#resetDojo'),
  touchLayer: $('#touchLayer'), mobileP1: $('#mobileP1'), result: $('#result'), resultKicker: $('#resultKicker'),
  resultTitle: $('#resultTitle'), resultText: $('#resultText'), rematch: $('#rematch'), continueRun: $('#continueRun'),
  resultSelect: $('#resultSelect'), resultStats: $('#resultStats'),
  otherworldShift: $('#otherworldShift'), stageHazards: $('#stageHazards'), radioWarning: $('#radioWarning'), adaptiveAI: $('#adaptiveAI'),
  fatalities: $('#fatalities'), stageFatalities: $('#stageFatalities'), stageAnimations: $('#stageAnimations'),
  stageTerrain: $('#stageTerrain'), stageDirector: $('#stageDirector'),
  forceShift: $('#forceShift'), forceBossPhase: $('#forceBossPhase'),
};

function valueScore(value, min, max) {
  return Math.max(6, Math.min(100, ((value - min) / (max - min)) * 100));
}

function fighterInfo(fighter) {
  const profile = createCombatProfile(fighter);
  return `
    <span class="fighter-source">${escapeHTML(SOURCE_META[fighter.source]?.short || fighter.source)} · ${escapeHTML(fighter.category)}</span>
    <h2>${escapeHTML(fighter.name)}</h2>
    <p class="fighter-lore">${escapeHTML(fighter.lore)}</p>
    <div class="stats">
      <div class="stat"><span>VITALITÉ</span><span><i style="width:${valueScore(profile.maxHealth, 700, 1570)}%"></i></span></div>
      <div class="stat"><span>VITESSE</span><span><i style="width:${valueScore(profile.speed, 3, 7.4)}%"></i></span></div>
      <div class="stat"><span>PUISSANCE</span><span><i style="width:${valueScore(profile.power, .75, 1.5)}%"></i></span></div>
      <div class="stat"><span>PORTÉE</span><span><i style="width:${valueScore(profile.reach, .7, 1.55)}%"></i></span></div>
    </div>
    <div class="trait-line"><span class="trait-chip">${escapeHTML(profile.trait.name)}</span><span class="trait-chip affliction-chip">${escapeHTML(profile.affliction.name)}</span></div>
    <div class="signature">${escapeHTML(fighter.signature)}</div>`;
}

function renderSelected() {
  renderPortrait(els.p1Portrait, state.p1, { time: performance.now() });
  renderPortrait(els.p2Portrait, state.p2, { time: performance.now() + 700 });
  els.p1Info.innerHTML = fighterInfo(state.p1);
  els.p2Info.innerHTML = fighterInfo(state.p2);
  els.p1Card.classList.toggle('active', state.activeSlot === 1);
  els.p2Card.classList.toggle('active', state.activeSlot === 2);
  els.slotP1.textContent = state.activeSlot === 1 ? 'SIGNAL DU SUJET I ACTIF' : 'ACCROCHER LE SUJET I';
  els.slotP2.textContent = state.activeSlot === 2 ? 'SIGNAL DU SUJET II ACTIF' : 'ACCROCHER LE SUJET II';
  renderStageMini();
}

function renderStageMini() {
  drawStage(els.stageCanvas.getContext('2d'), state.stage, performance.now(), {
    width: els.stageCanvas.width, height: els.stageCanvas.height,
  });
  els.stageName.textContent = state.stage.name;
}

function populateFilters() {
  for (const [id, meta] of Object.entries(SOURCE_META)) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${meta.short} · ${meta.label}`;
    els.sourceFilter.append(option);
  }
  Object.keys(ARCHETYPES).sort().forEach((id) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = id.toUpperCase();
    els.archetypeFilter.append(option);
  });
}

function populateRituals() {
  els.ritualSelect.textContent = '';
  for (const [id, ritual] of Object.entries(RITUAL_MODIFIERS)) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${ritual.short || ritual.name} · ${ritual.name}`;
    option.title = ritual.description;
    els.ritualSelect.append(option);
  }
}

function currentRitualId() {
  if (state.run?.rituals?.length) return state.run.rituals[state.run.index % state.run.rituals.length];
  return els.ritualSelect.value || 'none';
}

function currentRitual() { return { id: currentRitualId(), ...getRitualModifier(currentRitualId()) }; }

function matchesFilters(fighter) {
  const query = els.search.value.trim().toLowerCase();
  const source = els.sourceFilter.value;
  const type = els.typeFilter.value;
  const archetype = els.archetypeFilter.value;
  if (query) {
    const haystack = `${fighter.name} ${fighter.game} ${fighter.signature} ${fighter.archetype} ${fighter.tags.join(' ')}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (source !== 'all' && fighter.source !== source) return false;
  if (archetype !== 'all' && fighter.archetype !== archetype) return false;
  if (type === 'boss' && !fighter.boss) return false;
  if (type === 'regular' && fighter.boss) return false;
  if (type === 'secret' && fighter.unlock === 'base') return false;
  if (type === 'favorites' && !state.favorites.has(fighter.id)) return false;
  return true;
}

function applyFilters() {
  state.filtered = ROSTER.filter(matchesFilters);
  const pageCount = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
  state.page = Math.max(0, Math.min(state.page, pageCount - 1));
  renderRoster();
}

function renderRoster() {
  els.roster.textContent = '';
  const start = state.page * PAGE_SIZE;
  const page = state.filtered.slice(start, start + PAGE_SIZE);
  if (!page.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<b>AUCUNE MANIFESTATION</b><small>Modifie les filtres du dossier.</small>';
    els.roster.append(empty);
  }
  page.forEach((fighter) => {
    const button = document.createElement('button');
    button.className = 'fighter-card';
    button.dataset.id = fighter.id;
    button.title = `${fighter.name} — ${fighter.signature}`;
    if (state.p1.id === fighter.id || state.p2.id === fighter.id) button.classList.add('selected');
    const canvas = document.createElement('canvas');
    canvas.width = 180; canvas.height = 120;
    button.append(canvas);
    const copy = document.createElement('div');
    copy.className = 'fighter-card-copy';
    copy.innerHTML = `<b>${escapeHTML(fighter.name)}</b><small>${escapeHTML(SOURCE_META[fighter.source].short)} · ${escapeHTML(fighter.archetype)}</small>`;
    button.append(copy);
    const strip = document.createElement('i'); strip.className = 'source-strip'; button.append(strip);
    if (fighter.boss) { const dot = document.createElement('span'); dot.className = 'boss-dot'; button.append(dot); }
    if (state.favorites.has(fighter.id)) button.dataset.favorite = 'true';
    button.addEventListener('click', () => selectFighter(fighter));
    button.addEventListener('dblclick', () => { selectFighter(fighter); openDossier(fighter); });
    button.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      if (state.favorites.has(fighter.id)) state.favorites.delete(fighter.id); else state.favorites.add(fighter.id);
      writeJSON(FAVORITES_KEY, { ids: [...state.favorites] });
      renderRoster();
    });
    els.roster.append(button);
    renderPortrait(canvas, fighter, { time: performance.now() + start * 19 });
  });
  const pageCount = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
  els.pageLabel.textContent = `PAGE ${state.page + 1} / ${pageCount} · ${state.filtered.length}/${CONTENT_STATS.fighters}`;
  els.prevPage.disabled = state.page === 0;
  els.nextPage.disabled = state.page >= pageCount - 1;
}

function selectFighter(fighter) {
  audio.ui();
  if (state.activeSlot === 1) { state.p1 = fighter; state.activeSlot = 2; }
  else { state.p2 = fighter; state.activeSlot = 1; }
  renderSelected();
  renderRoster();
}

function renderStageGallery() {
  els.stageList.textContent = '';
  STAGES.forEach((stage) => {
    const button = document.createElement('button');
    button.className = `stage-entry${state.stage.id === stage.id ? ' active' : ''}`;
    const canvas = document.createElement('canvas'); canvas.width = 304; canvas.height = 180; button.append(canvas);
    const label = document.createElement('b'); label.textContent = stage.name; button.append(label);
    const meta = document.createElement('small'); const hazard = STAGE_HAZARDS[stage.director?.hazardDeck?.[0]]; meta.innerHTML = `${escapeHTML(SOURCE_META[stage.source]?.short || stage.source)} · ${escapeHTML(stage.family.toUpperCase())} · ${escapeHTML(stage.weather.toUpperCase())}${hazard ? ` · <em>${escapeHTML(hazard.name)}</em>` : ''}${!stage.director?.hazardDeck?.length ? ' · AMBIANCE SANS DÉGÂTS' : ''}<br>${stage.animationTracks?.length || stage.animations?.length || 0} ANIMATIONS · ${stage.director?.events?.length || 0} ÉVÉNEMENTS<br>${escapeHTML(stage.terrain?.name || 'TERRAIN NEUTRE')} · ${escapeHTML(stage.shift?.name || 'BASCULE STANDARD')}`; button.append(meta);
    button.addEventListener('click', () => {
      state.stage = stage; audio.confirm(); renderSelected(); renderStageGallery();
      setTimeout(closeStageGallery, 110);
    });
    els.stageList.append(button);
    drawStage(canvas.getContext('2d'), stage, performance.now(), { width: canvas.width, height: canvas.height });
  });
}

function openStageGallery() { renderStageGallery(); els.stageGallery.classList.remove('hidden'); }
function closeStageGallery() { els.stageGallery.classList.add('hidden'); }

function openDossier(fighter = state.activeSlot === 1 ? state.p1 : state.p2) {
  renderPortrait(els.dossierPortrait, fighter, { time: performance.now() });
  const profile = createCombatProfile(fighter);
  const moves = MOVESET_KEYS.map((key) => profile.moves[key]).map((move) => {
    const effects = [move.trigger ? `fenêtre ${move.trigger}` : '', move.projectile ? `${move.projectileCount || 1} projectile(s)` : '', move.trap ? 'piège' : '', move.teleport ? `téléportation ${move.teleport}` : '', move.counterStance ? 'contre' : '', move.armorBreak ? 'brise-armure' : '', move.sideSwitch ? 'changement de côté' : '', move.hardKnockdown ? 'chute dure' : '', move.groundBounce ? 'rebond au sol' : '', move.effect ? AFFLICTIONS[move.effect.id]?.name || move.effect.id : '', move.cancelInto?.length ? `annule vers ${move.cancelInto.map((key) => profile.moves[key]?.input || key).join('/')}` : ''].filter(Boolean);
    return `<li data-fidelity="${escapeHTML(move.fidelity)}"><div><kbd>${escapeHTML(move.input)}</kbd><b>${escapeHTML(move.name)}</b></div><span>${move.damage} dégâts · ${move.startup}/${move.active}/${move.recovery}f · ${escapeHTML(move.level.toUpperCase())}${effects.length ? ` · ${escapeHTML(effects.join(' · '))}` : ''}</span><small>${escapeHTML(MOVE_FIDELITY[move.fidelity]?.label || move.fidelity)} · ${escapeHTML(move.canonicalBasis)}</small></li>`;
  }).join('');
  const arena = getStage(fighter.stageId);
  const hazard = STAGE_HAZARDS[arena.director?.hazardDeck?.[0]];
  const phases = profile.bossPhases?.length
    ? `<div class="dossier-box phases"><b>PHASES DE BOSS</b><ol>${profile.bossPhases.map((phase) => `<li><strong>${escapeHTML(phase.name)}</strong><span>${Math.round(phase.threshold * 100)}% · puissance ×${phase.power.toFixed(2)} · vitesse ×${phase.speed.toFixed(2)}</span></li>`).join('')}</ol></div>`
    : '';
  const fatalities = (fighter.fatalities || []).map((fatality) => `<li><strong>${escapeHTML(fatality.name)}</strong><span>${escapeHTML(fatality.type.toUpperCase())} · ${escapeHTML(fatality.sequence.join(' › '))}<br><small>${escapeHTML(fatality.canonicalBasis)} · ${escapeHTML(fatality.fidelity)}</small></span></li>`).join('');
  const stageAnimations = (arena.animationTracks || arena.animations || []).map((entry) => escapeHTML(String(typeof entry === 'string' ? entry : entry.id).replace(/([A-Z])/g, ' $1').toUpperCase())).join(' · ');
  const stageEvents = (arena.director?.events || []).map((id) => escapeHTML(String(id).replace(/([A-Z])/g, ' $1').toUpperCase())).join(' · ');
  const stageHazards = (arena.director?.hazardDeck || []).map((id) => escapeHTML(STAGE_HAZARDS[id]?.name || id)).join(' · ');
  els.dossierCopy.innerHTML = `
    <span class="lead">${escapeHTML(fighter.game)} · ${escapeHTML(fighter.category)} · ${escapeHTML(fighter.archetype.toUpperCase())}</span>
    <h3>${escapeHTML(fighter.name)}</h3>
    <div class="dossier-grid">
      <div class="dossier-box"><b>APPARITION / LORE</b><p>${escapeHTML(fighter.lore)}</p></div>
      <div class="dossier-box"><b>COMPORTEMENT SOURCE</b><p>${escapeHTML(fighter.canonicalBehavior)}</p></div>
      <div class="dossier-box trait"><b>TRAIT DE MANIFESTATION</b><p><strong>${escapeHTML(profile.trait.name)}</strong><br>${escapeHTML(profile.trait.description)}</p></div>
      <div class="dossier-box affliction"><b>AFFLICTION SIGNATURE</b><p><strong>${escapeHTML(profile.affliction.name)}</strong><br>${escapeHTML(profile.affliction.description)}</p></div>
      <div class="dossier-box phases"><b>FATALITÉS</b><ol>${fatalities}</ol></div>
      <div class="dossier-box"><b>IA / DISTANCE</b><p><strong>${escapeHTML(profile.ai.name)}</strong><br>${Math.round(profile.ai.preferredRange)} unités de préférence.</p></div>
      <div class="dossier-box"><b>ARÈNE ASSOCIÉE</b><p>${escapeHTML(arena.name)}${hazard ? `<br><small>${escapeHTML(hazard.name)}</small>` : ''}<br><small>${escapeHTML(arena.fatality?.name || '')}</small></p></div>
      <div class="dossier-box"><b>ANIMATIONS D’ARÈNE</b><p>${stageAnimations || 'AUCUNE'}</p></div>
      <div class="dossier-box"><b>TERRAIN / BASCULE</b><p><strong>${escapeHTML(arena.terrain?.name || 'NEUTRE')}</strong><br>${escapeHTML(arena.terrain?.description || '')}<br><small>${escapeHTML(arena.shift?.name || 'OTHERWORLD')}</small></p></div>
      <div class="dossier-box"><b>ÉVÉNEMENTS DU LIEU</b><p>${stageEvents || 'AUCUN'}<br><small>${stageHazards || 'AMBIANCE SANS DÉGÂTS ENVIRONNEMENTAUX'}</small></p></div>
      <div class="dossier-box phases"><b>BASE LORE DE L’ARÈNE</b><p>${escapeHTML(arena.lore?.premise || '')}<br><small>${escapeHTML(arena.lore?.adaptationNotice || '')}</small></p></div>
      ${phases}
    </div>
    <div class="adaptation-note"><b>NOTE DE FIDÉLITÉ</b><br>${escapeHTML(fighter.adaptation)} Les proportions, signes distinctifs, posture et rôle sont documentés séparément des règles d’équilibrage.<br><br><strong>STATUT :</strong> ${escapeHTML(fighter.catalogueStatus)} · ${escapeHTML(fighter.nameStatus)} · ${escapeHTML(fighter.evidenceTier)}</div>
    <h4>MOVESET COMPLET · ${profile.moveset.fidelitySummary.total} COUPS</h4><div class="dossier-move-summary"><span>${profile.moveset.fidelitySummary.direct} DIRECTS</span><span>${profile.moveset.fidelitySummary.composite} COMPOSITES</span><span>${profile.moveset.fidelitySummary.adapted} ADAPTATIONS</span></div><ul class="move-list">${moves}</ul>`;
  els.dossier.classList.remove('hidden');
}
function closeDossier() { els.dossier.classList.add('hidden'); }

function randomItem(array) { return array[Math.floor(Math.random() * array.length)]; }
function randomize() {
  const pool = state.filtered.length ? state.filtered : ROSTER;
  state.p1 = randomItem(pool);
  do { state.p2 = randomItem(pool); } while (pool.length > 1 && state.p2.id === state.p1.id);
  state.stage = randomItem(STAGES);
  audio.confirm();
  renderSelected(); renderRoster();
}

function configurePreset() {
  const labels = {
    versus: ['CONFRONTATION', 'OUVRIR LE CONTACT'], arcade: ['DESCENTE', 'COMMENCER LE PARCOURS'],
    ritual: ['RITES DU JUGEMENT', 'OUVRIR LE PREMIER SCEAU'],
    boss: ['GRANDS TOURMENTS', 'AFFRONTER LES BOSS'], training: ['OBSERVATION', 'ENTRER DANS LE LABORATOIRE'],
    chronicle: ['CHRONIQUE', 'POURSUIVRE'],
  };
  const [title, action] = labels[preset] || labels.versus;
  els.modeTitle.textContent = title;
  els.launch.textContent = action;
  if (preset === 'training') {
    els.mode.value = 'local';
    els.mode.disabled = true;
    els.rounds.value = '1';
    els.timer.value = '0';
    els.difficulty.disabled = true;
  } else if (preset === 'arcade' || preset === 'boss' || preset === 'ritual' || preset === 'chronicle') {
    els.mode.value = 'cpu';
    els.mode.disabled = true;
    if (preset === 'boss' || preset === 'ritual') els.rounds.value = '1';
    if (preset === 'ritual') els.ritualSelect.disabled = true;
  }
}

function selectedRules() {
  return {mode:els.mode.value,roundsToWin:Number(els.rounds.value),timeLimit:Number(els.timer.value),
    difficulty:els.difficulty.value,ritualId:els.ritualSelect.value,
    ...Object.fromEntries(RULE_BOOLEANS.map(k=>[k,els[k].checked]))};
}
function buildRun() {
  if (!['arcade','boss','ritual','chronicle'].includes(preset)) { state.run=null;return true; }
  const previous=loadRun();
  if(previous&&previous.status!=='complete'&&!confirm('Remplacer le parcours sauvegardé par un nouveau parcours ?'))return false;
  try { state.run=createRun({mode:preset,playerId:state.p1.id,routeId:params.get('route'),seed:Date.now(),rules:selectedRules()}); }
  catch(error){state.run=null;flow.announce(error.message,true);return false;}
  try {
    if(preset==='chronicle'){
      const progress=loadJSON(CHRONICLES_KEY,{completed:[],attempts:{},grades:{},bestStats:{}});
      progress.attempts={...progress.attempts,[state.run.routeId]:(progress.attempts?.[state.run.routeId]||0)+1};
      importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.chronicles]:progress,[KEYS.run]:state.run}});
    } else if(!saveRun(state.run))flow.announce('Parcours jouable, mais sauvegarde indisponible.',true);
  } catch(error){flow.announce(`${error.message} Le parcours reste jouable sans sauvegarde.`,true);}
  return true;
}
function checkpointNotice() {
  const saved=loadRun(), banner=$('#runCheckpoint');
  const pending=saved&&saved.status!=='complete';
  banner.classList.toggle('hidden',!pending);
  if(pending)$('#runCheckpointText').textContent=`Parcours ${saved.mode} : ${saved.wins}/${saved.queue.length} victoires. ${saved.status==='won'?'Prochain combat prêt.':'Reprise au début de la rencontre en cours.'}`;
}
function restoreCheckpoint() {
  const saved=loadRun(), resumed=resumeRun(saved);
  if(!resumed){flow.announce('Aucun parcours compatible à reprendre.',true);return;}
  state.run=resumed;preset=resumed.mode;state.mode=preset;state.p1=getFighter(resumed.playerId);
  configurePreset();
  const rules=resumed.rules;
  els.rounds.value=String(rules.roundsToWin);els.timer.value=String(rules.timeLimit);els.difficulty.value=rules.difficulty;
  for(const key of RULE_BOOLEANS)els[key].checked=rules[key]!==false;
  els.ritualSelect.value=rules.ritualId||'none';
  startFight({preserveRun:true});
}
function retryCurrentFight() {
  if(state.run&&state.run.status==='lost')state.run=resumeRun(state.run);
  if(state.run&&['won','complete'].includes(state.run.status))return;
  startFight({preserveRun:Boolean(state.run)});
}

function showFight() {
  els.selectScreen.classList.add('hidden');
  els.fightScreen.classList.remove('hidden');
  els.result.classList.add('hidden');
  window.scrollTo(0, 0);
}
function showSelect() {
  clearTimeout(state.resultTimer);state.generation++;flow.close();
  state.engine?.destroy(); state.engine = null;
  els.fightScreen.classList.add('hidden');
  els.selectScreen.classList.remove('hidden');
  els.result.classList.add('hidden');
  renderSelected(); renderRoster();checkpointNotice();
}

function fightConfig() {
  const training = preset === 'training';
  return {
    p1: state.p1,
    p2: state.p2,
    stage: state.stage,
    mode: training ? 'local' : els.mode.value,
    roundsToWin: Number(els.rounds.value),
    timeLimit: Number(els.timer.value),
    difficulty: els.difficulty.value,
    training,
    showHitboxes: training && els.hitboxes.checked,
    autoHeal: training && els.autoHeal.checked,
    freeMeter: training && els.freeMeter.checked,
    otherworldShift: els.otherworldShift.checked,
    stageHazards: els.stageHazards.checked,
    radioWarning: els.radioWarning.checked,
    adaptiveAI: els.adaptiveAI.checked,
    fatalities: els.fatalities.checked,
    stageFatalities: els.stageFatalities.checked,
    stageAnimations: els.stageAnimations.checked,
    stageTerrain: els.stageTerrain.checked,
    stageDirector: els.stageDirector.checked,
    ritualId: currentRitualId(),
    ...(state.run?.rules || {}),
    initialHealthRatio: state.run?.carry ? state.run.carryHealth : 1,
    initialMeter: state.run?.carry ? state.run.carryMeter : null,
    seed: state.run ? (state.run.seed+state.run.index)>>>0 : Date.now(),
    callbacks: { onMatchEnd: handleMatchEnd, onState: snapshot => flow.syncPause(snapshot) }
  };
}

function startFight({ preserveRun = false } = {}) {
  if (!preserveRun && !buildRun()) return;
  if (state.run && state.run.status !== 'ready') return;
  clearTimeout(state.resultTimer);state.generation++;state.settled=false;state.lastResult=null;
  state.matchId=globalThis.crypto?.randomUUID?.() || `match-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  flow.close();
  if(state.run&&!saveRun(state.run))flow.announce('Progression non sauvegardée : stockage indisponible.',true);
  if (state.run?.queue?.length) {
    state.p2 = getFighter(state.run.queue[state.run.index]);
    if (state.run.stages?.length) state.stage = getStage(state.run.stages[state.run.index % state.run.stages.length]);
  }
  if (state.run?.rituals?.length) els.ritualSelect.value = currentRitualId();
  state.engine?.destroy();
  showFight();
  const training = preset === 'training';
  els.trainingToggle.classList.toggle('hidden', !training);
  els.trainingPanel.classList.toggle('hidden', !training);
  els.touchLayer.style.display = state.touchEnabled ? 'block' : '';
  const ritual = currentRitual();
  els.matchLabel.textContent = state.run ? `${state.run.type} ${state.run.index + 1}/${state.run.queue.length} · ${ritual.short || ritual.name}` : (training ? `OBSERVATION · ${ritual.short || ritual.name}` : `CONTACT · ${ritual.short || ritual.name}`);
  refreshControlHelp();
  saveLastFront({ mode: preset, p1: state.p1.id, p2: state.p2.id, stage: state.stage.id, ritualId: currentRitualId(), rules: { otherworldShift: els.otherworldShift.checked, stageHazards: els.stageHazards.checked, radioWarning: els.radioWarning.checked, adaptiveAI: els.adaptiveAI.checked, fatalities: els.fatalities.checked, stageFatalities: els.stageFatalities.checked, stageAnimations: els.stageAnimations.checked, stageTerrain: els.stageTerrain.checked, stageDirector: els.stageDirector.checked } });
  const generation=state.generation, config=fightConfig();
  config.callbacks.onMatchEnd=result=>{if(generation===state.generation)handleMatchEnd(result);};
  state.engine = new FightEngine(els.game, config);
  state.engine.start();
  els.game.focus({preventScroll:true});
  if (params.get('qa') === '1') installQaBridge();
}

function installQaBridge() {
  window.__HALO_QA__ = {
    version: VERSION,
    get engine() { return state.engine; },
    get selection() { return { p1: state.p1, p2: state.p2, stage: state.stage, mode: preset }; },
    startFight,
    showSelect, restoreCheckpoint, continueRun, handleMatchEnd,
    get run() { return state.run; },
    forceOtherworld() { return state.engine?.forceOtherworldShift(); },
    forceBossPhase() { return state.engine?.forceBossPhase(); },
    triggerStageEvent(id) { return state.engine?.triggerStageEvent(id) || false; },
    previewContext(moveKey = 'guardCounter') {
      const engine = state.engine;
      const actor = engine?.actors?.[0];
      if (!engine || !actor || !actor.profile.moves[moveKey]) return false;
      engine.phase = 'fight';
      engine.phaseTimer = 0;
      actor.attack = null;
      actor.hurtFrames = 0;
      actor.guardBreak = 0;
      actor.knockdownTimer = 0;
      actor.grounded = true;
      const started = engine.beginAttack(actor, moveKey, { context: true });
      if (started) engine.togglePause(true);
      return started;
    },
    forceFatality(type = 'signature') {
      const engine = state.engine;
      if (!engine) return false;
      const attacker = engine.actors?.[0];
      const target = engine.actors?.[1];
      if (!attacker || !target) return false;
      const stageBased = type === 'stage';
      const definition = stageBased
        ? engine.stage?.fatality
        : attacker.data?.fatalities?.[type === 'nightmare' ? 1 : 0];
      if (!definition) return false;
      engine.phase = 'fight';
      engine.phaseTimer = 0;
      engine.paused = false;
      engine.startFatality(attacker, target, definition, stageBased, { isSuper: true, environmental: stageBased });
      return true;
    },
    snapshot() { return state.engine?.snapshot() || null; }
  };
}

function handleMatchEnd(result) {
  if(state.settled)return;
  state.settled=true;state.lastResult=result;
  const {won,stats:playerStats}=playerOutcome(result);
  const grade=chronicleGrade(playerStats);
  if(state.run)state.run=settleRun(state.run,result);
  const records=updateRecords(loadJSON(RECORDS_KEY,{}),result,state.matchId,state.p2.id,grade,state.run);
  const entries={[KEYS.records]:records};
  if(state.run)entries[KEYS.run]=state.run;
  const route=CHRONICLES.find(r=>r.id===state.run?.routeId);
  const completedRun=state.run?.status==='complete';
  let routeGrade=null;
  if(route&&completedRun){
    const progress=loadJSON(CHRONICLES_KEY,{completed:[],attempts:{},grades:{},bestStats:{}});
    const summary=runSummary(state.run);routeGrade=chronicleGrade(summary);
    progress.completed=[...new Set([...(progress.completed||[]),route.id])];
    if((GRADE_SCORE[routeGrade]??0)>=(GRADE_SCORE[progress.grades?.[route.id]]??-1)){
      progress.grades={...progress.grades,[route.id]:routeGrade};progress.bestStats={...progress.bestStats,[route.id]:summary};
    }
    entries[KEYS.chronicles]=progress;
  }
  try{importMemory({schema:MEMORY_SCHEMA,entries});}
  catch(error){flow.announce(error.message,true);}
  const generation=state.generation;
  state.resultTimer=setTimeout(()=>{
    if(generation!==state.generation||!state.engine)return;
    const title=state.run?({arcade:'DESCENTE',boss:'GRANDS TOURMENTS',ritual:'RITES DU JUGEMENT',chronicle:'CHRONIQUE'}[state.run.mode]):'CONFRONTATION';
    els.resultKicker.textContent=`${title} · ${won?'VICTOIRE DU SUJET I':'DÉFAITE DU SUJET I'}`;
    els.resultTitle.textContent=completedRun?'PARCOURS TERMINÉ':result.winner.name;
    els.resultText.textContent=completedRun?(route?.outro||`${state.run.wins}/${state.run.queue.length} rencontres remportées.`):
      (won?`${result.winner.name} domine ${result.loser.name}.`:'Le parcours reste disponible. Rejouez cette rencontre ou revenez à la sélection.');
    const rows=[['RANG DU SUJET I',grade],['COMBO MAX',playerStats.maxCombo||0],['GARDES PARFAITES',playerStats.perfectGuards||0],
      ['CONTRES',playerStats.counters||0],['DANGERS SUBIS',playerStats.hazardsTaken||0],['FATALITÉS',playerStats.fatalities||0]];
    if(routeGrade)rows.unshift(['RANG DU PARCOURS COMPLET',routeGrade]);
    if(state.run?.carry)rows.push(['ENDURANCE CONSERVÉE',`${Math.round(state.run.carryHealth*100)} %`]);
    els.resultStats.innerHTML=rows.map(([label,value])=>`<div class="result-stat"><b>${escapeHTML(String(value))}</b><span>${escapeHTML(label)}</span></div>`).join('');
    els.continueRun.classList.toggle('hidden',state.run?.status!=='won');
    els.rematch.classList.toggle('hidden',!!state.run&&won);
    els.rematch.textContent=state.run?'RÉESSAYER CETTE RENCONTRE':'REVANCHE';
    els.result.classList.remove('hidden');state.engine.input.enabled=false;
    (state.run?.status==='won'?els.continueRun:!won?els.rematch:els.resultSelect).focus();
  },600);
}
function continueRun() {
  if(state.run?.status!=='won')return;
  state.run=resumeRun(state.run);
  startFight({preserveRun:true});
}
function refreshControlHelp() {
  const bindings=loadControls();
  els.gameHelp.textContent=controlsLabel(bindings,0)+(els.mode.value==='local'&&preset!=='training'?` · SUJET II : ${controlsLabel(bindings,1)}`:'');
  state.engine?.setBindings(bindings);
}

function updateTraining() {
  state.engine?.setTrainingOptions({
    showHitboxes: els.hitboxes.checked,
    autoHeal: els.autoHeal.checked,
    freeMeter: els.freeMeter.checked,
  });
}

function bindTouch() {
  $$('.touch-button').forEach(button=>{
    const {player,action}=button.dataset, pointers=new Set();
    button.setAttribute('aria-label',ACTIONS[action]||action);
    const release=event=>{event.preventDefault();pointers.delete(event.pointerId);
      if(!pointers.size)state.engine?.setTouch(player,action,false);};
    button.addEventListener('pointerdown',event=>{event.preventDefault();pointers.add(event.pointerId);
      button.setPointerCapture?.(event.pointerId);state.engine?.setTouch(player,action,'pressed');});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,release);
    button.style.touchAction='none';
  });
}

function bindEvents() {
  els.slotP1.addEventListener('click', () => { state.activeSlot = 1; renderSelected(); });
  els.slotP2.addEventListener('click', () => { state.activeSlot = 2; renderSelected(); });
  [els.search, els.sourceFilter, els.typeFilter, els.archetypeFilter].forEach((control) => control.addEventListener(control === els.search ? 'input' : 'change', () => { state.page = 0; applyFilters(); }));
  els.prevPage.addEventListener('click', () => { state.page--; renderRoster(); });
  els.nextPage.addEventListener('click', () => { state.page++; renderRoster(); });
  els.openGallery.addEventListener('click', openStageGallery);
  els.stageMini.addEventListener('click', openStageGallery);
  els.closeGallery.addEventListener('click', closeStageGallery);
  els.stageGallery.addEventListener('click', (event) => { if (event.target === els.stageGallery) closeStageGallery(); });
  els.fighterDossier.addEventListener('click', () => openDossier());
  els.closeDossier.addEventListener('click', closeDossier);
  els.dossier.addEventListener('click', (event) => { if (event.target === els.dossier) closeDossier(); });
  els.randomAll.addEventListener('click', randomize);
  els.backCommand.addEventListener('click', () => {state.engine?.destroy();returnToCommand();});
  els.launch.addEventListener('click', () => startFight());
  els.leaveFight.addEventListener('click', showSelect);
  els.resultSelect.addEventListener('click', showSelect);
  els.rematch.addEventListener('click', retryCurrentFight);
  els.continueRun.addEventListener('click', continueRun);
  els.pauseBtn.addEventListener('click', () => state.engine?.togglePause());
  els.trainingToggle.addEventListener('click', () => els.trainingPanel.classList.toggle('hidden'));
  [els.hitboxes, els.autoHeal, els.freeMeter].forEach((input) => input.addEventListener('change', updateTraining));
  els.forceShift.addEventListener('click', () => state.engine?.forceOtherworldShift());
  els.forceBossPhase.addEventListener('click', () => state.engine?.forceBossPhase());
  els.resetDojo.addEventListener('click', () => state.engine?.resetMatch());
  els.mobileP1.addEventListener('click', () => {
    state.touchEnabled = !state.touchEnabled;
    els.mobileP1.textContent = state.touchEnabled ? 'TACTILE SUJET I ACTIF' : 'TACTILE SUJET I';
    els.touchLayer.style.display = state.touchEnabled ? 'block' : 'none';
  });
  addEventListener('keydown', (event) => {
    if(event.defaultPrevented||event.target?.closest?.('dialog,input,textarea,select'))return;
    if (event.code === 'Escape') {
      if (!els.dossier.classList.contains('hidden')) closeDossier();
      else if (!els.stageGallery.classList.contains('hidden')) closeStageGallery();
      else if (!els.fightScreen.classList.contains('hidden')) state.engine?.togglePause();
      else returnToCommand();
    }
    if (!els.selectScreen.classList.contains('hidden') && event.code === 'Enter' && !event.target?.closest?.('button')) startFight();
  });
  $('#resumeCheckpoint').addEventListener('click',restoreCheckpoint);
  $('#discardCheckpoint').addEventListener('click',()=>{if(confirm('Effacer uniquement le parcours en cours ?')){removeState(KEYS.run);checkpointNotice();}});
  bindTouch();
}

function init() {
  els.otherworldShift.checked = settings.otherworldShift !== false;
  els.stageHazards.checked = settings.stageHazards !== false;
  els.radioWarning.checked = settings.radioWarning !== false;
  els.adaptiveAI.checked = settings.adaptiveAI !== false;
  els.fatalities.checked = settings.fatalities !== false;
  els.stageFatalities.checked = settings.stageFatalities !== false;
  els.stageAnimations.checked = settings.stageAnimations !== false;
  els.stageTerrain.checked = settings.stageTerrain !== false;
  els.stageDirector.checked = settings.stageDirector !== false;
  els.difficulty.value = settings.difficulty || 'normal';
  populateFilters();
  populateRituals();
  els.ritualSelect.value = params.get('ritual') || 'none';
  configurePreset();
  bindEvents();
  renderSelected();
  applyFilters();
  if (state.touchEnabled) { els.mobileP1.textContent = 'TACTILE SUJET I ACTIF'; }
  if (params.get('qa') === '1') installQaBridge();
  const shouldAutostart = params.get('autostart') === '1' || params.get('autostart') === 'true';
  checkpointNotice();
  if(params.get('resume')==='1')restoreCheckpoint();
  else if (shouldAutostart) setTimeout(() => startFight(), 120);
}

const flow=installPlayflowUI({engine:()=>state.engine,select:showSelect,retry:retryCurrentFight,onControlsChanged:refreshControlHelp});
init();
