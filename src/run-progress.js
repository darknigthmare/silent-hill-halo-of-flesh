import { ROSTER, STAGES, CHRONICLES, RITUAL_MODIFIERS, VERSION } from './data.js';
import { seededRandom } from './shared.js';
import { KEYS, plain, readState, writeState, validateEntry } from './save-store.js';
import { combatReferencePolicy } from './combat-reference-policy.js';

const fighters=new Map(ROSTER.map(f=>[f.id,f]));
const stages=new Map(STAGES.map(s=>[s.id,s]));
const routes=new Map(CHRONICLES.map(r=>[r.id,r]));
export const RUN_MODES=['arcade','boss','ritual','chronicle'];
export const CHRONICLE_ENCOUNTER_FORMAT='reference-encounters-v1';
export const RULE_BOOLEANS=['otherworldShift','stageHazards','radioWarning','adaptiveAI','fatalities','stageFatalities','stageAnimations','stageTerrain','stageDirector'];
export function normalizeRules(input={}) {
  return {mode:input.mode==='local'?'local':'cpu',roundsToWin:[1,2,3].includes(+input.roundsToWin)?+input.roundsToWin:2,
    timeLimit:[0,60,99].includes(+input.timeLimit)?+input.timeLimit:99,
    difficulty:['story','normal','hard'].includes(input.difficulty)?input.difficulty:'normal',
    ritualId:Object.hasOwn(RITUAL_MODIFIERS,input.ritualId)?input.ritualId:'none',
    ...Object.fromEntries(RULE_BOOLEANS.map(k=>[k,input[k]!==false]))};
}
export function shuffled(items,rng) {
  const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;
}
/** Uses project associations, not a claim that every inherited association is canonical. */
export function stageForFighter(id) {
  const f=fighters.get(id);if(!f)throw new Error('Manifestation inconnue.');
  const associated=stages.get(f.stageId);
  return (associated?.source===f.source?associated:STAGES.find(s=>s.source===f.source)||STAGES[0]).id;
}
/** Keep the authored chapter order and its original stage assignment. A dossier
 * is visible narrative material, never a victory or a simulated encounter. */
