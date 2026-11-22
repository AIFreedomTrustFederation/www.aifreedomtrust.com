# AIFT Portal Product Boundary — White Paper Atlas and Public Living Universe

**Status:** Proposed architectural contract. Documentation only, not a deployed route, a live data feed, or authorization to switch the public domain.  
**Scope:** This website's existing source-backed interactive documentation is to mature into the **AIFT White Paper Portal**. It is **not** the finished public-facing Living Universe experience.

## Two connected, distinct products

| | White Paper Portal / Knowledge Atlas | Public Living Universe |
|---|---|---|
| Primary purpose | Explain, organize, trace and visualize **all covered Federation documentation** | Invite visitors to **experience** the interconnected worlds, meanings, discoveries and creative possibilities |
| Primary audience | Researchers, collaborators, readers, engineers, reviewers, auditors | General visitors, learners, explorers, participants |
| First-screen experience | Searchable documentation atlas, reading paths, map of sources and relationships | Cinematic, spatial, beautiful interactive universe with an explorable Tree and worlds |
| Content language | Exact titles, citations, context, source dates, evidence levels, methods, limitations | Welcoming natural language; no repo, CI, code, workflow, build, deployment or diagnostic language in the public experience |
| Navigation | Domain → collection → document → chapter → concept → source/claim → relationship | Universe → Tree → movement → branch → fruit → world → constellation → discovery |
| Evidence | Every visual element points to an actual document, source path and revision | Optional “Sources and further reading” links into the White Paper Portal; experiences do not imply claims without evidence |
| Release | Separate review and acceptance; do not silently replace current live route | Separate UXI/asset/browser/accessibility acceptance and explicit deployment decision |

Both experiences must remain keyboard- and screen-reader accessible, respect reduced motion and low bandwidth, and support native page pinch as well as bounded camera gestures inside explicitly interactive spatial scenes.

## The documentation completeness contract

“Visualize all the documentation” cannot mean a hard-coded selection of attractive diagrams. Implement an inspectable **coverage ledger** that enumerates actual, allowlisted source documents for each participating Federation repository and any approved canonical reading editions.

For each source, retain at minimum:
- repository/collection and canonical source URL, relative path, source type and exact commit SHA or published edition;
- document title, headings, anchor IDs, publication/review status and last verified retrieval;
- content category such as doctrine, philosophical, scientific, historical, symbolic, speculative, architectural, engineering, governance, or aspirational, without treating these categories as interchangeable;
- published outbound source references, cross-document references and relationships with clear evidence/provenance type;
- retrieval or parse failures, inaccessible attachments, coverage gaps, stale records, unresolved conflicts and unknown claims;
- any necessary human review of sensitive public claims, identity, security, governance or doctrine.

The generator must output reproducible **source-bound manifests** and a deterministic coverage report: number discovered, successfully indexed, excluded with stated reason, unverified and missing. Do not silently claim 100% completeness when a repository or source cannot be read. Do not derive publication authority from repository access alone. Never expose keys, secrets, private workspaces or unpublished personal data.

## Visualizations driven by those manifests

1. **Federation knowledge map:** all covered repositories/collections and documents as navigable sources with typed edges and visible gaps. A repository is never represented as a completed experience merely because it exists.
2. **Interactive Tree of Emergence:** Roots, Trunk, Branches, Leaves, Flowers, Fruits and Seeds as their documented concepts support; each selectable object reveals its defining source passages and lineage.
3. **Movement/world atlas:** expose **all 14 canonical worlds or movements** only after their names, ordering and correspondences are verified against authoritative documents; seven-color interpretations must not silently erase or fabricate the remaining seven.
4. **White Paper reading room:** searchable full-text chapters, contents, annotations, figures, citations, diagrams, version differences and exportable document references.
5. **Cross-reference constellation:** interactive relations among doctrines, concepts, engineering designs, empirical claims, implementations, governance decisions and outcomes, with relationship types and degrees of support visible.
6. **Change and evidence timeline:** source revisions, historical milestones, decisions and validated results, with speculative roadmap elements visually distinguished from completed work.
7. **Accessibility-equivalent outline:** every graph, scene and map has a navigable text or table counterpart; nonvisual users can traverse identical citations.

All maps and cinematic renderings must have trustworthy source links and distinguish **documented, inferred, proposed, contested, outdated and missing**. Display an explanatory legend rather than disguising uncertainty as data.

## Gesture and zoom contract

- Page/text/menu surfaces: let the browser handle two-finger pinch zoom and ordinary scrolling. Do not set `user-scalable=no` or `maximum-scale=1`.
- Dedicated spatial scenes: two fingers zoom toward the live midpoint; one finger pans or orbits as documented; pinch-in returns to the full fit.
- Zoom level is bounded; scene position remains stable; no accidental document selection or navigation during a gesture.
- Provide plus/minus/reset, focus-visible and keyboard alternatives; test at mobile, tablet, desktop and with browser magnification.
- A single gesture owner per visual surface; avoid overlapping pointer controllers.

## Public experience separation

The **public Living Universe** should not look or sound like a documentation index, technical dashboard or engineering manual. Its cinematic modes, environmental effects, worlds, movements and experiential storytelling form a distinct product. Its visual discoveries may reveal an unobtrusive, optional link to a verified White Paper source, without replacing the public experience with a repository page.

**Do not immediately change DNS, current homepage, domain bindings, canonical links or source-of-truth ownership.** Choose and verify the eventual paths/domains during migration planning, retain working deep links, and only promote the new public experience after it passes independent browser, accessibility, security and release gates.

## Delivery sequence and acceptance

**P0 — Inventory.** Produce a machine-readable, version-pinned catalog across explicitly included Federation sources. Verify which documents are public and approved for indexing; surface gaps and retrieval failures.

**P1 — Deterministic knowledge graph.** Build source-backed nodes, typed edges, headings, citations, version fingerprints and relationship integrity tests; record exact-head CI evidence.

**P2 — White Paper visualization.** Build the atlas, reading room, Tree, movement map, constellation, timelines and equivalent accessible outlines from the catalog. Do not embed guessed content.

**P3 — Distinct public cinematic vertical slice.** Build the immersive entry experience and one complete source-linked world without exposing technical operations language to visitors. Test touch gestures, mobile performance, reduced motion, keyboard parity and real browser screenshots.

**P4 — Migration and release.** Decide separate product routes, navigation, source handoffs, redirects and rollback. Require explicit production release approval and external HTTPS verification.

Acceptance is not merely “the page loads.” Document coverage and gaps must be inspectable, figures must be evidence-bound, the 14 canonical movement/world records must be source-verified, browser pinch must work throughout the appropriate surfaces, both products must retain full accessible navigation, and the public experience must be judged as an interactive world rather than a documentation directory.

## Non-goals of this document

This document does **not** claim the entire Federation archive is already indexed, that all 14 canonical entries are verified, that a new public portal is deployed, or that the existing source-backed atlas is the completed cinematic public product. It authorizes no merge, deployment, route switch, secret use or governance changes.
