import { SAVE_KEY, SOURCE_META } from './data.js';

export const SETTINGS_KEY = 'sh-halo-of-flesh-settings-v1';
export const RECORDS_KEY = 'sh-halo-of-flesh-records-v1';
export const CHRONICLES_KEY = 'sh-halo-of-flesh-chronicles-v1';

const DEFAULT_SETTINGS = {
  scanlines:true, grain:true,
  reducedMotion:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,
  highContrast:typeof matchMedia==='function'&&matchMedia('(prefers-contrast: more)').matches,
  vibration:true, masterVolume:65, difficulty:'normal',
  otherworldShift:true, stageHazards:true, radioWarning:true, screenShake:true, adaptiveAI:true,
  fatalities:true, stageFatalities:true, stageAnimations:true, stageTerrain:true, stageDirector:true
};
const VALID_DIFFICULTIES = new Set(['story','normal','hard']);
function isPlainRecord(value){return Boolean(value)&&typeof value==='object'&&!Array.isArray(value);}

export function loadJSON(key, fallback = {}) {
  try {
    const raw=localStorage.getItem(key);
    if(!raw)return { ...fallback };
    const parsed=JSON.parse(raw);
    return isPlainRecord(parsed)?{ ...fallback, ...parsed }:{ ...fallback };
  } catch { return { ...fallback }; }
}
export function writeJSON(key, value) {
  try{localStorage.setItem(key, JSON.stringify(value));return value;}catch{return null;}
}
export function loadSettings() {
  const candidate=loadJSON(SETTINGS_KEY,DEFAULT_SETTINGS);
  const settings={...DEFAULT_SETTINGS};
  for(const [key,value] of Object.entries(DEFAULT_SETTINGS))if(typeof value==='boolean')settings[key]=typeof candidate[key]==='boolean'?candidate[key]:value;
  const volume=Number(candidate.masterVolume);
  settings.masterVolume=Number.isFinite(volume)?Math.max(0,Math.min(100,Math.round(volume/5)*5)):65;
  settings.difficulty=VALID_DIFFICULTIES.has(candidate.difficulty)?candidate.difficulty:'normal';
  return settings;
}
export function saveLastFront(front) {
  const current = loadJSON(SAVE_KEY, {});
  writeJSON(SAVE_KEY, { ...current, ...front, updatedAt: Date.now() });
}
export function sourceName(id) { return SOURCE_META[id]?.label || id; }
export function clamp(value,min,max){ return Math.max(min,Math.min(max,value)); }
export function lerp(a,b,t){ return a+(b-a)*t; }
export function easeOutCubic(t){ return 1-Math.pow(1-t,3); }
export function seededRandom(seed=1){
  let s=(typeof seed==='number'?seed:hashCode(String(seed)))>>>0;
  return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
}
export function hashCode(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
export function formatTime(seconds){const s=Math.max(0,Math.floor(seconds));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export function escapeHTML(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
export function vibrate(pattern){
  const settings=loadSettings();
  if(typeof navigator==='undefined'||!settings.vibration||!navigator.vibrate)return false;
  if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return false;
  try{return navigator.vibrate(pattern);}catch{return false;}
}

class ProceduralAudio {
  constructor(){this.context=null;this.master=null;this.settings=loadSettings();this.unlocked=false;}
  unlock(){
    this.unlocked=true;
    if(!this.ensure())return false;
    if(this.context?.state==='suspended')void this.context.resume().catch(()=>{});
    return true;
  }
  ensure(){
    if(this.context)return this.context.state!=='closed';
    const activated=typeof navigator==='undefined'||!navigator.userActivation||navigator.userActivation.hasBeenActive;
    if(!this.unlocked&&!activated)return false;
    try{this.context=new (window.AudioContext||window.webkitAudioContext)();this.master=this.context.createGain();this.master.gain.value=this.settings.masterVolume/100*.24;this.master.connect(this.context.destination);return true;}catch{return false;}
  }
  tone({freq=180,duration=.08,type='sawtooth',gain=.12,slide=0,when=0}={}){
    if(!this.ensure())return;
    const c=this.context,t=c.currentTime+when,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);
  }
  noise({duration=.12,gain=.08,filter=900,when=0}={}){
    if(!this.ensure())return;
    const c=this.context,t=c.currentTime+when,len=Math.max(1,Math.floor(c.sampleRate*duration)),buf=c.createBuffer(1,len,c.sampleRate),data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const src=c.createBufferSource(),biq=c.createBiquadFilter(),g=c.createGain();src.buffer=buf;biq.type='lowpass';biq.frequency.value=filter;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);src.connect(biq);biq.connect(g);g.connect(this.master);src.start(t);
  }
  ui(){this.tone({freq:260,duration:.045,type:'square',gain:.04,slide:80});}
  confirm(){this.tone({freq:150,duration:.08,gain:.06,slide:110});this.tone({freq:240,duration:.12,gain:.04,slide:130,when:.06});}
  hit(power=1){this.noise({duration:.08+.05*power,gain:.05+.05*power,filter:500+550*power});this.tone({freq:90+35*power,duration:.09,type:'sawtooth',gain:.05,slide:-25});}
  guard(){this.noise({duration:.055,gain:.04,filter:1600});this.tone({freq:310,duration:.05,type:'square',gain:.025,slide:-70});}
  perfectGuard(){this.noise({duration:.11,gain:.065,filter:3200});this.tone({freq:520,duration:.065,type:'square',gain:.035,slide:240});this.tone({freq:820,duration:.08,type:'sine',gain:.025,slide:-260,when:.03});}
  siren(){for(let i=0;i<5;i++){this.tone({freq:115+i*8,duration:1.2,type:'sawtooth',gain:.025,slide:85,when:i*.18});this.tone({freq:230-i*7,duration:1.05,type:'triangle',gain:.018,slide:-95,when:i*.18});}this.noise({duration:1.4,gain:.03,filter:480});}
  hazard(){this.noise({duration:.2,gain:.07,filter:760});this.tone({freq:72,duration:.34,type:'sawtooth',gain:.05,slide:-30});}
  super(){for(let i=0;i<5;i++)this.tone({freq:70+i*36,duration:.45,type:'sawtooth',gain:.04,slide:100,when:i*.035});}
  ko(){this.tone({freq:100,duration:.8,type:'sawtooth',gain:.07,slide:-65});this.noise({duration:.65,gain:.05,filter:400});}
  updateVolume(){this.settings=loadSettings();if(this.master)this.master.gain.value=this.settings.masterVolume/100*.24;}
}
export const audio = new ProceduralAudio();

export function attachGlobalAudioUnlock(){
  const unlock=()=>{audio.unlock();document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);};
  document.addEventListener('pointerdown',unlock,{once:true});document.addEventListener('keydown',unlock,{once:true});
}

function parentOrigin(){return location.origin==='null'?'*':location.origin;}
export function returnToCommand(){
  if(window.parent!==window)window.parent.postMessage({type:'SHHF_RETURN'},parentOrigin());
  else location.href='../index.html';
}
export function openMode(mode){
  if(window.parent!==window)window.parent.postMessage({type:'SHHF_OPEN',mode},parentOrigin());
  else location.href=`../index.html?module=${encodeURIComponent(mode)}`;
}

export function createPortraitCanvas(fighter,size=240){
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;return canvas;
}
