// Privacy Policy — NeuroWiki
// Discloses all data collection per compliance-public-medical skill §GDPR/CCPA requirements.
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

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium text-neuro-500 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">Privacy Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: May 13, 2026</p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          NeuroWiki is a free clinical reference tool for neurology clinicians. We collect minimal
          data and store nothing on our servers about individual users. This policy explains exactly
          what we do collect and how.
        </p>
      </div>

      <Section title="Who we are">
        <p>
          NeuroWiki is operated by Tidbit Health (info@tidbithealth.in). We are not a covered entity
          under HIPAA — we do not collect, store, or transmit protected health information (PHI).
          No patient data should be entered into this tool.
        </p>
      </Section>

      <Section title="What data we collect">
        <p>The table below lists every category of data collected or stored by NeuroWiki.</p>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left p-2.5 font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">Data</th>
                <th className="text-left p-2.5 font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">Where stored</th>
                <th className="text-left p-2.5 font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">Purpose</th>
                <th className="text-left p-2.5 font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                ['Google Analytics events', 'Google servers', 'Usage analytics (page views, feature use)', 'Google default — 26 months'],
                ['Cookie consent decision', 'Your browser (neurowiki:consent)', 'Gates GA loading — we only fire analytics after consent', 'Until you clear browser storage'],
                ['Favourite trials', 'Your browser (neurowiki:favs)', 'Remembers trials you starred', 'Until you clear browser storage'],
                ['Recently viewed', 'Your browser (neurowiki:recents:v1)', 'Powers the recents list', 'Until you clear browser storage'],
                ['Disclaimer acknowledged', 'Your browser (neurowiki:disclaimer:v1)', 'Prevents the first-visit disclaimer from re-showing', 'Until you clear browser storage'],
                ['Feedback submissions', 'Resend (email relay) → operator inbox', 'Routes your feedback to the NeuroWiki team', 'Email provider retention policy'],
                ['NPI proxy results', 'Not stored — session only', 'Displays a doctor name from NPI registry lookup', 'Never persisted anywhere'],
              ].map(([data, where, purpose, retention]) => (
                <tr key={data} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-2.5 border border-slate-200 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-200">{data}</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-600">{where}</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-600">{purpose}</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-600">{retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
          No server-side user accounts. No passwords. No patient data.
        </p>
      </Section>

      <Section title="Google Analytics">
        <p>
          When you give consent, we load Google Analytics 4. We have enabled IP anonymisation
          (<code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">anonymize_ip: true</code>),
          so your full IP address is never sent to Google.
        </p>
        <p>
          You can opt out of Google Analytics at any time using the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neuro-500 hover:underline"
          >
            Google Analytics opt-out browser add-on
          </a>
          .
        </p>
      </Section>

      <Section title="Cookie consent and how to revoke it">
        <p>
          On your first visit, a consent banner asks whether you accept analytics. If you decline,
          Google Analytics is never loaded.
        </p>
        <p>
          To revoke consent later, clear your browser's local storage for neurowiki.ai. In Chrome:
          DevTools → Application → Local Storage → neurowiki.ai → delete the{' '}
          <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">neurowiki:consent</code> key.
          The consent banner will re-appear on your next visit.
        </p>
      </Section>

      <Section title="Feedback submissions">
        <p>
          When you submit feedback via the in-app form, your message is relayed through Resend
          (an email delivery service) to the NeuroWiki operator inbox. We do not store feedback
          on our own servers. The content you type in the feedback form is the only data sent.
        </p>
      </Section>

      <Section title="No sale of data">
        <p>
          We do not sell, rent, or share personal information with third parties for advertising or
          commercial purposes. Google Analytics data is governed by Google's own privacy policy and
          is used solely for understanding how the tool is used, not for targeting.
        </p>
      </Section>

      <Section title="GDPR — rights for EU residents">
        <p>
          If you are in the European Economic Area, you have the right to access, correct, or
          request deletion of any data we hold about you. Because we store nothing on our own
          servers, the only actionable data is in your browser's local storage — which you can
          clear yourself at any time.
        </p>
        <p>
          For GA data held by Google, use the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neuro-500 hover:underline"
          >
            GA opt-out tool
          </a>
          . To contact us directly, email{' '}
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>
          .
        </p>
      </Section>

      <Section title="CCPA — rights for California residents">
        <p>
          We do not sell personal information as defined under the California Consumer Privacy Act.
          You may request deletion of any data associated with you by contacting{' '}
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>
          .
        </p>
      </Section>

      <Section title="Data deletion">
        <p>
          To request deletion of any data we may hold about you, email{' '}
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>{' '}
          with the subject line "Data deletion request". We will respond within 30 days.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we make material changes, we will update the "Last updated" date at the top of this
          page. Continued use of NeuroWiki after changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      {/* Footer nav */}
      <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 text-xs text-slate-400">
        <Link to="/terms" className="hover:text-neuro-500 transition-colors">Terms of Use</Link>
        <Link to="/accessibility" className="hover:text-neuro-500 transition-colors">Accessibility</Link>
        <Link to="/" className="hover:text-neuro-500 transition-colors">Back to NeuroWiki</Link>
      </div>
    </div>
  );
}
