const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function runAppAudit(url, companyName, industry) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `You are a senior mobile product strategist. Analyse the app presence for the company at ${url}${companyName ? ` (company: ${companyName})` : ""}${industry ? ` in the ${industry} industry` : ""}.

Use web_search to:
1. Search for "${companyName || url} app iOS App Store" — does this company have an iOS app?
2. Search for "${companyName || url} app Google Play" — do they have an Android app?
3. Search for "${industry || "this type of business"} top competitors app" — do their competitors have apps?
4. Assess whether their product/service category typically benefits from a mobile app

Evaluate:
- App existence: do they have an app on iOS / Android?
- If yes: app rating (out of 5), number of reviews, last updated date, top user complaints from reviews
- If no: gap severity based on industry norms and competitor presence
- App opportunity score: how much would a quality app benefit this business (0-100)
- Recommendation: one of "build_new_app" | "redesign_existing_app" | "no_app_needed" | "low_priority"

IMPORTANT RULES:
1. If your recommendation is "no_app_needed" or "low_priority", set email_hook to "" (empty string). Do not suggest a mobile app to businesses where it isn't genuinely warranted — consulting firms, B2B services, professional services, and similar categories typically do not benefit from a consumer app.
2. Do NOT state specific percentages about competitor app adoption (e.g. "60% of competitors have apps") unless your web_search actually returned that exact statistic from a citable source. If you found real competitor app examples via search, list them in competitor_examples and include their store URLs in competitor_reference_urls.
3. Only include competitor claims in email_hook if you have verified evidence from your search.

Respond ONLY with valid JSON, no preamble, no markdown:

{
  "has_ios_app": <true|false>,
  "has_android_app": <true|false>,
  "ios_app_name": "<app name or null>",
  "ios_rating": <0-5 or null>,
  "ios_review_count": <number or null>,
  "ios_last_updated": "<date string or null>",
  "android_rating": <0-5 or null>,
  "android_review_count": <number or null>,
  "top_complaints": ["<complaint 1>", "<complaint 2>", "<complaint 3>"],
  "competitors_have_apps": <true|false|null>,
  "competitor_examples": ["<competitor name + app name>"],
  "competitor_reference_urls": ["<app store URL or web source URL for each competitor example — only real URLs found via search>"],
  "opportunity_score": <0-100>,
  "recommendation": "<build_new_app|redesign_existing_app|no_app_needed|low_priority>",
  "recommendation_label": "<human readable label>",
  "summary": "<one line: the core app opportunity or gap for this business>",
  "email_hook": "<punchy cold outreach line about their app gap — empty string if recommendation is no_app_needed or low_priority>",
  "rationale": "<2-3 sentences explaining why the recommendation was made>"
}`
      }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Claude API error: " + err.slice(0, 300));
  }

  const data = await res.json();
  const textBlock = data.content?.filter(b => b.type === "text").pop();
  if (!textBlock?.text) throw new Error("No text response from Claude");

  const clean = textBlock.text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response: " + clean.slice(0, 200));
  return JSON.parse(match[0]);
}

function opportunityGrade(score) {
  if (score >= 80) return "High";
  if (score >= 55) return "Medium";
  if (score >= 30) return "Low";
  return "None";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const body = req.method === "POST" ? req.body : req.query;
  let { url, company_name, industry } = body || {};

  if (!url) return res.status(400).json({ error: "url required" });
  if (!url.startsWith("http")) url = "https://" + url;

  try {
    const result = await runAppAudit(url, company_name, industry);
    result.opportunity_grade = opportunityGrade(result.opportunity_score);
    result.url = url;
    result.audited_at = new Date().toISOString();
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
