"""Freeze a Git tree delta for exact Git Data API publication; never read credentials."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess

p = argparse.ArgumentParser()
p.add_argument('--root', required=True)
p.add_argument('--base', required=True)
p.add_argument('--head', default='HEAD')
p.add_argument('--out', required=True)
a = p.parse_args()
root, out = Path(a.root).resolve(), Path(a.out).resolve()
out.mkdir(parents=True, exist_ok=True)
target = out / 'plan.json'
assert not target.exists(), 'Preserve existing frozen publication plan.'

def git(*args):
    return subprocess.check_output(['git', *args], cwd=root)

def entries(ref):
    result = {}
    for row in git('ls-tree', '-r', '-z', ref).split(b'\0'):
        if row:
            info, path = row.split(b'\t', 1)
            mode, kind, sha = info.decode().split()
            result[path.decode()] = {'mode': mode, 'type': kind, 'sha': sha}
    return result

def tree_hash(rows):
    tree = {}
    for path, entry in rows.items():
        node = tree
        parts = path.split('/')
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = (entry['mode'], entry['sha'])
    def digest(node):
        records = []
        for name, value in node.items():
            directory = isinstance(value, dict)
            mode, sha = ('40000', digest(value)) if directory else value
            records.append((name.encode() + (b'/' if directory else b''),
                mode.encode() + b' ' + name.encode() + b'\0' + bytes.fromhex(sha)))
        data = b''.join(record for _, record in sorted(records))
        return hashlib.sha1(b'tree ' + str(len(data)).encode() + b'\0' + data).hexdigest()
    return digest(tree)

base = git('rev-parse', a.base).decode().strip()
head = git('rev-parse', a.head).decode().strip()
base_tree = git('rev-parse', a.base + '^{tree}').decode().strip()
head_tree = git('rev-parse', a.head + '^{tree}').decode().strip()
old, new = entries(base_tree), entries(head_tree)
assert tree_hash(old) == base_tree and tree_hash(new) == head_tree
known = {row['sha'] for row in old.values()}
files = []
for path in sorted(old.keys() | new.keys()):
    if old.get(path) == new.get(path):
        continue
    assert path in new, 'Deletion requires separate explicit handling.'
    row = new[path]
    assert row['type'] == 'blob'
    data = git('cat-file', 'blob', row['sha'])
    assert hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == row['sha']
    try:
        text = data.decode('utf-8')
        assert '\0' not in text
        text.encode('utf-8') == data
        inline = len(data) < 500000
    except (UnicodeDecodeError, AssertionError):
        inline = False
    files.append({'path': path, **row, 'bytes': len(data),
        'sha256': hashlib.sha256(data).hexdigest(), 'inlineText': inline,
        'alreadyInBase': row['sha'] in known})
state, current, batches = dict(old), base_tree, []
for start in range(0, len(files), 24):
    group = files[start:start + 24]
    for row in group:
        state[row['path']] = {key: row[key] for key in ['mode', 'type', 'sha']}
    expected = tree_hash(state)
    batches.append({'index': len(batches), 'baseTree': current,
        'expectedTree': expected, 'fileIndices': list(range(start, start + len(group)))})
    current = expected
assert current == head_tree
plan = {'schema': 1, 'repository': 'darknigthmare/silent-hill-halo-of-flesh',
    'root': str(root), 'baseCommit': base, 'localCommit': head,
    'baseTree': base_tree, 'tree': head_tree, 'files': files, 'batches': batches,
    'filesCount': len(files), 'bytes': sum(row['bytes'] for row in files)}
target.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'plan': str(target), 'files': len(files), 'bytes': plan['bytes'],
    'binaryUploads': sum(not f['inlineText'] and not f['alreadyInBase'] for f in files),
    'batches': len(batches), 'tree': head_tree}))
