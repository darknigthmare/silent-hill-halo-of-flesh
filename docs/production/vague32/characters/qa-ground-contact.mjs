/** QA-only anatomy measurement on the exact reviewed wave32 candidate PNG.
 * The lowest visible Sniffer pixel belongs to the tongue, not a supporting foot.
 * The existing y=834 calibration is approximate; the alpha>=32 claw ends at y=838.
 * This module changes no art metadata, actor state, renderer or collision box.
 */
export const SNIFFER_LIGHT_CONTACT=Object.freeze({
  fighterId:'sh4_sniffer_dog_male_053',source:'sh4',pose:'neutralLight',
  path:'assets/sprites/sh4_sniffer_dog_male_053.4a693eb7331d.png',
  sha256:'4a693eb7331d2505b813c374bbbb343999a88ae2c0541f632cf8d3c19c2871ef',
  width:1774,height:887,clawPixels:Object.freeze([1098,838]),
  tongueBottomPixel:848,maxTongueOverflowWorldPixels:2
});
export function reviewedGroundContact(sample,frame){
  if(sample.id!==SNIFFER_LIGHT_CONTACT.fighterId||sample.pose!==SNIFFER_LIGHT_CONTACT.pose)
    return {kind:'visible-bottom',pixels:[null,frame.visibleBounds[3]]};
  const r=SNIFFER_LIGHT_CONTACT;
  if(sample.source!==r.source||frame.path!==r.path||frame.sha256!==r.sha256||
    frame.width!==r.width||frame.height!==r.height||frame.visibleBounds[3]!==r.tongueBottomPixel)
    throw Error('Measured Sniffer claw/tongue contract requires the exact reviewed candidate');
  return {kind:'measured-claw',pixels:[...r.clawPixels],tongueBottomPixel:r.tongueBottomPixel,
    maxTongueOverflowWorldPixels:r.maxTongueOverflowWorldPixels};
}
