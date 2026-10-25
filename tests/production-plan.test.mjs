import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {combineResearch,validateResearch,buildProductionPlan,roleDecisionRuntimeCompatible,PROPOSAL_KEYS,CORE_POSES,PRESENTATION_CLIPS} from '../scripts/build-production-plan.mjs';
import {PRESENTATION_KEYS} from '../src/sprite-poses.js';

const parts=await Promise.all(['classic','extended'].map(async name=>
  JSON.parse(await readFile(new URL(`../docs/production/research/${name}.json`,import.meta.url),'utf8'))));
const research=combineResearch(parts);
const plan=buildProductionPlan(research);
const fighterIds=new Set(ROSTER.map(f=>f.id)),stageIds=new Set(STAGES.map(s=>s.id));
const expectedProposals=['intro','taunt','winRound1','loseRound1','winMatch','loseMatch','outro','super','finisher'];
const csv=value=>value?value.split(/\s*,\s*/):[];
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sorted=values=>[...values].sort();
function uniqueIds(rows,label){
  assert.ok(rows.every(row=>typeof row.id==='string'&&row.id.length>0),`${label}: nonempty string IDs`);
  assert.equal(new Set(rows.map(row=>row.id)).size,rows.length,`${label}: duplicate IDs`);
}
function mutated(change){const copy=structuredClone(research);change(copy);return copy;}

test('phase-one research covers exactly the live fighters and stages with all nine proposals',()=>{
  assert.equal(validateResearch(research),true);
  assert.deepEqual(sorted(research.fighters.map(f=>f.id)),sorted(fighterIds));
  assert.deepEqual(sorted(research.stages.map(s=>s.id)),sorted(stageIds));
  assert.deepEqual(sorted(PROPOSAL_KEYS),sorted(expectedProposals));
  for(const fighter of research.fighters){
    assert.deepEqual(sorted(Object.keys(fighter.proposals)),sorted(expectedProposals),fighter.id);
    for(const key of expectedProposals){
      const proposal=fighter.proposals[key];
      assert.ok(proposal.name.trim()&&proposal.description.trim()&&proposal.status.trim(),`${fighter.id}:${key}`);
    }
  }
});

test('the plan inventories every current move, finisher, presentation and core pose exactly once',()=>{
  assert.deepEqual(sorted(plan.fighters.map(f=>f.id)),sorted(fighterIds));
  assert.deepEqual(sorted(plan.stages.map(s=>s.id)),sorted(stageIds));
  const expectedMoves=ROSTER.flatMap(f=>createCombatProfile(f).moveset.order.map(key=>`${f.id}:${key}`));
  assert.deepEqual(sorted(plan.moves.map(m=>m.id)),sorted(expectedMoves));
  const expectedFinishers=[...ROSTER.flatMap(f=>f.fatalities.map(x=>x.id)),...STAGES.map(s=>s.fatality.id)];
  assert.deepEqual(sorted(plan.finishers.map(f=>f.id)),sorted(expectedFinishers));
  const presentationKeys=expectedProposals.filter(key=>!['super','finisher'].includes(key));
  for(const fighter of ROSTER){
    assert.deepEqual(sorted(plan.presentations.filter(p=>p.fighterId===fighter.id).map(p=>p.id)),
      sorted(presentationKeys.map(key=>`${fighter.id}:${key}`)),fighter.id);
    assert.deepEqual(sorted(plan.poses.filter(p=>p.fighterId===fighter.id).map(p=>p.pose)),sorted(CORE_POSES),fighter.id);
    assert.equal(plan.moves.filter(m=>m.fighterId===fighter.id&&['super','desperation'].includes(m.key)).length,2,fighter.id);
  }
});

