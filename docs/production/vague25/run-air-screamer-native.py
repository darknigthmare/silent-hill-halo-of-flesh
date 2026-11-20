"""One bounded native Air Screamer process, preserving all evidence and exit status."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--landmarks', required=True)
parser.add_argument('--out', required=True)
parser.add_argument('--stage', default='hazel_subway')
parser.add_argument('--timeout', type=int, default=180)
args = parser.parse_args()
root = Path(__file__).resolve().parents[3]
out = Path(args.out).resolve()
assert not out.exists(), 'Choose a fresh output directory; preserve existing evidence.'
assert Path(args.landmarks).is_file(), 'Reviewed, SHA-bound anatomical landmarks are required.'
out.mkdir(parents=True)
command = ['node', '--expose-gc', str(root / 'docs/production/vague25/qa-air-screamer-native.mjs'),
           '--landmarks=' + str(Path(args.landmarks).resolve()), '--out=' + str(out), '--stage=' + args.stage]
started = time.time()
observation = {'schema': 1, 'id': 'sh1_air_screamer_001', 'command': command,
               'startedAtUnix': started, 'timeoutSeconds': args.timeout,
               'browserTest': False, 'httpTest': False, 'actorStateInjected': False}
with (out / 'process.log').open('w') as log:
    try:
        process = subprocess.run(command, cwd=root, stdout=log, stderr=subprocess.STDOUT,
                                 timeout=args.timeout, check=False)
        observation.update({'exitCode': process.returncode, 'timeout': False})
    except subprocess.TimeoutExpired:
        observation.update({'exitCode': None, 'timeout': True})
observation['durationSeconds'] = round(time.time() - started, 3)
report_path = out / 'report.json'
observation['reportPresent'] = report_path.exists()
if report_path.exists():
    raw = report_path.read_bytes()
    report = json.loads(raw)
    observation.update({'reportSHA256': hashlib.sha256(raw).hexdigest(),
                        'reportPassed': report.get('passed') is True,
                        'checks': len(report.get('checks', [])), 'cases': len(report.get('cases', [])),
                        'captures': len(report.get('captures', [])), 'failure': report.get('failure')})
observation['passed'] = observation['exitCode'] == 0 and observation.get('reportPassed') is True
(out / 'process-observation.json').write_text(json.dumps(observation, indent=2) + '\n')
print(json.dumps(observation))
raise SystemExit(0 if observation['passed'] else 1)
