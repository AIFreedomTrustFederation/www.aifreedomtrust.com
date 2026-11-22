# Living Universe 3.0 — source-grounded audit and upgrade plan

## Verified baseline
- Static, self-contained page assembled from six JS modules, CSS, and an HTML template.
- Source build reproduced the uploaded top-level index.html byte for byte before edits.
- Existing features: cinematic canvas scene engine, Tree of Emergence, seven movements, six fruits/worlds, Journey / Explore / Reflect modes, Celestial Atlas, narration, discovery tracking, user-opt-in local persistence, reduced-motion and performance settings.
- Existing source includes links to the public AIFT site and PDF resources. Their current HTTP status has **not** been verified.

## Implemented in this package
- Keyboard focus containment in the Atlas and Comfort modal dialogs, including Shift+Tab wrapping.
- Focus return to Atlas launcher on Escape.
- Offline build, JavaScript syntax, and page-structure regression checks (`cd source && python3 -m unittest discover -s tests -v`).
- Rebuilt the standalone `index.html`.

## Findings and priorities
1. **P0 — Browser acceptance:** Validate keyboard-only navigation, mobile touch and pinch, focus trapping, screen-reader labels, reduced-motion, back/forward hash navigation, and visual correctness on real devices. Static checks are not browser acceptance.
2. **P0 — External links:** Audit and verify the public SITE and PDF links from `source/src/data.js`; add link health reporting, without silently changing doctrinal destinations.
3. **P1 — Rendering performance:** Benchmark frame times and battery use on lower-end Android; profile canvas work, scene transitions and node placement. Existing automatic quality adjustment is a good base.
4. **P1 — Visual world identity:** Introduce per-world atmospheric themes, layered parallax and cinematic transitions with still-motion equivalents. Keep a progressive enhancement path and no essential content hidden in canvas.
5. **P1 — Navigation:** Add an always-available mini-map/breadcrumb journey history, keyboard discoverability, and visible return paths between related worlds.
6. **P1 — Discovery experience:** Build an opt-in constellation journal, meaningful exploration paths, and optional completion tracking without spiritual scoring or competitive ranking.
7. **P2 — Content stewardship:** Add a structured content validation script for IDs, references, route targets and attribution; treat `data.js` as canonical for current site content.
8. **P2 — Release automation:** CI for reproducible build, JS syntax, HTML validation, link checking, accessibility browser tests, mobile screenshots and bundle size budget; gate deployment on successful tests and human review for doctrine/governance/trust-sensitive edits.

## Architecture recommendation
Keep the present zero-dependency, single-file offline-capable deployment as the reliable fallback. Modularize authoring and tests in `source/`, while generating one distributable page. Add advanced WebGL/3D only as an optional layer after profiling, not as a mandatory requirement. Preserve the Tree as a public-facing cosmology; repositories remain infrastructure roots, not public-facing coding jargon.

## Release evidence and limits
Build + Node syntax + three Python regression tests passed in this environment. No live browser, cross-device, network-link, security penetration or deployment validation was performed. No repository or hosted website was changed.