test('the exact Twin Victim pointing candidate is reported as one static context image without closing its choreography',()=>{
  const id='sh4_twin_victim_059',taunt=plan.presentations.find(row=>row.id===id+':taunt'),intro=plan.presentations.find(row=>row.id===id+':intro');
  assert.match(taunt.engineState,/taunt@sh4_twin_victim_059:taunt/);
  assert.match(taunt.engineState,/Clip exact non bouclé : 1 image candidate déclarée/);
  assert.match(taunt.engineState,/Pose fixe, pas une animation produite/);
  assert.match(taunt.engineState,/66 ticks de maintien versus.*aucune durée d’origine mesurée/);
  assert.match(taunt.engineState,/Chorégraphie artistique complète.*restent à produire/);
  assert.doesNotMatch(taunt.engineState,/PNG dédiés à produire/);assert.notEqual(taunt.productionStatus,'Validé');
  assert.match(intro.engineState,/Images contextuelles à produire/,'a contextual taunt cannot become an intro image');
  assert.equal(plan.metrics.certifiedOneToOne,0);
});

test('stage inventory retains retired ideas and maps each live binding to its exact production row',()=>{
  const refs=new Map(research.stages.map(s=>[s.id,s]));
  for(const stage of STAGES){
    const rows=plan.stageAnimations.filter(a=>a.stageId===stage.id),byId=new Map(rows.map(r=>[r.id,r]));
    for(const track of stage.animationTracks)assert.equal(byId.get(`${stage.id}:loop:${track.id}`)?.retired,undefined);
    for(const track of stage.referenceTracks){assert.ok(byId.has(track.id),track.id);assert.equal(byId.get(track.id).runtimeTrack.id,track.id);}
    for(const event of stage.director.events)assert.ok(byId.has(`${stage.id}:event:${event}`)||stage.referenceTracks.some(t=>t.event===event),stage.id+'/'+event);
    for(const hazard of stage.director.hazardDeck)assert.ok(byId.has(`${stage.id}:hazard:${hazard}`)||plan.stages.find(s=>s.id===stage.id).additionalBindings.some(b=>b.id===`${stage.id}:hazard:${hazard}`),stage.id+'/'+hazard);
    assert.equal(rows.filter(r=>r.type==='Proposition du lieu').length,refs.get(stage.id).animations.length);
    for(const row of rows.filter(r=>r.retired)){assert.match(row.existing,/Désactivé/);assert.equal(row.trigger,'Aucun déclenchement automatique');}
  }
  assert.equal(plan.stageAnimations.length,1799,'phase-one row identities stay stable for workbook annotations');
});

test('generated IDs are unique and all ownership, source and observation links resolve',()=>{
  const tables=['sources','fighters','observations','moves','finishers','presentations','poses','stages','stageAnimations','tasks'];
  for(const key of tables)uniqueIds(plan[key],key);
  uniqueIds(tables.flatMap(key=>plan[key]),'global row namespace');
  const sources=new Set(plan.sources.map(s=>s.id)),observations=new Map(plan.observations.map(o=>[o.id,o]));
  for(const key of tables)for(const row of plan[key]){
    if(row.fighterId)assert.ok(fighterIds.has(row.fighterId),`${row.id}: unknown fighter`);
    if(row.stageId)assert.ok(stageIds.has(row.stageId),`${row.id}: unknown stage`);
    if(row.entityType==='Combattant')assert.ok(fighterIds.has(row.entityId),row.id);
    if(row.entityType==='Arène')assert.ok(stageIds.has(row.entityId),row.id);
    const refs=csv(row.referenceIds);
    assert.equal(new Set(refs).size,refs.length,`${row.id}: repeated reference`);
    for(const ref of refs)assert.ok(sources.has(ref),`${row.id}: unknown source ${ref}`);
    for(const id of csv(row.observationIds)){
      assert.ok(observations.has(id),`${row.id}: unknown observation ${id}`);
      assert.equal(observations.get(id).fighterId,row.fighterId||row.id,`${row.id}: observation of a different fighter`);
    }
  }
  for(const source of plan.sources)assert.equal(new URL(source.url).protocol,'https:',source.id);
});

