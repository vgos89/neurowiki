import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FeedbackPayload {
  type?: string;
  message?: string;
  email?: string | null;
  pageTitle?: string;
  pageType?: string;
  pagePath?: string;
  // Honeypot: a hidden field real users never fill. Bots that auto-fill
  // every input will populate it; a non-empty value => silent drop.
  company?: string | null;
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// Abuse guards (pure, unit-tested in src/__tests__/feedbackGuards.test.ts)
//
// Replaces Cloudflare Turnstile, which was removed after the Cloudflare
// account was deleted (the widget could no longer issue a token, which left
// the feedback form's submit button permanently disabled in production).
// Two lightweight, no-dependency controls take its place:
//   1. honeypot      — a hidden form field; non-empty => bot => silent drop
//   2. same-origin   — only accept requests originating from our own site
// Neither stops a determined scripted attacker (Origin is trivially spoofed
// outside a browser); they stop bots and casual cross-site abuse, which is
// the actual threat for a low-traffic tool whose email recipient is fixed
// server-side. Rate-limiting is a tracked follow-up (needs shared KV state).
// ---------------------------------------------------------------------------

// Hosts permitted to POST feedback. `localhost`/`127.0.0.1` cover local dev
// (Vite proxying to a deployed function). Vercel preview deploys (*.vercel.app)
// are intentionally excluded — feedback is a production surface.
export const ALLOWED_FEEDBACK_HOSTS: ReadonlySet<string> = new Set([
  'neurowiki.ai',
  'www.neurowiki.ai',
  'localhost',
  '127.0.0.1',
]);

/** Parse the host (no port) out of a full Origin or Referer URL. */
export function hostFromUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

/**
 * Resolve the requesting host from Origin (preferred) or Referer (fallback).
 * Same-origin browser POSTs may omit Origin but send Referer; we accept
 * either. Returns null when neither is present/parseable (=> fail closed).
 */
export function resolveRequestHost(
  origin: string | undefined | null,
  referer: string | undefined | null,
): string | null {
  return hostFromUrl(origin) ?? hostFromUrl(referer);
}

/** True only when the resolved host is on the allowlist. Fails closed. */
export function isAllowedFeedbackHost(
  host: string | null,
  allowed: ReadonlySet<string> = ALLOWED_FEEDBACK_HOSTS,
): boolean {
  return host !== null && allowed.has(host);
}

/** A bot tripped the honeypot if the hidden field carries any non-whitespace. */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate an OPTIONAL reply-email. Empty/absent is allowed (the field is
 * optional). When present it must be a single-line, basic-shaped address:
 * CR/LF are rejected to prevent header/markup injection into the email we
 * render, and the shape check blocks obvious garbage.
 */
export function isValidOptionalEmail(email: string | null | undefined): boolean {
  if (email == null) return true;
  const trimmed = email.trim();
  if (trimmed.length === 0) return true;
  if (/[\r\n]/.test(trimmed)) return false;
  if (trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/** Escape the five HTML-significant characters before interpolating into markup. */
export function htmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ALLOW_METHODS = 'POST, OPTIONS';
const ALLOW_HEADERS = 'Content-Type';

/**
 * Compute the value to echo in Access-Control-Allow-Origin: the request's
 * own Origin if it is allow-listed, else null (header omitted). OPTIONS and
 * POST share this single computation so preflight and the real request never
 * disagree.
 */
function allowedOriginHeader(origin: string | undefined | null): string | null {
  if (!origin) return null;
  return isAllowedFeedbackHost(hostFromUrl(origin)) ? origin : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  const referer = typeof req.headers.referer === 'string' ? req.headers.referer : undefined;

  const allowOrigin = allowedOriginHeader(origin);
  res.setHeader('Vary', 'Origin');
  if (allowOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', ALLOW_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOW_HEADERS);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Same-origin guard (server-enforced; independent of browser CORS). Fails
  // closed when neither Origin nor Referer resolves to an allow-listed host.
  if (!isAllowedFeedbackHost(resolveRequestHost(origin, referer))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const {
    type,
    message,
    email,
    pageTitle,
    pageType,
    pagePath,
    company,
    timestamp,
  } = (req.body ?? {}) as FeedbackPayload;

  // Honeypot: pretend success so a bot learns nothing, but send no email.
  if (isHoneypotTripped(company)) {
    return res.status(200).json({ success: true });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!isValidOptionalEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const feedbackEmail = process.env.FEEDBACK_EMAIL;

  if (!resendApiKey || !feedbackEmail) {
    return res.status(500).json({ error: 'Feedback service is not configured' });
  }

  // HTML-escape every user/context field before interpolating into the email
  // body so feedback content cannot inject markup into the recipient's mail
  // client. The reply-email is additionally validated above.
  const safeType = htmlEscape((type ?? 'Not specified').toString());
  const safeMessage = htmlEscape(message.trim());
  const safePageTitle = htmlEscape((pageTitle ?? 'Not specified').toString());
  const safePageType = htmlEscape((pageType ?? 'Not specified').toString());
  const safePagePath = htmlEscape((pagePath ?? 'Not specified').toString());
  const safeTime = htmlEscape(
    timestamp ? new Date(timestamp).toLocaleString() : 'Not specified',
  );
  const trimmedEmail = email?.trim() || '';
  const safeEmail = trimmedEmail ? htmlEscape(trimmedEmail) : '';

  const subjectType = htmlEscape((type ?? 'FEEDBACK').toString().toUpperCase());

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Neurowiki Feedback <onboarding@resend.dev>',
        to: feedbackEmail,
        subject: `[${subjectType}] ${safePageTitle}`,
        html: `
          <h2>New Feedback Received</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${safeType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Page</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${safePageTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Page Type</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${safePageType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Path</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${safePagePath}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Time</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${safeTime}</td>
            </tr>
            ${safeEmail ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">User Email</td>
              <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
            </tr>
            ` : ''}
          </table>

          <h3 style="margin-top: 24px;">Message:</h3>
          <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${safeMessage}</div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}));
      console.error('Resend error:', errorData);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to send feedback email:', error);
    return res.status(500).json({ error: 'Failed to send feedback' });
  }
}
