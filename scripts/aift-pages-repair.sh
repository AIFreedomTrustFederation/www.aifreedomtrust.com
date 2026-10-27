#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

OWNER="AIFreedomTrustFederation"
ROOT_REPO="aifreedomtrustfederation.github.io"
BASE_URL="https://aifreedomtrustfederation.github.io"
REPORT="$HOME/aift-pages-repair-report.txt"

PUBLIC_GH_PAGES=(
  "aifreedomtrustfederation.github.io|main"
  "www.aifreedomtrust.com|gh-pages"
  "booksmith-ai|gh-pages"
  "AI-Freedom-Trust|main"
  "AIFT-Forge|gh-pages"
  "VPS|gh-pages"
  "Aether_Coin_biozonecurrency|gh-pages"
  "biozone-harmony-boost|gh-pages"
  "capital-city-provisions|gh-pages"
  "TheMindofAll|gh-pages"
)

INTERNAL_REPOS=(
  "tastycutz"
  "repo-brainstorm-backend-forge"
  "c-848263"
)

log(){ echo "$*" | tee -a "$REPORT"; }

# Auditing is the default. Changes to Pages publishing require explicit approval.
APPLY=0
REMOVE_CUSTOM_DOMAINS=0
while (( $# )); do
  case "$1" in
    --apply) APPLY=1 ;;
    --remove-custom-domains) REMOVE_CUSTOM_DOMAINS=1 ;;
    --help|-h)
      printf '%s\n' 'Usage: bash scripts/aift-pages-repair.sh [--apply [--remove-custom-domains]]' \
        'Default: read-only audit. --apply changes Pages sources.' \
        '--remove-custom-domains additionally removes Pages custom domains; requires --apply and separate approval.'
      exit 0 ;;
    *) printf 'Unknown option: %s\n' "$1" >&2; exit 2 ;;
  esac
  shift
done
if (( REMOVE_CUSTOM_DOMAINS && ! APPLY )); then
  echo '--remove-custom-domains requires --apply' >&2
  exit 2
fi
for tool in gh jq curl; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf 'Missing %s; install it before running the audit\n' "$tool" >&2
    exit 1
  fi
done
: > "$REPORT"
if ! gh auth status >/dev/null 2>&1; then
  log 'GitHub CLI authentication required; run gh auth login separately.'
  exit 1
fi
if (( ! APPLY )); then
  log 'READ-ONLY AUDIT: no Pages or custom-domain changes will be made.'
else
  log 'APPLY MODE: Pages sources may be changed; verify approval before proceeding.'
fi

repo_exists(){ gh repo view "$OWNER/$1" >/dev/null 2>&1; }
branch_exists(){ gh api "repos/$OWNER/$1/branches/$2" >/dev/null 2>&1; }

normalize_pages(){
  local repo="$1" branch="$2"

  log ""
  log "=== normalize $repo -> $branch ==="

  if ! repo_exists "$repo"; then
    log "missing repo"
    return 0
  fi

  if ! branch_exists "$repo" "$branch"; then
    log "missing branch $branch; cannot set Pages source"
    return 0
  fi

  # Only an explicit 404 means Pages is absent. Permission, rate-limit,
  # transport and server errors must never trigger a Pages-creation POST.
  local pages_probe pages_rc=0 pages_status
  pages_probe="$(gh api --include "repos/$OWNER/$repo/pages" 2>&1)" || pages_rc=$?
  pages_status="$(printf '%s\n' "$pages_probe" | tr -d '\r' | sed -nE 's/^HTTP\/[0-9.]+[[:space:]]+([0-9]{3})([[:space:]].*)?$/\1/p' | tail -n 1)"
  if [[ "$pages_status" == 200 && "$pages_rc" == 0 ]]; then
    if (( APPLY )); then
      gh api -X PUT "repos/$OWNER/$repo/pages" \
        -f source.branch="$branch" \
        -f source.path="/" >/dev/null || log "PUT Pages source failed"
    else
      log "would update Pages source to $branch (no change made)"
    fi
  elif [[ "$pages_status" == 404 && "$pages_rc" != 0 ]]; then
    if (( APPLY )); then
      gh api -X POST "repos/$OWNER/$repo/pages" \
        -f source.branch="$branch" \
        -f source.path="/" >/dev/null || log "POST Pages enable failed"
    else
      log "would enable Pages from $branch (no change made)"
    fi
  else
    log "Pages probe failed (HTTP ${pages_status:-unknown}); refusing changes for $repo"
    return 1
  fi

  if (( APPLY && REMOVE_CUSTOM_DOMAINS )); then
    if gh api -X DELETE "repos/$OWNER/$repo/pages/cname" >/dev/null 2>&1; then
      log "custom domain removed if present"
    else
      log "custom domain unchanged or no permission/API support"
    fi
  else
    log "custom domain preserved (removal requires --apply --remove-custom-domains)"
  fi

  if (( APPLY )); then sleep 1; fi

  if out="$(gh api "repos/$OWNER/$repo/pages" 2>&1)"; then
    log "enabled: yes"
    log "url: $(printf '%s' "$out" | jq -r '.html_url // empty')"
    log "status: $(printf '%s' "$out" | jq -r '.status // empty')"
    log "branch: $(printf '%s' "$out" | jq -r '.source.branch // empty')"
    log "cname: $(printf '%s' "$out" | jq -r '.cname // empty')"
  else
    log "enabled: no"
    log "$out"
  fi
}

for item in "${PUBLIC_GH_PAGES[@]}"; do
  IFS="|" read -r repo branch <<< "$item"
  normalize_pages "$repo" "$branch"
done

log ""
log "===== internal/private repos intentionally not public Pages ====="
for repo in "${INTERNAL_REPOS[@]}"; do
  if repo_exists "$repo"; then
    vis="$(gh api "repos/$OWNER/$repo" --jq '.visibility' 2>/dev/null || echo unknown)"
    log "$repo visibility: $vis"
  else
    log "$repo missing or inaccessible"
  fi
done

log ""
log "===== URL smoke checks ====="
for item in "${PUBLIC_GH_PAGES[@]}"; do
  IFS="|" read -r repo branch <<< "$item"
  url="$BASE_URL/$repo/"
  [ "$repo" = "$ROOT_REPO" ] && url="$BASE_URL/"
  code="$(curl -L -s -o /dev/null -w '%{http_code}' "$url" || true)"
  log "$code $url"
done

log ""
log "Report: $REPORT"