test('variant bases are real, acyclic IDs and names do not silently become cross-edition links',()=>{
  const rows=new Map(plan.fighters.map(f=>[f.id,f])),refs=new Map(research.fighters.map(f=>[f.id,f]));
  for(const fighter of ROSTER){
    const row=rows.get(fighter.id);
    assert.equal(row.baseId,refs.get(fighter.id).baseId||'',fighter.id);
    const seen=new Set([fighter.id]);let current=row;
    while(current.baseId){
      assert.ok(rows.has(current.baseId),`${fighter.id}: unknown base ${current.baseId}`);
      assert.ok(!seen.has(current.baseId),`${fighter.id}: cyclic lineage`);
      seen.add(current.baseId);current=rows.get(current.baseId);
    }
  }
});

test('researched editions override inherited labels and genuine remake variants retain a dated fallback',()=>{
  const refs=new Map(research.fighters.map(f=>[f.id,f]));
  const editionRows=generated=>[
    ...generated.fighters.map(row=>({...row,fighterId:row.id})),
    ...generated.observations,...generated.moves,...generated.presentations,...generated.poses,
    ...generated.finishers.filter(row=>row.entityType==='Combattant').map(row=>({...row,fighterId:row.entityId}))
  ];
  for(const row of editionRows(plan)){
    const explicit=refs.get(row.fighterId).referenceEdition;
    if(explicit)assert.equal(row.edition,explicit,`${row.id}: researched edition takes precedence`);
  }
  const remake=ROSTER.find(f=>f.source==='sh2'&&/remake/i.test(f.variant||'')&&/remake.*2024/i.test(refs.get(f.id).referenceEdition||''));
  assert.ok(remake,'a researched 2024 remake variant must exercise the fallback');
  const fallback=buildProductionPlan(mutated(r=>delete r.fighters.find(f=>f.id===remake.id).referenceEdition));
  for(const row of editionRows(fallback).filter(row=>row.fighterId===remake.id))
    assert.match(row.edition,/remake.*2024/i,`${row.id}: fallback retains the remake edition`);
});

test('engine timing remains distinct from unmeasured source frames and no artwork is certified 1:1',()=>{
  assert.equal(plan.phase,1);assert.equal(plan.metrics.certifiedOneToOne,0);assert.equal(plan.metrics.newGameplaySequences,plan.finishers.filter(f=>f.runtimeCinematic.authored).length);
  for(const fighter of plan.fighters)assert.equal(fighter.oneToOneValidated,false,fighter.id);
  for(const observation of plan.observations){
    assert.match(observation.sourceTiming,/non mesuré/i,observation.id);
    assert.notEqual(observation.animationMeasured,true,observation.id);
    assert.ok(observation.timecode==null||observation.timecode==='',`${observation.id}: invented source timecode`);
  }
  const profiles=new Map(ROSTER.map(f=>[f.id,createCombatProfile(f)]));
  for(const move of plan.moves){
    for(const field of ['sourceFrameRate','sourceStart','sourceImpact','sourceEnd'])assert.equal(move[field],'',`${move.id}:${field}`);
    assert.match(move.canonicalVerification,/non vérifiée/i,move.id);
    const current=profiles.get(move.fighterId).moves[move.key];
    for(const field of ['startup','active','recovery','damage','reach'])assert.equal(move[field],current[field],`${move.id}:${field}`);
    assert.equal(move.currentClaim,current.fidelity,`${move.id}: preserve the inherited claim as such`);
  }
  assert.equal(plan.metrics.pngCandidates,ROSTER.filter(f=>SPRITES[f.id]).length);
  assert.equal(plan.metrics.animatedClips,ROSTER.reduce((sum,f)=>sum+(SPRITES[f.id]?.animatedClips||0),0));
  const capture=plan.tasks.find(t=>t.id==='global:reference-capture');
  assert.equal(capture.status,'En cours');assert.match(capture.reason,/FPS rationnels.*ffprobe.*Zéro relevé original livré/);
  assert.match(capture.reason,/un seul décodage.*relecture facultative.*SHA256.*déclaratif/);
  assert.match(capture.reason,/restent candidats et ne certifient ni le geste ni la fidélité 1:1/);
  assert.match(capture.reason,/review-preview.*snapshot vérifié.*index HTML local et manifeste SHA256.*sans nouvelle attestation ni import Excel/);
  assert.match(capture.reason,/verify-review.*lecture seule.*extraction fraîche.*image remplacée.*hash déclaré.*recalculé/);
  assert.match(capture.reason,/videoStreamOrdinal.*même piste pour ffprobe et ffmpeg.*sélection liée aux annotations/);
  assert.equal(plan.metrics.sourceTimingSchema,1);assert.equal(plan.metrics.sourceTimingBatchSchema,1);assert.equal(plan.metrics.sourceTimingReviewSchema,1);assert.equal(plan.metrics.measuredSourceMoves,0);
});

