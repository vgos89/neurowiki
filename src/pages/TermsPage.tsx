// Terms of Use - NeuroWiki
// Minimum required clauses per compliance-public-medical skill.
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

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium text-neuro-500 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Terms of Use</h1>
        <p className="text-sm text-slate-500">Last updated: May 13, 2026</p>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          Using NeuroWiki means you accept these terms. They are short.
        </p>
      </div>

      {/* Clinical safety notice, prominent. Rewritten 2026-05-19 per V audit
          to drop AI-fingerprint patterns (negative parallelism "supports X.
          It does not replace X."; rule-of-three "scores, pathways, and dosing";
          vague-formal "any/solely/do not"). Clinical voice instead. */}
      <div className="mb-10 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <p className="text-sm font-semibold text-amber-800 mb-2">
          Reference, not a replacement
        </p>
        <p className="text-sm text-amber-700 leading-relaxed">
          Cross-check scores and dosing against your hospital's protocol and the patient
          in front of you before acting. Treat this as a starting point. Your judgment
          closes the loop.
        </p>
      </div>

      <Section title="What NeuroWiki is">
        <p>
          NeuroWiki is a clinical decision-support reference for neurology residents, fellows,
          and attendings. It provides scoring calculators, clinical pathways, and trial summaries
          based on published guidelines.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          Medical guidelines change. Content on NeuroWiki may not reflect the most recent
          publications. Check current guidelines before acting on any information here.
        </p>
        <p>
          NeuroWiki is provided as-is. No warranty of accuracy, completeness, or fitness for any
          purpose, express or implied.
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
          To the extent permitted by applicable law, the NeuroWiki team is not liable for direct,
          indirect, or consequential damages arising from use of or reliance on this tool,
          including clinical decisions made on the basis of information presented here.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The clinical content, design, and code of NeuroWiki are the property of the NeuroWiki
          team. Use the tool for your clinical practice and education. Do not reproduce or
          redistribute content commercially without written permission.
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
          Use the in-app feedback button (bottom-right of every page) to reach the NeuroWiki team.
        </p>
      </Section>

      {/* Footer nav */}
      <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400">
        <Link to="/privacy" className="hover:text-neuro-500 transition-colors">Privacy Policy</Link>
        <Link to="/accessibility" className="hover:text-neuro-500 transition-colors">Accessibility</Link>
        <Link to="/" className="hover:text-neuro-500 transition-colors">Back to NeuroWiki</Link>
      </div>
    </div>
  );
}
