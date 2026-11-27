/** Preserve only wave30 rendered evidence in logs for review when the local executor is unavailable. */
import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const roots=['tests/http-wave30-characters','tests/http-wave30-projectiles','tests/http-wave30-stages','tests/http-wave30-story'];
async function walk(path){let rows;try{rows=await readdir(path,{withFileTypes:true});}catch(error){if(error.code==='ENOENT')return [];throw error;}const out=[];for(const row of rows){const name=path+'/'+row.name;if(row.isDirectory())out.push(...await walk(name));else if(/\.(png|json)$/.test(name))out.push(name);}return out;}
let files=0;
for(const root of roots)for(const path of await walk(root)){
 const bytes=await readFile(path),content=bytes.toString('base64'),chunks=Math.ceil(content.length/48000);
 const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),sha256=createHash('sha256').update(bytes).digest('hex');
 console.log('V30_REVIEW_FILE '+JSON.stringify({path,bytes:bytes.length,sha,sha256,chunks}));
 for(let index=0;index<chunks;index++)console.log('V30_REVIEW_CHUNK '+JSON.stringify({path,index,data:content.slice(index*48000,(index+1)*48000)}));
 files++;
}
console.log('V30_REVIEW_END '+JSON.stringify({files}));
