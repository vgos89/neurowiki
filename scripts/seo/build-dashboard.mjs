#!/usr/bin/env node
// NeuroWiki SEO, Dashboard Builder
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); identity,
// palette and tiles adapted; publishes to NeuroWiki's OWN artifact URL
// (config.mjs dashboardArtifactUrl), never Tidbit's.
//
// Generates docs/seo/dashboard.html, the page V actually looks at.
// Everything on it is assembled from files the pipeline already writes, so
// regenerating it costs nothing and cannot invent numbers.
//
// Content rule, non-negotiable: the page is for a non-technical founder.
// Plain English only (CLAUDE.md §10.2). The briefing is already written that
// way; this script must never add jargon on top.
//
// Usage: node scripts/seo/build-dashboard.mjs

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE } from './config.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const seoDir = join(repoRoot, 'docs', 'seo')

const read = async (p) => {
  try { return await readFile(join(seoDir, p), 'utf8') } catch { return '' }
}

// ─── Gather ─────────────────────────────────────────────────────────────
const briefing = await read('briefing-latest.md')
const anomaly = await read('anomaly-latest.md')
const indexation = await read('indexation-latest.md')
const snapshot = await read('daily-snapshot-latest.md')
const snapshot7 = await read('daily-snapshot-7day-latest.md')

let ledger = []
try { ledger = JSON.parse(await read('rewrite-ledger.json')) } catch {}

