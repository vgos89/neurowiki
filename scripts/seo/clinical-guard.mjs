#!/usr/bin/env node
// NeuroWiki SEO, Clinical Guard — the mechanical half of "report-only".
//
// The unattended morning job may write ONLY under docs/seo/ and
// docs/seo-data/. Everything else in the repo — every clinical surface in
// .claude/rules/clinical-surfaces.md above all — is out of its reach.
// This script enforces that in three places:
//
//   --baseline   Run start (daily-run.sh step 0): snapshot `git status
//                --porcelain` to docs/seo/runs/<date>/guard-baseline.json.
//                Work V left uncommitted overnight is thereby recorded as
//                pre-existing, so the check below never blames the job for
//                it (and never nags V about their own work in progress).
//   --check      End of run: diff the current worktree against the baseline.
//                Any path that CHANGED SINCE BASELINE outside the allowlist
//                means the job wrote where it must not: exit 2, loudly.
//   --staged     Used by the commit-time hook for commits whose message
//                matches the job's format: every staged path must be inside
//                the allowlist, baseline or not. Exit 2 otherwise.
//
// Exit codes: 0 = clean, 2 = violation (or baseline missing for --check).

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const ALLOWLIST = ['docs/seo/', 'docs/seo-data/']

const date = new Date().toISOString().slice(0, 10)
const baselinePath = join(repoRoot, 'docs', 'seo', 'runs', date, 'guard-baseline.json')

const mode = process.argv[2]

function porcelain() {
  const out = execFileSync('git', ['status', '--porcelain'], { cwd: repoRoot, encoding: 'utf8' })
  return out.split('\n').filter(Boolean)
}

// A porcelain line is "XY <path>" or "XY <old> -> <new>" for renames.
function pathsOf(lines) {
  const paths = new Set()
  for (const line of lines) {
    const body = line.slice(3)
    for (const p of body.split(' -> ')) paths.add(p.trim().replace(/^"|"$/g, ''))
  }
  return paths
}

const allowed = (p) => ALLOWLIST.some((prefix) => p.startsWith(prefix))

if (mode === '--baseline') {
  mkdirSync(dirname(baselinePath), { recursive: true })
  writeFileSync(baselinePath, JSON.stringify({ takenAt: new Date().toISOString(), lines: porcelain() }, null, 2))
  console.log(`Guard baseline written: ${baselinePath.replace(repoRoot + '/', '')}`)
  console.log(`Summary: baseline entries=${porcelain().length}`)
  process.exit(0)
}

if (mode === '--check') {
  let baseline
  try {
    baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
  } catch {
    console.error(`No guard baseline for today (${baselinePath}). Run --baseline at run start.`)
    process.exit(2)
  }
  const before = new Set(baseline.lines)
  const nowLines = porcelain()
  // Lines that are new or changed since baseline = activity during the run.
  const delta = nowLines.filter((l) => !before.has(l))
  const violations = [...pathsOf(delta)].filter((p) => !allowed(p))
  if (violations.length) {
    console.error('REPORT-ONLY VIOLATION: the run changed files outside docs/seo/ and docs/seo-data/:')
    for (const v of violations) console.error(`  ${v}`)
    console.error('The morning job must not commit. Lead the briefing with this and leave the tree for V.')
    console.log(`Summary: violations=${violations.length}`)
    process.exit(2)
  }
  console.log(`Report-only check clean: ${pathsOf(delta).size} path(s) changed this run, all inside the allowlist.`)
  console.log(`Summary: violations=0 changed=${pathsOf(delta).size}`)
  process.exit(0)
}

if (mode === '--staged') {
  const out = execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: repoRoot, encoding: 'utf8' })
  const staged = out.split('\n').filter(Boolean)
  const violations = staged.filter((p) => !allowed(p))
  if (violations.length) {
    console.error('SEO daily commit blocked: staged paths outside docs/seo/ and docs/seo-data/:')
    for (const v of violations) console.error(`  ${v}`)
    process.exit(2)
  }
  console.log(`Staged paths clean (${staged.length} file(s), all inside the allowlist).`)
  process.exit(0)
}

console.error('Usage: node scripts/seo/clinical-guard.mjs --baseline | --check | --staged')
process.exit(2)
