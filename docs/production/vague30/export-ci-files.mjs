/** Export only reviewable generated project files after CI; no credentials or environment. */
import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const tracked=execFileSync('git',['diff','--name-only','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const supplemental=[
  'docs/production/vague30/inventory.json',
  'docs/production/vague30/characters/import-receipts.json',
  'docs/production/vague30/characters/registry-preservation.json'
];
const allowed=path=>/^(?:src\/production-reference\.js|src\/sprite-manifest\.js|service-worker\.js|art\/registry\.json|data\/[a-z0-9-]+\.json|docs\/[A-Z0-9_]+\.md|docs\/combat-guide\/(?:associations\.json|status\.json|MATRICE\.md|ETAT_DES_LIEUX\.md)|docs\/production\/vague30\/(?:inventory\.json|characters\/(?:import-receipts|registry-preservation)\.json))$/.test(path);
const paths=[...new Set([...tracked,...supplemental])].filter(allowed);
let files=0;
for(const path of paths) {
  try{await stat(path);}catch(error){if(error.code==='ENOENT')continue;throw error;}
  const bytes=await readFile(path),content=bytes.toString('base64'),chunks=Math.ceil(content.length/48000);
  const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  const sha256=createHash('sha256').update(bytes).digest('hex');
  console.log('V30_FILE '+JSON.stringify({path,bytes:bytes.length,sha,sha256,chunks}));
  for(let index=0;index<chunks;index++)console.log('V30_CHUNK '+JSON.stringify({path,index,data:content.slice(index*48000,(index+1)*48000)}));
  files++;
}
console.log('V30_EXPORT_END '+JSON.stringify({files}));
