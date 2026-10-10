import { CONTENT_STATS, SAVE_KEY, VERSION } from './data.js';

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
    kicker: 'QUICK RESUME',
    title: 'RETOUR<br><span>DANS LA BRUME.</span>',
    text: 'Le dernier front reprend avec le même combattant, la même arène et la même règle.',
    choices: ['DERNIER FRONT','SAUVEGARDE LOCALE'],
    scene: 'fog', frequency: '106.7', code: 'SHHF/00', signal: 'LAST SAVE', data: ['LOCAL MEMORY','FOG LOCK']
  },
  chronicles: {
    kicker: 'NARRATIVE ROUTES',
    title: 'CHRONIQUES<br><span>DE LA BRUME.</span>',
    text: `${CONTENT_STATS.chronicles} routes relient affrontements, dossiers, lieux, rangs et conséquences.`,
    choices: [`${CONTENT_STATS.chronicles} ROUTES`,'RANGS S–D','BOSS FINAUX'],
    scene: 'chronicles', frequency: '87.9', code: 'SHHF/14', signal: 'NARRATIVE', data: [`${CONTENT_STATS.chronicles} ROUTES`,'LOCAL RECORD']
  },
  versus: {
    kicker: 'MANIFESTATION CONTACT',
    title: 'CHOISIS<br><span>TON CAUCHEMAR.</span>',
    text: `Sélection P1/P2, ${CONTENT_STATS.fighters} manifestations, ${CONTENT_STATS.moves} coups documentés, ordinateur, local et ${CONTENT_STATS.stages} arènes.`,
    choices: ['1P VS MANIFESTATION','2P LOCAL','MOVESETS 16 COMMANDES'],
    scene: 'duel', frequency: '93.1', code: 'SHHF/VS', signal: 'CONTACT', data: [`${CONTENT_STATS.fighters} FORMS`,`${CONTENT_STATS.moves} MOVES`]
  },
  arcade: {
    kicker: 'RANDOM DESCENT',
    title: 'TRAVERSE<br><span>L’OTHERWORLD.</span>',
    text: 'Un parcours de sept rencontres, difficulté progressive, Otherworld dynamique et dernier boss aléatoire.',
    choices: ['7 COMBATS','DANGERS D’ARÈNE','RECORD'],
    scene: 'arcade', frequency: '101.3', code: 'SHHF/07', signal: 'DESCENT', data: ['7 ENCOUNTERS','NO RETURN']
  },
  ritual: {
    kicker: 'SEVEN SEALS GAUNTLET',
    title: 'LES RITES<br><span>DU JUGEMENT.</span>',
    text: `${CONTENT_STATS.rituals - 1} altérations successives, endurance persistante, phases de boss et classement local.`,
    choices: [`${CONTENT_STATS.rituals - 1} RITES`,'ENDURANCE','PHASES DE BOSS'],
    scene: 'ritual', frequency: '66.6', code: 'SHHF/RT', signal: 'RITUAL', data: [`${CONTENT_STATS.rituals - 1} SEALS`,'ENDURANCE']
  },
  boss: {
    kicker: 'GREAT TORMENTS',
    title: 'LES GRANDS<br><span>TOURMENTS.</span>',
    text: 'Un circuit réservé aux manifestations majeures et aux boss, avec endurance persistante.',
    choices: [`${CONTENT_STATS.bosses} BOSS`,'ENDURANCE','CLASSEMENT LOCAL'],
    scene: 'boss', frequency: '120.4', code: 'SHHF/BX', signal: 'TORMENT', data: [`${CONTENT_STATS.bosses} BOSS`,`${CONTENT_STATS.bossPhases} PHASES`]
  },
  training: {
    kicker: 'OBSERVATION CELL',
    title: 'ÉTUDIE<br><span>LA MANIFESTATION.</span>',
    text: 'Frame data, seize commandes par manifestation, hitboxes, traits, afflictions, parade parfaite et Otherworld forcé.',
    choices: ['16 COMMANDES','FRAME DATA','FORCER OTHERWORLD'],
    scene: 'training', frequency: '104.8', code: 'SHHF/OB', signal: 'OBSERVE', data: ['16 COMMANDS','FRAME DATA']
  },
  archive: {
    kicker: 'BESTIARY & EVIDENCE',
    title: 'ARCHIVES<br><span>DE L’OTHERWORLD.</span>',
    text: 'Catalogue filtrable, 3 680 coups, comportement canonique, adaptation versus et matrice de fidélité.',
    choices: [`${CONTENT_STATS.fighters} PROFILS`,`${CONTENT_STATS.moves} COUPS`,`${CONTENT_STATS.stages} LIEUX`],
    scene: 'archive', frequency: '108.2', code: 'SHHF/AR', signal: 'EVIDENCE', data: [`${CONTENT_STATS.moves} MOVES`,`${CONTENT_STATS.sources} SOURCES`]
  },
  options: {
    kicker: 'SYSTEM SETTINGS',
    title: 'RÈGLE<br><span>LE SIGNAL.</span>',
    text: 'Affichage, confort, audio, IA adaptative, fatalités, animations, Otherworld et dangers d’arène.',
    choices: ['ACCESSIBILITÉ','RÈGLES DYNAMIQUES','SAUVEGARDE'],
    scene: 'options', frequency: '88.3', code: 'SHHF/OP', signal: 'CONFIG', data: ['ACCESSIBILITY','LOCAL ONLY']
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
let active = 0;
let settings = loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS);
let raf = 0;

