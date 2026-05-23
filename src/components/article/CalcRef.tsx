import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CalcRef — inline link to a calculator from guide-page prose.
 *
 * Companion to <Trial> (../article/Trial.tsx). Mirrors that component's
 * visual treatment (neuro-* underline) and behavior (auto-derive path
 * from name OR accept explicit path).
 *
 * Use:
 *   <CalcRef name="NIHSS" path="/calculators/nihss">NIHSS</CalcRef>
 *   <CalcRef name="ASPECTS">the ASPECTS calculator</CalcRef>
 *
 * Auto-derived path takes the lowercased name with spaces stripped:
 *   "ASPECTS" → /calculators/aspects
 *   "ABCD²" → /calculators/abcd  (use explicit path for tricky names)
 *
 * The calculator slugs in routeManifest.ts may differ from the natural
 * name (eg "aspects-score" rather than "aspects"). When the auto-derived
 * path would be wrong, pass an explicit `path` prop.
 */

interface CalcRefProps {
  /** Display name; also drives auto-derived path when `path` is omitted. */
  name: string;
  /** Override the auto-derived URL. Use when the slug doesn't match the
   *  lowercased name (eg ASPECTS calculator slug is `aspects-score`). */
  path?: string;
  /** Optional inline children that override the visible link text. */
  children?: React.ReactNode;
}

export const CalcRef: React.FC<CalcRefProps> = ({ name, path, children }) => {
  const calcPath =
    path ||
    `/calculators/${name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')}`;

  return (
    <Link
      to={calcPath}
      className="text-neuro-700 dark:text-neuro-300 hover:text-neuro-900 dark:hover:text-neuro-100 underline decoration-neuro-200 dark:decoration-neuro-700 decoration-1 underline-offset-2 hover:decoration-neuro-500 font-medium transition-colors"
    >
      {children ?? name}
    </Link>
  );
};

export default CalcRef;
