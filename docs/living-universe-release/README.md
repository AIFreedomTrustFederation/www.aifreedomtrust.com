# Living Universe — complete preserved source release

**The source is authoritative.** Edit files under `source/src`, then run `python3 source/build.py` and copy `source/dist/index.html` to `index.html`. Do not hand-edit the generated HTML.

The package contains the original seven Movements, seven paired Articles (14 linked elements), six additional fruit worlds, the Tree, Atlas, journeys, narration, reflection, and progress. Existing styling and source code are preserved. Import/export are additive.

Run `python3 validation/release-checks.py` from the archive root to verify canonical content, syntax, build reproducibility and tests (requires Python 3 and Node.js). The original source data hash is pinned in `validation/original-data.sha256`. A deliberate canonical content revision must be reviewed and the baseline explicitly reapproved.

This is a local release candidate, **not a deployed site or merged GitHub PR**. Visual and interactive browser acceptance on Android/desktop and exact-head GitHub CI are still required. See RELEASE_NOTES.md and CHANGELOG.md.