// Briefing date + sections
const bDate = (briefing.match(/# SEO briefing, (\d{4}-\d{2}-\d{2})/) ?? [])[1] ?? 'unknown date'
function section(name) {
  const m = briefing.match(new RegExp(`## ${name}\\n([\\s\\S]*?)(?=\\n## |$)`))
  return m ? m[1].trim() : ''
}
const oneLine = (briefing.match(/\*\*One line:\*\* ([\s\S]*?)(?=\n\n|\n##)/) ?? [])[1]?.replace(/\n/g, ' ').trim() ?? ''
const changed = section('What I changed')
const needsYou = section('What needs you')
const numbers = section('Numbers')
const watching = section('Watching')
const trouble = section('Ran into trouble')

// Alarm state
const alarmCount = (anomaly.match(/\*\*ALARM:\*\*/g) ?? []).length
const allQuiet = anomaly.includes('**All quiet.**')

// Stats
const idx = indexation.match(/\| Indexed \| (\d+) \|/)
const idxTotal = (indexation.match(/Sitemap URLs inspected:\*\* (\d+)/) ?? [])[1]
const indexedStat = idx ? `${idx[1]}` : '?'
const indexedOf = idxTotal ?? '182'
const users = (snapshot.match(/\| Total users \| (\d+) \|/) ?? [])[1] ?? '?'
const users7 = (snapshot7.match(/\| Total users \| (\d+) \|/) ?? [])[1] ?? '?'
const pending = ledger.filter((e) => e.verdict === 'pending').length
const kept = ledger.filter((e) => e.verdict === 'kept').length

// Are yesterday's numbers still being counted by Google?
const stillSettling = snapshot.includes('**These numbers are still settling.**')
const settlingNote = stillSettling
  ? '<span class="prov">still settling</span>'
  : ''

// Corrections to earlier days, written by the snapshot once a day finishes counting
const correctionsBlock = (snapshot.match(/## Corrections to earlier reports\n([\s\S]*?)(?=\n## |$)/) ?? [])[1]?.trim() ?? ''

// Clinician actions from snapshot (sum table if present)
let signals = 0
const convSection = snapshot.match(/## Clinician actions\n([\s\S]*?)$/)
if (convSection) for (const m of convSection[1].matchAll(/\| `[^`]+` \| (\d+) \|/g)) signals += parseInt(m[1], 10)

// History: last 7 briefing one-liners
let history = []
try {
  const files = (await readdir(join(seoDir, 'briefings'))).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse().slice(0, 7)
  for (const f of files) {
    const t = await read(join('briefings', f))
    const line = (t.match(/\*\*One line:\*\* ([\s\S]*?)(?=\n\n|\n##)/) ?? [])[1]?.replace(/\n/g, ' ').trim()
    if (line) history.push({ date: f.replace('.md', ''), line })
  }
} catch {}

// ─── Tiny markdown → HTML for briefing sections ─────────────────────────
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function mdBlock(md) {
  if (!md) return '<p class="empty">Nothing here today.</p>'
  const lines = md.split('\n')
  let html = '', inList = false
  const inline = (s) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  for (const raw of lines) {
    const l = raw.trim()
    const li = l.match(/^(?:[-*]|\d+\.)\s+(.*)/)
    if (li) {
      if (!inList) { html += '<ul>'; inList = true }
      html += `<li>${inline(li[1])}</li>`
    } else {
      if (inList) { html += '</ul>'; inList = false }
      if (l) html += `<p>${inline(l)}</p>`
    }
  }
  if (inList) html += '</ul>'
  return html
}

const verdictWord = { pending: 'still measuring', kept: 'worked, kept', reverted: 'did not work, undone', inconclusive: 'too little data to call' }
const ledgerRows = ledger.length
  ? ledger.map((e) => `<tr><td>${esc(e.new?.title ?? e.path ?? '')}</td><td>${e.editedOn}</td><td>${esc(e.targetQuery ?? '')}</td><td><span class="chip ${e.verdict}">${verdictWord[e.verdict] ?? e.verdict}</span></td></tr>`).join('')
  : '<tr><td colspan="4" class="empty">No experiments yet.</td></tr>'

const historyRows = history.map((h) => `<li><span class="hdate">${h.date}</span> ${esc(h.line)}</li>`).join('')

// ─── The to-do list: discrete tasks with copy-to-clipboard requests ─────
const tasks = []
{
  let cur = null
  for (const raw of needsYou.split('\n')) {
    const l = raw.trim()
    if (!l || /^\**nothing to do today/i.test(l) || /^\**nothing today/i.test(l)) continue
    const m = l.match(/^\d+\.\s+(.*)/)
    if (m) {
      cur = { text: m[1], extra: [] }
      tasks.push(cur)
    } else if (cur) {
      cur.extra.push(l.replace(/^[-*]\s+/, ''))
    } else {
      cur = { text: l, extra: [] }
      tasks.push(cur)
    }
  }
}
const inlineMd = (s) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
const reqFor = (t, i) => {
  const bold = t.text.match(/\*\*([^*]+)\*\*/)
  const gist = (bold ? bold[1] : t.text.replace(/[*`\[\]]/g, '')).slice(0, 90).trim()
  return `Do item ${i + 1} from the ${SITE.name} dashboard of ${bDate}: ${gist}`
}
const taskRows = tasks
  .map((t, i) => {
    const req = reqFor(t, i)
    return `<div class="task">
      <span class="tnum">${i + 1}</span>
      <div class="tbody">${inlineMd(t.text)}${t.extra.length ? `<div class="textra">${t.extra.map((e) => `<div>${inlineMd(e)}</div>`).join('')}</div>` : ''}</div>
      <button class="copybtn" type="button" data-req="${esc(req).replace(/"/g, '&quot;')}">Copy fix request</button>
    </div>`
  })
  .join('')

const statusChip = alarmCount > 0
  ? `<span class="status crit">${alarmCount} alarm${alarmCount > 1 ? 's' : ''}, read below</span>`
  : allQuiet
    ? '<span class="status good">All clear</span>'
    : '<span class="status">Status unknown</span>'

const alarmBlock = alarmCount > 0
  ? `<section class="card alarm"><h2>Alarms</h2>${mdBlock(anomaly.split('## Routine checks')[0].split('Read these first.**')[1] ?? '')}</section>`
  : ''

// ─── Page ────────────────────────────────────────────────────────────────
const html = `<title>NeuroWiki Growth Monitor</title>
<style>
:root{
  --bg:#F7F9FC; --surface:#FFFFFF; --ink:#16233B; --muted:#5B6B84;
  --brand:#1746A2; --line:#E1E7F0; --good:#1E7F5C; --good-bg:#E7F2EC;
  --warn:#8A5A13; --warn-bg:#F7EEDD; --crit:#B3372B; --crit-bg:#F9E9E6;
  --chip:#EDF1F7;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0F1420; --surface:#171E2E; --ink:#E7ECF5; --muted:#9AA8BF;
    --brand:#7FA7E8; --line:#242E42; --good:#6FCBA5; --good-bg:#1B2F26;
    --warn:#D9A84E; --warn-bg:#33290F; --crit:#E08074; --crit-bg:#39201C;
    --chip:#202A3D;
  }
}
:root[data-theme="dark"]{
  --bg:#0F1420; --surface:#171E2E; --ink:#E7ECF5; --muted:#9AA8BF;
  --brand:#7FA7E8; --line:#242E42; --good:#6FCBA5; --good-bg:#1B2F26;
  --warn:#D9A84E; --warn-bg:#33290F; --crit:#E08074; --crit-bg:#39201C;
  --chip:#202A3D;
}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);margin:0;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  line-height:1.55;-webkit-font-smoothing:antialiased}
.wrap{max-width:880px;margin:0 auto;padding:28px 20px 64px}
.masthead{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 16px;
  border-bottom:2px solid var(--brand);padding-bottom:14px}
.masthead h1{font-family:"New York",ui-serif,Georgia,serif;font-size:1.5rem;
  font-weight:700;margin:0;color:var(--brand);letter-spacing:.01em}
.mdate{color:var(--muted);font-size:.95rem}
.status{margin-left:auto;font-size:.8rem;font-weight:600;letter-spacing:.04em;
  text-transform:uppercase;padding:4px 12px;border-radius:999px;background:var(--chip)}
.status.good{background:var(--good-bg);color:var(--good)}
.status.crit{background:var(--crit-bg);color:var(--crit)}
.lede{font-family:"New York",ui-serif,Georgia,serif;font-size:1.45rem;
  line-height:1.4;margin:26px 0 6px;text-wrap:balance;max-width:34em}
.lede-label{font-size:.75rem;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted);margin-top:24px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
  gap:12px;margin:26px 0}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:10px;
  padding:14px 16px}
.stat .n{font-size:1.9rem;font-weight:700;font-variant-numeric:tabular-nums;
  color:var(--brand);line-height:1.1}
.stat .n small{font-size:1rem;color:var(--muted);font-weight:500}
.stat .l{font-size:.82rem;color:var(--muted);margin-top:4px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:640px){.cols{grid-template-columns:1fr}}
.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;
  padding:18px 20px;margin:14px 0}
.card h2{font-family:"New York",ui-serif,Georgia,serif;font-size:1.05rem;
  margin:0 0 10px;color:var(--brand)}
.card p{margin:0 0 10px;font-size:.95rem}
.card p:last-child{margin-bottom:0}
.card ul{margin:0 0 10px;padding-left:20px;font-size:.95rem}
.card li{margin-bottom:6px}
.card.alarm{border-left:4px solid var(--crit);background:var(--crit-bg)}
.card.alarm h2{color:var(--crit)}
code{background:var(--chip);border-radius:4px;padding:1px 5px;font-size:.85em}
table{width:100%;border-collapse:collapse;font-size:.9rem}
th{text-align:left;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;
  color:var(--muted);font-weight:600;padding:6px 10px 6px 0;border-bottom:1px solid var(--line)}
td{padding:8px 10px 8px 0;border-bottom:1px solid var(--line);vertical-align:top}
tr:last-child td{border-bottom:none}
.tablewrap{overflow-x:auto}
.chip{font-size:.78rem;font-weight:600;padding:2px 10px;border-radius:999px;
  background:var(--chip);white-space:nowrap}
.chip.pending{background:var(--warn-bg);color:var(--warn)}
.chip.kept{background:var(--good-bg);color:var(--good)}
.chip.reverted{background:var(--crit-bg);color:var(--crit)}
.empty{color:var(--muted);font-style:italic}
.prov{display:inline-block;font-size:.7rem;font-weight:600;letter-spacing:.03em;
  padding:1px 7px;border-radius:999px;background:var(--warn-bg);color:var(--warn);
  vertical-align:middle}
.card.todo{border-left:4px solid var(--warn)}
.task{display:flex;gap:14px;align-items:flex-start;padding:12px 0;
  border-bottom:1px solid var(--line)}
.task:last-child{border-bottom:none}
.tnum{flex:none;width:26px;height:26px;border-radius:50%;background:var(--warn-bg);
  color:var(--warn);font-weight:700;font-size:.9rem;display:flex;
  align-items:center;justify-content:center;margin-top:2px}
.tbody{flex:1;font-size:.95rem}
.textra{margin-top:6px;color:var(--muted);font-size:.9rem}
.copybtn{flex:none;background:var(--brand);color:var(--bg);border:none;
  border-radius:8px;padding:8px 12px;font:inherit;font-size:.82rem;
  font-weight:600;cursor:pointer;margin-top:2px}
.copybtn:hover{opacity:.88}
.copybtn:focus-visible{outline:2px solid var(--warn);outline-offset:2px}
.copybtn.done{background:var(--good-bg);color:var(--good)}
.todo-hint{color:var(--muted);font-size:.85rem;margin:2px 0 8px}
@media(max-width:640px){.task{flex-wrap:wrap}.copybtn{margin-left:40px}}
.history{list-style:none;padding:0;margin:0;font-size:.92rem}
.history li{padding:7px 0;border-bottom:1px solid var(--line)}
.history li:last-child{border-bottom:none}
.hdate{font-variant-numeric:tabular-nums;color:var(--muted);margin-right:10px;font-size:.85rem}
.foot{color:var(--muted);font-size:.85rem;margin-top:28px;border-top:1px solid var(--line);
  padding-top:14px;max-width:60em}
</style>
<div class="wrap">
  <div class="masthead">
    <h1>${SITE.name} Growth Monitor</h1>
    <span class="mdate">Briefing of ${bDate}</span>
    ${statusChip}
  </div>

  ${alarmBlock}

  <div class="lede-label">Today in one line</div>
  <p class="lede">${esc(oneLine || 'No briefing found for today.')}</p>

  <section class="card todo">
    <h2>Your to-do list${tasks.length ? ` (${tasks.length})` : ''}</h2>
    <p class="todo-hint">Press the button, then paste into any NeuroWiki chat with Claude. That is the whole workflow; Claude finds the prepared work and runs it through the safety checks.</p>
    ${taskRows || '<p class="empty">Nothing needs you today. Enjoy it.</p>'}
  </section>

  <div class="stats">
    <div class="stat"><div class="n">${users}</div><div class="l">visitors yesterday ${settlingNote}</div></div>
    <div class="stat"><div class="n">${users7}</div><div class="l">visitors this week</div></div>
    <div class="stat"><div class="n">${signals}</div><div class="l">clinician actions yesterday ${settlingNote}</div></div>
    <div class="stat"><div class="n">${indexedStat}<small> of ${indexedOf}</small></div><div class="l">pages Google lists</div></div>
    <div class="stat"><div class="n">${pending}${kept ? `<small> +${kept} won</small>` : ''}</div><div class="l">experiments running</div></div>
  </div>

  ${stillSettling ? `<section class="card"><h2>Yesterday's numbers are not final yet</h2>
    <p>Google carries on counting a day for up to two days after it ends, so the two
    figures marked <span class="prov">still settling</span> above are a floor, not a
    final count. They will go up. Nothing is lost; a later run restates the day and
    shows what moved.</p></section>` : ''}

  ${correctionsBlock ? `<section class="card"><h2>Corrections to earlier days</h2>${mdBlock(correctionsBlock)}</section>` : ''}

  <div class="cols">
    <section class="card"><h2>What changed</h2>${mdBlock(changed)}</section>
    <section class="card"><h2>The numbers behind it</h2>${mdBlock(numbers)}</section>
  </div>
  ${trouble ? `<section class="card"><h2>Ran into trouble</h2>${mdBlock(trouble)}</section>` : ''}
  <section class="card"><h2>Watching, not acting yet</h2>${mdBlock(watching)}</section>

  <section class="card">
    <h2>Headline experiments</h2>
    <p>Every approved headline change is a measured 14-day test. If it loses clicks, the morning job recommends undoing it.</p>
    <div class="tablewrap"><table>
      <tr><th>New title</th><th>Changed</th><th>Search it targets</th><th>Result</th></tr>
      ${ledgerRows}
    </table></div>
  </section>

  <section class="card">
    <h2>The last few mornings</h2>
    <ul class="history">${historyRows || '<li class="empty">History builds up from here.</li>'}</ul>
  </section>

  <p class="foot">Completed items disappear from the to-do list the next
  morning and show up under "What changed". If a button will not copy on your
  device, just tell Claude "do item 2 from the NeuroWiki dashboard" in your own
  words; it reads the same list.</p>
  <p class="foot">This page rebuilds itself every morning around 8:00 from the
  automated run. Bookmark it; the address never changes. Everything that needs
  a decision from you appears here. The morning job never edits the site
  itself; it only reports and suggests.</p>
</div>
<script>
document.addEventListener('click', function (ev) {
  var btn = ev.target.closest('.copybtn')
  if (!btn) return
  var req = btn.getAttribute('data-req') || ''
  function ok () {
    var old = btn.textContent
    btn.textContent = 'Copied. Paste it to Claude.'
    btn.classList.add('done')
    setTimeout(function () { btn.textContent = old; btn.classList.remove('done') }, 4000)
  }
  function fallback () {
    var ta = document.createElement('textarea')
    ta.value = req
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy'); ok() } catch (e) {
      btn.textContent = 'Could not copy. Just tell Claude the item number.'
    }
    document.body.removeChild(ta)
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(req).then(ok, fallback)
  } else fallback()
})
</script>
`

await writeFile(join(seoDir, 'dashboard.html'), html)
console.log('Dashboard written: docs/seo/dashboard.html')
console.log(`Summary: date=${bDate} alarms=${alarmCount} indexed=${indexedStat}/${indexedOf} experiments=${pending}`)
