import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {auditRaster} from '../../../../scripts/raster-validation.mjs';
import {validateProjectileRegistry} from '../../../../src/projectile-bitmaps.js';
import {PROJECTILE_BITMAPS} from '../../../../src/projectile-bitmap-manifest.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const generated=JSON.parse(fs.readFileSync(path.join(here,'generated-files.json')));
const metadata={
  sh1_floatstinger_acid_cloud:{
    fighterId:'sh1_floatstinger_016',source:'sh1',
    slots:['neutralSpecial','airSpecial','super','desperation'],
    referenceIds:['CL_SH1_BOSSES','CL_SH1_CREATURES'],
    composite:'source-over',
    notes:[
      'Original Silent Hill Floatstinger gameplay repost shows a diffuse olive-green/brown mottled acid emission; the caption is not source evidence for precise chemistry.',
      'Reference is a public 498x370 gameplay GIF with a caption, not an original-resolution capture or certified platform master.',
      'Broad palette and cloudy material observed; isolated side-view contour, texture, scale and direction are versus presentation choices.',
      'One static PNG reused only by the existing Floatstinger projectile slots; no new move, trajectory, timing, phase count or animation inferred.'
    ]
  },
  homecoming_asphyxia_toxic_plume:{
    fighterId:'homecoming_asphyxia_096',source:'homecoming',
    slots:['neutralSpecial','super','desperation'],
    referenceIds:['EXT05','EXT06'],
    composite:'source-over',
    notes:[
      'Silent Hill Homecoming Asphyxia gameplay previews at approximately 03:15 and 03:50 show a dark charcoal/brown irregular mouth emission.',
      'Reference is public native 320x180 YouTube storyboard imagery sampled every five seconds; exact RGB palette, fine contour and original texture are not certified.',
      'The generated smoke is a detailed static interpretation of the visible dark effect; side-view orientation, full plume volume and scale are versus presentation choices.',
      'One static PNG reused only by the existing Asphyxia projectile slots; no poison gameplay, new move, timing or animation added.'
    ]
  },
  ascension_immolator_fire_jet:{
    fighterId:'ascension_the_immolator_182',source:'ascension',
    slots:['neutralSpecial','super','desperation'],
    referenceIds:['EXT58','EXT57'],
    composite:'screen',
    notes:[
      'Official Genvid Entertainment UNBLINKING scene, airdate 2024-01-24 scene 2, shows the Immolator fire emission; previews near 01:46 and 01:48 support a yellow/orange irregular flame stream with brown-orange smoke.',
      'Reference is public native 320x180 YouTube storyboard imagery sampled every two seconds; no full-resolution frame or exact original texture certified.',
      'Horizontal isolated flame volume, detailed wisps, placement and scale are versus presentation choices; the source scene jet is not newly implemented as a continuous beam.',
      'One static PNG reused only by the existing Immolator projectile slots; no new power, trajectory, timing or animation added.'
    ]
  }
};
const effects=[],assets=[],audits=[];
for(const g of generated){
  const m=metadata[g.id];
  if(!m)throw new Error('Unmapped generated file: '+g.id);
  const localPath=path.join(root,g.path),bytes=fs.readFileSync(localPath);
  const sha256=createHash('sha256').update(bytes).digest('hex');
  if(sha256!==g.sha256||bytes.length!==g.bytes)throw new Error('PNG byte receipt mismatch: '+g.id);
  const audit=auditRaster(bytes);
  if(audit.animated||!audit.alpha||audit.format!=='PNG'||audit.width!==g.width||audit.height!==g.height)throw new Error('Static native PNG constraint failed: '+g.id);
  let nativeByteIdentical=null;
  if(fs.existsSync(g.nativeSource)){
    nativeByteIdentical=bytes.equals(fs.readFileSync(g.nativeSource));
    if(!nativeByteIdentical)throw new Error('Native output bytes changed: '+g.id);
  }
  const frame={path:g.path,sha256,bytes:bytes.length,width:audit.width,height:audit.height,framingBounds:audit.framingBounds};
  effects.push({id:g.id,fighterId:m.fighterId,source:m.source,slots:m.slots,referenceIds:m.referenceIds,presentation:{heightInRadii:3,anchor:'center',composite:m.composite,facing:1},notes:[...m.notes,'Source evidence, exact prompts and native output receipts: docs/production/vague29/projectiles/.'],status:'integrated-candidate',fidelity:'unverified',origin:'conversation-image-generation',frame});
  assets.push({...frame,localPath,nativeSource:g.nativeSource,pixelsModified:false});
  audits.push({id:g.id,...audit,sha256,bytes:bytes.length,nativeByteIdentical,pixelsModified:false});
}
validateProjectileRegistry({...PROJECTILE_BITMAPS,...Object.fromEntries(effects.map(e=>[e.id,e]))});
const delivery={schema:1,wave:29,effects,assets,notes:[
  'Three independent static native PNG effects, ten existing move-slot routes. No runtime manifest or gameplay file changed by this delivery script.',
  'Candidate fidelity remains unverified. Source precision and final-image interpretation limits are documented in research.json and README.md.',
  'Twinfeeler and Origins Straight-Jacket were investigated but excluded because the inspected references did not expose a sufficiently clear emission.',
  'Imagegen output files copied byte-for-byte. Source crops were made only to isolate native storyboard preview frames; no generated output was retouched, resized, redrawn or assembled.',
  'Independent runtime visual QA is required after root integration. These receipts cover file integrity, static alpha, metadata and compatible registry routes.'
]};
fs.writeFileSync(path.join(here,'integration-delivery.json'),JSON.stringify(delivery,null,2)+'\n');
fs.writeFileSync(path.join(here,'raster-audit.json'),JSON.stringify({schema:1,effects:audits,registryValidation:'pass',effectCount:effects.length,slotCount:effects.reduce((n,e)=>n+e.slots.length,0),runtimeVisualQA:'deferred-to-integrator'},null,2)+'\n');
console.log(JSON.stringify({effectCount:effects.length,slotCount:effects.reduce((n,e)=>n+e.slots.length,0),totalBytes:assets.reduce((n,a)=>n+a.bytes,0),registryValidation:'pass',delivery:path.join(here,'integration-delivery.json')},null,2));
