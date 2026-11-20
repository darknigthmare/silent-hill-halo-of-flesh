"""Run real FightEngine/native workshop QA one profile per process, preserving evidence."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--ids', required=True)
parser.add_argument('--stages', default='hazel_subway')
parser.add_argument('--out', required=True)
parser.add_argument('--timeout', type=int, default=180)
args = parser.parse_args()
root = Path(__file__).resolve().parents[3]
out = Path(args.out).resolve()
ids = args.ids.split(',')
assert ids and all(ids) and len(set(ids)) == len(ids)
assert all(all(c.islower() or c.isdigit() or c == '_' for c in ident) for ident in ids)
assert not out.exists(), 'Use a fresh output directory; preserve prior evidence.'
out.mkdir(parents=True)
rows = []
started = time.time()
for ident in ids:
    destination = out / ident
    destination.mkdir()
    command = ['node', '--expose-gc', str(root / 'docs/production/vague25/qa-characters-native.mjs'),
               '--ids=' + ident, '--stages=' + args.stages, '--out=' + str(destination)]
    start = time.time()
    observation = {'id': ident, 'command': command, 'startedAtUnix': start, 'timeoutSeconds': args.timeout}
    with (destination / 'process.log').open('w') as log:
        try:
            process = subprocess.run(command, cwd=root, stdout=log, stderr=subprocess.STDOUT,
                                     timeout=args.timeout, check=False)
            observation['exitCode'] = process.returncode
            observation['timeout'] = False
        except subprocess.TimeoutExpired:
            observation['exitCode'] = None
            observation['timeout'] = True
    observation['durationSeconds'] = round(time.time() - start, 3)
    report_path = destination / 'report.json'
    observation['reportPresent'] = report_path.exists()
    if report_path.exists():
        raw = report_path.read_bytes()
        report = json.loads(raw)
        observation.update({'reportSHA256': hashlib.sha256(raw).hexdigest(),
                            'reportPassed': report.get('passed') is True,
                            'checks': len(report.get('checks', [])),
                            'cases': len(report.get('cases', [])),
                            'referencePreviews': len(report.get('rendererPreviews', [])),
                            'captures': len(report.get('captures', [])),
                            'failure': report.get('failure')})
    observation['passed'] = (observation['exitCode'] == 0 and observation.get('reportPassed') is True)
    (destination / 'process-observation.json').write_text(json.dumps(observation, indent=2) + '\n')
    rows.append(observation)
    print(json.dumps({'id': ident, 'passed': observation['passed'],
                      'checks': observation.get('checks'), 'captures': observation.get('captures'),
                      'durationSeconds': observation['durationSeconds']}), flush=True)
    # Continue independent profiles so one failed calibration does not hide the rest.
summary = {'schema': 1, 'wave': 25, 'purpose': 'Native Canvas/FightEngine and workshop checks of explicit IDs.',
           'browserTest': False, 'httpTest': False, 'actorStateInjected': False,
           'startedAtUnix': started, 'durationSeconds': round(time.time() - started, 3),
           'ids': ids, 'processes': rows, 'passed': all(r['passed'] for r in rows),
           'successfulProcesses': sum(r['passed'] for r in rows),
           'checksInSuccessfulProcesses': sum(r.get('checks', 0) for r in rows if r['passed']),
           'combatCasesInSuccessfulProcesses': sum(r.get('cases', 0) for r in rows if r['passed']),
           'referencePreviewsInSuccessfulProcesses': sum(r.get('referencePreviews', 0) for r in rows if r['passed']),
           'capturesInSuccessfulProcesses': sum(r.get('captures', 0) for r in rows if r['passed']),
           'limits': ['No source animation timings or one-to-one fidelity are certified.',
                      'Visual review of the captured images is a separate recorded step.',
                      'Failed or interrupted processes are retained and excluded from success counts.']}
(out / 'process-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps({key: value for key, value in summary.items() if key != 'processes'}))
raise SystemExit(0 if summary['passed'] else 1)
