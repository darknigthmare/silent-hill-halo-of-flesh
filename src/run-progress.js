import { ROSTER, STAGES, CHRONICLES, RITUAL_MODIFIERS, VERSION } from './data.js';
import { seededRandom } from './shared.js';
import { KEYS, plain, readState, writeState, validateEntry } from './save-store.js';

const fighters=new Map(ROSTER.map(f=>[f.id,f]));
const stages=new Map(STAGES.map(s=>[s.id,s]));
const routes=new Map(CHRONICLES.map(r=>[r.id,r]));
export const RUN_MODES=['arcade','boss','ritual','chronicle'];
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
export function createRun({mode,playerId,routeId=null,seed=Date.now(),rules={}}) {
  if(!RUN_MODES.includes(mode)||!fighters.has(playerId))throw new Error('Parcours inconnu.');
  seed=Number(seed)>>>0;
  const rng=seededRandom(seed), pool=ROSTER.filter(f=>f.id!==playerId);
  let queue=[],stageIds=[],rituals=[],route=null;
  if(mode==='chronicle') {
    route=routes.get(routeId);if(!route)throw new Error('Chronique inconnue : choisissez un dossier existant.');
    queue=[...route.fighters];stageIds=queue.map((_,i)=>route.stages[i%route.stages.length]);
  } else if(mode==='ritual') {
    rituals=Object.keys(RITUAL_MODIFIERS).filter(k=>k!=='none');
    const normal=shuffled(pool.filter(f=>!f.boss),rng), bosses=shuffled(pool.filter(f=>f.boss),rng);
    queue=rituals.map((_,i)=>(i>=rituals.length-2||i===3?bosses.shift():normal.shift()).id);
  } else queue=shuffled(pool.filter(f=>mode!=='boss'||f.boss),rng).slice(0,mode==='boss'?6:7).map(f=>f.id);
  if(!stageIds.length)stageIds=queue.map(stageForFighter);
  const carry=mode==='boss'||mode==='ritual';
  return {schema:1,version:VERSION,type:{arcade:'DESCENTE',boss:'GRANDS TOURMENTS',ritual:'RITES DU JUGEMENT',chronicle:'CHRONIQUE'}[mode],id:`${mode}-${Date.now()}-${seed}`,mode,playerId,routeId:route?.id||null,seed,
    queue,stages:stageIds,rituals,index:0,wins:0,status:'ready',carry,carryHealth:1,carryMeter:0,
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
  if(value.mode==='chronicle') {
    const route=routes.get(value.routeId);
    if(!route || JSON.stringify(value.queue)!==JSON.stringify(route.fighters) ||
      value.stages.some((id,i)=>id!==route.stages[i%route.stages.length]))return false;
  }
  return true;
}
export function loadRun(storage) {
  const value=readState(KEYS.run,{},storage,validateRun);return validateRun(value)?value:null;
}
export function saveRun(run,storage) {return validateRun(run)?writeState(KEYS.run,run,storage,validateRun):null;}
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
