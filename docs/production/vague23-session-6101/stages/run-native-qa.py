"""Run four independent native stage QA processes after the parent stability gate.

No execution occurs merely by reading this file. Invoke explicitly after builds finish.
No art, runtime module, manifest or delivered descriptor is modified.
"""
from pathlib import Path
import datetime, hashlib, json, os, shutil, subprocess, time

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
BASE=ROOT/'docs/production/vague23'
QA=BASE/'qa-native'
HARNESS=BASE/'qa-stages-native.mjs'
IDS=['book_fire','book_earth','book_blood','book_water']
NODE=os.environ['CODEX_PRIMARY_RUNTIME_NODE']
FLAGS=['--expose-gc','--max-old-space-size=128','--max-semi-space-size=1']

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()

def main():
    harness_sha=sha(HARNESS)
    executed=QA/'executed'/('qa-stages-native-'+harness_sha[:12]+'.mjs')
    executed.parent.mkdir(parents=True,exist_ok=True)
    if executed.exists():
        assert sha(executed)==harness_sha, 'Executed harness copy differs'
    else:
        shutil.copyfile(HARNESS,executed)
    summaries=[]
    for sid in IDS:
        out=QA/'cases'/sid
        assert not (out/'report.json').exists(), 'Keep existing evidence; use a fresh case path.'
        out.mkdir(parents=True,exist_ok=True)
        command=[NODE,*FLAGS,str(HARNESS),'--out='+str(out),'--stages='+sid]
        env=dict(os.environ);env['HALO_QA_ROOT']=str(ROOT)
        started=now();tick=time.monotonic()
        with (out/'process.txt').open('wb') as log:
            completed=subprocess.run(command,cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT)
        ended=now();report=out/'report.json'
        data=json.loads(report.read_text()) if report.exists() else {}
        process={'schema':1,'kind':'stages','id':sid,'command':command,'startedAt':started,
          'completedAt':ended,'durationSeconds':round(time.monotonic()-tick,3),
          'exitCode':completed.returncode if completed.returncode>=0 else None,
          'signalNumber':-completed.returncode if completed.returncode<0 else None,
          'nodeExecArgv':FLAGS,'harnessSHA256':harness_sha,
          'executedHarness':executed.relative_to(QA).as_posix(),
          'reportSHA256':sha(report) if report.exists() else None,
          'log':'process.txt','logSHA256':sha(out/'process.txt'),
          'passed':completed.returncode==0 and data.get('passed') is True}
        (out/'process-observation.json').write_text(json.dumps(process,indent=2)+'\n')
        summary={'stageId':sid,'passed':process['passed'],'exitCode':process['exitCode'],
          'signalNumber':process['signalNumber'],'checks':len(data.get('checks',[])),
          'captures':len(data.get('captures',[])),'report':str(report)}
        summaries.append(summary);print(json.dumps(summary),flush=True)
        if not process['passed']:
            raise RuntimeError('Native QA failed for '+sid+'; evidence preserved, do not rerun into same directory.')
    (HERE/'native-process-summary.json').write_text(json.dumps({'createdAt':now(),'runs':summaries},indent=2)+'\n')

if __name__=='__main__': main()
