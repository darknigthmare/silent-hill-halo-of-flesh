import {resolve} from 'node:path';
import {CHRONICLES, getStage} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {chronicleArtwork} from '../src/chronicle-art.js';

export async function checkWave14(browser, base, output, report, check) {
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, serviceWorkers: 'block'});
  try {
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    const module = page.frameLocator('#moduleFrame');
    const ids = ['sh2_mandarin_026', 'homecoming_siam_090'];
    const names = ['Mandarin', 'Siam'];
    const stage = getStage('book_wood');
    const layers = STAGE_BITMAPS[stage.id].layers;
    const actors = ids.map(id => SPRITES[id].frames[SPRITES[id].clips.idle.frames[0]]);
    check('Wood Zone has both authored layers and both idle sprites are separate from selection',
      layers.length === 2 && layers[0].id === 'wood-clearing' && layers[1].id === 'bare-bough'
      && actors.every((frame, i) => frame.purpose === 'combat' && frame.path !== SPRITES[ids[i]].portrait.path));
    const paths = [...layers.map(layer => layer.frames[0].path), ...actors.map(frame => frame.path)];
    await page.goto(base);
    await page.locator('[data-mode="versus"]').first().click();
    await module.locator('#mode').selectOption('local');
    for (const [i, id] of ids.entries()) {
      await module.locator('#slotP' + (i + 1)).click();
      await module.locator('#search').fill(names[i]);
      await module.locator('#roster [data-id="' + id + '"]').click();
    }
    await module.locator('#openGallery').click();
    await module.locator('#stageList').getByText(stage.name, {exact: true}).click();
    await module.locator('#stageGallery').waitFor({state: 'hidden'});
    check('Versus selected Wood Zone', await module.locator('#stageName').textContent() === stage.name);

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
    check('Match canvas painted both stances and both Wood Zone layers in one frame', paths.every(path => painted.includes(path)));
    report.woodZoneDraws = painted;
    await canvas.screenshot({path: resolve(output, '04-mandarin-siam-wood-zone.png')});
    report.captures.push('04-mandarin-siam-wood-zone.png');

    await page.goto(base);
    await page.locator('[data-mode="chronicles"]').first().click();
    const route = CHRONICLES.find(route => route.id === 'maya_villa');
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
    check('Maya’s Manifestations panel displays the decoded Sakura Head illustration and caption',
      expected.fighterId === 'shortmessage_sakura_head_150' && decoded.path === expected.path
      && decoded.width === 1672 && decoded.height === 941 && decoded.alt === expected.alt
      && await scene.locator('figcaption').textContent() === expected.caption);
    report.mayaSighting = decoded;
    await scene.screenshot({path: resolve(output, '05-maya-manifestation.png')});
    report.captures.push('05-maya-manifestation.png');
  } finally {
    await context.close();
  }
}
