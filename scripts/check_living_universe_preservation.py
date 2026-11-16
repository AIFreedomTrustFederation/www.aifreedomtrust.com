#!/usr/bin/env python3
"""Preservation gate for the original uploaded Living Universe experience.

Run after publishing the complete original standalone build as
living-universe-full.html. Fail closed on missing functionality.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
page = ROOT / "living-universe-full.html"
if not page.is_file():
    sys.exit("FAIL: living-universe-full.html missing. Do not substitute the simplified 3.0 prototype.")
text = page.read_text(encoding="utf-8")
required = {
    "Tree of Emergence": ["Tree of Emergence", "tree"],
    "Celestial Atlas": ["Celestial Atlas", 'id="atlas"'],
    "Guided journeys": ['id="journey"', "journey"],
    "Reflection": ['id="reflect"', "reflect"],
    "Narration": ["narrat", "speechSynthesis"],
    "Six worlds": ["worlds", "world"],
    "Discoveries": ["discover", "found"],
    "Export journey": ['id="btn-export"', "living-universe-journey.json"],
    "Motion preferences": ["prefers-reduced-motion", "reduced-motion"],
}
failures = []
if len(text.encode("utf-8")) < 150_000:
    failures.append("full experience unexpectedly small (<150 KB)")
for label, tokens in required.items():
    if not any(token.lower() in text.lower() for token in tokens):
        failures.append(label + " absent")
if failures:
    sys.exit("FAIL preservation gate:\n- " + "\n- ".join(failures))
print("PASS: full Living Universe structural preservation gate")
