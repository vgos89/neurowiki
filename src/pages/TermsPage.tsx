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
          By using NeuroWiki, you agree to these terms. Please read them carefully — they are short.
        </p>
      </div>

      {/* Clinical safety notice — prominent */}
      <div className="mb-10 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
          Clinical reference only — not a substitute for clinical judgment
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
          NeuroWiki is designed to support, not replace, the clinical judgment of qualified healthcare
          professionals. All scores, pathways, and recommendations must be verified against current
          institutional protocols and the individual patient's clinical context before use. No
          clinical decision should be made based solely on information from this tool.
        </p>
      </div>

      <Section title="What NeuroWiki is">
        <p>
          NeuroWiki is a free clinical decision-support reference tool for neurology clinicians —
          including residents, fellows, and attending physicians. It provides scoring calculators,
          clinical pathways, and landmark trial summaries based on published guidelines and evidence.
        </p>
        <p>
          NeuroWiki is operated by Tidbit Health (info@tidbithealth.in), based in India.
        </p>
      </Section>

      <Section title="No warranty of accuracy or completeness">
        <p>
          Medical knowledge evolves rapidly. While we make every effort to keep content current and
          evidence-based, we make no warranty — express or implied — that the information on NeuroWiki
          is accurate, complete, up to date, or free from error at any given time.
        </p>
        <p>
          Guidelines, thresholds, and drug dosing information may have changed since the last review.
          Always verify against the most current published guidelines and your institution's protocols
          before acting on any information from this tool.
        </p>
      </Section>

      <Section title="Not for emergency use without clinical verification">
        <p>
          NeuroWiki is intended as a reference aid, not an emergency decision support system. In
          time-critical situations, do not rely on this tool as your sole or primary source of
          information. Verify all clinical decisions through direct patient assessment and with
          qualified colleagues.
        </p>
      </Section>

      <Section title="No patient data">
        <p>
          Do not enter identifiable patient information into NeuroWiki. This tool is not a covered
          entity under HIPAA and is not designed or approved for handling protected health information.
          All calculator inputs are processed locally in your browser and are never transmitted.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by applicable law, Tidbit Health and the NeuroWiki team
          shall not be liable for any direct, indirect, incidental, or consequential damages arising
          from use of or reliance on this tool, including but not limited to clinical decisions made
          on the basis of information presented here.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The clinical content, design, and code of NeuroWiki are owned by Tidbit Health. You may
          use the tool for your personal clinical practice and education. You may not reproduce,
          redistribute, or commercially exploit the content without written permission.
        </p>
      </Section>

      <Section title="Governing law and jurisdiction">
        <p>
          These terms are governed by the laws of India. Any disputes arising from use of NeuroWiki
          shall be subject to the exclusive jurisdiction of the courts of India.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms from time to time. The "Last updated" date at the top of this
          page will reflect any changes. Continued use of NeuroWiki after changes constitutes
          acceptance of the updated terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For questions about these terms, contact us at{' '}
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>
          .
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
