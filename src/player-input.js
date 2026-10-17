import { KEYS, readState, writeState, plain } from './save-store.js';
export const ACTIONS=Object.freeze({left:'Gauche',right:'Droite',jump:'Saut',down:'Accroupi',guard:'Garde',
  light:'Attaque légère',heavy:'Attaque lourde',special:'Technique',throw:'Projection',super:'Nightmare / Super',dodge:'Esquive',taunt:'Attitude / provocation'});
export const DEFAULT_BINDINGS=Object.freeze([
  Object.freeze({left:'ArrowLeft',right:'ArrowRight',jump:'ArrowUp',down:'ArrowDown',guard:'Space',light:'KeyJ',heavy:'KeyK',special:'KeyI',throw:'KeyU',super:'KeyO',dodge:'KeyL',taunt:'KeyP'}),
  Object.freeze({left:'KeyQ',right:'KeyD',jump:'KeyZ',down:'KeyS',guard:'KeyA',light:'KeyF',heavy:'KeyG',special:'KeyH',throw:'KeyR',super:'KeyT',dodge:'KeyV',taunt:'KeyN'})
]);
export function keyAllowed(code){return typeof code==='string'&&/^(Key[A-Z]|Digit[0-9]|Arrow(Left|Right|Up|Down)|Space|Shift(Left|Right)|Numpad[0-9])$/.test(code);}
export function defaultControls(){return {schema:1,players:DEFAULT_BINDINGS.map(p=>({...p})),deadzone:.35};}
export function validControls(value){
  if(!plain(value)||value.schema!==1||!Array.isArray(value.players)||value.players.length!==2||
    !Number.isFinite(value.deadzone)||value.deadzone<.15||value.deadzone>.65)return false;
  const codes=[],legacy=value.players.every(p=>plain(p)&&!Object.hasOwn(p,'taunt'));
  const actions=Object.keys(ACTIONS).filter(a=>!legacy||a!=='taunt');
  for(const p of value.players){if(!plain(p)||Object.keys(p).length!==actions.length)return false;
    for(const a of actions){if(!keyAllowed(p[a]))return false;codes.push(p[a]);}}
  return new Set(codes).size===codes.length;
}
/** Add the new action without replacing any saved binding, including recovered backups. */
export function normalizeControls(value){
  if(!validControls(value))throw new Error('Commandes invalides ou touches en conflit.');
  const next={...value,players:value.players.map(p=>({...p}))};
  const used=new Set(next.players.flatMap(p=>Object.values(p)));
  for(let i=0;i<2;i++)if(!next.players[i].taunt){
    const choices=[DEFAULT_BINDINGS[i].taunt,...'0123456789'.split('').map(n=>'Digit'+n),...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c=>'Key'+c)];
    const code=choices.find(key=>!used.has(key));
    if(!code)throw new Error('Aucune touche libre pour la provocation.');
    next.players[i].taunt=code;used.add(code);
  }
  return next;
}
export function loadControls(storage){const v=readState(KEYS.controls,{},storage,validControls);return validControls(v)?normalizeControls(v):defaultControls();}
export function saveControls(value,storage){return writeState(KEYS.controls,normalizeControls(value),storage,validControls);}
export function rebindControl(value,player,action,code){
  if(!validControls(value)||![0,1].includes(player)||!Object.hasOwn(ACTIONS,action)||!keyAllowed(code))throw new Error('Cette touche est réservée ou non prise en charge.');
  const next=normalizeControls(value);
  for(let i=0;i<2;i++)for(const [a,key]of Object.entries(next.players[i]))if(key===code&&(i!==player||a!==action))
    throw new Error(`Touche utilisée par le sujet ${i+1} : ${ACTIONS[a]}.`);
  next.players[player][action]=code;return next;
}
export function keyLabel(code){return ({ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'Espace',ShiftLeft:'Maj. gauche',ShiftRight:'Maj. droite'})[code]||code.replace(/^Key|^Digit/,'').replace(/^Numpad/,'Pavé ');}
export function controlsLabel(value,player=0){return Object.entries(ACTIONS).map(([a,name])=>`${keyLabel(value.players[player][a])} ${name}`).join(' · ');}
/** A sparse browser array is not a player order. Existing devices keep their slot. */
export class GamepadSlots {
  constructor(){this.identities=[null,null];this.present=[false,false];}
  poll(pads){
    const available=Array.from(pads||[]).filter(p=>p&&p.connected!==false&&p.mapping==='standard');
    const key=p=>`${p.index}:${p.id}`;
    const next=this.identities.map(id=>available.find(p=>key(p)===id)||null);
    for(let i=0;i<2;i++)if(!next[i]){const p=available.find(p=>!next.includes(p));if(p){next[i]=p;this.identities[i]=key(p);}}
    const lost=this.present.map((was,i)=>was&&(!next[i]||this.lastKeys?.[i]!==key(next[i])));
    const changed=next.map((p,i)=>!!p&&(!this.present[i]||this.lastKeys?.[i]!==key(p)));
    this.present=next.map(Boolean);this.lastKeys=next.map(p=>p?key(p):null);
    return {pads:next,lost,changed};
  }
}
