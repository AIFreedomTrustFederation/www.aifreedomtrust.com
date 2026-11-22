#!/usr/bin/env python3
"""Check packaged files against manifest and ensure no missing source."""
from pathlib import Path
import hashlib, json, sys
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'release/manifest.json').read_text())
errors=[]
for rel,digest in manifest['files'].items():
    p=root/rel
    if not p.is_file(): errors.append(f'missing {rel}')
    elif hashlib.sha256(p.read_bytes()).hexdigest()!=digest: errors.append(f'checksum mismatch {rel}')
for name in ['source/src/data.js','source/src/tree.js','source/src/worlds.js','source/src/engine.js','source/src/app-core.js','source/src/app-ui.js','source/src/style.css','index.html']:
    if not (root/name).is_file(): errors.append(f'canonical file missing: {name}')
if errors: sys.exit('RELEASE FAIL:\n'+'\n'.join(errors))
print('PASS: manifest checksums and complete source')
