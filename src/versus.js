import {
  ROSTER, STAGES, SOURCE_META, ARCHETYPES, CONTENT_STATS, STAGE_HAZARDS,
  AFFLICTIONS, getFighter, getStage, createCombatProfile
} from './data.js';
import { FightEngine, CONTROL_LABELS, chronicleGrade } from './fight.js';
import { drawStage, renderPortrait } from './renderers.js';
import {
  attachGlobalAudioUnlock, audio, escapeHTML, loadJSON, loadSettings,
  returnToCommand, saveLastFront, writeJSON, RECORDS_KEY, CHRONICLES_KEY
} from './shared.js';

attachGlobalAudioUnlock();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const params = new URLSearchParams(location.search);
const preset = params.get('preset') || params.get('mode') || 'versus';
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
  lastResult: null,
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
  difficulty: $('#difficulty'), stageMini: $('#stageMini'), stageCanvas: $('#stageCanvas'), stageName: $('#stageName'),
  launch: $('#launch'), fighterDossier: $('#fighterDossier'), openGallery: $('#openGallery'), stageGallery: $('#stageGallery'),
  closeGallery: $('#closeGallery'), stageList: $('#stageList'), dossier: $('#dossier'), closeDossier: $('#closeDossier'),
  dossierPortrait: $('#dossierPortrait'), dossierCopy: $('#dossierCopy'), randomAll: $('#randomAll'), backCommand: $('#backCommand'),
  game: $('#game'), gameHelp: $('#gameHelp'), matchLabel: $('#matchLabel'), leaveFight: $('#leaveFight'),
  pauseBtn: $('#pauseBtn'), trainingToggle: $('#trainingToggle'), trainingPanel: $('#trainingPanel'),
  hitboxes: $('#hitboxes'), autoHeal: $('#autoHeal'), freeMeter: $('#freeMeter'), resetDojo: $('#resetDojo'),
  touchLayer: $('#touchLayer'), mobileP1: $('#mobileP1'), result: $('#result'), resultKicker: $('#resultKicker'),
  resultTitle: $('#resultTitle'), resultText: $('#resultText'), rematch: $('#rematch'), continueRun: $('#continueRun'),
  resultSelect: $('#resultSelect'), resultStats: $('#resultStats'),
  otherworldShift: $('#otherworldShift'), stageHazards: $('#stageHazards'), radioWarning: $('#radioWarning'),
  forceShift: $('#forceShift'),
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
  els.slotP1.textContent = state.activeSlot === 1 ? 'SÉLECTION P1 ACTIVE' : 'ACTIVER SÉLECTION P1';
  els.slotP2.textContent = state.activeSlot === 2 ? 'SÉLECTION P2 ACTIVE' : 'ACTIVER SÉLECTION P2';
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
    const meta = document.createElement('small'); const hazard = STAGE_HAZARDS[stage.hazard]; meta.innerHTML = `${escapeHTML(SOURCE_META[stage.source]?.short || stage.source)} · ${escapeHTML(stage.family.toUpperCase())} · ${escapeHTML(stage.weather.toUpperCase())}${hazard ? ` · <em>${escapeHTML(hazard.name)}</em>` : ''}`; button.append(meta);
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
  const moves = Object.values(profile.moves).map((move) => {
    const effects = [move.projectile ? 'projectile' : '', move.effect ? AFFLICTIONS[move.effect.id]?.name || move.effect.id : '', move.cancelInto?.length ? `annule vers ${move.cancelInto.join('/')}` : ''].filter(Boolean);
    return `<li><b>${escapeHTML(move.name)}</b><span>${move.damage} dégâts · ${move.startup}f${effects.length ? ` · ${escapeHTML(effects.join(' · '))}` : ''}</span></li>`;
  }).join('');
  const arena = getStage(fighter.stageId);
  const hazard = STAGE_HAZARDS[arena.hazard];
  els.dossierCopy.innerHTML = `
    <span class="lead">${escapeHTML(fighter.game)} · ${escapeHTML(fighter.category)} · ${escapeHTML(fighter.archetype.toUpperCase())}</span>
    <h3>${escapeHTML(fighter.name)}</h3>
    <div class="dossier-grid">
      <div class="dossier-box"><b>APPARITION / LORE</b><p>${escapeHTML(fighter.lore)}</p></div>
      <div class="dossier-box"><b>COMPORTEMENT SOURCE</b><p>${escapeHTML(fighter.canonicalBehavior)}</p></div>
      <div class="dossier-box trait"><b>TRAIT DE MANIFESTATION</b><p><strong>${escapeHTML(profile.trait.name)}</strong><br>${escapeHTML(profile.trait.description)}</p></div>
      <div class="dossier-box affliction"><b>AFFLICTION SIGNATURE</b><p><strong>${escapeHTML(profile.affliction.name)}</strong><br>${escapeHTML(profile.affliction.description)}</p></div>
      <div class="dossier-box"><b>FINISHER</b><p>${escapeHTML(fighter.finisher)}</p></div>
      <div class="dossier-box"><b>ARÈNE ASSOCIÉE</b><p>${escapeHTML(arena.name)}${hazard ? `<br><small>${escapeHTML(hazard.name)}</small>` : ''}</p></div>
    </div>
    <div class="adaptation-note"><b>NOTE DE FIDÉLITÉ</b><br>${escapeHTML(fighter.adaptation)} Les proportions, signes distinctifs, posture et rôle sont documentés séparément des règles d’équilibrage.</div>
    <h4>MOVESET ADAPTÉ</h4><ul class="move-list">${moves}</ul>`;
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
    versus: ['VERSUS', 'COMBATTRE'], arcade: ['ARCADE', 'COMMENCER LE PARCOURS'],
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
  } else if (preset === 'arcade' || preset === 'boss' || preset === 'chronicle') {
    els.mode.value = 'cpu';
    els.mode.disabled = true;
  }
}

