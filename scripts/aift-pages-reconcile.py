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
RUN_ID_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{8,128}$")


def unique_json_object(pairs):
    """Reject duplicate keys at any JSON nesting level in recovery evidence."""
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON field {key!r}")
        result[key] = value
    return result


def records(path):
    result = []
    for number, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line, object_pairs_hook=unique_json_object)
        except (json.JSONDecodeError, ValueError) as exc:
            raise ValueError(f"{path}:{number}: invalid or ambiguous JSON: {exc}") from exc
        if not isinstance(item, dict) or item.get("schema_version") != 1:
            raise ValueError(f"{path}:{number}: invalid record schema")
        result.append(item)
    return result


def validate_repo(repo):
    if not isinstance(repo, str) or not REPO_NAME.fullmatch(repo):
        raise ValueError("invalid repository identifier")
    return repo


def evidence_run_id(item):
    """Legacy records may omit run_id, but present identifiers must be valid."""
    if "run_id" not in item:
        return None
    value = item["run_id"]
    if not isinstance(value, str) or not RUN_ID_PATTERN.fullmatch(value):
        raise ValueError("invalid recovery run identifier")
    return value


def valid_intended_source(source):
    return (isinstance(source, dict)
            and isinstance(source.get("branch"), str)
            and bool(source["branch"])
            and source.get("path") == "/")


def valid_previous_snapshot(item):
    """Validate recovery state before presenting it as a rollback reference.

    Legacy snapshots may omit cname_observed; missing evidence is not proof
    that a custom domain was absent.
    """
    previous = item.get("previous")
    if not item["existed"]:
        return previous is None
    if not isinstance(previous, dict):
        return False
    source = previous.get("source")
    if (not isinstance(source, dict)
            or not isinstance(source.get("branch"), str)
            or not source["branch"]
            or source.get("path") not in ("/", "/docs")):
        return False
    if "cname" in previous and previous["cname"] is not None and not isinstance(previous["cname"], str):
        return False
    if "cname_observed" in previous:
        observed = previous["cname_observed"]
        if not isinstance(observed, bool):
            return False
        # A claimed observation must include the observed field. When the API
        # omitted cname, the serialized null is not evidence of an empty domain.
        if observed and "cname" not in previous:
            return False
        if not observed and previous.get("cname") is not None:
            return False
    return True


def reconcile(snapshots, events):
    prior = {}
    run_ids = set()
    for item in snapshots:
        run_ids.add(evidence_run_id(item))
        repo = validate_repo(item.get("repository"))
        if (repo in prior or not isinstance(item.get("existed"), bool)
                or not valid_intended_source(item.get("intended_source"))
                or not valid_previous_snapshot(item)):
            raise ValueError(f"duplicate or invalid pre-change snapshot for {repo}")
        prior[repo] = item
    if len(run_ids) > 1:
        raise ValueError("snapshots belong to different recovery executions")
    run_id = next(iter(run_ids), None)

    pending = defaultdict(deque)
    # A single repair pass can write one source change, then one optional
    # domain removal per repository. Reject impossible journal sequences.
    stage = defaultdict(lambda: "start")
    verified = 0
    for item in events:
        repo = validate_repo(item.get("repository"))
        operation = item.get("operation")
        phase = item.get("phase")
        source = item.get("intended_source")
        if (repo not in prior or operation not in OPERATIONS or phase not in ("attempted", "verified")
                or (operation == "update_pages_source" and not prior[repo]["existed"])
                or (operation == "enable_pages" and prior[repo]["existed"])
                or not valid_intended_source(source)
                or source != prior[repo]["intended_source"]
                or evidence_run_id(item) != run_id):
            raise ValueError(f"invalid journal event for {repo}")
        key = (repo, operation)
        is_domain = operation == "remove_custom_domain"
        if phase == "attempted":
            expected = "source_verified" if is_domain else "start"
            if stage[repo] != expected:
                raise ValueError(f"out-of-order or duplicate attempt for {repo}/{operation}")
            pending[key].append(item)
            stage[repo] = "domain_pending" if is_domain else "source_pending"
        else:
            expected = "domain_pending" if is_domain else "source_pending"
            if stage[repo] != expected or not pending[key]:
                raise ValueError(f"out-of-order or unmatched verification for {repo}/{operation}")
            attempt = pending[key].popleft()
            if attempt["intended_source"] != source:
                raise ValueError(f"verification intent mismatch for {repo}/{operation}")
            stage[repo] = "domain_verified" if is_domain else "source_verified"
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
    return verified, unresolved, run_id


def observe(repo):
    try:
        result = subprocess.run(
            ["gh", "api", f"repos/{OWNER}/{repo}/pages"],
            capture_output=True, text=True, timeout=15, check=False,
        )
        if result.returncode != 0:
            return None
        # Live GitHub observations are untrusted JSON too: never let a
        # duplicate key silently select a favorable observed state.
        payload = json.loads(result.stdout, object_pairs_hook=unique_json_object)
        return payload if isinstance(payload, dict) else None
    except (OSError, subprocess.TimeoutExpired, ValueError):
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
        verified, unresolved, run_id = reconcile(records(args.snapshot), records(args.journal))
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
        "run_id": run_id,
        "run_id_binding": "bound" if run_id is not None else "legacy_unbound",
        "status": "manual_reconciliation_required" if unresolved else "no_unmatched_attempts",
        "verified_events": verified,
        "unmatched_attempts": unresolved,
        "warning": ("Legacy evidence has no execution identifier; correlation cannot be established. "
                    if run_id is None else "Execution identifiers match but are not authenticity proof. ")
                   + "Current Pages state cannot prove an attempted write succeeded; no rollback performed.",
    }, indent=2))
    return 2 if unresolved else 0


if __name__ == "__main__":
    sys.exit(main())
