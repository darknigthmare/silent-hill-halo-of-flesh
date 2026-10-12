/* Catalogue constraints, NOT independent confirmation of every claimed canon motif.
 * A local motif must have local supporting props. Broad source themes never
 * authorize importing every set-piece into every room of that source.
 */
const REQUIREMENTS = Object.freeze({
  lockerSlam: ['lockers'], gurneyRush: ['gurneys','beds'], carouselStart: ['carousel'],
  trainRumble: ['train','rails'], steamRelease: ['pipes','boiler','vents'],
  mirrorTurn: ['mirrors'], rootWake: ['roots','flowers','trees'],
  spotlightHunt: ['spotlight','spotlights','tower','lighthouse'],
  crtvLock: ['crtv'], bellToll: ['bells','bell','tower'],
  portraitWatch: ['portraits'], elevatorCall: ['elevator'],
});
const HAZARD_EVENT = Object.freeze({ lockerSlam:'lockerSlam',gurneyRush:'gurneyRush',carouselSweep:'carouselStart',
  trainRush:'trainRumble',steamVent:'steamRelease',mirrorFracture:'mirrorTurn',rootSnare:'rootWake',
  spotlightSweep:'spotlightHunt',crtvPulse:'crtvLock',bellToll:'bellToll',portraitGaze:'portraitWatch',elevatorDrop:'elevatorCall' });
const OUTDOORS = new Set(['street','roof','rooftop','village','marina','lake','forest','graveyard','lighthouse','ship','festival','ice','amusement','motel']);

export function localEventAllowed(stage, id) {
  const props = new Set(stage.props || []);
  if (id === 'stormSurge') return OUTDOORS.has(stage.family);
  if (id === 'ashFall') return ['ash','embers'].includes(stage.weather) || props.has('fire') || stage.source === 'film';
  if (id === 'iceLock') return stage.source === 'shattered' || props.has('ice') || stage.weather === 'snow';
  if (id === 'crtvLock') return stage.source === 'townfall' && props.has('crtv');
  const keys = REQUIREMENTS[id];
  return !keys || keys.some(key => props.has(key));
}

export function localHazardAllowed(stage, id) {
  if (id === 'lightningStrike') return OUTDOORS.has(stage.family);
  if (id === 'emberFall') return localEventAllowed(stage, 'ashFall');
  if (id === 'iceFracture' || id === 'frostWave') return localEventAllowed(stage, 'iceLock');
  return !HAZARD_EVENT[id] || localEventAllowed(stage, HAZARD_EVENT[id]);
}

export function constrainStageDeck(stage, events, hazards) {
  const unique = values => [...new Set(values)];
  const validEvents = unique(events).filter(id => localEventAllowed(stage, id));
  const validHazards = unique(hazards).filter(id => localHazardAllowed(stage, id));
  return {
    events: validEvents.length ? validEvents : ['powerFailure'],
    hazards: validHazards.length ? validHazards : ['staticBurst'],
    excludedEvents: unique(events).filter(id => !validEvents.includes(id)),
    excludedHazards: unique(hazards).filter(id => !validHazards.includes(id)),
    evidenceScope: 'project-catalogue-props-only / not-independent-canon-certification',
  };
}

const ANIMATION_EVENT = Object.freeze({ lockerRattle:'lockerSlam',hospitalMonitor:'gurneyRush',
  trainPass:'trainRumble',carouselTurn:'carouselStart',pipeSteam:'steamRelease',mirrorGlitch:'mirrorTurn',
  rootsCreep:'rootWake',spotlightSweep:'spotlightHunt',bellSwing:'bellToll',portraitBlink:'portraitWatch',
  elevatorBlink:'elevatorCall',ashFall:'ashFall',iceCrack:'iceLock' });
export function localAnimationAllowed(stage, id) {
  if (id === 'hospitalMonitor') return (stage.props||[]).some(p=>['beds','monitors','gurneys'].includes(p));
  if (id === 'tvStatic') return (stage.props||[]).some(p=>['crtv','screens','monitors'].includes(p));
  if (id === 'ferrisWheel') return (stage.props||[]).includes('wheel');
  return !ANIMATION_EVENT[id] || localEventAllowed(stage, ANIMATION_EVENT[id]);
}
