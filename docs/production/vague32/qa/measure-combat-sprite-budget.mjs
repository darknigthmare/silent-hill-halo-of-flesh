/** Recalculate the wave32 whole-duel decoded RGBA admission bound, without decoding PNGs. */
import {ROSTER} from '../../../../src/data.js';
import {combatSpriteFor,COMBAT_SPRITE_BUDGET} from '../../../../src/sprite-system.js';
import {writeFile} from 'node:fs/promises';

const MiB=1024*1024;
const owners=ROSTER.map(f=>({id:f.id,source:f.source,frames:combatSpriteFor(f)?.frames||[]}));
const sized=frames=>{
  const unique=new Map(frames.map(frame=>[frame.path,frame]));
  return {decodedBytes:[...unique.values()].reduce((n,f)=>n+f.width*f.height*4,0),uniqueFrames:unique.size};
};
const profiles=owners.map(f=>({id:f.id,source:f.source,...sized(f.frames)})).sort((a,b)=>b.decodedBytes-a.decodedBytes);
const pairs=[];
for(let i=0;i<owners.length;i++)for(let j=i;j<owners.length;j++)
  pairs.push({owners:[owners[i].id,owners[j].id],...sized([...owners[i].frames,...owners[j].frames])});
pairs.sort((a,b)=>b.decodedBytes-a.decodedBytes);
const maximum=pairs[0];
const report={schema:1,wave:32,
  method:'Every unordered roster pair, including mirror matches; exact combatSpriteFor(...).frames admission list deduplicated by path; decoded RGBA bytes = width * height * 4.',
  reproduce:'node docs/production/vague32/qa/measure-combat-sprite-budget.mjs',
  rosterProfiles:owners.length,combatArtProfiles:owners.filter(f=>f.frames.length).length,
  unorderedPairsIncludingMirrors:pairs.length,previousBudgetBytes:72*MiB,newBudgetBytes:COMBAT_SPRITE_BUDGET,
  overPreviousBudget:pairs.filter(p=>p.decodedBytes>72*MiB),maximum,
  minimumWholeMiBBudget:Math.ceil(maximum.decodedBytes/MiB),headroomBytes:COMBAT_SPRITE_BUDGET-maximum.decodedBytes,
  allPairsAdmitted:pairs.every(p=>p.decodedBytes<=COMBAT_SPRITE_BUDGET),
  topProfiles:profiles.slice(0,15),topPairs:pairs.slice(0,20),
  unchangedBudgets:{genericSpriteBytes:64*MiB,stageBytes:64*MiB,projectileBytes:32*MiB},
  limits:['Decoded RGBA cache accounting is not total process/browser/GPU memory.',
    'This bound admits one duel; an in-progress retired scene may still require the existing retirement/transition logic.',
    'No PNG bytes, frame dimensions or clip membership are removed or resized.']};
await writeFile(new URL('./combat-sprite-budget.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pairs:pairs.length,maximum,newBudgetBytes:COMBAT_SPRITE_BUDGET,allPairsAdmitted:report.allPairsAdmitted}));
