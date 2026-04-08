// emails/weekly.js
function weeklyHtml({ name, email, stats }) {
  const displayName = name || 'there';
  const { sessionCount = 0, totalMinutes = 0, avgMood = null, topTechnique = null } = stats;
  const hasData = sessionCount > 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your weekly breathwork summary</title>
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

              <p style="margin:0 0 6px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#2A4060;">
                Weekly summary
              </p>
              <p style="margin:0 0 28px;font-size:22px;font-weight:600;color:#B8D9FF;">
                ${hasData ? `Great week, ${displayName} 🎯` : `Miss you, ${displayName} 🌊`}
              </p>

              ${hasData ? `
              <!-- Stats grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td width="50%" style="padding:0 6px 12px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#060F20;border:1px solid rgba(30,51,88,0.7);border-radius:14px;padding:18px;text-align:center;">
                          <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#B8D9FF;">${sessionCount}</p>
                          <p style="margin:0;font-size:12px;color:#4A7AAA;">sessions this week</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding:0 0 12px 6px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#060F20;border:1px solid rgba(30,51,88,0.7);border-radius:14px;padding:18px;text-align:center;">
                          <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#B8D9FF;">${totalMinutes}<span style="font-size:16px;font-weight:400;"> min</span></p>
                          <p style="margin:0;font-size:12px;color:#4A7AAA;">total breathwork</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${avgMood !== null ? `
                <tr>
                  <td width="50%" style="padding:0 6px 0 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#060F20;border:1px solid rgba(30,51,88,0.7);border-radius:14px;padding:18px;text-align:center;">
                          <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#B8D9FF;">${avgMood.toFixed(1)}<span style="font-size:16px;font-weight:400;">/5</span></p>
                          <p style="margin:0;font-size:12px;color:#4A7AAA;">avg mood after</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  ${topTechnique ? `
                  <td width="50%" style="padding:0 0 0 6px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#060F20;border:1px solid rgba(30,51,88,0.7);border-radius:14px;padding:18px;text-align:center;">
                          <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#B8D9FF;">${topTechnique}</p>
                          <p style="margin:0;font-size:12px;color:#4A7AAA;">top technique</p>
                        </td>
                      </tr>
                    </table>
                  </td>` : '<td></td>'}
                </tr>` : ''}
              </table>

              <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#4A7AAA;">
                Keep the momentum going — consistency compounds. Even 3 minutes a day builds measurable stress resilience over 2 weeks.
              </p>` : `
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4A7AAA;">
                No sessions logged this week. That's okay — your practice is waiting whenever you're ready. Start with just 3 minutes.
              </p>`}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://breatheonline.app/breathing"
                      style="display:inline-block;background:linear-gradient(135deg,#1A5FCC,#3A82F7);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;letter-spacing:0.02em;">
                      ${hasData ? '🎯 View my stats →' : '🌬 Start this week →'}
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
                Breathe · breatheonline.app · Sent every Sunday
              </p>
              <a href="https://breatheonline.app/api/unsubscribe?email=${encodeURIComponent(email)}&type=weekly"
                style="font-size:12px;color:#2A4060;text-decoration:underline;">
                Unsubscribe from weekly summaries
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

module.exports = { weeklyHtml };
