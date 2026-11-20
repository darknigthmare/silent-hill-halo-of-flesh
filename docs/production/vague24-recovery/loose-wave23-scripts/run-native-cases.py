"""Run isolated, sequential native cases and preserve exact process observations."""
from pathlib import Path
import argparse
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import time

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]
QA = BASE / 'qa-native'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
p = argparse.ArgumentParser()
p.add_argument('--kind', choices=['characters', 'stages'], required=True)
p.add_argument('--ids', required=True)
p.add_argument('--stage', default='hazel_subway')
a = p.parse_args()
ids = a.ids.split(',')
assert ids and len(ids) == len(set(ids)) and all(i.replace('_', '').isalnum() for i in ids)
harness = BASE / ('qa-' + a.kind + '-native.mjs')
flags = ['--expose-gc', '--max-old-space-size=128', '--max-semi-space-size=1']
executed = QA / 'executed' / (harness.stem + '-' + sha(harness)[:12] + '.mjs')
executed.parent.mkdir(parents=True, exist_ok=True)
if executed.exists():
    assert sha(executed) == sha(harness)
else:
    shutil.copyfile(harness, executed)
for ident in ids:
    case = QA / 'cases' / ident
    if (case / 'report.json').exists() or (case / 'process.txt').exists():
        raise RuntimeError('Preserve existing evidence before any deliberate retry: ' + str(case))
    case.mkdir(parents=True, exist_ok=True)
    cmd = [shutil.which('node'), *flags, str(harness), '--out=' + str(case)]
    cmd += (['--ids=' + ident, '--stages=' + a.stage] if a.kind == 'characters' else ['--stages=' + ident])
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    tick = time.monotonic()
    with (case / 'process.txt').open('wb') as log:
        result = subprocess.run(cmd, cwd=ROOT, env={**os.environ, 'HALO_QA_ROOT': str(ROOT)}, stdout=log, stderr=subprocess.STDOUT)
    report_path = case / 'report.json'
    report = json.loads(report_path.read_text()) if report_path.exists() else None
    observation = {
        'schema': 1, 'kind': a.kind, 'id': ident, 'command': cmd,
        'startedAt': started, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'durationSeconds': round(time.monotonic() - tick, 3),
        'exitCode': result.returncode if result.returncode >= 0 else None,
        'signalNumber': -result.returncode if result.returncode < 0 else None,
        'nodeExecArgv': flags, 'harnessSHA256': sha(harness),
        'executedHarness': str(executed.relative_to(QA)),
        'reportSHA256': sha(report_path) if report_path.exists() else None,
        'log': 'process.txt', 'logSHA256': sha(case / 'process.txt'),
        'passed': result.returncode == 0 and bool(report and report.get('passed')),
    }
    if report:
        assert report['harnessSHA256'] == observation['harnessSHA256']
    (case / 'process-observation.json').write_text(json.dumps(observation, indent=2) + '\n')
    print(json.dumps({'id': ident, 'passed': observation['passed'], 'exitCode': observation['exitCode'],
        'checks': len(report['checks']) if report else 0, 'captures': len(report['captures']) if report else 0,
        'seconds': observation['durationSeconds']}), flush=True)
    if not observation['passed']:
        raise SystemExit(1)
