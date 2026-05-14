# docs/seo-data/ — Google Search Console data + integration scratch

This directory holds GSC integration scaffolding and curated SEO data
exports. Live credentials never land here (see `.gitignore`).

## Files

| File | What | Committed? |
|---|---|---|
| `GSC-MCP-SETUP.md` | One-time setup walkthrough for the GSC MCP | yes |
| `client_secrets.json` | OAuth credentials from Google Cloud Console | **no — gitignored** |
| `token.json` | Cached OAuth token created on first auth | **no — gitignored** |
| `gsc-export-YYYY-MM-DD.csv` | Curated GSC top-query exports (manual or MCP-pulled) | **no — gitignored by default** |
| `keyword-positions-YYYY-MM-DD.md` | Synthesized keyword positions (markdown summary) | yes — curated snapshots only |

## Workflow once the MCP is configured

1. The `suganthan-gsc-mcp` server runs locally on V's machine via the
   `~/.claude/` MCP config (see `GSC-MCP-SETUP.md`).
2. During an active Claude Code session, the `seo-specialist` agent can
   ask Claude (via the MCP) for live GSC data — top queries, position
   changes, click-through rates, page-level performance.
3. For pieces of analysis that should persist, the seo-specialist
   writes a synthesized markdown report into this directory (e.g.,
   `keyword-positions-2026-05-14.md`). Raw exports stay gitignored.
4. The `seo-audit-execution` skill (`.claude/skills/seo-audit-execution/SKILL.md`)
   §5 documents the MCP tool names and recommended queries.

## Manual export fallback

If the MCP is unavailable (e.g., off-network, OAuth token expired,
running on a fresh machine), V can manually export from the GSC web UI:

1. https://search.google.com/search-console → property neurowiki.ai
2. **Performance → Search results** → set date range → **EXPORT → CSV**
3. Drop the CSV here as `gsc-export-YYYY-MM-DD.csv` (gitignored)
4. Tell Claude: "GSC export landed in docs/seo-data/, parse it"
5. seo-specialist reads the file and synthesizes findings into a
   markdown report committed alongside

## Refresh cadence

- **Live data via MCP** — during active SEO work sessions
- **Manual export** — at minimum monthly; more frequently after any
  ranking-affecting change (e.g., the 2026-05-13 sitemap fix should
  show indexing recovery within 7-14 days)
- **Synthesized markdown reports** — committed quarterly or when a
  notable shift is observed

## Privacy note

GSC data is V's own property analytics. It does not contain PHI. It
may contain user search queries which are not PII per Google's privacy
controls (aggregated, low-volume queries suppressed by GSC). Still,
treat raw exports as private data and let the gitignore keep them out
of the repo.
