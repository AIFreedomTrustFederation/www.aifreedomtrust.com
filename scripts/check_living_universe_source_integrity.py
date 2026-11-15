#!/usr/bin/env python3
"""Fail closed if the canonical original data changes without explicit review."""
from pathlib import Path
import hashlib
import sys

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "source/src/data.js": "2f3a0ac8dd112f2742bf2f53d6705754307e9e8620faecf9031becf55410f8d8",
}
failures = []
for relative, expected in EXPECTED.items():
    path = ROOT / relative
    if not path.is_file():
        failures.append(f"missing: {relative}")
        continue
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != expected:
        failures.append(f"canonical content changed: {relative}; expected {expected}, got {actual}")
if failures:
    sys.exit("Canonical source integrity FAILED:\n- " + "\n- ".join(failures))
print("PASS: original canonical data.js is byte-for-byte preserved")
