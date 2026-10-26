/* Original perspective sets. These are not traced recreations of official maps. */
const INTERIORS = new Set(['school','hospital','apartment','hotel','room','house','hall','office','building','prison','gallery','museum','mall','theater','subway','workshop','motelInterior','labyrinth','church']);
export function stageSpace(stage) {
  if(stage?.id==='devils_pit'&&stage.source==='downpour')return 'interior';
  if(stage?.id==='sewers'&&stage.source==='sh3')return 'interior';
  return stage?.id === 'brookhaven_roof' ? 'exterior' : INTERIORS.has(stage?.family) ? 'interior' : 'exterior';
}
const line = (c,x,y,xx,yy,color,width=2) => { c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke(); };
export function drawStageArchitecture(c,w,h,stage) {
  if(stage?.id==='brookhaven_roof'&&stage.source==='sh2'){
    // The still-intact fence is drawn by its exact-room track, behind the duel.
    // The roof is outside at night; a mountain backdrop would invent its view.
    c.save();c.fillStyle='#070b0b';c.fillRect(0,0,w,h*.57);
    c.fillStyle='#232a26';c.fillRect(w*.12,h*.19,w*.27,h*.38);
    c.fillStyle='#151c19';c.fillRect(w*.155,h*.29,w*.11,h*.28);
    c.fillStyle='#323831';c.fillRect(w*.15,h*.28,w*.12,6);
    line(c,w*.12,h*.19,w*.39,h*.19,'#43473d',4);
    for(let i=0;i<5;i++)line(c,w*.135,h*(.24+i*.055),w*.37,h*(.24+i*.055),'rgba(94,97,80,.16)',1);
    c.restore();return true;
  }
  if(stage?.id==='building_world'&&stage.source==='sh4'){
    // Abstract upper landing of the empty stairwell, without shop/elevator props.
    c.save();c.fillStyle='#161c1a';c.fillRect(0,0,w,h*.57);
    c.fillStyle='#091210';c.fillRect(w*.26,h*.31,w*.48,h*.26);
    for(const side of[-1,1]){
      const x=w*(.5+side*.24);line(c,x,h*.31,x,h*.57,'#4d5548',5);
      line(c,x,h*.29,w*(.5+side*.08),h*.49,'#626757',3);
      for(let i=0;i<7;i++){
        const y=h*(.34+i*.025),stepX=w*(.5+side*(.23-i*.023)),end=stepX-side*w*.115;
        line(c,stepX,y,end,y,'rgba(108,116,93,.54)',3);
        line(c,end,y,end,y+h*.025,'rgba(58,70,55,.68)',2);
      }
    }
    c.fillStyle='#3b4438';c.fillRect(w*.16,h*.57-8,w*.68,8);
    c.restore();return true;
  }
  if(stage?.id==='prison_meat_locker'&&stage.source==='sh2'){
    // The second freezer has ceiling rails and racks, not cells or a watchtower.
    c.save();c.fillStyle='#1a2925';c.fillRect(0,0,w,h*.57);
    for(const x of[w*.22,w*.5,w*.78])line(c,x,h*.09,x,h*.32,'#263a32',9);
    line(c,w*.12,h*.21,w*.88,h*.21,'#596356',5);
    for(const side of[-1,1]){
      const x=w*(.5+side*.32);line(c,x,h*.21,x,h*.31,'#575e50',2);
      c.strokeStyle='#575e50';c.lineWidth=2;c.beginPath();c.arc(x,h*.32,8,0,Math.PI*1.55);c.stroke();
      c.fillStyle='#343a2c';c.beginPath();c.moveTo(x-14,h*.33);c.lineTo(x+18,h*.34);c.lineTo(x+24,h*.43);c.lineTo(x+7,h*.51);c.lineTo(x-14,h*.48);c.lineTo(x-21,h*.39);c.closePath();c.fill();
    }
    c.restore();return true;
  }
  if(stage?.id==='artaud_theater'&&stage.source==='origins'){
    // A neutral painted backdrop avoids selecting an unverified prop configuration.
    c.save();c.fillStyle='#151715';c.fillRect(0,0,w,h*.57);
    c.fillStyle='#35372c';c.fillRect(w*.27,h*.2,w*.46,h*.37);
    c.fillStyle='#3e2826';c.fillRect(w*.16,h*.12,w*.11,h*.45);c.fillRect(w*.73,h*.12,w*.11,h*.45);
    c.fillStyle='#292923';c.fillRect(w*.15,h*.12,w*.7,h*.055);
    for(const x of[w*.36,w*.64]){line(c,x,h*.1,x,h*.185,'#42483a',3);c.fillStyle='#56594a';c.fillRect(x-18,h*.18,36,17);}
    c.fillStyle='#45412f';c.fillRect(w*.16,h*.57-7,w*.68,7);
    c.restore();return true;
  }
  if(stage?.id==='brookhaven_sh2'&&stage.source==='sh2'){
    // The pursuit ends in a narrow service corridor, outside the patient wards.
    c.save();c.fillStyle='#2a2921';c.fillRect(0,0,w,h*.57);
    for(let i=0;i<8;i++)line(c,w*.22,h*(.13+i*.055),w*.78,h*(.13+i*.055),'rgba(96,87,63,.16)',1);
    c.fillStyle='#161c17';c.fillRect(w*.12,h*.24,w*.21,h*.27);
    for(let i=0;i<9;i++){const x=w*(.12+i*.026),end=Math.min(w*.33,x+w*.045);line(c,x,h*.24,end,h*.51,'rgba(92,91,66,.42)',1);line(c,x,h*.51,end,h*.24,'rgba(92,91,66,.42)',1);}
    line(c,w*.115,h*.235,w*.335,h*.235,'#535744',5);line(c,w*.115,h*.515,w*.335,h*.515,'#535744',5);
    c.restore();return true;
  }
  if((stage?.id==='lakeside_amusement'&&stage.source==='sh1')||(stage?.id==='lakeside_sh3'&&stage.source==='sh3')){
    // Covered, open-sided rides: no distant ferris wheel or interior-room door.
    const top=h*.22,ground=h*.57;
    c.save();c.fillStyle='#101813';c.fillRect(0,0,w,ground);
    c.fillStyle=stage.source==='sh1'?'#3d3529':'#4b3b2e';c.fillRect(w*.17,top,w*.66,22);
    for(const x of[w*.19,w*.81])line(c,x,top,x,ground,'#514c3b',7);
    c.strokeStyle='#5c5442';c.lineWidth=5;c.beginPath();c.ellipse(w*.5,ground-2,w*.32,h*.04,0,0,Math.PI*2);c.stroke();
    c.restore();return true;
  }
  if(stage?.id==='midwich_nightmare'&&stage.source==='sh1'){
    c.save();const ground=h*.57;c.fillStyle='#181a16';c.fillRect(0,0,w,ground);
    for(let i=0;i<9;i++){const x=i*w/8;line(c,x,0,x,ground,'#37382e',4);}
    for(let y=h*.19;y<ground;y+=33)line(c,0,y,w,y,'rgba(91,72,48,.28)',2);
    c.restore();return true;
  }
  if(stage?.id==='forest_world'&&stage.source==='sh4') {
    // This first-visit path is enclosed by woodland, not the generic mountains.
    // It remains outside; the authored treeline changes no playable boundary.
    const ground=h*.57,back=c.createLinearGradient(0,0,0,ground);
    back.addColorStop(0,'#151e16');back.addColorStop(1,'#263024');
    c.save();c.fillStyle=back;c.fillRect(0,0,w,ground);
    for(let i=0;i<11;i++) {
      const x=(i+.45)*w/11,top=h*(.12+i%3*.035);
      line(c,x,ground,x,top,'#101910',11+i%3*3);
      line(c,x,top+80,x-42,top+47,'#101910',5);line(c,x,top+105,x+48,top+59,'#101910',5);
      c.fillStyle=i%2?'#1a2618':'#1d2a1b';c.beginPath();c.ellipse(x,top+25,w*.105,h*.15,0,0,Math.PI*2);c.fill();
    }
    c.restore();return true;
  }
  if (stageSpace(stage)!=='interior') return false;
  const family=stage.family, medical=family==='hospital', domestic=['hotel','room','house','apartment'].includes(family),chapel=stage.id==='church'&&stage.source==='sh3';
  const vx=w*.5,vy=h*.57,left=w*.23,right=w*.77,top=h*.15;
  c.save();
  const wall=c.createLinearGradient(0,top,0,vy);
  wall.addColorStop(0,medical?'#303b39':domestic?'#3b3631':'#353a35');
  wall.addColorStop(1,medical?'#202b2a':domestic?'#25231f':'#242c29');
  c.fillStyle=wall;c.fillRect(0,top,w,vy-top);
  c.fillStyle='rgba(8,12,11,.55)';c.beginPath();c.moveTo(0,0);c.lineTo(w,0);c.lineTo(right,top);c.lineTo(left,top);c.closePath();c.fill();
  c.fillStyle='rgba(7,10,9,.28)';c.beginPath();c.moveTo(0,0);c.lineTo(left,top);c.lineTo(left,vy);c.lineTo(0,h*.76);c.closePath();c.fill();
  c.beginPath();c.moveTo(w,0);c.lineTo(right,top);c.lineTo(right,vy);c.lineTo(w,h*.76);c.closePath();c.fill();
  line(c,0,0,left,top,'#454944',3);line(c,w,0,right,top,'#454944',3);
  line(c,left,top,left,vy,'#55574e',2);line(c,right,top,right,vy,'#55574e',2);
  if(medical||family==='school'||family==='subway') {
    for(let y=top+12;y<vy;y+=25)line(c,left,y,right,y,'rgba(132,150,140,.12)',1);
    for(let x=left+25;x<right;x+=46)line(c,x,top,x,vy,'rgba(132,150,140,.1)',1);
    c.fillStyle='#0f1b19';c.fillRect(left,vy-75,right-left,5);
    for(const x of [w*.15,w*.5,w*.85]){
      c.fillStyle='#171e1c';c.fillRect(x-62,h*.205,124,13);
      c.fillStyle='#7e8a76';c.fillRect(x-53,h*.207,106,5);
    }
  }
  if(domestic) {
    c.fillStyle='#241f1b';c.fillRect(left,vy-82,right-left,82);
    for(let x=left+18;x<right;x+=49)c.strokeRect(x,vy-74,36,65);
    for(let x=left+16;x<right;x+=38)line(c,x,top+4,x,vy-82,'rgba(137,119,91,.1)',1);
    c.fillStyle='#3b3027';c.fillRect(left,vy-87,right-left,7);
  }
  if(family==='subway') {
    c.fillStyle='#0b1213';c.fillRect(left,top+34,right-left,vy-top-34);
    for(let i=0;i<7;i++)line(c,left+i*(right-left)/6,top+32,left+i*(right-left)/6,vy,'#26352f',12);
    c.fillStyle='#71694b';c.fillRect(left,vy-7,right-left,4);
    line(c,left,vy-34,right,vy-34,'#444a42',3);
  } else if(stage.id==='sewers'&&stage.source==='sh3') {
    // Service passage, with fixed wall conduits; no domestic rear doorway.
    for(const y of[h*.25,h*.34])line(c,left,y,right,y,'#4d5b50',8);
    c.fillStyle='#17251f';c.fillRect(w*.24,h*.39,w*.13,h*.15);
    for(let i=0;i<6;i++)line(c,w*.25+i*23,h*.4,w*.25+i*23,h*.53,'#536255',2);
  } else if(chapel) {
    // A muted abstract glass panel marks the chapel, without copying sacred art.
    // No final-pit flesh/fans or memory-corridor door is borrowed for this view.
    const glassY=h*.19,glassW=w*.16,glassH=h*.29;
    c.fillStyle='#1b211d';c.fillRect(vx-glassW*.5-8,glassY-8,glassW+16,glassH+16);
    for(let col=0;col<3;col++)for(let row=0;row<5;row++) {
      c.fillStyle=['#5d5334','#454c37','#5a4533'][(col+row)%3];
      c.fillRect(vx-glassW*.5+col*glassW/3+2,glassY+row*glassH/5+2,glassW/3-4,glassH/5-4);
    }
    for(const side of [-1,1])line(c,vx+side*w*.17,top,vx+side*w*.17,vy,'#3d4036',9);
    c.fillStyle='#403729';c.fillRect(vx-w*.11,vy-22,w*.22,22);
    c.fillStyle='#71614a';c.fillRect(vx-w*.12,vy-28,w*.24,8);
  } else if(stage.id==='town_hall_hc'&&stage.source==='homecoming') {
    // The first public room has a bookstand behind its podium, not a hall door.
    line(c,vx,vy-h*.2,vx,vy,'#554833',5);
    c.fillStyle='#63513a';c.fillRect(vx-41,vy-h*.2,82,7);
    c.fillStyle='#938770';c.fillRect(vx-27,vy-h*.2-18,54,17);
    line(c,vx,vy-h*.2-18,vx,vy-h*.2-1,'#615743',1);
  } else {
    // Door is on the back wall, never floating on the fighter plane.
    const doorX=vx-w*.044,doorY=vy-h*.25,doorW=w*.088;
    c.fillStyle='#4e4b3e';c.fillRect(doorX-7,doorY-7,doorW+14,h*.25+7);
    c.fillStyle='#101715';c.fillRect(doorX,doorY,doorW,h*.25);
    c.fillStyle=medical?'#4c6159':'#403b30';c.fillRect(doorX+4,doorY+4,doorW-8,h*.25-8);
    c.fillStyle='#a09c7f';c.fillRect(doorX+doorW-16,doorY+h*.14,5,10);
    if(stage.id==='room_302'&&stage.source==='sh4') {
      line(c,doorX,doorY+33,doorX+doorW,doorY+133,'#70726a',4);
      line(c,doorX+doorW,doorY+24,doorX,doorY+142,'#70726a',4);
      c.fillStyle='#b3aa8f';c.font='12px ui-monospace';c.textAlign='center';c.fillText('302',vx,doorY+25);
      // The early washroom opening is a fixed rear prop, never a duel portal.
      const holeX=w*.78,holeY=h*.49;
      c.fillStyle='#0a1010';c.beginPath();c.ellipse(holeX,holeY,31,39,-.12,0,Math.PI*2);c.fill();
      c.strokeStyle='rgba(120,119,99,.36)';c.lineWidth=4;c.stroke();
      for(const [dx,dy] of [[-35,-24],[32,-28],[-34,31],[34,32]])line(c,holeX+dx*.75,holeY+dy*.75,holeX+dx*1.25,holeY+dy*1.25,'rgba(22,25,22,.65)',2);
    }
  }
  // Fixtures share the wall plane with shadows behind, not an outside skyline.
  c.fillStyle='rgba(4,8,6,.32)';c.fillRect(left,vy-5,right-left,5);
  c.restore();
  return true;
}
