import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,STAGE_TERRAINS,ROSTER} from '../src/data.js';
import {stageTerrainProfile} from '../src/stage-director.js';
import {FightEngine} from '../src/fight.js';

const lake=STAGES.find(s=>s.id==='lakeview');
const numbers=['moveScale','jumpScale','dodgeScale','friction','knockbackScale','guardRegenScale'];

test('the actual Lakeview lobby supplies neutral physical rules and its own factual labels',()=>{
 assert.equal(lake.referencePolicy.normalPhaseLabel,'AVANT LA CASSETTE');
 assert.equal(lake.gameplay.terrainRules,false);
 const engine=Object.create(FightEngine.prototype);
 Object.assign(engine,{stage:lake,config:{stageTerrain:true},stageRuntime:{terrainOverride:null}});
 const actor={data:ROSTER.find(f=>f.id==='sh2_bubble_head_nurse_024'),grounded:true};
 const terrain=engine.terrainForActor(actor);
 assert.equal(terrain.id,'carpet');assert.equal(terrain.name,'TAPIS DU LOBBY');
 assert.match(terrain.description,/humidité non déterminée/);
 for(const key of numbers)assert.equal(terrain[key],STAGE_TERRAINS.concrete[key],key);
 assert.equal(lake.shift.enabled,false);assert.equal(lake.referencePolicy.automaticFinishers,false);
 assert.deepEqual(lake.director.hazardDeck,[]);
});

test('room wording cannot change physical values or rename an explicit material override',()=>{
 const originals=structuredClone(STAGE_TERRAINS);
 const modified={...lake,referencePolicy:{...lake.referencePolicy,
  terrainPresentation:{...lake.referencePolicy.terrainPresentation,moveScale:999,jumpScale:999,id:'ice'}}};
 const local=stageTerrainProfile(modified);
 assert.equal(local.id,'carpet');assert.equal(local.moveScale,1);assert.equal(local.jumpScale,1);
 const override=stageTerrainProfile(modified,'ice');
 assert.deepEqual(override,{id:'ice',...STAGE_TERRAINS.ice});
 const other=STAGES.find(s=>s.id==='woodside');
 assert.equal(stageTerrainProfile(other).name,STAGE_TERRAINS[other.terrain.id].name);
 assert.deepEqual(STAGE_TERRAINS,originals);assert.equal(Object.keys(STAGE_TERRAINS).length,14);
});
