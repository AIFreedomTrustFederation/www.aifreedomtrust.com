# Public Portal Status

This is the canonical status record for `www.aifreedomtrust.com`. It separates the public website's implemented behavior from federation roadmap and project claims.

## Current implementation status

| Area | Status | Evidence |
| --- | --- | --- |
| Repository role | Active public portal | README, AGENTS, static site, and docs exist. |
| Deployment model | GitHub Pages static site | README lists GitHub Pages deployment from `main` root. |
| Build step | None required | Site is plain `index.html`, `styles.css`, and assets. |
| Public project inventory | Active | `docs/public-repo-inventory.md` lists visible public repos. |
| Public maturity labels | Active | Site separates empirical, production-facing revenue-unverified, and doctrinal/conceptual claims. |
| Custom domain | Not configured in repo | No `CNAME` file is present. |
| Production claims | Limited | Public claims must defer to canonical repo evidence. |
| Security audit | Not audited | No formal security audit is claimed. |

## Current verification evidence

Last local stewardship update: 2026-06-20.

Checks appropriate for this static portal:

- `git diff --check`
- `python -m unittest discover -s tests -v` and `python scripts/validate_static_site.py` for local HTML targets, fragments, unsafe URL schemes, and prohibited remote HTML resources across the five published HTML pages
- local HTTP preview with `python -m http.server`
- HTTP checks for `/`, `/styles.css`, `/assets/aift-federation-hero.png`, and key docs

## Public claim boundaries

- Do not claim custom-domain launch until a `CNAME` and DNS evidence exist.
- Do not claim AetherCore external review until AI-Freedom-Trust records reviewer evidence.
- Do not claim Capital City Provisions revenue verification until operating metrics are published.
- Do not claim AIFT-Forge stable release until release artifacts, hashes, and approvals exist.
- Do not claim audited security status for any repo without an audit artifact.

## Known blockers

- The automated static validator does not verify external navigation destinations, browser-executed Tree modules or remote manifests, or live Pages responses.
- Custom domain is still a roadmap item.
- Public inventory needs a recurring update rhythm as repo statuses change.

## Next best repair

Add browser-level verification of the Living Tree's remote module and manifest integration, with separate checks for external links and live Pages responses. Do not treat these portal checks as proof that linked repositories are operational.
