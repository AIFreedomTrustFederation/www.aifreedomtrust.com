# Living Universe preservation-first release candidate

This package preserves all original modules, seven Movement–Article pairs (14 elements), six fruit worlds, original text, Tree, Atlas, journeys, reflections, narration, accessibility and sound controls. It adds explicit private journey import alongside export. Import validates file size, format, version and known discovery IDs, and requires confirmation before replacing progress. Existing device-local storage remains opt-in.

Run `cd source && python3 build.py && python3 -m unittest discover -s tests -v` to verify the reproducible full HTML. Do not merge the existing draft PR until all files in this package are committed and the GitHub CI and browser acceptance run against its exact head.

This is a preservation-focused incremental enhancement, not a claim that every planned cinematic or browser milestone is finished. Actual browser/device testing and GitHub deployment have not been performed.

## Additional pre-merge gates
- `python3 validation/check-release-archive.py` verifies every manifest checksum and the complete original source modules.
- `node validation/browser-acceptance.mjs` uses Playwright to exercise desktop and Android-sized browsers, Atlas and preferences, and saves screenshots. Install Playwright and Chromium first. **This test is not claimed to have passed until executed in a working browser environment.**
- Neither the local release package nor PR #34 should be merged/deployed without successful exact-head CI and visual acceptance.
