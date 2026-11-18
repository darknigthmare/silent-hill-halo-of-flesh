import {resolve} from 'node:path';
import {CHRONICLES, getFighter, getStage} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {chronicleArtwork} from '../src/chronicle-art.js';

async function checkDuel(page, module, base, output, report, check, {ids, stageId, layerIds, reportKey, capture}) {
  const stage = getStage(stageId);
  const layers = STAGE_BITMAPS[stage.id].layers;
  const actors = ids.map(id => SPRITES[id].frames[SPRITES[id].clips.idle.frames[0]]);
  check(stage.name + ' has both authored layers and both idle sprites are separate from selection',
    layers.length === 2 && layers.every((layer, index) => layer.id === layerIds[index])
    && actors.every((frame, i) => frame.purpose === 'combat' && frame.path !== SPRITES[ids[i]].portrait.path));
  const paths = [...layers.map(layer => layer.frames[0].path), ...actors.map(frame => frame.path)];
  await page.goto(base);
  await page.locator('[data-mode="versus"]').first().click();
  await module.locator('#mode').selectOption('local');
  for (const [i, id] of ids.entries()) {
    await module.locator('#slotP' + (i + 1)).click();
    await module.locator('#search').fill(getFighter(id).name);
    await module.locator('#roster [data-id="' + id + '"]').click();
  }
  await module.locator('#openGallery').click();
  await module.locator('#stageList').getByText(stage.name, {exact: true}).click();
  await module.locator('#stageGallery').waitFor({state: 'hidden'});
  check('Versus selected ' + stage.name, await module.locator('#stageName').textContent() === stage.name);

  // Observe successful calls on the real match canvas. Each background draw starts a new frame.
  const canvas = module.locator('#game');
  await canvas.evaluate((element, paths) => {
    const context = element.getContext('2d');
    const draw = context.drawImage;
    const expected = new Set(paths);
    const seen = new Set();
    context.drawImage = function (image, ...args) {
      const result = draw.call(this, image, ...args);
      if (image instanceof HTMLImageElement && image.currentSrc && image.naturalWidth) {
        const path = new URL(image.currentSrc).pathname.slice(1);
        if (path === paths[0]) seen.clear();
        if (expected.has(path)) seen.add(path);
        if (seen.size === expected.size) {
          element.dataset.wave14Frame = JSON.stringify([...seen]);
          context.drawImage = draw;
        }
      }
      return result;
    };
  }, paths);
  await module.locator('#launch').click();
  await module.locator('#game[data-wave14-frame]').waitFor({state: 'visible', timeout: 30000});
  const painted = JSON.parse(await canvas.getAttribute('data-wave14-frame'));
  check('Match canvas painted both stances and both ' + stage.name + ' layers in one frame', paths.every(path => painted.includes(path)));
  report[reportKey] = painted;
  await canvas.screenshot({path: resolve(output, capture)});
  report.captures.push(capture);
}

async function checkSighting(page, module, base, output, report, check, {routeId, fighterId, reportKey, capture}) {
  await page.goto(base);
  await page.locator('[data-mode="chronicles"]').first().click();
  const route = CHRONICLES.find(route => route.id === routeId);
  await module.locator('.route-button').filter({hasText: route.title}).click();
  await module.locator('#previewRoster').click();
  const scene = module.locator('#modalRoster .manifestation-scene');
  const image = scene.locator('img');
  await image.waitFor({state: 'visible'});
  const expected = chronicleArtwork(route.id).sighting;
  const decoded = await image.evaluate(async img => {
    await img.decode();
    return {path: new URL(img.currentSrc).pathname.slice(1), width: img.naturalWidth, height: img.naturalHeight, alt: img.alt};
  });
  check(route.title + ' shows the expected manifestation and caption',
    route.fighters.includes(fighterId) && expected.fighterId === fighterId && decoded.path === expected.path
    && decoded.width === 1672 && decoded.height === 941 && decoded.alt === expected.alt
    && await scene.locator('figcaption').textContent() === expected.caption);
  report[reportKey] = decoded;
  await scene.screenshot({path: resolve(output, capture)});
  report.captures.push(capture);
}

export async function checkWave14(browser, base, output, report, check) {
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, serviceWorkers: 'block'});
  try {
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    const module = page.frameLocator('#moduleFrame');
    await checkDuel(page, module, base, output, report, check, {
      ids: ['sh2_mandarin_026', 'homecoming_siam_090'], stageId: 'book_wood', layerIds: ['wood-clearing', 'bare-bough'],
      reportKey: 'woodZoneDraws', capture: '04-mandarin-siam-wood-zone.png'
    });
    await checkDuel(page, module, base, output, report, check, {
      ids: ['sh3_numb_body_small_037', 'sh3_leonard_wolf_048'], stageId: 'brookhaven_sh3', layerIds: ['leonard-basin', 'access-ladder'],
      reportKey: 'brookhavenDraws', capture: '06-leonard-brookhaven.png'
    });
    for (const fixture of [
      {routeId: 'maya_villa', fighterId: 'shortmessage_sakura_head_150', reportKey: 'mayaSighting', capture: '05-maya-manifestation.png'},
      {routeId: 'james_sentence', fighterId: 'sh2_lying_figure_020', reportKey: 'jamesSighting', capture: '07-james-manifestation.png'},
      {routeId: 'heather_birth', fighterId: 'sh3_closer_036', reportKey: 'heatherSighting', capture: '08-heather-manifestation.png'}
    ]) {
      await checkSighting(page, module, base, output, report, check, fixture);
    }
  } finally {
    await context.close();
  }
}
