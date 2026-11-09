# Living Universe cross-surface acceptance milestone

This is an implementation checkpoint, **not** a production or independent evidence attestation. The public portal is the curated producer of `aift.lineage.interchange/1`; MoBox is a separate, read-only local consumer. Both merged baselines must be exercised together before interoperability is claimed.

## Reproducible acceptance gate

Run `node --test tests/lineage-cross-surface.test.mjs` from the portal root. The test uses real exported module functions and the MoBox local observation adapter, with explicitly **synthetic** fixtures. It proves portable packet serialization, root-to-capability-to-outcome reachability, malformed-edge rejection, and that local observations cannot manufacture source-backed edges or certified fruits. It does **not** execute the Go MoBox importer, browser UI, Android TalkBack, or external URLs.

## Epic implementation order

1. **Contract and safety:** retain this regression gate and add a fixture produced by the actual published source manifest, then run it through the AIFT-OS importer on an exact pinned SHA. No trust elevation, network fetch, telemetry or mutation.
2. **Shared scene:** use identical six biological stages and semantic design tokens across the public Tree and MoBox Atlas; repositories remain roots, source-backed capabilities are leaves, and fruits require independently validated user-facing destinations.
3. **Evidence gameplay:** connect route exploration, quest coverage and readiness to actual CI/evidence records. Imported claims remain candidates; never invent achievements or XP.
4. **Visual and accessibility acceptance:** capture baseline/after screenshots at 360px, 768px and desktop, verify keyboard/zoom/focus, reduced motion, readable labels and TalkBack. Preserve all existing page prose and links.

## Current limitations and rollback

The acceptance fixture is synthetic; no real portal-to-Go import has been established. The adapter projects local observations without contribution edges by design. The next dependent PR should target AIFT-OS after this portal gate is reviewed. Rollback consists of reverting this isolated test/documentation PR; no runtime or publishing surface is changed. No merge or deployment is authorized by this milestone.