function loadJSON(key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') }; }
  catch { return { ...fallback }; }
}
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new StorageEvent('storage',{key:SETTINGS_KEY,newValue:JSON.stringify(settings)}));
}
function applySettings() {
  document.querySelector('.scanlines').classList.toggle('hidden', !settings.scanlines);
  document.querySelector('.grain').classList.toggle('hidden', !settings.grain);
  document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
  document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  for (const button of $$('[data-setting]')) {
    const key = button.dataset.setting;
    button.classList.toggle('on', Boolean(settings[key]));
    button.textContent = settings[key] ? 'ACTIF' : 'INACTIF';
  }
  $('[data-range="masterVolume"]').value = settings.masterVolume;
  $('#difficulty').value = settings.difficulty;
}
function currentMode() { return items[active]?.dataset.mode || 'continue'; }
function select(index) {
  active = (index + items.length) % items.length;
  items.forEach((item,i)=>item.classList.toggle('active',i===active));
  const mode = currentMode();
  const data = modes[mode];
  $('#heroKicker').textContent = data.kicker;
  $('#heroTitle').innerHTML = data.title;
  $('#heroText').textContent = data.text;
  $('#heroChoices').innerHTML = data.choices.map((label,i)=>`<span class="hero-choice ${i===0?'active':''}">${label}</span>`).join('');
  $('#heroData').innerHTML = (data.data || []).map((label)=>`<span>${label}</span>`).join('');
  $('#signalFrequency').textContent = data.frequency || '106.7';
  $('#signalState').textContent = data.signal || 'STATIC';
  $('#caseStamp').textContent = `CASE ${String(active).padStart(2,'0')} — ${(data.signal || data.scene).toUpperCase()}`;
  $('#evidenceCode').textContent = data.code || `SHHF/${String(active).padStart(2,'0')}`;
  document.documentElement.dataset.scene = data.scene;
  drawHero(data.scene, performance.now());
}
function launch(mode = currentMode()) {
  if (mode === 'options') return openOptions();
  if (mode === 'continue') {
    const saved = loadJSON(SAVE_KEY, {});
    mode = saved.lastMode || 'versus';
  }
  const url = moduleUrls[mode];
  if (!url) return;
  loading.classList.remove('hidden');
  player.classList.add('show');
  frame.src = url;
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...loadJSON(SAVE_KEY,{}), lastMode: mode, lastOpened: Date.now() }));
}
function closeModule() {
  player.classList.remove('show');
  frame.src = 'about:blank';
  loading.classList.remove('hidden');
}
function openOptions() { $('#optionsModal').classList.remove('hidden'); }
function closeOptions() { $('#optionsModal').classList.add('hidden'); }

