import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FeedbackPayload {
  type?: string;
  message?: string;
  email?: string | null;
  pageTitle?: string;
  pageType?: string;
  pagePath?: string;
  turnstileToken?: string | null;
  timestamp?: string;
}

interface TurnstileResponse {
  success: boolean;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    type,
    message,
    email,
    pageTitle,
    pageType,
    pagePath,
    turnstileToken,
    timestamp,
  } = (req.body ?? {}) as FeedbackPayload;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const feedbackEmail = process.env.FEEDBACK_EMAIL;

  if (!turnstileSecret || !resendApiKey || !feedbackEmail) {
    return res.status(500).json({ error: 'Feedback service is not configured' });
  }

  try {
    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken ?? '',
        }),
      }
    );

    const verificationData = await verificationResponse.json() as TurnstileResponse;
    if (!verificationData.success) {
      return res.status(400).json({ error: 'Security verification failed' });
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(400).json({ error: 'Security verification failed' });
  }

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
        subject: `[${type?.toUpperCase() || 'FEEDBACK'}] ${pageTitle || 'Feedback'}`,
        html: `
          <h2>New Feedback Received</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${type || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Page</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pageTitle || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Page Type</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pageType || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Path</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${pagePath || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Time</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${timestamp ? new Date(timestamp).toLocaleString() : 'Not specified'}</td>
            </tr>
            ${email ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">User Email</td>
              <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            ` : ''}
          </table>

          <h3 style="margin-top: 24px;">Message:</h3>
          <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${message}</div>
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