test('planning is deterministic and leaves both research and gameplay catalogues unchanged',()=>{
  const beforeResearch=digest(research),beforeRuntime=digest({ROSTER,STAGES,SPRITES});
  const rebuilt=buildProductionPlan(research);
  assert.equal(digest(rebuilt),digest(plan));
  assert.equal(digest(research),beforeResearch);assert.equal(digest({ROSTER,STAGES,SPRITES}),beforeRuntime);
  assert.equal(plan.metrics.fighters,ROSTER.length);assert.equal(plan.metrics.stages,STAGES.length);
  assert.equal(plan.metrics.moves,ROSTER.reduce((sum,f)=>sum+createCombatProfile(f).moveset.order.length,0));
});

test('implementation progress maps to real hooks while every unproduced artistic sequence remains open',()=>{
 assert.equal(plan.metrics.presentationHooks,PRESENTATION_KEYS.length);
 for(const [proposal,clip] of Object.entries(PRESENTATION_CLIPS)){
  assert.ok(PRESENTATION_KEYS.includes(clip),proposal);
  for(const row of plan.presentations.filter(row=>row.id.endsWith(':'+proposal))){
   assert.ok(row.engineState.includes(`${clip}@${row.id}`),row.id);
   assert.notEqual(row.productionStatus,'Validé');
  }
 }
 for(const row of plan.presentations.filter(row=>row.id.endsWith(':taunt'))){
  assert.match(row.engineState,/66 ticks.*annulable.*pause/);
  assert.match(row.trigger,/aucun dégât ni gain de jauge/);
 }
 const task=id=>plan.tasks.find(row=>row.id===id);
 assert.equal(task('global:round-boundaries').status,'Validé');
 assert.equal(task('global:cinematic-clips').status,'Validé');
 assert.match(task('global:cinematic-clips').reason,/Chargement atomique acteurs et couches bitmap du lieu.*PNG dédiés et décors restent à produire/);
 for(const row of plan.tasks.filter(row=>row.entityType==='Combattant'||row.entityType==='Arène')){
  const resolved=row.id.endsWith(':role')&&plan.fighters.find(f=>f.id===row.entityId)?.roleResolved;
  assert.equal(row.status==='Validé',Boolean(resolved),row.id);
 }
 for(const row of plan.tasks.filter(row=>row.id.endsWith(':art')))
  assert.equal(row.status,SPRITES[row.entityId]?.frames.length>0?'En cours':'À faire',row.id);
 assert.equal(plan.metrics.animatedClips,1);assert.equal(plan.metrics.certifiedOneToOne,0);
});

function roleFixture(){
 const changed=mutated(r=>{for(const f of r.fighters)delete f.roleDecision;});
 const ref=changed.fighters.find(f=>f.id==='sh3_glutton');
 ref.roleDecision={status:'resolved',fighterId:ref.id,decision:ref.combatRole,edition:ref.referenceEdition,
  evidence:[ref.referenceIds[0]],rationale:'Fixture: source-confirmed obstruction, with no autonomous combat.',reviewedAt:'2026-10-23'};
 return {changed,ref,fighter:ROSTER.find(f=>f.id===ref.id)};
}