items.forEach((item,i)=>{
  item.addEventListener('mouseenter',()=>select(i));
  item.addEventListener('focus',()=>select(i));
  item.addEventListener('click',()=>{select(i);launch();});
});
frame.addEventListener('load',()=>setTimeout(()=>loading.classList.add('hidden'),160));
$('#returnCommand').addEventListener('click',closeModule);
$('#reloadModule').addEventListener('click',()=>{loading.classList.remove('hidden');frame.contentWindow?.location.reload();});
$('#closeOptions').addEventListener('click',closeOptions);
$('#optionsModal').addEventListener('click',event=>{if(event.target.id==='optionsModal')closeOptions();});
$('#fullscreen').addEventListener('click',()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{}));
$('#resetSave').addEventListener('click',()=>{
  if (confirm('Effacer progression, records et dernier front ?')) {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('sh-halo-of-flesh-records-v1');
    localStorage.removeItem('sh-halo-of-flesh-chronicles-v1');
  }
});
$$('[data-setting]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.setting;settings[key]=!settings[key];saveSettings();applySettings();
}));
$('[data-range="masterVolume"]').addEventListener('input',event=>{settings.masterVolume=Number(event.target.value);saveSettings();});
$('#difficulty').addEventListener('change',event=>{settings.difficulty=event.target.value;saveSettings();});

