/** Documentary campaign progress only; never imported by the game. */
import {lstatSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ART_CAMPAIGN_ID,ART_CAMPAIGN_BASE,ART_CAMPAIGN_GROUP_SIZES,ART_CONTINUATION_ID,ART_CONTINUATION_BASE,ART_CONTINUATION_GROUP_SIZES} from './art-campaign-constants.mjs';
import {readPurposeDeliveries,resolvedHistoricalArtwork} from './art-campaign-review.mjs';
export {ART_CAMPAIGN_ID,ART_CAMPAIGN_BASE,ART_CAMPAIGN_GROUP_SIZES,ART_CONTINUATION_ID,ART_CONTINUATION_BASE,ART_CONTINUATION_GROUP_SIZES};

const repositoryRoot=fileURLToPath(new URL('../',import.meta.url));
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const safeArtifact=value=>nonempty(value)&&!isAbsolute(value)&&!value.includes('\\')&&value.split('/').every(part=>part&&part!=='.'&&part!=='..');
const httpsEvidence=value=>Array.isArray(value)&&value.length>0&&value.every(url=>{
  try{return new URL(url).protocol==='https:';}catch{return false;}
});

/** Pure selection only. Import validation below is still required before an override. */
export function latestArtContinuationDelivery(deliveries,rowId){
  const matches=deliveries.filter(item=>item.batch===ART_CONTINUATION_ID&&item.rowId===rowId);
  if(matches.length>1)throw Error('Duplicate ART92 production row: '+rowId);
  return matches[0]||null;
}

function artifactMatches(root,frame){
  if(!safeArtifact(frame?.path)||!/^assets\/sprites\/[a-z0-9_.-]+\.png$/.test(frame.path))return false;
  try{
    const file=resolve(root,frame.path),stat=lstatSync(file);
    if(!stat.isFile()||stat.isSymbolicLink())return false;
    const bytes=readFileSync(file);
    return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&
      frame.bytes===bytes.length&&frame.sha256===createHash('sha256').update(bytes).digest('hex');
  }catch{return false;}
}

