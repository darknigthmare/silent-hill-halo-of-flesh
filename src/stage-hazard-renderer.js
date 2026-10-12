/* Mandatory combat layer: physical props always use the hit resolver's volumes.
 * Aesthetic silhouettes are original versus interpretations of catalogue motifs.
 */
import { hazardVolumes } from './combat-geometry.js';
const TAU=Math.PI*2;
function line(c,x,y,xx,yy,tone='#828c7f',size=3){c.strokeStyle=tone;c.lineWidth=size;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
function orb(c,x,y,r,tone){c.fillStyle=tone;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
export function drawHazardObjects(c,hazard,time=0,{reducedMotion=false}={}){
  const active=hazard.timer<=0;
  const progress=active?1:1-hazard.timer/Math.max(1,hazard.maxTimer);
  const type=hazard.profile.visual||hazard.id;
  for(const z of hazardVolumes(hazard)){
    c.save();
    c.beginPath();c.rect(z.x,z.y,z.w,z.h);c.clip();
    c.globalAlpha*=active?.8:.18+progress*.32;
    const x=z.x+z.w/2, floor=z.y+z.h-3, width=z.w,top=z.y;
    c.lineWidth=3;
    if(type==='train'){
      const y=floor-195;
      c.fillStyle='#36413e';c.fillRect(z.x,y,width,171);
      c.fillStyle='#9b9d89';c.fillRect(z.x,y,width,6);
      const cells=Math.max(2,Math.floor(width/78));
      for(let i=0;i<cells;i++){
        const wx=z.x+12+i*(width-20)/cells;
        c.fillStyle='#151e1d';c.fillRect(wx,y+30,(width-26)/cells-10,76);
        c.fillStyle='rgba(168,185,163,.38)';c.fillRect(wx+3,y+33,(width-26)/cells-16,70);
      }
      line(c,z.x,floor-19,z.x+width,floor-19,'#7d8377',4);
      for(const q of [.2,.8])orb(c,z.x+q*width,floor-12,13,'#17221d');
    }else if(type==='gurney'){
      c.fillStyle='#899487';c.fillRect(z.x+4,floor-107,width-8,14);
      c.fillStyle='#60564f';c.fillRect(z.x+12,floor-116,width-28,9);
      for(const q of [.19,.81]){const wx=z.x+width*q;line(c,wx,floor-88,wx,floor-15,'#606d63',5);orb(c,wx,floor-12,11,'#252d29');}
      line(c,z.x+5,floor-90,z.x+width-5,floor-90,'#45544b',5);
    }else if(['locker','elevator','door','portrait','mirror'].includes(type)){
      const bw=Math.min(width-6,type==='elevator'?176:132),y=floor-Math.min(226,z.h-5);
      c.fillStyle=type==='portrait'?'#5c493a':'#333d36';c.fillRect(x-bw/2,y,bw,floor-y-5);
      c.fillStyle=type==='mirror'?'#586462':'#4e584b';c.fillRect(x-bw/2+7,y+7,bw-14,floor-y-19);
      if(type==='portrait'){orb(c,x,y+55,23,'#242d29');line(c,x-21,y+57,x+21,y+57,'#98716c',2);}
      else if(type==='mirror'){for(let i=0;i<4;i++)line(c,x-bw*.38+i*20,y+24,x+bw*.35-i*10,floor-28,'#a0b9af',1);}
      else {line(c,x,y+8,x,floor-13,'#232b27',2);c.fillStyle='#b0a17e';c.fillRect(x+bw*.25,y+104,4,12);}
    }else if(['roots','petals','ice','ice-crack','chasm'].includes(type)){
      const tone=type.includes('ice')?'#9bc0cb':type==='chasm'?'#746551':'#9e5c65';
      for(let i=0;i<8;i++){
        const px=z.x+(i+.5)*width/8, high=Math.min(z.h-6,24+(i%3)*18)*(.25+.75*progress);
        line(c,px-12,floor,px,floor-high,tone,3);line(c,px,floor-high,px+15,floor-2,tone,2);
      }
    }else if(type==='chains'){
      for(let i=0;i<5;i++){const px=z.x+(i+.5)*width/5;
        for(let y=top+9;y<floor-5;y+=20){c.strokeStyle='#919186';c.beginPath();c.ellipse(px+(reducedMotion?0:Math.sin(time*.002+i)*5),y,5,8,0,0,TAU);c.stroke();}}
    }else if(['steam','water','blood'].includes(type)){
      const tone=type==='steam'?'rgba(174,188,178,.34)':type==='blood'?'rgba(117,43,47,.5)':'rgba(87,132,137,.42)';
      c.fillStyle=tone;
      for(let i=0;i<6;i++){const px=z.x+(i+.5)*width/6;const rise=Math.min(z.h*.5,20+(i%3)*19)*(.6+.4*progress);
        c.beginPath();c.ellipse(px,floor-rise,width/9,rise,0,0,TAU);c.fill();}
    }else if(type==='carousel'){
      line(c,x,top+2,x,floor,'#817c62',7);
      c.strokeStyle='#9d9276';c.beginPath();c.ellipse(x,top+30,width*.47,18,0,0,TAU);c.stroke();
      for(let i=0;i<4;i++){const px=z.x+(i+.5)*width/4;line(c,px,top+35,px,floor-25,'#777653',3);orb(c,px,floor-36,12,'#706853');}
    }else if(['bell','siren'].includes(type)){
      if(type==='bell'){
        c.fillStyle='#8b8369';c.beginPath();c.moveTo(x-14,top+10);c.lineTo(x+14,top+10);c.lineTo(x+37,top+77);c.lineTo(x-37,top+77);c.closePath();c.fill();orb(c,x,top+80,7,'#bbaa7e');
      }
      for(let i=0;i<4;i++)line(c,z.x,top+105+i*66,z.x+width,top+105+i*66,'rgba(162,126,115,.5)',2);
    }else if(type==='lightning'){
      const px=x;line(c,px-10,top,px+12,top+z.h*.3,'#bcd6d3',4);line(c,px+12,top+z.h*.3,px-22,top+z.h*.6,'#bcd6d3',4);line(c,px-22,top+z.h*.6,px+4,floor,'#bcd6d3',3);
    }else if(type==='spotlight'){
      c.fillStyle='rgba(191,189,150,.26)';c.beginPath();c.moveTo(x,top);c.lineTo(z.x,floor);c.lineTo(z.x+width,floor);c.closePath();c.fill();
    }else if(['debris','embers'].includes(type)){
      for(let i=0;i<9;i++){const px=z.x+(i+.5)*width/9;const py=top+(i*47+(reducedMotion?0:time*.04))%(z.h-14);
        c.fillStyle=type==='embers'?'#b5724b':'#807763';c.fillRect(px,py,9+i%3*4,8+i%4*3);}
    }else{
      // Signals and psychic fields occupy the same clipped bands as their hit.
      c.strokeStyle=['ritual','void','room'].includes(type)?'#a57590':'#a5b9a8';
      for(let i=0;i<6;i++){const yy=top+28+i*(z.h-48)/6;
        line(c,z.x+3,yy,z.x+width-3,yy+(reducedMotion?0:Math.sin(time*.004+i)*6),c.strokeStyle,2);}
      if(type==='ritual'){c.beginPath();c.ellipse(x,floor-18,width*.45,15,0,0,TAU);c.stroke();}
    }
    c.restore();
  }
}
