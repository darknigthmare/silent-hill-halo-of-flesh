import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,STAGE_TERRAINS} from '../src/data.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {stageReferenceTrackAllowed,applyStageReferencePolicy} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks} from '../src/stage-cinematics.js';
import {stageSpace,drawStageArchitecture} from '../src/stage-architecture.js';

const stage=id=>{const value=STAGES.find(s=>s.id===id);assert.ok(value,id);return value;};
const additions=[['town_hall_hc','homecoming','lecternGlint',1],['shepherd_house_hc','homecoming','atticDustFall',1],['devils_pit','downpour','mineBeamDrips',0],['overlook','downpour','cellBarShadows',0]];
function trace(){
 const calls=[],stack=[],state={globalAlpha:.4,canvas:{width:1280,height:720}};
 state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};state.restore=()=>{assert.ok(stack.length);state.globalAlpha=stack.pop();calls.push(['restore']);};
 state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...color)=>calls.push(['gradient',...args,...color])});
 return {context:new Proxy(state,{get:(target,key)=>key in target?target[key]:(...args)=>calls.push([key,...args])}),calls,stack};
}
function draw(location,time,reducedMotion=false){const r=trace();drawStageReferenceTracks(r.context,1280,720,location,time,{reducedMotion});assert.equal(r.context.globalAlpha,.4);assert.equal(r.stack.length,0);return r.calls;}

test('four later-game tracks preserve exact workbook rows and partial authored room scope',()=>{
 for(const [id,source,key,index]of additions){
  const location=stage(id),track=location.referenceTracks.find(t=>t.key===key),proposal=STAGE_REFERENCES[id].animations[index];
  assert.ok(track,id);assert.equal(track.id,`${id}:reference:${index+1}`);assert.equal(track.source,source);assert.equal(track.description,proposal.description);assert.deepEqual(track.evidence,proposal.evidence);
  assert.equal(track.coverage,'partial-visual-prototype');assert.equal(track.fidelity,'adaptation-versus-proposee');assert.equal(track.event,null);assert.equal(track.timecode,undefined);assert.ok(track.locationScope);assert.match(track.limits,/propos|interprét/);
  for(const other of [{...location,source:'sh2'},{...location,id:id+'_other_room'}]){assert.equal(stageReferenceTrackAllowed(other,track),false);assert.deepEqual(draw({...other,referenceTracks:[track]},1400),[]);}
  assert.ok(!applyStageReferencePolicy({...location,source:'sh2'},{...STAGE_REFERENCES[id],source:'sh2'}).referenceTracks.some(t=>t.key===key));
 }
});

test('mine interior and dry route do not import outside rain, an adjacent flooded cave or the moving train',()=>{
 const mine=stage('devils_pit');assert.equal(stageSpace(mine),'interior');assert.equal(mine.referencePolicy.interior,true);assert.equal(mine.weather,'dust');assert.deepEqual(mine.terrain,{id:'concrete',...STAGE_TERRAINS.concrete});
 for(const prop of ['water','rails','cart']){assert.ok(!mine.props.includes(prop));assert.ok(!mine.layers.includes(prop));}
 assert.ok(!mine.animations.includes('rainSheets'));assert.ok(!mine.animations.includes('waterRipple'));assert.deepEqual(mine.director.events,[]);assert.deepEqual(mine.director.hazardDeck,[]);
 const actual=trace();assert.equal(drawStageArchitecture(actual.context,1280,720,mine),true);assert.equal(actual.stack.length,0);
 for(const other of [{...mine,source:'homecoming'},{...mine,id:'another_mine'}]){assert.equal(stageSpace(other),'exterior');const untouched=trace();assert.equal(drawStageArchitecture(untouched.context,1280,720,other),false);assert.deepEqual(untouched.calls,[]);}
});

test('public hall, normal attic and Block A keep their selected phase and exclude other-room props',()=>{
 const hall=stage('town_hall_hc');assert.ok(!hall.props.includes('stairs'));assert.ok(!hall.props.includes('flags'));assert.ok(!hall.animations.includes('flagSway'));assert.equal(hall.shift.enabled,false);
 const attic=stage('shepherd_house_hc');for(const prop of ['portraits','stairs','mirrors'])assert.ok(!attic.props.includes(prop));assert.equal(attic.referencePolicy.worldState,'fixed-normal');assert.equal(attic.shift.enabled,false);assert.match(attic.referenceTracks[0].limits,/Otherworld/);
 const prison=stage('overlook');assert.equal(prison.weather,'dust');for(const prop of ['towers','watchtower','flood','chains']){assert.ok(!prison.props.includes(prop));assert.ok(!prison.layers.includes(prop));}assert.match(prison.referenceTracks[0].locationScope,/Block A/);assert.equal(prison.referencePolicy.worldState,'fixed-normal');
 for(const [id]of additions){const location=stage(id),events=id==='overlook'?['referenceGateReply']:[];assert.deepEqual(location.director.events,events);assert.deepEqual(location.director.hazardDeck,[]);assert.deepEqual(location.interactions.map(i=>i.event),events);}
});

