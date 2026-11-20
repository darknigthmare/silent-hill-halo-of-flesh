"""Run final data verification and targeted sprite tests with an explicit TAP reporter."""
from pathlib import Path
import argparse
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--out', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[3]
out = Path(args.out).resolve()
assert not out.exists(), 'Preserve prior results; use a fresh output path.'
out.parent.mkdir(parents=True, exist_ok=True)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def now():
    return datetime.now(timezone.utc).isoformat()

baseline = json.loads((root / 'docs/production/vague25/scope-baseline.json').read_text())
protected = {item['path']: item['sha256'] for item in baseline['protectedFiles']}
assert all(sha(root / path) == expected for path, expected in protected.items())
for path in ['art/registry.json', 'src/sprite-manifest.js', 'src/stage-bitmap-manifest.js',
             'service-worker.js', 'data/sprite-coverage.json']:
    protected[path] = sha(root / path)

commands = [
    ('build-verification', ['node', 'scripts/build.mjs', '--verify-only'], '.build.log'),
    ('character-tests', ['node', '--test', '--test-reporter=tap', '--test-concurrency=1',
                         'tests/sprites.test.mjs', 'tests/sprite-usage.test.mjs',
                         'tests/art-campaign-review.test.mjs', 'tests/gamedev-sprite-backlog.test.mjs',
                         'tests/gamedev-sprite-regression.test.mjs', 'tests/sprite-clips.test.mjs'], '.tests.tap'),
]
report = {
    'schema': 1, 'wave': 25, 'startedAt': now(), 'passed': False,
    'scope': 'Final data verification and six targeted sprite suites. Stage suites are retained separately and are not recounted as rerun.',
    'commands': [], 'protectedBefore': protected,
}

def save():
    out.write_text(json.dumps(report, indent=2) + '\n')

try:
    for name, command, suffix in commands:
        log = out.with_name(out.stem + suffix)
        assert not log.exists(), 'Preserve the existing log.'
        started = time.monotonic()
        with log.open('x') as stream:
            process = subprocess.run(command, cwd=root, stdout=stream,
                                     stderr=subprocess.STDOUT, check=False)
        row = {'name': name, 'command': command, 'exitCode': process.returncode,
               'durationSeconds': round(time.monotonic() - started, 3),
               'log': str(log.relative_to(root)), 'logSHA256': sha(log),
               'bytes': log.stat().st_size, 'passed': process.returncode == 0}
        if name == 'character-tests':
            text = log.read_text()
            counts = {}
            for key in ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']:
                matches = re.findall(r'^# ' + key + r' (\d+)$', text, re.M)
                counts[key] = int(matches[-1]) if matches else None
            row['tap'] = counts
            row['passed'] = row['passed'] and all(value is not None for value in counts.values())
            if row['passed']:
                row['passed'] = counts['tests'] > 0 and counts['pass'] == counts['tests'] and all(
                    counts[key] == 0 for key in ['fail', 'cancelled', 'skipped', 'todo'])
        report['commands'].append(row)
        save()
        print(json.dumps(row), flush=True)
        if not row['passed']:
            raise RuntimeError('Final check failed or its expected summary is absent: ' + name)
    changed = [path for path, expected in protected.items() if sha(root / path) != expected]
    report['protectedFilesVerified'] = len(protected)
    report['changedProtectedFiles'] = changed
    if changed:
        raise RuntimeError('Verification modified protected source or asset metadata: ' + ', '.join(changed))
    report['passed'] = True
except Exception as error:
    report['failure'] = str(error)
finally:
    report['completedAt'] = now()
    save()
print(json.dumps({'passed': report['passed'], 'report': str(out), 'failure': report.get('failure')}))
raise SystemExit(0 if report['passed'] else 1)