test('a sourced noncombat role closes only its identity decision while production remains open',()=>{
 const {changed,ref}=roleFixture(),generated=buildProductionPlan(changed);
 const row=generated.fighters.find(f=>f.id===ref.id),tasks=generated.tasks.filter(t=>t.entityId===ref.id);
 assert.equal(row.roleResolved,true);assert.match(row.identityNote,/Rôle confirmé.*obstacle du décor.*SH3 original 2003/);
 assert.equal(tasks.find(t=>t.id.endsWith(':role')).status,'Validé');
 for(const t of tasks.filter(t=>!t.id.endsWith(':role')))assert.notEqual(t.status,'Validé',t.id);
 for(const m of generated.moves.filter(m=>m.fighterId===ref.id)){
  assert.equal(m.enabled,false);assert.equal(m.productionStatus,'À tester');assert.match(m.target,/Ne produire aucune attaque autonome/);
  for(const key of ['sourceFrameRate','sourceStart','sourceImpact','sourceEnd'])assert.equal(m[key],'');
 }
 for(const p of [...generated.poses,...generated.presentations].filter(p=>p.fighterId===ref.id))assert.equal(p.productionStatus,'À produire',p.id);
 assert.equal(generated.metrics.resolvedRoleDecisions,1);
 assert.equal(generated.metrics.openActions,generated.tasks.filter(t=>t.status!=='Validé').length);
 assert.equal(generated.metrics.openP0,generated.tasks.filter(t=>t.status!=='Validé'&&t.priority==='P0').length);
});

test('a role review rejects forged identity, borrowed evidence, unknown edition and malformed approval',()=>{
 const corruptions=[
  (d,r)=>d.fighterId='sh3_valtiel_051',
  d=>d.edition='SH2 remake 2024',
  (d,r)=>delete r.referenceEdition,
  d=>d.decision='combatant',
  d=>d.evidence=[],
  d=>d.evidence=['CL_SH1_07_NIGHTMARE_HOSPITAL'],
  d=>d.evidence.push(d.evidence[0]),
  d=>d.evidence=['UNKNOWN_SOURCE'],
  d=>d.rationale=' ',
  d=>d.reviewedAt='2026-02-30',
  d=>d.status='approved',
  (d,r)=>r.identityStatus='unverified'
 ];
 for(const corrupt of corruptions){
  const {changed,ref}=roleFixture();corrupt(ref.roleDecision,ref);
  assert.throws(()=>validateResearch(changed),/role decision/);
 }
});

test('a role review cannot close a runtime that still exposes combat or belongs to another edition',()=>{
 const {ref,fighter}=roleFixture(),profile=createCombatProfile(fighter),decision=ref.roleDecision;
 assert.equal(roleDecisionRuntimeCompatible(decision,fighter,profile),true);
 assert.equal(roleDecisionRuntimeCompatible(decision,null,profile),false);
 for(const change of [
  p=>p.referencePolicy.id='sh3_valtiel_051',p=>p.referencePolicy.source='film',
  p=>p.referencePolicy.edition='SH3 HD Collection',p=>p.referencePolicy.role='combatant',
  p=>p.referencePolicy.capabilities.reviewed=false,
  ...['combatEnabled','canMove','canJump','canDodge','superEnabled'].map(key=>p=>p.referencePolicy[key]=true),
  p=>Object.values(p.moves)[0].enabled=true,p=>p.moves={}
 ]){
  const forged=structuredClone(profile);change(forged);
  assert.equal(roleDecisionRuntimeCompatible(decision,fighter,forged),false);
 }
 const {changed,ref:pending}=roleFixture();pending.roleDecision={status:'pending'};
 const generated=buildProductionPlan(changed);
 assert.equal(generated.tasks.find(t=>t.id===pending.id+':role').status,'À faire');
 assert.equal(generated.fighters.find(f=>f.id===pending.id).roleResolved,false);
});

