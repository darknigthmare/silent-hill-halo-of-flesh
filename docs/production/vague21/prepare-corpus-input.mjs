/** Read the live runtime in a small, separate process before workbook authoring. */
import fs from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const arg=name=>process.argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3);
if(!arg('root')||!arg('output'))throw Error('Explicit --root and --output are required.');
const root=resolve(arg('root')),output=resolve(arg('output'));
const {STAGES,SOURCE_META,ROSTER}=await import(pathToFileURL(join(root,'src/data.js')).href);
const {STAGE_BITMAPS}=await import(pathToFileURL(join(root,'src/stage-bitmap-manifest.js')).href);
const {stageBitmapFor,stageBitmapFrames}=await import(pathToFileURL(join(root,'src/stage-bitmaps.js')).href);
const {REFERENCE_SOURCES}=await import(pathToFileURL(join(root,'src/production-reference.js')).href);
const hash=b=>createHash('sha256').update(b).digest('hex');
const sourcePaths=['docs/production/franchise-corpus.json','src/data.js','src/production-reference.js','src/stage-bitmap-manifest.js','docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx'];
const sourceHashes=Object.fromEntries(await Promise.all(sourcePaths.map(async p=>[p,hash(await fs.readFile(join(root,p)))])));
const stageRows=STAGES.map(s=>{
  const art=stageBitmapFor(s,STAGE_BITMAPS),blocked=!!s.reference?.blocked,active=!!art&&!blocked;
  const refs=s.reference?.referenceIds||[];
  return {id:s.id,name:s.name,source:s.source,sourceLabel:SOURCE_META[s.source]?.label||s.source,bitmap:active?'Actif':'Absent',reference:blocked?'Bloquée':'Ouverte',scene:s.referencePolicy?.sceneId||s.referencePolicy?.normalPhaseLabel||s.referencePolicy?.worldState||'À préciser',action:blocked?'Résoudre la référence : '+(s.reference?.locationNote||'lieu ou variante à confirmer'):active?'Poursuivre la revue de fidélité et les animations propres au lieu.':'Documenter le sous-lieu et sa phase, puis produire les plans manquants.',referenceIds:refs,sourceUrls:[...new Set(refs.map(id=>REFERENCE_SOURCES[id]?.url).filter(Boolean))],paths:active?stageBitmapFrames([s],STAGE_BITMAPS).map(f=>f.path):[],note:s.reference?.locationNote||'',sort:active?2:blocked?1:0};
}).sort((a,b)=>a.sort-b.sort||a.source.localeCompare(b.source)||a.id.localeCompare(b.id));
const data={schemaVersion:1,createdAt:new Date().toISOString(),preparerSHA256:hash(await fs.readFile(new URL(import.meta.url))),sourcePaths,sourceHashes,sourceMeta:SOURCE_META,fighterIds:ROSTER.map(f=>f.id),stageIds:STAGES.map(s=>s.id),stageRows};
await fs.mkdir(dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({output,stages:stageRows.length,active:stageRows.filter(s=>s.bitmap==='Actif').length,bytes:(await fs.stat(output)).size}));
