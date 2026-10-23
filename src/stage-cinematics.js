/*
 * SILENT HILL: HALO OF FLESH — Reactive stage cinematography, v0.8.0.
 * Original canvas shapes only. Every set-piece is staged from the location's
 * declared event deck, not inferred as an additional canonical occurrence.
 * Visual animation NEVER advances or samples gameplay RNG.
 */
import { stageReferenceEventAllowed, stageReferenceTrackAllowed } from './stage-reference-policy.js';
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
  const events = (stage?.director?.events || []).filter(id=>stageReferenceEventAllowed(stage,id));
  return {
    id: stage?.id || 'unknown',
    location: stage?.name || 'unknown',
    fidelity: stage?.reference ? 'reference-linked / original-versus-prototype' : 'project-catalogue / original-versus',
    cues: events.flatMap(id => {
      const tracks=(stage?.referenceTracks || []).filter(track=>track.event===id&&stageReferenceTrackAllowed(stage,track));
      if(tracks.length)return [{event:id,prop:tracks[0].key,description:tracks[0].description,layer:tracks[0].layer,
        anchor:{...tracks[0].anchor},direction:1,referenceTracks:tracks.map(track=>track.id),evidence:tracks.flatMap(track=>track.evidence)}];
      if(!DESCRIPTIONS[id])return [];
      const [prop,description,layer] = DESCRIPTIONS[id];
      const seed=hash(`${stage?.id || ''}:${id}`);
      const x=limit(.19+(seed%602)/1000,.18,.82);
      return [{event:id,prop,description,layer,anchor:{x,y:layer==='air'?.29:layer==='ground'?.815:.59},direction:seed%2?-1:1,
        evidence:[...(stage?.reference?.referenceIds || [])],fidelity:'original-versus-adaptation'}];
    })
  };
}

