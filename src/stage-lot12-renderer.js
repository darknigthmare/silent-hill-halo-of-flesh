/** Authored frontal studies of photographed props; no source texture or animation is copied. */
import {LOT12_SCENE_PRESENTATION} from './stage-lot12-policy.js';
const line=(c,x,y,xx,yy,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const ellipse=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const glow=(c,x,y,r,power)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(194,173,117,${power})`);g.addColorStop(1,'rgba(194,173,117,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);};
export function stageLot12Room(stage){const s=LOT12_SCENE_PRESENTATION[stage?.id];return !!(s&&stage.source===s.source&&stage.referencePolicy?.sceneId===s.policy.sceneId);}
export function drawStageLot12Architecture(c,w,h,stage){
 if(!stageLot12Room(stage))return false;
 const ground=h*.57,id=stage.id;c.save();
 rect(c,0,0,w,ground,id==='toluca_prison'?'#141b14':id==='church'?'#282b23':id==='shopping_mall'?'#4a3628':'#343b31');
 if(id==='woodside'){
  rect(c,0,h*.1,w,h*.37,'#424332');
  for(let col=0;col<32;col++)for(let row=0;row<7;row++){const x=col*w/31,y=h*(.13+row*.045);line(c,x,y,x+7,y+8,'rgba(126,118,78,.18)',2);line(c,x+7,y+8,x+3,y+17,'rgba(126,118,78,.18)',2);}
  rect(c,0,h*.47,w,h*.1,'#31392d');for(let i=0;i<20;i++)line(c,i*w/19,h*.48,i*w/19,ground,'#4f503b',2);line(c,0,h*.47,w,h*.47,'#655e40',5);
 }else if(id==='blue_creek'){
  rect(c,w*.12,h*.14,w*.76,ground-h*.14,'#515747');
  for(let i=0;i<6;i++){const y=h*(.43+i*.023);line(c,w*.38,y,w*.62,y,'#53614e',3);}
  rect(c,w*.38,h*.44,w*.24,h*.13,'#12251d');
  // Keep the photographed fixed railing even when its separate impact cue is idle.
  const railX=w*.55,railY=h*.56;line(c,railX-94,railY-73,railX+94,railY-73,'#6d7865',3);for(const side of[-1,1])line(c,railX+side*94,railY-73,railX+side*94,railY,'#657365',3);
 }else if(id==='toluca_prison'){
  for(let i=0;i<18;i++)line(c,i*w/17,h*.43,i*w/17+9,ground,'rgba(67,74,47,.1)',4);
  // Only the illuminated lower scaffold is represented; its unseen top stays absent.
 }else if(id==='labyrinth'){
  for(let i=0;i<7;i++)line(c,0,h*(.12+i*.075),w,h*(.12+i*.075),'rgba(92,93,73,.2)',2);
  for(let i=0;i<9;i++)line(c,i*w/8,h*.12,i*w/8,ground,'rgba(85,86,65,.17)',2);
 }else if(id==='shopping_mall'){
  rect(c,0,h*.43,w,h*.14,'#362f23');for(let i=0;i<29;i++)line(c,i*w/28,h*.43,i*w/28,ground,'#53432e',3);
  line(c,0,h*.43,w,h*.43,'#6a5137',6);
 }else if(id==='church'){
  rect(c,w*.14,h*.08,w*.72,ground-h*.08,'#34392c');
  for(const x of[w*.16,w*.35,w*.65,w*.84]){line(c,x,h*.06,x,ground,'#5b5b40',13);line(c,x-10,h*.07,x+10,h*.07,'#77704c',4);}
  rect(c,0,h*.46,w,h*.11,'#3e3829');for(let i=0;i<17;i++)line(c,i*w/16,h*.46,i*w/16,ground,'#62563b',2);
 }else if(id==='room_302'){
  rect(c,w*.18,h*.1,w*.78,ground-h*.1,'#74715b');
  line(c,0,h*.1,w,h*.1,'#a09b7e',7);line(c,0,h*.13,w,h*.13,'#8a896f',3);
  line(c,w*.18,h*.1,w*.18,ground,'#585e49',9);line(c,0,ground-15,w,ground-15,'#4e5843',8);
 }else if(id==='water_prison'){
  rect(c,0,h*.1,w,h*.47,'#777b64');
  for(let i=0;i<22;i++)line(c,i*w/21,h*.14,i*w/21+13,ground,'rgba(69,81,59,.15)',2);
  line(c,0,ground-4,w,ground-4,'#404f3c',4);
 }else if(id==='apartment_world'){
  rect(c,0,h*.14,w,h*.43,'#485044');
  for(let i=0;i<17;i++){const x=i*w/16;line(c,x,h*.14,x+12,h*.49,'rgba(97,99,74,.22)',3);}
  line(c,0,h*.49,w,h*.49,'#293d2d',8);
 }
 line(c,0,ground,w,ground,'rgba(14,25,17,.7)',5);c.restore();return true;
}

/** Returns false for an unrelated key so historical tracks keep their renderer. */
export function drawStageLot12Track(c,w,h,track,time){
 const x=track.anchor.x*w,y=track.anchor.y*h,p=.5+.5*Math.sin(Math.max(0,time)*.0012),v=.018+p*.014;
 switch(track.key){
 case 'wood208Clock':{
  const top=y-222;rect(c,x-43,top+34,86,188,'#3b3524');rect(c,x-49,y-13,98,13,'#645237');
  ellipse(c,x,top+34,42,43,'#5c4930');ellipse(c,x,top+34,29,30,'#929174');
  line(c,x,top+34,x-13,top+25,'#383e30',2);line(c,x,top+34,x+17,top+22,'#383e30',2);
  rect(c,x-28,top+78,56,116,'#1e2d23');line(c,x,top+83,x,top+162,'#9b8554',3);ellipse(c,x,top+164,13,17,'#8a7949');glow(c,x,top+95,75,v);break;
 }
 case 'wood208TV':{
  rect(c,x-73,y-72,146,72,'#66543b');rect(c,x-65,y-65,107,52,'#19271f');rect(c,x-59,y-59,95,40,`rgba(143,150,116,${.05+p*.025})`);
  for(let i=0;i<5;i++)line(c,x-58,y-54+i*7,x+35,y-54+i*7,'rgba(118,128,99,.18)',1);ellipse(c,x+57,y-53,7,7,'#333e2d');ellipse(c,x+57,y-28,7,7,'#333e2d');
  rect(c,x-64,y,128,29,'#342e23');break;
 }
 case 'wood208Shutters':{
  rect(c,x-53,y-81,106,162,'#242e24');for(let i=0;i<17;i++)line(c,x-49,y-77+i*9,x+49,y-77+i*9,i%2?'#5c5036':'#716040',5);line(c,x,y-80,x,y+80,'#302f21',5);glow(c,x,y,91,v);break;
 }
 case 'blueStairDoor':{
  rect(c,x-50,y-170,100,170,'#5b6654');rect(c,x-42,y-162,84,162,'#293d30');for(let i=0;i<2;i++)rect(c,x-30,y-147+i*76,60,58,'#344735');ellipse(c,x+30,y-78,4,4,'#8a8c63');glow(c,x,y-80,90,v);break;
 }
 case 'blueStairWater':{
  rect(c,x-125,y,250,h*.055,'#172f26');for(let i=0;i<7;i++){const shift=Math.sin(time*.0009+i)*5;line(c,x-112+shift,y+5+i*5,x+105-shift,y+5+i*5,`rgba(135,155,126,${.15+p*.035})`,1);}break;
 }
 case 'blueStairPlaster':{
  for(let i=0;i<12;i++){const dx=(i%4)*28-47,dy=Math.floor(i/4)*30-34;rect(c,x+dx,y+dy,17+(i%3)*6,16+(i%4)*4,i%2?'#4a513f':'#6a6b50');}glow(c,x,y,102,v);break;
 }
 case 'tolucaScaffoldPanel':{
  for(const side of[-1,1])rect(c,x+side*72-6,y-259,12,259,'#353e2c');rect(c,x-78,y-115,156,115,'#3b412d');
  for(let i=0;i<7;i++)line(c,x-73+i*24,y-111,x-73+i*24,y-4,'#5e6142',2);
  rect(c,x-45,y-98,90,75,'#667052');rect(c,x-40,y-92,80,65,'#344a36');for(let i=0;i<3;i++){rect(c,x-31+i*23,y-76,17,28,'#223b2a');line(c,x-31+i*23,y-76,x-14+i*23,y-76,'#7c8561',1);}glow(c,x,y-67,120,v);break;
 }
 case 'boxFacesPedestal':{
  rect(c,x-80,y-58,160,12,'#656043');rect(c,x-73,y-46,146,46,'#3c402d');for(const side of[-1,1])line(c,x+side*67,y-47,x+side*67,y,'#777052',4);
  ellipse(c,x,y-70,44,14,'#77704a');rect(c,x-10,y-126,20,55,'#6e6847');ellipse(c,x,y-125,17,6,'#7e7550');glow(c,x,y-72,75,v);break;
 }
 case 'boxFacesCube':{
  const ww=92;rect(c,x-ww*.5,y-48,ww,96,'#717b5e');c.fillStyle='#3c5140';c.beginPath();c.moveTo(x+46,y-48);c.lineTo(x+68,y-30);c.lineTo(x+68,y+45);c.lineTo(x+46,y+48);c.closePath();c.fill();
  // Abstract facial relief only: neither a copied portrait nor an additional creature.
  for(const side of[-1,1])rect(c,x+side*20-7,y-13,14,7,'#254c41');line(c,x,y-4,x+5,y+19,'#8d9673',6);line(c,x-21,y+30,x+23,y+30,'#3c5140',5);glow(c,x,y,90,v);break;
 }
 case 'boxFacesPanels':{
  rect(c,x-92,y-110,184,220,'#4b5543');for(let row=0;row<4;row++){line(c,x-92,y-110+row*55,x+92,y-110+row*55,'#2e3e30',3);for(let col=0;col<7;col++)ellipse(c,x-79+col*26,y-94+row*55,2,2,'#273b2c');}line(c,x,y-110,x,y+110,'#293d2f',3);glow(c,x,y,106,v);break;
 }
 case 'happyBurgerBlinds':{
  rect(c,x-148,y-90,296,180,'#292b1f');for(let i=0;i<22;i++)line(c,x-143,y-87+i*8,x+143,y-87+i*8,i%2?'#8d5e35':'#af7945',5);
  for(const dx of[-89,83])line(c,x+dx,y-89,x+dx,y+88,'#4b3d26',2);glow(c,x,y,143,.02+p*.018);break;
 }
 case 'happyBurgerTable':{
  rect(c,x-105,y-67,210,13,'#8f7345');for(const dx of[-89,89])line(c,x+dx,y-54,x+dx,y,'#4b4930',7);
  for(const[dx,hh,ww]of[[-22,20,10],[-3,13,12],[16,18,9]]){rect(c,x+dx,y-67-hh,ww,hh,'#b5a379');ellipse(c,x+dx+ww*.5,y-67-hh,ww*.5,2,'#d0bf91');}glow(c,x,y-66,120,v);break;
 }
 case 'happyBurgerChairs':{
  for(const side of[-1,1]){const xx=x+side*139;rect(c,xx-24,y-52,48,8,'#806f44');for(const dx of[-19,19])line(c,xx+dx,y-46,xx+dx,y,'#4f4b2f',5);line(c,xx+side*22,y-49,xx+side*29,y-116,'#8c7449',6);line(c,xx+side*29,y-116,xx-side*19,y-112,'#8c7449',8);}
  glow(c,x,y-63,166,v);break;
 }
 case 'sh3ChapelAltar':{
  rect(c,x-87,y-107,174,12,'#81734a');rect(c,x-78,y-95,156,95,'#4c4b31');for(const dx of[-60,60])line(c,x+dx,y-91,x+dx,y-5,'#8b7c4f',4);
  rect(c,x-31,y-85,62,71,'#2c3d29');for(const dx of[-20,0,20])line(c,x+dx,y-83,x+dx,y-16,'#6b6744',1);glow(c,x,y-68,104,v);break;
 }
 case 'sh3ChapelGlass':{
  for(const[col,xx]of[[0,x-83],[1,x],[2,x+83]]){rect(c,xx-32,y-95,64,190,'#242e20');for(let row=0;row<8;row++)rect(c,xx-26,y-89+row*23,52,19,(row+col)%2?'#9c8e4d':'#6c8b66');for(let i=0;i<4;i++)line(c,xx-26+i*17,y-88,xx-26+i*17,y+88,'#4d5131',2);}
  glow(c,x,y,153,.023+p*.024);break;
 }
 case 'room302ChainedDoor':{
  rect(c,x-87,y-236,174,236,'#8c8c71');rect(c,x-76,y-224,152,224,'#686e56');for(let row=0;row<3;row++){rect(c,x-58,y-207+row*65,116,48,'#797e60');}
  for(const[a,b,cc,d]of[[-82,-181,79,-112],[-82,-108,78,-179],[-82,-50,77,-111],[-25,-230,-4,-3],[42,-229,18,-1]]){line(c,x+a,y+b,x+cc,y+d,'#303d2b',5);for(let n=0;n<13;n++){const k=n/12;ellipse(c,x+a+(cc-a)*k,y+b+(d-b)*k,4,3,'#6f7655');}}
  ellipse(c,x+58,y-111,6,6,'#35432f');glow(c,x,y-107,124,v);break;
 }
 case 'room302CeilingLight':{
  ellipse(c,x,y,29,9,'#aaa58a');ellipse(c,x,y+3,23,8,'#ded1a4');glow(c,x,y+10,83,.035+p*.018);break;
 }
 case 'room302Kitchenette':{
  rect(c,x-112,y-168,116,168,'#929579');line(c,x-112,y-111,x+4,y-111,'#5f6c51',3);line(c,x-99,y-133,x-99,y-117,'#4e6044',3);line(c,x-99,y-92,x-99,y-68,'#4e6044',3);
  rect(c,x+4,y-90,121,90,'#616e50');rect(c,x+1,y-96,130,8,'#adb08a');rect(c,x+16,y-207,111,53,'#90967a');line(c,x+71,y-205,x+71,y-155,'#5b6c4e',2);
  for(let row=0;row<4;row++)for(let col=0;col<6;col++)rect(c,x+5+col*20,y-151+row*13,18,11,'#7d8c69');glow(c,x+26,y-103,144,v);break;
 }
 case 'waterPrisonValve':{
  rect(c,x-28,y-114,56,114,'#515946');rect(c,x-33,y-119,66,7,'#aaa98a');line(c,x,y-119,x,y-136,'#7b7954',5);ellipse(c,x,y-138,30,9,'#73543b');ellipse(c,x,y-138,22,5,'#6b7556');for(const dx of[-20,20])line(c,x,y-138,x+dx,y-139,'#9a7b50',2);glow(c,x,y-123,80,v);break;
 }
 case 'waterPrisonPeepholes':{
  for(const dx of[-139,0,139]){ellipse(c,x+dx,y,25,25,'#414d36');ellipse(c,x+dx,y,20,20,'#aea47b');ellipse(c,x+dx,y,13,13,'#172e22');for(let n=0;n<8;n++){const a=n*Math.PI/4;ellipse(c,x+dx+Math.cos(a)*19,y+Math.sin(a)*19,2.5,2.5,'#45523a');}}glow(c,x,y,172,v);break;
 }
 case 'waterPrisonShaft':{
  ellipse(c,x,y-8,92,20,'#576143');ellipse(c,x,y-8,83,15,'#172e22');for(const dx of[-17,17])line(c,x+dx,y-13,x+dx,y+7,'#7b8060',3);for(let i=0;i<3;i++)line(c,x-17,y-11+i*7,x+17,y-11+i*7,'#7b8060',2);glow(c,x,y-10,106,v);break;
 }
 case 'room105Desk':{
  rect(c,x-99,y-83,198,12,'#7c6948');rect(c,x-92,y-71,70,71,'#4d4934');rect(c,x+48,y-71,42,71,'#4d4934');for(let i=0;i<3;i++){line(c,x-89,y-55+i*22,x-25,y-55+i*22,'#797051',1);line(c,x-70,y-62+i*22,x-47,y-62+i*22,'#a08c5c',2);}
  rect(c,x-33,y-91,47,7,'#adac86');rect(c,x+19,y-92,31,8,'#81573b');glow(c,x,y-79,123,v);break;
 }
 case 'room105Chair':{
  rect(c,x-27,y-51,54,8,'#59684b');for(const dx of[-22,22]){line(c,x+dx,y-45,x+dx*1.25,y,'#8b9271',3);line(c,x+dx,y-51,x+dx,y-107,'#8b9271',3);}line(c,x-22,y-106,x+22,y-106,'#8b9271',3);rect(c,x-23,y-100,46,24,'#626c4d');glow(c,x,y-69,74,v);break;
 }
 case 'room105Bars':{
  rect(c,x-110,y-125,220,235,'#243c2b');for(let col=0;col<11;col++)line(c,x-106+col*21,y-123,x-106+col*21,y+108,'#6b7552',4);for(const dy of[-123,-55,36,108])line(c,x-110,y+dy,x+110,y+dy,'#4c6041',5);glow(c,x,y,135,v);break;
 }
 default:return false;
 }
 return true;
}
