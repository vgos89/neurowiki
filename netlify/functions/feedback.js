import { Resend } from 'resend';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { type, message, email, pageTitle, pageType, pagePath, turnstileToken, timestamp } = data;

  if (!turnstileToken || !message || typeof message !== 'string') {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: turnstileToken }),
  });
  const verify = await verifyRes.json();
  if (!verify.success) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Security verification failed' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_EMAIL || process.env.RESEND_FEEDBACK_TO;
  const from = process.env.RESEND_FROM || 'NeuroWiki Feedback <onboarding@resend.dev>';

  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server configuration error' }) };
  }
  if (!to) {
    console.error('FEEDBACK_EMAIL or RESEND_FEEDBACK_TO is not set');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: to.split(',').map((e) => e.trim()),
      subject: `[${(type || 'feedback').toUpperCase()}] Feedback: ${pageTitle || pagePath || 'Page'}`,
      html: `
        <h2>New Feedback</h2>
        <p><strong>Type:</strong> ${type || '—'}</p>
        <p><strong>Page:</strong> ${pageTitle || '—'} (${pageType || '—'})</p>
        <p><strong>Path:</strong> ${pagePath || '—'}</p>
        <p><strong>Time:</strong> ${timestamp || new Date().toISOString()}</p>
        ${email ? `<p><strong>From:</strong> ${email}</p>` : ''}
        <hr />
        <h3>Message</h3>
        <p>${String(message).replace(/\n/g, '<br>')}</p>
      `,
    });
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Feedback email failed:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Failed to send feedback' }) };
  }
};
