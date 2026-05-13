// Terms of Use — NeuroWiki
// Minimum required clauses per compliance-public-medical skill.
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

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium text-neuro-500 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">Terms of Use</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: May 13, 2026</p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Using NeuroWiki means you accept these terms. They are short.
        </p>
      </div>

      {/* Clinical safety notice — prominent */}
      <div className="mb-10 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
          Clinical reference only
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
          NeuroWiki supports clinical judgment — it does not replace it. Verify all scores,
          pathways, and dosing against your institutional protocol and the patient in front of
          you. Do not base any clinical decision solely on this tool.
        </p>
      </div>

      <Section title="What NeuroWiki is">
        <p>
          NeuroWiki is a clinical decision-support reference for neurology clinicians — residents,
          fellows, and attendings. It provides scoring calculators, clinical pathways, and trial
          summaries based on published guidelines.
        </p>
        <p>
          Tidbit Health (info@tidbithealth.in), based in India, operates NeuroWiki.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          Medical guidelines change. Content on NeuroWiki may not reflect the most recent
          publications. Check current guidelines before acting on any information here.
        </p>
        <p>
          NeuroWiki is provided as-is. No warranty of accuracy, completeness, or fitness for any
          purpose — express or implied.
        </p>
      </Section>

      <Section title="Not for emergency use without verification">
        <p>
          NeuroWiki is a reference aid. In time-critical situations, do not use it as your primary
          source. Assess the patient directly and verify with colleagues.
        </p>
      </Section>

      <Section title="No patient data">
        <p>
          Do not enter identifiable patient data into NeuroWiki. This tool is not designed or
          approved for handling protected health information. Calculator inputs run locally in
          your browser and are never transmitted.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the extent permitted by applicable law, Tidbit Health is not liable for any damages
          — direct, indirect, or consequential — arising from use of or reliance on this tool,
          including clinical decisions made on the basis of information presented here.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The clinical content, design, and code of NeuroWiki are owned by Tidbit Health. Use
          the tool for your clinical practice and education. Do not reproduce or redistribute
          content commercially without written permission.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by Indian law. Disputes are subject to the exclusive
          jurisdiction of courts in India.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          The "Last updated" date at the top reflects any revisions. Continued use after changes
          constitutes acceptance.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>
        </p>
      </Section>

      {/* Footer nav */}
      <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 text-xs text-slate-400">
        <Link to="/privacy" className="hover:text-neuro-500 transition-colors">Privacy Policy</Link>
        <Link to="/accessibility" className="hover:text-neuro-500 transition-colors">Accessibility</Link>
        <Link to="/" className="hover:text-neuro-500 transition-colors">Back to NeuroWiki</Link>
      </div>
    </div>
  );
}
