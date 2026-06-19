# AI Freedom Trust Federation Website

Static public website, project map, and organization doorway for AI Freedom Trust Federation.

## Federation Status

| Field | Value |
| --- | --- |
| Status | Active |
| Federation layer | Public Trust |
| Repository role | Public portal |
| Visibility | Public |
| Deployment | GitHub Pages |
| Live URL | https://aifreedomtrustfederation.github.io/www.aifreedomtrust.com/ |

## Purpose

This repository explains AI Freedom Trust Federation to public users, builders, collaborators, and community partners in clear human language.

It is the canonical public doorway for:

- the federation mission
- public project inventory
- operating model
- repository standards
- GitHub ecosystem links
- current consolidation roadmap

## Current Capabilities

- One-page static website with no build step.
- GitHub Pages deployment from `main` branch `/root`.
- Public project map for active federation repositories.
- Public evidence-status labels that distinguish empirical work, production-facing software, and doctrinal/conceptual papers.
- Documentation pages for inventory, operating model, standards, and organization map.
- Project-local generated hero image asset.

## Files

- `index.html` - one-page public website
- `styles.css` - responsive styling with no build step
- `assets/aift-federation-hero.png` - generated hero image used by the site
- `docs/organization-map.md` - umbrella structure and repository roles
- `docs/public-repo-inventory.md` - public repository inventory
- `docs/federation-operating-model.md` - operating model and layer definitions
- `docs/repo-standards.md` - repository standards
- `.nojekyll` - keeps GitHub Pages from applying Jekyll processing

## Setup

No dependency installation is required.

To preview locally:

```bash
python -m http.server 4178 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4178/
```

## Verification

For this static site, verify:

- `index.html` loads locally.
- `styles.css` loads.
- `assets/aift-federation-hero.png` loads.
- Documentation links under `docs/` resolve.
- The live GitHub Pages URL returns `200`.

## GitHub Pages

This site is hosted directly from this repository:

- Source: `main` branch
- Path: `/root`
- Build type: legacy GitHub Pages static hosting

If using a custom domain, add the domain in the GitHub Pages settings and create a `CNAME` file containing that domain.

## Roadmap

1. Add a custom domain when the canonical domain is ready.
2. Add clearer contributor and collaborator pathways.
3. Keep the public inventory synchronized with active public repositories.
4. Link active demos, deployments, and roadmap issues as they mature.
5. Prepare the AetherCore empirical paper review packet for external reviewers.
6. Publish a Capital City Provisions operating dashboard with verified orders, revenue, delivery success, refunds, and repeat-customer metrics.

## Public Claims Note

This site should state what exists, what is planned, and what is experimental. Avoid unsupported claims about legal status, financial value, security guarantees, decentralization guarantees, partnerships, or production readiness.

Current public maturity labels:

- **Empirical / reproducible**: research package exists and can be checked, but external review is still pending.
- **Production-facing, revenue unverified**: operational software exists, but public repo evidence does not verify live orders or revenue.
- **Doctrinal / conceptual**: white papers and design documents that should not be treated as deployed or empirically validated unless paired with evidence.
