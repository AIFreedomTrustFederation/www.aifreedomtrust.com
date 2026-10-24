#!/usr/bin/env python3
"""Validate required portal files and local HTML link targets."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
HTML_FILES = (
    "index.html",
    "pages.html",
    "atlas.html",
    "constellations.html",
    "docs/organization-map.html",
)
REMOTE_RESOURCE_TAGS = {"iframe", "img", "link", "script", "source"}
ALLOWED_URL_SCHEMES = {"http", "https", "mailto", "tel"}
REQUIRED_FILES = (
    *HTML_FILES,
    "styles.css",
    "assets/aift-federation-hero.png",
    "docs/public-repo-inventory.md",
    "docs/status.md",
    "docs/security-and-privacy.md",
)

def responsive_image_urls(value: str):
    """Yield URLs from an HTML srcset/imagesrcset attribute.

    A candidate URL extends to whitespace, not to the first comma: data
    URLs and filenames may themselves contain commas. Commas separating
    candidates are consumed with the descriptors, as in the HTML algorithm.
    """
    position = 0
    while position < len(value):
        while position < len(value) and (value[position].isspace() or value[position] == ","):
            position += 1
        start = position
        while position < len(value) and not value[position].isspace():
            position += 1
        url = value[start:position]
        if not url:
            break
        if url.endswith(","):
            url = url.rstrip(",")
            if url:
                yield url
            continue
        yield url

        # Consume density/width descriptors, respecting parentheses.
        in_parentheses = False
        while position < len(value):
            char = value[position]
            position += 1
            if char == "(":
                in_parentheses = True
            elif char == ")":
                in_parentheses = False
            elif char == "," and not in_parentheses:
                break


class LocalReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str]] = []
        self.ids: set[str] = set()
        self.duplicate_ids: set[str] = set()
        self.forbidden_elements: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        element_id = dict(attrs).get("id")
        if element_id:
            if element_id in self.ids:
                self.duplicate_ids.add(element_id)
            self.ids.add(element_id)
        if tag == "form":
            self.forbidden_elements.append("form")
        # Canonical links describe page identity; they do not load remote resources.
        if tag == "link" and dict(attrs).get("rel") == "canonical":
            return
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.references.append((tag, value))
            elif value and (
                (name == "srcset" and tag in {"img", "source"})
                or (name == "imagesrcset" and tag == "link")
            ):
                self.references.extend((tag, url) for url in responsive_image_urls(value))


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
        for element_id in sorted(parser.duplicate_ids):
            failures.append(f"{relative}: duplicate fragment id: #{element_id}")
        for element in parser.forbidden_elements:
            failures.append(f"{relative}: forbidden data-capture element: {element}")
        for tag, reference in parser.references:
            parsed = urlsplit(reference)
            if parsed.scheme and parsed.scheme.lower() not in ALLOWED_URL_SCHEMES:
                failures.append(f"{relative}: unsafe URL scheme for {tag}: {reference}")
                continue
            if tag in REMOTE_RESOURCE_TAGS and (parsed.scheme or parsed.netloc):
                failures.append(f"{relative}: remote {tag} resource is not allowed: {reference}")
                continue
            try:
                target = local_target(source, reference)
            except ValueError as error:
                failures.append(f"{relative}: {tag} {error}")
                continue
            if target is not None and not target.exists():
                failures.append(f"{relative}: missing local target for {tag}: {reference}")
                continue
            if parsed.fragment and not parsed.scheme and not parsed.netloc:
                fragment = unquote(parsed.fragment)
                fragment_source = target if target is not None else source
                if fragment_source.suffix.lower() == ".html" and fragment_source.is_file():
                    if fragment_source == source:
                        destination_ids = parser.ids
                    else:
                        destination_parser = LocalReferenceParser()
                        destination_parser.feed(fragment_source.read_text(encoding="utf-8"))
                        destination_ids = destination_parser.ids
                    if fragment not in destination_ids:
                        failures.append(f"{relative}: broken fragment link: {reference}")

    if failures:
        for failure in failures:
            print(f"ERROR {failure}")
        print(f"Static portal validation failed with {len(failures)} issue(s).")
        return 1

    print(f"Static portal validation passed for {len(HTML_FILES)} HTML files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
