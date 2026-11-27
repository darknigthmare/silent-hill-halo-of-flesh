import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import {tmpdir,homedir} from 'node:os';
import {join,parse} from 'node:path';
import {outputArgument,resolveBuildOutput} from '../scripts/build-output.mjs';

const fixtures=[];
afterEach(async()=>{for(const path of fixtures.splice(0))await rm(path,{recursive:true,force:true});});
async function fixture(){const base=await mkdtemp(join(tmpdir(),'halo-output-safety-'));fixtures.push(base);const project=join(base,'project');await mkdir(join(project,'src'),{recursive:true});await writeFile(join(project,'src','keep.js'),'source');return {base,project};}

test('default output remains the existing project dist and external output starts empty',async()=>{
  const {base,project}=await fixture(),standard=await resolveBuildOutput([],project),external=await resolveBuildOutput(['--out-dir='+join(base,'qa-build')],project);
  assert.equal(standard.path,join(project,'dist'));assert.equal(standard.external,false);
  assert.equal(external.path,join(base,'qa-build'));assert.equal(external.external,true);
  assert.match(external.owner,/^[0-9a-f]{64}$/);
  await assert.rejects(resolveBuildOutput(['--out-dir='+external.path],project,{requireExistingBuild:true}),/does not exist/);
});

test('root, project, ancestors, source descendants and shared temp/home roots are refused without touching source',async()=>{
  const {base,project}=await fixture();
  for(const output of [parse(project).root,base,project,join(project,'src'),join(project,'src','nested'),tmpdir(),homedir()])
    await assert.rejects(resolveBuildOutput(['--out-dir='+output],project),/cannot|dedicated/);
  assert.equal(await readFile(join(project,'src','keep.js'),'utf8'),'source');
});

test('a populated external directory requires a matching build owner before replacement or serving',async()=>{
  const {base,project}=await fixture(),path=join(base,'output');await mkdir(path);await writeFile(join(path,'user-file.txt'),'retain');
  await assert.rejects(resolveBuildOutput(['--out-dir='+path],project),/without this project build manifest/);
  await writeFile(join(path,'build-manifest.json'),JSON.stringify({project:'SILENT HILL: HALO OF FLESH',outputOwner:'wrong',files:[]}));
  await assert.rejects(resolveBuildOutput(['--out-dir='+path],project),/not owned/);
  assert.equal(await readFile(join(path,'user-file.txt'),'utf8'),'retain');
});

test('a previous external build is reusable only by the same canonical project',async()=>{
  const {base,project}=await fixture(),path=join(base,'qa-build'),initial=await resolveBuildOutput(['--out-dir='+path],project);await mkdir(path);
  await writeFile(join(path,'build-manifest.json'),JSON.stringify({project:'SILENT HILL: HALO OF FLESH',outputOwner:initial.owner,files:[]}));
  assert.deepEqual(await resolveBuildOutput(['--out-dir='+path],project,{requireExistingBuild:true}),initial);
  const other=join(base,'other-project');await mkdir(other);
  await assert.rejects(resolveBuildOutput(['--out-dir='+path],other),/not owned/);
});

test('direct symlinks and symlinked parents cannot redirect a disposable build to source',async()=>{
  const {base,project}=await fixture();await symlink(join(project,'src'),join(base,'source-link'),'dir');
  await assert.rejects(resolveBuildOutput(['--out-dir='+join(base,'source-link')],project),/symbolic link/);
  await assert.rejects(resolveBuildOutput(['--out-dir='+join(base,'source-link','nested')],project),/source directory/);
  await symlink(join(project,'src'),join(project,'dist'),'dir');
  await assert.rejects(resolveBuildOutput([],project),/symbolic link/);
  assert.equal(await readFile(join(project,'src','keep.js'),'utf8'),'source');
});

test('output parsing rejects empty, ambiguous and repeated destructive destinations',()=>{
  assert.equal(outputArgument([]),null);assert.equal(outputArgument(['--out-dir=/tmp/example']),'/tmp/example');
  for(const args of [['--out-dir'],['--out-dir='],['--out-dir= '],['--out-dir=a','--out-dir=b']])assert.throws(()=>outputArgument(args));
});
