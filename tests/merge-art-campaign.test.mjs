import test from 'node:test';
import assert from 'node:assert/strict';
import {validateArtCampaign} from '../scripts/merge-art-campaign.mjs';
import {ART_CAMPAIGN_BASE,ART_CONTINUATION_BASE,ART_CONTINUATION_GROUP_SIZES} from '../scripts/art-campaign-tracking.mjs';

// A documentary fixture: these blocked rows never enter the production registry.
function fixture(campaign='art144'){
 const requested=campaign==='art92'?92:144,baseCommit=campaign==='art92'?ART_CONTINUATION_BASE:ART_CAMPAIGN_BASE;
 const entries=Array.from({length:requested},(_,i)=>({fighter:{id:'subject_'+i,source:'sh1'}}));
 const inventory={campaign,requested,baseCommit,entries};
 const fragments=[],ledgers=[];
 let offset=0;
 for(const group of 'abcde'){
  const size=campaign==='art92'?ART_CONTINUATION_GROUP_SIZES[group]:(group==='e'?24:30);
  const assigned=entries.slice(offset,offset+size);offset+=size;
  fragments.push({schema:1,campaign,group,baseCommit,assets:{}});
  ledgers.push({schema:1,campaign,group,baseCommit,requestedItems:assigned.length,
   items:assigned.map(({fighter:{id}})=>({rowId:id+':pose:idle',collection:'poses',entityId:id,status:'blocked',
    evidence:['https://example.com/edition'],artifacts:[],limits:'Whole source model is not established.',reason:'No complete reference.'}))});
 }
 return {inventory,ledgers,fragments,baseline:{schema:1,assets:{}}};
}
const check=f=>validateArtCampaign(f.inventory,f.ledgers,f.fragments,f.baseline);
function candidate(f){
 const item=f.ledgers[0].items[0],id=item.entityId,sha256='b'.repeat(64);
 const frame={path:`assets/sprites/${id}.${sha256.slice(0,12)}.png`,sha256,bytes:100,width:512,height:512,
  facing:1,anchor:[.5,.9],bodyHeight:.8,origin:'conversation-image-generation'};
 const asset={fighterId:id,source:'sh1',fidelity:'unverified',status:'integrated-candidate',origin:frame.origin,
  singleSubjectReviewed:true,frames:[frame],portrait:{...frame},clips:{idle:{frames:[0],ticksPerFrame:1,loop:false}},animatedClips:0};
 f.fragments[0].assets[id]=asset;
 Object.assign(item,{status:'implemented-candidate',artifacts:[frame.path]});delete item.reason;
 return asset;
}

test('coverage includes the real final remainder of 24 without padding or false images',()=>{
 const f=fixture(),report=check(f);
 assert.equal(report.requested,144);assert.equal(report.candidates,0);assert.equal(report.blocked,144);
 assert.deepEqual(report.groups.map(g=>g.requestedItems),[30,30,30,30,24]);
 assert.equal(report.certifiedOneToOne,0);assert.equal(report.newAnimatedClips,0);
 f.ledgers[4].items.push({...f.ledgers[4].items[0]});
 assert.throws(()=>check(f),/assigned count|duplicated profile/);
});
test('candidate accounts for one exact new profile without claiming animation or certification',()=>{
 const f=fixture(),asset=candidate(f),report=check(f);
 assert.equal(report.candidates,1);assert.equal(report.blocked,143);
 assert.deepEqual(Object.keys(report.assets),['subject_0']);assert.equal(report.assets.subject_0,asset);
});
test('the92-profile continuation uses its real uneven groups and cannot reuse the previous baseline',()=>{
 const f=fixture('art92'),report=check(f);
 assert.equal(report.requested,92);assert.equal(report.blocked,92);
 assert.deepEqual(report.groups.map(row=>row.requestedItems),[18,21,18,15,20]);
 f.inventory.baseCommit=ART_CAMPAIGN_BASE;
 assert.throws(()=>check(f),/baseline commit/);
});
test('a later campaign cannot generate a previously refused subject or substitute variant',()=>{
 const f=fixture('art92');candidate(f);f.inventory.entries[0].generationExcluded=true;
 assert.throws(()=>check(f),/prior tool refusal/);
});
test('missing, duplicated and reassigned source identities cannot satisfy the campaign',()=>{
 for(const mutate of [
  f=>f.inventory.entries.pop(),
  f=>{f.inventory.entries[143]=f.inventory.entries[0];},
  f=>{f.ledgers[1].items[0]={...f.ledgers[0].items[0]};},
  f=>{f.fragments[4].group='a';}
 ]){const f=fixture();mutate(f);assert.throws(()=>check(f));}
});
test('an already illustrated baseline profile cannot be counted again',()=>{
 const f=fixture();f.baseline.assets.subject_0={old:true};candidate(f);
 assert.throws(()=>check(f),/already illustrated/);
});
test('blocked rows require an explicit reason and cannot receive hidden artwork',()=>{
 const f=fixture();delete f.ledgers[0].items[0].reason;
 assert.throws(()=>check(f),/need a reason/);
 const g=fixture();candidate(g);g.ledgers[0].items[0].status='blocked';
 assert.throws(()=>check(g),/cannot acquire artwork/);
});
test('source edition, provenance, actual static idle and portrait identity are mandatory',()=>{
 for(const mutate of [
  a=>{a.source='film';},a=>{a.fidelity='verified';},a=>{a.singleSubjectReviewed=false;},
  a=>{a.clips.idle.loop=true;},a=>{a.clips.idle.frames=[0,0];},a=>{a.animatedClips=1;},
  a=>{a.clips.attack={frames:[0],loop:false,ticksPerFrame:1};},a=>{a.frames[0].anchor=[Infinity,0];},
  a=>{a.portrait.path='assets/sprites/other.png';},a=>{a.frames[0].path='assets/sprites/other.png';}
 ]){const f=fixture();mutate(candidate(f));assert.throws(()=>check(f));}
});
test('unsafe artifacts, unavailable evidence and silent extra assets cannot pass review',()=>{
 for(const mutate of [
  f=>{f.ledgers[0].items[0].artifacts=['../secret'];},
  f=>{f.ledgers[0].items[0].evidence=['http://example.com'];},
  f=>{f.ledgers[0].items[0].limits='';},
  f=>{f.fragments[0].assets.undeclared={};},
  f=>{f.ledgers[0].baseCommit='c'.repeat(40);}
 ]){const f=fixture();mutate(f);assert.throws(()=>check(f));}
});
