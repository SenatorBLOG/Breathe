// emails/welcome.js
const { sign: unsubSign } = require('../utils/unsubSign');
function welcomeHtml({ name, email }) {
  const displayName = name || 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Breathe</title>
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
                Welcome, ${displayName} 👋
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4A7AAA;">
                Your account is ready. You're now part of a global community of people who use breathwork to sleep better, stress less, and focus more.
              </p>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                ${[
                  ['<img src="/icons/1.blow.webp" alt="" style="width:20px;height:20px;vertical-align:middle;" />', 'Start your first session', 'Choose a technique — Box, 4-7-8, Wim Hof — and let the animated guide pace you.'],
                  ['📍', 'Drop your pin on the globe', 'Join thousands of meditators marking where they breathe around the world.'],
                  ['📊', 'Track your progress', 'Log your mood before and after each session. The data will surprise you.'],
                ].map(([icon, title, desc]) => `
                <tr>
                  <td style="padding:0 0 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top" style="padding-top:2px;">
                          <span style="font-size:20px;">${icon}</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#B8D9FF;">${title}</p>
                          <p style="margin:0;font-size:13px;line-height:1.5;color:#4A7AAA;">${desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join('')}
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://breatheonline.app/breathing"
                      style="display:inline-block;background:linear-gradient(135deg,#1A5FCC,#3A82F7);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;letter-spacing:0.02em;">
                      <img src="/icons/1.blow.webp" alt="" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;" /> Start breathing now →
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
                You're receiving this because you signed up at breatheonline.app
              </p>
              <a href="https://breatheonline.app/api/unsubscribe?email=${encodeURIComponent(email)}&type=welcome&sig=${unsubSign(email, 'welcome')}"
                style="font-size:12px;color:#2A4060;text-decoration:underline;">
                Unsubscribe from onboarding emails
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

module.exports = { welcomeHtml };
