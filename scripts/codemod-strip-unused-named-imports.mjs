// One-off codemod: strip specific unused NAMED imports flagged by tsc --noUnusedLocals.
//
// Each entry is (file, member, fromModule). The codemod locates the
// `import { … } from '<fromModule>'` statement (single- or multi-line) and removes
// only the named `member` from it, leaving every other binding intact. If removing
// the member empties the import, the whole statement is deleted.
//
// Scoping to the matched import statement avoids touching same-named usages
// elsewhere in the file (e.g. a <Zap/> element vs the `Zap` import).
//
// Usage: node scripts/codemod-strip-unused-named-imports.mjs [--dry]

import { readFileSync, writeFileSync } from 'node:fs';

const dry = process.argv.slice(2).includes('--dry');

const TARGETS = [
  ['src/pages/guide/Gbs.tsx', 'SubSection', '../../components/article'],
  ['src/pages/guide/AlteredMentalStatus.tsx', 'SubSection', '../../components/article'],
  ['src/pages/guide/AlteredMentalStatus.tsx', 'Value', '../../components/article'],
  ['src/pages/guide/HeadacheWorkup.tsx', 'SubSection', '../../components/article'],
  ['src/pages/guide/Meningitis.tsx', 'SubSection', '../../components/article'],
  ['src/pages/guide/MultipleSclerosis.tsx', 'Critical', '../../components/article'],
  ['src/pages/guide/SeizureWorkup.tsx', 'SubSection', '../../components/article'],
  ['src/pages/guide/SeizureWorkup.tsx', 'Value', '../../components/article'],
  ['src/pages/guide/Vertigo.tsx', 'SubSection', '../../components/article'],
  ['src/pages/guide/Vertigo.tsx', 'Value', '../../components/article'],
  ['src/pages/guide/WeaknessWorkup.tsx', 'SubSection', '../../components/article'],
  ['src/pages/guide/WeaknessWorkup.tsx', 'Critical', '../../components/article'],
  ['src/pages/guide/WeaknessWorkup.tsx', 'Value', '../../components/article'],
  ['src/pages/EvtPathway.tsx', 'Zap', 'lucide-react'],
  ['src/pages/ResidentGuide.tsx', 'Stethoscope', 'lucide-react'],
  ['src/pages/ResidentGuide.tsx', 'Link as LinkIcon', 'lucide-react'],
  ['src/internalLinks/autoLink.tsx', 'LinkItem', './registry'],
  ['src/pages/ElanPathway.tsx', 'ELAN_CONTENT', '../data/toolContent'],
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let changed = 0;
for (const [file, member, mod] of TARGETS) {
  let src = readFileSync(file, 'utf8');
  const before = src;

  // Match the import statement importing from `mod` (single- or multi-line brace block).
  const importRe = new RegExp(`import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['"]${esc(mod)}['"];`, 'm');
  const m = src.match(importRe);
  if (!m) {
    console.warn(`[codemod] ${file}: no import from '${mod}' found — skip ${member}`);
    continue;
  }
  const body = m[1];
  // Split members, drop the target, rebuild preserving original whitespace style.
  const isMultiline = body.includes('\n');
  const members = body
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (!members.includes(member)) {
    console.warn(`[codemod] ${file}: '${member}' not a member of import from '${mod}' — skip`);
    continue;
  }
  const kept = members.filter((s) => s !== member);
  let replacement;
  if (kept.length === 0) {
    replacement = ''; // remove whole statement
  } else if (isMultiline) {
    replacement = `import {\n${kept.map((k) => `  ${k},`).join('\n')}\n} from '${mod}';`;
  } else {
    replacement = `import { ${kept.join(', ')} } from '${mod}';`;
  }
  src = src.replace(importRe, replacement);
  // Clean a possible orphan blank line left by a whole-statement removal.
  if (kept.length === 0) src = src.replace(/^\n(?=\n)/m, '');

  if (src !== before) {
    changed++;
    if (!dry) writeFileSync(file, src, 'utf8');
    console.log(`[codemod] ${dry ? 'would strip' : 'stripped'} '${member}' from ${file}`);
  }
}
console.log(`[codemod] edits applied: ${changed}${dry ? ' (dry run)' : ''}`);
