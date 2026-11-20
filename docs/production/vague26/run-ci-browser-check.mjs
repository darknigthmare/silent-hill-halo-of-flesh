/** Run the exact art scope frozen in the completed wave26 preservation audit. */
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const audit=JSON.parse(await readFile(resolve(root,'docs/production/vague26/final-audit.json'),'utf8'));
if(audit.passed!==true||audit.wave!==26)throw Error('A completed exact wave26 audit is required.');
if(audit.coverage.upgradedProfiles.existingAnimatedProfilesReoriented!==0||audit.coverage.upgradedProfiles.newAnimatedClips!==0)throw Error('The wave26 browser gate covers the explicit static profiles only; animated changes require their own scoped verification.');
const ids=audit.coverage.upgradedProfiles.ids,stages=audit.coverage.stages.ids;
for(const list of [ids,stages])if(!Array.isArray(list)||!list.length||new Set(list).size!==list.length||list.some(id=>typeof id!=='string'||!/^[a-z0-9_]+$/.test(id)))throw Error('Invalid audited scope.');
const args=['docs/production/vague26/qa-http-native-assets.mjs','--ids='+ids.join(','),'--stages='+stages.join(','),'--build=dist','--out='+resolve(root,'tests/http-wave26-native')];
const run=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
if(run.error)throw run.error;
process.exit(run.status??1);
