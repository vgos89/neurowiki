// Accessibility Statement — NeuroWiki
// WCAG 2.1 AA commitment, known implementations, contact for issues.
// Last reviewed: 2026-05-13

import React from 'react';
import { Link } from 'react-router-dom';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
      {title}
    </h2>
    <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

const CheckItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-2">
    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
    <span>{children}</span>
  </li>
);

export default function AccessibilityPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium text-neuro-500 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">Accessibility Statement</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: May 13, 2026</p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          NeuroWiki is built for clinicians in high-pressure environments. Accessibility is not an
          afterthought — a tool that fails clinicians with disabilities or in difficult conditions
          fails everyone. Our target is WCAG 2.1 Level AA compliance across all surfaces.
        </p>
      </div>

      <Section title="Our commitment">
        <p>
          We are committed to making NeuroWiki accessible to all users, including those using
          assistive technology such as screen readers, keyboard-only navigation, or voice control.
          Our target standard is the{' '}
          <a
            href="https://www.w3.org/TR/WCAG21/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neuro-500 hover:underline"
          >
            Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
          </a>
          .
        </p>
      </Section>

      <Section title="What we have implemented">
        <ul className="space-y-2.5 mt-1">
          <CheckItem>
            <strong>Skip link</strong> — A "Skip to main content" link is the first focusable element
            on every page, allowing keyboard users to bypass navigation.
          </CheckItem>
          <CheckItem>
            <strong>ARIA roles on calculators</strong> — All scoring item groups use{' '}
            <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">role="radiogroup"</code> with
            individual options as <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">role="radio"</code>{' '}
            and <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">aria-checked</code>. Score
            totals use <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">aria-live="polite"</code>{' '}
            so screen readers announce changes.
          </CheckItem>
          <CheckItem>
            <strong>Modal focus management</strong> — All modals and drawers trap focus within the
            dialog, return focus to the trigger element on close, and are closed with the Escape key.
            They carry <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">role="dialog"</code>{' '}
            and <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">aria-modal="true"</code>.
          </CheckItem>
          <CheckItem>
            <strong>Touch targets</strong> — All interactive elements meet a minimum 44×44px touch
            target size, following WCAG 2.5.5 (AAA) and Apple/Google HIG recommendations.
          </CheckItem>
          <CheckItem>
            <strong>Color contrast</strong> — Text meets a minimum 4.5:1 contrast ratio against its
            background. Large text (≥18pt or 14pt bold) meets 3:1.
          </CheckItem>
          <CheckItem>
            <strong>Keyboard navigation</strong> — All interactive controls are reachable and
            operable via keyboard. Focus indicators are visible on all elements.
          </CheckItem>
          <CheckItem>
            <strong>Semantic HTML</strong> — Page regions use landmark roles ({' '}
            <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">&lt;main&gt;</code>,{' '}
            <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">&lt;nav&gt;</code>,{' '}
            <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">&lt;aside&gt;</code>).
            Heading levels are used hierarchically.
          </CheckItem>
          <CheckItem>
            <strong>Dark mode</strong> — Full dark-mode support with contrast ratios maintained in
            both light and dark themes.
          </CheckItem>
        </ul>
      </Section>

      <Section title="Known limitations">
        <p>
          NeuroWiki is actively developed. Some areas are still being brought to full WCAG 2.1 AA
          compliance:
        </p>
        <ul className="list-disc list-inside space-y-1.5 mt-2 text-slate-500 dark:text-slate-400">
          <li>Chart components (trial result visualisations) — text alternatives in progress</li>
          <li>Complex data tables on trial pages — full header association markup planned</li>
        </ul>
        <p className="mt-3">
          If you encounter a specific barrier not listed here, please report it (see below) and we
          will prioritise a fix.
        </p>
      </Section>

      <Section title="Reporting accessibility issues">
        <p>
          If you experience an accessibility barrier on NeuroWiki, we want to know. Please email{' '}
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>{' '}
          with:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>The page or feature where the issue occurs</li>
          <li>A description of the barrier</li>
          <li>Your assistive technology (if applicable)</li>
        </ul>
        <p className="mt-3">
          We aim to respond to accessibility complaints within 5 business days and to resolve
          substantive issues within 30 days.
        </p>
      </Section>

      <Section title="Technical approach">
        <p>
          NeuroWiki is built with React 18, TypeScript, and Tailwind CSS. We use shadcn/ui
          components, which are built on Radix UI — a headless, fully accessible primitive library.
          ARIA patterns follow the{' '}
          <a
            href="https://www.w3.org/WAI/ARIA/apg/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neuro-500 hover:underline"
          >
            ARIA Authoring Practices Guide
          </a>
          .
        </p>
      </Section>

      {/* Footer nav */}
      <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 text-xs text-slate-400">
        <Link to="/privacy" className="hover:text-neuro-500 transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-neuro-500 transition-colors">Terms of Use</Link>
        <Link to="/" className="hover:text-neuro-500 transition-colors">Back to NeuroWiki</Link>
      </div>
    </div>
  );
}
