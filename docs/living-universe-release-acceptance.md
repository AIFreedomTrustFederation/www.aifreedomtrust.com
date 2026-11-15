# Living Universe PR #34: required release acceptance

This PR is a **draft**, not a release candidate. Do not merge or deploy until every gate passes at the exact PR head.

## Source and content
- Commit the complete original modular source and generated standalone `living-universe-full.html`.
- Preserve all seven Article–Movement pairings (14 elements), six fruit worlds, canonical text, Tree, Atlas, journeys, narration, reflection, discoveries, and controls.
- Compare the original uploaded `data.js` SHA-256 against the new source and explicitly review any change.
- Run `python3 scripts/check_living_universe_canonical.py` and `python3 scripts/check_living_universe_preservation.py`.
- Rebuild from the committed modules; generated HTML must match the committed standalone page byte for byte.

## Interactive browser acceptance
- Use Playwright or equivalent on desktop and Android-sized viewports.
- Exercise the Tree, Atlas open/close, world navigation, journeys, preferences, import/export, keyboard focus, reduced motion and narration.
- Save actual screenshots for visual comparison with the uploaded original. No synthetic screenshots.
- Fail on missing controls, uncaught JavaScript errors, broken links, or lost original content.

## Release
- Produce a manifest with SHA-256 checksums for every packaged file.
- Verify the archive from scratch.
- Require passing GitHub Actions at the **exact final head SHA** and documented review of the visual differences.
- Keep the public entrypoint unchanged until all checks pass.

The local acceptance kit contains `validation/browser-acceptance.mjs` and `validation/check-release-archive.py`, but **these files and the full website have not yet been transferred to this branch**. This checklist is not evidence of completion.