function buildRun() {
  if (preset === 'arcade') {
    const shuffled = [...ROSTER].sort(() => Math.random() - .5).filter((f) => f.id !== state.p1.id);
    state.run = { type: 'ARCADE', index: 0, wins: 0, queue: shuffled.slice(0, 7).map((f) => f.id), stages: [...STAGES].sort(() => Math.random() - .5).slice(0, 7).map((s) => s.id) };
  } else if (preset === 'boss') {
    const shuffled = ROSTER.filter((f) => f.boss && f.id !== state.p1.id).sort(() => Math.random() - .5);
    state.run = { type: 'GRANDS TOURMENTS', index: 0, wins: 0, queue: shuffled.slice(0, 6).map((f) => f.id), stages: [...STAGES].filter((s) => ['otherworld','church','lair','prison','shrine','book','elemental'].includes(s.family) || s.weather === 'embers').sort(() => Math.random() - .5).slice(0, 6).map((s) => s.id) };
    if (!state.run.stages.length) state.run.stages = STAGES.slice(0, 6).map((s) => s.id);
  } else if (preset === 'chronicle') {
    const ids = (params.get('queue') || '').split(',').filter(Boolean);
    const stages = (params.get('stages') || '').split(',').filter(Boolean);
    state.run = { type: 'CHRONIQUE', index: 0, wins: 0, queue: ids.length ? ids : [state.p2.id], stages };
  } else state.run = null;
  if (state.run?.queue.length) state.p2 = getFighter(state.run.queue[0]);
  if (state.run?.stages?.[0]) state.stage = getStage(state.run.stages[0]);
}

function showFight() {
  els.selectScreen.classList.add('hidden');
  els.fightScreen.classList.remove('hidden');
  els.result.classList.add('hidden');
  window.scrollTo(0, 0);
}
function showSelect() {
  state.engine?.destroy(); state.engine = null;
  els.fightScreen.classList.add('hidden');
  els.selectScreen.classList.remove('hidden');
  els.result.classList.add('hidden');
  renderSelected(); renderRoster();
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
    seed: Date.now(),
    callbacks: { onMatchEnd: handleMatchEnd }
  };
}

