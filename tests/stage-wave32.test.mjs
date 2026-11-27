import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getStage,STAGE_TERRAINS} from '../src/data.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {stageBitmapFor,stageBitmapFrames,validateStageBitmap} from '../src/stage-bitmaps.js';
import {stageReferenceEventAllowed,stageReferenceHazardAllowed,stageReferenceTrackAllowed,applyStageReferencePolicy} from '../src/stage-reference-policy.js';
import {stageReferenceHTML} from '../src/reference-ui.js';
import {drawStageReferenceTracks} from '../src/stage-cinematics.js';
import {stageTerrainProfile} from '../src/stage-director.js';

const cases=[
  {id:'antique_shop',source:'origins',scene:'green-lion-inner-passage',state:'fixed-altered'},
  {id:'lighthouse_sm',source:'shattered',scene:'shm-clinic-entrance-before-therapy',state:'fixed-normal'},
];

test('wave32 fixes the documented scene and refuses borrowed phases, hazards and ceiling supports',()=>{
  const materials=structuredClone(STAGE_TERRAINS);
  for(const item of cases){
    const stage=getStage(item.id),art=stageBitmapFor(stage),reference=STAGE_REFERENCES[item.id];
    assert.equal(stage.source,item.source);assert.equal(reference.selectedScene,item.scene);
    assert.equal(stage.reference.blocked,false);assert.equal(stage.referencePolicy.sceneId,item.scene);
    assert.equal(stage.referencePolicy.worldState,item.state);
    assert.equal(stage.shift.enabled,false);assert.equal(stage.shift.startOtherworld,item.state==='fixed-altered');
    assert.equal(stage.weather,'none');assert.equal(stage.visibility.fog,0);
    assert.equal(stage.referencePolicy.terrainRules,false);assert.equal(stage.referencePolicy.automaticFinishers,false);
    assert.deepEqual(stage.props,[]);assert.deepEqual(stage.layers,[]);assert.deepEqual(stage.animations,[]);
    assert.deepEqual(stage.director.events,[]);assert.deepEqual(stage.director.hazardDeck,[]);assert.deepEqual(stage.interactions,[]);
    assert.equal(art.scene,item.scene);assert.equal(art.geometry.ceiling,false);assert.equal(art.fidelity,'unverified');
    assert.equal(art.status,'integrated-candidate');assert.equal(art.mode,'replace');
    const footing=stageTerrainProfile(stage);
    for(const key of ['moveScale','jumpScale','dodgeScale','friction','knockbackScale','guardRegenScale'])assert.equal(footing[key],STAGE_TERRAINS.concrete[key]);
    for(const event of ['mirrorTurn','iceLock','powerFailure','ritualWake'])assert.equal(stageReferenceEventAllowed(stage,event),false);
    for(const hazard of ['mirrorFracture','frostWave','windShear','voidPull'])assert.equal(stageReferenceHazardAllowed(stage,hazard),false);
    assert.equal(stageBitmapFor({...stage,referencePolicy:{...stage.referencePolicy,sceneId:'other-phase'}}),null);
    assert.throws(()=>stageBitmapFor({...stage,source:'borrowed-edition'}),/identity\/source mismatch/);
    assert.throws(()=>stageBitmapFor({...stage,reference:{...stage.reference,blocked:true}}),/unresolved stage/);
    const other=applyStageReferencePolicy({...stage,source:'borrowed-edition'},{...reference,source:'borrowed-edition'});
    assert.equal(other.referencePolicy.sceneId,undefined);
  }
  assert.deepEqual(STAGE_TERRAINS,materials);
});

test('the clinic exterior never borrows the lighthouse tower, lake or therapy composite',()=>{
  const stage=getStage('lighthouse_sm'),reference=STAGE_REFERENCES.lighthouse_sm;
  assert.equal(stage.referencePolicy.interior,false);
  assert.match(stage.name,/ENTRÉE DE LA CLINIQUE/);
  assert.match(stage.referencePolicy.normalPhaseLabel,/EXTÉRIEUR AVANT ENTRÉE/);
  assert.equal(reference.animations.length,4);
  assert.ok(reference.animations.every(p=>p.activeInSelectedScene===false&&p.sceneScope==='historical-lighthouse-water-therapy-composite'));
  assert.deepEqual(stage.referenceTracks,[]);assert.deepEqual(stage.referencePolicy.renderedProposalIds,[]);
  assert.deepEqual(stage.referencePolicy.pendingProposalIds,reference.animations.map((_,i)=>`lighthouse_sm:reference:${i+1}`));
  const inherited={key:'chainPendulum',id:'lighthouse_sm:reference:1',proposalIndex:0,source:'shattered',trigger:'ambient',event:null};
  assert.equal(stageReferenceTrackAllowed(stage,inherited),false);
  assert.ok(reference.referenceIds.includes('V32_SHM_CLINIC_ENTRANCE_PLAYTHROUGH'));
});