test('replacement bitmap scenery keeps procedural proposals prepared and visibly unproduced in the workbook',()=>{
 const stage=STAGES.find(s=>s.id==='midwich'),previous=STAGE_BITMAPS[stage.id],sha='1'.repeat(64);
 STAGE_BITMAPS[stage.id]={stageId:stage.id,source:stage.source,status:'integrated-candidate',fidelity:'unverified',mode:'replace',scene:'normal-courtyard',
  layers:[{id:'background',rect:[0,0,1,1],ticksPerFrame:1,loop:false,frames:[{path:`assets/stages/${stage.id}.${sha.slice(0,12)}.png`,sha256:sha,bytes:100,width:1280,height:720}]}]};
 try{
  const generated=buildProductionPlan(research),row=generated.stages.find(s=>s.id===stage.id);
  assert.equal(row.bitmapProgress.files,1);assert.equal(row.bitmapProgress.scene,'normal-courtyard');
  assert.match(row.locationNote,/mode replace.*normal-courtyard/);
  for(const animation of generated.stageAnimations.filter(a=>a.stageId===stage.id&&a.runtimeTrack)){
   assert.equal(animation.runtimeTrackVisible,false);assert.match(animation.existing,/préparée.*masquée.*statique.*normal-courtyard/);
   assert.doesNotMatch(animation.existing,/partiel joué/);assert.equal(animation.productionStatus,'En cours');
  }
  const task=generated.tasks.find(t=>t.id===stage.id+':stage');
  assert.equal(task.status,'En cours');assert.match(task.reason,/0 piste\(s\).*préparée\(s\).*masquée\(s\)/);
  assert.equal(generated.metrics.certifiedOneToOne,0);assert.ok(generated.metrics.stageBitmapCandidates>=1);
 }finally{if(previous)STAGE_BITMAPS[stage.id]=previous;else delete STAGE_BITMAPS[stage.id];}
});

test('the workbook exposes delivered weapon phases and the flight candidate without claiming measured source animation',()=>{
 const missionary=plan.fighters.find(row=>row.id==='sh3_missionary_047');
 assert.match(missionary.identityNote,/balles visibles arrêtées de face.*sans timings source mesurés/);
 assert.ok(plan.moves.filter(row=>row.fighterId===missionary.id).every(row=>row.canonicalVerification.includes('dos, chute, attaque')));
 assert.match(plan.fighters.find(row=>row.id==='sh1_incubator_018').identityNote,/Champ passif local.*adaptés au versus.*Décharges bleues/);
 assert.match(plan.fighters.find(row=>row.id==='sh1_incubus_019').identityNote,/Décharges rouges.*Aucun champ passif/);
 const cybil=plan.fighters.find(row=>row.id==='sh1_monster_cybil_017');
 assert.match(cybil.identityNote,/10 tirs.*strictement sous 50 %/);
 const alessa=plan.fighters.find(row=>row.id==='sh3_memory_of_alessa_049');
 const alessaIdle=plan.poses.find(row=>row.id===alessa.id+':pose:idle');
 assert.equal(alessaIdle.productionStatus,'En cours');
 assert.match(alessaIdle.existing,/3\/4 candidates ; à produire : MITRAILLETTE/);
 assert.match(alessaIdle.existing,/Aucun emprunt d’image entre armes, ni animation source certifiée/);
 const phases=createCombatProfile(ROSTER.find(f=>f.id===alessa.id)).moveset.weaponPhases;
 for(const phase of phases){
  assert.ok(alessa.identityNote.includes(phase.name));
  for(const row of plan.moves.filter(row=>row.fighterId===alessa.id)){
   assert.ok(row.target.includes(phase.moves[row.key].name),`${row.id}: active-weapon variant missing`);
   assert.equal(row.sourceFrameRate,'');
  }
 }
 const idle=plan.poses.find(row=>row.id==='sh1_air_screamer_001:pose:idle');
 assert.equal(idle.productionStatus,'En cours');
 assert.match(idle.existing,/3 images indépendantes.*24 ticks.*non certifiés/);
 assert.equal(plan.tasks.find(row=>row.id==='sh1_air_screamer_001:art').status,'En cours');
 assert.equal(plan.fighters.find(row=>row.id==='sh1_air_screamer_001').oneToOneValidated,false);
});