function startFight({ preserveRun = false } = {}) {
  if (!preserveRun) buildRun();
  if (state.run?.queue?.length) {
    state.p2 = getFighter(state.run.queue[state.run.index]);
    if (state.run.stages?.length) state.stage = getStage(state.run.stages[state.run.index % state.run.stages.length]);
  }
  state.engine?.destroy();
  showFight();
  const training = preset === 'training';
  els.trainingToggle.classList.toggle('hidden', !training);
  els.trainingPanel.classList.toggle('hidden', !training);
  els.touchLayer.style.display = state.touchEnabled ? 'block' : '';
  els.matchLabel.textContent = state.run ? `${state.run.type} ${state.run.index + 1}/${state.run.queue.length}` : (training ? 'OBSERVATION' : 'VERSUS');
  els.gameHelp.textContent = els.mode.value === 'local' && !training ? `${CONTROL_LABELS.p1} · P2: ${CONTROL_LABELS.p2}` : CONTROL_LABELS.p1;
  saveLastFront({ mode: preset, p1: state.p1.id, p2: state.p2.id, stage: state.stage.id, rules: { otherworldShift: els.otherworldShift.checked, stageHazards: els.stageHazards.checked, radioWarning: els.radioWarning.checked } });
  state.engine = new FightEngine(els.game, fightConfig());
  state.engine.start();
}

function handleMatchEnd(result) {
  state.lastResult = result;
  const won = result.winner.id === state.p1.id;
  if (state.run && won) state.run.wins++;
  const winnerStats = result.stats?.winner || {};
  const grade = winnerStats.grade || chronicleGrade(winnerStats);
  const records = loadJSON(RECORDS_KEY, { matches: 0, wins: 0, defeated: {}, arcadeBest: 0, bossBest: 0, perfectGuards: 0, counters: 0, hazardsTaken: 0, bestGrade: 'D' });
  records.matches = (records.matches || 0) + 1;
  if (won) records.wins = (records.wins || 0) + 1;
  records.defeated = records.defeated || {};
  if (won) records.defeated[state.p2.id] = (records.defeated[state.p2.id] || 0) + 1;
  records.perfectGuards = (records.perfectGuards || 0) + (winnerStats.perfectGuards || 0);
  records.counters = (records.counters || 0) + (winnerStats.counters || 0);
  records.hazardsTaken = (records.hazardsTaken || 0) + (winnerStats.hazardsTaken || 0);
  if ((GRADE_SCORE[grade] ?? 0) > (GRADE_SCORE[records.bestGrade] ?? 0)) records.bestGrade = grade;
  if (state.run?.type === 'ARCADE') records.arcadeBest = Math.max(records.arcadeBest || 0, state.run.wins);
  if (state.run?.type === 'GRANDS TOURMENTS') records.bossBest = Math.max(records.bossBest || 0, state.run.wins);
  writeJSON(RECORDS_KEY, records);
  const routeId = params.get('route');
  const completedRun = Boolean(state.run && won && state.run.index + 1 >= state.run.queue.length);
  if (routeId) {
    const chronicleProgress = loadJSON(CHRONICLES_KEY, { completed: [], attempts: {}, grades: {}, bestStats: {} });
    chronicleProgress.grades = chronicleProgress.grades || {};
    chronicleProgress.bestStats = chronicleProgress.bestStats || {};
    const oldGrade = chronicleProgress.grades[routeId] || 'D';
    if ((GRADE_SCORE[grade] ?? 0) >= (GRADE_SCORE[oldGrade] ?? 0)) {
      chronicleProgress.grades[routeId] = grade;
      chronicleProgress.bestStats[routeId] = { ...winnerStats, worldShiftTriggered: result.stats?.worldShiftTriggered, hazardsTriggered: result.stats?.hazardsTriggered };
    }
    if (completedRun) chronicleProgress.completed = [...new Set([...(chronicleProgress.completed || []), routeId])];
    writeJSON(CHRONICLES_KEY, chronicleProgress);
  }
  setTimeout(() => {
    els.resultKicker.textContent = state.run ? `${state.run.type} · COMBAT ${state.run.index + 1}` : 'RÉSULTAT';
    els.resultTitle.textContent = result.winner.name;
    els.resultText.textContent = won ? `${result.winner.name} domine ${result.loser.name}.` : `${result.winner.name} impose son cauchemar.`;
    els.resultStats.innerHTML = `
      <div class="result-stat result-grade"><b>RANG ${escapeHTML(grade)}</b><span>DOSSIER DE PERFORMANCE</span></div>
      <div class="result-stat"><b>${winnerStats.maxCombo || 0}</b><span>COMBO MAX</span></div>
      <div class="result-stat"><b>${winnerStats.perfectGuards || 0}</b><span>GARDES PARFAITES</span></div>
      <div class="result-stat"><b>${winnerStats.counters || 0}</b><span>CONTRES</span></div>
      <div class="result-stat"><b>${winnerStats.hazardsTaken || 0}</b><span>DANGERS SUBIS</span></div>`;
    const hasNext = Boolean(state.run && won && state.run.index + 1 < state.run.queue.length);
    els.continueRun.classList.toggle('hidden', !hasNext);
    if (state.run && won && !hasNext) els.resultText.textContent += ` Parcours ${state.run.type.toLowerCase()} terminé : ${state.run.wins}/${state.run.queue.length}.`;
    els.result.classList.remove('hidden');
  }, 600);
}

