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

pkg install -y gh jq git curl >/dev/null
: > "$REPORT"

gh auth status >/dev/null || gh auth login --hostname github.com --web

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

  if gh api "repos/$OWNER/$repo/pages" >/dev/null 2>&1; then
    gh api -X PUT "repos/$OWNER/$repo/pages" \
      -f source.branch="$branch" \
      -f source.path="/" >/dev/null || log "PUT Pages source failed"
  else
    gh api -X POST "repos/$OWNER/$repo/pages" \
      -f source.branch="$branch" \
      -f source.path="/" >/dev/null || log "POST Pages enable failed"
  fi

  if gh api -X DELETE "repos/$OWNER/$repo/pages/cname" >/dev/null 2>&1; then
    log "custom domain removed if present"
  else
    log "custom domain unchanged or no permission/API support"
  fi

  sleep 1

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
