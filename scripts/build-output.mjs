/** Resolve an explicit disposable build directory before any destructive step. */
import {createHash} from 'node:crypto';
import {lstat,readdir,readFile,realpath} from 'node:fs/promises';
import {homedir,tmpdir} from 'node:os';
import {basename,dirname,isAbsolute,join,parse,relative,resolve,sep} from 'node:path';

const BUILD_PROJECT='SILENT HILL: HALO OF FLESH';
const within=(root,path)=>{const rel=relative(root,path);return rel===''||(!rel.startsWith('..'+sep)&&rel!=='..'&&!isAbsolute(rel));};
async function info(path){try{return await lstat(path);}catch(error){if(error.code==='ENOENT')return null;throw error;}}
async function canonicalCandidate(path){
  const tail=[];let current=path;
  while(!(await info(current))){const parent=dirname(current);if(parent===current)throw Error('No existing output ancestor');tail.unshift(basename(current));current=parent;}
  return resolve(await realpath(current),...tail);
}
export function outputArgument(args){
  const options=args.filter(arg=>arg==='--out-dir'||arg.startsWith('--out-dir='));
  if(options.length>1)throw Error('Only one --out-dir is allowed');
  if(!options.length)return null;
  if(!options[0].startsWith('--out-dir=')||!options[0].slice(10).trim())throw Error('Use --out-dir=/absolute/disposable-build-path');
  return options[0].slice(10);
}
export async function resolveBuildOutput(args,project,{requireExistingBuild=false}={}){
  const explicit=outputArgument(args),projectPath=resolve(project),projectReal=await realpath(projectPath);
  const normal=join(projectPath,'dist'),normalReal=join(projectReal,'dist');
  const requested=explicit===null?normal:resolve(projectPath,explicit),entry=await info(requested);
  if(entry?.isSymbolicLink())throw Error('Build output cannot be a symbolic link');
  if(entry&&!entry.isDirectory())throw Error('Build output must be a directory');
  const path=await canonicalCandidate(requested),external=requested!==normal;
  // Check lexical and real paths: a symlinked parent must not redirect a
  // disposable directory to the project, its parents, or any source subtree.
  if(requested===parse(requested).root||path===parse(path).root||within(requested,projectPath)||within(path,projectReal))
    throw Error('Build output cannot be the project, its ancestor, or a filesystem root');
  if((within(projectPath,requested)&&requested!==normal)||(within(projectReal,path)&&path!==normalReal))
    throw Error('Build output cannot replace a project source directory');
  if(!external&&path!==normalReal)throw Error('Default dist cannot redirect outside the project');
  const protectedRoots=await Promise.all([tmpdir(),homedir()].map(async value=>canonicalCandidate(resolve(value))));
  if(protectedRoots.includes(path))throw Error('Build output must be a dedicated directory, not a shared root');
  const owner=createHash('sha256').update('halo-static-build-v1\0'+projectReal).digest('hex');
  if(external&&entry){
    const entries=await readdir(path);
    if(entries.length||requireExistingBuild){
      let manifest;
      try{manifest=JSON.parse(await readFile(join(path,'build-manifest.json'),'utf8'));}
      catch{throw Error('Refusing an existing external directory without this project build manifest');}
      if(manifest.project!==BUILD_PROJECT||manifest.outputOwner!==owner||!Array.isArray(manifest.files))
        throw Error('Refusing an external directory not owned by this project build');
    }
  }
  if(requireExistingBuild&&!entry)throw Error('The external build does not exist');
  return {path,external,owner};
}