test('Green Lion keeps its three masked historical proposals without painting or reporting them as delivered motion',()=>{
  const stage=getStage('antique_shop'),reference=STAGE_REFERENCES.antique_shop;
  assert.equal(reference.animations.length,4);
  assert.ok(reference.animations.every(p=>p.activeInSelectedScene===false));
  assert.deepEqual(stage.reference.proposals,reference.animations);assert.deepEqual(stage.referenceTracks,[]);
  assert.deepEqual(stage.referencePolicy.renderedProposalIds,[]);
  assert.deepEqual(stage.referencePolicy.pendingProposalIds,reference.animations.map((_,i)=>`antique_shop:reference:${i+1}`));
  const keys=['greenLionPassageDust','flaurosCoreShade','greenLionWallGlint'];
  const noPaint=new Proxy({},{get:()=>()=>assert.fail('a masked historical prop must not paint')});
  for(const [i,key] of keys.entries()){
    const id=`antique_shop:reference:${i+1}`,masked=stage.referencePolicy.suppression.find(row=>row.kind==='reference-track'&&row.id===id);
    assert.equal(masked?.status,'historical-masked-by-bitmap');assert.equal(masked?.key,key);
    assert.match(masked.reason,/bitmap fixe/);assert.match(masked.reason,/en attente/);
    const oldTrack={id,key,proposalIndex:i,source:'origins',trigger:'ambient',event:null,anchor:{x:.5,y:.4}};
    assert.equal(stageReferenceTrackAllowed(stage,oldTrack),false);
    assert.deepEqual(drawStageReferenceTracks(noPaint,1280,720,{...stage,referenceTracks:[oldTrack]},1000),[]);
  }
  const html=stageReferenceHTML(stage);assert.match(html,/0 éléments visuels de la fiche joués/);assert.doesNotMatch(html,/Prototype visuel partiel/);
  assert.ok(reference.referenceIds.includes('V32_ORIGINS_CULT_GUIDE_P121'));
});

test('wave32 uses four independent native PNGs and preserves their versioned hashes and alpha planes',async()=>{
  const plan=JSON.parse(await readFile(new URL('../docs/production/vague32/stages/import-plan.json',import.meta.url),'utf8'));
  const measurements=JSON.parse(await readFile(new URL('../docs/production/vague32/stages/measurements.json',import.meta.url),'utf8'));
  assert.equal(plan.delivered.length,4);assert.equal(new Set(plan.delivered.map(row=>row.sha256)).size,4);
  for(const item of cases){
    const stage=getStage(item.id),art=stageBitmapFor(stage);
    assert.equal(validateStageBitmap(stage,art),art);assert.equal(art.layers.length,2);
    assert.deepEqual(stageBitmapFrames(stage).map(f=>f.path),plan.delivered.filter(row=>row.owner===item.id).map(row=>row.path));
    for(const [index,layer] of art.layers.entries()){
      assert.equal(layer.frames.length,1);assert.equal(layer.loop,false);assert.equal(layer.parallaxX,index===0?0:.006);
      const frame=layer.frames[0],png=await readFile(new URL('../'+frame.path,import.meta.url));
      assert.equal(createHash('sha256').update(png).digest('hex'),frame.sha256);assert.equal(png.length,frame.bytes);
      assert.equal(png.readUInt32BE(16),1672);assert.equal(png.readUInt32BE(20),941);
      assert.equal(png[25],index===0?2:6,'opaque RGB background and genuine RGBA near plane');
      const measure=measurements.assets.find(row=>row.sha256===frame.sha256);assert.ok(measure);
      if(index===1){assert.ok(measure.transparentFraction>.98);assert.ok(measure.centerBandAlphaMax<=1);assert.ok(measure.alphaBoundsAbove8[1]>840);}
    }
  }
});
