"""Read immutable blobs from a frozen publication plan, without touching worktree files."""
from pathlib import Path
import base64
import hashlib
import json
import subprocess
import sys

plan = json.loads(Path(sys.argv[1]).read_text())
mode, index = sys.argv[2], int(sys.argv[3])

def raw(row):
    data = subprocess.check_output(['git', 'cat-file', 'blob', row['sha']], cwd=plan['root'])
    assert len(data) == row['bytes'] and hashlib.sha256(data).hexdigest() == row['sha256']
    return data

if mode == 'chunk':
    row = plan['files'][index]
    start, count = int(sys.argv[4]), int(sys.argv[5])
    assert start >= 0 and count > 0
    print(base64.b64encode(raw(row)[start:start + count]).decode())
elif mode == 'batch':
    batch = plan['batches'][index]
    elements = []
    for i in batch['fileIndices']:
        row = plan['files'][i]
        element = {key: row[key] for key in ['path', 'mode', 'type']}
        if row['inlineText'] and not row['alreadyInBase']:
            element['content'] = raw(row).decode('utf-8')
        else:
            element['sha'] = row['sha']
        elements.append(element)
    print(json.dumps({'batch': batch, 'elements': elements}, ensure_ascii=False))
else:
    raise ValueError('Unknown read mode.')