function continueRun() {
  if (!state.run) return;
  state.run.index++;
  if (state.run.index >= state.run.queue.length) { showSelect(); return; }
  state.p2 = getFighter(state.run.queue[state.run.index]);
  if (state.run.stages?.length) state.stage = getStage(state.run.stages[state.run.index % state.run.stages.length]);
  startFight({ preserveRun: true });
}

function updateTraining() {
  state.engine?.setTrainingOptions({
    showHitboxes: els.hitboxes.checked,
    autoHeal: els.autoHeal.checked,
    freeMeter: els.freeMeter.checked,
  });
}

function bindTouch() {
  $$('.touch-button').forEach((button) => {
    const player = button.dataset.player;
    const action = button.dataset.action;
    const press = (event) => { event.preventDefault(); state.engine?.setTouch(player, action, 'pressed'); };
    const release = (event) => { event.preventDefault(); state.engine?.setTouch(player, action, false); };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
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
  els.backCommand.addEventListener('click', returnToCommand);
  els.launch.addEventListener('click', () => startFight());
  els.leaveFight.addEventListener('click', showSelect);
  els.resultSelect.addEventListener('click', showSelect);
  els.rematch.addEventListener('click', () => startFight({ preserveRun: Boolean(state.run) }));
  els.continueRun.addEventListener('click', continueRun);
  els.pauseBtn.addEventListener('click', () => state.engine?.togglePause());
  els.trainingToggle.addEventListener('click', () => els.trainingPanel.classList.toggle('hidden'));
  [els.hitboxes, els.autoHeal, els.freeMeter].forEach((input) => input.addEventListener('change', updateTraining));
  els.forceShift.addEventListener('click', () => state.engine?.forceOtherworldShift());
  els.resetDojo.addEventListener('click', () => state.engine?.resetMatch());
  els.mobileP1.addEventListener('click', () => {
    state.touchEnabled = !state.touchEnabled;
    els.mobileP1.textContent = state.touchEnabled ? 'TOUCH P1 ON' : 'TOUCH P1';
    els.touchLayer.style.display = state.touchEnabled ? 'block' : 'none';
  });
  addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      if (!els.dossier.classList.contains('hidden')) closeDossier();
      else if (!els.stageGallery.classList.contains('hidden')) closeStageGallery();
      else if (!els.fightScreen.classList.contains('hidden')) state.engine?.togglePause();
      else returnToCommand();
    }
    if (!els.selectScreen.classList.contains('hidden') && event.code === 'Enter') startFight();
  });
  bindTouch();
}

function init() {
  els.otherworldShift.checked = settings.otherworldShift !== false;
  els.stageHazards.checked = settings.stageHazards !== false;
  els.radioWarning.checked = settings.radioWarning !== false;
  populateFilters();
  configurePreset();
  bindEvents();
  renderSelected();
  applyFilters();
  if (state.touchEnabled) { els.mobileP1.textContent = 'TOUCH P1 ON'; }
  const shouldAutostart = params.get('autostart') === '1' || params.get('autostart') === 'true';
  if (shouldAutostart) setTimeout(() => startFight(), 120);
}

init();
