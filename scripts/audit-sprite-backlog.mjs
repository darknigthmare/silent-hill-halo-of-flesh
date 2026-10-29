import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export function auditSpriteCoverage(report) {
  if (!Array.isArray(report?.entries)) throw new Error('Sprite coverage entries missing');
  const rows = report.entries.map(e => {
    const frames = Number.isSafeInteger(e.frames) && e.frames >= 0 ? e.frames : 0;
    const animated = Number.isSafeInteger(e.animatedClips) && e.animatedClips >= 0 ? e.animatedClips : 0;
    const priority = animated > 0 ? 'P0-validate-animation' : frames > 0 ? 'P1-author-animation' : 'P2-import-sprites';
    return {id:e.id,name:e.name,source:e.source,frames,animated,
      missingPresentations:Array.isArray(e.presentations?.missing)?e.presentations.missing.length:null,
      fidelity:e.fidelity,priority};
  });
  rows.sort((a,b)=>a.priority.localeCompare(b.priority)||b.frames-a.frames||a.id.localeCompare(b.id));
  return {summary:{total:rows.length,illustrated:rows.filter(r=>r.frames>0).length,
    missing:rows.filter(r=>r.frames===0).length,animatedClips:rows.reduce((n,r)=>n+r.animated,0),
    certified:rows.filter(r=>r.fidelity==='verified').length},rows};
}

export function markdownSpriteAudit(result) {
  const s=result.summary;
  const lines=['# Animation production backlog','',
    'Generated from data/sprite-coverage.json. A declared animated clip does not certify visual fidelity.','',
    '**'+s.total+' profiles / '+s.illustrated+' illustrated / '+s.missing+' without art / '+s.animatedClips+' animated clips / '+s.certified+' certified.**','',
    '| Priority | ID | Name | Source | Frames | Animated clips | Missing presentations | Fidelity |',
    '|---|---|---|---|---:|---:|---:|---|'];
  for (const r of result.rows) lines.push('| '+[r.priority,r.id,String(r.name).replaceAll('|','/'),r.source,r.frames,r.animated,r.missingPresentations??'unknown',r.fidelity].join(' | ')+' |');
  return lines.join('\n')+'\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data=JSON.parse(readFileSync(new URL('../data/sprite-coverage.json',import.meta.url),'utf8'));
  const result=auditSpriteCoverage(data);
  process.stdout.write(process.argv.includes('--json')?JSON.stringify(result,null,2)+'\n':markdownSpriteAudit(result));
}
