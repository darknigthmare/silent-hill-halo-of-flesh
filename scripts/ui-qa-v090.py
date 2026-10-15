"""Isolated UI+Canvas QA; no HTTP, mocked WebStorage, fixture query parameters.
This is not deployment/PWA/physical-device certification. No network restrictions are bypassed.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests'/'ui-v090';OUT.mkdir(parents=True,exist_ok=True)
sources={p.relative_to(ROOT).as_posix():p.read_text() for p in (ROOT/'src').glob('*.js')}
report={'version':'0.9.0','kind':'isolated-dom-canvas','httpNavigation':False,'storage':'mock WebStorage',
        'fixtureQuery':'qa=1','assertions':[],'errors':[],'network':[],'screenshots':[],
        'sourceHashes':{k:hashlib.sha256(v.encode()).hexdigest() for k,v in sources.items()}}
def check(name,value):
 report['assertions'].append({'name':name,'passed':bool(value)})
 if not value:raise AssertionError(name)
def capture(page,name):
 page.screenshot(path=str(OUT/f'{name}.png'),full_page=True);report['screenshots'].append(f'{name}.png')
html=(ROOT/'modules/unified-versus.html').read_text()
html=re.sub(r'<link[^>]*>', '',html)
html=re.sub(r'<script[^>]*src=[^>]*></script>','',html)
css=(ROOT/'styles.css').read_text()+'\n'+(ROOT/'modules/versus.css').read_text()
html=html.replace('</head>',f'<style>{css}</style></head>')
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000})
  page.on('pageerror',lambda e:report['errors'].append(str(e)))
  page.on('request',lambda r:report['network'].append(r.url))
  page.set_content(html)
  page.evaluate('''sources=>{
    const data=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),key:i=>[...data.keys()][i],get length(){return data.size;}}});
    window.confirm=()=>true;
    const urls=new Map(),building=new Set();
    function resolvePath(file,rel){const parts=file.split('/');parts.pop();for(const part of rel.split('/')){if(part==='..')parts.pop();else if(part!=='.')parts.push(part);}return parts.join('/');}
    function make(name){if(urls.has(name))return urls.get(name);if(building.has(name))throw Error('Module cycle: '+name);building.add(name);
      let source=sources[name];if(!source)throw Error('Missing local module: '+name);
      if(name==='src/versus.js')source=source.replace('new URLSearchParams(location.search)',"new URLSearchParams('qa=1')");
      source=source.replace(/(from\\s*|import\\s*)(['"])(\\.{1,2}\\/[^'"]+)\\2/g,(_,prefix,quote,rel)=>prefix+quote+make(resolvePath(name,rel))+quote);
      const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));urls.set(name,url);building.delete(name);return url;}
    window.__LOCAL_IMPORT__=name=>import(make(name));return window.__LOCAL_IMPORT__('src/versus.js');
  }''',sources)
  page.wait_for_function('!!window.__HALO_QA__')
  check('selection initializes 30 roster entries',page.locator('#roster > *').count()==30)
  capture(page,'01-selection')
  page.click('#openControls');check('controls native modal opens',page.locator('.controls-dialog').evaluate('(d)=>d.open'))
  page.click('[data-binding="light"]');page.keyboard.press('b')
  check('physical key rebound and persisted',page.evaluate("JSON.parse(localStorage.getItem('sh-halo-of-flesh-controls-v1')).players[0].light==='KeyB'"))
  page.click('[data-binding="heavy"]');page.keyboard.press('b')
  check('conflicting key rejected', 'utilisée' in page.locator('#bindingMessage').inner_text())
  page.keyboard.press('Escape');capture(page,'02-controls')
  page.click('#closeBindings');page.click('#launch');page.wait_for_function('!!window.__HALO_QA__.engine')
  page.evaluate("()=>{const e=__HALO_QA__.engine;e.phase='fight';e.phaseTimer=0;e.config.stageHazards=false;e.config.mode='local';}")
  page.keyboard.press('ArrowUp');page.wait_for_timeout(110)
  check('keyboard jump reaches engine',page.evaluate('__HALO_QA__.engine.actors[0].y<580'))
  page.wait_for_timeout(700)
  page.click('#mobileP1');page.locator('[data-action="jump"]').dispatch_event('pointerdown',{'pointerId':1,'pointerType':'touch'})
  page.wait_for_timeout(110)
  check('touch jump reaches engine',page.evaluate('__HALO_QA__.engine.actors[0].y<580'))
  page.locator('[data-action="jump"]').dispatch_event('pointerup',{'pointerId':1,'pointerType':'touch'})
  page.click('#pauseBtn');check('pause stops simulation with an accessible dialog',page.evaluate('__HALO_QA__.engine.paused') and page.locator('dialog[aria-labelledby="pauseTitle"]').evaluate('(d)=>d.open'))
  frame=page.evaluate('__HALO_QA__.engine.frame');page.wait_for_timeout(120);check('paused simulation does not advance',page.evaluate('__HALO_QA__.engine.frame')==frame)
  capture(page,'03-pause')
  page.keyboard.press('Escape');check('Escape resumes and focuses canvas',page.evaluate("!__HALO_QA__.engine.paused&&document.activeElement.id==='game'"))
  page.evaluate("()=>{const q=__HALO_QA__,p=q.selection.p1;q.handleMatchEnd({winnerIndex:1,winner:p,loser:p,stats:{winner:{perfectGuards:99,healthRatio:1},loser:{perfectGuards:2,healthRatio:0}},snapshot:{p1:{meter:0}}});}")
  page.wait_for_timeout(700)
  check('mirror loss UI is not a victory', 'DÉFAITE' in page.locator('#resultKicker').inner_text())
  check('records contain player stats, not opponent stats',page.evaluate("JSON.parse(localStorage.getItem('sh-halo-of-flesh-records-v1')).perfectGuards===2"))
  capture(page,'04-results')
  page.click('#resultSelect')
  page.evaluate('''async()=>{const m=await __LOCAL_IMPORT__('src/run-progress.js');const q=__HALO_QA__;
    m.saveRun(m.createRun({mode:'boss',playerId:q.selection.p1.id,seed:77,rules:{roundsToWin:1}}));q.restoreCheckpoint();}''')
  check('checkpoint restored boss sequence',page.evaluate('__HALO_QA__.run.mode==="boss"&&__HALO_QA__.run.index===0'))
  page.evaluate("()=>{const q=__HALO_QA__;q.handleMatchEnd({winnerIndex:0,winner:q.selection.p1,loser:q.selection.p2,stats:{winner:{healthRatio:.5},loser:{}},snapshot:{p1:{meter:50}}});}")
  page.wait_for_timeout(700)
  page.click('#continueRun');check('Continue advances to encounter two',page.evaluate('__HALO_QA__.run.index===1&&__HALO_QA__.run.wins===1'))
  page.evaluate('__HALO_QA__.showSelect()');check('selection shows recoverable checkpoint',page.locator('#runCheckpoint').is_visible())
  capture(page,'05-checkpoint')
  # Stale delayed result must not resurface over selection.
  page.evaluate("()=>{const q=__HALO_QA__;q.restoreCheckpoint();q.handleMatchEnd({winnerIndex:1,winner:q.selection.p2,loser:q.selection.p1,stats:{winner:{},loser:{}},snapshot:{p1:{meter:0}}});q.showSelect();}")
  page.wait_for_timeout(650);check('stale result callback canceled on exit',not page.locator('#result').is_visible())
  page.set_viewport_size({'width':430,'height':932});page.click('#openControls')
  check('mobile controls dialog stays within viewport',page.locator('.controls-dialog').evaluate('(d)=>d.getBoundingClientRect().right<=innerWidth+1'))
  capture(page,'06-mobile-controls');page.click('#closeBindings')
  page.evaluate('__HALO_QA__.engine?.destroy()');browser.close()
except Exception as error:
 report['failure']=str(error)
finally:
 report['passed']=not report.get('failure') and not report['errors']
 (OUT/'ui-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(json.dumps({k:report[k] for k in ['passed','assertions','errors','network']},ensure_ascii=False,indent=2))
 if report.get('failure'):raise SystemExit(report['failure'])
