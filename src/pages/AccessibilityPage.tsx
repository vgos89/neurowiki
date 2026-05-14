// Accessibility Statement — NeuroWiki
// WCAG 2.1 AA commitment, known implementations, contact for issues.
// Last reviewed: 2026-05-13

import React from 'react';
import { Link } from 'react-router-dom';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-100">
      {title}
    </h2>
    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

const CheckItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-2">
    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
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
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Accessibility Statement</h1>
        <p className="text-sm text-slate-500">Last updated: May 13, 2026</p>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          NeuroWiki is used at the bedside, often under pressure. Clinicians who rely on assistive
          technology need a tool that works reliably. Our target is WCAG 2.1 Level AA compliance.
        </p>
      </div>

      <Section title="What we target">
        <p>
          We target the{' '}
          <a
            href="https://www.w3.org/TR/WCAG21/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neuro-500 hover:underline"
          >
            Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
          </a>
          {' '}across all pages. This covers screen reader compatibility, keyboard navigation,
          color contrast, touch target sizing, and focus management.
        </p>
      </Section>

      <Section title="What is implemented">
        <ul className="space-y-2.5 mt-1">
          <CheckItem>
            <strong>Skip link:</strong> the first focusable element on every page. Keyboard users
            can skip directly to main content.
          </CheckItem>
          <CheckItem>
            <strong>ARIA roles on calculators:</strong> scoring item groups use{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">role="radiogroup"</code>.
            Each option carries{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">role="radio"</code>{' '}
            and{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">aria-checked</code>.
            Score totals use{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">aria-live="polite"</code>{' '}
            so screen readers announce updates.
          </CheckItem>
          <CheckItem>
            <strong>Modal focus management:</strong> modals and drawers trap focus, return focus to
            the trigger on close, and respond to Escape. They carry{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">role="dialog"</code>{' '}
            and{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">aria-modal="true"</code>.
          </CheckItem>
          <CheckItem>
            <strong>Touch targets:</strong> all interactive elements are at least 44×44px, meeting
            WCAG 2.5.5.
          </CheckItem>
          <CheckItem>
            <strong>Color contrast:</strong> body text meets 4.5:1. Large text (≥18pt or
            14pt bold) meets 3:1. Both light and dark themes pass.
          </CheckItem>
          <CheckItem>
            <strong>Keyboard navigation:</strong> all controls are reachable and operable by
            keyboard. Focus indicators are visible.
          </CheckItem>
          <CheckItem>
            <strong>Semantic HTML:</strong> landmark roles (
            <code className="bg-slate-100 px-1 rounded text-xs">&lt;main&gt;</code>,{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">&lt;nav&gt;</code>,{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">&lt;aside&gt;</code>)
            on all pages. Heading levels are sequential.
          </CheckItem>
          <CheckItem>
            <strong>Dark mode:</strong> contrast ratios pass in both light and dark themes.
          </CheckItem>
        </ul>
      </Section>

      <Section title="Known gaps">
        <p>Two areas are still in progress:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2 text-slate-500">
          <li>Chart components (trial result visualisations): text alternatives pending</li>
          <li>Complex data tables on trial pages: full header association markup pending</li>
        </ul>
        <p className="mt-3">
          Report any barrier not listed here and we will prioritise a fix.
        </p>
      </Section>

      <Section title="Reporting a problem">
        <p>
          Email{' '}
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>{' '}
          with the page or feature, a description of the barrier, and your assistive technology if
          relevant. We respond within 5 business days and aim to resolve substantive issues within 30.
        </p>
      </Section>

      <Section title="Technical approach">
        <p>
          NeuroWiki is built with React 18, TypeScript, and Tailwind CSS. shadcn/ui components are
          built on Radix UI, a headless accessible primitive library. ARIA patterns follow the{' '}
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
      <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400">
        <Link to="/privacy" className="hover:text-neuro-500 transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-neuro-500 transition-colors">Terms of Use</Link>
        <Link to="/" className="hover:text-neuro-500 transition-colors">Back to NeuroWiki</Link>
      </div>
    </div>
  );
}
