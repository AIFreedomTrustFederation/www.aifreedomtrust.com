#!/usr/bin/env python3
"""Source-aware, fail-closed fidelity checks for the canonical Living Universe.

Run: python3 scripts/check_living_universe_canonical.py
"""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
src = root / "source" / "src"
data_file = src / "data.js"
full = root / "living-universe-full.html"
errors = []
if not data_file.exists():
    errors.append("Missing original source/src/data.js")
else:
    data = data_file.read_text(encoding="utf-8")
    movement_ids = ("ground", "witness", "name", "differentiate",
                    "converge", "covenant", "return")
    roman = ("I", "II", "III", "IV", "V", "VI", "VII")
    for i, (movement, article) in enumerate(zip(movement_ids, roman), 1):
        block = re.search(
            r"movement\(\{\s*id:\s*['\"]" + movement +
            r"['\"].*?(?=\n\s*movement\(\{|\n\s*\}\);)",
            data, re.S)
        if not block:
            errors.append(f"Movement {i} {movement} missing")
            continue
        segment = block.group()
        if not re.search(r"\bart:\s*['\"]" + article + r"['\"]", segment):
            errors.append(f"Movement {movement} not paired with Article {article}")
        if not re.search(r"\bartTitle:\s*['\"]", segment):
            errors.append(f"Article {article} title missing")
        if not re.search(r"\bartBody:\s*\[", segment):
            errors.append(f"Article {article} body missing")
    if "const WORLDS" not in data or "function movement" not in data:
        errors.append("Canonical data architecture missing")
for name in ("index.tpl.html", "worlds.js", "tree.js", "engine.js",
             "app-core.js", "app-ui.js", "style.css"):
    if not (src / name).is_file():
        errors.append(f"Missing original module: {name}")
if not full.exists():
    errors.append("Full standalone HTML missing")
elif full.stat().st_size < 150000:
    errors.append("Full standalone HTML suspiciously reduced")
if errors:
    sys.exit("Canonical preservation FAILED:\n- " + "\n- ".join(errors))
print("PASS: seven Movements paired with seven Articles (14 canonical elements), all original modules and full HTML present")
