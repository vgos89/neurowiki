// One-off codemod: strip unused `React` default imports.
//
// tsconfig has "jsx": "react-jsx" (automatic runtime), so `import React from 'react'`
// is unnecessary unless the file references the `React` namespace explicitly
// (React.FC, React.ReactNode, etc.). The files listed below were flagged by
// `tsc --noUnusedLocals` as declaring `React` but never reading it — confirmed
// safe to remove.
//
// Two import shapes are handled:
//   `import React from 'react';`            → delete the whole line
//   `import React, { a, b } from 'react';`  → `import { a, b } from 'react';`
//
// Usage: node scripts/codemod-strip-unused-react-import.mjs [--dry]
// Idempotent: a file with no unused React import is left untouched.

import { readFileSync, writeFileSync } from 'node:fs';

const dry = process.argv.slice(2).includes('--dry');

// Files where tsc flagged `React` as a declared-but-unused import.
const FILES = [
  'src/components/article/stroke/HemorrhageProtocolModal.tsx',
  'src/components/article/stroke/OrolingualEdemaProtocolModal.tsx',
  'src/components/article/stroke/TpaReversalProtocolModal.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/pathways/PathwaysHero.tsx',
  'src/components/pathways/ScenarioPillRow.tsx',
  'src/components/pathways/ScenarioSection.tsx',
  'src/components/trials/MarkdownSection.tsx',
  'src/components/trials/RelatedTrialsSidebar.tsx',
  'src/components/trials/TrialHeaderBar.tsx',
  'src/components/trials/TrialTitleHeading.tsx',
  'src/components/ui/Toggle.tsx',
  'src/pages/Calculators.tsx',
  'src/pages/Guide.tsx',
  'src/pages/Pathways.tsx',
  'src/pages/guide/AcuteStrokeMgmt.tsx',
  'src/pages/guide/AlteredMentalStatus.tsx',
  'src/pages/guide/Gbs.tsx',
  'src/pages/guide/HeadacheWorkup.tsx',
  'src/pages/guide/IchManagement.tsx',
  'src/pages/guide/IvTpa.tsx',
  'src/pages/guide/Meningitis.tsx',
  'src/pages/guide/MultipleSclerosis.tsx',
  'src/pages/guide/MyastheniaGravis.tsx',
  'src/pages/guide/SeizureWorkup.tsx',
  'src/pages/guide/StatusEpilepticus.tsx',
  'src/pages/guide/StrokeBasics.tsx',
  'src/pages/guide/Thrombectomy.tsx',
  'src/pages/guide/Vertigo.tsx',
  'src/pages/guide/WeaknessWorkup.tsx',
];

let changed = 0;
for (const file of FILES) {
  let src;
  try {
    src = readFileSync(file, 'utf8');
  } catch {
    console.warn(`[codemod] skip (not found): ${file}`);
    continue;
  }
  const before = src;
  // Shape 2: combined import — drop only the `React, ` prefix, keep named bindings.
  src = src.replace(/^import React,\s*\{/m, 'import {');
  // Shape 1: standalone default import — remove the whole line.
  src = src.replace(/^import React from ['"]react['"];\n/m, '');
  if (src !== before) {
    changed++;
    if (!dry) writeFileSync(file, src, 'utf8');
    console.log(`[codemod] ${dry ? 'would strip' : 'stripped'} React import: ${file}`);
  } else {
    console.log(`[codemod] no change: ${file}`);
  }
}
console.log(`[codemod] files changed: ${changed}${dry ? ' (dry run)' : ''}`);
