/** Build-time pixel validation; no browser or network required for PNG.
 * The decoder accepts the authoring pipeline's static RGBA/LA PNG subset (8/16 bit,
 * including Adam7). WebP uses the same Pillow decoder as the importer, failing closed
 * when unavailable. Specification: https://www.w3.org/TR/png-3/
 */
import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export const MAX_RASTER_BYTES=24*1024*1024;
const SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
const fail=message=>{throw new Error('Raster decode: '+message);};
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
const ADAM7=[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]];
function checkedDimensions(w,h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<256||h<128||w>4096||h>4096)fail('dimensions outside 256..4096 × 128..4096');}
function alphaSummary(rgba,w,h){
 let clear=0,maximum=0,left=w,top=h,right=0,bottom=0,alphaLeft=w,alphaTop=h,alphaRight=0,alphaBottom=0;
 const visited=new Uint8Array(w*h),queue=new Uint32Array(w*h);let tail=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,a=rgba[i+3];if(a<16)clear++;maximum=Math.max(maximum,a);
  if(a>=32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);visited[y*w+x]=1;queue[tail++]=y*w+x;}
  if(a>0){alphaLeft=Math.min(alphaLeft,x);alphaTop=Math.min(alphaTop,y);alphaRight=Math.max(alphaRight,x+1);alphaBottom=Math.max(alphaBottom,y+1);}
  // Invisible RGB data must not make re-encoded copies appear to be distinct art.
  if(a===0)rgba.fill(0,i,i+3);
 }
 const fraction=clear/(w*h);
 if(fraction<.08||fraction>.98||maximum<96)fail('opaque, empty or unreadable alpha');
 if(left<1||top<1||right>=w||bottom>=h||right<=left||bottom<=top)fail('visible subject touches image edge');
 // Keep faint edges connected to any readable part of the subject. Isolated
 // alpha-one speckles in transparent padding must not make a fighter tiny.
 let framingLeft=left,framingTop=top,framingRight=right,framingBottom=bottom;
 for(let head=0;head<tail;head++){
  const at=queue[head],x=at%w,y=Math.floor(at/w);
  for(let ny=Math.max(0,y-1);ny<=Math.min(h-1,y+1);ny++)for(let nx=Math.max(0,x-1);nx<=Math.min(w-1,x+1);nx++){
   const next=ny*w+nx;if(visited[next])continue;visited[next]=1;
   if(rgba[next*4+3]>0){queue[tail++]=next;framingLeft=Math.min(framingLeft,nx);framingTop=Math.min(framingTop,ny);framingRight=Math.max(framingRight,nx+1);framingBottom=Math.max(framingBottom,ny+1);}
  }
 }
 return {visibleBounds:[left,top,right,bottom],alphaBounds:[alphaLeft,alphaTop,alphaRight,alphaBottom],framingBounds:[framingLeft,framingTop,framingRight,framingBottom],transparentFraction:Math.round(fraction*1e5)/1e5,
  pixelSHA256:createHash('sha256').update(rgba).digest('hex')};
}
export function decodePng(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length>MAX_RASTER_BYTES||!bytes.subarray(0,8).equals(SIGNATURE))fail('expected bounded PNG');
 let header=null,idats=[],seenData=false,dataEnded=false,ended=false,palette=false,offset=8;
 while(offset<bytes.length){
  if(bytes.length-offset<12)fail('truncated chunk');
  const length=bytes.readUInt32BE(offset),type=bytes.subarray(offset+4,offset+8).toString('ascii'),at=offset+8;
  if(length>bytes.length-offset-12||!/^([A-Za-z]){4}$/.test(type)||type[2]!==type[2].toUpperCase())fail('invalid chunk');
  if(crc32(bytes.subarray(offset+4,at+length))!==bytes.readUInt32BE(at+length))fail('CRC mismatch '+type);
  const data=bytes.subarray(at,at+length);offset=at+length+4;
  if(!header&&type!=='IHDR')fail('IHDR must be first');
  if(['acTL','fcTL','fdAT'].includes(type))fail('animated PNG is not a single pose');
  if(type==='IHDR'){
   if(header||length!==13)fail('invalid/duplicate IHDR');
   const w=data.readUInt32BE(0),h=data.readUInt32BE(4),depth=data[8],color=data[9];checkedDimensions(w,h);
   if(![8,16].includes(depth)||![4,6].includes(color)||data[10]!==0||data[11]!==0||data[12]>1)fail('unsupported alpha/PNG methods');
   header={width:w,height:h,depth,channels:color===6?4:2,interlace:data[12]};
  }else if(type==='IDAT'){
   if(dataEnded)fail('nonconsecutive IDAT');seenData=true;idats.push(data);
  }else if(type==='IEND'){
   if(length||!seenData||offset!==bytes.length)fail('invalid IEND or trailing file data');ended=true;break;
  }else{
   if(seenData)dataEnded=true;
   if(type==='PLTE'){
    if(palette||seenData||header.channels===2||!length||length%3||length>768)fail('invalid PLTE');palette=true;
   }else if(type[0]===type[0].toUpperCase())fail('unknown critical chunk '+type);
   if(type==='tRNS')fail('tRNS not allowed with a native alpha channel');
  }
 }
 if(!ended||!header||!idats.length)fail('missing image data or IEND');
 const {width:w,height:h,depth,channels,interlace}=header,bpp=channels*depth/8;
 const passes=(interlace?ADAM7:[[0,0,1,1]]).map(([x,y,dx,dy])=>({x,y,dx,dy,w:Math.max(0,Math.ceil((w-x)/dx)),h:Math.max(0,Math.ceil((h-y)/dy))})).filter(p=>p.w&&p.h);
 const expected=passes.reduce((n,p)=>n+(p.w*bpp+1)*p.h,0),compressed=Buffer.concat(idats);
 if(!compressed.length)fail('empty IDAT');
 let raw;
 try{raw=inflateSync(compressed,{maxOutputLength:expected+1});}catch{fail('invalid or oversized compressed pixels');}
 if(raw.length!==expected)fail('decoded scanline length mismatch');
 const rgba=Buffer.alloc(w*h*4);let at=0;
 for(const p of passes){
  const rowLength=p.w*bpp;let previous=Buffer.alloc(rowLength),row=Buffer.alloc(rowLength);
  for(let y=0;y<p.h;y++){
   const filter=raw[at++];if(filter>4)fail('invalid scanline filter');
   for(let i=0;i<rowLength;i++){
    const a=i>=bpp?row[i-bpp]:0,b=previous[i],c=i>=bpp?previous[i-bpp]:0;
    row[i]=(raw[at++]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;
   }
   for(let x=0;x<p.w;x++){
    const input=x*bpp,target=((p.y+y*p.dy)*w+p.x+x*p.dx)*4,stride=depth/8;
    rgba[target]=row[input];rgba[target+1]=row[input+(channels===4?stride:0)];rgba[target+2]=row[input+(channels===4?2*stride:0)];rgba[target+3]=row[input+(channels-1)*stride];
   }
   [row,previous]=[previous,row];
  }
 }
 return {width:w,height:h,alpha:true,animated:false,format:'PNG',...alphaSummary(rgba,w,h)};
}
export function auditRaster(bytes,{python=process.env.HALO_PYTHON||(process.platform==='win32'?'python':'python3')}={}){
 if(!Buffer.isBuffer(bytes)||!bytes.length||bytes.length>MAX_RASTER_BYTES)fail('input must be 1..24 MiB');
 if(bytes.subarray(0,8).equals(SIGNATURE))return decodePng(bytes);
 if(bytes.length<20||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length)fail('expected valid PNG/WebP container');
 const helper=fileURLToPath(new URL('./validate-webp.py',import.meta.url));
 const processResult=spawnSync(python,[helper],{input:bytes,timeout:15000,maxBuffer:128*1024,windowsHide:true});
 if(processResult.error||processResult.status!==0)fail('WebP pixel decode failed (Python + Pillow required): '+String(processResult.stderr||processResult.error||'decoder exit').slice(0,500));
 let result;try{result=JSON.parse(processResult.stdout.toString());}catch{fail('invalid WebP decoder response');}
 checkedDimensions(result.width,result.height);
 if(result.format!=='WEBP'||result.sha256!==createHash('sha256').update(bytes).digest('hex')||!result.alpha||result.animated||!Array.isArray(result.visibleBounds)||result.visibleBounds.length!==4||!Array.isArray(result.alphaBounds)||result.alphaBounds.length!==4||!Array.isArray(result.framingBounds)||result.framingBounds.length!==4||!/^[a-f0-9]{64}$/.test(result.pixelSHA256))fail('inconsistent WebP decoder response');
 return result;
}
