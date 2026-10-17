/** Rebuild the phase-one XLSX from production-plan.json using the primary artifact runtime. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';

const input=process.argv[2];
const out=process.argv[3];
if(!input||!out)throw new Error('Usage: build-workbook.mjs production-plan.json output-directory');
const planBytes=await fs.readFile(input,'utf8');
const plan=JSON.parse(planBytes);
const planSha256=createHash('sha256').update(planBytes).digest('hex');
await fs.mkdir(out,{recursive:true});
const wb=Workbook.create();
const C={ink:'#2B2927',brand:'#5B292A',muted:'#756C62',paper:'#F7F4EF',line:'#D5CCC1',amber:'#FFF0CD',red:'#FBE1DE',green:'#E4EEE5'};
const font={name:'Arial',size:10,color:C.ink};
const statusOptions=['À référencer','Rôle à décider','À produire','À faire','En cours','À tester','Validé'];
const roleLabels={'combatant':'Combattant','stationary-boss':'Boss fixe','multi-body':'Plusieurs corps','scripted-encounter':'Rencontre scriptée','environmental-obstacle':'Obstacle du décor','noncombatant':'Non-combattant','unverified':'Rôle à vérifier'};
const colName=n=>{let s='';for(n++;n>0;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
const scalar=v=>v===true?'Oui':v===false?'Non':v==null?'':typeof v==='string'||typeof v==='number'?v:Array.isArray(v)?v.join(', '):JSON.stringify(v);
const defs=[
 {name:'Combattants',key:'fighters',title:'Combattants et fidélité',subtitle:'Chaque ID conserve son œuvre, ses contraintes et son état réel de production.',cols:[
  ['id','ID combattant',38],['name','Combattant',28],['source','Pack',14],['edition','Édition de référence',38],['sourceYear','Année catalogue',15],['baseId','Variante / base',38],['category','Catégorie actuelle',18],['boss','Boss actuel',12],['targetRole','Rôle à respecter',26],['identityStatus','Statut documenté',28],['identityNote','Décision de fidélité',65],['constraints','Contraintes à respecter',72],['currentEvidence','Mention du dépôt',25],['observationIds','Gestes de référence',44],['documentedActions','Gestes référencés',16],['currentMoves','Slots actuels',14],['currentFinishers','Finishers actuels',16],['artState','Images actuelles',33],['animatedClips','Clips animés',14],['oneToOneValidated','Fidélité 1:1 validée',17],['productionStatus','État de production',23],['referenceIds','Sources',32]]},
 {name:'Mouvements',key:'moves',title:'Mouvements, techniques et supers',subtitle:'Actuel = paramètres du moteur v0.9.5 à 60 Hz. Cible = travail à réaliser après cette phase.',cols:[
  ['id','ID mouvement',44],['name','Combattant',28],['source','Pack',14],['edition','Édition',34],['key','Slot moteur',22],['category','Type',22],['input','Commande',18],['currentName','Nom actuel',48],['currentClaim','Mention actuelle du dépôt',28],['canonicalVerification','Validation du geste actuel',30],['proposalName','Nom proposé',42],['target','Cible / révision attendue',75],['proposalStatus','Nature de la proposition',31],['observationIds','Gestes à consulter',44],['startup','Préparation (ticks)',17],['active','Actif (ticks)',14],['recovery','Récupération (ticks)',19],['damage','Dégâts moteur',15],['reach','Portée moteur',15],['meterCost','Coût jauge',14],['hits','Impacts',12],['projectile','Projectile actuel',17],['effect','Effet actuel',18],['cancelInto','Annulations actuelles',38],['clipStatus','Clip actuel',27],['sourceFrameRate','FPS source à relever',18],['sourceStart','Début source à relever',20],['sourceImpact','Impact source à relever',20],['sourceEnd','Fin source à relever',20],['productionStatus','État de production',23],['referenceIds','Sources',32]]},
 {name:'Finishers',key:'finishers',title:'Finishers de personnages et d’arènes',subtitle:'Adaptations de lore à préparer. Déclenchement final distinct d’une simple fin de manche.',cols:[
  ['id','ID finisher',46],['name','Combattant / arène',30],['source','Pack',14],['entityType','Origine',18],['edition','Édition',34],['type','Variante',18],['currentName','Nom actuel',50],['currentSequence','Séquence actuelle',50],['proposalName','Nom proposé',45],['description','Séquence cible',85],['status','Fidélité / nature',33],['basis','Base de la proposition',50],['trigger','Déclenchement prévu',65],['actorTracks','Pistes à produire',52],['existing','État technique actuel',52],['productionStatus','État de production',23],['referenceIds','Sources',32]]},
 {name:'Présentations',key:'presentations',title:'Intros, poses de manche et sorties',subtitle:'Première manche, résultat définitif et sortie de scène possèdent chacun leur fiche.',cols:[
  ['id','ID séquence',46],['name','Combattant',28],['source','Pack',14],['edition','Édition',34],['type','Séquence',29],['proposalName','Nom proposé',43],['description','Chorégraphie proposée',86],['status','Fidélité / nature',33],['basis','Base de la proposition',50],['trigger','Déclenchement prévu',55],['continuity','Continuité entre manches',65],['engineState','Intégration à prévoir',47],['productionStatus','État de production',23],['referenceIds','Sources',32]]},
 {name:'Clips',key:'poses',title:'Clips de locomotion et de réaction',subtitle:'Les clips d’attaque sont dans Mouvements. Ici : dix états de base par profil.',cols:[
  ['id','ID clip',46],['name','Combattant',28],['source','Pack',14],['edition','Édition',34],['pose','État moteur',18],['label','Fonction',28],['description','Travail d’animation attendu',88],['status','Nature',36],['existing','État actuel',47],['spriteFormat','Format des images',64],['qa','Critères visuels',73],['productionStatus','État de production',23],['referenceIds','Sources',32]]},
 {name:'Arènes',key:'stages',title:'Arènes et contraintes de lieu',subtitle:'Un lieu référencé ne rend pas automatiquement canoniques les dangers créés pour le versus.',cols:[
  ['id','ID arène',33],['name','Arène',34],['source','Pack',14],['game','Œuvre',38],['locationStatus','État de la référence',30],['locationNote','Décision de fidélité',88],['currentStatus','Mention du dépôt',27],['family','Famille',20],['weather','Météo actuelle',18],['props','Accessoires actuels',40],['layers','Couches actuelles',52],['terrain','Sol moteur',22],['shift','Transformation moteur',26],['tracks','Boucles',12],['events','Événements',14],['interactions','Interactions',15],['hazards','Dangers',12],['productionStatus','État de production',23],['referenceIds','Sources',32]]},
 {name:'Animations arènes',key:'stageAnimations',title:'Animations et événements des arènes',subtitle:'Boucles, transformations, dangers, interactions et nouvelles propositions sont identifiés séparément.',cols:[
  ['id','ID piste / événement',50],['name','Arène',34],['source','Pack',14],['type','Type',25],['animationName','Animation / événement',44],['existing','État actuel',39],['trigger','Déclenchement / durée',50],['layer','Couche',26],['description','Travail attendu',90],['status','Fidélité / nature',38],['productionStatus','État de production',23],['referenceIds','Sources',32]]},
 {name:'Actions',key:'tasks',title:'Travaux à réaliser après la phase 1',subtitle:'P0 : identité, rôle ou règle bloquante. P1 : production principale. P2 : présentation et enrichissement.',cols:[
  ['id','ID tâche',45],['entityId','ID concerné',38],['entityType','Domaine',20],['priority','Priorité',12],['title','Travail',42],['reason','Constat',82],['acceptance','Critère de livraison',87],['status','État',23],['owner','Responsable',24],['delivery','Livraison prévue',24],['referenceIds','Sources',32]]},
 {name:'Gestes référencés',key:'observations',title:'Gestes et comportements référencés',subtitle:'Descriptions courtes et sources explicites. Aucune animation n’est déclarée validée image par image.',cols:[
  ['id','ID référence geste',45],['name','Geste / comportement',38],['fighterId','ID combattant',39],['source','Pack',14],['edition','Édition',37],['description','Comportement documenté',88],['status','Niveau de référence',36],['sourceTiming','Mesure des timings',35],['referenceIds','Sources',35]]},
 {name:'Sources',key:'sources',title:'Sources et portée des références',subtitle:'Chaque source indique ce qu’elle permet d’établir. Une page de bestiaire ne certifie pas des timings ou un clip.',cols:[
  ['id','ID source',30],['title','Titre',60],['type','Type de source',28],['scope','Ce que la source étaye',88],['caveat','Limite de la source',83],['consultedAt','Consultée le',18],['url','Lien de référence',76]]}
];

const summary=wb.worksheets.add('Synthèse');
const sheets=new Map([['Synthèse',summary]]);
for(const d of defs)sheets.set(d.name,wb.worksheets.add(d.name));
const layouts={};
function fieldCol(sheet,key){const d=defs.find(x=>x.name===sheet);const i=d.cols.findIndex(c=>c[0]===key);if(i<0)throw Error(`${sheet}: field ${key}`);return colName(i);}
function columnRef(sheet,key){const d=defs.find(x=>x.name===sheet),n=plan[d.key].length;const c=fieldCol(sheet,key);return `'${sheet}'!$${c}$6:$${c}$${5+n}`;}
function keyCount(sheet,key,criterion){return `COUNTIFS(${columnRef(sheet,key)},${criterion})`;}

for(const d of defs){
 const sheet=sheets.get(d.name),records=plan[d.key],headers=d.cols.map(c=>c[1]);
 const rows=records.map(record=>d.cols.map(c=>scalar(c[0]==='targetRole'?(roleLabels[record[c[0]]]||record[c[0]]):record[c[0]])));
 const end=rows.length+5,last=colName(d.cols.length-1),used=sheet.getRange(`A1:${last}${end}`);
 sheet.showGridLines=false;
 used.format.font=font;
 used.format.verticalAlignment='top';
 used.format.rowHeight=19;
 sheet.getRange('A2').values=[[d.title]];
 sheet.getRange(`A2:${last}2`).format.font={...font,bold:true,size:16,color:C.brand};
 sheet.getRange(`A2:${last}2`).format.rowHeight=26;
 sheet.getRange('A3').values=[[d.subtitle]];
 sheet.getRange(`A3:${last}3`).format.font={...font,size:10,color:C.muted,italic:true};
 sheet.getRange(`A3:${last}3`).format.rowHeight=22;
 sheet.getRange(`A5:${last}5`).values=[headers];
 for(let i=0;i<rows.length;i+=250)sheet.getRangeByIndexes(i+5,0,Math.min(250,rows.length-i),d.cols.length).values=rows.slice(i,i+250);
 const table=sheet.tables.add(`A5:${last}${end}`,true,`Plan${d.key.replace(/[^A-Za-z0-9]/g,'')}`);
 table.style='TableStyleLight1';table.showFilterButton=true;
 sheet.getRange(`A5:${last}5`).format={fill:C.brand,font:{...font,bold:true,color:'#FFFFFF'},wrapText:true,horizontalAlignment:'center',verticalAlignment:'center',rowHeight:37};
 sheet.getRange(`A6:${last}${end}`).format.wrapText=true;
 for(let c=0;c<d.cols.length;c++){
  const [key,label,width]=d.cols[c],letter=colName(c),range=sheet.getRange(`${letter}5:${letter}${end}`);
  range.format.columnWidth=width;
  const body=sheet.getRange(`${letter}6:${letter}${end}`);
  if(records.some(r=>typeof r[key]==='number')){body.setNumberFormat(key==='sourceYear'?'0':'#,##0');body.format.horizontalAlignment='right';}
  if(key==='productionStatus'||(d.name==='Actions'&&key==='status')){
   body.format.fill=C.amber;
   body.dataValidation={rule:{type:'list',values:statusOptions}};
   body.conditionalFormats.add('containsText',{text:'référencer',format:{fill:C.red,font:{color:'#8F252A',bold:true}}});
   body.conditionalFormats.add('containsText',{text:'Rôle à décider',format:{fill:C.red,font:{color:'#8F252A',bold:true}}});
   body.conditionalFormats.add('containsText',{text:'Validé',format:{fill:C.green,font:{color:'#2B5A38'}}});
  }
  if(['owner','delivery','sourceFrameRate','sourceStart','sourceImpact','sourceEnd'].includes(key))body.format.fill=C.amber;
  if(key==='priority'){
   body.dataValidation={rule:{type:'list',values:['P0','P1','P2']}};
   body.conditionalFormats.add('containsText',{text:'P0',format:{fill:C.red,font:{bold:true,color:'#8F252A'}}});
  }
 }
 // Fit explicit long production text, not arbitrary tiny fonts or hidden overflow.
 let groupStart=0,previousHeight=null;
 const heights=rows.map(row=>Math.max(36,...row.map((value,c)=>{
  if(value===''||value==null)return 18;
  const text=String(value),width=d.cols[c][2];
  const lines=text.split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/Math.max(8,width-3))),0);
  return Math.min(360,18+lines*13);
 })));
 for(let i=0;i<=heights.length;i++){
  const h=heights[i];
  if(i===0){previousHeight=h;continue;}
  if(h!==previousHeight){sheet.getRange(`A${groupStart+6}:${last}${i+5}`).format.rowHeight=previousHeight;groupStart=i;previousHeight=h;}
 }
 sheet.freezePanes.freezeRows(5);sheet.freezePanes.freezeColumns(Math.min(3,d.cols.length));
 if(['Combattants','Mouvements','Finishers','Présentations','Arènes'].includes(d.name))sheet.tabColor=C.brand;
 if(d.name==='Actions')sheet.tabColor='#A26B2F';
 if(d.name==='Sources'){
  const c=fieldCol(d.name,'url');
  // Retain complete URLs as literal values: HYPERLINK currently exports an error cache in this runtime.
  sheet.getRange(`${c}6:${c}${end}`).values=records.map(s=>[s.url]);
  sheet.getRange(`${c}6:${c}${end}`).format.font={...font,color:'#315C8D'};
 }
 layouts[d.name]={rows:records.length,columns:d.cols.length,range:`A5:${last}${end}`,fields:Object.fromEntries(d.cols.map((c,i)=>[c[0],colName(i)]))};
}

summary.showGridLines=false;summary.tabColor=C.brand;
summary.getRange('A1:I40').format.font=font;
summary.getRange('A1:I40').format.rowHeight=22;
summary.getRange('A1:I40').format.verticalAlignment='center';
summary.getRange('A1:A40').format.columnWidth=38;
summary.getRange('B1:B40').format.columnWidth=17;
summary.getRange('C1:C40').format.columnWidth=4;
summary.getRange('D1:D40').format.columnWidth=22;
summary.getRange('E1:H40').format.columnWidth=16;
summary.getRange('I1:I40').format.columnWidth=3;
summary.getRange('A2').values=[['SILENT HILL: HALO OF FLESH']];
summary.getRange('A2:H2').format.font={...font,bold:true,size:16,color:C.brand};
summary.getRange('A2:H2').format.rowHeight=28;
summary.getRange('A3').values=[['Phase 1 — Références de combat et d’animation — 17 octobre 2026']];
summary.getRange('A3:H3').format.font={...font,color:C.muted,italic:true};
summary.getRange('A4:H4').format.borders={bottom:{style:'thin',color:C.line}};
const metrics=[
 ['Profils de combattants',`=COUNTA(${columnRef('Combattants','id')})`],
 ['Arènes',`=COUNTA(${columnRef('Arènes','id')})`],
 ['Mouvements actuels à réviser',`=COUNTA(${columnRef('Mouvements','id')})`],
 ['Dont supers / désespoir',`=${keyCount('Mouvements','key','"super"')}+${keyCount('Mouvements','key','"desperation"')}`],
 ['Finishers de personnages',`=${keyCount('Finishers','entityType','"Combattant"')}`],
 ['Finishers d’arènes',`=${keyCount('Finishers','entityType','"Arène"')}`],
 ['Séquences de présentation',`=COUNTA(${columnRef('Présentations','id')})`],
 ['Clips de base à préparer',`=COUNTA(${columnRef('Clips','id')})`],
 ['Pistes et événements d’arènes',`=COUNTA(${columnRef('Animations arènes','id')})`],
 ['Gestes / constats référencés',`=COUNTA(${columnRef('Gestes référencés','id')})`],
 ['Sources consultées',`=COUNTA(${columnRef('Sources','id')})`],
 ['PNG candidats déjà présents',`=${keyCount('Combattants','artState','"PNG candidat, fidélité à valider"')}`],
 ['Clips animés déjà présents',`=SUM(${columnRef('Combattants','animatedClips')})`],
 ['Profils validés en fidélité 1:1',`=${keyCount('Combattants','oneToOneValidated','"Oui"')}`],
 ['Actions encore ouvertes',`=COUNTA(${columnRef('Actions','id')})-${keyCount('Actions','status','"Validé"')}`],
 ['Priorités P0 encore ouvertes',`=COUNTIFS(${columnRef('Actions','priority')},"P0",${columnRef('Actions','status')},"<>Validé")`]
];
summary.getRange('A5:B5').values=[['Périmètre','Nombre']];
summary.getRange(`A6:A${5+metrics.length}`).values=metrics.map(x=>[x[0]]);
summary.getRange(`B6:B${5+metrics.length}`).formulas=metrics.map(x=>[x[1]]);
summary.getRange(`B6:B${5+metrics.length}`).setNumberFormat('#,##0');
summary.getRange(`B6:B${5+metrics.length}`).format.horizontalAlignment='right';
summary.getRange('D5:H5').values=[['Œuvre (code)','Profils','Arènes','Mouvements','Constats']];
const packs=[...new Set(plan.fighters.map(f=>f.source))];
summary.getRange(`D6:D${5+packs.length}`).values=packs.map(s=>[s]);
for(let i=0;i<packs.length;i++){
 const row=i+6;
 summary.getRange(`E${row}:H${row}`).formulas=[[
  `=${keyCount('Combattants','source',`$D${row}`)}`,
  `=${keyCount('Arènes','source',`$D${row}`)}`,
  `=${keyCount('Mouvements','source',`$D${row}`)}`,
  `=${keyCount('Gestes référencés','source',`$D${row}`)}`
 ]];
}
for(const range of ['A5:B5','D5:H5'])summary.getRange(range).format={fill:C.brand,font:{...font,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',rowHeight:29};
summary.getRange(`E6:H${5+packs.length}`).format.horizontalAlignment='right';
summary.getRange(`E6:H${5+packs.length}`).setNumberFormat('#,##0');
summary.getRange('A23').values=[['Lecture et règles de production']];
summary.getRange('A23:H23').format.font={...font,bold:true,size:14,color:C.brand};
summary.getRange('A23:H23').format.rowHeight=28;
const rules=[
 'Les descriptions documentées se trouvent dans Gestes référencés. Les propositions de versus sont indiquées séparément.',
 'Une source sur un monstre ne certifie ni ses 20 mouvements actuels, ni ses timings, ni ses poses de combat.',
 'Supers, finishers, poses de manche et sorties sont des adaptations à produire, même lorsque leur inspiration est documentée.',
 'Les poses de première manche restent réversibles. Les finishers attendent une victoire définitive du match.',
 'Les cases jaunes de statut, de responsable et de relevé vidéo sont modifiables. Les filtres permettent le suivi par œuvre.',
 'Les durées et FPS des sources restent vides tant qu’aucune capture image par image ne les a établis.',
 'Les nombres de préparation, dégâts et portée proviennent du moteur actuel. Ils ne sont pas des valeurs officielles Silent Hill.',
 'Les deux PNG actuels sont des candidats. Cette phase ne produit aucune nouvelle image ni nouvelle séquence de gameplay.',
 'Format prévu : un PNG transparent indépendant par image, silhouette entière, accessoires et appuis contrôlés.',
 'Les rôles non combattants, obstacles et variantes incertaines restent visibles pour être décidés, sans leur inventer de canon.',
 `Base de comparaison : PR #4, commit ${plan.baseCommit}.`
];
summary.getRange(`A25:A${24+rules.length}`).values=rules.map(s=>[s]);
summary.getRange(`A25:H${24+rules.length}`).format.rowHeight=24;

// Exercise the editable workflow once, then restore before final checks/export.
wb.recalculate();
const actions=sheets.get('Actions'),statusCol=fieldCol('Actions','status');
const firstStatus=actions.getRange(`${statusCol}6`).values[0][0];
const openRow=6+metrics.findIndex(m=>m[0]==='Actions encore ouvertes');
const openBefore=summary.getRange(`B${openRow}`).values[0][0];
actions.getRange(`${statusCol}6`).values=[['Validé']];
wb.recalculate();
const openAfter=summary.getRange(`B${openRow}`).values[0][0];
if(openAfter!==openBefore-1)throw new Error(`Action summary does not update: ${openBefore} -> ${openAfter}`);
actions.getRange(`${statusCol}6`).values=[[firstStatus]];
wb.recalculate();

const inspect=await wb.inspect({kind:'table',range:'Synthèse!A5:H21',include:'values,formulas',tableMaxRows:17,tableMaxCols:8,maxChars:7500});
await fs.writeFile(path.join(out,'workbook-summary-inspection.ndjson'),inspect.ndjson);
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},maxChars:5000});
await fs.writeFile(path.join(out,'workbook-formula-scan.ndjson'),errors.ndjson);
if(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#NULL!|#SPILL!|#CALC!/.test(errors.ndjson))throw new Error('Unexpected formula errors, inspect the saved scan.');

const expected=[plan.metrics.fighters,plan.metrics.stages,plan.metrics.moves,plan.metrics.supers,plan.metrics.fighterFinishers,plan.metrics.stageFinishers,plan.metrics.presentations,plan.metrics.poses,plan.metrics.stageAnimations,plan.metrics.observations,plan.metrics.sources,plan.metrics.pngCandidates,plan.metrics.animatedClips,0,plan.metrics.tasks,plan.tasks.filter(t=>t.priority==='P0').length];
const calculated=summary.getRange(`B6:B${5+metrics.length}`).values.map(r=>r[0]);
if(expected.some((value,i)=>value!==calculated[i]))throw new Error('Summary counts differ from production data: '+JSON.stringify({expected,calculated}));

const previewDir=path.join(out,'previews');await fs.mkdir(previewDir,{recursive:true});
const previews=[['Synthèse','A1:H36']];
for(const d of defs){
 const last=d.name==='Sources'?'D':d.name==='Gestes référencés'?'F':d.name==='Clips'?'G':d.name==='Présentations'?'G':d.name==='Arènes'?'F':d.name==='Animations arènes'?'F':'H';
 previews.push([d.name,`A1:${last}${Math.min(10,5+plan[d.key].length)}`]);
}
for(let i=0;i<previews.length;i++){
 const [sheetName,range]=previews[i];
 const blob=await wb.render({sheetName,range,scale:1,format:'png'});
 const name=String(i+1).padStart(2,'0')+'-'+sheetName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').toLowerCase()+'.png';
 await fs.writeFile(path.join(previewDir,name),new Uint8Array(await blob.arrayBuffer()));
 console.log(JSON.stringify({rendered:sheetName,range,file:name}));
}

const file=path.join(out,'SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx');
const exported=await SpreadsheetFile.exportXlsx(wb);await exported.save(file);
await fs.writeFile(path.join(out,'workbook-verification.json'),JSON.stringify({schema:1,input:path.basename(input),planSha256,file:path.basename(file),sheets:layouts,metrics:plan.metrics,calculated,editableStatusRecalculation:{before:openBefore,after:openAfter,restored:summary.getRange(`B${openRow}`).values[0][0]},visualPreviews:previews.map(p=>p[0]),engine:'Artifact Tool primary runtime; native Excel desktop not executed'},null,2)+'\n');
console.log(JSON.stringify({file,metrics:plan.metrics,sheets:defs.length+1,statusRecalculation:true}));