function validatedContinuation(plan,deliveries,assets,root){
  const items=deliveries.filter(item=>item.batch===ART_CONTINUATION_ID),result=new Map(),laterCombat=new Map();
  if(!items.length)return {continuation:result,laterCombat};
  if(items.length>92)throw Error('ART92 production continuation exceeds its 92 original profiles');
  const intake=JSON.parse(readFileSync(resolve(root,'docs/production/art92-intake.json'),'utf8'));
  if(intake.schema!==1||intake.campaign!==ART_CONTINUATION_ID||intake.baseCommit!==ART_CONTINUATION_BASE||intake.requested!==92||!Array.isArray(intake.entries))
    throw Error('Invalid ART92 immutable intake');
  const assigned=new Map(intake.entries.map(entry=>[entry.fighter?.id,entry]));
  if(assigned.size!==intake.entries.length||assigned.has(undefined))throw Error('Duplicate ART92 intake identity');
  const review={intake,rows:items,assets:{},purposeDeliveries:readPurposeDeliveries(root)};
  const poses=new Map(plan.poses.map(row=>[row.id,row])),tasks=new Set(plan.tasks.map(row=>row.id)),groupCounts={};
  for(const item of items){
    latestArtContinuationDelivery(deliveries,item.rowId);
    const row=poses.get(item.rowId),entry=assigned.get(item.entityId);
    const previous=deliveries.filter(old=>old.batch===ART_CAMPAIGN_ID&&old.rowId===item.rowId);
    if(item.collection!=='poses'||!row||row.pose!=='idle'||row.fighterId!==item.entityId||item.rowId!==item.entityId+':pose:idle'||
      !tasks.has(item.entityId+':art')||!entry||entry.fighter.source!==row.source||entry.group!==item.group||
      !Object.hasOwn(ART_CONTINUATION_GROUP_SIZES,item.group)||previous.length!==1||previous[0].status!=='blocked'||
      previous[0].entityId!==item.entityId||previous[0].collection!=='poses'||!nonempty(item.limits)||!httpsEvidence(item.evidence)||
      !Array.isArray(item.artifacts)||item.artifacts.some(path=>!safeArtifact(path))||!['implemented-candidate','blocked'].includes(item.status))
      throw Error('Invalid ART92 continuation delivery: '+item.rowId);
    groupCounts[item.group]=(groupCounts[item.group]||0)+1;
    if(groupCounts[item.group]>ART_CONTINUATION_GROUP_SIZES[item.group])throw Error('ART92 group exceeds its original allocation: '+item.group);
    const art=assets[item.entityId],clip=art?.clips?.idle;
    if(item.status==='blocked'){
      const later=clip?.frames?.length&&resolvedHistoricalArtwork(item,art,review,{purpose:'combat'})&&
        clip.frames.every(index=>artifactMatches(root,art.frames[index]))&&artifactMatches(root,art.portrait);
      if(!nonempty(item.reason)||(clip?.frames?.length&&!later))throw Error('ART92 blocked row requires a reason and no imported idle: '+item.rowId);
      if(later)laterCombat.set(item.rowId,art.frames[clip.frames[0]].path);
    }else if(entry.generationExcluded!==false||!art||art.fighterId!==item.entityId||art.source!==row.source||art.fidelity!=='unverified'||
      art.animatedClips!==0||art.frames?.length!==1||!art.frames[0]||JSON.stringify(clip?.frames)!=='[0]'||clip.loop!==false||clip.ticksPerFrame!==1||
      !item.artifacts.includes(art.frames[0].path)||!artifactMatches(root,art.frames[0])){
      throw Error('ART92 candidate requires an eligible exact-source imported static idle, evidence and matching artifact file: '+item.rowId);
    }
    result.set(item.rowId,item);
  }
  return {continuation:result,laterCombat};
}

