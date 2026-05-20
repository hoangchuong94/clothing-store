import { getEmailMessages } from '../messages';
import type { EmailLocale, VerificationEmailParams } from '../types';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildVerificationEmail(params: VerificationEmailParams & { locale: EmailLocale }): {
  subject: string;
  html: string;
  text: string;
} {
  const t = getEmailMessages(params.locale).verification;
  const displayName = params.name?.trim() || params.to;
  const hours = String(params.expiresInHours);
  const body = t.body.replace('{hours}', hours);

  const subject = t.subject;
  const html = `<!DOCTYPE html>
<html lang="${params.locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(t.preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 10px 40px rgba(15,23,42,0.08);">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:14px;color:#64748b;">${escapeHtml(t.greeting)}, ${escapeHtml(displayName)}</p>
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">${escapeHtml(subject)}</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#334155;">${escapeHtml(body)}</p>
              <a href="${escapeHtml(params.verificationUrl)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:10px;">${escapeHtml(t.button)}</a>
              <p style="margin:24px 0 8px;font-size:14px;color:#64748b;">${escapeHtml(t.fallback)}</p>
              <p style="margin:0 0 24px;font-size:13px;word-break:break-all;color:#4f46e5;">${escapeHtml(params.verificationUrl)}</p>
              <p style="margin:0;font-size:13px;color:#94a3b8;">${escapeHtml(t.ignore)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${t.greeting}, ${displayName}\n\n${body}\n\n${params.verificationUrl}\n\n${t.ignore}`;

  return { subject, html, text };
}