function line(ctx,a,b,c,d,width,color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();}
function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function orb(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
function path(ctx,pts,color,width=2){ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function glow(ctx,x,y,r,tint,power=.3){const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${tint},${power})`);g.addColorStop(1,`rgba(${tint},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);}

/** Original, deliberately small scenery prototypes. Never draw an actor or a hitbox. */
function referenceTrack(ctx,w,h,track,time,progress=null) {
  const x=track.anchor.x*w,y=track.anchor.y*h,t=Number.isFinite(time)?Math.max(0,time):0;
  const pulse=.5+.5*Math.sin(t*.0012),sway=Math.sin(t*.0008);
  ctx.save();
  switch(track.key){
    case 'fogLayers':
      for(let i=0;i<2;i++){
        const px=x+Math.sin(t*(i?.00013:.00008)+i)*w*.14,py=y+i*h*.1;
        ctx.save();ctx.translate(px,py);ctx.scale(1,.14);
        const g=ctx.createRadialGradient(0,0,0,0,0,w*.54);
        g.addColorStop(0,`rgba(198,210,204,${i?.07:.09})`);g.addColorStop(1,'rgba(198,210,204,0)');
        ctx.fillStyle=g;ctx.fillRect(-w*.54,-w*.54,w*1.08,w*1.08);ctx.restore();
      }break;
    case 'snowDepth':case 'ashDepth':{
      const snow=track.key==='snowDepth';
      for(let i=0;i<38;i++){
        const px=((i*173+t*(snow?.008:.005)*(1+i%3))%(w+30))-15;
        const py=((i*61+t*(snow?.025:.014))%(h*.71));
        if(snow){ctx.fillStyle='rgba(223,235,237,.29)';ctx.beginPath();ctx.ellipse(px,py,1+i%3,1+i%3,0,0,TAU);ctx.fill();}
        else rect(ctx,px,py,1+i%3,2+i%2,'rgba(171,164,151,.23)');
      }break;
    }
    case 'fanEccentric':{
      ctx.strokeStyle='#45534e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,36,0,TAU);ctx.stroke();
      const px=x+Math.sin(t*.002)*1.1,py=y+Math.cos(t*.002)*.7;
      for(let i=0;i<5;i++){const angle=t*.0015+i*TAU/5;line(ctx,px,py,px+Math.cos(angle)*29,py+Math.sin(angle)*29,6,'rgba(119,131,120,.36)');}
      for(let i=-2;i<=2;i++)line(ctx,x-32,y+i*10,x+32,y+i*10,1,'rgba(29,38,34,.66)');
      break;
    }
    case 'curtainBreathe':{
      const height=h*.24,offset=sway*5;
      ctx.fillStyle='rgba(145,131,112,.17)';ctx.beginPath();ctx.moveTo(x-25,y);
      ctx.lineTo(x+25,y);ctx.quadraticCurveTo(x+19+offset,y+height*.5,x+20+offset,y+height);
      ctx.lineTo(x-21+offset,y+height);ctx.quadraticCurveTo(x-30+offset,y+height*.5,x-25,y);ctx.closePath();ctx.fill();
      line(ctx,x-29,y,x+29,y,2,'rgba(116,128,113,.35)');break;
    }
    case 'chainPendulum':
      ctx.strokeStyle='rgba(130,130,113,.36)';ctx.lineWidth=2;
      for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(x+sway*i*.43,y+i*12,3.5,7,0,0,TAU);ctx.stroke();}break;
    case 'waterRings':
      for(let i=0;i<6;i++){
        const radius=12+((t*.008+i*13)%62);
        ctx.strokeStyle=`rgba(134,174,181,${.16*(1-radius/90)})`;ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(x+(i-2.5)*w*.11,y+(i%2)*11,radius,radius*.08,0,0,TAU);ctx.stroke();
      }break;
    case 'waterSwell':
      for(let i=0;i<3;i++){
        ctx.strokeStyle=`rgba(126,163,168,${.07+i*.025})`;ctx.lineWidth=1.5;
        ctx.beginPath();
        for(let px=-w*.4;px<=w*.4;px+=16){
          const py=y+i*10+Math.sin(px*.008+t*.00065+i)*2.5;
          if(px===-w*.4)ctx.moveTo(x+px,py);else ctx.lineTo(x+px,py);
        }
        ctx.stroke();
      }break;
    case 'dustDrift':
      for(let i=0;i<24;i++){
        const px=x-64+(i*31)%132+Math.sin(t*.0007+i)*5,py=y+((i*29+t*.014)%100);
        rect(ctx,px,py,1+i%2,1+i%2,'rgba(172,163,142,.19)');
      }break;
    case 'mirrorContamination':{
      rect(ctx,x-49,y-77,98,154,'rgba(38,48,45,.56)');
      ctx.strokeStyle='rgba(133,144,131,.37)';ctx.lineWidth=3;ctx.strokeRect(x-52,y-80,104,160);
      const extent=16+((t%24000)/24000)*109;
      path(ctx,[[x-25,y-70],[x-17,y-50],[x-21,y-31],[x-8,y-70+extent]],'rgba(16,20,17,.76)',5);
      break;
    }
    case 'lightSequence':
      for(let i=0;i<4;i++){
        const px=x+(i-1.5)*w*.12,py=y+i*8,level=.015+.085*Math.max(0,Math.sin(t*.0009-i*.85));
        rect(ctx,px-19,py,38,4,'rgba(131,140,123,.29)');glow(ctx,px,py+4,51,'190,200,171',level);
      }break;
    case 'signFlicker':{
      rect(ctx,x-62,y-20,124,40,'rgba(21,25,24,.68)');
      for(let i=0;i<5;i++){
        const level=.07+.15*Math.max(0,Math.sin(t*.0017+i*1.9)*Math.sin(t*.00037+i));
        rect(ctx,x-51+i*22,y-8,13,17,`rgba(179,94,93,${level})`);
      }break;
    }
    case 'paperFlutter':{
      const a=Math.sin(t*.0013)*3;
      ctx.fillStyle='rgba(184,174,140,.43)';ctx.beginPath();ctx.moveTo(x-12,y);
      ctx.lineTo(x+12,y);ctx.lineTo(x+12+a,y+25);ctx.lineTo(x-10+a,y+23);ctx.closePath();ctx.fill();
      line(ctx,x-11,y,x+11,y,1,'rgba(49,46,35,.58)');break;
    }
    case 'rootBorder':
      for(let i=0;i<4;i++){
        const px=x+i*13;
        ctx.strokeStyle='rgba(91,53,58,.32)';ctx.lineWidth=2+i%2;ctx.beginPath();ctx.moveTo(px,y);
        ctx.quadraticCurveTo(px+9+sway*3,y-23,px+8+Math.sin(i)*8,y-45-i*8);ctx.stroke();
      }break;
    case 'flowerBorder':
      for(let i=0;i<5;i++){
        const px=x+i*11,py=y-7-i%2*13,spread=1+.7*(.5+.5*Math.sin(t*.0007-i*.45));
        line(ctx,px,y+8,px,py,1,'rgba(62,71,40,.35)');
        ctx.fillStyle='rgba(141,49,49,.38)';
        for(let petal=0;petal<4;petal++){
          const angle=petal*Math.PI/2+.2;
          ctx.beginPath();ctx.ellipse(px+Math.cos(angle)*3,py+Math.sin(angle)*3,spread*3,spread,angle,0,TAU);ctx.fill();
        }
      }break;
    case 'lanternGlow':
      for(let i=0;i<2;i++){
        const px=i?w-x:x;
        rect(ctx,px-11,y-15,22,34,'rgba(107,58,49,.38)');
        glow(ctx,px,y,42,'187,99,66',.07+pulse*.04);line(ctx,px,y-15,px,y-40,1,'rgba(90,72,54,.57)');
      }break;
    case 'doorReply':{
      const height=h*.2,gap=5+2*sway;
      rect(ctx,x-38,y-height,76,height,'rgba(21,24,21,.49)');
      rect(ctx,x-36,y-height+2,70-gap,height-4,'rgba(70,61,45,.46)');
      rect(ctx,x+34-gap,y-height+3,gap,height-6,'rgba(164,151,110,.1)');break;
    }
    case 'shutterLift':{
      const height=h*.18,bottom=y-3-2*sway;
      rect(ctx,x-52,y-height,104,height,'rgba(15,24,21,.55)');
      rect(ctx,x-49,y-height+2,98,bottom-y+height,'rgba(86,91,80,.36)');
      for(let py=y-height+9;py<bottom;py+=10)line(ctx,x-49,py,x+49,py,1,'rgba(37,43,37,.6)');
      line(ctx,x-49,bottom,x+49,bottom,2,'rgba(135,131,108,.4)');break;
    }
    case 'lampReply':{
      const level=progress===null?.045+pulse*.015:.025+.11*Math.sin(progress*Math.PI)**2;
      rect(ctx,x-13,y-7,26,14,'rgba(34,40,34,.8)');rect(ctx,x-5,y-3,10,6,'rgba(147,151,107,.45)');
      glow(ctx,x,y,40,'182,174,126',level);break;
    }
    case 'pipePurge':{
      const p=progress===null?(t%1800)/1800:progress;
      line(ctx,x-30,y-50,x-30,y,9,'rgba(71,83,73,.46)');line(ctx,x-30,y,x,y,8,'rgba(82,91,79,.46)');
      for(let i=0;i<3;i++){
        const local=limit(p*3-i),amount=Math.sin(local*Math.PI);
        for(let j=0;j<3;j++)glow(ctx,x+9+local*34+j*7,y-local*40-j*8,8+j*5,'172,184,166',amount*.05);
      }break;
    }
    case 'pianoKeyReply':{
      const response=progress===null?0:Math.sin(progress*Math.PI),keyY=y-11+response*3;
      rect(ctx,x-59,y-52,118,58,'rgba(42,33,28,.8)');
      line(ctx,x-63,y-53,x+63,y-53,5,'rgba(92,79,59,.65)');
      for(let i=0;i<7;i++){
        const px=x-52+i*15,py=i===3?keyY:y-11;
        rect(ctx,px,py,14,22,'rgba(179,176,154,.72)');
        line(ctx,px,py+22,px+13,py+22,1,'rgba(29,29,22,.75)');
      }
      for(const i of [0,1,3,4,5])rect(ctx,x-43+i*15,y-12,8,13,'rgba(15,18,16,.95)');
      line(ctx,x-51,y+16,x-51,y+48,5,'rgba(58,43,32,.65)');line(ctx,x+51,y+16,x+51,y+48,5,'rgba(58,43,32,.65)');
      break;
    }
    case 'ropePendulum':{
      line(ctx,x-69,y-7,x+69,y-7,7,'rgba(85,72,49,.53)');
      for(const offset of [-38,0,38]){
        const drift=offset===0?sway*1.8:0,px=x+offset;
        line(ctx,px,y-7,px+drift,y+72,2,'rgba(151,139,104,.48)');
        ctx.strokeStyle='rgba(151,139,104,.48)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(px+drift,y+87,6,14,0,0,TAU);ctx.stroke();
      }
      break;
    }
    case 'cellDoorReply':{
      const p=progress===null?0:progress,shake=Math.sin(p*TAU*5)*Math.sin(p*Math.PI)*2;
      rect(ctx,x-38,y-h*.2,76,h*.2,'rgba(17,22,20,.8)');
      for(let i=0;i<6;i++)line(ctx,x-31+i*12+shake,y-h*.2+4,x-31+i*12+shake,y-3,3,'rgba(115,119,103,.5)');
      line(ctx,x-34+shake,y-h*.2+5,x+34+shake,y-h*.2+5,4,'rgba(93,103,89,.55)');
      line(ctx,x-34+shake,y-4,x+34+shake,y-4,4,'rgba(93,103,89,.55)');
      rect(ctx,x+18+shake,y-h*.1,8,5,'rgba(142,136,106,.56)');
      break;
    }
    case 'cubeTurn':{
      const a=t*.00019,cos=Math.cos(a),sin=Math.sin(a),size=32;
      const vertices=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([px,py,pz])=>{
        const rx=px*cos-pz*sin,depth=px*sin+pz*cos;
        return {x:x+rx*size,y:y+py*size*.83-depth*size*.3,z:depth};
      });
      const faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]].map((indices,i)=>({indices,i,z:indices.reduce((sum,index)=>sum+vertices[index].z,0)/4})).sort((left,right)=>left.z-right.z);
      rect(ctx,x-21,y+36,42,22,'rgba(57,60,50,.7)');rect(ctx,x-37,y+57,74,6,'rgba(91,91,69,.38)');
      for(const face of faces){
        const points=face.indices.map(index=>vertices[index]);
        ctx.fillStyle=['#555747','#6a6550','#75745b','#414b43','#4f5b50','#655c49'][face.i];
        ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(const point of points.slice(1))ctx.lineTo(point.x,point.y);ctx.closePath();ctx.fill();
        ctx.strokeStyle='rgba(15,23,20,.8)';ctx.lineWidth=2;ctx.stroke();
      }
      break;
    }
    case 'washroomHoleReply':{
      const response=progress===null?0:Math.sin(progress*Math.PI)**2;
      ctx.save();ctx.translate(x,y);ctx.scale(.78,1);
      glow(ctx,0,0,36,'176,183,153',response*.16);ctx.restore();
      break;
    }
    case 'paintingGlint':{
      // Only the glass changes. No official painting or figure is invented.
      rect(ctx,x-61,y-46,122,92,'#51493a');rect(ctx,x-55,y-40,110,80,'#1d2522');
      const drift=sway*16;
      path(ctx,[[x-31+drift,y-36],[x-48+drift,y+35]],'rgba(169,178,157,.12)',6);
      path(ctx,[[x-16+drift,y-36],[x-33+drift,y+35]],'rgba(169,178,157,.06)',2);
      break;
    }
    case 'closedDoorReply':{
      const p=progress===null?0:progress,shake=Math.sin(p*TAU*4)*Math.sin(p*Math.PI)*.8;
      const width=w*.088,height=h*.25,left=x-width*.5,top=y-height;
      // Fixed frame and opaque slab: moving inset details cannot reveal a gap.
      rect(ctx,left-7,top-7,width+14,height+7,'#4e4b3e');rect(ctx,left,top,width,height,'#403b30');
      for(const offset of [0,height*.43]){
        ctx.strokeStyle='rgba(125,108,78,.4)';ctx.lineWidth=2;
        ctx.strokeRect(left+12+shake,top+14+offset,width-24,height*.34);
      }
      rect(ctx,left+width-16+shake,top+height*.56,5,10,'#a09c7f');
      break;
    }
    case 'chapelCandleLean':{
      const lean=sway*3.2,floor=h*.57;
      for(let i=0;i<3;i++){
        const px=x+(i-1)*19,py=y+(i===1?-12:0);
        // The source chapel uses candlesticks; their feet stay on the rear floor.
        line(ctx,px,py+8,px,floor-3,2,'rgba(97,83,57,.65)');
        rect(ctx,px-9,floor-3,18,3,'rgba(97,83,57,.65)');
        rect(ctx,px-3,py-24,6,29,'rgba(157,143,110,.72)');
        rect(ctx,px-7,py+5,14,3,'rgba(97,83,57,.65)');
        ctx.fillStyle='rgba(211,175,94,.66)';ctx.beginPath();ctx.moveTo(px-3,py-24);
        ctx.quadraticCurveTo(px-4+lean,py-30,px+lean,py-39);
        ctx.quadraticCurveTo(px+5+lean,py-30,px+3,py-24);ctx.closePath();ctx.fill();
        glow(ctx,px,py-27,23,'186,137,67',.035+pulse*.015);
      }
      break;
    }
    case 'officeBlindSway':{
      const width=112,height=103,shift=sway*1.8;
      rect(ctx,x-width*.5-4,y-4,width+8,height+8,'#4a4b40');
      rect(ctx,x-width*.5,y,width,height,'#1b2825');
      for(let i=0;i<11;i++){
        const py=y+i*9+shift*i/11;
        line(ctx,x-width*.5+2,py,x+width*.5-2,py+shift,4,'rgba(99,113,89,.62)');
      }
      line(ctx,x-30,y,x-30,y+height,1,'rgba(146,147,116,.35)');
      line(ctx,x+30,y,x+30,y+height,1,'rgba(146,147,116,.35)');
      break;
    }
    default:break;
  }
  ctx.restore();
}

