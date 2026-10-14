import {readFile} from 'node:fs/promises';
const config=JSON.parse(await readFile(new URL('../release/readiness.json',import.meta.url),'utf8'));
const unresolved=config.gates.filter(g=>g.status!=='approved'||!g.evidence);
console.log(JSON.stringify({version:config.version,commercialReady:config.commercialAuthorized===true&&unresolved.length===0,unresolved},null,2));
// This reports documented readiness; it is not an automated legal approval.
if(config.commercialAuthorized!==true||unresolved.length)process.exitCode=2;
