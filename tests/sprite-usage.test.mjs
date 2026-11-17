import test from 'node:test';
import assert from 'node:assert/strict';
import {getFighter} from '../src/data.js';
import {spriteFor,combatSpriteFor,spriteStatus,spriteCoverage,frameFor,drawRasterMonster,paintRasterPortrait,SpriteCache,rasterPlacement} from '../src/sprite-system.js';
import {hasCombatSprite} from '../src/sprite-usage.js';
import {auditSpriteCoverage} from '../scripts/audit-sprite-backlog.mjs';

const fighter=getFighter('downpour_prisoner_minion_brawler_108');
const frame={path:'combat.png',width:900,height:1600,facing:1,anchor:[.4,.93],bodyHeight:.85,purpose:'combat',view:'side-view'};
const portrait={path:'selection.png',width:900,height:1600,facing:-1,purpose:'selection'};
const asset=()=>({fighterId:fighter.id,source:fighter.source,fidelity:'unverified',animatedClips:0,combatView:'side-view-candidate',
 frames:[{...frame}],portrait:{...portrait},clips:{idle:{frames:[0],ticksPerFrame:1,loop:false}}});
function context(){const calls=[];return new Proxy({calls,createLinearGradient:()=>({addColorStop(){}})},{get:(o,key)=>key in o?o[key]:(...args)=>calls.push([key,...args])});}
const decoded={selection:{name:'selection pixels'},combat:{name:'combat pixels'}};
const cache={peek:path=>path===portrait.path?decoded.selection:path===frame.path?decoded.combat:null,status:()=> 'ready'};

test('selection painter and combat renderer use their distinct registered pixels',()=>{
 const art=asset(),registry={[fighter.id]:art},selection=context(),combat=context();
 const canvas={width:300,height:300,dataset:{},getContext:()=>selection,setAttribute(){}};
 paintRasterPortrait(canvas,fighter,{registry,cache});
 const draw=drawRasterMonster(combat,fighter,500,594,{registry,cache,shadow:false});
 assert.equal(selection.calls.find(c=>c[0]==='drawImage')[1],decoded.selection);
 assert.equal(combat.calls.find(c=>c[0]==='drawImage')[1],decoded.combat);
 assert.equal(draw.path,frame.path);assert.equal(canvas.dataset.artPurpose,'selection');
 assert.equal(art.portrait.path,portrait.path);assert.equal(art.frames.length,1);assert.equal(art.animatedClips,0);
});

test('combat orientation follows the enemy side without changing the portrait orientation',()=>{
 const art=asset(),registry={[fighter.id]:art};
 for(const facing of [-1,1]){
  const c=context(),draw=drawRasterMonster(c,fighter,500,594,{registry,cache,shadow:false,facing});
  assert.equal(draw.flip,facing);assert.ok(c.calls.some(call=>call[0]==='scale'&&call[1]===facing));
 }
 const left=rasterPlacement(fighter,frame,500,594,-1),right=rasterPlacement(fighter,frame,500,594,1);
 assert.ok(Math.abs(left.x+right.x+right.width-1000)<1e-8);assert.equal(left.y,right.y);
 assert.equal(art.portrait.facing,-1);assert.equal(art.frames[0].facing,1);
});

test('selection-only art cannot reach combat even if an obsolete idle remains in memory',()=>{
 const art={...asset(),combatView:'selection-only'},registry={[fighter.id]:art};
 assert.equal(spriteFor(fighter,registry),art);assert.equal(combatSpriteFor(fighter,registry),null);assert.equal(frameFor(art),null);
 const c=context(),draw=drawRasterMonster(c,fighter,500,594,{registry,cache});
 assert.equal(draw.kind,'missing');assert.ok(!c.calls.some(call=>call[0]==='drawImage'));
 assert.ok(c.calls.some(call=>call[0]==='fillText'&&call[1]==='SPRITE DE COMBAT À PRODUIRE'));
 const selection=context(),canvas={width:300,height:300,dataset:{},getContext:()=>selection,setAttribute(){}};
 paintRasterPortrait(canvas,fighter,{registry,cache});
 assert.equal(selection.calls.find(call=>call[0]==='drawImage')[1],decoded.selection);
 assert.equal(spriteStatus(fighter,registry).kind,'selection-only');
});

test('normal preflight rejects a selection-only profile before loading any image',async()=>{
 const registry={[fighter.id]:{...asset(),combatView:'selection-only',frames:[],clips:{}}};let creates=0;
 const loader=new SpriteCache({createImage(){creates++;throw Error('must not load selection as combat');}});
 const result=await loader.prepare([fighter],{registry});
 assert.equal(result.ok,false);assert.deepEqual(result.missing,[fighter.id]);assert.equal(creates,0);
 const diagnostic=await loader.prepare([fighter],{registry,diagnostic:true});
 assert.equal(diagnostic.ok,true);assert.deepEqual(diagnostic.missing,[fighter.id]);assert.equal(creates,0);
});

test('coverage distinguishes portraits, side views, legacy views and missing combat',()=>{
 const fighters=['side','legacy','selection','missing'].map(id=>({...fighter,id}));
 const assigned=(id,extra={})=>({...asset(),fighterId:id,...extra});
 const registry={side:assigned('side'),legacy:assigned('legacy',{combatView:undefined,portrait:{...frame}}),
  selection:assigned('selection',{combatView:'selection-only',frames:[],clips:{}})};
 const count=spriteCoverage(fighters,registry);
 assert.equal(count.integrated,3);assert.equal(count.selectionAvailable,3);assert.deepEqual(count.selectionMissing,['missing']);
 assert.equal(count.combatSideViewCandidates,1);assert.equal(count.combatLegacyUnreviewed,1);
 assert.deepEqual(count.combatMissing,['selection','missing']);assert.equal(count.separateSelectionAndCombat,1);
 assert.equal(count.certified,0);assert.equal(count.animatedClips,0);
});

test('a portrait-only frame cannot be mislabeled as combat by copying an idle clip',()=>{
 const a=asset();a.frames[0].purpose='selection';
 assert.equal(hasCombatSprite(a),false);assert.equal(frameFor(a),null);
});

test('exact source and profile identity apply independently to combat routing',()=>{
 const registry={[fighter.id]:asset()};
 assert.equal(combatSpriteFor({...fighter,source:'film'},registry),null);
 assert.equal(combatSpriteFor({...fighter,id:fighter.id+'_variant'},registry),null);
});

test('backlog accepts a selection portrait without falsely counting a combat frame',()=>{
 const result=auditSpriteCoverage({total:2,integrated:1,missing:1,animatedClips:0,entries:[
  {id:'selection',frames:0,selection:true,combatView:'missing',animatedClips:0,fidelity:'unverified'},
  {id:'missing',frames:0,selection:false,combatView:'missing',animatedClips:0,fidelity:'not-assessed'}]});
 assert.equal(result.summary.illustrated,1);assert.equal(result.summary.missing,1);
 assert.equal(result.usage.selectionAvailable,1);assert.equal(result.usage.combatMissing,2);
 assert.equal(result.usage.combatSideViewCandidates,0);assert.equal(result.usage.combatLegacyUnreviewed,0);
});