test('new combat rules retain their own source and describe versus limits in the workbook',()=>{
 const fighter=id=>plan.fighters.find(f=>f.id===id);
 assert.match(fighter('homecoming_smog_087').identityNote,/Smog.*dégâts des balles multipliés par 2 dans le versus.*aucun timing source mesuré/);
 const needler=fighter('homecoming_needler_088').identityNote;
 assert.match(needler,/Needler.*contact physique.*balles.*silencieuses/);assert.doesNotMatch(needler,/Missionary/);
 assert.match(fighter('sh2_lying_figure_crawling_021').identityNote,/rampante.*sans jet acide.*forme debout/);
 for(const id of ['sh2_mary_final_manifestation_034','sh2_maria_final_manifestation_033'])assert.match(fighter(id).identityNote,/entrave locale du versus.*capture source.*n’est pas reproduite/);
});

test('unverified roles and locations remain blocked through their moves, poses and finishers',()=>{
  const changed=mutated(r=>{r.fighters[0].combatRole='unverified';r.stages[0].locationStatus='bloque-reference';});
  const blocked=buildProductionPlan(changed),fighter=changed.fighters[0].id,stage=changed.stages[0].id;
  for(const row of [...blocked.moves,...blocked.poses,...blocked.presentations].filter(row=>row.fighterId===fighter))
    assert.equal(row.productionStatus,'À référencer',row.id);
  for(const row of blocked.finishers.filter(row=>row.entityId===fighter||row.entityId===stage))
    assert.equal(row.productionStatus,'À référencer',row.id);
  for(const row of blocked.stageAnimations.filter(row=>row.stageId===stage))assert.equal(row.productionStatus,'À référencer',row.id);
});

test('a blocked proposal cannot enter production solely because the fighter identity is documented',()=>{
  const fighter=plan.fighters.find(row=>row.targetRole==='combatant'&&row.productionStatus==='En cours');
  assert.ok(fighter,'a documented combatant must exercise proposal-level blocking');
  const changed=mutated(r=>{
    const ref=r.fighters.find(row=>row.id===fighter.id);
    for(const proposal of Object.values(ref.proposals))proposal.status='bloque-reference';
  });
  const blocked=buildProductionPlan(changed);
  const rows=[
    ...blocked.moves.filter(row=>row.fighterId===fighter.id&&['super','desperation'].includes(row.key)),
    ...blocked.finishers.filter(row=>row.entityId===fighter.id),
    ...blocked.presentations.filter(row=>row.fighterId===fighter.id)
  ];
  assert.ok(rows.length>=expectedProposals.length);
  for(const row of rows)assert.equal(row.productionStatus,'À référencer',row.id);
  assert.equal(blocked.fighters.find(row=>row.id===fighter.id).productionStatus,'En cours');
  for(const row of blocked.moves.filter(row=>row.fighterId===fighter.id&&!['super','desperation'].includes(row.key)))
    assert.equal(row.productionStatus,'En cours',`${row.id}: a blocked proposal does not erase a documented ordinary slot`);
});

test('missing, unknown and duplicated scope IDs cannot yield an apparently complete plan',()=>{
  assert.throws(()=>validateResearch(mutated(r=>r.fighters.pop())),/fighter: missing/);
  assert.throws(()=>validateResearch(mutated(r=>r.stages.pop())),/stage: missing/);
  assert.throws(()=>validateResearch(mutated(r=>r.stages.push({...r.stages[0],id:'not-a-stage'}))),/stage: unknown/);
  assert.throws(()=>validateResearch(mutated(r=>r.fighters.push(structuredClone(r.fighters[0])))),/fighter: missing\/duplicate ID/);
});

test('unknown source IDs are rejected wherever research attaches evidence',()=>{
  const changes=[
    r=>r.fighters[0].referenceIds.push('UNKNOWN_SOURCE'),
    r=>r.fighters.find(f=>f.observedMoves.length).observedMoves[0].evidence=['UNKNOWN_SOURCE'],
    r=>r.fighters[0].proposals.super.evidence=['UNKNOWN_SOURCE'],
    r=>r.fighters[0].proposals.super.basis=['UNKNOWN_SOURCE'],
    r=>r.stages[0].animations[0].evidence=['UNKNOWN_SOURCE']
  ];
  for(const change of changes)assert.throws(()=>validateResearch(mutated(change)),/unknown source UNKNOWN_SOURCE/);
});

