import {resolve} from 'node:path';
import {SPRITES} from '../src/sprite-manifest.js';

export async function checkRecoveredFighters(page, module, base, output, report, check, checkDuel) {
  const stage = {stageId: 'historical_society', layerIds: ['exhibition-room', 'damaged-display-case']};
  for (const duel of [
    {ids: ['sh3_nurse_revolver_044', 'homecoming_nurse'], reportKey: 'recoveredNurseDuel', capture: '11-nurses-historical-society.png'},
    {ids: ['sh4_jasper_gein_victim_17', 'shf_ayakakashi_152'], reportKey: 'recoveredJasperDuel', capture: '12-jasper-ayakakashi.png'}
  ]) await checkDuel(page, module, base, output, report, check, {...stage, ...duel});

  const rawShock = 'shattered_raw_shock_base_099';
  await page.goto(new URL('/modules/sprite-workshop.html', base).href);
  // A fresh inspector canvas is created after filtering; observe its native drawing call.
  await page.evaluate(() => {
    const original = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(image,...args) {
      const result = original.call(this,image,...args);
      if (this.canvas.matches('[data-art-purpose="combat"]') && image instanceof HTMLImageElement && image.currentSrc && image.naturalWidth)
        this.canvas.dataset.paintedAsset = new URL(image.currentSrc).pathname.slice(1);
      return result;
    };
  });
  await page.locator('#spriteSearch').fill(rawShock);
  const art = SPRITES[rawShock];
  const spritePath = art.frames[art.clips.idle.frames[0]].path;
  const preview = page.locator('#spriteDetail canvas[data-art-purpose="combat"][data-art-status="raster"][data-painted-asset="'+spritePath+'"]');
  await preview.waitFor();
  check('Raw Shock paints its separate side view in the workshop, with its documented role',
    spritePath !== art.portrait.path && await preview.getAttribute('data-sprite-id') === rawShock
    && await page.locator('[data-reference-only="true"]').isVisible()
    && await page.locator('#spriteDetail a[href*="unified-versus"]').count() === 0);
  report.rawShockWorkshop = spritePath;
  const workshopCapture = '13-raw-shock-workshop.png';
  await page.locator('#spriteDetail .sprite-previews').screenshot({path:resolve(output,workshopCapture)});
  report.captures.push(workshopCapture);

  const air = 'sh1_air_screamer_001';
  await page.goto(new URL('/modules/unified-versus.html?p1='+air, base).href);
  const selection = page.locator('#p1Portrait[data-art-status="raster"][data-sprite-id="'+air+'"]');
  await selection.waitFor();
  const portrait = SPRITES[air].portrait;
  const decoded = await selection.evaluate(async (canvas, path) => {
    const {ROSTER} = await import('/src/data.js');
    const {paintRasterPortrait} = await import('/src/sprite-system.js');
    const context = canvas.getContext('2d'), original = context.drawImage;
    let result;
    context.drawImage = function(img,...args) {
      const draw = original.call(this,img,...args);
      if (img instanceof HTMLImageElement && img.currentSrc && new URL(img.currentSrc).pathname === '/'+path)
        result = {path,width:img.naturalWidth,height:img.naturalHeight};
      return draw;
    };
    try { paintRasterPortrait(canvas,ROSTER.find(x=>x.id===canvas.dataset.spriteId),{facing:1}); }
    finally { context.drawImage=original; }
    return result;
  },portrait.path);
  check('Air Screamer selects its new portrait, independently of both idle and flight',
    decoded?.width === portrait.width && decoded.height === portrait.height &&
    SPRITES[air].frames.every(frame=>frame.path!==portrait.path));
  report.airScreamerSelection = decoded;
  const portraitCapture = '14-air-screamer-selection.png';
  await page.locator('#p1Card').screenshot({path:resolve(output,portraitCapture)});
  report.captures.push(portraitCapture);
}
