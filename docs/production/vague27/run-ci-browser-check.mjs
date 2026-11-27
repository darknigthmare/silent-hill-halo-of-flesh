/** Run the wave27 additions in the actual built HTTP application. */
import {spawnSync} from 'node:child_process';
const commands=[
  ['docs/production/vague27/qa-http-actions.mjs'],
  ['docs/production/vague26/qa-http-native-assets.mjs','--stages=police_station_hc,villa_rooftop,villa_stairwell',
    '--build=dist','--out=tests/http-wave27-stages','--port=4278']
];
for(const args of commands){
  const result=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
