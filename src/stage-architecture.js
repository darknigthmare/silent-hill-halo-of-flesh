/* Original perspective sets. These are not traced recreations of official maps. */
const INTERIORS = new Set(['school','hospital','apartment','hotel','room','house','hall','office','building','prison','gallery','museum','mall','theater','subway','workshop','motelInterior','labyrinth','church']);
export function stageSpace(stage) {
  return stage?.id === 'brookhaven_roof' ? 'exterior' : INTERIORS.has(stage?.family) ? 'interior' : 'exterior';
}
const line = (c,x,y,xx,yy,color,width=2) => { c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke(); };
export function drawStageArchitecture(c,w,h,stage) {
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
