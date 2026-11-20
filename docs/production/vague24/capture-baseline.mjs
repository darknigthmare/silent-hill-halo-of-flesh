/** Capture the reconciled local starting point before importing wave 24 assets. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROSTER,STAGES} from '../../../src/data.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {stageBitmapFor,stageBitmapFrames,stageBitmapRooms} from '../../../src/stage-bitmaps.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const out=resolve(root,'docs/production/vague24/scope-baseline.json');
const expectedBaseCommit='54404d2280f6feee9530e95c42ffcb711a597e19';
const actualBaseCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
if(actualBaseCommit!==expectedBaseCommit)throw Error('Wave 24 baseline requires the reviewed reconciled local commit '+expectedBaseCommit+'; found '+actualBaseCommit);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const jsonHash=value=>hash(JSON.stringify(value));
try { await readFile(out); throw Error('Baseline already exists; preserve it.'); }
catch(error) { if(error.code!=='ENOENT')throw error; }
const tracked=execFileSync('git',['ls-files','src','data'],{cwd:root,encoding:'utf8'}).trim().split('\n');
const allowed=new Set(['src/sprite-manifest.js','data/sprite-coverage.json']);
const protectedPaths=[...tracked.filter(p=>!allowed.has(p)),
  'docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx',
  'docs/production/workbook-verification.json','docs/production/franchise-corpus.json',
  'docs/BIBLE_CORPUS_SILENT_HILL.md',
  'docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx'];
const protectedFiles=[];
for(const path of protectedPaths){const raw=await readFile(resolve(root,path));protectedFiles.push({path,sha256:hash(raw),bytes:raw.length});}
const registry=JSON.parse(await readFile(resolve(root,'art/registry.json'),'utf8'));
const coverage=JSON.parse(await readFile(resolve(root,'data/sprite-coverage.json'),'utf8'));
const active=STAGES.filter(s=>!s.reference?.blocked&&stageBitmapFor(s,STAGE_BITMAPS));
const result={schema:1,wave:24,createdAt:new Date().toISOString(),
  baseCommit:actualBaseCommit,
  baseTree:execFileSync('git',['rev-parse','HEAD^{tree}'],{cwd:root,encoding:'utf8'}).trim(),
  scope:'Dedicated lateral character candidates resumed after local delivery reconciliation; all stages, gameplay, source corpus, workbooks and animated clips preserved.',
  protectedFiles,
  coverage:{sprites:coverage.totals||coverage.summary||Object.fromEntries(Object.entries(coverage).filter(([k,v])=>typeof v!=='object')),stages:{total:STAGES.length,active:active.length,missing:STAGES.length-active.length,blocked:STAGES.filter(s=>s.reference?.blocked).length,registeredStageEntries:Object.keys(STAGE_BITMAPS).length,storedCompositions:Object.values(STAGE_BITMAPS).flatMap(stageBitmapRooms).length,activeReferencedPNG:stageBitmapFrames(active,STAGE_BITMAPS).length}},
  roster:ROSTER.map(f=>({id:f.id,source:f.source,combatEnabled:f.combatEnabled,definitionSHA256:jsonHash(f)})),
  spriteEntries:Object.fromEntries(Object.entries(registry.assets).map(([id,a])=>[id,{entrySHA256:jsonHash(a),portrait:a.portrait,frames:a.frames.map(f=>({path:f.path,sha256:f.sha256})),clips:a.clips,animatedClips:a.animatedClips,combatView:a.combatView||'legacy-unreviewed'}])),
  stageEntries:Object.fromEntries(Object.entries(STAGE_BITMAPS).map(([id,a])=>[id,{entrySHA256:jsonHash(a),frames:stageBitmapRooms(a).flatMap(room=>room.layers.flatMap(l=>l.frames)).map(f=>({path:f.path,sha256:f.sha256}))}]))};
await mkdir(resolve(root,'docs/production/vague24'),{recursive:true});
await writeFile(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({out,baseCommit:result.baseCommit,protectedFiles:protectedFiles.length,coverage:result.coverage}));

