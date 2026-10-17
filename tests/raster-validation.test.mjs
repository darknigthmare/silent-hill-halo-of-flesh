import test from 'node:test';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {decodePng,auditRaster,crc32,MAX_RASTER_BYTES} from '../scripts/raster-validation.mjs';
import {SPRITES} from '../src/sprite-manifest.js';
const sig=Buffer.from([137,80,78,71,13,10,26,10]);
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
const chunk=(kind,data)=>{const size=Buffer.alloc(4),tail=Buffer.alloc(4),type=Buffer.from(kind);size.writeUInt32BE(data.length);tail.writeUInt32BE(crc32(Buffer.concat([type,data])));return Buffer.concat([size,type,data,tail]);};
function fixture({filter=0,depth=8,color=6,interlace=0,alpha='valid',corruptFilter=false,extraPixels=0}={}){
 const w=256,h=128,channels=color===6?4:2,bpp=channels*depth/8,rgba=Buffer.alloc(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const at=(y*w+x)*4,a=alpha==='opaque'?255:alpha==='empty'?0:alpha==='edge'?(x<180?255:0):(x>=40&&x<190&&y>=16&&y<110?255:0);
  rgba[at]=a?x:0;rgba[at+1]=a?(channels===4?y:x):0;rgba[at+2]=a?(channels===4?64:x):0;rgba[at+3]=a;
 }
 const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=depth;header[9]=color;header[12]=interlace;
 const passes=interlace?[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]]:[[0,0,1,1]],rows=[];
 for(const [sx,sy,dx,dy] of passes){const pw=Math.ceil((w-sx)/dx);let previous=Buffer.alloc(pw*bpp);
  for(let y=sy;y<h;y+=dy){const row=Buffer.alloc(pw*bpp);for(let x=sx,k=0;x<w;x+=dx,k++)for(let c=0;c<channels;c++){
    const sample=rgba[(y*w+x)*4+(channels===2&&c===1?3:c)];row[k*bpp+c*(depth/8)]=sample;if(depth===16)row[k*bpp+c*2+1]=sample;
   }
   const encoded=Buffer.alloc(1+row.length);encoded[0]=corruptFilter?5:filter;
   for(let i=0;i<row.length;i++){const a=i>=bpp?row[i-bpp]:0,b=previous[i],c=i>=bpp?previous[i-bpp]:0;
    encoded[i+1]=(row[i]-(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}
   rows.push(encoded);previous=row;
  }
 }
 const idat=deflateSync(Buffer.concat([...rows,Buffer.alloc(extraPixels)]));
 return {bytes:Buffer.concat([sig,chunk('IHDR',header),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]),header,idat,rgba};
}
for(const filter of [0,1,2,3,4])test('PNG actual pixels decode filter '+filter,()=>{const f=fixture({filter}),a=decodePng(f.bytes);assert.deepEqual(a.visibleBounds,[40,16,190,110]);assert.equal(a.pixelSHA256,createHash('sha256').update(f.rgba).digest('hex'));});
for(const depth of [8,16])for(const color of [4,6])test(`PNG Adam7 ${depth}-bit color ${color} reconstructs pixels`,()=>{const f=fixture({depth,color,interlace:1,filter:4}),a=decodePng(f.bytes);assert.equal(a.pixelSHA256,createHash('sha256').update(f.rgba).digest('hex'));});
test('PNG header-only fake cannot pass even with matching digest and dimensions',()=>assert.throws(()=>decodePng(fixture().bytes.subarray(0,33)),/IEND|image data/));
test('PNG corruption fails CRC',()=>{const b=Buffer.from(fixture().bytes);b[50]^=1;assert.throws(()=>decodePng(b),/CRC/);});
test('PNG missing IEND is rejected',()=>assert.throws(()=>decodePng(fixture().bytes.subarray(0,-12)),/IEND/));
test('PNG missing IDAT rejected',()=>{const f=fixture();assert.throws(()=>decodePng(Buffer.concat([sig,chunk('IHDR',f.header),chunk('IEND',Buffer.alloc(0))])),/IEND/);});
test('PNG duplicated IHDR rejected',()=>{const f=fixture();assert.throws(()=>decodePng(Buffer.concat([sig,chunk('IHDR',f.header),chunk('IHDR',f.header),chunk('IDAT',f.idat),chunk('IEND',Buffer.alloc(0))])),/IHDR/);});
test('PNG corrupted deflate fails despite correct chunk CRC',()=>{const f=fixture();assert.throws(()=>decodePng(Buffer.concat([sig,chunk('IHDR',f.header),chunk('IDAT',Buffer.from('not deflate')),chunk('IEND',Buffer.alloc(0))])),/compressed/);});
test('PNG illegal scanline filter rejected',()=>assert.throws(()=>decodePng(fixture({corruptFilter:true}).bytes),/filter/));
test('PNG decoded buffer has strict expected length',()=>assert.throws(()=>decodePng(fixture({extraPixels:1}).bytes),/scanline/));
test('PNG oversized deflate expansion fails closed',()=>assert.throws(()=>decodePng(fixture({extraPixels:1000000}).bytes),/oversized/));
for(const alpha of ['opaque','empty','edge'])test('PNG alpha '+alpha+' is rejected by build audit',()=>assert.throws(()=>decodePng(fixture({alpha}).bytes),/alpha|edge/));
test('PNG APNG control rejected',()=>{const f=fixture();assert.throws(()=>decodePng(Buffer.concat([sig,chunk('IHDR',f.header),chunk('acTL',Buffer.alloc(8)),chunk('IDAT',f.idat),chunk('IEND',Buffer.alloc(0))])),/animated/);});
test('PNG unknown critical chunk rejected',()=>{const f=fixture();assert.throws(()=>decodePng(Buffer.concat([sig,chunk('IHDR',f.header),chunk('ABCD',Buffer.alloc(0)),chunk('IDAT',f.idat),chunk('IEND',Buffer.alloc(0))])),/critical/);});
test('PNG trailing file garbage rejected',()=>assert.throws(()=>decodePng(Buffer.concat([fixture().bytes,Buffer.from('bad')])),/trailing/));
test('re-encoding the same pixels produces the same pixel fingerprint',()=>assert.equal(decodePng(fixture({filter:0}).bytes).pixelSHA256,decodePng(fixture({filter:4}).bytes).pixelSHA256));
test('RIFF header without real WebP payload rejected',()=>{const b=Buffer.alloc(20);b.write('RIFF');b.writeUInt32LE(12,4);b.write('WEBP',8);assert.throws(()=>auditRaster(b,{python:'/no-decoder-here'}),/WebP pixel decode failed/);});
test('oversized file fails before decode',()=>assert.throws(()=>auditRaster(Buffer.alloc(MAX_RASTER_BYTES+1)),/24 MiB/));
test('both live candidate files decode and their published alpha bounds match',async()=>{
 for(const asset of Object.values(SPRITES))for(const f of asset.frames){const a=auditRaster(await readFile(new URL('../'+f.path,import.meta.url)));assert.deepEqual(f.visibleBounds,a.visibleBounds);assert.equal(f.pixelSHA256,a.pixelSHA256);}
});