test('unsupported canonical observations, proposals and stage animations are rejected',()=>{
  const observation=mutated(r=>{const o=r.fighters.find(f=>f.observedMoves.length).observedMoves[0];o.status='documente';o.evidence=[];});
  assert.throws(()=>validateResearch(observation),/sourced observation without evidence/);
  const proposal=mutated(r=>{r.fighters[0].proposals.finisher.status='canon';r.fighters[0].proposals.finisher.evidence=[];});
  assert.throws(()=>validateResearch(proposal),/unsupported canonical proposal finisher/);
  const animation=mutated(r=>{r.stages[0].animations[0].status='canon';r.stages[0].animations[0].evidence=[];});
  assert.throws(()=>validateResearch(animation),/unsupported canonical animation/);
});

test('missing proposals, unknown combat roles and malformed reference containers are refused',()=>{
  assert.throws(()=>validateResearch(mutated(r=>delete r.fighters[0].proposals.loseRound1)),/missing proposal loseRound1/);
  assert.throws(()=>validateResearch(mutated(r=>r.fighters[0].combatRole='invented-role')),/unknown combat role/);
  assert.throws(()=>validateResearch(mutated(r=>r.fighters[0].referenceIds=r.sources[0].id)),/references must be an array/);
});

test('variant lineage rejects missing bases, self references and multi-profile cycles',()=>{
  assert.throws(()=>validateResearch(mutated(r=>r.fighters[0].baseId='not-a-fighter')),/unknown base/);
  assert.throws(()=>validateResearch(mutated(r=>r.fighters[0].baseId=r.fighters[0].id)),/cyclic base/);
  assert.throws(()=>validateResearch(mutated(r=>{r.fighters[0].baseId=r.fighters[1].id;r.fighters[1].baseId=r.fighters[0].id;})),/cyclic base/);
});

test('observation input cannot replace generated IDs, ownership, edition or source timing',()=>{
  const changed=mutated(r=>{
    const f=r.fighters.find(f=>f.observedMoves.length);
    Object.assign(f.observedMoves[0],{id:'forged-observation',fighterId:'not-a-fighter',fighterName:'Other fighter',
      source:'other-edition',edition:'Invented edition',sourceTiming:'Measured 1:1',referenceIds:'UNKNOWN_SOURCE'});
  });
  const fighter=changed.fighters.find(f=>f.observedMoves.length),generated=buildProductionPlan(changed);
  const original=plan.observations.find(o=>o.fighterId===fighter.id),row=generated.observations.find(o=>o.id===original.id);
  assert.ok(row);assert.equal(row.fighterId,original.fighterId);assert.equal(row.fighterName,original.fighterName);
  assert.equal(row.edition,original.edition);assert.equal(row.source,original.source);
  assert.equal(row.sourceTiming,original.sourceTiming);assert.equal(row.referenceIds,original.referenceIds);
  assert.ok(!generated.observations.some(o=>o.id==='forged-observation'));
});

test('shared source IDs are deduplicated but conflicting URLs and duplicate source rows are refused',()=>{
  const source=research.sources[0],empty={fighters:[],stages:[]};
  const combined=combineResearch([{...empty,sources:[source]},{...empty,sources:[structuredClone(source)]}]);
  assert.equal(combined.sources.length,1);assert.equal(combined.sources[0].url,source.url);
  assert.throws(()=>combineResearch([{...empty,sources:[source]},{...empty,sources:[{...source,url:'https://example.invalid/another-source'}]}]),/Conflicting source ID/);
  assert.throws(()=>validateResearch(mutated(r=>r.sources.push(structuredClone(r.sources[0])))),/source: missing\/duplicate ID/);
});
