/*
 * SILENT HILL: HALO OF FLESH — Reactive stage cinematography, v0.8.0.
 * Original canvas shapes only. Every set-piece is staged from the location's
 * declared event deck, not inferred as an additional canonical occurrence.
 * Visual animation NEVER advances or samples gameplay RNG.
 */
const TAU = Math.PI * 2;
const limit = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
const ease = t => t*t*(3-2*t);
const band = (a,b,t) => ease(limit((t-a)/(b-a)));
const hash = text => [...String(text)].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
const palette = {
  steel: '#646b65', oldsteel:'#414945', rust:'#613a36', light:'#b8b5a1', sea:'#405e67',
  ice:'#9ab9bd', bloom:'#aa5d71', ember:'#bd7052', wood:'#6b5549', signal:'#a7b6a4'
};
const DESCRIPTIONS = Object.freeze({
  powerFailure: ['light','Les lampes du lieu décrochent', 'background'],
  sirenCall: ['light','L’avertissement traverse la brume','background'],
  lockerSlam: ['locker','Les casiers vibrent sur leurs charnières','background'],
  gurneyRush: ['gurney','Un chariot glisse sur ses roulettes','background'],
  corridorCollapse: ['floor','Le passage se fissure au sol','ground'],
  carouselStart: ['carousel','Le manège tourne sur son axe','background'],
  trainRumble: ['train','Une rame traverse la perspective du quai','background'],
  steamRelease: ['pipe','La purge jaillit des conduites','background'],
  waterRise: ['water','La ligne d’eau monte contre le sol','ground'],
  mirrorTurn: ['mirror','La glace change avant la pièce','background'],
  rootWake: ['roots','Les racines remontent depuis le sol','ground'],
  spotlightHunt: ['spotlight','Le faisceau inspecte le couloir','background'],
  crtvLock: ['crtv','Un écran CRTV réagit au signal','background'],
  bellToll: ['bell','La cloche oscille sur son support','background'],
  voidPull: ['void','La perspective se replie vers un point','background'],
  ashFall: ['ash','Les cendres se déposent dans l’air','air'],
  portraitWatch: ['portrait','Les portraits semblent suivre le regard','background'],
  elevatorCall: ['elevator','Les portes de l’ascenseur se referment','background'],
  roomBreath: ['wall','Les parois se contractent','background'],
  stormSurge: ['storm','Le ciel s’éclaire par à-coups','air'],
  iceLock: ['ice','Le givre suit les fissures du sol','ground'],
  ritualWake: ['ritual','Les signes répondent autour du cercle','ground']
});

export function stageChoreographyProfile(stage) {
  const events = stage?.director?.events || [];
  return {
    id: stage?.id || 'unknown',
    location: stage?.name || 'unknown',
    fidelity: 'motif-location-attested / choreography-original-versus',
    cues: events.filter(id=>DESCRIPTIONS[id]).map(id => {
      const [prop,description,layer] = DESCRIPTIONS[id];
      const seed=hash(`${stage?.id || ''}:${id}`);
      const x=limit(.19+(seed%602)/1000,.18,.82);
      return {event:id,prop,description,layer,anchor:{x,y:layer==='air'?.29:layer==='ground'?.815:.59},direction:seed%2?-1:1};
    })
  };
}

