/** Run the current wave in the actual built HTTP application. */
import {spawnSync} from 'node:child_process';
const commands=[
  ['docs/production/vague28/qa-http-actions.mjs'],
  ['docs/production/vague28/qa-http-stages.mjs','--stages=final_sacrament,scarlet_chamber,arcade_hospital_roof',
    '--build=dist','--out=tests/http-wave28-stages','--port=4288']
];
for(const args of commands){
  const result=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
