#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

OWNER="AIFreedomTrustFederation"
ROOT_REPO="aifreedomtrustfederation.github.io"
BASE_URL="https://aifreedomtrustfederation.github.io"
REPORT="$HOME/aift-pages-repair-report.txt"
SNAPSHOT_FILE=""
JOURNAL_FILE=""
RUN_ID=""

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
# Only approved apply mode requires GNU dd for fsync-backed recovery writes.
if (( APPLY )) && ! command -v dd >/dev/null 2>&1; then
  printf 'Missing dd; cannot safely persist apply-mode recovery evidence\n' >&2
  exit 1
fi
if (( APPLY )) && ! command -v python3 >/dev/null 2>&1; then
  printf 'Missing python3; cannot synchronize recovery directory entries\n' >&2
  exit 1
fi
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

# File fsync alone does not persist newly created filenames. Synchronize the
# recovery directory after both mktemp calls and before any Pages mutation.
# This protects directory entries, not cross-repository atomicity or rollback.
sync_recovery_directory(){
  python3 - "$HOME" <<'PY'
import os
import sys
fd = os.open(sys.argv[1], os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
try:
    os.fsync(fd)
finally:
    os.close(fd)
PY
}

# Keep each approved apply run's recovery evidence separate and private.
# These are pre-change observations, not proof that writes succeeded.
if (( APPLY )); then
  if ! SNAPSHOT_FILE="$(mktemp "$HOME/aift-pages-before.XXXXXXXX.jsonl")"; then
    log "Cannot create recovery snapshot file; refusing all mutations"
    exit 1
  fi
  # The unique mktemp basename correlates evidence from this execution.
  # It is not a cryptographic authenticity guarantee.
  RUN_ID="${SNAPSHOT_FILE##*/}"
  log "Recovery execution ID: $RUN_ID"
  log "Pre-change recovery snapshots: $SNAPSHOT_FILE (not a rollback or success record)"
  if ! JOURNAL_FILE="$(mktemp "$HOME/aift-pages-writes.XXXXXXXX.jsonl")"; then
    log "Cannot create private write-outcome journal; refusing all mutations"
    exit 1
  fi
  log "Write-outcome journal: $JOURNAL_FILE (unmatched attempted events require manual reconciliation)"
  if ! sync_recovery_directory; then
    log "Cannot persist recovery file directory entries; refusing all mutations"
    exit 1
  fi
  log "Recovery directory entries synchronized before publishing writes"
fi

repo_exists(){ gh repo view "$OWNER/$1" >/dev/null 2>&1; }
branch_exists(){ gh api "repos/$OWNER/$1/branches/$2" >/dev/null 2>&1; }

# Resolve every configured publishing target before the first approved write.
# A branch lookup also establishes that the repository is accessible.
# Read-only audits retain their existing best-effort behavior.
preflight_pages_targets(){
  local item repo branch failed=0
  log "Preflight: checking every Pages target before any publishing write"
  for item in "${PUBLIC_GH_PAGES[@]}"; do
    IFS="|" read -r repo branch <<< "$item"
    if ! branch_exists "$repo" "$branch"; then
      log "Preflight failed: missing or inaccessible repository/branch $repo:$branch"
      failed=1
    fi
  done
  if (( failed )); then
    log "Preflight aborted: no Pages publishing writes attempted"
    return 1
  fi
  log "Preflight passed: all ${#PUBLIC_GH_PAGES[@]} target repositories and branches accessible"
}

if (( APPLY )); then
  preflight_pages_targets || exit 1
fi

# Flush each recovery record before any subsequent API mutation. A successful
# dd conv=fsync waits for file data/metadata to reach the storage stack; this
# is not an atomic multi-repository transaction or a directory-fsync guarantee.
append_recovery_record(){
  local path="$1" record="$2"
  printf '%s\n' "$record" | dd of="$path" oflag=append conv=notrunc,fsync status=none
}

# Pages API responses are untrusted input. jq silently selects the last
# duplicate JSON key, which can make contradictory recovery evidence appear
# valid. Reject duplicate keys at every nesting level before snapshotting.
validate_unique_pages_json(){
  python3 -c '
import json
import sys

def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate JSON field")
        result[key] = value
    return result

try:
    value = json.load(sys.stdin, object_pairs_hook=unique_pairs)
    if not isinstance(value, dict):
        raise ValueError("expected JSON object")
except (ValueError, UnicodeError):
    sys.exit(1)
'
}

snapshot_pages_before_write(){
  local repo="$1" intended_branch="$2" pages_status="$3" prior record
  if [[ "$pages_status" == 200 ]]; then
    # A fresh GET avoids relying on HTTP headers or an unvalidated response.
    if ! prior="$(gh api "repos/$OWNER/$repo/pages" 2>&1)"; then
      log "Cannot capture Pages pre-change state for $repo; refusing write"
      return 1
    fi
    if ! printf '%s' "$prior" | validate_unique_pages_json; then
      log "Invalid Pages pre-change state for $repo (ambiguous JSON); refusing write"
      return 1
    fi
    # Match the reconciler's previous-state contract before any approved write.
    # Otherwise a successful mutation could leave unusable rollback evidence.
    if ! printf '%s' "$prior" | jq -es \
      'length == 1 and (.[0] | type == "object" and (.source | type == "object") and (.source.branch | type == "string" and length > 0) and (.source.path == "/" or .source.path == "/docs") and (.cname == null or (.cname | type == "string")))' \
      >/dev/null 2>&1; then
      log "Invalid Pages pre-change state for $repo; refusing write"
      return 1
    fi
    if ! record="$(printf '%s' "$prior" | jq -cs --arg repo "$repo" --arg branch "$intended_branch" --arg run_id "$RUN_ID" \
      '.[0] | {schema_version:1, run_id:$run_id, repository:$repo, intended_source:{branch:$branch,path:"/"}, existed:true, previous:{source:{branch:.source.branch,path:.source.path}, cname:.cname, cname_observed:has("cname")}}')"; then
      log "Cannot encode Pages pre-change state for $repo; refusing write"
      return 1
    fi
  elif [[ "$pages_status" == 404 ]]; then
    if ! record="$(jq -nc --arg repo "$repo" --arg branch "$intended_branch" --arg run_id "$RUN_ID" \
      '{schema_version:1, run_id:$run_id, repository:$repo, intended_source:{branch:$branch,path:"/"}, existed:false, previous:null}')"; then
      log "Cannot encode absent Pages state for $repo; refusing write"
      return 1
    fi
  else
    log "Unknown Pages pre-change state for $repo; refusing write"
    return 1
  fi
  if ! append_recovery_record "$SNAPSHOT_FILE" "$record"; then
    log "Cannot persist Pages pre-change state for $repo; refusing write"
    return 1
  fi
}

# Write-ahead attempt events are conservative; an unmatched attempt is NOT
# proof of a successful write. Records are fsync'd, but directory durability,
# multi-repository atomicity and automatic rollback are not established.
journal_event(){
  local repo="$1" operation="$2" phase="$3" branch="$4" event
  if ! event="$(jq -nc --arg repo "$repo" --arg operation "$operation" \
      --arg phase "$phase" --arg branch "$branch" --arg run_id "$RUN_ID" \
      '{schema_version:1, run_id:$run_id, observed_at:(now|todateiso8601), repository:$repo, operation:$operation, phase:$phase, intended_source:{branch:$branch,path:"/"}}')"; then
    log "Cannot encode write outcome for $repo; stopping"
    return 1
  fi
  if ! append_recovery_record "$JOURNAL_FILE" "$event"; then
    log "Cannot append write outcome for $repo; stopping"
    return 1
  fi
}

normalize_pages(){
  local repo="$1" branch="$2"

  log ""
  log "=== normalize $repo -> $branch ==="

  if ! repo_exists "$repo"; then
    log "missing repo"
    if (( APPLY )); then
      log "Repository $repo became inaccessible after preflight; stopping before subsequent repositories"
      return 1
    fi
    return 0
  fi

  if ! branch_exists "$repo" "$branch"; then
    log "missing branch $branch; cannot set Pages source"
    if (( APPLY )); then
      log "Branch $repo:$branch became inaccessible after preflight; stopping before subsequent repositories"
      return 1
    fi
    return 0
  fi

  # Only an explicit 404 means Pages is absent. Permission, rate-limit,
  # transport and server errors must never trigger a Pages-creation POST.
  local pages_probe pages_rc=0 pages_status pages_operation=""
  pages_probe="$(gh api --include "repos/$OWNER/$repo/pages" 2>&1)" || pages_rc=$?
  pages_status="$(printf '%s\n' "$pages_probe" | tr -d '\r' | sed -nE 's/^HTTP\/[0-9.]+[[:space:]]+([0-9]{3})([[:space:]].*)?$/\1/p' | tail -n 1)"
  if [[ "$pages_status" == 200 && "$pages_rc" == 0 ]]; then
    if (( APPLY )); then
      snapshot_pages_before_write "$repo" "$branch" 200 || return 1
      pages_operation="update_pages_source"
      journal_event "$repo" "$pages_operation" "attempted" "$branch" || return 1
      if ! gh api -X PUT "repos/$OWNER/$repo/pages" \
        -f source.branch="$branch" \
        -f source.path="/" >/dev/null; then
        log "PUT Pages source failed; stopping before custom-domain changes"
        return 1
      fi
    else
      log "would update Pages source to $branch (no change made)"
    fi
  elif [[ "$pages_status" == 404 && "$pages_rc" != 0 ]]; then
    if (( APPLY )); then
      snapshot_pages_before_write "$repo" "$branch" 404 || return 1
      pages_operation="enable_pages"
      journal_event "$repo" "$pages_operation" "attempted" "$branch" || return 1
      if ! gh api -X POST "repos/$OWNER/$repo/pages" \
        -f source.branch="$branch" \
        -f source.path="/" >/dev/null; then
        log "POST Pages enable failed; stopping before custom-domain changes"
        return 1
      fi
    else
      log "would enable Pages from $branch (no change made)"
    fi
  else
    log "Pages probe failed (HTTP ${pages_status:-unknown}); refusing changes for $repo"
    return 1
  fi

  # Verify the actual Pages source before any optional domain removal.
  # A successful API write is not proof that the requested state was applied.
  if (( APPLY )); then
    local verified_pages verified_branch verified_path
    if ! verified_pages="$(gh api "repos/$OWNER/$repo/pages" 2>&1)"; then
      log "Pages post-write verification GET failed for $repo; stopping before custom-domain changes"
      return 1
    fi
    if ! printf '%s' "$verified_pages" | validate_unique_pages_json; then
      log "Invalid Pages post-write verification JSON for $repo; stopping before custom-domain changes"
      return 1
    fi
    verified_branch="$(printf '%s' "$verified_pages" | jq -er '.source.branch // empty' 2>/dev/null)" || verified_branch=""
    verified_path="$(printf '%s' "$verified_pages" | jq -er '.source.path // empty' 2>/dev/null)" || verified_path=""
    if [[ "$verified_branch" != "$branch" || "$verified_path" != "/" ]]; then
      log "Pages post-write verification mismatch for $repo (expected source $branch /); stopping before custom-domain changes"
      return 1
    fi
    log "Pages source verified: $branch /"
    journal_event "$repo" "$pages_operation" "verified" "$branch" || return 1
  fi

  # The source-verification GET is also our most recent domain observation.
  # DELETE of an already absent domain commonly returns 404 after a source
  # update, stranding an otherwise successful multi-repository repair. Never
  # mutate or journal a removal without an explicitly observed domain.
  local domain_removal_needed=$REMOVE_CUSTOM_DOMAINS
  if (( APPLY && REMOVE_CUSTOM_DOMAINS )); then
    if ! printf '%s' "$verified_pages" | jq -es \
      'length == 1 and (.[0] | type == "object" and has("cname") and (.cname == null or ((.cname | type) == "string")))' \
      >/dev/null 2>&1; then
      log "Cannot establish current custom domain for $repo; stopping before deletion"
      return 1
    fi
    if printf '%s' "$verified_pages" | jq -es \
      'length == 1 and (.[0] | .cname == null or .cname == "")' \
      >/dev/null 2>&1; then
      log "custom domain already absent for $repo; skipping DELETE"
      domain_removal_needed=0
    fi
  fi

  if (( APPLY && domain_removal_needed )); then
    journal_event "$repo" "remove_custom_domain" "attempted" "$branch" || return 1
    if gh api -X DELETE "repos/$OWNER/$repo/pages/cname" >/dev/null 2>&1; then
      # A successful DELETE alone does not establish that the domain is gone.
      # Require one valid Pages object with an explicitly empty cname field.
      local verified_domain
      if ! verified_domain="$(gh api "repos/$OWNER/$repo/pages" 2>&1)"; then
        log "custom domain post-delete verification GET failed for $repo; stopping before subsequent repositories"
        return 1
      fi
      if ! printf '%s' "$verified_domain" | validate_unique_pages_json; then
        log "Invalid custom domain post-delete verification JSON for $repo; stopping before subsequent repositories"
        return 1
      fi
      if ! printf '%s' "$verified_domain" | jq -es \
        'length == 1 and (.[0] | type == "object" and has("cname") and (.cname == null or .cname == ""))' \
        >/dev/null 2>&1; then
        log "custom domain post-delete verification mismatch for $repo; stopping before subsequent repositories"
        return 1
      fi
      log "custom domain removal verified for $repo"
      journal_event "$repo" "remove_custom_domain" "verified" "$branch" || return 1
    else
      log "DELETE custom domain failed for $repo; stopping before subsequent repositories"
      return 1
    fi
  else
    if (( ! APPLY || ! REMOVE_CUSTOM_DOMAINS )); then
      log "custom domain preserved (removal requires --apply --remove-custom-domains)"
    fi
  fi

  if (( APPLY )); then sleep 1; fi

  if out="$(gh api "repos/$OWNER/$repo/pages" 2>&1)"; then
    # A final informational lookup must not turn ambiguous JSON into a
    # success report or allow the next repository to be mutated.
    if ! printf '%s' "$out" | validate_unique_pages_json; then
      log "Invalid final Pages status JSON for $repo; stopping before subsequent repositories"
      return 1
    fi
    # A later actor may change Pages after our successful post-write GET.
    # In apply mode, refuse to proceed to another repository if the final
    # observation no longer matches the source that was just verified.
    if (( APPLY )) && ! printf '%s' "$out" | jq -es --arg branch "$branch" \
      'length == 1 and (.[0] | type == "object" and (.source | type == "object") and (.source.branch == $branch) and (.source.path == "/"))' \
      >/dev/null 2>&1; then
      log "Final Pages source drift for $repo (expected $branch /); stopping before subsequent repositories"
      return 1
    fi
    log "enabled: yes"
    log "url: $(printf '%s' "$out" | jq -r '.html_url // empty')"
    log "status: $(printf '%s' "$out" | jq -r '.status // empty')"
    log "branch: $(printf '%s' "$out" | jq -r '.source.branch // empty')"
    log "cname: $(printf '%s' "$out" | jq -r '.cname // empty')"
  else
    if (( APPLY )); then
      log "Final Pages status lookup failed for $repo; stopping before subsequent repositories"
      return 1
    fi
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
