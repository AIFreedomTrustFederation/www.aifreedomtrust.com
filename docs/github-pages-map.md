# Federation GitHub Pages Map

Canonical GitHub Pages root:

```text
https://aifreedomtrustfederation.github.io/
```

Project-site pattern:

```text
https://aifreedomtrustfederation.github.io/<repo-name>/
```

## Public project pages

| Repository | Project URL | Role | Status |
| --- | --- | --- | --- |
| `aifreedomtrustfederation.github.io` | https://aifreedomtrustfederation.github.io/ | Root federation landing page | Active |
| `www.aifreedomtrust.com` | https://aifreedomtrustfederation.github.io/www.aifreedomtrust.com/ | Public portal | Active |
| `booksmith-ai` | https://aifreedomtrustfederation.github.io/booksmith-ai/ | Federated publishing studio | Active; verify deployment after build finishes |
| `AI-Freedom-Trust` | https://aifreedomtrustfederation.github.io/AI-Freedom-Trust/ | Doctrine, papers, PDFs, research packets | Active |
| `AIFT-Forge` | https://aifreedomtrustfederation.github.io/AIFT-Forge/ | Agentic forge and doctrine patterns | Active |
| `VPS` | https://aifreedomtrustfederation.github.io/VPS/ | Cloud app foundry and node infrastructure | Active |
| `Aether_Coin_biozonecurrency` | https://aifreedomtrustfederation.github.io/Aether_Coin_biozonecurrency/ | Aetherion wallet and regenerative value protocol | Needs Pages source/custom-domain normalization |
| `biozone-harmony-boost` | https://aifreedomtrustfederation.github.io/biozone-harmony-boost/ | Circleunchain/Biozoe UI prototype | Needs Pages source normalization |
| `capital-city-provisions` | https://aifreedomtrustfederation.github.io/capital-city-provisions/ | Applied business proof and provisions operations | Active |
| `TheMindofAll` | https://aifreedomtrustfederation.github.io/TheMindofAll/ | Local-first model and memory hub | Public now; run repair script to enable Pages |
| `.github` | https://aifreedomtrustfederation.github.io/.github/ | Organization profile and standards | Not normally used as a Pages site |

## Private or internal repositories

Private repositories should not be advertised as public Pages sites unless intentionally made public and reviewed.

| Repository | Pattern URL | Public status |
| --- | --- | --- |
| `tastycutz` | https://aifreedomtrustfederation.github.io/tastycutz/ | Private repo; do not publish until approved |
| `repo-brainstorm-backend-forge` | https://aifreedomtrustfederation.github.io/repo-brainstorm-backend-forge/ | Private repo; internal |
| `c-848263` | https://aifreedomtrustfederation.github.io/c-848263/ | Private repo; internal |

## Root landing page

Root site repository:

```text
AIFreedomTrustFederation/aifreedomtrustfederation.github.io
```

Root live URL:

```text
https://aifreedomtrustfederation.github.io/
```

## Termux Pages repair script — mutating operation

The checked-in `scripts/aift-pages-repair.sh` is **not a read-only audit**. It installs Termux packages, may request GitHub authentication, and iterates over a hard-coded list of repositories. For each accessible target with the configured branch, it invokes the GitHub Pages `PUT` or `POST` API and attempts `DELETE` on the Pages custom-domain endpoint. Running it can change publishing sources or remove configured custom domains across repositories; its subsequent HTTP smoke checks do not establish authorized or healthy deployment.

Do not run this script as a routine verification check. Before any Pages or custom-domain changes, review the actual target settings and obtain the repository owner's required approval under [`AGENTS.md`](../AGENTS.md). For an audit-only pass, inspect workflow results, Pages settings, and live URLs without invoking the repair script. The script's repository list and branch choices are configuration assumptions, not independently verified current deployment evidence.
