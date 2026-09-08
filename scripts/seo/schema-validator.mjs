#!/usr/bin/env node
// NeuroWiki SEO, Schema Validator
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); URL list and
// host from config.mjs.
//
// Fetches each representative URL, parses every JSON-LD block in the HTML,
// and validates the basic structure. Catches malformed structured data
// before GSC starts reporting "Invalid FAQPage" warnings.
//
// Light validation only (not a full Schema.org checker):
//   - Is it valid JSON?
//   - Does it have @context (schema.org)?
//   - Does it have a recognized @type?
//   - For specific types, does it have required fields?
//
// Usage:
//   node scripts/seo/schema-validator.mjs
//   node scripts/seo/schema-validator.mjs /pathways/stroke-code   # single URL
//
// Exit codes: 0 = all clean, 1 = warnings (findings), 2 = setup error.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './config.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = SITE.baseUrl;

const singleUrl = process.argv[2];
const targets = singleUrl
  ? [singleUrl.startsWith('/') ? singleUrl : `/${singleUrl}`]
  : SITE.schemaCheckUrls;

const KNOWN_TYPES = [
  'Organization',
  'MedicalOrganization',
  'WebSite',
  'WebPage',
  'MedicalWebPage',
  'Article',
  'BlogPosting',
  'BreadcrumbList',
  'FAQPage',
  'MedicalService',
  'Service',
  'Physician',
  'SiteNavigationElement',
  'WebApplication',
  'SoftwareApplication',
  'MedicalRiskCalculator',
  'MedicalScholarlyArticle',
  'MedicalCondition',
  'ItemList',
  'CollectionPage',
  'Dataset',
];

const REQUIRED_FIELDS = {
  BreadcrumbList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  Article: ['headline', 'author'],
  BlogPosting: ['headline', 'author'],
  Organization: ['name'],
  MedicalOrganization: ['name'],
  Physician: ['name'],
  MedicalService: ['name'],
  WebApplication: ['name'],
  SoftwareApplication: ['name'],
};

// ─── Validate one URL ──────────────────────────────────────────────────

async function validateUrl(path) {
  const url = `${BASE}${path === '/' ? '' : path}` || BASE;
  const findings = [];
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return { url: path, findings: [{ level: 'ERROR', msg: `HTTP ${r.status} fetching the page` }] };
    }
    const html = await r.text();
    const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    const blocks = [];
    for (const m of jsonLdMatches) {
      blocks.push(m[1].trim());
    }

    if (blocks.length === 0) {
      findings.push({ level: 'WARN', msg: 'No JSON-LD blocks found on page' });
      return { url: path, blockCount: 0, findings };
    }

    let i = 0;
    for (const blockText of blocks) {
      i++;
      try {
        const parsed = JSON.parse(blockText);
        const top = Array.isArray(parsed) ? parsed : [parsed];
        // NeuroWiki nests entities in @graph: @context sits on the wrapper,
        // @type on each node. Validate the nodes, inheriting the wrapper's
        // context (the Tidbit original predates @graph usage).
        const items = top.flatMap((it) =>
          Array.isArray(it['@graph'])
            ? it['@graph'].map((node) => ({ '@context': it['@context'], ...node }))
            : [it]
        );
        for (const item of items) {
          const type = item['@type'];
          const context = item['@context'];
          const typeLabel = Array.isArray(type) ? type.join('/') : type;
          if (!context || !String(context).toLowerCase().includes('schema.org')) {
            findings.push({ level: 'WARN', msg: `Block ${i} (${typeLabel}): missing or invalid @context` });
          }
          if (!type) {
            findings.push({ level: 'WARN', msg: `Block ${i}: no @type field` });
            continue;
          }
          const typeStr = Array.isArray(type) ? type[0] : type;
          if (!KNOWN_TYPES.includes(typeStr)) {
            findings.push({ level: 'INFO', msg: `Block ${i}: unrecognized @type "${typeStr}"` });
          }
          const required = REQUIRED_FIELDS[typeStr] ?? [];
          for (const field of required) {
            if (!(field in item)) {
              findings.push({ level: 'WARN', msg: `Block ${i} (${typeStr}): missing required field "${field}"` });
            }
          }
        }
      } catch (e) {
        findings.push({ level: 'ERROR', msg: `Block ${i}: invalid JSON (${e.message})` });
      }
    }
    return { url: path, blockCount: blocks.length, findings };
  } catch (e) {
    return { url: path, findings: [{ level: 'ERROR', msg: `Fetch failed: ${e.message}` }] };
  }
}

// ─── Run ────────────────────────────────────────────────────────────────

console.log(`\n${SITE.name} Schema Validator`);
console.log(`Checking ${targets.length} URL${targets.length === 1 ? '' : 's'}...\n`);

const results = [];
for (const path of targets) {
  process.stdout.write(`  ${path} ... `);
  const r = await validateUrl(path);
  results.push(r);
  const errCount = r.findings.filter((f) => f.level === 'ERROR').length;
  const warnCount = r.findings.filter((f) => f.level === 'WARN').length;
  if (errCount > 0) process.stdout.write(`ERROR (${errCount} err, ${warnCount} warn)\n`);
  else if (warnCount > 0) process.stdout.write(`WARN (${warnCount} warn, ${r.blockCount ?? 0} blocks)\n`);
  else process.stdout.write(`OK (${r.blockCount ?? 0} blocks)\n`);
  await new Promise((res) => setTimeout(res, 150));
}

const totalErrors = results.reduce((s, r) => s + r.findings.filter((f) => f.level === 'ERROR').length, 0);
const totalWarns = results.reduce((s, r) => s + r.findings.filter((f) => f.level === 'WARN').length, 0);
const totalInfo = results.reduce((s, r) => s + r.findings.filter((f) => f.level === 'INFO').length, 0);

console.log(`\nFound: errors=${totalErrors} warnings=${totalWarns} info=${totalInfo}\n`);

if (totalErrors > 0 || totalWarns > 0) {
  for (const r of results) {
    const issues = r.findings.filter((f) => f.level !== 'INFO');
    if (issues.length === 0) continue;
    console.log(`── ${r.url} ──`);
    for (const f of issues) console.log(`  [${f.level}] ${f.msg}`);
    console.log('');
  }
}

// ─── Markdown report ───────────────────────────────────────────────────

const datestamp = new Date().toISOString().slice(0, 10);
const md = [`# Schema Validator, ${datestamp}`, ``];
md.push(`**URLs checked:** ${results.length}`);
md.push(`**Errors:** ${totalErrors} | **Warnings:** ${totalWarns} | **Info:** ${totalInfo}`);
md.push(``, `---`, ``);

for (const r of results) {
  const ok = r.findings.length === 0;
  md.push(`## \`${r.url}\` (${r.blockCount ?? 0} JSON-LD blocks)`, ``);
  if (ok) {
    md.push(`Clean.`, ``);
  } else {
    md.push(`| Level | Message |`);
    md.push(`|---|---|`);
    for (const f of r.findings) md.push(`| ${f.level} | ${f.msg} |`);
    md.push(``);
  }
}

const docsDir = join(repoRoot, 'docs', 'seo', 'schema-validator');
await mkdir(docsDir, { recursive: true });
await writeFile(join(repoRoot, 'docs', 'seo', 'schema-validator-latest.md'), md.join('\n'));
await writeFile(join(docsDir, `${datestamp}.md`), md.join('\n'));

console.log(`Markdown report: docs/seo/schema-validator-latest.md`);

if (totalErrors > 0) process.exit(1);
if (totalWarns > 0) process.exit(1);
process.exit(0);
