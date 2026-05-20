// Privacy Policy — NeuroWiki
// Discloses all data collection per compliance-public-medical skill §GDPR/CCPA requirements.
// Last reviewed: 2026-05-19b — compliance-legal HIPAA review (artifact at
// docs/reviews/compliance-hipaa-saved-cases-2026-05-19.md) revised the
// CE/BA framing, added clinician-actionable HIPAA disclosure for Save Case,
// described the relative-vs-absolute timestamp storage option, fixed the
// "~24 hours" cron TTL inconsistency, and removed the "No patient data
// stored anywhere" line that contradicted the data table directly above it.

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

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium text-neuro-500 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: May 19, 2026</p>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          NeuroWiki is a free clinical reference tool. It collects almost nothing. This page
          describes exactly what is collected, where it goes, and how to remove it.
        </p>
      </div>

      <Section title="Who we are">
        <p>
          NeuroWiki is a free clinical reference tool maintained by the NeuroWiki team.
        </p>
        <p>
          <span className="font-medium text-slate-700">NeuroWiki is not a Covered Entity or
          Business Associate under HIPAA.</span> We do not bill insurance, we do not have a
          Business Associate Agreement with any hospital or health system, and HIPAA does
          not directly regulate us.
        </p>
        <p>
          That is a statement about NeuroWiki's regulatory status. It is{' '}
          <span className="font-medium text-slate-700">not</span> a statement that the data you
          enter cannot be PHI under your own hospital's HIPAA obligations. When you use the
          Save Case feature, you may store clinical context (scores, timestamps, vitals) on
          this device alongside patient initials. That combination — particularly absolute
          stroke timestamps paired with initials — may constitute PHI under your hospital's
          policy. The "Saved cases" section below describes exactly what is stored and how to
          reduce identifiability. You remain responsible for using this tool in a way
          consistent with your institution's rules. If uncertain, check with your hospital's
          privacy officer before using Save Case.
        </p>
      </Section>

      <Section title="What data we collect">
        <p>Every category of data collected or stored by NeuroWiki is listed below. Nothing is omitted.</p>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-2.5 font-semibold text-slate-700 border border-slate-200">Data</th>
                <th className="text-left p-2.5 font-semibold text-slate-700 border border-slate-200">Where stored</th>
                <th className="text-left p-2.5 font-semibold text-slate-700 border border-slate-200">Purpose</th>
                <th className="text-left p-2.5 font-semibold text-slate-700 border border-slate-200">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Google Analytics events', 'Google servers', 'Usage analytics: page views, feature use', 'Google default: 26 months'],
                ['Cookie consent decision', 'Your browser (neurowiki:consent)', 'Controls whether GA loads', 'Until you clear browser storage'],
                ['Favourite trials', 'Your browser (neurowiki:favs)', 'Saves starred trials between sessions', 'Until you clear browser storage'],
                ['Recently viewed', 'Your browser (neurowiki:recents:v1)', 'Powers the recents list', 'Until you clear browser storage'],
                ['Disclaimer acknowledged', 'Your browser (neurowiki:disclaimer:v1)', 'Suppresses the first-visit disclaimer', 'Until you clear browser storage'],
                ['Feedback submissions', 'Resend (email relay) → operator inbox', 'Delivers your feedback to the team', 'Email provider retention policy'],
                ['NPI proxy results', 'Not stored (session only)', 'Displays a doctor name from NPI lookup', 'Never written to storage'],
                ['Saved cases (My Cases)', 'Your browser (IndexedDB on this device)', 'Lets you reopen a calculator result later. Stores initials (2-4 letters), scores, vitals you entered, anti-coag class, and stroke timestamps. Timestamps save as elapsed offsets by default for de-identification; opt-in toggle preserves absolute times for door-to-needle documentation.', 'Until you delete the case or clear browser storage'],
                ['Cross-device transfer (Send to another device)', 'Supabase relay server (encrypted blob) → auto-purged after 15 min or on first read', 'Lets you move saved cases between your own devices via a short code. Encryption is client-side; the server only ever sees opaque ciphertext.', '15 minutes maximum, or deleted on first read. Daily cleanup cron sweeps any orphaned rows.'],
              ].map(([data, where, purpose, retention]) => (
                <tr key={data} className="hover:bg-slate-50">
                  <td className="p-2.5 border border-slate-200 font-medium text-slate-700">{data}</td>
                  <td className="p-2.5 border border-slate-200">{where}</td>
                  <td className="p-2.5 border border-slate-200">{purpose}</td>
                  <td className="p-2.5 border border-slate-200">{retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 font-medium text-slate-700">
          No user accounts. No passwords. No server-side patient data — Saved Cases live only
          on your device, and the Cross-device transfer relay holds nothing but opaque
          ciphertext for at most 15 minutes.
        </p>
      </Section>

      <Section title="Google Analytics">
        <p>
          When you consent, Google Analytics 4 loads. IP anonymisation is on. Your full IP
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
          <code className="bg-slate-100 px-1 rounded text-xs">neurowiki:consent</code>{' '}
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

      <Section title="Saved cases (My Cases)">
        <p>
          The Save Case feature lets you keep a calculator result on this device for later
          reference — useful when you're moving between patients on a shift. Cases live in your
          browser's IndexedDB store, on this device only, and are never uploaded to NeuroWiki
          servers (we don't have any user-data servers).
        </p>
        <p>
          <span className="font-medium text-slate-700">Exactly what is stored:</span>
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Patient initials (2–4 uppercase letters). The input validates and rejects anything else. The save dialog reminds you: <em>never write the full name, MRN, or date of birth</em>.</li>
          <li>The calculator score and per-item inputs (e.g., NIHSS item 1a through 11).</li>
          <li>Patient-context values you optionally enter: Last Known Well time, blood pressure, glucose, and anti-coag / antiplatelet class.</li>
          <li>Stroke timestamps (Code Activation, Neurology Evaluation, CT Read Time, Neuro IR Contacted, NCC/ICU Sign-out) when you record them.</li>
        </ul>
        <p>
          <span className="font-medium text-slate-700">Timestamps default to elapsed offsets.</span> When you save a case, the stroke timestamps are stored as elapsed offsets from the earliest stamp (e.g., "anchor", "+12m", "+18m") rather than absolute wall-clock times. This is the de-identification default — the saved data preserves clinical timing (door-to-CT-read, CT-read-to-IR) without recording the specific time of day the events happened. If you need absolute timestamps for quality documentation (door-to-needle, door-to-puncture), tick the <em>"Save absolute timestamps"</em> checkbox in the save dialog. The checkbox label explains the trade-off.
        </p>
        <p>
          <span className="font-medium text-slate-700">HIPAA — what this means for you.</span> NeuroWiki is not a Covered Entity or Business Associate under HIPAA, and we never receive Saved Cases on our servers. However, the combination of initials with clinical context (scores, timestamps, vitals) can constitute Protected Health Information under your hospital's own HIPAA obligations, particularly when absolute stroke timestamps are stored. You are responsible for determining whether using Save Case is consistent with your institution's privacy policy. If uncertain, ask your hospital's privacy officer. The elapsed-offsets default exists to reduce that exposure; the absolute-timestamps opt-in exists for cases where quality-metric documentation requires it.
        </p>
        <p>
          <span className="font-medium text-slate-700">Legacy notes.</span> Earlier versions of NeuroWiki offered an optional free-text "Note" field at save time. That input was removed in May 2026 because nothing prevented a clinician typing a full name into it — a HIPAA-uncomfortable risk. Saved cases created before the change may still display their note text in the case detail view; new cases will have no note.
        </p>
        <p>
          <span className="font-medium text-slate-700">How to delete:</span> open My Cases
          (bookmark icon on any calculator → Save → row appears at <code className="bg-slate-100 px-1 rounded text-xs">/my-cases</code>),
          tap the trash icon on a row, or tap "Clear all" to wipe everything. You can also clear
          your browser's site data for neurowiki.ai — this removes all saved cases plus every
          other local-storage item NeuroWiki uses.
        </p>
      </Section>

      <Section title="Cross-device transfer (Send to another device)">
        <p>
          If you save cases on your phone and want to view them on a desktop browser (or
          vice-versa), the Send feature creates a short-lived encrypted package on a relay
          server. NeuroWiki uses Supabase as the relay. The server only ever holds opaque
          ciphertext — it never sees your initials, scores, or notes in plaintext.
        </p>
        <p>
          <span className="font-medium text-slate-700">How the encryption works:</span> you pick
          a 4-digit PIN on the sending device. Your browser uses that PIN to derive an AES-256
          encryption key (via PBKDF2 with 250,000 iterations) and encrypts the case bundle
          locally. Only the encrypted blob is uploaded. The PIN never leaves your device. The
          receiver enters the same PIN to decrypt locally. Without the PIN, the ciphertext is
          unreadable even to NeuroWiki and Supabase.
        </p>
        <p>
          <span className="font-medium text-slate-700">How long it sits on the server:</span>{' '}
          15 minutes maximum. The row is deleted the moment the receiver fetches it (one-time
          read). If nobody fetches it, an automated daily cleanup job sweeps any expired rows
          as a backstop. The 15-minute TTL is the nominal limit; the backstop only matters for
          rows that somehow survive longer (it never has, but the safety net exists).
        </p>
        <p>
          <span className="font-medium text-slate-700">What the receiver does:</span> opens the
          Import page on their other device, enters the 6-digit transfer code shown on the
          sending device, then enters the same 4-digit PIN. The cases land in their local
          IndexedDB; the server-side copy is destroyed.
        </p>
        <p>
          The transfer feature is optional. It only runs when you initiate it — Save Case alone
          never touches a server.
        </p>
      </Section>

      <Section title="No sale of data">
        <p>
          NeuroWiki does not sell, rent, or share personal data with third parties for advertising.
          Google Analytics data sits on Google's servers under Google's privacy policy. It is used
          only to understand how the tool is used, not for targeting.
        </p>
      </Section>

      <Section title="GDPR: EU residents">
        <p>
          EU residents have the right to access, correct, or delete any data held about them.
          NeuroWiki has no user accounts and stores no per-user records on its own servers.
          The only server-side touch-points are:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <span className="font-medium text-slate-700">Google Analytics</span> — IP-anonymised
            event data, controlled via the GA opt-out tool above.
          </li>
          <li>
            <span className="font-medium text-slate-700">Cross-device transfer relay
            (Supabase)</span> — only present when you explicitly initiate a transfer. Encrypted
            blob, ≤15-minute lifetime, deleted on first read or automatic purge.
          </li>
          <li>
            <span className="font-medium text-slate-700">Feedback emails (Resend)</span> — only
            present when you submit feedback.
          </li>
        </ul>
        <p>
          All other actionable data lives in your browser's local storage and IndexedDB, which
          you can clear at any time. To contact the NeuroWiki team, use the in-app feedback
          button (bottom-right of every page).
        </p>
      </Section>

      <Section title="CCPA: California residents">
        <p>
          NeuroWiki does not sell personal information as defined by the California Consumer Privacy
          Act. To request deletion of any data associated with you, use the in-app feedback button
          with the subject "Data deletion request".
        </p>
      </Section>

      <Section title="Data deletion">
        <p>
          Use the in-app feedback button (bottom-right of every page) with the subject "Data
          deletion request". The team responds within 30 days.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          Material changes update the "Last updated" date at the top of this page. Continued use
          of NeuroWiki after changes constitutes acceptance of the revised policy.
        </p>
      </Section>

      {/* Footer nav */}
      <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400">
        <Link to="/terms" className="hover:text-neuro-500 transition-colors">Terms of Use</Link>
        <Link to="/accessibility" className="hover:text-neuro-500 transition-colors">Accessibility</Link>
        <Link to="/" className="hover:text-neuro-500 transition-colors">Back to NeuroWiki</Link>
      </div>
    </div>
  );
}