function line(ctx,a,b,c,d,width,color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();}
function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function orb(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
function path(ctx,pts,color,width=2){ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function glow(ctx,x,y,r,tint,power=.3){const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${tint},${power})`);g.addColorStop(1,`rgba(${tint},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);}
function setpiece(ctx,w,h,cue,elapsed,progress,reduced){
  const x=cue.anchor.x*w, ground=h*.805, rear=h*.73, direction=cue.direction;
  const moving=reduced?.5:Math.sin(elapsed*.087);
  const swell=reduced?.65:(.5+.5*Math.sin(elapsed*.075));
  const t=ease(progress);
  const dark='rgba(12,16,17,.88)', edge='rgba(145,155,147,.45)', red='rgba(152,47,52,.30)';
  switch(cue.event){
    case 'powerFailure':case 'sirenCall': {
      const siren=cue.event==='sirenCall';
      for(let i=0;i<5;i++){
        const px=(i+.5)*w/5,py=h*.23+(i%2)*12;
        line(ctx,px,0,px,py,2,'rgba(113,118,114,.47)');
        orb(ctx,px,py,8,dark);
        if(siren||i%2===0)glow(ctx,px,py,105,siren?'165,45,49':'209,204,170',siren?.06+swell*.09:.08*(1-t));
      }
      break;
    }
    case 'lockerSlam': {
      const base=ground-205;
      for(let i=0;i<5;i++){
        const lx=x-135+i*54,open=i===2?Math.sin(t*Math.PI)*22:0;
        rect(ctx,lx,base,49,193,'#272c2b');rect(ctx,lx+3+open,base+3,43-open*.16,183,'#47514b');
        rect(ctx,lx+31+open,base+97,3,14,'#a8a397');
        line(ctx,lx+5,base+32,lx+42,base+32,1,'#141a19');
      }
      break;
    }
    case 'gurneyRush': {
      const px=(-.18+1.36*t)*w*(direction>0?1:-1)+(direction<0?w:0);
      ctx.save();ctx.translate(px,rear);ctx.scale(direction,1);
      rect(ctx,-112,-43,226,12,'#87918b');rect(ctx,-94,-31,186,9,'#414b46');
      line(ctx,-89,-25,-63,18,8,edge);line(ctx,88,-25,67,18,8,edge);
      orb(ctx,-65,21,12,'#202423');orb(ctx,70,21,12,'#202423');
      rect(ctx,-103,-49,32,7,'#a7a8a0');rect(ctx,75,-50,20,8,'#858f89');
      ctx.restore();break;
    }
    case 'trainRumble': {
      const px=(-.7+2.25*t)*w*(direction>0?1:-1)+(direction<0?w:0);
      ctx.save();ctx.translate(px,0);ctx.fillStyle='#242a2c';ctx.fillRect(-240,rear-165,520,179);
      rect(ctx,-244,rear-168,530,7,'#71736b');rect(ctx,-249,rear+14,538,6,'#43403d');
      for(let i=0;i<7;i++){
        rect(ctx,-207+i*70,rear-125,49,68,'#151f20');
        rect(ctx,-203+i*70,rear-121,41,59,`rgba(155,176,159,${.10+swell*.18})`);
      }
      for(let i=0;i<5;i++)orb(ctx,-190+i*103,rear+16,13,'#101112');
      ctx.restore();break;
    }
    case 'carouselStart': {
      const angle=elapsed*(reduced?.003:.014);
      line(ctx,x,rear-168,x,rear+22,8,palette.oldsteel);
      ctx.save();ctx.translate(x,rear-150);ctx.rotate(angle);
      ctx.strokeStyle='#72695d';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,116,0,TAU);ctx.stroke();
      for(let i=0;i<8;i++){const a=i*TAU/8;line(ctx,0,0,Math.cos(a)*116,Math.sin(a)*116,3,'#837467');orb(ctx,Math.cos(a)*116,Math.sin(a)*116,9,'#404442');}
      ctx.restore();break;
    }
    case 'steamRelease': {
      rect(ctx,x-140,0,21,rear-80,'#3a4542');rect(ctx,x-140,rear-96,172,24,'#4a514d');
      for(let i=0;i<6;i++){
        const dy=elapsed*(reduced?.3:1.4)+i*37;
        glow(ctx,x+20+Math.sin(i*2+elapsed*.03)*35,rear-85-(dy%270),24+i*7,'180,184,164',.05+.06*(1-t));
      }break;
    }
    case 'waterRise':{
      const y=ground-7-t*47;
      rect(ctx,0,y,w,h-y,'rgba(42,76,83,.24)');
      for(let i=0;i<9;i++){const px=i*w/8;line(ctx,px,y+2+Math.sin(elapsed*.06+i)*3,px+92,y+4+Math.cos(elapsed*.07+i)*3,2,'rgba(128,162,157,.40)');}break;
    }
    case 'mirrorTurn': {
      ctx.save();ctx.translate(x,rear-109);
      const width=70*(1-.64*Math.sin(t*Math.PI));
      rect(ctx,-width-8,-98,2*width+16,210,'#4c4540');rect(ctx,-width,-90,width*2,195,'#343f40');
      rect(ctx,-width+5,-85,width*2-10,185,'rgba(145,170,163,.11)');
      for(let i=0;i<4;i++)line(ctx,-width+i*18,-70,width-i*9,90,1.2,'rgba(184,210,203,.22)');
      ctx.restore();break;
    }
    case 'rootWake':{
      for(let i=0;i<9;i++){
        const px=x-210+i*54;
        ctx.strokeStyle=`rgba(87,63,59,${.24+t*.40})`;ctx.lineWidth=5+i%3;
        ctx.beginPath();ctx.moveTo(px,ground+16);ctx.quadraticCurveTo(px+moving*16,ground-40-t*65,px+Math.cos(i)*27,ground-30-t*(72+i%3*20));ctx.stroke();
      }break;
    }
    case 'spotlightHunt':{
      const px=x+direction*Math.sin(t*Math.PI)*w*.26;
      ctx.fillStyle='rgba(192,200,169,.11)';ctx.beginPath();ctx.moveTo(px,h*.11);ctx.lineTo(px-140,rear);ctx.lineTo(px+140,rear);ctx.closePath();ctx.fill();glow(ctx,px,h*.13,62,'201,201,184',.25);break;
    }
    case 'crtvLock':{
      const y=rear-80;
      rect(ctx,x-82,y-85,164,110,'#272e2b');rect(ctx,x-70,y-72,138,84,'#15201e');
      const scanY=y-70+(elapsed*2%78);
      rect(ctx,x-66,scanY,133,3,`rgba(175,197,182,${.21+swell*.27})`);
      for(let i=0;i<13;i++)line(ctx,x-65,y-64+i*6,x+58,y-64+i*6,1,'rgba(110,162,145,.15)');
      orb(ctx,x+69,y+2,4,'#b3ab86');rect(ctx,x-8,y+26,16,12,'#2a302c');break;
    }
    case 'bellToll':{
      line(ctx,x,0,x,h*.20,4,palette.steel);
      ctx.save();ctx.translate(x,h*.26);ctx.rotate(Math.sin(elapsed*.092)*(reduced?.03:.16));
      ctx.fillStyle='#656158';ctx.beginPath();ctx.moveTo(-18,-35);ctx.lineTo(17,-35);ctx.lineTo(37,26);ctx.lineTo(-37,26);ctx.closePath();ctx.fill();
      orb(ctx,0,32,7,'#877765');ctx.restore();break;
    }
    case 'voidPull':{
      const r=68+t*96;
      ctx.save();ctx.translate(x,rear-87);
      for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(0,0,r+i*24,(r+i*24)*.5,i*.33,0,TAU);ctx.strokeStyle=`rgba(125,104,151,${.24-i*.026})`;ctx.lineWidth=2;ctx.stroke();}
      ctx.restore();break;
    }
    case 'ashFall':{
      for(let i=0;i<52;i++){
        const seed=(i*71+Math.round(x))%997;
        const px=(seed*1.31)%w,py=(i*53+elapsed*(reduced?.1:.63))%h;
        rect(ctx,px,py,1+i%3,2+i%4,`rgba(174,145,122,${.12+(i%5)*.045})`);
      }break;
    }
    case 'portraitWatch':{
      for(let i=0;i<4;i++){
        const px=x-180+i*110,py=h*.36+(i%2)*32;
        rect(ctx,px-34,py-52,68,103,'#58483e');rect(ctx,px-28,py-46,56,90,'#2b2d2c');
        orb(ctx,px,py-16,17,'#4c514d');line(ctx,px-17,py-20,px+17,py-20,2,red);
      }break;
    }
    case 'elevatorCall':{
      rect(ctx,x-106,rear-250,212,275,'#282f2b');
      const opening=62*(1-t);
      rect(ctx,x-97,rear-244,97-opening,258,'#535b54');
      rect(ctx,x+opening,rear-244,97-opening,258,'#4a534e');
      line(ctx,x,rear-244,x,rear+12,3,'#182221');break;
    }
    case 'roomBreath':{
      const d=15*swell;
      rect(ctx,0,0,23+d,h,'rgba(74,49,52,.20)');
      rect(ctx,w-23-d,0,23+d,h,'rgba(74,49,52,.20)');
      for(let i=0;i<6;i++){line(ctx,30+d+i*2,h*.14+i*74,88+d,h*.2+i*70,2,'rgba(132,72,78,.22)');}break;
    }
    case 'stormSurge':{
      const lx=x+direction*80;
      glow(ctx,lx,h*.23,220,'191,210,214',.06+t*.09);
      if(swell>.85&&!reduced)path(ctx,[[lx,-20],[lx-22,h*.18],[lx+9,h*.28],[lx-20,h*.42],[lx+5,h*.55]],'rgba(201,212,220,.42)',3);
      break;
    }
    case 'corridorCollapse':case 'iceLock':case 'ritualWake':{
      const ritual=cue.event==='ritualWake',ice=cue.event==='iceLock';
      ctx.strokeStyle=ritual?'rgba(181,98,118,.42)':ice?'rgba(142,193,211,.45)':'rgba(126,107,93,.50)';
      ctx.lineWidth=2+3*t;
      for(let i=0;i<10;i++){
        const px=x-260+i*59,py=ground+6+(i%3)*16;
        ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+35,py-13*t);ctx.lineTo(px+52,py+7*t);ctx.stroke();
      }
      if(ritual){ctx.beginPath();ctx.ellipse(x,ground,160,36,0,0,TAU);ctx.stroke();}
      break;
    }
    default:break;
  }
}

/** Draws on the BACKGROUND pass; combatants and hitbox warnings stay on top. */
export function drawStageCinematics(ctx,w,h,stage,director,{reducedMotion=false}={}) {
  const event=director?.activeEvent;
  if(!event)return;
  if (director.linkedHazard && event.hazard) return; // physical instance drawn by the hitbox-aligned pass
  const cue=stageChoreographyProfile(stage).cues.find(entry=>entry.event===event.id);
  if(!cue)return;
  const total=Math.max(1,event.duration||120);
  const elapsed=limit(total-(director.activeTimer||0),0,total);
  const progress=elapsed/total;
  const opacity=band(0,.12,progress)*(1-band(.88,1,progress));
  ctx.save();ctx.globalAlpha*=opacity;
  setpiece(ctx,w,h,cue,elapsed,progress,Boolean(reducedMotion));
  ctx.restore();
}