export function chronicleEncounterPlan(routeId) {
  const route=routes.get(routeId);if(!route)return null;
  const plan={chronicleFormat:CHRONICLE_ENCOUNTER_FORMAT,queue:[],stages:[],chapterIndices:[],referenceDossiers:[]};
  route.fighters.forEach((fighterId,chapterIndex)=>{
    const policy=combatReferencePolicy(fighters.get(fighterId));
    const stageId=route.stages[chapterIndex%route.stages.length];
    if(policy.combatEnabled){plan.queue.push(fighterId);plan.stages.push(stageId);plan.chapterIndices.push(chapterIndex);}
    else plan.referenceDossiers.push({chapterIndex,fighterId,stageId,role:policy.role});
  });
  return plan;
}
const sameList=(actual,expected)=>Array.isArray(actual)&&actual.length===expected.length&&actual.every((value,index)=>value===expected[index]);
function sameDossiers(actual,expected) {
  const keys=['chapterIndex','fighterId','stageId','role'];
  return Array.isArray(actual)&&actual.length===expected.length&&actual.every((entry,index)=>plain(entry)&&
    Object.keys(entry).length===keys.length&&keys.every(key=>Object.hasOwn(entry,key)&&entry[key]===expected[index][key]));
}
export function createRun({mode,playerId,routeId=null,seed=Date.now(),rules={}}) {
  if(!RUN_MODES.includes(mode)||!fighters.has(playerId))throw new Error('Parcours inconnu.');
  if(!combatReferencePolicy(fighters.get(playerId)).combatEnabled)throw new Error('Le rôle de ce sujet ne permet pas un parcours de combat ; sa fiche reste consultable.');
  seed=Number(seed)>>>0;
  const rng=seededRandom(seed), pool=ROSTER.filter(f=>f.id!==playerId&&combatReferencePolicy(f).combatEnabled);
  let queue=[],stageIds=[],rituals=[],route=null,chronicle=null;
  if(mode==='chronicle') {
    route=routes.get(routeId);if(!route)throw new Error('Chronique inconnue : choisissez un dossier existant.');
    chronicle=chronicleEncounterPlan(routeId);queue=chronicle.queue;stageIds=chronicle.stages;
    if(!queue.length)throw new Error('Cette chronique ne possède pas encore de rencontre combattante compatible ; ses chapitres restent des dossiers consultables.');
  } else if(mode==='ritual') {
    rituals=Object.keys(RITUAL_MODIFIERS).filter(k=>k!=='none');
    const normal=shuffled(pool.filter(f=>!f.boss),rng), bosses=shuffled(pool.filter(f=>f.boss),rng);
    queue=rituals.map((_,i)=>(i>=rituals.length-2||i===3?bosses.shift():normal.shift()).id);
  } else if(mode==='arcade') {
    // Reserve the last encounter before drawing the rest of the descent.
    const finalBoss=shuffled(pool.filter(f=>f.boss),rng)[0];
    queue=[...shuffled(pool.filter(f=>f.id!==finalBoss.id),rng).slice(0,6).map(f=>f.id),finalBoss.id];
  } else queue=shuffled(pool.filter(f=>f.boss),rng).slice(0,6).map(f=>f.id);
  if(!stageIds.length)stageIds=queue.map(stageForFighter);
  const carry=mode==='boss'||mode==='ritual';
  return {schema:1,version:VERSION,type:{arcade:'DESCENTE',boss:'GRANDS TOURMENTS',ritual:'RITES DU JUGEMENT',chronicle:'CHRONIQUE'}[mode],id:`${mode}-${Date.now()}-${seed}`,mode,playerId,routeId:route?.id||null,seed,
    queue,stages:stageIds,rituals,index:0,wins:0,status:'ready',carry,carryHealth:1,carryMeter:0,
    ...(chronicle?{chronicleFormat:chronicle.chronicleFormat,chapterIndices:chronicle.chapterIndices,referenceDossiers:chronicle.referenceDossiers}:{}),
    recovery:mode==='boss'?.18:.12,rules:normalizeRules({...rules,mode:'cpu'}),results:[],updatedAt:Date.now()};
}
export function validateRun(value) {
  if(!validateEntry(KEYS.run,value)||!fighters.has(value.playerId)||value.queue.length>32||value.stages.length!==value.queue.length||
     value.queue.some(id=>!fighters.has(id))||value.stages.some(id=>!stages.has(id))||
     !Number.isFinite(value.carryHealth)||value.carryHealth<.05||value.carryHealth>1||
     !Number.isFinite(value.carryMeter)||value.carryMeter<0||value.carryMeter>100||
     typeof value.carry!=='boolean'||!Number.isFinite(value.recovery)||value.recovery<0||value.recovery>.3||
     !Array.isArray(value.rituals)||value.rituals.some(id=>!Object.hasOwn(RITUAL_MODIFIERS,id))||
     value.results.length>value.queue.length||value.results.some(r=>!plain(r)||!Number.isInteger(r.index)||r.index<0||r.index>=value.queue.length||!plain(r.stats))||
     new Set(value.results.map(r=>r.index)).size!==value.results.length) return false;
  const normalized=normalizeRules(value.rules);
  if(Object.keys(value.rules).length!==Object.keys(normalized).length ||
    Object.entries(normalized).some(([k,v])=>value.rules[k]!==v) || value.rules.mode!=='cpu')return false;
  if(!Number.isInteger(value.seed)||value.seed<0||value.seed>4294967295)return false;
  if(value.results.some(r=>Object.values(r.stats).some(v=>
    !(typeof v==='number'&&Number.isFinite(v)&&v>=0) && !(typeof v==='string'&&/^[SABCD]$/.test(v)))))return false;
  if(value.wins!==value.results.length || value.results.some(r=>r.won!==true))return false;
  if(value.results.some((r,i)=>r.index!==i))return false;
  if(['won','complete'].includes(value.status) && value.wins!==value.index+1)return false;
  if(['ready','lost'].includes(value.status) && value.wins!==value.index)return false;
  if(value.status==='complete' && value.index!==value.queue.length-1)return false;
  if(value.status==='won' && value.index===value.queue.length-1)return false;
  const hasFormat=Object.hasOwn(value,'chronicleFormat');
  const hasChapters=Object.hasOwn(value,'chapterIndices'),hasDossiers=Object.hasOwn(value,'referenceDossiers');
  if((hasFormat||hasChapters||hasDossiers)&&(value.mode!=='chronicle'||!hasFormat||!hasChapters||!hasDossiers||value.chronicleFormat!==CHRONICLE_ENCOUNTER_FORMAT))return false;
  if(value.mode==='chronicle') {
    const route=routes.get(value.routeId);
    if(!route)return false;
    if(hasFormat){
      const expected=chronicleEncounterPlan(route.id);
      if(!sameList(value.queue,expected.queue)||!sameList(value.stages,expected.stages)||
        !sameList(value.chapterIndices,expected.chapterIndices)||!sameDossiers(value.referenceDossiers,expected.referenceDossiers))return false;
    }else if(!sameList(value.queue,route.fighters)||value.stages.some((id,i)=>id!==route.stages[i%route.stages.length]))return false;
  }
  return true;
}
export function loadRun(storage) {
  const value=readState(KEYS.run,{},storage,validateRun);return validateRun(value)?value:null;
}
/** Old checkpoints remain valid and unchanged, even if a later policy prevents
 * their remaining encounter from starting. The UI explains those blockers. */
