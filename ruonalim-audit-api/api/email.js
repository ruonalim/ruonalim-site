const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const BASE_URL = "https://ruonalim-audit-api.vercel.app";

function buildHtmlEmail({ greeting, body, cta, company_name, website_url, report_url }) {
  const paragraphs = body
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#141414;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter','Helvetica Neue',-apple-system,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:48px 20px 0 20px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Greeting -->
          <tr>
            <td style="padding:0 0 8px 0;">
              <p style="margin:0;font-size:15px;line-height:1.7;color:#141414;">${greeting}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:16px 0 0 0;">
              ${paragraphs}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:32px 0 24px 0;">
              <a href="mailto:hello@ruonalim.com?subject=Let%27s%20talk"
                 style="display:inline-block;background:#0044E4;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.01em;white-space:nowrap;">
                ${cta}
              </a>
            </td>
          </tr>

          <!-- Partial report link -->
          ${report_url ? `<tr>
            <td style="padding:0 0 40px 0;">
              <p style="margin:0;font-size:13px;color:#96969E;line-height:1.6;">
                We put together a partial report for
                <a href="${report_url}"
                   style="color:#0044E4;text-decoration:none;font-weight:500;">${website_url ? website_url.replace(/^https?:\/\//, '') : 'your site'}</a>
                —
                <a href="${report_url}"
                   style="color:#0044E4;text-decoration:none;font-weight:500;">take a look ›</a>
              </p>
            </td>
          </tr>` : ''}

        </table>
      </td>
    </tr>

    <!-- Concept Preview Section -->
    <tr>
      <td align="center" style="padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0F2F8;">
          <tr>
            <td align="center" style="padding:40px 20px 32px 20px;">

              <!-- Label -->
              <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#0044E4;text-transform:uppercase;">RUONALIM × ${company_name}</p>

              <!-- Headline -->
              <h2 style="margin:0 0 24px 0;font-size:22px;font-weight:600;line-height:1.3;color:#141414;letter-spacing:-0.01em;">Your new user experience awaits.</h2>

              <!-- Blurred concept image -->
              <img src="${BASE_URL}/concept-preview.jpg"
                   alt="A glimpse of what we could build for ${company_name}"
                   width="520"
                   style="display:block;width:100%;max-width:520px;border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,0.10);" />

              <!-- Caption -->
              <p style="margin:16px 0 0 0;font-size:12px;color:#96969E;line-height:1.5;">
                This is a preview of the direction we have in mind. One conversation could bring it to life.
              </p>

            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Signature -->
    <tr>
      <td align="center" style="padding:0 20px 48px 20px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Sig top row: avatar + name/title + pill -->
          <tr>
            <td style="padding:32px 0 0 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Avatar -->
                  <td valign="middle" style="padding-right:16px;">
                    <div style="width:44px;height:44px;border-radius:50%;background:#0044E4;display:inline-block;">
                      <table width="44" height="44" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" valign="middle" style="font-size:16px;font-weight:600;color:#ffffff;font-family:'Inter','Helvetica Neue',Arial,sans-serif;letter-spacing:0.02em;">
                            JT
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                  <!-- Name + title -->
                  <td valign="middle" style="padding-right:16px;">
                    <p style="margin:0 0 3px 0;font-size:15px;font-weight:600;color:#141414;line-height:1.2;">Jay Tulloch</p>
                    <p style="margin:0;font-size:13px;color:#96969E;line-height:1.2;">Co-founder &amp; Head of Design</p>
                  </td>
                  <!-- Pill -->
                  <td valign="middle">
                    <span style="display:inline-block;background:#EAF0FF;color:#0044E4;font-size:11px;font-weight:600;padding:5px 10px;border-radius:4px;letter-spacing:0.01em;white-space:nowrap;">
                      Product Design &amp; Growth
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:16px 0 16px 0;">
              <div style="height:1px;background:#E8E8EC;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Logo row -->
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Logo -->
                  <td valign="middle" style="padding-right:12px;">
                    <img src="${BASE_URL}/logo.png"
                         alt="RUONALIM"
                         height="20"
                         style="display:block;height:20px;width:auto;" />
                  </td>
                  <!-- Separator -->
                  <td valign="middle" style="padding-right:12px;">
                    <div style="width:1px;height:16px;background:#E8E8EC;display:inline-block;">&nbsp;</div>
                  </td>
                  <!-- Meta -->
                  <td valign="middle">
                    <p style="margin:0;font-size:12px;color:#96969E;line-height:1;">
                      <a href="https://ruonalim.com" style="color:#0044E4;text-decoration:none;">ruonalim.com</a>
                      &nbsp;<span style="color:#E8E8EC;">&middot;</span>&nbsp;
                      Dubai &amp; London
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

async function generateEmailCopy(data) {
  const hasAppOpportunity = data.app_hook && data.app_hook.trim().length > 0;

  const auditContext = hasAppOpportunity
    ? `We ran a three-dimension audit across their digital presence:
- UX Score: ${data.ux_score}/100 (${data.ux_grade}) — ${data.ux_hook}
- SEO Score: ${data.seo_score}/100 (${data.seo_grade}) — ${data.seo_hook}
- App Opportunity: ${data.app_opportunity_grade} — ${data.app_hook}`
    : `We ran a two-dimension audit across their digital presence:
- UX Score: ${data.ux_score}/100 (${data.ux_grade}) — ${data.ux_hook}
- SEO Score: ${data.seo_score}/100 (${data.seo_grade}) — ${data.seo_hook}`;

  const dimensionRule = hasAppOpportunity
    ? `3. In the next paragraph, naturally reference all three audit scores with the actual numbers and briefly explain the top finding from each dimension — frame these as observations from our assessment, not criticisms. Scores are from a specific audit we ran. Do not invent or estimate any competitor statistics not explicitly stated above.`
    : `3. In the next paragraph, naturally reference both audit scores with the actual numbers and briefly explain the top finding from each — frame these as observations from our assessment, not criticisms. Scores are from a specific audit we ran, not a live or real-time metric.`;

  const prompt = `You are writing a cold outreach email on behalf of RUONALIM, a premium product design agency based in Dubai and London. Write to ${data.contact_name} at ${data.company_name} (${data.industry}).

${auditContext}

Write a warm, confident outreach email following these rules exactly:
1. Use "we/our/us" throughout — RUONALIM team voice, never "I"
2. Open with one sentence of genuine curiosity about the business or space they're in
${dimensionRule}
4. Close by saying we'd love to walk them through the full report and specific fixes on a quick call — keep it low-pressure, 15-20 minutes
5. Tone: collaborative, direct, senior. No exclamation marks. No em dashes.
6. Under 200 words total. Body as 2-3 paragraphs separated by double newlines.
7. CTA must be 3-5 words max — a clear, confident action phrase. Examples: "Book a quick call", "Let's walk you through it", "See the full report". No punctuation at the end.

Respond ONLY with valid JSON, no preamble, no markdown:
{"subject": "<punchy subject line under 8 words>", "greeting": "Hi ${data.contact_name},", "body": "<2-3 paragraphs separated by \\n\\n>", "cta": "Book a quick call"}`;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-opus-4-5-20251101",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Claude API error: " + err.slice(0, 300));
  }

  const result = await res.json();
  const textBlock = result.content?.filter(b => b.type === "text").pop();
  if (!textBlock?.text) throw new Error("No text in Claude response");

  const raw = textBlock.text.replace(/```json|```/g, "").trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response: " + raw.slice(0, 200));

  const emailContent = JSON.parse(match[0]);
  const htmlBody = buildHtmlEmail({ ...emailContent, company_name: data.company_name, website_url: data.website_url, report_url: data.report_url });

  return { ...emailContent, html_body: htmlBody };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const data = req.method === "POST" ? req.body : req.query;

  const required = ["company_name", "contact_name", "ux_score", "ux_grade", "ux_hook",
                    "seo_score", "seo_grade", "seo_hook"];
  // app_opportunity_grade and app_hook are optional — omitted or empty means no app dimension in the email

  for (const field of required) {
    if (!data[field] && data[field] !== 0) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  try {
    const emailData = await generateEmailCopy(data);
    return res.json(emailData);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
