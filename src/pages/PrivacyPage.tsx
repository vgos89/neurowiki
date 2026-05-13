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
          NeuroWiki is a free clinical reference tool. It collects almost nothing. This page
          describes exactly what is collected, where it goes, and how to remove it.
        </p>
      </div>

      <Section title="Who we are">
        <p>
          NeuroWiki is operated by Tidbit Health (info@tidbithealth.in). NeuroWiki is not a
          covered entity under HIPAA. It does not collect, store, or transmit protected health
          information. Do not enter patient data into this tool.
        </p>
      </Section>

      <Section title="What data we collect">
        <p>Every category of data collected or stored by NeuroWiki is listed below. Nothing is omitted.</p>

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
                ['Google Analytics events', 'Google servers', 'Usage analytics — page views, feature use', 'Google default: 26 months'],
                ['Cookie consent decision', 'Your browser (neurowiki:consent)', 'Controls whether GA loads', 'Until you clear browser storage'],
                ['Favourite trials', 'Your browser (neurowiki:favs)', 'Saves starred trials between sessions', 'Until you clear browser storage'],
                ['Recently viewed', 'Your browser (neurowiki:recents:v1)', 'Powers the recents list', 'Until you clear browser storage'],
                ['Disclaimer acknowledged', 'Your browser (neurowiki:disclaimer:v1)', 'Suppresses the first-visit disclaimer', 'Until you clear browser storage'],
                ['Feedback submissions', 'Resend (email relay) → operator inbox', 'Delivers your feedback to the team', 'Email provider retention policy'],
                ['NPI proxy results', 'Not stored — session only', 'Displays a doctor name from NPI lookup', 'Never written to storage'],
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
          No user accounts. No passwords. No patient data stored anywhere.
        </p>
      </Section>

      <Section title="Google Analytics">
        <p>
          When you consent, Google Analytics 4 loads. IP anonymisation is on — your full IP
          address is never sent to Google. To block GA entirely, use the{' '}
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
          A consent banner appears on your first visit. Declining it blocks Google Analytics from
          loading. To revoke consent later, delete the{' '}
          <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">neurowiki:consent</code>{' '}
          key from your browser's local storage for neurowiki.ai. In Chrome: DevTools → Application
          → Local Storage → neurowiki.ai. The consent banner re-appears on your next visit.
        </p>
      </Section>

      <Section title="Feedback submissions">
        <p>
          The in-app feedback form sends your message through Resend, an email relay service, to
          the NeuroWiki operator inbox. The message text is the only data transmitted. Nothing is
          stored on NeuroWiki's servers.
        </p>
      </Section>

      <Section title="No sale of data">
        <p>
          NeuroWiki does not sell, rent, or share personal data with third parties for advertising.
          Google Analytics data sits on Google's servers under Google's privacy policy. It is used
          only to understand how the tool is used, not for targeting.
        </p>
      </Section>

      <Section title="GDPR — EU residents">
        <p>
          EU residents have the right to access, correct, or delete any data held about them.
          Because NeuroWiki stores nothing server-side about individual users, the only actionable
          data is in your browser's local storage, which you can clear at any time.
        </p>
        <p>
          For GA data held by Google, use the GA opt-out tool above. To contact us directly:
          {' '}<a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">info@tidbithealth.in</a>.
        </p>
      </Section>

      <Section title="CCPA — California residents">
        <p>
          NeuroWiki does not sell personal information as defined by the California Consumer Privacy
          Act. To request deletion of any data associated with you, email{' '}
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>
          .
        </p>
      </Section>

      <Section title="Data deletion">
        <p>
          Email{' '}
          <a href="mailto:info@tidbithealth.in" className="text-neuro-500 hover:underline">
            info@tidbithealth.in
          </a>{' '}
          with the subject line "Data deletion request". We respond within 30 days.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          Material changes update the "Last updated" date at the top of this page. Continued use
          of NeuroWiki after changes constitutes acceptance of the revised policy.
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
