import { hashCode, seededRandom, clamp } from './shared.js';
import { drawStageArchitecture, stageSpace } from './stage-architecture.js';
import { drawStageCinematics } from './stage-cinematics.js';

const TAU=Math.PI*2;
function rgba(hex,a=1){
  if(!hex||hex[0]!=='#')return hex||`rgba(255,255,255,${a})`;
  const value=hex.slice(1);const full=value.length===3?value.split('').map(c=>c+c).join(''):value;
  const n=parseInt(full,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}
function line(ctx,x1,y1,x2,y2,width,color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function ellipse(ctx,x,y,rx,ry,color,stroke=null,width=2,rotation=0){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,TAU);ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function polygon(ctx,points,color,stroke=null,width=2){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function roughLine(ctx,x1,y1,x2,y2,width,color,seed=1){const r=seededRandom(seed);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);const steps=6;for(let i=1;i<steps;i++){const t=i/steps;ctx.lineTo(x1+(x2-x1)*t+(r()-.5)*3,y1+(y2-y1)*t+(r()-.5)*3);}ctx.lineTo(x2,y2);ctx.stroke();}

function drawFog(ctx,w,h,time,intensity=.25,interior=false){
  ctx.save();ctx.globalCompositeOperation='screen';
  if(interior){
    // A closed room gets diffuse haze, not outdoor banks with hard polygon edges.
    for(let i=0;i<3;i++){
      const x=w*(.2+i*.3)+Math.sin(time*.00018+i)*w*.05,y=h*(.55+i*.1);
      ctx.save();ctx.translate(x,y);ctx.scale(1,.22);
      const g=ctx.createRadialGradient(0,0,0,0,0,w*.52);
      g.addColorStop(0,`rgba(206,215,204,${intensity*.095})`);
      g.addColorStop(.6,`rgba(206,215,204,${intensity*.045})`);
      g.addColorStop(1,'rgba(206,215,204,0)');ctx.fillStyle=g;
      ctx.fillRect(-w*.52,-w*.52,w*1.04,w*1.04);ctx.restore();
    }
    ctx.restore();return;
  }
  for(let i=0;i<6;i++){
    const y=h*(.38+i*.105)+Math.sin(time*.00021+i*1.7)*18;
    const g=ctx.createLinearGradient(-80,y,w+80,y+50);g.addColorStop(0,'rgba(210,214,206,0)');g.addColorStop(.28,`rgba(210,214,206,${intensity*.25})`);g.addColorStop(.52,`rgba(230,232,225,${intensity*.42})`);g.addColorStop(.78,`rgba(210,214,206,${intensity*.2})`);g.addColorStop(1,'rgba(210,214,206,0)');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(-100,y);for(let x=-100;x<w+120;x+=70)ctx.lineTo(x,y+Math.sin(x*.009+i+time*.00012)*24);ctx.lineTo(w+100,y+90);ctx.lineTo(-100,y+75);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
function drawRain(ctx,w,h,time,amount=100,color='rgba(190,205,207,.32)'){
  const r=seededRandom(4812);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1.5;for(let i=0;i<amount;i++){const x=(r()*w+time*.22*(.6+r()))%w;const y=(r()*h+time*.58*(.7+r()))%h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+24);ctx.stroke();}ctx.restore();
}
function drawParticles(ctx,w,h,time,type){
  const seed=hashCode(type||'fog');const r=seededRandom(seed);ctx.save();
  const count=type==='embers'||type==='petals'||type==='snow'?80:45;
  for(let i=0;i<count;i++){
    const speed=.015+r()*.045;let x=(r()*w+time*speed*(type==='rain'?10:1))%w;let y=(r()*h+time*speed*(type==='embers'?-1:1))%h;if(type==='embers')y=h-y;
    const size=1+r()*3;
    if(type==='petals'){ctx.fillStyle=`rgba(180,93,104,${.16+r()*.35})`;ctx.save();ctx.translate(x,y);ctx.rotate(time*.001+r()*TAU);ctx.fillRect(-size*1.6,-size*.5,size*3.2,size);ctx.restore();}
    else if(type==='snow'){ctx.fillStyle=`rgba(225,235,236,${.15+r()*.45})`;ellipse(ctx,x,y,size,size,'rgba(225,235,236,.35)');}
    else if(type==='embers'){ctx.fillStyle=`rgba(196,72,43,${.18+r()*.45})`;ctx.fillRect(x,y,size,size*1.7);}
    else if(type==='ash'||type==='dust'||type==='spores'){ctx.fillStyle=`rgba(188,184,166,${.08+r()*.22})`;ellipse(ctx,x,y,size,size*.65,ctx.fillStyle);}
    else if(type==='sparks'){ctx.strokeStyle=`rgba(221,184,95,${.2+r()*.45})`;line(ctx,x,y,x+8+r()*10,y-4-r()*8,1,ctx.strokeStyle);}
    else if(type==='runes'){ctx.fillStyle=`rgba(176,116,173,${.08+r()*.22})`;ctx.fillRect(x,y,1+r()*2,5+r()*7);}
    else if(type==='blood'){ctx.fillStyle=`rgba(125,24,31,${.1+r()*.2})`;ellipse(ctx,x,y,size,size*2,ctx.fillStyle);}
    else if(type==='light'){ctx.fillStyle=`rgba(236,224,164,${.08+r()*.25})`;ellipse(ctx,x,y,size*2,size*2,ctx.fillStyle);}
    else if(type==='flicker'&&i<8){ctx.fillStyle=`rgba(245,224,171,${.02+r()*.06})`;ctx.fillRect(0,y,w,2+r()*7);}
  }
  ctx.restore();
}

function drawOtherworldOverlay(ctx,w,h,time,amount=0,style='rust',element='fire'){
  const strength=clamp(amount,0,1);if(strength<=.001)return;
  const palettes={
    rust:['54,9,11','93,26,21','25,5,5'],decay:['25,34,25','47,57,40','7,13,10'],flesh:['70,12,23','104,35,43','31,6,11'],
    haunting:['24,22,30','46,40,52','6,7,9'],mirror:['35,42,45','63,68,68','8,11,13'],ice:['18,42,52','50,84,94','5,14,20'],
    storm:['16,27,39','37,51,62','4,9,14'],elemental:['54,24,18','68,45,34','10,8,7'],loop:['56,8,16','92,20,28','15,2,6'],
    floral:['54,18,28','81,36,44','14,7,11'],shrine:['45,18,21','74,42,34','12,7,6'],ash:['48,37,32','70,52,43','13,9,8'],
    ritual:['40,14,31','70,28,48','10,5,10'],signal:['22,32,29','45,58,48','4,8,7'],void:['19,10,28','43,22,55','2,2,6']
  };
  const palette=palettes[style]||palettes.rust;
  ctx.save();ctx.globalAlpha=strength;
  const wash=ctx.createLinearGradient(0,0,0,h);wash.addColorStop(0,`rgba(${palette[0]},.2)`);wash.addColorStop(.46,`rgba(${palette[1]},.38)`);wash.addColorStop(1,`rgba(${palette[2]},.7)`);ctx.fillStyle=wash;ctx.fillRect(0,0,w,h);
  const r=seededRandom(hashCode(`shift:${style}`));
  switch(style){
    case 'decay':
      ctx.strokeStyle=`rgba(91,111,77,${.12+strength*.16})`;for(let i=0;i<26;i++){const x=r()*w,len=30+r()*150;roughLine(ctx,x,0,x+(r()-.5)*30,len,1+r()*4,ctx.strokeStyle,i+10);}drawParticles(ctx,w,h,time,'spores');break;
    case 'flesh':
      ctx.globalCompositeOperation='screen';for(let i=0;i<15;i++){const y=h*(.2+i*.048);ctx.strokeStyle=`rgba(173,45,55,${.04+strength*.09})`;ctx.lineWidth=4+i%4;ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<w;x+=55)ctx.lineTo(x,y+Math.sin(x*.019+i+time*.004)*18);ctx.stroke();}ctx.globalCompositeOperation='source-over';break;
    case 'haunting':
      for(let i=0;i<9;i++){const x=(i+.5)*w/9;ctx.fillStyle=`rgba(0,0,0,${.18+strength*.24})`;ctx.fillRect(x-20,h*.25+Math.sin(time*.001+i)*20,40,h*.47);ctx.strokeStyle=`rgba(133,83,91,${.08+strength*.12})`;ctx.strokeRect(x-32,h*.2,64,h*.52);}break;
    case 'mirror':
      ctx.globalCompositeOperation='screen';for(let i=0;i<12;i++){const y=i*h/12+Math.sin(time*.006+i)*5;ctx.fillStyle=`rgba(204,220,214,${.015+strength*.035})`;ctx.fillRect(0,y,w,2+i%3);}ctx.globalCompositeOperation='source-over';ctx.strokeStyle=`rgba(202,213,207,${.12+strength*.2})`;for(let i=0;i<14;i++){const x=r()*w;roughLine(ctx,x,h*.05,w*.5+(r()-.5)*180,h*.65+r()*h*.25,1+r()*2,ctx.strokeStyle,i+40);}break;
    case 'ice':
      ctx.strokeStyle=`rgba(167,215,224,${.12+strength*.22})`;ctx.lineWidth=2;for(let i=0;i<22;i++){const x=r()*w;ctx.beginPath();ctx.moveTo(x,h);ctx.lineTo(x+(r()-.5)*130,h*.5+r()*h*.2);ctx.lineTo(x+(r()-.5)*190,h*.28+r()*h*.18);ctx.stroke();}drawParticles(ctx,w,h,time,'snow');break;
    case 'storm':
      drawRain(ctx,w,h,time,155,`rgba(188,206,214,${.16+strength*.22})`);if(Math.sin(time*.0049)>.97){ctx.fillStyle=`rgba(222,230,224,${.08+strength*.15})`;ctx.fillRect(0,0,w,h);}break;
    case 'elemental':{
      const kind={water:'rain',steel:'sparks',blood:'blood',earth:'dust',wood:'spores',light:'light',fire:'embers'}[element]||'dust';if(kind==='rain')drawRain(ctx,w,h,time,120);else drawParticles(ctx,w,h,time,kind);break;}
    case 'loop':
      ctx.strokeStyle=`rgba(145,32,41,${.1+strength*.22})`;ctx.lineWidth=5;for(let i=0;i<7;i++){const inset=35+i*45+Math.sin(time*.003+i)*8;ctx.strokeRect(inset,inset*.35,w-inset*2,h-inset*.75);}break;
    case 'floral':
      drawParticles(ctx,w,h,time,'petals');ctx.strokeStyle=`rgba(91,35,45,${.16+strength*.2})`;for(let i=0;i<18;i++){const x=i*w/17;ctx.beginPath();ctx.moveTo(x,h);ctx.quadraticCurveTo(x+Math.sin(time*.001+i)*80,h*.7,x+Math.cos(i)*100,h*.4-r()*140);ctx.stroke();}break;
    case 'shrine':
      ctx.strokeStyle=`rgba(182,64,58,${.1+strength*.16})`;for(let i=0;i<6;i++){const x=(i+.5)*w/6;ctx.strokeRect(x-54,h*.18,108,h*.56);line(ctx,x-76,h*.2,x+76,h*.2,7,ctx.strokeStyle);}drawParticles(ctx,w,h,time,'petals');break;
    case 'ash':
      drawParticles(ctx,w,h,time,'ash');ctx.strokeStyle=`rgba(122,78,58,${.08+strength*.15})`;for(let i=0;i<18;i++){const y=i*h/18;roughLine(ctx,0,y,w,y+(r()-.5)*28,1+i%4,ctx.strokeStyle,i+70);}break;
    case 'ritual':
      ctx.translate(w*.5,h*.7);ctx.strokeStyle=`rgba(168,49,72,${.13+strength*.22})`;for(let ring=0;ring<5;ring++){ctx.beginPath();ctx.arc(0,0,70+ring*48,time*.0003*(ring%2?1:-1),TAU+time*.0003*(ring%2?1:-1));ctx.stroke();}for(let i=0;i<12;i++){const a=time*.0004+i*TAU/12;line(ctx,Math.cos(a)*55,Math.sin(a)*18,Math.cos(a)*280,Math.sin(a)*80,2,ctx.strokeStyle);}ctx.translate(-w*.5,-h*.7);break;
    case 'signal':
      ctx.globalCompositeOperation='screen';for(let i=0;i<35;i++){const y=(i*23+time*.045)%h;ctx.fillStyle=`rgba(198,211,194,${.012+strength*.03})`;ctx.fillRect((r()-.2)*w,y,w*(.25+r()*.8),1+r()*4);}ctx.globalCompositeOperation='source-over';if(Math.sin(time*.012)>.92){ctx.fillStyle=`rgba(210,222,203,${.025+strength*.055})`;ctx.fillRect(0,r()*h,w,8+r()*28);}break;
    case 'void':{
      const g=ctx.createRadialGradient(w*.5,h*.68,8,w*.5,h*.68,w*.62);g.addColorStop(0,`rgba(0,0,0,${.5*strength})`);g.addColorStop(.35,`rgba(80,35,96,${.12*strength})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.strokeStyle=`rgba(130,76,148,${.06+strength*.12})`;for(let i=0;i<11;i++){ctx.beginPath();ctx.ellipse(w*.5,h*.68,50+i*65,15+i*20,Math.sin(time*.0003+i)*.15,0,TAU);ctx.stroke();}break;}
    case 'rust':
    default:
      ctx.globalCompositeOperation='screen';for(let i=0;i<16;i++){const y=((i*79+time*.035)%(h+120))-60;ctx.strokeStyle=`rgba(160,48,36,${.025+strength*.055})`;ctx.lineWidth=1+(i%3);ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=w;x+=90)ctx.lineTo(x,y+Math.sin(x*.015+i)*13);ctx.stroke();}ctx.globalCompositeOperation='source-over';ctx.strokeStyle=`rgba(26,20,17,${.25+strength*.42})`;ctx.lineWidth=2;for(let x=20;x<w;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+Math.sin(x*.02+time*.0005)*18,h);ctx.stroke();}for(let y=h*.54;y<h;y+=31){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+Math.sin(y*.035)*9);ctx.stroke();}break;
  }
  const pulse=.04+.06*(.5+.5*Math.sin(time*.004));ctx.fillStyle=`rgba(${palette[1]},${pulse*strength})`;ctx.fillRect(0,0,w,h);ctx.restore();
}
function drawRadioNoise(ctx,w,h,time,radio=0){
  const level=clamp(radio,0,1);if(level<.035)return;
  ctx.save();ctx.globalCompositeOperation='screen';
  const r=seededRandom(Math.floor(time/70)+733);const count=Math.floor(12+level*72);
  for(let i=0;i<count;i++){const y=r()*h;ctx.fillStyle=`rgba(224,224,204,${(.01+r()*.05)*level})`;ctx.fillRect(0,y,w*(.2+r()*.8),1+r()*3);}
  if(level>.72){ctx.globalCompositeOperation='source-over';ctx.fillStyle=`rgba(232,227,207,${(level-.72)*.09})`;ctx.fillRect(0,0,w,h);}
  ctx.restore();
}
function drawStatusAura(ctx,status,time,pulse=0){
  if(!status&&!pulse)return;
  const colors={bleed:'#b43a43',static:'#d5d2ab',bind:'#9a7658',decay:'#88703d',burn:'#d95b35',dread:'#866392',frost:'#8cb7c9',bloom:'#d67583'};
  const color=colors[status]||'#b53b43';ctx.save();ctx.globalCompositeOperation='screen';
  const strength=status?.65:clamp(pulse,0,1)*.35;
  for(let i=0;i<8;i++){const a=i/8*TAU+time*.002;ellipse(ctx,Math.cos(a)*48,-96+Math.sin(a)*75,5+(i%3)*3,4,rgba(color,.06+strength*.1));}
  ctx.strokeStyle=rgba(color,.18+strength*.22);ctx.lineWidth=2+strength*3;ctx.beginPath();ctx.ellipse(0,-98,56+Math.sin(time*.007)*5,104,0,0,TAU);ctx.stroke();ctx.restore();
}

function drawFarBuildings(ctx,w,h,family){
  const baseY=h*.56;ctx.save();ctx.fillStyle='rgba(6,8,7,.82)';
  const r=seededRandom(hashCode(family));
  if(['street','village','villa','motel'].includes(family)){
    let x=-30;while(x<w+60){const bw=70+r()*100,bh=90+r()*160;ctx.fillRect(x,baseY-bh,bw,bh);ctx.fillStyle='rgba(129,123,100,.08)';for(let wx=x+14;wx<x+bw-10;wx+=22)for(let wy=baseY-bh+20;wy<baseY-20;wy+=28)ctx.fillRect(wx,wy,7,9);ctx.fillStyle='rgba(6,8,7,.82)';x+=bw+12;}
  }else if(['hospital','school','apartment','hotel','prison','mall','church','house'].includes(family)){
    const bw=w*.68,bh=h*.39;ctx.fillRect(w*.16,baseY-bh,bw,bh);ctx.fillStyle='rgba(135,133,112,.07)';for(let x=w*.19;x<w*.81;x+=55)for(let y=baseY-bh+32;y<baseY-28;y+=44)ctx.fillRect(x,y,20,15);ctx.fillStyle='rgba(6,8,7,.82)';
    if(family==='church'){polygon(ctx,[[w*.35,baseY-bh],[w*.5,baseY-bh-130],[w*.65,baseY-bh]],'rgba(6,8,7,.82)');}
  }else if(family==='amusement'){
    ctx.strokeStyle='rgba(5,7,6,.9)';ctx.lineWidth=14;ctx.beginPath();ctx.arc(w*.68,baseY-140,120,0,TAU);ctx.stroke();for(let i=0;i<12;i++){const a=i/12*TAU;line(ctx,w*.68,baseY-140,w*.68+Math.cos(a)*120,baseY-140+Math.sin(a)*120,4,'rgba(5,7,6,.9)');}
  }else if(family==='shrine'||family==='festival'){
    for(let i=0;i<4;i++){const x=w*(.2+i*.2);line(ctx,x,baseY-200,x,baseY,14,'rgba(8,7,6,.86)');line(ctx,x-70,baseY-190,x+70,baseY-190,16,'rgba(8,7,6,.86)');line(ctx,x-50,baseY-215,x+50,baseY-215,8,'rgba(8,7,6,.86)');}
  }else if(family==='ice'){
    for(let i=0;i<12;i++){const x=i*w/11;polygon(ctx,[[x-80,baseY],[x,baseY-120-r()*140],[x+90,baseY]],'rgba(7,15,19,.88)');}
  }else if(family==='ship'){
    polygon(ctx,[[w*.2,baseY-170],[w*.78,baseY-170],[w*.9,baseY],[w*.12,baseY]],'rgba(6,8,8,.9)');line(ctx,w*.5,baseY-170,w*.5,baseY-360,10,'rgba(6,8,8,.9)');
  }else{
    for(let i=0;i<8;i++){const x=i*w/7;polygon(ctx,[[x-100,baseY],[x,baseY-80-r()*160],[x+100,baseY]],'rgba(6,8,7,.83)');}
  }
  ctx.restore();
}
function drawProps(ctx,w,h,stage,time=0){
  const ground=h*.79;ctx.save();ctx.fillStyle='rgba(10,11,9,.62)';ctx.strokeStyle='rgba(132,128,111,.16)';ctx.lineWidth=3;
  const props=stage.props||[];
  if(props.includes('fence')){for(let x=0;x<w;x+=42){line(ctx,x,ground-115,x,ground,3,'rgba(44,48,45,.76)');}for(let x=0;x<w;x+=42){line(ctx,x,ground-110,x+42,ground-45,1,'rgba(85,91,85,.35)');line(ctx,x+42,ground-110,x,ground-45,1,'rgba(85,91,85,.35)');}}
  if(props.includes('chains')){for(let i=0;i<8;i++){const sway=Math.sin(time*.0014+i)*13;const x=70+i*160;for(let y=0;y<ground-100;y+=20){ctx.beginPath();ctx.ellipse(x+sway*(y/ground)+Math.sin(y*.05+i)*7,y,6,10,0,0,TAU);ctx.stroke();}}}
  if(props.includes('trees')||props.includes('roots')){for(let i=0;i<8;i++){const x=40+i*w/7;line(ctx,x,ground-20,x+(i%2?-25:25),ground-260-(i%3)*60,20,'rgba(9,10,8,.8)');for(let b=0;b<4;b++)line(ctx,x,ground-180-b*20,x+(b-1.5)*70,ground-260-b*35,7,'rgba(9,10,8,.8)');}}
  if(props.includes('lockers')){for(let i=0;i<10;i++){const rattle=Math.sin(time*.018+i*2.1)> .965?Math.sin(time*.12+i)*3:0;ctx.fillStyle='rgba(20,24,21,.68)';ctx.fillRect(20+i*128+rattle,ground-155,100,150);ctx.strokeRect(20+i*128+rattle,ground-155,100,150);ctx.fillStyle='rgba(123,119,101,.18)';ctx.fillRect(95+i*128+rattle,ground-85,5,12);}}
  if(props.includes('beds')||props.includes('gurneys')){for(let i=0;i<4;i++){const x=45+i*330;ctx.fillStyle='rgba(50,48,43,.48)';ctx.fillRect(x,ground-60,170,40);line(ctx,x+15,ground-20,x+10,ground+8,5,'rgba(50,48,43,.6)');line(ctx,x+155,ground-20,x+160,ground+8,5,'rgba(50,48,43,.6)');}}
  if(props.includes('lanterns')){for(let i=0;i<6;i++){const sway=Math.sin(time*.002+i)*8;const x=80+i*220;line(ctx,x,ground-210,x+sway,ground-165,5,'rgba(20,18,16,.72)');line(ctx,x,ground-165,x,ground,7,'rgba(20,18,16,.72)');ctx.fillStyle=`rgba(149,60,54,${.22+.12*(.5+.5*Math.sin(time*.006+i))})`;ctx.fillRect(x+sway-16,ground-190,32,45);}}
  if(props.includes('runes')){ctx.strokeStyle='rgba(142,58,72,.22)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(w*.5,ground-15,120,0,TAU);ctx.stroke();for(let i=0;i<8;i++){const a=i/8*TAU;line(ctx,w*.5+Math.cos(a)*45,ground-15+Math.sin(a)*45,w*.5+Math.cos(a)*120,ground-15+Math.sin(a)*120,3,ctx.strokeStyle);}}
  if(props.includes('water')||stage.weather==='water'){const g=ctx.createLinearGradient(0,ground-25,0,h);g.addColorStop(0,'rgba(56,83,91,.12)');g.addColorStop(1,'rgba(10,24,30,.5)');ctx.fillStyle=g;ctx.fillRect(0,ground-20,w,h-ground+20);for(let i=0;i<16;i++){ctx.strokeStyle=`rgba(154,184,190,${.03+i%3*.02})`;ctx.beginPath();ctx.ellipse(((i*173)+time*.012*(1+i%3))%w,ground+20+(i%4)*22+Math.sin(time*.002+i)*3,45+(i%5)*10,4,0,0,TAU);ctx.stroke();}}
  ctx.restore();
}


function animationId(entry){return typeof entry==='string'?entry:entry?.id||entry?.type||'';}
function drawStageAnimations(ctx,w,h,stage,time,otherworld=0,director=null){
  const tracks=(stage?.animationTracks?.length?stage.animationTracks:(stage?.animations||[]).map(id=>({id:animationId(id),phase:'both',intensity:1}))).filter(track=>track?.id);
  if(director?.activeEvent?.animation&&!tracks.some(track=>track.id===director.activeEvent.animation))tracks.push({id:director.activeEvent.animation,phase:'both',intensity:1.35,event:true});
  const animations=tracks.filter(track=>track.phase==='both'||(track.phase==='fog'?otherworld<.78:otherworld>.28));
  if(!animations.length)return;
  const ground=h*.79;
  const pulse=(speed=1,offset=0)=>.5+.5*Math.sin(time*.001*speed+offset);
  const flicker=(seed=0)=>Math.sin(time*.021+seed*7)>.78?1:.24+.18*pulse(8,seed);
  ctx.save();
  for(const track of animations){
    const id=animationId(track);
    ctx.save();ctx.globalAlpha*=track.intensity||1;
    switch(id){
      case 'fogDrift':{
        ctx.globalCompositeOperation='screen';ctx.fillStyle=`rgba(216,220,211,${.025+.025*pulse(.7)})`;
        for(let i=0;i<4;i++){const x=((time*.018*(i+1)+i*310)%(w+420))-210;ctx.beginPath();ctx.ellipse(x,h*(.48+i*.09),180+i*35,18+i*5,0,0,TAU);ctx.fill();}
        break;
      }
      case 'lightFlicker':case 'streetLightFlicker':case 'lampFlicker':case 'neonFlicker':{
        const count=id==='streetLightFlicker'?5:id==='neonFlicker'?4:7;
        for(let i=0;i<count;i++){const x=(i+.5)*w/count;const y=id==='streetLightFlicker'?h*.35:h*.28+(i%2)*55;const a=flicker(i)*(.08+otherworld*.04);const g=ctx.createRadialGradient(x,y,1,x,y,110);g.addColorStop(0,`rgba(${id==='neonFlicker'?'180,58,92':'236,220,166'},${a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-120,y-120,240,240);}
        break;
      }
      case 'chainSway':{
        ctx.strokeStyle='rgba(107,105,92,.32)';ctx.lineWidth=3;for(let i=0;i<5;i++){const x=100+i*w/4;const sway=Math.sin(time*.0015+i)*25;ctx.beginPath();ctx.moveTo(x,0);ctx.quadraticCurveTo(x+sway*.35,h*.23,x+sway,h*.48);ctx.stroke();}
        break;
      }
      case 'fanSpin':{
        const x=w*.78,y=h*.22,a=time*.004;ctx.strokeStyle='rgba(99,104,94,.38)';ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,y,56,0,TAU);ctx.stroke();for(let i=0;i<5;i++){const r=a+i*TAU/5;line(ctx,x,y,x+Math.cos(r)*49,y+Math.sin(r)*49,8,'rgba(88,91,83,.55)');}break;
      }
      case 'hospitalMonitor':case 'radioPulse':case 'tvStatic':{
        const x=id==='tvStatic'?w*.74:w*.17,y=id==='tvStatic'?h*.34:h*.57;ctx.fillStyle='rgba(6,12,9,.72)';ctx.fillRect(x-65,y-42,130,84);ctx.strokeStyle='rgba(129,155,130,.32)';ctx.strokeRect(x-65,y-42,130,84);if(id==='tvStatic'){const r=seededRandom(Math.floor(time/60)+913);for(let i=0;i<30;i++){ctx.fillStyle=`rgba(220,220,204,${.02+r()*.16})`;ctx.fillRect(x-61+r()*122,y-38+r()*76,2+r()*18,1+r()*2);}}else{ctx.strokeStyle=id==='radioPulse'?'rgba(198,198,174,.6)':'rgba(109,191,126,.62)';ctx.lineWidth=2;ctx.beginPath();for(let px=x-56;px<x+56;px+=4){const wave=Math.sin((px+time*.11)*.12)*4+(Math.abs(((px+time*.08)%58)-29)<3?18:0);ctx.lineTo(px,y-wave);}ctx.stroke();}break;
      }
      case 'sirenPulse':case 'firePulse':case 'bloodPulse':case 'metalPulse':{
        const color=id==='firePulse'?'211,76,37':id==='metalPulse'?'160,172,170':id==='bloodPulse'?'150,25,35':'180,38,43';const a=.035+.07*pulse(id==='sirenPulse'?5:2.2);ctx.fillStyle=`rgba(${color},${a})`;ctx.fillRect(0,0,w,h);break;
      }
      case 'lockerRattle':case 'floorCreak':case 'doorPulse':case 'storeShutters':case 'screenSlide':{
        const y=ground-120;for(let i=0;i<5;i++){const x=70+i*(w-140)/4;const shake=(id==='lockerRattle'||id==='storeShutters')&&Math.sin(time*.022+i*3)>.94?Math.sin(time*.11)*5:0;ctx.strokeStyle='rgba(132,126,105,.2)';ctx.lineWidth=3;ctx.strokeRect(x-30+shake,y-70+(id==='screenSlide'?Math.sin(time*.001+i)*10:0),60,140);if(id==='doorPulse'){const g=ctx.createRadialGradient(x,y,1,x,y,70);g.addColorStop(0,`rgba(127,25,33,${.04+.1*pulse(3,i)})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-80,y-80,160,160);}}break;
      }
      case 'waterRipple':case 'waves':case 'boatRock':case 'rainSheets':{
        if(id==='rainSheets'){ctx.strokeStyle='rgba(188,205,207,.13)';ctx.lineWidth=2;for(let i=0;i<45;i++){const x=(i*73+time*.09)%w;const y=(i*41+time*.31)%h;line(ctx,x,y,x-15,y+38,2,ctx.strokeStyle);}break;}
        ctx.strokeStyle='rgba(150,185,192,.12)';ctx.lineWidth=2;for(let i=0;i<9;i++){const x=((i*193+time*.012*(i+1))%(w+150))-75;ctx.beginPath();ctx.ellipse(x,ground+20+(i%3)*22,70+(i%4)*15,5+2*pulse(2,i),0,0,TAU);ctx.stroke();}if(id==='boatRock'){ctx.translate(w*.68,ground-58);ctx.rotate(Math.sin(time*.0016)*.045);polygon(ctx,[[-75,0],[70,0],[52,28],[-55,28]],'rgba(16,20,19,.55)','rgba(126,130,118,.15)',2);}break;
      }
      case 'pipeSteam':case 'ventSteam':case 'coldBreath':{
        ctx.globalCompositeOperation='screen';for(let i=0;i<10;i++){const x=60+(i*151)%w;const y=ground-20-((time*.025+i*57)%180);ellipse(ctx,x+Math.sin(time*.003+i)*18,y,18+i%3*8,8,'rgba(205,211,203,.045)');}break;
      }
      case 'portraitBlink':case 'windowShadow':case 'shadowPass':case 'cellShadow':{
        const speed=id==='shadowPass'?time*.03:time*.006;for(let i=0;i<4;i++){const x=id==='shadowPass'?((speed+i*370)%(w+180))-90:150+i*w*.22;const y=h*.28+(i%2)*65;ctx.fillStyle=`rgba(0,0,0,${.2+.22*pulse(.7,i)})`;ctx.fillRect(x-18,y-40,36,80);if(id==='portraitBlink'&&pulse(11,i)>.95){ctx.fillStyle='rgba(190,40,46,.35)';ctx.fillRect(x-7,y-9,4,3);ctx.fillRect(x+3,y-9,4,3);}}break;
      }
      case 'lightning':{
        if(Math.sin(time*.0042)>.965){ctx.fillStyle='rgba(226,230,216,.18)';ctx.fillRect(0,0,w,h);const x=w*(.25+.5*pulse(.31));ctx.strokeStyle='rgba(235,235,215,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-25,h*.18);ctx.lineTo(x+15,h*.28);ctx.lineTo(x-40,h*.42);ctx.stroke();}break;
      }
      case 'elevatorBlink':{
        for(let i=0;i<3;i++){const x=w*.37+i*130,y=h*.24;ctx.fillStyle=`rgba(178,35,43,${.08+.35*(Math.floor(time/480+i)%3===0)})`;ctx.fillRect(x,y,16,7);}break;
      }
      case 'carouselTurn':case 'ferrisWheel':case 'bellSwing':case 'curtainSway':case 'spotlightSweep':{
        if(id==='ferrisWheel'){const x=w*.72,y=h*.38,r=115,a=time*.00055;ctx.strokeStyle='rgba(70,76,72,.42)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();for(let i=0;i<12;i++){const ang=a+i*TAU/12;line(ctx,x,y,x+Math.cos(ang)*r,y+Math.sin(ang)*r,2,'rgba(80,85,80,.32)');ellipse(ctx,x+Math.cos(ang)*r,y+Math.sin(ang)*r,7,7,'rgba(120,41,44,.3)');}}
        else if(id==='carouselTurn'){const x=w*.25,y=ground-28,a=time*.0012;for(let i=0;i<6;i++){const ang=a+i*TAU/6;ellipse(ctx,x+Math.cos(ang)*80,y+Math.sin(ang)*18,12,7,'rgba(142,46,54,.28)');}line(ctx,x,y-150,x,y,7,'rgba(57,54,48,.55)');}
        else if(id==='bellSwing'){ctx.translate(w*.5,h*.22);ctx.rotate(Math.sin(time*.0018)*.2);polygon(ctx,[[-32,0],[32,0],[46,72],[-46,72]],'rgba(80,74,63,.5)','rgba(154,142,118,.2)',3);line(ctx,0,65,0,90,5,'rgba(87,74,60,.6)');}
        else if(id==='curtainSway'){ctx.fillStyle='rgba(88,23,29,.2)';for(let i=0;i<8;i++){const x=i*w/7+Math.sin(time*.001+i)*10;ctx.beginPath();ctx.moveTo(x-55,0);ctx.quadraticCurveTo(x,h*.4,x-40,ground);ctx.lineTo(x+35,ground);ctx.quadraticCurveTo(x+20,h*.4,x+55,0);ctx.fill();}}
        else{const a=time*.0009;const x=w*.5+Math.sin(a)*w*.36;const g=ctx.createRadialGradient(x,h*.18,5,x,h*.18,220);g.addColorStop(0,'rgba(239,226,180,.11)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-240,0,480,h*.72);}break;
      }
      case 'trainPass':case 'mineCart':case 'headlightSweep':{
        const x=((time*(id==='trainPass'?.19:.11))%(w+500))-250;ctx.fillStyle='rgba(7,9,8,.75)';ctx.fillRect(x,ground-115,id==='trainPass'?420:140,id==='trainPass'?100:75);if(id==='headlightSweep'||id==='trainPass'){const g=ctx.createLinearGradient(x,0,x+320,0);g.addColorStop(0,'rgba(225,218,170,.1)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;polygon(ctx,[[x+40,ground-90],[x+400,ground-170],[x+400,ground-20],[x+40,ground-40]],ctx.fillStyle);}break;
      }
      case 'rootsCreep':case 'forestWind':case 'windGust':case 'flagSway':case 'petalSpiral':case 'ashFall':case 'snowGust':{
        if(id==='rootsCreep'){ctx.strokeStyle='rgba(35,22,18,.48)';ctx.lineWidth=5;for(let i=0;i<10;i++){const x=i*w/9;ctx.beginPath();ctx.moveTo(x,ground);ctx.quadraticCurveTo(x+Math.sin(time*.001+i)*55,ground-60,x+Math.cos(time*.001+i)*85,ground-130);ctx.stroke();}}
        else if(id==='petalSpiral'||id==='ashFall'||id==='snowGust'){const r=seededRandom(300+hashCode(id));const color=id==='petalSpiral'?'rgba(184,77,94,.45)':id==='snowGust'?'rgba(224,233,232,.32)':'rgba(175,166,150,.22)';for(let i=0;i<55;i++){const x=(r()*w+time*(id==='petalSpiral'?.017:.026)*(i%4+1))%w;const y=(r()*h+time*.022*(i%3+1))%h;ctx.save();ctx.translate(x,y);ctx.rotate(time*.002+i);ctx.fillStyle=color;ctx.fillRect(-3,-1,6+(i%3)*2,2);ctx.restore();}}
        else{ctx.strokeStyle='rgba(98,101,87,.18)';ctx.lineWidth=4;for(let i=0;i<12;i++){const x=i*w/11;const sway=Math.sin(time*.0017+i)*22;ctx.beginPath();ctx.moveTo(x,ground);ctx.quadraticCurveTo(x+sway,ground-90,x+sway*1.5,ground-210);ctx.stroke();}}break;
      }
      case 'iceCrack':case 'gravityTilt':case 'voidSurge':case 'chasmPulse':{
        if(id==='gravityTilt'){ctx.translate(w*.5,h*.5);ctx.rotate(Math.sin(time*.0007)*.01);ctx.translate(-w*.5,-h*.5);}
        if(id==='voidSurge'||id==='chasmPulse'){const x=w*.5,y=ground;const g=ctx.createRadialGradient(x,y,5,x,y,240);g.addColorStop(0,`rgba(83,31,90,${.12+.12*pulse(2)})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-250,y-250,500,260);}
        ctx.strokeStyle='rgba(152,178,181,.16)';ctx.lineWidth=3;for(let i=0;i<7;i++){const x=w*.15+i*w*.12;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+Math.sin(i)*50,ground-35-i*4);ctx.lineTo(x+Math.cos(i)*85,ground-70-i*5);ctx.stroke();}break;
      }
      case 'ritualGlyph':{
        const x=w*.5,y=ground-8,r=95+10*pulse(2);ctx.strokeStyle=`rgba(151,47,64,${.13+.14*pulse(3)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();for(let i=0;i<8;i++){const a=time*.0005+i*TAU/8;line(ctx,x+Math.cos(a)*35,y+Math.sin(a)*12,x+Math.cos(a)*r,y+Math.sin(a)*28,2,ctx.strokeStyle);}break;
      }
      case 'mirrorGlitch':case 'screenGlitch':{
        const r=seededRandom(Math.floor(time/80)+hashCode(stage.id));ctx.globalCompositeOperation='screen';for(let i=0;i<9;i++){ctx.fillStyle=`rgba(210,210,195,${.015+r()*.045})`;ctx.fillRect(r()*w,r()*h,w*(.1+r()*.4),1+r()*5);}break;
      }
      case 'sawSpin':case 'sparks':{
        if(id==='sawSpin'){const x=w*.18,y=ground-95,a=time*.008;ctx.strokeStyle='rgba(120,120,108,.42)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,34,0,TAU);ctx.stroke();for(let i=0;i<10;i++){const ang=a+i*TAU/10;line(ctx,x+Math.cos(ang)*25,y+Math.sin(ang)*25,x+Math.cos(ang)*42,y+Math.sin(ang)*42,3,ctx.strokeStyle);}}
        const r=seededRandom(Math.floor(time/55)+123);for(let i=0;i<12;i++){const x=r()*w,y=ground-r()*220;line(ctx,x,y,x+8+r()*18,y-5-r()*15,1.5,'rgba(226,178,78,.38)');}break;
      }
      default: break;
    }
    ctx.restore();
  }
  ctx.restore();
}

export function drawStage(ctx,stage,time=0,{width=1280,height=720,cinematic=false,otherworld=0,radio=0,animationsEnabled=true,director=null,terrain=null,shift=null,reducedMotion=false}={}){
  time = animationsEnabled && !reducedMotion ? time : 0;
  const w=width,h=height;const sky=stage?.sky||['#333','#111','#020202'];const visibility=stage?.visibility||{};const activeTerrain=terrain||stage?.terrain||{};const shiftStyle=shift?.style||stage?.shift?.style||'rust';
  ctx.save();
  const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,sky[0]);grad.addColorStop(.52,sky[1]);grad.addColorStop(1,sky[2]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  const halo=ctx.createRadialGradient(w*.72,h*.18,0,w*.72,h*.18,w*.55);halo.addColorStop(0,'rgba(214,213,188,.13)');halo.addColorStop(.32,'rgba(171,172,156,.04)');halo.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
  if (!drawStageArchitecture(ctx,w,h,stage)) drawFarBuildings(ctx,w,h,stage?.family||'street');
  const horizon=h*.57;ctx.fillStyle='rgba(7,9,7,.78)';ctx.fillRect(0,horizon,w,h-horizon);
  const terrainTints={flooded:'40,68,76',ice:'55,83,93',petals:'74,36,43',ritualStone:'58,32,44',ash:'61,47,40',steel:'48,53,51',mud:'48,41,31',void:'36,22,48',wetConcrete:'53,59,57'};
  const tint=terrainTints[activeTerrain.id]||'67,68,58';const floor=ctx.createLinearGradient(0,horizon,0,h);floor.addColorStop(0,`rgba(${tint},.28)`);floor.addColorStop(1,'rgba(4,5,4,.98)');ctx.fillStyle=floor;ctx.fillRect(0,horizon,w,h-horizon);
  ctx.strokeStyle='rgba(160,156,134,.08)';ctx.lineWidth=2;for(let y=horizon;y<h;y+=26+(y-horizon)*.05){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}for(let x=0;x<=w;x+=80){ctx.beginPath();ctx.moveTo(w*.5,horizon);ctx.lineTo(x,h);ctx.stroke();}
  drawProps(ctx,w,h,stage||{},time);
  if(animationsEnabled){
    drawStageAnimations(ctx,w,h,stage||{},time,otherworld,director);
    drawStageCinematics(ctx,w,h,stage||{},director,{reducedMotion});
  }
  drawOtherworldOverlay(ctx,w,h,time,otherworld,shiftStyle,String(stage?.id||'').replace(/^book_/,''));
  if(stage?.weather==='rain')drawRain(ctx,w,h,time,115);else drawParticles(ctx,w,h,time,stage?.weather);
  const baseFog=Number.isFinite(visibility.fog)?visibility.fog:(stage?.weather==='fog'?.54:.24);const fogAmount=clamp(baseFog+(director?.fogBoost||0),.04,.96)*(1-otherworld*(shiftStyle==='signal'?.08:.32));drawFog(ctx,w,h,time,fogAmount,stageSpace(stage||{})==='interior');
  drawRadioNoise(ctx,w,h,time,radio);
  const darkness=clamp((visibility.darkness||.25)+(director?.darkness||0)*.7,0,.92);if(darkness>.02){ctx.fillStyle=`rgba(0,0,0,${darkness*.34})`;ctx.fillRect(0,0,w,h);}
  const vignette=ctx.createRadialGradient(w*.5,h*.5,w*.2,w*.5,h*.5,w*.76);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,cinematic?`rgba(0,0,0,${.75+darkness*.18})`:`rgba(0,0,0,${.55+darkness*.25})`);ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  ctx.restore();
}

// One raster pipeline serves all roster cards, dossiers and live fighters.
export { drawRasterMonster as drawMonster, paintRasterPortrait as renderPortrait } from './sprite-system.js';

export function drawHitboxOverlay(ctx,box,color,label){if(!box)return;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=rgba(color,.16);ctx.lineWidth=3;ctx.fillRect(box.x,box.y,box.w,box.h);ctx.strokeRect(box.x,box.y,box.w,box.h);ctx.fillStyle=color;ctx.font='700 12px ui-monospace';ctx.fillText(label||'',box.x+4,box.y+14);ctx.restore();}