addEventListener('keydown',event=>{
  if (player.classList.contains('show')) {
    if (event.code==='Escape') { event.preventDefault(); closeModule(); }
    return;
  }
  if (!$('#optionsModal').classList.contains('hidden')) {
    if (event.code==='Escape') closeOptions();
    return;
  }
  if (event.code==='ArrowDown') { event.preventDefault(); select(active+1); }
  if (event.code==='ArrowUp') { event.preventDefault(); select(active-1); }
  if (event.code==='Enter') { event.preventDefault(); launch(); }
  if (event.code==='KeyF') document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{});
});
addEventListener('message',event=>{
  if (event.data?.type==='SHHF_RETURN') closeModule();
  if (event.data?.type==='SHHF_OPEN' && moduleUrls[event.data.mode]) launch(event.data.mode);
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
  raf=requestAnimationFrame(drawCommandBackground);
}

function line(x1,y1,x2,y2,width,color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function drawExecutioner(x,y,scale=1,alpha=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,18,82,18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#353733';ctx.strokeStyle='#0b0c0b';ctx.lineWidth=7;
  ctx.beginPath();ctx.moveTo(-43,-177);ctx.lineTo(40,-173);ctx.lineTo(56,-44);ctx.lineTo(26,-18);ctx.lineTo(-28,-19);ctx.lineTo(-53,-54);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#64564f';ctx.beginPath();ctx.moveTo(-45,-195);ctx.lineTo(70,-160);ctx.lineTo(-5,-111);ctx.lineTo(-75,-145);ctx.closePath();ctx.fill();ctx.stroke();
  line(-24,-24,-39,18,28,'#242723');line(24,-24,36,18,28,'#242723');
  line(-30,-146,-61,-74,23,'#383a35');line(34,-143,74,-78,23,'#383a35');
  ctx.save();ctx.translate(74,-72);ctx.rotate(-.72);ctx.fillStyle='#6c6b60';ctx.strokeStyle='#161715';ctx.lineWidth=7;ctx.fillRect(0,-8,150,16);ctx.strokeRect(0,-8,150,16);ctx.beginPath();ctx.moveTo(132,-48);ctx.lineTo(214,-8);ctx.lineTo(131,38);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  ctx.restore();
}
function drawFlower(x,y,scale=1,alpha=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(0,0,0,.36)';ctx.beginPath();ctx.ellipse(0,15,62,13,0,0,Math.PI*2);ctx.fill();
  line(-19,-48,-31,12,20,'#342b2c');line(19,-48,30,12,20,'#342b2c');
  ctx.fillStyle='#4c3538';ctx.strokeStyle='#100b0c';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-36,-148);ctx.quadraticCurveTo(0,-169,39,-146);ctx.lineTo(27,-48);ctx.lineTo(-28,-48);ctx.closePath();ctx.fill();ctx.stroke();
  line(-30,-133,-62,-68,17,'#473035');line(31,-131,64,-77,17,'#473035');
  const petals=13;for(let i=0;i<petals;i++){const a=i/petals*Math.PI*2;ctx.save();ctx.rotate(a);ctx.fillStyle=i%2?'#7f323a':'#9f444c';ctx.beginPath();ctx.ellipse(0,-190,22,58,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();}
  ctx.fillStyle='#1a0d0e';ctx.beginPath();ctx.arc(0,-184,31,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#c16a70';ctx.lineWidth=4;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;line(Math.cos(a)*8,-184+Math.sin(a)*8,Math.cos(a)*28,-184+Math.sin(a)*28,3,'#c16a70');}
  ctx.restore();
}
function drawNurse(x,y,scale=1,alpha=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,10,50,11,0,0,Math.PI*2);ctx.fill();
  line(-16,-55,-26,9,18,'#5b5750');line(17,-55,28,9,18,'#5b5750');
  ctx.fillStyle='#817b70';ctx.strokeStyle='#141512';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-36,-143);ctx.lineTo(32,-143);ctx.lineTo(46,-53);ctx.lineTo(-45,-53);ctx.closePath();ctx.fill();ctx.stroke();
  line(-31,-130,-58,-73,16,'#7c756a');line(30,-129,54,-80,16,'#7c756a');
  ctx.fillStyle='#b9b09f';ctx.beginPath();ctx.arc(0,-176,27,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#6f4a4c';ctx.lineWidth=5;for(let i=-18;i<=18;i+=9){line(i,-192,-i*.7,-159,4,'#6f4a4c');}
  line(54,-80,118,-34,8,'#66645b');
  ctx.restore();
}
function drawHero(scene,time){
  const w=heroCanvas.width,h=heroCanvas.height;ctx.clearRect(0,0,w,h);
  const palettes={fog:['#263029','#060907'],chronicles:['#34352e','#070907'],duel:['#302c28','#080706'],arcade:['#332427','#080405'],ritual:['#351e22','#070304'],boss:['#3b2022','#080303'],training:['#20332c','#040806'],archive:['#2f3430','#060806'],options:['#29302c','#050705']};
  const p=palettes[scene]||palettes.fog;const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(182,191,182,.055)';for(let x=-h;x<w;x+=52){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+h,h);ctx.stroke();}
  for(let i=0;i<7;i++){ctx.fillStyle=`rgba(210,214,205,${.014+i*.006})`;ctx.beginPath();ctx.moveTo(0,120+i*78);for(let x=0;x<w;x+=60)ctx.lineTo(x,120+i*78+Math.sin(x*.012+i)*26);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();}
  const sway=settings.reducedMotion?0:Math.sin(time*.001)*4;
  if(scene==='boss'){drawExecutioner(900+sway,665,1.55,1);drawFlower(1080-sway,667,1.14,.55);}
  else if(scene==='ritual'){drawFlower(880+sway,667,1.38,.88);drawExecutioner(1060-sway,667,1.1,.62);}
  else if(scene==='archive'){drawNurse(835+sway,665,1.45,.92);drawExecutioner(1040-sway,667,1.18,.75);}
  else if(scene==='chronicles'){drawFlower(890+sway,667,1.42,.95);drawNurse(1070-sway,667,1.05,.62);}
  else if(scene==='training'){drawNurse(860,665,1.35,.95);ctx.strokeStyle='rgba(208,75,83,.55)';ctx.lineWidth=3;ctx.strokeRect(810,390,100,255);ctx.fillStyle='rgba(208,75,83,.12)';ctx.fillRect(790,520,160,80);}
  else{drawExecutioner(850+sway,667,1.42,.9);drawFlower(1065-sway,667,1.18,.82);}
}

$('#contentCount').textContent = `v${VERSION} · ${CONTENT_STATS.fighters} MANIFESTATIONS · ${CONTENT_STATS.moves} COUPS · ${CONTENT_STATS.bosses} BOSS · ${CONTENT_STATS.stages} ARÈNES`;
document.documentElement.dataset.version = VERSION;
setInterval(()=>{
  if(settings.reducedMotion)return;
  const bars=$$('.radio-bars b');
  bars.forEach((bar,index)=>bar.style.height=`${4+Math.round((.5+.5*Math.sin(performance.now()*.006+index*1.7))*15)}px`);
},110);

applySettings();select(0);cancelAnimationFrame(raf);requestAnimationFrame(drawCommandBackground);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
const query=new URLSearchParams(location.search);if(query.get('module')&&moduleUrls[query.get('module')])launch(query.get('module'));
