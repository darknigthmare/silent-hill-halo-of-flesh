import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FIGHTER_REFERENCES,STAGE_REFERENCES,REFERENCE_SOURCES,PRODUCTION_REFERENCE_REVISION} from '../src/production-reference.js';
import {validSpriteClipKey,contextualPresentationKeys} from '../src/sprite-poses.js';
import {clipPacket,validateClip} from '../src/sprite-clips.js';
import {previewSpriteState} from '../src/sprite-inspector.js';
import {sampleSpriteClip} from '../src/sprite-animation.js';
import {defaultControls,loadControls,saveControls,normalizeControls,validControls,rebindControl} from '../src/player-input.js';
import {KEYS,importMemory,MEMORY_SCHEMA} from '../src/save-store.js';
const fighter={id:'sh1_air_screamer_001',source:'sh1'};
const art=()=>({fighterId:fighter.id,source:fighter.source,frames:[{path:'a.png',sha256:'a',pixelSHA256:'1'},{path:'b.png',sha256:'b',pixelSHA256:'2'}],clips:{idle:{frames:[0],ticksPerFrame:1,loop:false}}});
const clip={frames:[1],ticksPerFrame:7,loop:false};
class Memory{constructor(){this.data=new Map();}getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,String(v));}removeItem(k){this.data.delete(k);}}
const legacy=()=>{const c=defaultControls();for(const p of c.players)delete p.taunt;return c;};
test('runtime production identities and sources match both original research batches',()=>{
 const parts=['classic','extended'].map(n=>JSON.parse(readFileSync(new URL(`../docs/production/research/${n}.json`,import.meta.url))));
 assert.equal(Object.keys(FIGHTER_REFERENCES).length,230);assert.equal(Object.keys(STAGE_REFERENCES).length,123);
 for(const part of parts){for(const f of part.fighters)assert.deepEqual(FIGHTER_REFERENCES[f.id],f);for(const s of part.stages)assert.deepEqual(STAGE_REFERENCES[s.id],s);for(const s of part.sources)assert.equal(REFERENCE_SOURCES[s.id].url,s.url);}
 const index=JSON.parse(readFileSync(new URL('../data/production-reference-index.json',import.meta.url)));assert.equal(index.revision,PRODUCTION_REFERENCE_REVISION);
 assert.deepEqual(Object.keys(index.fighters).sort(),Object.keys(FIGHTER_REFERENCES).sort());assert.deepEqual(Object.keys(index.stages).sort(),Object.keys(STAGE_REFERENCES).sort());
});
test('all own contextual presentation keys identify the precise production owner',()=>{
 for(const f of Object.values(FIGHTER_REFERENCES))for(const key of contextualPresentationKeys(f.id))assert.ok(validSpriteClipKey(key,{fighterId:f.id}),key);
});
test('contextual imports reject wrong edition, arbitrary IDs, invalid paths and aliases',()=>{
 const a=art();for(const key of ['finisher@film_red_pyramid_film_175_signature','intro@film_red_pyramid_film_175:intro','winRound@sh1_air_screamer_001:winRound','finisher@midwich_signature','finished@missing_signature','intro@../escape','finisher@@midwich_fatality','neutralLight@sh1_air_screamer_001:intro','taunt@'])assert.equal(validSpriteClipKey(key,a),false,key);
});
test('exact stage finisher and target reaction are independent import slots',()=>{
 for(const key of ['finisher@midwich_fatality','finished@midwich_fatality','finished@film_red_pyramid_film_175_nightmare'])assert.deepEqual(validateClip(art(),key,clip).frames,[1]);
});
test('contextual presentation cannot loop or fabricate a sequence out of idle',()=>{
 const a=art(),key=`finisher@${fighter.id}_signature`;
 assert.throws(()=>validateClip(a,key,{...clip,loop:true}),/boucle/);
 const b=structuredClone(a);b.clips[key]={...clip,frames:[0]};assert.throws(()=>clipPacket(fighter,a,b,key),/dédiée/);
 b.clips[key]=clip;assert.equal(clipPacket(fighter,a,b,key).pose,key);
});
test('inspector sends exact context to the live sampler and does not borrow the other finisher',()=>{
 const a=art(),key=`finisher@${fighter.id}_signature`,other=`finisher@${fighter.id}_nightmare`;a.clips[key]=clip;
 assert.equal(sampleSpriteClip(a,previewSpriteState(key,3)).pose,key);
 const absent=sampleSpriteClip(a,previewSpriteState(other,3));assert.equal(absent.pose,'idle');assert.equal(absent.fallback,true);
});
test('legacy key bindings gain taunt without changing any existing action or writing on read',()=>{
 const s=new Memory(),old=legacy();old.players[0].light='KeyP';old.players[1].heavy='KeyN';s.setItem(KEYS.controls,JSON.stringify(old));const before=[...s.data];
 const next=loadControls(s);assert.ok(validControls(next));for(let i=0;i<2;i++)for(const [key,value]of Object.entries(old.players[i]))assert.equal(next.players[i][key],value);
 assert.equal(new Set(next.players.flatMap(p=>Object.values(p))).size,24);assert.deepEqual([...s.data],before);
});
test('legacy backup survives an invalid primary while new controls are saved',()=>{
 const s=new Memory(),old=legacy();old.players[0].light='KeyB';s.setItem(KEYS.controls+':backup',JSON.stringify(old));s.setItem(KEYS.controls,'{broken');
 saveControls(loadControls(s),s);assert.equal(loadControls(s).players[0].light,'KeyB');assert.deepEqual(JSON.parse(s.getItem(KEYS.controls+':backup')),old);
});
test('memory imports accept valid old bindings and reject partial new layouts atomically',()=>{
 const s=new Memory(),old=legacy();importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.controls]:old}},s,{[KEYS.controls]:validControls});assert.equal(loadControls(s).players[0].taunt,'KeyP');
 const bad=legacy();bad.players[0].taunt='Digit1';const before=[...s.data];assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.controls]:bad}},s,{[KEYS.controls]:validControls}));assert.deepEqual([...s.data],before);
});
test('taunt remapping uses the same cross-player conflict validation',()=>{
 const c=normalizeControls(legacy());assert.throws(()=>rebindControl(c,0,'taunt',c.players[1].light));assert.equal(rebindControl(c,0,'taunt','Digit7').players[0].taunt,'Digit7');
});
