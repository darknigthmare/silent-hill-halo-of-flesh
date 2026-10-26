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
function carouselSculpture(ctx,x,y,scale,color){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=color;
  ctx.beginPath();ctx.ellipse(0,0,29,12,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.moveTo(15,-7);ctx.lineTo(26,-31);ctx.lineTo(37,-32);ctx.lineTo(45,-23);ctx.lineTo(35,-17);ctx.lineTo(27,7);ctx.closePath();ctx.fill();
  for(const side of[-1,1]){line(ctx,side*18,5,side*25,26,5,color);line(ctx,side*25,26,side*15,26,4,color);}
  path(ctx,[[-27,-5],[-39,-16],[-42,2]],color,4);ctx.restore();
}

/** Original, deliberately small scenery prototypes. Never draw an actor or a hitbox. */
function referenceTrack(ctx,w,h,track,time,progress=null) {
  const x=track.anchor.x*w,y=track.anchor.y*h,t=Number.isFinite(time)?Math.max(0,time):0;
  const pulse=.5+.5*Math.sin(t*.0012),sway=Math.sin(t*.0008);
  const reply=progress===null?0:Math.sin(progress*Math.PI)*Math.sin(progress*Math.PI*6);
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
    case 'subwayDoorCycle':{
      const height=h*.24,phase=(t%10000)/10000,close=phase<.42?0:Math.sin((phase-.42)/.58*Math.PI)**2,gap=36*(1-close);
      // The complete car stays still; only the panels move within their frame.
      rect(ctx,x-186,y-height,372,height,'#47514a');rect(ctx,x-181,y-height+5,362,height-10,'#59615a');
      for(const side of [-1,1]){
        rect(ctx,x+side*123-32,y-height+25,64,49,'#151e1c');
        line(ctx,x+side*123-32,y-height+76,x+side*123+32,y-height+76,2,'#767b6b');
      }
      rect(ctx,x-51,y-height+10,102,height-13,'#111b18');
      for(const side of [-1,1]){
        const left=side<0?x-48:x+gap*.5,width=48-gap*.5;
        rect(ctx,left,y-height+13,width,height-19,'#6b7467');
        rect(ctx,left+4,y-height+29,width-8,42,'#202c25');
      }
      line(ctx,x-186,y-2,x+186,y-2,4,'#323c34');
      break;
    }
    case 'forestWindLayers':{
      for(const side of [-1,1]){
        const px=x+side*w*.4,base=y,tip=px-side*47;
        line(ctx,px,base,px,base-158,8,'rgba(24,31,23,.68)');
        path(ctx,[[px,base-109],[tip,base-142],[tip-side*32+sway*4,base-159]],'rgba(43,54,35,.65)',5);
        for(let i=0;i<7;i++){
          const foot=x+side*(w*.36+i*11),grass=Math.sin(t*.0015+i*.3)*3;
          path(ctx,[[foot,h*.79],[foot+grass,h*.79-17],[foot+grass+side*6,h*.79-30-i%3*4]],'rgba(72,81,49,.53)',2);
        }
      }
      break;
    }
    case 'waterwheelTurn':{
      const angle=t*.00016,rx=97,ry=27,floor=h*.57;
      ctx.fillStyle='#101916';ctx.beginPath();ctx.ellipse(x,y,112,37,0,0,TAU);ctx.fill();
      ctx.strokeStyle='#616151';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.stroke();
      for(let i=0;i<6;i++){
        const a=angle+i*TAU/6;
        line(ctx,x,y,x+Math.cos(a)*rx,y+Math.sin(a)*ry,5,'rgba(129,110,80,.68)');
      }
      line(ctx,x,y-115,x,y,9,'#59584a');
      line(ctx,x-26,y-115,x+26,y-115,6,'#5a594b');
      // Fixed foreground rim hides the lower rotor, on a dry rear walkway.
      rect(ctx,x-113,y+18,226,floor-y-18,'#45493d');
      line(ctx,x-113,y+18,x+113,y+18,5,'#777363');
      break;
    }
    case 'wheelchairDrift':{
      const phase=(t%16000)/16000,roll=phase<.35?ease(phase/.35):phase>.8?1-ease((phase-.8)/.2):1;
      const turn=band(.35,.55,phase)*(1-band(.65,.8,phase));
      ctx.translate(x+roll*36,y);ctx.scale(1-turn*.24,1);
      // An empty frame from the workbook proposal, never an autonomous enemy.
      ctx.strokeStyle='rgba(151,153,132,.62)';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(-12,-20,20,0,TAU);ctx.stroke();
      ctx.beginPath();ctx.arc(32,-5,5,0,TAU);ctx.stroke();
      line(ctx,-12,-20,24,-20,3,'rgba(111,123,109,.7)');line(ctx,24,-20,32,-5,3,'rgba(111,123,109,.7)');
      line(ctx,-18,-64,-12,-20,3,'rgba(111,123,109,.7)');line(ctx,-18,-64,-26,-64,3,'rgba(111,123,109,.7)');
      rect(ctx,-15,-61,7,27,'#51594b');rect(ctx,-12,-38,33,6,'#51594b');
      line(ctx,21,-35,24,-20,3,'rgba(111,123,109,.7)');line(ctx,30,-14,41,-14,3,'rgba(111,123,109,.7)');
      break;
    }
    case 'lecternGlint':{
      rect(ctx,x-35,y-104,70,98,'#493e2d');rect(ctx,x-49,y-7,98,7,'#5a4b35');
      ctx.fillStyle='#716047';ctx.beginPath();ctx.moveTo(x-56,y-102);ctx.lineTo(x+56,y-102);ctx.lineTo(x+48,y-124);ctx.lineTo(x-48,y-124);ctx.closePath();ctx.fill();
      line(ctx,x-25,y-91,x-25,y-16,2,'rgba(122,102,71,.4)');line(ctx,x+25,y-91,x+25,y-16,2,'rgba(122,102,71,.4)');
      line(ctx,x-33+sway*8,y-112,x-5+sway*8,y-112,2,`rgba(203,187,140,${.12+pulse*.12})`);
      break;
    }
    case 'atticDustFall':{
      // Authored rafters stay attached to the ceiling; no hanging puzzle prop.
      for(const side of [-1,1]){
        line(ctx,x,y-25,x+side*w*.32,y+90,9,'rgba(87,68,43,.65)');
        line(ctx,x+side*w*.32,y+90,x+side*w*.32,h*.57,6,'rgba(87,68,43,.65)');
      }
      line(ctx,x-w*.32,y+90,x+w*.32,y+90,7,'rgba(87,68,43,.65)');
      for(let i=0;i<27;i++){
        const px=x-w*.24+(i*47)%(w*.48)+Math.sin(t*.0005+i)*2,py=y+94+(i*37+t*.011*(1+i%2))%116;
        rect(ctx,px,py,1+i%2,1,'rgba(170,153,113,.24)');
      }
      break;
    }
    case 'mineBeamDrips':{
      const floor=h*.57;
      for(const side of [-1,1])line(ctx,x+side*83,0,x+side*83,y+7,5,'#3b4640');
      rect(ctx,x-90,y,180,11,'#586052');line(ctx,x-90,y+12,x+90,y+12,2,'#85856b');
      for(let i=0;i<3;i++){
        const phase=((t+i*1030)%3700)/3700,px=x+(i-1)*54,py=y+15+phase*(floor-y-18);
        line(ctx,px,py,px,py+5,1,'rgba(151,181,178,.48)');
        orb(ctx,px,py+6,1.5,'rgba(151,181,178,.4)');
      }
      break;
    }
    case 'cellBarShadows':{
      const height=h*.23,skew=28+sway*18;
      rect(ctx,x-66,y-height,132,height,'#15201c');
      for(let i=0;i<6;i++){
        const px=x-56+i*22;
        line(ctx,px,y-height+5,px,y-3,3,'#697062');
        line(ctx,px,y+2,px+skew,y+h*.15,3,'rgba(0,0,0,.22)');
      }
      line(ctx,x-64,y-height+3,x+64,y-height+3,4,'#555f50');line(ctx,x-64,y-2,x+64,y-2,4,'#555f50');
      break;
    }
    case 'boilerHearthGlow':{
      ctx.fillStyle='#151a13';ctx.beginPath();ctx.ellipse(x,y,108,35,0,0,TAU);ctx.fill();
      glow(ctx,x,y-12,75,'191,83,29',.12+pulse*.08);
      ctx.fillStyle=`rgba(189,89,30,${.25+pulse*.18})`;ctx.beginPath();ctx.ellipse(x,y-3,75,19,0,0,TAU);ctx.fill();
      ctx.strokeStyle='#6c5133';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,y,103,31,0,0,TAU);ctx.stroke();
      for(let i=0;i<9;i++){const a=i*TAU/9,px=x+Math.cos(a)*101,py=y+Math.sin(a)*30;line(ctx,px,py,px,py-18,3,'#514a33');}
      break;
    }
    case 'canalCableSway':{
      rect(ctx,x-138,y-4,276,38,'#142d29');
      for(let i=0;i<3;i++){
        const radius=10+(t*.006+i*16)%45;ctx.strokeStyle='rgba(116,154,144,.2)';ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(x+(i-1)*73,y+12,radius,radius*.1,0,0,TAU);ctx.stroke();
      }
      rect(ctx,x-148,y+32,296,10,'#586151');rect(ctx,x-148,y+43,296,6,'#333f32');
      rect(ctx,x-167,y-39,15,20,'#626958');
      ctx.strokeStyle='#101a14';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-159,y-22);ctx.lineTo(x-159,y+28);
      ctx.bezierCurveTo(x-105,y+30+sway*2,x-42,y+38-sway*2,x+42,y+34);ctx.stroke();
      break;
    }
    case 'sh1CarouselOrbit':{
      const rideTime=t*.00012;
      // One fixed sculpture is the workbook's reference point, not a rider.
      line(ctx,x-w*.21,h*.25,x-w*.21,y+16,2,'#5d5b45');
      carouselSculpture(ctx,x-w*.21,y-45,.75,'#7a7157');
      for(let i=0;i<3;i++){
        const a=rideTime+i*TAU/3,px=x+Math.cos(a)*w*.18,py=y-49+Math.sin(a)*15;
        line(ctx,px,h*.25,px,y+16,2,'#5d5b45');carouselSculpture(ctx,px,py,.65+Math.sin(a)*.09,'#887e60');
      }
      line(ctx,x-w*.29,y+28,x+w*.29,y+28,4,'#5a5540');
      break;
    }
    case 'sh3HorseBob':{
      for(let i=0;i<3;i++){
        const px=x+(i-1)*w*.16,py=y-50+Math.sin(t*.0009+i*1.2)*7;
        line(ctx,px,h*.25,px,y+18,3,'#82745a');carouselSculpture(ctx,px,py,.85,'#8a8270');
      }
      line(ctx,x-w*.29,y+28,x+w*.29,y+28,4,'#5a5540');
      break;
    }
    case 'freezerCarcassSway':{
      // The rail and the hook hold their position; only this one abstract rack moves.
      line(ctx,x,y,x,y+31,2,'#737764');
      ctx.strokeStyle='#737764';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y+39,8,-Math.PI*.5,Math.PI);ctx.stroke();
      ctx.translate(x,y+47);ctx.rotate(Math.sin(t*.00045)*.024);
      ctx.fillStyle='#484737';ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(12,1);
      ctx.quadraticCurveTo(32,33,23,76);ctx.lineTo(8,137);ctx.lineTo(-14,132);
      ctx.quadraticCurveTo(-30,84,-25,42);ctx.closePath();ctx.fill();
      path(ctx,[[2,8],[7,47],[-1,92],[-4,128]],'rgba(106,100,73,.32)',3);
      break;
    }
    case 'rooftopFenceFlex':{
      const left=x-w*.22,right=x+w*.22,top=y-h*.2,flex=Math.sin(t*.0011)*1.5;
      for(let i=0;i<5;i++){const px=left+(right-left)*i/4;line(ctx,px,top-7,px,y,4,'#4c564b');}
      line(ctx,left,top,right,top,3,'#60695b');line(ctx,left,y,right,y,3,'#60695b');
      for(let i=0;i<17;i++){
        const px=left+(right-left)*i/16,spread=(right-left)/16;
        // Each mesh end remains on the fixed frame, with a tiny authored bow.
        ctx.strokeStyle='rgba(119,131,110,.42)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(px,top);ctx.quadraticCurveTo(px+spread*.6+flex,top+(y-top)*.5,Math.min(right,px+spread),y);ctx.stroke();
        ctx.beginPath();ctx.moveTo(px,y);ctx.quadraticCurveTo(px+spread*.6-flex,top+(y-top)*.5,Math.min(right,px+spread),top);ctx.stroke();
      }
      break;
    }
    case 'stairwellFanTurn':{
      const rx=110,ry=31,angle=t*.00065;
      ctx.fillStyle='#0b1511';ctx.beginPath();ctx.ellipse(x,y,rx+8,ry+7,0,0,TAU);ctx.fill();
      ctx.strokeStyle='#6a705d';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.stroke();
      for(let i=0;i<4;i++){
        const a=angle+i*TAU/4,b=a+.45;
        ctx.fillStyle='rgba(116,120,94,.63)';ctx.beginPath();ctx.moveTo(x,y);
        ctx.lineTo(x+Math.cos(a)*101,y+Math.sin(a)*27);ctx.lineTo(x+Math.cos(b)*91,y+Math.sin(b)*24);ctx.closePath();ctx.fill();
      }
      // The fixture stays on its cross-bracing; no sway or falling rotor.
      line(ctx,x-rx-11,y,x+rx+11,y,2,'rgba(126,132,110,.4)');line(ctx,x,y-ry-4,x,y+ry+4,2,'rgba(126,132,110,.4)');
      orb(ctx,x,y,5,'#9c9c7c');
      break;
    }
    case 'artaudSpotlightGlide':{
      for(const side of[-1,1]){
        const lampX=w*(.5+side*.14),lampY=h*.2,intensity=.035+pulse*.025;
        ctx.fillStyle=`rgba(199,182,126,${intensity})`;ctx.beginPath();ctx.moveTo(lampX-8,lampY);
        ctx.lineTo(lampX+8,lampY);ctx.lineTo(x+side*w*.055+w*.15,h*.55);ctx.lineTo(x+side*w*.055-w*.15,h*.55);ctx.closePath();ctx.fill();
        glow(ctx,x+side*w*.055,y,95,'184,166,114',.025+pulse*.025);
      }
      break;
    }
    case 'pursuitElevatorGap':{
      const width=139,height=h*.34,gap=12+sway*2,top=y-height;
      rect(ctx,x-width*.5-10,top-8,width+20,height+8,'#515447');
      rect(ctx,x-width*.5,top,width,height,'#101a14');
      for(const side of[-1,1]){
        const left=side<0?x-width*.5:x+gap*.5,panelWidth=width*.5-gap*.5;
        rect(ctx,left,top+3,panelWidth,height-3,'#41483b');
        line(ctx,left+panelWidth*.4,top+6,left+panelWidth*.4,y-4,1,'rgba(116,121,94,.25)');
      }
      line(ctx,x-width*.5-6,y,x+width*.5+6,y,4,'#6a6b56');
      // No button lights, human shadows or sound waveform invent a cutscene loop.
      break;
    }
    case 'blueStairRailReply':{
      for(const side of[-1,1])line(ctx,x+side*94,y-73,x+side*94,y-3,3,'#657365');
      ctx.strokeStyle='#889080';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-94,y-73);ctx.quadraticCurveTo(x,y-73+reply*3,x+94,y-73);ctx.stroke();
      if(progress!==null){const drop=band(.16,.8,progress);orb(ctx,x+18,y-67+drop*79,1.4,'rgba(169,192,180,.6)');}
      break;
    }
    case 'splitWormGrateReply':{
      const left=x-83,right=x+83,top=y-82;
      line(ctx,left,top,right,top,4,'#706c52');line(ctx,left,y,right,y,4,'#706c52');
      for(let i=0;i<9;i++){
        const px=left+i*(right-left)/8;ctx.strokeStyle='rgba(128,126,94,.58)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(px,top);
        ctx.quadraticCurveTo(px+reply*(1-Math.abs(i-4)/5)*4,y-41,px,y);ctx.stroke();
      }
      break;
    }
    case 'atriumSupportReply':{
      line(ctx,x,0,x,y+32,3,'#645e48');
      ctx.save();ctx.translate(x,y+32);ctx.rotate(reply*.018);
      ctx.strokeStyle='#8c7b56';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,13,15,20,0,0,TAU);ctx.stroke();
      line(ctx,-14,32,14,32,3,'#63593f');ctx.restore();
      break;
    }
    case 'policeCellLightDust':{
      const light=ctx.createLinearGradient(x,y-42,x,y+120);light.addColorStop(0,'rgba(169,169,133,.10)');light.addColorStop(1,'rgba(169,169,133,0)');
      ctx.fillStyle=light;ctx.beginPath();ctx.moveTo(x-11,y-42);ctx.lineTo(x+11,y-42);ctx.lineTo(x+90,y+120);ctx.lineTo(x-90,y+120);ctx.closePath();ctx.fill();
      for(let i=0;i<21;i++){const py=y-20+(i*19+t*.008)%126,px=x-65+(i*41)%130+Math.sin(t*.0007+i)*3;rect(ctx,px,py,1,1,'rgba(184,179,146,.24)');}
      break;
    }
    case 'policeCellBarsReply':{
      const top=y-153;
      for(let i=0;i<7;i++){
        const px=x-69+i*23;ctx.strokeStyle='#787758';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,top);ctx.quadraticCurveTo(px+reply*1.5,y-76,px,y);ctx.stroke();
      }
      line(ctx,x-73,top,x+73,top,4,'#68694e');line(ctx,x-73,y-2,x+73,y-2,4,'#68694e');
      rect(ctx,x+48,y-83,16,31,'#66674c');orb(ctx,x+56,y-68,2,'#181f15');
      break;
    }
    case 'overlookHCCellReply':{
      const top=y-166,offset=reply*1.6;
      line(ctx,x-57,top,x-57,y,5,'#697263');line(ctx,x+57,top,x+57,y,5,'#697263');
      for(let i=0;i<6;i++)line(ctx,x-48+i*19,top+4,x-48+i*19+offset,y-4,3,'#7b7c60');
      for(const py of[top+32,y-41])line(ctx,x-52,py,x+52,py,3,'#77785c');
      rect(ctx,x+34+offset,y-90,19,27,'#545d49');
      break;
    }
    case 'overlookHCBarLight':{
      const skew=24+Math.sin(t*.0006)*13;
      for(let i=0;i<6;i++)line(ctx,x-48+i*19,y+3,x-48+i*19+skew,y+88,3,'rgba(0,0,0,.2)');
      break;
    }
    case 'overlookDPDoorReply':{
      const top=y-167,offset=reply*1.3;
      rect(ctx,x-65,top,130,167,'#17211b');rect(ctx,x-57+offset,y-59,114,56,'#374235');
      for(let i=0;i<6;i++)line(ctx,x-47+i*19+offset,top+6,x-47+i*19+offset,y-59,3,'#747961');
      line(ctx,x-62,top,x-62,y,4,'#626d58');line(ctx,x+62,top,x+62,y,4,'#626d58');
      for(const py of[top+31,y-31])orb(ctx,x-62,py,3,'#8c9076');
      break;
    }
    case 'pearlCreekRainDepth':{
      const wind=7+Math.sin(t*.00017)*4;
      for(let i=0;i<47;i++){
        const px=(i*97+t*.012*(1+i%3))%(w+40)-20,py=h*.22+(i*43+t*.072*(1+i%2))%(h*.43);
        line(ctx,px,py,px-wind,py+16+i%5,1,'rgba(152,180,180,.19)');
      }
      break;
    }
    case 'pearlCreekPuddles':{
      for(let i=0;i<3;i++){
        const px=x+(i-1)*w*.29,py=y+i%2*8,rx=58+i*17;
        ctx.fillStyle='rgba(39,66,65,.3)';ctx.beginPath();ctx.ellipse(px,py,rx,9+i*2,0,0,TAU);ctx.fill();
        for(let n=0;n<2;n++){const phase=((t+i*370+n*630)%1700)/1700;ctx.strokeStyle=`rgba(152,180,176,${.2*(1-phase)})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(px-17+n*23,py,phase*rx*.65,phase*5,0,0,TAU);ctx.stroke();}
      }
      break;
    }
    case 'bomFireGrateGlow':{
      rect(ctx,x-170,y-37,340,73,'#131a12');
      for(let i=0;i<7;i++){
        const px=x-132+i*44,heat=.5+.5*Math.sin(t*.0015+i*.7);
        glow(ctx,px,y,28,'213,120,39',.12+heat*.08);
        ctx.fillStyle=`rgba(197,107,27,${.32+heat*.19})`;ctx.beginPath();ctx.moveTo(px-9,y+19);ctx.quadraticCurveTo(px-11,y+3,px+Math.sin(t*.001+i)*4,y-13-heat*12);ctx.quadraticCurveTo(px+12,y+3,px+8,y+19);ctx.closePath();ctx.fill();
      }
      for(let i=0;i<17;i++){const px=x-170+i*21;line(ctx,px,y-34,px+23,y+33,4,'#596044');}
      line(ctx,x-173,y-39,x+173,y-39,6,'#6d704f');line(ctx,x-173,y+37,x+173,y+37,6,'#6d704f');
      break;
    }
    case 'bomFireEmberDepth':{
      for(let i=0;i<15;i++){
        const phase=((t+i*237)%3400)/3400,px=x-150+i*21+Math.sin(phase*4+i)*7,py=y-10-phase*93;
        rect(ctx,px,py,1+i%2,2,`rgba(219,146,59,${.23*(1-phase)})`);
      }
      break;
    }
    case 'bomWoodBareBranches':{
      for(const side of[-1,1]){
        const px=x+side*w*.28,tip=px+side*31;
        line(ctx,px,y,px-side*10,y-138,9,'#394131');
        path(ctx,[[px,y-77],[tip,y-115],[tip+side*21+sway*2,y-154]],'#4b503b',4);
        path(ctx,[[px-side*5,y-101],[px-side*39,y-127],[px-side*53+sway*2,y-142]],'#424b35',3);
      }
      break;
    }
    case 'bomWoodBarkReply':{
      for(let i=0;i<11;i++){
        const phase=progress??0,px=x+(i-5)*2+Math.sin(i*7)*phase*17,py=y-24+phase*(41+i*5);
        rect(ctx,px,py,1+i%2,2+i%3,'rgba(136,117,75,.48)');
      }
      break;
    }
    case 'bomEarthGravelRoll':{
      for(let i=0;i<3;i++){
        const px=x+(i-1)*83+Math.sin(t*.00043+i*2)*9,py=y+i%2*8;
        ctx.save();ctx.translate(px,py);ctx.rotate(Math.sin(t*.00043+i*2)*.17);
        ctx.fillStyle=['#657153','#4a5941','#737557'][i];ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-3,-6);ctx.lineTo(6,-4);ctx.lineTo(9,1);ctx.lineTo(3,4);ctx.lineTo(-5,4);ctx.closePath();ctx.fill();ctx.restore();
      }
      break;
    }
    case 'bomEarthBlockReply':{
      ctx.save();ctx.translate(x+reply*1.9,y);
      ctx.fillStyle='#62694c';ctx.beginPath();ctx.moveTo(-29,-32);ctx.lineTo(19,-39);ctx.lineTo(37,-12);ctx.lineTo(30,21);ctx.lineTo(-25,24);ctx.lineTo(-36,-4);ctx.closePath();ctx.fill();
      path(ctx,[[-29,-32],[-6,-13],[19,-39]],'rgba(142,145,97,.4)',2);path(ctx,[[-6,-13],[8,18],[30,21]],'rgba(33,43,24,.5)',2);ctx.restore();
      break;
    }
    case 'gansNaveCandles':{
      for(const side of[-1,1])for(let i=0;i<4;i++){
        const px=x+side*(76+i*21),base=y+i*12,py=base-22-i*3,lean=Math.sin(t*.0015+i*.6+side)*2;
        rect(ctx,px-3,py,6,base-py,'#aca17a');rect(ctx,px-7,base,14,3,'#4d4b35');
        ctx.fillStyle='#d1b571';ctx.beginPath();ctx.moveTo(px-2,py);ctx.quadraticCurveTo(px-4+lean,py-6,px+lean,py-13);ctx.quadraticCurveTo(px+4+lean,py-6,px+2,py);ctx.closePath();ctx.fill();
        glow(ctx,px,py-5,16,'205,164,73',.06+pulse*.02);
      }
      break;
    }
    case 'hcDreamCurtainGurney':{
      const top=y-160;
      line(ctx,x-45,top,x+45,top,4,'#6f7e6b');for(const side of[-1,1])line(ctx,x+side*45,top,x+side*45,y-5,3,'#66745f');
      ctx.fillStyle='#4b6253';ctx.beginPath();ctx.moveTo(x-41,top+5);ctx.lineTo(x+41,top+5);ctx.lineTo(x+39+sway*2,y-17);ctx.lineTo(x-39+sway*2,y-17);ctx.closePath();ctx.fill();
      for(let i=0;i<7;i++)line(ctx,x-35+i*12,top+6,x-35+i*12+sway*2,y-17,2,'rgba(25,44,34,.42)');
      rect(ctx,x-154,y-50,97,11,'#697565');line(ctx,x-145,y-39,x-145,y-6,3,'#65735e');line(ctx,x-67,y-39,x-67,y-6,3,'#65735e');
      for(const px of[x-145,x-67]){ctx.strokeStyle='#65735e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px,y-6,6,0,TAU);ctx.stroke();}
      break;
    }
    case 'freezerHookColdReply':{
      line(ctx,x,y-79,x,y-10,2,'#737862');ctx.save();ctx.translate(x,y-10);ctx.rotate(reply*.04);
      ctx.strokeStyle='#7e826d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,2,9,-Math.PI*.5,Math.PI);ctx.stroke();ctx.restore();
      for(let i=0;i<3;i++){const phase=progress??0;ctx.fillStyle='rgba(164,181,164,.055)';ctx.beginPath();ctx.ellipse(x+(i-1)*18+phase*12,y+13-phase*(18+i*6),13+phase*9,4+phase*3,0,0,TAU);ctx.fill();}
      break;
    }
    case 'bomBloodSurfacePulse':{
      for(let i=0;i<3;i++){
        const px=x+(i-1)*181,py=y+i%2*19;
        ctx.fillStyle=`rgba(115,44,36,${.14+pulse*.06})`;ctx.beginPath();ctx.moveTo(px-78,py-21);ctx.lineTo(px+64,py-29);ctx.lineTo(px+84,py+28);ctx.lineTo(px-63,py+25);ctx.closePath();ctx.fill();
        line(ctx,px-54,py-6,px+31,py-10,1,`rgba(148,73,53,${.12+pulse*.08})`);
      }
      break;
    }
    case 'gansAlessaTentCloth':{
      const top=y-205;
      for(const side of[-1,1])line(ctx,x+side*107,y,x+side*97,top+37,4,'#706a5a');
      line(ctx,x,top,x,y,4,'#827464');line(ctx,x-97,top+37,x,top,3,'#827464');line(ctx,x,top,x+97,top+37,3,'#827464');
      ctx.fillStyle='#594f50';ctx.beginPath();ctx.moveTo(x,top+2);ctx.quadraticCurveTo(x+53,top+40+sway*2,x+100,top+38);ctx.lineTo(x+106,y);ctx.quadraticCurveTo(x+18,y-14+sway*2,x-105,y);ctx.lineTo(x-99,top+39);ctx.quadraticCurveTo(x-42,top+40-sway*2,x,top+2);ctx.closePath();ctx.fill();
      for(let i=0;i<7;i++)path(ctx,[[x,top+3],[x+(i-3)*24+sway,top+94],[x+(i-3)*31,y-4]],'rgba(36,32,35,.39)',2);
      break;
    }
    case 'shepherdMissingNotices':{
      const width=342,height=207,top=y-height;
      rect(ctx,x-width*.5-5,top-5,width+10,height+10,'#566054');rect(ctx,x-width*.5,top,width,height,'#707367');
      for(let i=0;i<12;i++){
        const px=x-147+(i%4)*77,py=top+13+Math.floor(i/4)*62,flap=Math.sin(t*.001+i*.7)*(i%3===0?2:0);
        ctx.fillStyle=i%2?'#a2a18b':'#8f947f';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+47,py+2);ctx.lineTo(px+46+flap,py+48);ctx.lineTo(px+flap,py+47);ctx.closePath();ctx.fill();
        line(ctx,px+7,py+10,px+39,py+10,2,'rgba(63,67,53,.48)');line(ctx,px+7,py+34,px+35,py+34,1,'rgba(63,67,53,.35)');
      }
      break;
    }
    case 'shepherdNoticeLampFog':{
      line(ctx,x,y-27,x,y-7,4,'#65715e');rect(ctx,x-24,y-10,48,8,'#5a6755');
      ctx.fillStyle='#acae8a';ctx.beginPath();ctx.ellipse(x,y,19,4,0,0,TAU);ctx.fill();
      glow(ctx,x,y+44,111,'178,184,143',.045+pulse*.025);
      for(let i=0;i<2;i++){const px=x+Math.sin(t*(i?.00023:.00016)+i)*67,py=y+49+i*37;ctx.fillStyle='rgba(139,155,136,.025)';ctx.beginPath();ctx.ellipse(px,py,105,13,0,0,TAU);ctx.fill();}
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
