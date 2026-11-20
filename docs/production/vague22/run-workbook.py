"""Build and reopen the companion workbook with the existing artifact-tool recipe."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]
BASE = Path(__file__).resolve().parent
OUT = BASE / 'workbook'
OUT.mkdir(exist_ok=True)
RECEIPT = OUT / 'execution.json'
if RECEIPT.exists():
    raise SystemExit('Preserve the previous execution receipt.')
NODE = Path(os.environ.get('CODEX_PRIMARY_RUNTIME_NODE', '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node'))
MODULES = Path(os.environ.get('CODEX_PRIMARY_RUNTIME_NODE_MODULES', '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules'))
assert NODE.exists() and (MODULES / '@oai/artifact-tool').exists()
TEMP = Path(tempfile.mkdtemp(prefix='halo-wave22-workbook-'))
(TEMP / 'node_modules').symlink_to(MODULES, target_is_directory=True)
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()
report = {'schema': 1, 'wave': 22, 'startedAt': now(), 'runnerSHA256': sha(Path(__file__)), 'node': str(NODE), 'modules': str(MODULES), 'temporaryExecutionDirectory': str(TEMP), 'scripts': [], 'processes': [], 'passed': False}
for name in ['prepare-corpus-input.mjs', 'build-corpus-deliverables.mjs', 'render-corpus-workbook.mjs']:
    shutil.copyfile(BASE / name, TEMP / name)
    assert sha(BASE / name) == sha(TEMP / name)
    report['scripts'].append({'name': name, 'sha256': sha(BASE / name), 'copyExact': True})
def run(name, script, arguments):
    command = [str(NODE), '--expose-gc', '--max-old-space-size=128', '--max-semi-space-size=1', str(TEMP / script), *arguments]
    log = OUT / (name + '.txt')
    assert not log.exists()
    start = now()
    print(json.dumps({'step': name, 'startedAt': start}), flush=True)
    with log.open('wb') as stream:
        result = subprocess.run(command, cwd=TEMP, stdout=stream, stderr=subprocess.STDOUT, check=False)
    record = {'name': name, 'command': command, 'startedAt': start, 'finishedAt': now(), 'exitCode': result.returncode, 'log': log.name, 'logSHA256': sha(log)}
    report['processes'].append(record)
    RECEIPT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(record), flush=True)
    if result.returncode:
        print(log.read_text(errors='replace')[-10000:], flush=True)
        raise SystemExit(result.returncode)
run('prepare', 'prepare-corpus-input.mjs', ['--root=' + str(ROOT), '--output=' + str(OUT / 'prepared-input.json')])
run('build', 'build-corpus-deliverables.mjs', ['--root=' + str(ROOT), '--input=' + str(OUT / 'prepared-input.json'), '--output=' + str(OUT)])
run('render-corpus', 'render-corpus-workbook.mjs', ['--output=' + str(OUT), '--sheet=Corpus', '--range=A1:H13'])
run('render-stages', 'render-corpus-workbook.mjs', ['--output=' + str(OUT), '--sheet=Stages', '--range=A1:H13'])
rows = json.loads((OUT / 'prepared-input.json').read_text())['stageRows']
row = 9 + next(i for i, item in enumerate(rows) if item['id'] == 'nightmare_hospital_sm')
end = min(8 + len(rows), row + 1)
run('render-new-stage', 'render-corpus-workbook.mjs', ['--output=' + str(OUT), '--sheet=Stages', '--range=A' + str(row - 1) + ':H' + str(end), '--region=wave22-new-stage'])
report['passed'] = True
report['finishedAt'] = now()
report['visualReview'] = 'pending-human-inspection-of-export-previews'
RECEIPT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'passed': True, 'visualReview': report['visualReview'], 'receipt': str(RECEIPT)}), flush=True)
