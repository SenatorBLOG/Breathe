// emails/reminder.js
const { sign: unsubSign } = require('../utils/unsubSign');
function reminderHtml({ name, email }) {
  const displayName = name || 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Time to breathe</title>
</head>
<body style="margin:0;padding:0;background:#010814;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#010814;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;letter-spacing:0.08em;color:#B8D9FF;font-weight:300;"><img src="/icons/1.blow.webp" alt="" style="width:28px;height:28px;vertical-align:middle;margin-right:8px;" /> BREATHE</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0B1628;border-radius:20px;border:1px solid rgba(30,51,88,0.7);padding:40px 36px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#B8D9FF;">
                Hey ${displayName} — you haven't meditated today 🌊
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A7AAA;">
                2 minutes will change your evening. Your nervous system doesn't take days off — a short breathwork session now resets your stress baseline and keeps your streak alive.
              </p>

              <!-- Techniques -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:0 6px 0 0;width:33%;">
                    <a href="https://breatheonline.app/breathing/4-7-8" style="text-decoration:none;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#060F20;border:1px solid rgba(30,51,88,0.7);border-radius:12px;padding:16px;text-align:center;">
                            <p style="margin:0 0 6px;font-size:20px;">🌙</p>
                            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#B8D9FF;">4-7-8</p>
                            <p style="margin:0;font-size:11px;color:#4A7AAA;">For sleep</p>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td style="padding:0 3px;width:33%;">
                    <a href="https://breatheonline.app/breathing/box-breathing" style="text-decoration:none;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#060F20;border:1px solid rgba(30,51,88,0.7);border-radius:12px;padding:16px;text-align:center;">
                            <p style="margin:0 0 6px;font-size:20px;">📦</p>
                            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#B8D9FF;">Box</p>
                            <p style="margin:0;font-size:11px;color:#4A7AAA;">For focus</p>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td style="padding:0 0 0 6px;width:33%;">
                    <a href="https://breatheonline.app/breathing" style="text-decoration:none;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#060F20;border:1px solid rgba(30,51,88,0.7);border-radius:12px;padding:16px;text-align:center;">
                            <p style="margin:0 0 6px;font-size:20px;">💨</p>
                            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#B8D9FF;">Belly</p>
                            <p style="margin:0;font-size:11px;color:#4A7AAA;">Foundation</p>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://breatheonline.app/breathing"
                      style="display:inline-block;background:linear-gradient(135deg,#1A5FCC,#3A82F7);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;letter-spacing:0.02em;">
                      <img src="/icons/1.blow.webp" alt="" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;" /> Resume my practice →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="margin:0 0 8px;font-size:12px;color:#2A4060;">
                Breathe · breatheonline.app
              </p>
              <a href="https://breatheonline.app/api/unsubscribe?email=${encodeURIComponent(email)}&type=reminder&sig=${unsubSign(email, 'reminder')}"
                style="font-size:12px;color:#2A4060;text-decoration:underline;">
                Unsubscribe from streak reminders
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { reminderHtml };
