/** Local data is untrusted, including imports. No network or telemetry. */
export const MEMORY_SCHEMA = 'shhf-memory-v1';
export const KEYS = Object.freeze({
  settings:'sh-halo-of-flesh-settings-v1', records:'sh-halo-of-flesh-records-v1',
  chronicles:'sh-halo-of-flesh-chronicles-v1', favorites:'sh-halo-of-flesh-favorites-v1',
  front:'sh-halo-of-flesh-save-v1', run:'sh-halo-of-flesh-run-v1', controls:'sh-halo-of-flesh-controls-v1'
});
const ALLOWED = new Set(Object.values(KEYS));
const BACKUP = ':backup';
const MAX_BYTES = 2_000_000;
const badKeys = new Set(['__proto__','prototype','constructor']);
const modes = new Set(['versus','arcade','boss','ritual','chronicle','chronicles','training','archive']);
export const plain = value => !!value && typeof value==='object' && !Array.isArray(value) &&
  [Object.prototype,null].includes(Object.getPrototypeOf(value));
const text = (value, n=240) => typeof value==='string' && value.length<=n;
const count = value => Number.isSafeInteger(value) && value>=0 && value<=Number.MAX_SAFE_INTEGER;
const ids = value => Array.isArray(value) && value.length<=1024 && value.every(v=>text(v,180));
function safeTree(value, depth=0) {
  if(depth>12) return false;
  if(value===null || typeof value==='boolean') return true;
  if(typeof value==='number') return Number.isFinite(value) && Math.abs(value)<=Number.MAX_SAFE_INTEGER;
  if(typeof value==='string') return value.length<=16000;
  if(Array.isArray(value)) return value.length<=2048 && value.every(v=>safeTree(v,depth+1));
  return plain(value) && Object.keys(value).length<=2048 && Object.entries(value).every(([k,v])=>
    !badKeys.has(k) && k.length<=200 && safeTree(v,depth+1));
}
export function validateEntry(key, value) {
  if(!ALLOWED.has(key) || !plain(value) || !safeTree(value)) return false;
  const fields = Object.entries(value);
  if(key===KEYS.settings) return fields.every(([k,v])=>
    k==='masterVolume' ? Number.isFinite(v)&&v>=0&&v<=100 :
    k==='difficulty' ? ['story','normal','hard'].includes(v) : typeof v==='boolean');
  if(key===KEYS.favorites) return fields.every(([k,v])=>k==='ids'&&ids(v));
  if(key===KEYS.records) return fields.every(([k,v])=>
    k==='defeated' ? plain(v)&&Object.values(v).every(count) :
    k==='appliedMatches' ? ids(v) : k==='bestGrade' ? /^[SABCD]$/.test(v) : count(v));
  if(key===KEYS.chronicles) return fields.every(([k,v])=>
    k==='completed' ? ids(v) : k==='attempts' ? plain(v)&&Object.values(v).every(count) :
    k==='grades' ? plain(v)&&Object.values(v).every(g=>typeof g==='string'&&/^[SABCD]$/.test(g)) :
    k==='bestStats' ? plain(v)&&Object.values(v).every(s=>plain(s)&&Object.values(s).every(x=>
      typeof x==='boolean'||(typeof x==='number'&&Number.isFinite(x)&&x>=0)||(typeof x==='string'&&/^[SABCD]$/.test(x)))) : false);
  if(key===KEYS.front) return fields.every(([k,v])=>
    ['mode','lastMode'].includes(k) ? modes.has(v) : ['updatedAt','lastOpened'].includes(k) ? count(v) :
    ['p1','p2','stage','ritualId'].includes(k) ? text(v,180) : k==='rules' ? plain(v)&&Object.values(v).every(x=>typeof x==='boolean') : false);
  // The controller/route modules validate the complete domain contract on read.
  if(key===KEYS.controls) return value.schema===1 && Array.isArray(value.players) && value.players.length===2 &&
    value.players.every(p=>plain(p)&&Object.values(p).every(v=>text(v,32))) &&
    Number.isFinite(value.deadzone)&&value.deadzone>=.15&&value.deadzone<=.65;
  if(key===KEYS.run) return value.schema===1 && ['arcade','boss','ritual','chronicle'].includes(value.mode) &&
    text(value.id,180)&&text(value.playerId,180)&&ids(value.queue)&&value.queue.length>0&&ids(value.stages)&&value.stages.length>0&&
    Number.isSafeInteger(value.index)&&value.index>=0&&value.index<value.queue.length&&count(value.wins)&&
    ['ready','won','lost','complete'].includes(value.status)&&plain(value.rules)&&Array.isArray(value.results);
  return false;
}
function storageOrNull(storage) {try{return storage||globalThis.localStorage||null;}catch{return null;}}
function notify(detail) {
  if(typeof globalThis.dispatchEvent==='function' && typeof CustomEvent==='function')
    globalThis.dispatchEvent(new CustomEvent('shhf-storage-status',{detail}));
}
function decode(key, raw, validator) {
  if(raw===null || raw===undefined || raw.length>MAX_BYTES) return null;
  try {const value=JSON.parse(raw);return validateEntry(key,value)&&(!validator||validator(value))?value:null;}catch{return null;}
}
export function readState(key, fallback={}, storage, validator) {
  const store=storageOrNull(storage);
  try {
    const raw=store?.getItem(key), value=decode(key,raw,validator);
    if(value) return {...fallback,...value};
    const previous=decode(key,store?.getItem(key+BACKUP),validator);
    if(previous) {notify({kind:'recovered',key});return {...fallback,...previous};}
    if(raw) notify({kind:'invalid',key});
  } catch {notify({kind:'unavailable',key});}
  return {...fallback};
}
export function writeState(key,value,storage,validator) {
  if(!validateEntry(key,value)||validator&&!validator(value)) {notify({kind:'invalid-write',key});return null;}
  const store=storageOrNull(storage);
  if(!store) {notify({kind:'unavailable',key});return null;}
  try {
    const raw=JSON.stringify(value);
    if(raw.length>MAX_BYTES) throw new Error('Mémoire trop volumineuse.');
    const old=store.getItem(key);
    if(decode(key,old,validator)) store.setItem(key+BACKUP,old);
    store.setItem(key,raw);
    return value;
  } catch {notify({kind:'unavailable',key});return null;}
}
export function removeState(key,storage) {
  if(!ALLOWED.has(key)) return false;
  try {const s=storageOrNull(storage);if(!s)return false;s.removeItem(key+BACKUP);s.removeItem(key);return true;}
  catch {notify({kind:'unavailable',key});return false;}
}
export function exportMemory(version,storage,validators={}) {
  const entries={};
  for(const key of ALLOWED){const value=readState(key,{},storage,validators[key]);if(Object.keys(value).length)entries[key]=value;}
  return {schema:MEMORY_SCHEMA,project:'SILENT HILL: HALO OF FLESH',version,exportedAt:new Date().toISOString(),entries};
}
export function importMemory(payload,storage) {
  if(!plain(payload)||payload.schema!==MEMORY_SCHEMA||!plain(payload.entries)||!safeTree(payload))
    throw new Error('Format de mémoire invalide.');
  const entries=Object.entries(payload.entries);
  if(!entries.length||entries.length>ALLOWED.size||JSON.stringify(payload).length>MAX_BYTES)
    throw new Error('Mémoire vide ou trop volumineuse.');
  // Validate EVERYTHING before the first write. Unknown keys never pass through.
  for(const [key,value] of entries) if(!validateEntry(key,value)) throw new Error(`Entrée de mémoire refusée : ${key}`);
  const s=storageOrNull(storage);if(!s)throw new Error('Stockage indisponible.');
  const originals=new Map();
  for(const [key] of entries) for(const k of [key,key+BACKUP]) originals.set(k,s.getItem(k));
  try {for(const [key,value] of entries) {
    const old=originals.get(key);if(decode(key,old))s.setItem(key+BACKUP,old);
    s.setItem(key,JSON.stringify(value));
  }} catch(error) {
    let rollbackFailed=false;
    for(const [key,raw] of originals)try{raw===null?s.removeItem(key):s.setItem(key,raw);}catch{rollbackFailed=true;}
    throw new Error(rollbackFailed?'Import interrompu ; restauration partielle. Conserver votre export.':'Import annulé ; mémoire précédente restaurée.',{cause:error});
  }
  return entries.length;
}
