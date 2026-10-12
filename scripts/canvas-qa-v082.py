"""Render the game's actual Canvas functions in an in-memory page, without navigation.
This is NOT a substitute for the separately blocked localhost/UI/PWA test.
Requires Python Playwright and a local Chromium; no network requests are made.
"""
from pathlib import Path
import json,re,sys
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
out=root/'tests'/'canvas-v082';out.mkdir(parents=True,exist_ok=True)
modules={};active=set()
def bundle(name):
    if name in modules:return
    if name in active:raise RuntimeError('Unexpected import cycle '+name)
    active.add(name);s=(root/'src'/name).read_text()
    def imp(m):
        fields,dep=m.groups();bundle(dep)
        fields=re.sub(r'\s+as\s+',': ',fields)
        return f'const {{{fields}}}=M[{json.dumps(dep)}];'
    s=re.sub(r"import\s+\{([^}]+)\}\s+from\s+['\"]\./([^'\"]+)['\"];",imp,s)
    names=re.findall(r'export\s+(?:async\s+)?(?:const|let|function|class)\s+(\w+)',s)
    def exp(m):
        for f in m.group(1).split(','):
            f=f.strip()
            if f:names.append(f)
        return ''
    s=re.sub(r'export\s*\{([^}]+)\};',exp,s)
    s=re.sub(r'\bexport\s+(?=(?:async\s+)?(?:const|let|function|class)\b)','',s)
    modules[name]='M['+json.dumps(name)+']=(()=>{\n'+s+'\nreturn {'+','.join(dict.fromkeys(names))+'};})();'
    active.remove(name)
bundle('fight.js')
source='const M={};\n'+'\n'.join(modules.values())+'\nglobalThis.HALO=M;'
report={'version':'0.8.2','mode':'in-memory Canvas only; no URL navigation, controls, mobile or PWA certification','captures':[],'pageErrors':[],'requests':[]}
scenes=[('brookhaven_sh2',1,None),('room_302',0,None),('brookhaven_roof',1,None),('lakeview',1,None),('hazel_subway',.8,'trainRush'),('brookhaven_sh2',.8,'gurneyRush'),('ebisugaoka',1,'rootSnare'),('nightmare_school',1,'iceFracture'),('st_amelia_marina',.7,'waterRise')]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'],timeout=15000)
    page=browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
    page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
    page.on('request',lambda r:report['requests'].append(r.url))
    page.set_content('<!doctype html><html><head><style>html,body{margin:0;width:1280px;height:720px;overflow:hidden}canvas{display:block}</style></head><body><canvas id="c" width="1280" height="720"></canvas></body></html>')
    page.add_script_tag(content=source)
    for i,(sid,amount,hazard) in enumerate(scenes,1):
        info=page.evaluate('''([sid,amount,hid])=>{
          const {ROSTER,STAGES,STAGE_EVENTS}=HALO['data.js'],{FightEngine}=HALO['fight.js'];
          const stage=STAGES.find(s=>s.id===sid);if(!stage)return {skipped:sid};
          const e=new FightEngine(document.querySelector('canvas'),{p1:ROSTER.find(f=>f.id==='pyramid_head_sh2')||ROSTER.find(f=>f.visual.kind==='pyramid'),p2:ROSTER.find(f=>f.source==='sh2'&&f.visual.kind==='nurse'),stage,mode:'local',seed:8101});
          e.phase='fight';e.phaseTimer=0;e.frame=220;e.world.amount=amount;e.world.phase=amount>=1?'otherworld':'fog';e.settings.screenShake=false;
          if(hid){if(STAGE_EVENTS[hid] && hid==='waterRise'){e.triggerStageEvent(hid);}else{const h=e.spawnHazard(hid);Object.assign(h,{x:640,zoneMin:370,zoneMax:970,side:1,timer:0,active:17,maxActive:34});}}
          e.actors[0].x=335;e.actors[1].x=970;e.render(0);
          const result={stageId:stage.id,stageName:stage.name,hazard:hid,version:'0.8.2',geometry:e.actors.map(a=>HALO['combat-geometry.js'].bodyBox(a))};e.destroy();return result;
        }''',[sid,amount,hazard])
        if 'skipped' in info:report['captures'].append(info);continue
        name=f'{i:02d}-{sid}'+(('-'+hazard) if hazard else '')+'.png'
        page.screenshot(path=str(out/name));info['file']=name;report['captures'].append(info)
    browser.close()
(out/'canvas-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
if report['pageErrors'] or report['requests']:sys.exit(1)
