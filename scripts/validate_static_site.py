#!/usr/bin/env python3
"""Validate required portal files and local HTML link targets."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
HTML_FILES = ("index.html", "pages.html")
REQUIRED_FILES = (
    "index.html",
    "pages.html",
    "styles.css",
    "assets/aift-federation-hero.png",
    "docs/public-repo-inventory.md",
    "docs/status.md",
    "docs/security-and-privacy.md",
)


class LocalReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.references.append((tag, value))


def local_target(source: Path, reference: str) -> Path | None:
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return None

    relative = Path(unquote(parsed.path.lstrip("/")))
    target = (ROOT / relative if parsed.path.startswith("/") else source.parent / relative).resolve()
    try:
        target.relative_to(ROOT)
    except ValueError as error:
        raise ValueError(f"path escapes repository: {reference}") from error
    return target


def main() -> int:
    failures: list[str] = []

    for relative in REQUIRED_FILES:
        if not (ROOT / relative).is_file():
            failures.append(f"required file missing: {relative}")

    for relative in HTML_FILES:
        source = ROOT / relative
        if not source.is_file():
            continue

        parser = LocalReferenceParser()
        parser.feed(source.read_text(encoding="utf-8"))
        for tag, reference in parser.references:
            try:
                target = local_target(source, reference)
            except ValueError as error:
                failures.append(f"{relative}: {tag} {error}")
                continue
            if target is not None and not target.exists():
                failures.append(f"{relative}: missing local target for {tag}: {reference}")

    if failures:
        for failure in failures:
            print(f"ERROR {failure}")
        print(f"Static portal validation failed with {len(failures)} issue(s).")
        return 1

    print(f"Static portal validation passed for {len(HTML_FILES)} HTML files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