/** Returns the exact rendered proposal IDs; unbound proposals remain unproduced. */
export function drawStageReferenceTracks(ctx,w,h,stage,time,{reducedMotion=false}={}) {
  if(stage?.reference?.blocked)return [];
  const tracks=(stage?.referenceTracks || []).filter(track=>!track.event&&stageReferenceTrackAllowed(stage,track));
  const visualTime=reducedMotion?0:time;
  for(const track of tracks)referenceTrack(ctx,w,h,track,visualTime);
  return tracks.map(track=>track.id);
}

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
export function drawStageCinematics(ctx,w,h,stage,director,{reducedMotion=false,hazards=[]}={}) {
  const event=director?.activeEvent;
  if(!event||!stageReferenceEventAllowed(stage,event.id))return;
  if (director.linkedHazard && event.hazard) return; // physical instance drawn by the hitbox-aligned pass
  if(event.hazard&&hazards.some(hazard=>hazard.id===event.hazard&&(hazard.timer>0||hazard.active>0)))return;
  const cue=stageChoreographyProfile(stage).cues.find(entry=>entry.event===event.id);
  if(!cue)return;
  const total=Math.max(1,event.duration||120);
  const elapsed=limit(total-(director.activeTimer||0),0,total);
  const progress=elapsed/total;
  const opacity=band(0,.12,progress)*(1-band(.88,1,progress));
  ctx.save();ctx.globalAlpha*=opacity;
  // Freeze both clocks for decorative motion, including progress-driven travel.
  // Keep the live event fade; linked physical hazards still use collision geometry.
  const visualElapsed=reducedMotion ? total*.5 : elapsed;
  const visualProgress=reducedMotion ? .5 : progress;
  if(cue.referenceTracks){
    for(const track of stage.referenceTracks.filter(track=>cue.referenceTracks.includes(track.id)))referenceTrack(ctx,w,h,track,visualElapsed*(1000/60),visualProgress);
  }else setpiece(ctx,w,h,cue,visualElapsed,visualProgress,Boolean(reducedMotion));
  ctx.restore();
}
