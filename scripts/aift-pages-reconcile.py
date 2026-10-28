#!/usr/bin/env python3
"""Read-only reconciliation of Pages repair snapshots and write-outcome journals.

An observed desired state is not proof that a previously attempted write succeeded.
This tool never changes Pages settings or attempts rollback.
"""
import argparse
from collections import defaultdict, deque
import json
from pathlib import Path
import re
import subprocess
import sys

OWNER = "AIFreedomTrustFederation"
OPERATIONS = {"update_pages_source", "enable_pages", "remove_custom_domain"}
REPO_NAME = re.compile(r"^[A-Za-z0-9_.-]+$")


def records(path):
    result = []
    for number, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{number}: invalid JSON") from exc
        if not isinstance(item, dict) or item.get("schema_version") != 1:
            raise ValueError(f"{path}:{number}: invalid record schema")
        result.append(item)
    return result


def validate_repo(repo):
    if not isinstance(repo, str) or not REPO_NAME.fullmatch(repo):
        raise ValueError("invalid repository identifier")
    return repo


def reconcile(snapshots, events):
    prior = {}
    for item in snapshots:
        repo = validate_repo(item.get("repository"))
        if repo in prior or not isinstance(item.get("existed"), bool):
            raise ValueError(f"duplicate or invalid pre-change snapshot for {repo}")
        prior[repo] = item

    pending = defaultdict(deque)
    verified = 0
    for item in events:
        repo = validate_repo(item.get("repository"))
        operation = item.get("operation")
        phase = item.get("phase")
        source = item.get("intended_source")
        if (repo not in prior or operation not in OPERATIONS or phase not in ("attempted", "verified")
                or not isinstance(source, dict) or not isinstance(source.get("branch"), str)
                or source.get("path") != "/"):
            raise ValueError(f"invalid journal event for {repo}")
        key = (repo, operation)
        if phase == "attempted":
            pending[key].append(item)
        else:
            if not pending[key]:
                raise ValueError(f"verified event without matching attempt for {repo}/{operation}")
            attempt = pending[key].popleft()
            if attempt["intended_source"] != source:
                raise ValueError(f"verification intent mismatch for {repo}/{operation}")
            verified += 1
    unresolved = []
    for (repo, operation), queue in pending.items():
        for attempt in queue:
            unresolved.append({
                "repository": repo,
                "operation": operation,
                "intended_source": attempt["intended_source"],
                "previous": prior[repo].get("previous"),
                "previous_pages_existed": prior[repo]["existed"],
            })
    return verified, unresolved


def observe(repo):
    try:
        result = subprocess.run(
            ["gh", "api", f"repos/{OWNER}/{repo}/pages"],
            capture_output=True, text=True, timeout=15, check=False,
        )
        if result.returncode != 0:
            return None
        payload = json.loads(result.stdout)
        return payload if isinstance(payload, dict) else None
    except (OSError, subprocess.TimeoutExpired, json.JSONDecodeError):
        return None


def observation_status(item, pages):
    if pages is None:
        return "unknown"
    if item["operation"] == "remove_custom_domain":
        if "cname" not in pages:
            return "unknown"
        return "observed_matches_intent" if pages["cname"] in (None, "") else "observed_differs"
    source = pages.get("source")
    if not isinstance(source, dict):
        return "unknown"
    desired = item["intended_source"]
    return ("observed_matches_intent" if source.get("branch") == desired["branch"]
            and source.get("path") == desired["path"] else "observed_differs")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot", required=True, help="private aift-pages-before.*.jsonl")
    parser.add_argument("--journal", required=True, help="private aift-pages-writes.*.jsonl")
    args = parser.parse_args(argv)
    try:
        verified, unresolved = reconcile(records(args.snapshot), records(args.journal))
    except (OSError, UnicodeError, ValueError) as exc:
        print(json.dumps({"schema_version": 1, "status": "invalid_evidence", "error": str(exc)}))
        return 1
    observed = {}
    for item in unresolved:
        repo = item["repository"]
        if repo not in observed:
            observed[repo] = observe(repo)
        item["current_observation"] = observation_status(item, observed[repo])
    print(json.dumps({
        "schema_version": 1,
        "status": "manual_reconciliation_required" if unresolved else "no_unmatched_attempts",
        "verified_events": verified,
        "unmatched_attempts": unresolved,
        "warning": "Current Pages state cannot prove an attempted write succeeded; no rollback performed.",
    }, indent=2))
    return 2 if unresolved else 0


if __name__ == "__main__":
    sys.exit(main())
