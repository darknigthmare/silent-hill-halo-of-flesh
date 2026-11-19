/** Build the companion workbook and stage register from the reviewed corpus.
 * Run an exact copy from an OS temporary directory with @oai/artifact-tool installed.
 * --root=/checkout --input=/prepared-input.json --output=/absolute/output-directory
 * Existing production workbooks and runtime data are read only.
 */
import fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const progress=step=>console.log(JSON.stringify({step,memoryMiB:Math.round(process.memoryUsage().rss/1024/1024)}));
progress('loading-artifact-tool');
const {Workbook,SpreadsheetFile}=await import('@oai/artifact-tool');
progress('artifact-tool-loaded');

const arg=name=>process.argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3);
if(!arg('root')||!arg('input')||!arg('output'))throw Error('Explicit --root, --input and --output are required.');
const root=resolve(arg('root')),out=resolve(arg('output'));
await fs.mkdir(out,{recursive:true});
const corpusPath=join(root,'docs/production/franchise-corpus.json');
const corpus=JSON.parse(await fs.readFile(corpusPath,'utf8'));
const inputBytes=await fs.readFile(resolve(arg('input'))),prepared=JSON.parse(inputBytes);
const {stageIds,sourceMeta,fighterIds,stageRows}=prepared;
const hash=b=>createHash('sha256').update(b).digest('hex');
const originalWorkbook='docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx';
const sourcePaths=prepared.sourcePaths;
const hashes=Object.fromEntries(await Promise.all(sourcePaths.map(async p=>[p,hash(await fs.readFile(join(root,p)))])));
if(JSON.stringify(hashes)!==JSON.stringify(prepared.sourceHashes))throw Error('Prepared runtime snapshot is stale.');
if(hashes[originalWorkbook]!==corpus.localEvidence.workbookSHA256)throw Error('Historical workbook changed.');
if(new Set(corpus.records.map(r=>r.id)).size!==corpus.records.length)throw Error('Duplicate corpus IDs.');
if(Object.keys(sourceMeta).length!==16||stageIds.length!==123)throw Error('Unexpected runtime catalogue.');
for(const r of corpus.records){
  if(!r.title||!r.sourceUrls?.length||!r.nextAction)throw Error('Incomplete corpus record: '+r.id);
  for(const url of r.sourceUrls)if(!/^https?:\/\//.test(url))throw Error('Invalid source URL: '+r.id);
  for(const id of r.runtimeSourceIds)if(!Object.hasOwn(sourceMeta,id))throw Error('Unknown runtime source: '+id);
  for(const id of r.runtimeProfileIds||[])if(!fighterIds.includes(id))throw Error('Unknown runtime profile: '+id);
  for(const id of r.runtimeStageIds||[])if(!stageIds.includes(id))throw Error('Unknown runtime stage: '+id);
}

const categories={game:'Jeu',mobile_game:'Jeu mobile',remake:'Remake',additional_scenario:'Scénario additionnel',game_dlc:'Extension',playable_teaser:'Teaser jouable',interactive_series:'Série interactive',film:'Film',compilation_remaster:'Compilation / remaster',compilation:'Coffret / compilation',multimedia_collection:'Collection multimédia',announced_remake:'Remake annoncé',cancelled_game:'Jeu annulé',licensed_comic:'Bande dessinée',digital_comic:'Bande dessinée numérique',mobile_manga:'Manga mobile',bonus_comic:'Bande dessinée bonus',unreleased_comic:'Projet de BD inédit',novelization:'Roman',promotional_broadcast:'Présentation officielle',publisher_broadcast:'Émission éditeur',licensed_crossover:'Collaboration',licensed_machine:'Machine sous licence',reference_book:'Ouvrage de référence',documentary_video:'Documentaire',documentary:'Documentaire',art_dvd:'DVD artistique',documentary_collection:'Collection documentaire',documentary_dvd:'DVD documentaire',official_guide:'Guide officiel'};
Object.assign(categories,{game_compilation:'Coffret de jeux',documentary_multimedia:'DVD documentaire',making_of_documentary:'Documentaire de fabrication',promotional_crossover_game:'Mini-jeu de collaboration'});
const statuses={published:'Publié','published-then-delisted':'Publié puis retiré','announced-in-development':'Annoncé / en développement',cancelled:'Annulé','unreleased-cancelled':'Inédit / annulé','broadcast-series':'Programme de diffusions','published-manufacturer-catalogue':'Au catalogue fabricant'};
const coverage={covered:'Déjà couvert','covered-within-aggregate':'Couvert dans un groupe','partially-covered':'Partiellement couvert',absent:'Absent','absent-as-programme':'Programme absent','edition-not-indexed':'Édition non indexée','mentioned-only':'Mention seule'};
const eligibility={'existing-corpus-only':'Corpus existant, règles conservées','not-established-by-this-audit':'Références de production à relever','not-a-fictional-game-or-location':'Programme documentaire','separate-crossover-reference-required':'Collaboration à étudier séparément','licensed-machine-only':'Machine sous licence uniquement','documentary-only':'Support documentaire uniquement'};
Object.assign(eligibility,{'reference-material-only':'Support documentaire uniquement','crossover-documentary-only':'Mini-jeu à étudier séparément'});
const evidence={'primary-confirmed':'Source primaire','primary-announcement':'Annonce primaire','primary-publisher-confirmed':'Éditeur','primary-manufacturer-confirmed':'Fabricant','primary-developer-announcement':'Développeur','primary-announcement-and-publication-corroboration':'Annonce + publication corroborée','bibliographic-and-specialist':'Bibliographie + archive spécialisée','bibliographic-corroborated':'Bibliographie corroborée','contemporary-press-and-republished-official-release':'Presse + communiqué reproduit','contemporary-press-and-specialist':'Presse contemporaine + archive','secondary-corroborated':'Sources secondaires croisées','secondary-documented':'Archive spécialisée','secondary-documented-primary-booklet-needed':'Archive ; livret à examiner','secondary-documented-primary-content-needed':'Archive ; contenu à examiner','publisher-statement-reported':'Déclaration éditeur rapportée','existing-corpus-and-reference-chronology':'Corpus existant + chronologie',documented:'Documenté'};
const label=(map,key)=>map[key]||key.replaceAll('_',' ').replaceAll('-',' ');
const missingBefore=r=>['absent','absent-as-programme'].includes(r.coverageStatus);
const tally=key=>Object.fromEntries([...new Set(corpus.records.map(r=>r[key]))].map(v=>[v,corpus.records.filter(r=>r[key]===v).length]));
const activeCount=stageRows.filter(s=>s.bitmap==='Actif').length,blockedCount=stageRows.filter(s=>s.reference==='Bloquée').length;
const openMissing=stageRows.filter(s=>s.bitmap==='Absent'&&s.reference==='Ouverte').length;

const wb=Workbook.create(),cs=wb.worksheets.add('Corpus'),ss=wb.worksheets.add('Stages');
progress('workbook-created');
const bodyStart=9,headerRow=8;
const palette={ink:'#262B29',head:'#353B36',muted:'#66706A',line:'#D4D9D4',amber:'#FFF0CB',red:'#F5DFDE',green:'#E4EDE4'};
function base(sheet,columns,last,title,note){
  progress('format-base-'+sheet.name);
  sheet.showGridLines=false;sheet.tabColor=palette.head;
  const lastCol=String.fromCharCode(64+columns.length);
  sheet.getRange(`A1:${lastCol}${last}`).format={font:{name:'Arial',size:10,color:palette.ink},verticalAlignment:'center',rowHeight:19};
  progress('base-format-set-'+sheet.name);
  sheet.getRange('A2').values=[[title]];sheet.getRange('A2').format.font={name:'Arial',size:14,bold:true,color:palette.ink};
  sheet.getRange(`A3:${lastCol}3`).format.borders={bottom:{style:'thin',color:palette.line}};
  sheet.getRange('A6').values=[[note]];sheet.getRange('A6').format.font={name:'Arial',size:10,italic:true,color:palette.muted};
  for(const [i,width] of columns.entries())sheet.getRange(`${String.fromCharCode(65+i)}1:${String.fromCharCode(65+i)}${last}`).format.columnWidth=width;
  progress('column-widths-set-'+sheet.name);
  sheet.freezePanes.freezeRows(headerRow);sheet.freezePanes.freezeColumns(2);
}
const cLast=headerRow+corpus.records.length,sLast=headerRow+stageRows.length;
const cWidths=[30,42,25,10,25,23,24,22,67,72,68,32,35],sWidths=[27,39,31,14,15,36,67,48,72,78];
base(cs,cWidths,cLast,'SILENT HILL — CORPUS DE LA BIBLE','État au 19 novembre 2026 · « Couverture avant ajout » décrit le point de départ de cette passe.');
base(ss,sWidths,sLast,'SILENT HILL — STAGES ET ABSENCES','État au 19 novembre 2026 · bitmap présent ≠ animation ou fidélité 1:1 validée.');
cs.getRange('A4').values=[['Entrées documentées']];cs.getRange('B4').formulas=[[`=COUNTA(A${bodyStart}:A${cLast})`]];
cs.getRange('D4').values=[['Absents']];cs.getRange('E4').formulas=[[`=COUNTIF(G${bodyStart}:G${cLast},"Absent")+COUNTIF(G${bodyStart}:G${cLast},"Programme absent")`]];
cs.getRange('G4').values=[['Programmes officiels']];cs.getRange('H4').formulas=[[`=COUNTIF(C${bodyStart}:C${cLast},"Présentation officielle")+COUNTIF(C${bodyStart}:C${cLast},"Émission éditeur")`]];
cs.getRange('A5').values=[['Sources du moteur']];cs.getRange('B5').values=[[Object.keys(sourceMeta).length]];
cs.getRange('D5').values=[['Statut']];cs.getRange('E5').values=[['Fiches indexées']];
const cHeaders=['Identifiant','Œuvre / édition','Catégorie','Année','Publication','Groupe moteur','Couverture avant ajout','Preuve','Prochaine action','Sources URL','Alias et notes','Date / précision','Usage en production'];
cs.getRange(`A${headerRow}:M${headerRow}`).values=[cHeaders];
cs.getRange(`A${bodyStart}:M${cLast}`).values=corpus.records.map(r=>[r.id,r.title,label(categories,r.category),r.releaseYear,label(statuses,r.releaseStatus),r.runtimeSourceIds.join(', ')||'Dossier documentaire',label(coverage,r.coverageStatus),label(evidence,r.evidenceStatus),r.nextAction,r.sourceUrls.join('\n'),[r.aliases.length?'Alias : '+r.aliases.join(' ; '):'',...(r.notes||[])].filter(Boolean).join('\n'),r.releaseDate||((r.targetedReleaseYear?'Cible annoncée : '+r.targetedReleaseYear+' ; ':'')+(r.announcedYear?'annonce : '+r.announcedYear:''))||'Date précise non renseignée',label(eligibility,r.generationEligibility)]);
cs.getRange(`D${bodyStart}:D${cLast}`).setNumberFormat('0');
ss.getRange('A4').values=[['Bitmap actif']];ss.getRange('B4').formulas=[[`=COUNTIF(D${bodyStart}:D${sLast},"Actif")`]];
ss.getRange('D4').values=[['À produire']];ss.getRange('E4').formulas=[[`=COUNTIFS(D${bodyStart}:D${sLast},"Absent",E${bodyStart}:E${sLast},"Ouverte")`]];
ss.getRange('G4').values=[['Référence bloquée']];ss.getRange('H4').formulas=[[`=COUNTIF(E${bodyStart}:E${sLast},"Bloquée")`]];
ss.getRange('A5').values=[['Lieux du catalogue']];ss.getRange('B5').formulas=[[`=COUNTA(A${bodyStart}:A${sLast})`]];
ss.getRange('G5').values=[['Sources locales : data.js, production-reference.js et stage-bitmap-manifest.js']];
ss.getRange(`A${headerRow}:J${headerRow}`).values=[['Identifiant','Lieu','Œuvre','Bitmap','Référence','Scène / phase du moteur','Prochaine action','Références documentaires','Sources URL','PNG actifs / note du lieu']];
ss.getRange(`A${bodyStart}:J${sLast}`).values=stageRows.map(s=>[s.id,s.name,s.sourceLabel,s.bitmap,s.reference,s.scene,s.action,s.referenceIds.join('\n'),s.sourceUrls.join('\n'),[s.note,...s.paths].filter(Boolean).join('\n')]);
progress('values-written');
for(const [sheet,last,col,tableName] of [[cs,cLast,'M','CorpusSilentHill'],[ss,sLast,'J','StagesSilentHill']]){
  const table=sheet.tables.add(`A${headerRow}:${col}${last}`,true,tableName);
  table.style='TableStyleLight1';
  table.showFilterButton=true;
  const header=sheet.getRange(`A${headerRow}:${col}${headerRow}`);header.format={fill:palette.head,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,horizontalAlignment:'center',verticalAlignment:'center',rowHeight:32,borders:{insideVertical:{style:'thin',color:'#FFFFFF'}}};
  sheet.getRange(`A${bodyStart}:${col}${last}`).format.wrapText=true;
  sheet.getRange(`A${bodyStart}:${col}${last}`).format.verticalAlignment='top';
  sheet.getRange(`A${bodyStart}:${col}${last}`).format.rowHeight=49;
  for(const address of ['B4','E4','H4','B5'])sheet.getRange(address).format.font={name:'Arial',size:10,bold:true,color:palette.ink};
}
// Count explicit line breaks as well as wrapping. Wide Japanese glyphs need
// additional room; a fixed height cap could hide source notes in long records.
const textLines=(value,width)=>String(value??'').split('\n').reduce((total,line)=>{
  const units=[...line].reduce((n,ch)=>n+(/[\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff\uff01-\uff60]/u.test(ch)?2:1),0);
  return total+Math.max(1,Math.ceil(units/(width*0.9)));
},0);
for(const [sheet,last,col,widths] of [[cs,cLast,'M',cWidths],[ss,sLast,'J',sWidths]]){
  const rows=sheet.getRange(`A${bodyStart}:${col}${last}`).values;
  for(let i=0;i<rows.length;i++){
    const lines=Math.max(...rows[i].map((value,column)=>textLines(value,widths[column])));
    sheet.getRange(`A${bodyStart+i}:${col}${bodyStart+i}`).format.rowHeight=Math.max(28,lines*13+10);
  }
}
cs.getRange(`G${bodyStart}:G${cLast}`).conditionalFormats.add('containsText',{text:'Absent',format:{fill:palette.amber}});
cs.getRange(`E${bodyStart}:E${cLast}`).conditionalFormats.add('containsText',{text:'Annulé',format:{fill:palette.red}});
ss.getRange(`D${bodyStart}:D${sLast}`).dataValidation={rule:{type:'list',values:['Actif','Absent']}};
ss.getRange(`E${bodyStart}:E${sLast}`).dataValidation={rule:{type:'list',values:['Ouverte','Bloquée']}};
ss.getRange(`D${bodyStart}:D${sLast}`).conditionalFormats.add('containsText',{text:'Absent',format:{fill:palette.amber}});
ss.getRange(`E${bodyStart}:E${sLast}`).conditionalFormats.add('containsText',{text:'Bloquée',format:{fill:palette.red}});
cs.getRange(`J${bodyStart}:J${cLast}`).format.font={name:'Arial',size:10,color:'#245A84'};
ss.getRange(`I${bodyStart}:I${sLast}`).format.font={name:'Arial',size:10,color:'#245A84'};
wb.recalculate();
progress('formatted-and-recalculated');
const value=(sheet,cell)=>sheet.getRange(cell).values[0][0];
const assert=(ok,message)=>{if(!ok)throw Error(message);};
assert(value(cs,'B4')===corpus.records.length,'Corpus count formula');
assert(value(cs,'E4')===corpus.records.filter(missingBefore).length,'Prior omissions formula');
assert(value(ss,'B4')===activeCount&&value(ss,'E4')===openMissing&&value(ss,'H4')===blockedCount&&value(ss,'B5')===stageIds.length,'Stage count formulas');
const originalId=cs.getRange('A9').values;cs.getRange('A9').values=[[null]];wb.recalculate();
assert(value(cs,'B4')===corpus.records.length-1,'Corpus live recalculation');cs.getRange('A9').values=originalId;
const activeRow=bodyStart+stageRows.findIndex(s=>s.bitmap==='Actif');
ss.getRange(`D${activeRow}`).values=[['Absent']];wb.recalculate();assert(value(ss,'B4')===activeCount-1&&value(ss,'E4')===openMissing+1,'Stage live recalculation');
ss.getRange(`D${activeRow}`).values=[['Actif']];wb.recalculate();
assert(value(cs,'B4')===corpus.records.length&&value(ss,'B4')===activeCount&&value(ss,'E4')===openMissing,'Restored formula results');
const excelError=/^#(?:REF!|DIV\/0!|VALUE!|N\/A|NAME\?|NUM!|SPILL!|CALC!|NULL!)/;
for(const [sheet,last,col] of [[cs,cLast,'M'],[ss,sLast,'J']])for(const row of sheet.getRange(`A1:${col}${last}`).values)for(const cell of row)assert(!(typeof cell==='string'&&excelError.test(cell)),'Spreadsheet formula error');
const inspect=await wb.inspect({kind:'workbook,sheet,table',maxChars:8000,tableMaxRows:3,tableMaxCols:6,tableMaxCellChars:80});
await fs.writeFile(join(out,'workbook-inspection.json'),JSON.stringify(inspect,null,2)+'\n');
await fs.writeFile(join(out,'workbook-formulas.json'),JSON.stringify(await wb.inspect({kind:'formula',maxChars:6000,options:{maxResults:30}}),null,2)+'\n');
progress('formula-checks-passed');
global.gc?.();
const xlsxPath=join(out,'SILENT_HILL_CORPUS_BIBLE.xlsx');
await(await SpreadsheetFile.exportXlsx(wb)).save(xlsxPath);
progress('xlsx-exported');
for(const [p,sha]of Object.entries(hashes))assert(hash(await fs.readFile(join(root,p)))===sha,'Source changed: '+p);
const report={schemaVersion:1,asOf:corpus.asOf,createdAt:new Date().toISOString(),authoring:'@oai/artifact-tool JavaScript',builderSHA256:hash(await fs.readFile(new URL(import.meta.url))),sourceHashes:hashes,preparedInputSHA256:hash(inputBytes),preparerSHA256:prepared.preparerSHA256,historicalWorkbookUnmodified:true,corpusRecords:corpus.records.length,previousCoverage:tally('coverageStatus'),categories:tally('category'),runtimeSourceCount:Object.keys(sourceMeta).length,stages:{total:stageIds.length,bitmapActive:activeCount,missing:stageIds.length-activeCount,missingUnblocked:openMissing,referenceBlocked:blockedCount},worksheets:['Corpus','Stages'],nativeTables:2,formulaChecks:'passed',representativeEditRecalculation:'passed-and-restored',exportReadback:'pending-separate-process',formulaErrors:0,visualReview:'pending',xlsx:{path:xlsxPath,bytes:(await fs.stat(xlsxPath)).size,sha256:hash(await fs.readFile(xlsxPath))}};
await fs.writeFile(join(out,'workbook-verification.json'),JSON.stringify(report,null,2)+'\n');
await fs.writeFile(join(out,'stage-register.json'),JSON.stringify({asOf:corpus.asOf,sourceHashes:hashes,stages:stageRows},null,2)+'\n');
console.log(JSON.stringify(report,null,2));
