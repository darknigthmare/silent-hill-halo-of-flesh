"""Run the repository's existing gates once and retain their actual process results."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import subprocess
import time

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / 'validation'
OUT.mkdir(exist_ok=True)
RECEIPT = OUT / 'gates.json'
if RECEIPT.exists():
    raise SystemExit('Keep the existing evidence; do not silently overwrite a gate run.')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

baseline = json.loads((OUT.parent / 'scope-baseline.json').read_text())
paths = [item['path'] for item in baseline['protectedFiles']]
before = {path: sha(ROOT / path) for path in paths}
report = {
    'schema': 1, 'wave': 23, 'startedAt': now(), 'runnerSHA256': sha(Path(__file__)),
    'baseCommit': baseline['baseCommit'],
    'method': 'Existing npm test and Python unittest gates, without changing their tests or assertions. Browser availability is documented separately.',
    'browserTest': False, 'gates': [], 'protectedSourceHashesBefore': before,
    'passed': False,
}
commands = [
    ('node-project', ['npm', 'test']),
    ('python-art-importer', ['python', '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py', '-v']),
]
for name, command in commands:
    log = OUT / (name + '.txt')
    if log.exists():
        raise SystemExit('Existing process log: ' + str(log))
    started = now()
    clock = time.monotonic()
    print(json.dumps({'gate': name, 'command': command, 'startedAt': started}), flush=True)
    with log.open('wb') as stream:
        process = subprocess.run(command, cwd=ROOT, stdout=stream, stderr=subprocess.STDOUT, check=False)
    text = log.read_text(errors='replace')
    counts = {}
    if name == 'node-project':
        for field in ['tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo']:
            found = re.findall(r'^(?:#|ℹ) ' + field + r' (\d+)$', text, re.MULTILINE)
            if found:
                counts[field] = int(found[-1])
    else:
        found = re.findall(r'^Ran (\d+) tests? in ', text, re.MULTILINE)
        if found:
            counts['tests'] = int(found[-1])
    item = {
        'name': name, 'command': command, 'startedAt': started, 'finishedAt': now(),
        'durationSeconds': round(time.monotonic() - clock, 3), 'exitCode': process.returncode,
        'passed': process.returncode == 0, 'log': log.name, 'logSHA256': sha(log),
        'counts': counts,
    }
    report['gates'].append(item)
    RECEIPT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(item), flush=True)
    if process.returncode != 0:
        print('\n'.join(text.splitlines()[-70:]), flush=True)
        break

after = {path: sha(ROOT / path) for path in paths}
report['protectedSourceHashesAfter'] = after
report['protectedSourcesUnchanged'] = before == after
report['finishedAt'] = now()
report['passed'] = len(report['gates']) == len(commands) and all(g['passed'] for g in report['gates']) and before == after
RECEIPT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'passed': report['passed'], 'receipt': str(RECEIPT), 'protectedSourcesUnchanged': before == after}), flush=True)
raise SystemExit(0 if report['passed'] else 1)
