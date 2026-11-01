/** Documentary campaign progress only; never imported by the game. */
export const ART_CAMPAIGN_ID='art144';
export const ART_CAMPAIGN_BASE='221dcc8cac927291bb7e0b89139a504dabb857db';
export const ART_CAMPAIGN_GROUP_SIZES=Object.freeze({a:30,b:30,c:30,d:30,e:24});

export function applyArtCampaignProgress(plan,deliveries,assets){
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
    if(item.status==='blocked'&&(typeof item.reason!=='string'||!item.reason.trim()||clip?.frames?.length))
      throw Error('ART144 blocked row requires a reason and no imported idle: '+item.rowId);
    // Previous reasons are history, even when new evidence permits a candidate.
    // Importing a still never closes its parent art action or certifies fidelity.
    const historical=deliveries.filter(old=>old.batch!==ART_CAMPAIGN_ID&&old.rowId===item.rowId&&old.collection==='poses'&&old.status==='blocked');
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
  return result;
}
