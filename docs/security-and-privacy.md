# Public Portal Security And Privacy

This document records security, privacy, and public-claims boundaries for `www.aifreedomtrust.com`.

## Security status

| Area | Status |
| --- | --- |
| Formal security audit | Not audited |
| Runtime model | Static GitHub Pages site |
| Server-side code | None in this repo |
| Secrets required | None |
| Custom domain | Not configured in repo |
| Public data | Repository links, docs, public project descriptions, generated hero image |

## No secrets in public source

Do not commit:

- credentials;
- analytics secrets;
- private contact lists;
- private reviewer notes;
- unpublished business metrics;
- private repository links unless approved for publication;
- wallet keys, signing keys, tokens, or deployment secrets.

## Public claim boundaries

The portal may describe:

- public mission and project map;
- public repositories;
- maturity labels;
- links to canonical research and repo-health docs;
- roadmap items clearly labeled as roadmap.

The portal must not claim without evidence:

- legal status;
- financial value;
- verified revenue;
- production readiness;
- audited security;
- external review;
- partnerships;
- custom-domain launch;
- decentralization guarantees.

## Data minimization

The site should remain public-information only. Avoid adding forms, trackers, private data capture, or third-party scripts unless there is a documented privacy reason, explicit owner approval, and a no-secret implementation plan.

## Incident response

If unsupported claims, private data, or secrets appear on the portal:

1. Remove or correct the public page.
2. Record which claim or data was exposed.
3. Rotate any exposed credential outside the repository.
4. Link back to the canonical source of truth.
5. Add a validation checklist item when practical.