export function applyArtCampaignProgress(plan,deliveries,assets,{root=repositoryRoot}={}){
  // A new image can supersede a historical blocker only after its own complete review.
  const {continuation,laterCombat}=validatedContinuation(plan,deliveries,assets,root);
  const campaign=deliveries.filter(item=>item.batch===ART_CAMPAIGN_ID);
  if(!campaign.length)return null;
  const latest=new Map(campaign.map(item=>[item.rowId,item]));
  if(latest.size!==campaign.length)throw Error('Duplicate ART144 production row');
  const rows=new Map(plan.poses.map(row=>[row.id,row]));
  const tasks=new Map(plan.tasks.map(task=>[task.id,task]));
  for(const item of campaign){
    const row=rows.get(item.rowId),task=tasks.get(item.entityId+':art');
    if(item.collection!=='poses'||!row||row.fighterId!==item.entityId||row.pose!=='idle'||
      item.rowId!==item.entityId+':pose:idle'||!task||!['implemented-candidate','blocked'].includes(item.status)||
      typeof item.limits!=='string'||!item.limits.trim()||!Array.isArray(item.evidence)||!item.evidence.length)
      throw Error('Invalid ART144 production delivery: '+item.rowId);
    const art=assets[item.entityId],clip=art?.clips?.idle;
    if(item.status==='implemented-candidate'&&(!art||art.fighterId!==item.entityId||art.source!==row.source||
      !Array.isArray(clip?.frames)||clip.frames.length!==1||clip.loop!==false||!art.frames?.[clip.frames[0]]))
      throw Error('ART144 candidate requires its own imported static idle: '+item.rowId);
    if(item.status==='blocked'&&(typeof item.reason!=='string'||!item.reason.trim()||
      (clip?.frames?.length&&continuation.get(item.rowId)?.status!=='implemented-candidate'&&!laterCombat.has(item.rowId))))
      throw Error('ART144 blocked row requires a reason and no imported idle: '+item.rowId);
    // Previous reasons are history, even when new evidence permits a candidate.
    // Importing a still never closes its parent art action or certifies fidelity.
    const historical=deliveries.filter(old=>/^lot\d+$/.test(old.batch)&&old.rowId===item.rowId&&old.collection==='poses'&&old.status==='blocked');
    for(const old of historical){
      const note=`Historique conservé — Blocage de production du lot ${old.batch.slice(3)} (${old.rowId}) : ${old.reason} ${old.limits} La limite antérieure reste archivée ; le relevé ART144 ne la déclare pas automatiquement résolue.`;
      row.existing+=' '+note;task.reason+=' '+note;
    }
    const label=`Campagne ART144, groupe ${item.group} (${item.rowId})`;
    const note=item.status==='blocked'
      ?`Blocage de production — ${label} : ${item.reason} ${item.limits}`
      :`Livraison candidate — ${label} : image idle fixe importée. ${item.limits} Ce PNG ne vaut ni validation de la cible antérieure, ni certification 1:1 ; le rôle et les capacités restent inchangés.`;
    row.existing+=' '+note;task.reason+=' '+note;
    if(item.status==='implemented-candidate')task.delivery='art144-static-candidate-2026-11-01';
  }
  const result={id:ART_CAMPAIGN_ID,baselineCommit:ART_CAMPAIGN_BASE,requested:144,assessed:campaign.length,
    candidates:campaign.filter(item=>item.status==='implemented-candidate').length,
    blocked:campaign.filter(item=>item.status==='blocked').length,pending:144-campaign.length,
    certifiedOneToOne:false,
    scope:'One existing idle row for each of the 144 previously unillustrated profiles. Static candidates and blockers are distinct; artwork does not change combat roles, capabilities or source timing.'};
  if(result.pending<0)throw Error('ART144 production campaign exceeds its 144 original profiles');
  plan.artCampaign=result;
  if(continuation.size){
    for(const item of continuation.values()){
      const row=rows.get(item.rowId),task=tasks.get(item.entityId+':art');
      const label=`Campagne ART92, groupe ${item.group} (${item.rowId})`;
      const note=item.status==='blocked'
        ?`Blocage de reprise — ${label} : ${item.reason} ${item.limits} Le diagnostic ART144 reste conservé dans l’historique.`
        :`Livraison candidate — ${label} : image idle fixe importée. ${item.limits} Le blocage ART144 reste archivé comme diagnostic antérieur ; cette nouvelle image ne certifie ni la cible antérieure ni la fidélité 1:1. Le rôle et les capacités restent inchangés.`;
      row.existing+=' '+note;task.reason+=' '+note;
      if(item.status==='implemented-candidate')task.delivery='art92-static-candidate-2026-11-02';
      if(laterCombat.has(item.rowId)){
        const laterNote=`Livraison ultérieure distincte — image de combat latérale candidate documentée : ${laterCombat.get(item.rowId)}. Seule la présence du sprite de combat est actualisée ; les blocages ART144 et ART92 restent archivés. Ni animation, ni fidélité 1:1, ni approbation de production, ni rôle ne sont validés par cette image.`;
        row.existing+=' '+laterNote;task.reason+=' '+laterNote;
      }
    }
    const items=[...continuation.values()];
    plan.artContinuation={id:ART_CONTINUATION_ID,baselineCommit:ART_CONTINUATION_BASE,requested:92,assessed:items.length,
      candidates:items.filter(item=>item.status==='implemented-candidate').length,blocked:items.filter(item=>item.status==='blocked').length,
      pending:92-items.length,laterCombatImages:laterCombat.size,certifiedOneToOne:false,
      scope:'Reassessment of the 92 ART144 historical blockers only. Prior delivery ledgers and role decisions remain unchanged; a source-owned static image is separate from animation or 1:1 certification.'};
  }
  return result;
}
