#!/usr/bin/env python3
import hashlib, pathlib, subprocess, sys, re
root=pathlib.Path(__file__).resolve().parents[1]
src=root/'source'
subprocess.run([sys.executable, str(src/'build.py')], check=True)
assert (src/'dist/index.html').read_bytes()==(root/'index.html').read_bytes(), 'Generated HTML differs from root index.html'
for file in (src/'src').glob('*.js'):
    subprocess.run(['node','--check',str(file)],check=True)
subprocess.run([sys.executable,'-m','unittest','discover','-s',str(src/'tests'),'-v'],check=True,cwd=src)
expected=(root/'validation/original-data.sha256').read_text().split()[0]
actual=hashlib.sha256((src/'src/data.js').read_bytes()).hexdigest()
assert actual==expected, 'Original canonical source changed; requires explicit content review'
text=(root/'index.html').read_text()
for term in ('Celestial Atlas','btn-import','btn-export','id="journey"','id="reflect"','prefers-reduced-motion'):
    assert term in text, f'Missing required feature: {term}'
assert len(text.encode())>150000, 'Unexpectedly reduced page'
print('PASS: deterministic HTML, JS syntax, original canonical data, feature markers and source tests')
