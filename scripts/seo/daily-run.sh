#!/usr/bin/env bash
# NeuroWiki SEO, daily data pull.
# Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT).
#
# One command that collects every signal the morning review needs. Written for
# an unattended run: it loads credentials itself, it does not stop when one
# feed fails, and it leaves behind a manifest saying exactly what worked.
#
# The agent that reads the results should never need to remember which npm
# script to call or how to load .env.local. That is this file's whole job.
#
# Usage:
#   bash scripts/seo/daily-run.sh            # tier decided by the calendar
#   bash scripts/seo/daily-run.sh --weekly   # force the Monday tier
#   bash scripts/seo/daily-run.sh --monthly  # force the first-Monday tier
#
# Exit code is 0 when at least the two core feeds (GSC + GA4) succeeded, and 1
# when the run is too incomplete to brief on.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT" || exit 1

DATE="$(date +%Y-%m-%d)"
LOG_DIR="$REPO_ROOT/docs/seo/runs/$DATE"
mkdir -p "$LOG_DIR"

# Credentials and overrides live in .env.local when it exists. Unlike the
# Tidbit original, a missing file is NOT fatal: scripts/seo/config.mjs holds
# working defaults for everything except the optional PSI_API_KEY.
if [[ -f "$REPO_ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  . "$REPO_ROOT/.env.local"
  set +a
fi

MANIFEST="$LOG_DIR/manifest.json"
echo "{" > "$MANIFEST"
echo "  \"date\": \"$DATE\"," >> "$MANIFEST"
echo "  \"startedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> "$MANIFEST"
echo "  \"steps\": [" >> "$MANIFEST"

FIRST=1
FAILED=()
SUCCEEDED=()

# run <name> <logfile> <findings-codes> <command...>
#
# Several of these scripts signal "I ran fine and found problems" with a
# nonzero exit: anomaly, indexation, crawl-links, schema and pagespeed use 1.
# That is a finding, not a failure, and treating it as a crash would mark a
# healthy run broken every morning. <findings-codes> is a comma-separated
# list of exit codes meaning "ran, has findings". Anything else is a genuine
# failure.
run() {
  local name="$1"; shift
  local logfile="$LOG_DIR/$1.log"; shift
  local findings_codes="$1"; shift
  local start_ts
  start_ts=$(date +%s)
  local status summary code

  printf '  %-22s' "$name"
  "$@" > "$logfile" 2>&1
  code=$?
  local dur=$(( $(date +%s) - start_ts ))

  if [[ $code -eq 0 ]]; then
    status="ok"
    echo "ok (${dur}s)"
    SUCCEEDED+=("$name")
  elif [[ ",$findings_codes," == *",$code,"* ]]; then
    status="findings"
    echo "ok, has findings (${dur}s)"
    SUCCEEDED+=("$name")
  else
    status="failed"
    echo "FAILED exit=$code (${dur}s)"
    FAILED+=("$name")
  fi

  if [[ "$status" == "failed" ]]; then
    summary=$(tail -3 "$logfile" | tr '\n' ' ' | head -c 300 | tr -d '"\\' || true)
  else
    summary=$(grep -m1 '^Summary:' "$logfile" 2>/dev/null | head -c 300 | tr -d '"\\' || true)
  fi

  [[ $FIRST -eq 0 ]] && echo "    ," >> "$MANIFEST"
  FIRST=0
  {
    echo "    {"
    echo "      \"name\": \"$name\","
    echo "      \"status\": \"$status\","
    echo "      \"log\": \"docs/seo/runs/$DATE/$(basename "$logfile")\","
    echo "      \"summary\": \"$summary\""
    echo -n "    }"
  } >> "$MANIFEST"
}

# ─── Cadence ────────────────────────────────────────────────────────────
# Not everything deserves a daily run. Google's index moves in days, page
# speed moves when code changes, and month-over-month needs a month.
#
#   daily    fresh traffic + search data, the planners, the alarm
#   weekly   (Mondays) URL inspections + site crawl + schema + page speed
#   monthly  (first Monday) the rollup + deep keyword research
DOW=$(date +%u)   # 1 = Monday
DOM=$(date +%-d)
WEEKLY=false
MONTHLY=false
[[ "$DOW" == "1" ]] && WEEKLY=true
[[ "$DOW" == "1" && "$DOM" -le 7 ]] && MONTHLY=true
for arg in "$@"; do
  [[ "$arg" == "--weekly" ]] && WEEKLY=true
  [[ "$arg" == "--monthly" ]] && { WEEKLY=true; MONTHLY=true; }
done

echo ""
echo "NeuroWiki SEO pull, $DATE (daily$([[ $WEEKLY == true ]] && echo " + weekly")$([[ $MONTHLY == true ]] && echo " + monthly"))"
echo ""

# ─── Step 0: report-only guard baseline + page inventory ────────────────
run "guard-baseline"      "guard"        ""    node scripts/seo/clinical-guard.mjs --baseline
run "page-inventory"      "inventory"    ""    npx tsx scripts/seo/lib/site-pages.ts

# ─── Daily: core feeds. A failure here means no briefing. ───────────────
run "search-console"      "gsc"          ""    node scripts/seo/fetch-gsc.mjs --days=28
run "analytics"           "ga4"          ""    node scripts/seo/daily-snapshot.mjs 1
run "analytics-7day"      "ga4-7day"     ""    node scripts/seo/daily-snapshot.mjs 7

# ─── Daily: analysis + alarm ────────────────────────────────────────────
run "rank-deltas"         "deltas"       ""    node scripts/seo/rank-deltas.mjs
run "keyword-gaps"        "keywords"     ""    node scripts/seo/keyword-opportunities.mjs
run "page-refresh"        "page-refresh" ""    node scripts/seo/page-refresh.mjs 28
run "ai-traffic"          "ai-traffic"   ""    node scripts/seo/ai-traffic.mjs
run "anomaly-alarm"       "anomaly"      "1"   node scripts/seo/anomaly-check.mjs

# ─── Weekly (Mondays): the slow, slow-moving checks ─────────────────────
if [[ "$WEEKLY" == "true" ]]; then
  run "url-inspections"   "inspections"  ""    node scripts/seo/fetch-gsc-inspections.mjs
  run "indexation"        "indexation"   "1"   node scripts/seo/indexation-check.mjs
  run "site-crawl"        "crawl"        "1"   node scripts/seo/crawl-links.mjs
  run "schema"            "schema"       "1"   node scripts/seo/schema-validator.mjs
  run "pagespeed"         "pagespeed"    "1"   node scripts/seo/pagespeed.mjs
  run "sitemap-resubmit"  "sitemap"      ""    node scripts/seo/submit-sitemap.mjs --confirm
fi

# ─── Monthly (first Monday): the month's story ──────────────────────────
if [[ "$MONTHLY" == "true" ]]; then
  run "monthly-rollup"    "rollup"       ""    node scripts/seo/monthly-rollup.mjs
  run "keyword-research"  "kw-research"  ""    node scripts/seo/keyword-research.mjs
fi

# ─── Final: report-only proof ───────────────────────────────────────────
run "report-only-check"   "guard-check"  ""    node scripts/seo/clinical-guard.mjs --check

{
  echo ""
  echo "  ],"
  echo "  \"finishedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"succeeded\": ${#SUCCEEDED[@]},"
  echo "  \"failed\": ${#FAILED[@]}"
  echo "}"
} >> "$MANIFEST"

echo ""
echo "Succeeded: ${#SUCCEEDED[@]} | Failed: ${#FAILED[@]}"
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo "Failed steps: ${FAILED[*]}"
  echo "Logs: docs/seo/runs/$DATE/"
fi
echo ""
echo "Reports written to docs/seo/*-latest.md"
echo "Manifest: docs/seo/runs/$DATE/manifest.json"

# Only the two core feeds are load-bearing for a briefing.
for core in "search-console" "analytics"; do
  for f in "${FAILED[@]:-}"; do
    if [[ "$f" == "$core" ]]; then
      echo "FATAL: core feed '$core' failed. Not enough data to brief on." >&2
      exit 1
    fi
  done
done

exit 0