test('four distinct authored motions freeze under reduced motion without leaking canvas state',()=>{
 for(const [id]of additions){const location=stage(id);assert.notDeepEqual(draw(location,1400),draw(location,5900),id);assert.deepEqual(draw(location,1400,true),draw(location,5900,true),id);}
 const attic=draw(stage('shepherd_house_hc'),1400);assert.ok(attic.some(c=>c[0]==='lineTo'&&c[2]===720*.57),'rafter posts reach the rear floor');
 const lectern=draw(stage('town_hall_hc'),1400);assert.ok(lectern.some(c=>c[0]==='fillRect'&&c[2]===720*.57-7&&c[4]===7),'lectern base reaches its floor');
});

test('first public Town Hall room does not borrow a corridor door behind its podium',()=>{
 const hall=stage('town_hall_hc'),r=trace();drawStageArchitecture(r.context,1280,720,hall);
 assert.ok(!r.calls.some(c=>c[0]==='fillRect'&&c[3]===1280*.088&&c[4]===720*.25));
 assert.ok(r.calls.some(c=>c[0]==='fillRect'&&c[3]===54&&c[4]===17),'blank book on the documented rear bookstand');
 const other=trace();drawStageArchitecture(other.context,1280,720,{...hall,source:'downpour'});assert.ok(other.calls.some(c=>c[0]==='fillRect'&&c[3]===1280*.088&&c[4]===720*.25));
});

test('unblocking the original Lakeview lobby cannot revive fire finishers, generic cues or Room312 props',()=>{
 const lake=stage('lakeview'),reference={...STAGE_REFERENCES.lakeview,locationStatus:'lieu-documente'};
 const selected=applyStageReferencePolicy({...lake,props:[...lake.props,'fire','crtv','television'],animations:['lampFlicker','portraitBlink','fogDrift'],director:{...lake.director,events:['portraitWatch','powerFailure'],hazardDeck:['portraitGaze','staticBurst']}},reference);
 assert.equal(selected.reference.blocked,false);assert.equal(selected.referencePolicy.worldState,'fixed-normal');assert.equal(selected.shift.enabled,false);assert.equal(selected.shift.startOtherworld,false);
 assert.equal(selected.referencePolicy.automaticFinishers,false);assert.equal(selected.weather,'none');assert.equal(selected.visibility.fog,0);assert.deepEqual(selected.animations,[]);assert.deepEqual(selected.referenceTracks,[]);assert.deepEqual(selected.director.events,[]);assert.deepEqual(selected.director.hazardDeck,[]);assert.deepEqual(selected.interactions,[]);
 for(const prop of ['fire','firelight','portraits','crtv','television']){assert.ok(!selected.props.includes(prop));assert.ok(!selected.layers.includes(prop));}
});

test('only the documented original Lakeview lobby gets neutral presentation labels without changing any terrain profile',()=>{
 const terrains=structuredClone(STAGE_TERRAINS),lake=stage('lakeview'),reference={...STAGE_REFERENCES.lakeview,locationStatus:'lieu-documente'};
 const selected=applyStageReferencePolicy(lake,reference);
 assert.equal(selected.referencePolicy.normalPhaseLabel,'AVANT LA CASSETTE');assert.equal(selected.referencePolicy.terrainPresentation.name,'TAPIS DU LOBBY');
 assert.match(selected.referencePolicy.terrainPresentation.description,/humidité non déterminée/);assert.match(selected.referencePolicy.terrainPresentation.description,/Règles de terrain désactivées/);assert.match(selected.referencePolicy.terrainPresentation.description,/non certifiées 1:1/);
 assert.equal(selected.referencePolicy.automaticFinishers,false);assert.equal(selected.shift.enabled,false);assert.deepEqual(selected.director.events,[]);assert.deepEqual(selected.director.hazardDeck,[]);
 assert.equal(Object.keys(STAGE_TERRAINS).length,14);assert.deepEqual(STAGE_TERRAINS,terrains);
 for(const other of [{...lake,source:'sh3'},{...lake,id:'lakeview_remake'}]){
  const projected=applyStageReferencePolicy(other,{...reference,id:other.id,source:other.source});assert.equal(projected.referencePolicy.normalPhaseLabel,undefined);assert.equal(projected.referencePolicy.terrainPresentation,undefined);
 }
 const unresolved=applyStageReferencePolicy(lake,{...reference,locationStatus:'etat-narratif-a-preciser'});assert.equal(unresolved.referencePolicy.normalPhaseLabel,undefined);assert.equal(unresolved.referencePolicy.terrainPresentation,undefined);
 for(const location of STAGES.filter(s=>!['dark_shrine','hinako_home','shimizu_residence','school_shf','corrupted_ebisugaoka','nightmare_school','nightmare_hospital_sm','nightmare_mall_sm','lakeview','shopping_mall','midwich_nightmare','sewers','lakeside_amusement','lakeside_sh3','prison_meat_locker','brookhaven_sh2','brookhaven_roof','building_world','artaud_theater','blue_creek','nightmare_mall','grand_hotel','police_station_hc','prison_hc','overlook','downpour_streets','book_fire','book_wood','book_earth','book_blood','film_church','nightmare_hospital_hc','film_hospital','shepherds_glen','cedar_grove','antique_shop','church_hc','underground_hc','dark_shrine_corridors','dark_shrine_main','looping_hall','curtis_shop'].includes(s.id))){assert.equal(location.referencePolicy.normalPhaseLabel,undefined,location.id);assert.equal(location.referencePolicy.terrainPresentation,undefined,location.id);}
});