export function runCombatBlockers(run) {
  if(!validateRun(run)||run.status==='complete')return [];
  const start=run.status==='won'?run.index+1:run.index;
  return [...new Set([run.playerId,...run.queue.slice(start)])].flatMap(fighterId=>{
    const policy=combatReferencePolicy(fighters.get(fighterId));
    return policy.combatEnabled?[]:[{fighterId,role:policy.role}];
  });
}
export function saveRun(run,storage) {return validateRun(run)?writeState(KEYS.run,run,storage,validateRun):null;}
/** A route's encounter modifier takes precedence over its saved selection defaults. */
export function runEncounterRules(run) {
  if(!run)return {};
  return {...run.rules,ritualId:run.rituals?.length?run.rituals[run.index%run.rituals.length]:run.rules.ritualId};
}
export function playerOutcome(result) {
  if(!result || ![0,1].includes(result.winnerIndex))throw new Error('Résultat sans emplacement de joueur.');
  return {won:result.winnerIndex===0,stats:{...(result.winnerIndex===0?result.stats?.winner:result.stats?.loser)||{}},
    opponentStats:{...(result.winnerIndex===0?result.stats?.loser:result.stats?.winner)||{}}};
}
export function settleRun(run,result) {
  if(!validateRun(run)||run.status!=='ready')return run;
  const {won,stats}=playerOutcome(result);
  const next={...run,results:[...run.results],status:won?(run.index===run.queue.length-1?'complete':'won'):'lost',updatedAt:Date.now()};
  if(won) {
    next.wins++;next.results.push({index:run.index,won:true,stats});
    if(run.carry){next.carryHealth=Math.max(.12,Math.min(1,(Number(stats.healthRatio)||0)+run.recovery));
      next.carryMeter=Math.max(0,Math.min(70,(Number(result.snapshot?.p1?.meter)||0)*.55));}
  }
  return next;
}
export function resumeRun(run) {
  if(!validateRun(run)||run.status==='complete')return null;
  if(run.status==='won')return {...run,index:run.index+1,status:'ready',updatedAt:Date.now()};
  return {...run,status:'ready',updatedAt:Date.now()};
}
export function runSummary(run) {
  const entries=run?.results||[];const out={};
  for(const {stats} of entries)for(const [key,value]of Object.entries(stats))if(typeof value==='number'&&Number.isFinite(value))
    out[key]=key==='maxCombo'?Math.max(out[key]||0,value):(out[key]||0)+value;
  // A route grade is based on all won encounters, not on the opponent or final fight only.
  if(entries.length)for(const key of Object.keys(out))if(key!=='maxCombo')out[key]/=entries.length;
  return out;
}
export function updateRecords(previous,result,matchId,opponentId,grade,run) {
  const old=previous||{};
  if(old.appliedMatches?.includes(matchId))return old;
  const {won,stats,opponentStats}=playerOutcome(result);
  const out={...old,defeated:{...old.defeated},appliedMatches:[...(old.appliedMatches||[]),matchId].slice(-128)};
  out.matches=(old.matches||0)+1;out.wins=(old.wins||0)+(won?1:0);
  if(won)out.defeated[opponentId]=(out.defeated[opponentId]||0)+1;
  for(const k of ['perfectGuards','counters','guardCounters','dodgeAttacks','wakeupAttacks','backThrows','armorBreaks','groundBounces','hazardsTaken','fatalities','stageFatalities'])
    out[k]=(old[k]||0)+Math.max(0,Number(stats[k])||0);
  out.bossPhases=(old.bossPhases||0)+(stats.bossPhasesTriggered||0)+(opponentStats.bossPhasesTriggered||0);
  const ranks={D:0,C:1,B:2,A:3,S:4};
  out.bestGrade=(ranks[grade]??0)>(ranks[old.bestGrade]??-1)?grade:old.bestGrade||'D';
  const best={arcade:'arcadeBest',boss:'bossBest',ritual:'ritualBest'}[run?.mode];
  if(best)out[best]=Math.max(old[best]||0,run.wins);
  return out;
}
