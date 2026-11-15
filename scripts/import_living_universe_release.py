#!/usr/bin/env python3
"""Import the complete, checksum-pinned Living Universe release into a checkout.

Usage: python3 scripts/import_living_universe_release.py ARCHIVE.zip
Never extracts untrusted archive paths directly into the checkout.
"""
import hashlib
import pathlib
import shutil
import subprocess
import sys
import tempfile
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
EXPECTED_ZIP_SHA256 = "0ab68d61aad432d1389ebe5abc878f6f0e635cb9a6cd277daf60e9ab477f9856"
EXPECTED_DATA_SHA256 = "2f3a0ac8dd112f2742bf2f53d6705754307e9e8620faecf9031becf55410f8d8"
MAX_UNCOMPRESSED = 12_000_000
MODULES = ("data.js", "app-core.js", "app-ui.js", "engine.js", "index.tpl.html", "style.css", "tree.js", "worlds.js")

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: import_living_universe_release.py ARCHIVE.zip")
    archive = pathlib.Path(sys.argv[1]).resolve()
    if digest(archive) != EXPECTED_ZIP_SHA256:
        sys.exit("Archive SHA-256 mismatch: refusing unverified source")
    with tempfile.TemporaryDirectory() as temporary:
        staging = pathlib.Path(temporary)
        with zipfile.ZipFile(archive) as zf:
            entries = zf.infolist()
            if len(entries) > 250 or sum(x.file_size for x in entries) > MAX_UNCOMPRESSED:
                sys.exit("Archive exceeds safety limits")
            for entry in entries:
                name = pathlib.PurePosixPath(entry.filename)
                if (name.is_absolute() or ".." in name.parts or
                    not name.parts or name.parts[0] != "living-universe" or
                    ((entry.external_attr >> 16) & 0o170000) == 0o120000):
                    sys.exit(f"Unsafe archive member: {entry.filename}")
                if entry.is_dir():
                    continue
                target = staging.joinpath(*name.parts)
                target.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(entry) as source, target.open("wb") as dest:
                    shutil.copyfileobj(source, dest)
        project = staging / "living-universe"
        data = project / "source/src/data.js"
        if not data.is_file() or digest(data) != EXPECTED_DATA_SHA256:
            sys.exit("Canonical data.js mismatch")
        for name in MODULES:
            if not (project / "source/src" / name).is_file():
                sys.exit(f"Missing module: {name}")
        html = project / "index.html"
        if not html.is_file() or html.stat().st_size < 150_000:
            sys.exit("Complete standalone HTML missing or truncated")
        # Validate the release *before* modifying the repository.
        subprocess.run([sys.executable, str(project / "validation/release-checks.py")], check=True, cwd=project)
        subprocess.run([sys.executable, str(project / "validation/check-release-archive.py")], check=True, cwd=project)
        # Copy only project-owned paths; never overwrite the portal's root README or entry point.
        paths = {
            "index.html": "living-universe-full.html",
            "source": "source",
            "validation": "validation/living-universe",
            "release": "release/living-universe",
        }
        for source_rel, target_rel in paths.items():
            source = project / source_rel
            destination = ROOT / target_rel
            if source.is_dir():
                if destination.exists():
                    shutil.rmtree(destination)
                shutil.copytree(source, destination)
            else:
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)
        # Adapt the original test fixture path to the non-destructive portal layout.
        # The public root index.html must remain untouched.
        test_file = ROOT / "source/tests/test_build.py"
        if test_file.is_file():
            test_text = test_file.read_text(encoding="utf-8")
            old = "ROOT.parent / 'index.html'"
            if old not in test_text:
                sys.exit("Unexpected original test layout; refusing silent rewrite")
            test_file.write_text(test_text.replace(old, "ROOT.parent / 'living-universe-full.html'"), encoding="utf-8")
        for name in ("README.md", "CHANGELOG.md", "ENHANCEMENTS.md", "RELEASE_NOTES.md", "UPGRADE_PLAN.md"):
            source = project / name
            if source.exists():
                destination = ROOT / "docs/living-universe-release" / name
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)
    # Verify the committed-source layout with the existing preservation gates.
    for script in ("check_living_universe_canonical.py", "check_living_universe_preservation.py",
                   "check_living_universe_source_integrity.py"):
        subprocess.run([sys.executable, str(ROOT / "scripts" / script)], check=True, cwd=ROOT)
    subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", "source/tests", "-v"], check=True, cwd=ROOT)
    subprocess.run([sys.executable, "source/build.py"], check=True, cwd=ROOT)
    if (ROOT / "source/dist/index.html").read_bytes() != (ROOT / "living-universe-full.html").read_bytes():
        sys.exit("Rebuilt HTML differs from canonical standalone page")
    print("PASS: verified complete source imported and validated; no public entrypoint replaced")

if __name__ == "__main__":
    main()
