from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request, urllib.error, urllib.parse, json, hashlib, io, re, datetime
from PIL import Image
ROOT=Path('/workspace/scratch/halo-wave22-fighters-a')
OUT=ROOT/'references'; OUT.mkdir(parents=True,exist_ok=True)
existing=json.loads((ROOT/'prior-provenance-selected.json').read_text())
urls={}
for row in existing:
    rec=row['record']; owner=rec.get('fighterId')
    for ref in rec.get('references',[]):
        if ref.get('url'):urls[ref['url']]={'id':owner,'priorSha256':ref.get('sha256')}
    for url in rec.get('sourceReferenceUrls',[]):
        urls[url]={'id':owner}
for owner,url in [
('sh1_grey_child_005','https://www.silenthillmemories.net/sh1/creatures/grey_child.png'),
('sh1_grey_child_005','https://www.silenthillmemories.net/sh1/arts/pics/sh1_art_cre_01.jpg'),
('sh1_grey_child_005','https://www.silenthillmemories.net/sh1/enemies_en.htm'),
('sh4_bottom_065','https://www.silenthillmemories.net/sh4/monsters/bottom.png'),
('sh4_bottom_065','https://www.silenthillmemories.net/sh4/arts_monsters_en.htm'),
('homecoming_asphyxia_096','https://www.silenthillmemories.net/sh5/creatures/asphyxia.jpg'),
('homecoming_asphyxia_096','https://www.silenthillmemories.net/sh5/arts_creatures_en.htm'),
('shattered-variants','https://www.silenthillmemories.net/sh_shattered_memories/variations_en.htm'),
('shattered-variants','https://www.silenthillmemories.net/sh_shattered_memories/monsters_en.htm'),
('shattered-variants','https://shshatteredmemories.com/monsters/'),
('origins_remnant_077','https://www.silenthillmemories.net/sh0/creatures/remnant.jpg')
]:urls[url]={'id':owner}
def fetch(item):
    url,context=item
    name=context['id']+'__'+Path(urllib.parse.urlparse(url).path).name
    if name.endswith('__'): name+='index.html'
    path=OUT/name
    try:
        request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(request,timeout=30) as r:
            data=r.read(); status=r.status; final=r.url; content_type=r.headers.get('Content-Type')
        path.write_bytes(data)
        row=dict(context,url=url,finalUrl=final,status=status,contentType=content_type,localPath=str(path),bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
        try:
            im=Image.open(io.BytesIO(data));row.update(width=im.width,height=im.height,mode=im.mode,format=im.format)
        except Exception:
            text=data.decode('utf-8','replace')
            row['imageLinks']=sorted(set(urllib.parse.urljoin(url,s) for s in re.findall(r'(?:href|src|data-src)=["\x27]([^"\x27]+)',text) if re.search(r'\.(?:png|jpg|jpeg|gif|webp)(?:[?#]|$)',s,re.I)))
        if row.get('priorSha256'):row['matchesPriorSha256']=row['priorSha256']==row['sha256']
        return row
    except Exception as e:return dict(context,url=url,error=str(e))
with ThreadPoolExecutor(max_workers=4) as pool:records=list(pool.map(fetch,urls.items()))
(ROOT/'reference-downloads-1.json').write_text(json.dumps({'fetchedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'records':records},ensure_ascii=False,indent=2)+'\n')
for row in records:
    compact={k:v for k,v in row.items() if k!='imageLinks'}
    if 'imageLinks' in row:compact['selectedLinks']=[u for u in row['imageLinks'] if re.search(r'raw.?shock|asphyxia|bottom|remnant|momma',u,re.I)]
    print(json.dumps(compact,ensure_ascii=False),flush=True)
