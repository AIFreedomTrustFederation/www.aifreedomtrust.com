#!/usr/bin/env python3
"""Compare release modules against the user's untouched original ZIP.

Usage: python3 validation/verify-original-parity.py /path/to/living-universe.zip
"""
import hashlib, json, pathlib, sys, zipfile
root=pathlib.Path(__file__).resolve().parents[1]
if len(sys.argv)!=2: sys.exit('Usage: verify-original-parity.py ORIGINAL.zip')
original=pathlib.Path(sys.argv[1]); report={'original_zip_sha256':hashlib.sha256(original.read_bytes()).hexdigest(),'modules':{},'unchanged':[],'modified':[],'missing':[]}
with zipfile.ZipFile(original) as archive:
    for entry in archive.namelist():
        if not entry.startswith('living-universe/source/src/') or entry.endswith('/'):
            continue
        name=entry.rsplit('/',1)[-1]
        path=root/'source/src'/name
        if not path.is_file(): report['missing'].append(name); continue
        a=hashlib.sha256(archive.read(entry)).hexdigest(); b=hashlib.sha256(path.read_bytes()).hexdigest()
        report['modules'][name]={'original_sha256':a,'release_sha256':b,'unchanged':a==b}
        report['unchanged' if a==b else 'modified'].append(name)
print(json.dumps(report,indent=2))
if report['missing']: sys.exit('FAIL: missing original modules')
if 'data.js' in report['modified']: sys.exit('FAIL: canonical data modified')
