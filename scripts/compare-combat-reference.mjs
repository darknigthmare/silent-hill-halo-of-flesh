/** Compare executable combat profiles with a local Git commit, without checkout or mutation. */
import {execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as current from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const baseline=process.argv[2]||'843449e';
const output=resolve(process.argv[3]||join(tmpdir(),'shhf_reference_policy_before_after.json'));
const commit=execFileSync('git',['rev-parse','--verify',`${baseline}^{commit}`],{cwd:root,encoding:'utf8'}).trim();
const temp=await mkdtemp(join(tmpdir(),'shhf-reference-compare-'));
const examples=['sh1_air_screamer_001','sh2_mannequin_022','sh3_pendulum_039','sh4_richard_braintree_victim_19',
 'sh4_jasper_gein_victim_17','sh4_wall_man_056','sh3_valtiel_051','townfall_sorrowful',
 'townfall_fallen','shf_shiromuku_166','shf_kyubi_169','sh1_monster_cybil_017'];
function totals(data){
 const profiles=data.ROSTER.map(f=>data.createCombatProfile(f)),moves=profiles.flatMap(p=>Object.values(p.moves));
 const active=moves.filter(m=>m.enabled!==false);
 return {fighters:profiles.length,slots:moves.length,enabled:active.length,
  projectile:active.filter(m=>m.projectile).length,teleport:active.filter(m=>m.teleport).length,
  trap:active.filter(m=>m.trap).length,aura:active.filter(m=>m.aura).length,
  affliction:active.filter(m=>m.effect).length,supers:active.filter(m=>['super','desperation'].includes(m.key)).length};
}
function inspect(data,id){
 const fighter=data.ROSTER.find(f=>f.id===id);if(!fighter)return null;
 const p=data.createCombatProfile(fighter);
 return {policy:p.referencePolicy||p.moveset.referencePolicy||null,ammoProfile:p.moveset.ammoProfile||null,
  moves:Object.fromEntries(Object.entries(p.moves).map(([key,m])=>[key,{
   enabled:m.enabled??true,name:m.name,projectile:m.projectile,teleport:m.teleport,trap:m.trap,aura:m.aura,
   effect:m.effect?.id||null,reach:m.reach,active:m.active,travel:m.travel,sourceTimingMeasured:m.sourceTimingMeasured??null
  }]))};
}
try{
 const paths=execFileSync('git',['ls-tree','-r','--name-only',commit,'src'],{cwd:root,encoding:'utf8'})
  .trim().split('\n').filter(path=>/\.(js|json)$/.test(path));
 for(const path of paths){
  const destination=join(temp,path);await mkdir(dirname(destination),{recursive:true});
  await writeFile(destination,execFileSync('git',['show',`${commit}:${path}`],{cwd:root,maxBuffer:16*1024*1024}));
 }
 await writeFile(join(temp,'package.json'),'{"type":"module"}\n');
 const previous=await import(pathToFileURL(join(temp,'src/data.js')));
 const report={baseline:commit,before:totals(previous),after:totals(current),
  note:'Executable generated profiles; enabled slots are not a claim of delivered artwork, measured timing or 1:1 fidelity.',
  examples:examples.map(id=>({id,before:inspect(previous,id),after:inspect(current,id)}))};
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({baseline:commit,output,before:report.before,after:report.after},null,2));
}finally{await rm(temp,{recursive:true,force:true});}
