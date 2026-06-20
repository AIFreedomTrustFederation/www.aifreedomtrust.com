# Public Portal Validation

This document is the local validation source of truth for `www.aifreedomtrust.com`.

## Current local gate

For documentation and static-site changes, run:

```powershell
git diff --check
python -m http.server 4178 --bind 127.0.0.1
```

Then verify these local URLs return `200`:

- `http://127.0.0.1:4178/`
- `http://127.0.0.1:4178/styles.css`
- `http://127.0.0.1:4178/assets/aift-federation-hero.png`
- `http://127.0.0.1:4178/docs/public-repo-inventory.md`
- `http://127.0.0.1:4178/docs/status.md`
- `http://127.0.0.1:4178/docs/security-and-privacy.md`

## Manual page review

After local preview starts:

1. Confirm the hero image loads.
2. Confirm public maturity labels remain visible.
3. Confirm repo links still point to public GitHub repositories.
4. Confirm research and review links point to `AI-Freedom-Trust`.
5. Confirm there are no unsupported claims of audit, production, revenue, external review, or custom-domain launch.

## Optional live check

When network access is available, check the live GitHub Pages URL from README. A live check should not replace local source review.

## Failure reporting

When validation fails, record:

- exact URL or command;
- HTTP status or first meaningful error;
- whether the failure is local source, generated asset, GitHub Pages, DNS, or external link related;
- safest next repair step.
