"""Run the repository's full QA and importer suite; preserve exact logs and state."""
from pathlib import Path
from datetime import datetime, timezone
import argparse
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
assert not out.exists(), 'Use a fresh receipt path; preserve previous results.'
out.parent.mkdir(parents=True, exist_ok=True)

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def now():
    return datetime.now(timezone.utc).isoformat()

def tracked_diff():
    return subprocess.check_output(['git', 'diff', '--binary', 'HEAD'], cwd=root)

baseline = json.loads((root / 'docs/production/vague26/scope-baseline.json').read_text())
protected = {row['path']: row['sha256'] for row in baseline['protectedFiles']}
assert all(sha((root / path).read_bytes()) == digest for path, digest in protected.items())
for path in ['art/registry.json', 'src/sprite-manifest.js', 'src/stage-bitmap-manifest.js',
             'service-worker.js', 'data/sprite-coverage.json', 'tests/stage-bitmaps.test.mjs']:
    protected[path] = sha((root / path).read_bytes())
before_diff = sha(tracked_diff())
commands = [('repository-full-qa', ['npm', 'test'], '.npm-test.log'),
            ('raster-importer-suite', ['python', '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py', '-v'], '.python-tests.log')]
report = {'schema': 1, 'wave': 26, 'startedAt': now(), 'passed': False,
          'scope': 'The exact repository npm test command, including both builds, then all Python importer tests.',
          'commands': [], 'protectedBefore': protected, 'trackedDiffBeforeSHA256': before_diff}

def save():
    out.write_text(json.dumps(report, indent=2) + '\n')

try:
    for name, command, suffix in commands:
        log = out.with_name(out.stem + suffix)
        assert not log.exists(), 'Do not overwrite a retained log.'
        started = time.monotonic()
        with log.open('x') as stream:
            process = subprocess.run(command, cwd=root, stdout=stream, stderr=subprocess.STDOUT, check=False)
        text = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', log.read_text())
        row = {'name': name, 'command': command, 'exitCode': process.returncode,
               'durationSeconds': round(time.monotonic() - started, 3),
               'log': str(log.relative_to(root)), 'logSHA256': sha(log.read_bytes()),
               'bytes': log.stat().st_size, 'passed': process.returncode == 0}
        if name == 'repository-full-qa':
            counts = {}
            for key in ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']:
                matches = re.findall(r'^(?:#|ℹ) ' + key + r' (\d+)\s*$', text, re.M)
                counts[key] = int(matches[-1]) if matches else None
            row['nodeTests'] = counts
            row['passed'] = row['passed'] and all(v is not None for v in counts.values())
            if row['passed']:
                row['passed'] = counts['tests'] > 0 and counts['tests'] == counts['pass'] and all(counts[k] == 0 for k in ['fail', 'cancelled', 'skipped', 'todo'])
        else:
            matches = re.findall(r'^Ran (\d+) tests? in ', text, re.M)
            row['pythonTests'] = int(matches[-1]) if matches else None
            row['passed'] = row['passed'] and bool(row['pythonTests']) and bool(re.search(r'^OK\s*$', text, re.M))
        report['commands'].append(row)
        save()
        print(json.dumps(row), flush=True)
        if not row['passed']:
            raise RuntimeError('QA failed or its complete summary is absent: ' + name)
    changed = [path for path, digest in protected.items() if sha((root / path).read_bytes()) != digest]
    after_diff = sha(tracked_diff())
    report.update(protectedFilesVerified=len(protected), changedProtectedFiles=changed,
                  trackedDiffAfterSHA256=after_diff, trackedTreeUnchangedByQA=before_diff == after_diff)
    if changed or before_diff != after_diff:
        raise RuntimeError('QA regenerated tracked files; inspect and reconcile the exact diff before publication.')
    report['passed'] = True
except Exception as error:
    report['failure'] = str(error)
finally:
    report['completedAt'] = now()
    save()
print(json.dumps({'passed': report['passed'], 'out': str(out), 'failure': report.get('failure')}))
raise SystemExit(0 if report['passed'] else 1)
