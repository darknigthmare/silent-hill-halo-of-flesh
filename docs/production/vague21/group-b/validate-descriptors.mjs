import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { getStage } from '../silent-hill-halo-of-flesh/src/data.js';
import { validateStageBitmap, stageBitmapFor, stageBitmapFrames } from '../silent-hill-halo-of-flesh/src/stage-bitmaps.js';
import { STAGE_BITMAPS } from '../silent-hill-halo-of-flesh/src/stage-bitmap-manifest.js';

const root = new URL('./', import.meta.url);
const delivery = JSON.parse(fs.readFileSync(new URL('delivery.json', root), 'utf8'));
const registry = Object.fromEntries(delivery.stages.map(x => [x.stageId, x]));
const rawStages = JSON.parse(fs.readFileSync(new URL('../silent-hill-halo-of-flesh/data/stages.json', root), 'utf8'));
const results = [];
for (const art of delivery.stages) {
  const stage = getStage(art.stageId);
  const raw = rawStages.find(x => x.id === art.stageId);
  if (!raw || stage.id !== art.stageId) throw new Error('Missing source stage: ' + art.stageId);
  if (validateStageBitmap(stage, art) !== art || stageBitmapFor(stage, registry) !== art || stageBitmapFor(raw, registry) !== art) throw new Error('Descriptor not selected: ' + art.stageId);
  if (stage.reference?.blocked) throw new Error('Blocked source stage: ' + art.stageId);
  if (STAGE_BITMAPS[art.stageId] || stageBitmapFor(stage)) throw new Error('Already registered before isolated delivery: ' + art.stageId);
  if (art.geometry.ceiling !== stage.referencePolicy.interior) throw new Error('Ceiling differs from policy: ' + art.stageId);
  if (art.layers.length !== 2 || art.layers.some(x => x.frames.length !== 1 || x.loop || x.fit !== 'cover')) throw new Error('Expected two static cover layers');
  if (art.layers[0].parallaxX !== 0 || art.layers[1].parallaxX !== .006) throw new Error('Unexpected parallax');
  const paths = [];
  for (const layer of art.layers) for (const frame of layer.frames) {
    const asset = delivery.assets.find(x => x.path === frame.path);
    const bytes = fs.readFileSync(asset.localPath);
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (hash !== frame.sha256 || bytes.length !== frame.bytes) throw new Error('File mismatch: ' + frame.path);
    if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a' || bytes.readUInt32BE(16) !== frame.width || bytes.readUInt32BE(20) !== frame.height) throw new Error('PNG metadata mismatch: ' + frame.path);
    if (layer.id === 'foreground' && (!asset.alpha.hasAlphaChannel || asset.alpha.supportBand.fractionVisibleAlpha32 !== 0)) throw new Error('Invalid foreground alpha');
    paths.push(frame.path);
  }
  results.push({stageId: art.stageId, source: stage.source, scene: art.scene, policySceneId: stage.referencePolicy?.sceneId ?? null, policyWorldState: stage.referencePolicy?.worldState, blocked: false, alreadyRegisteredAtValidation: false, valid: true, selected: true, validatedAgainst: ['getStage runtime object', 'raw data stage'], layers: art.layers.length, paths});
}
const frames = stageBitmapFrames(delivery.stages.map(x => getStage(x.stageId)), registry);
if (frames.length !== 12) throw new Error('Expected twelve unique frames');
const report = {createdAt: new Date().toISOString(), runtime: 'Repository getStage / validateStageBitmap / stageBitmapFor / stageBitmapFrames, read-only imports', stages: results.length, frames: frames.length, allPassed: true, results, noRepositoryWrites: true, liveEngineComposite: 'Parent native harness required after integration; this verifies descriptors, hashes, metadata and source selection only.'};
fs.writeFileSync(new URL('descriptor-validation.json', root), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
