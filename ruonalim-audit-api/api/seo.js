const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function runSEOAudit(url) {
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
        content: `You are a senior SEO auditor. Analyse the website at ${url}.

Use web_search to visit the site and assess the following SEO signals:

1. Title tag — present, unique, under 60 chars, keyword-rich
2. Meta description — present, compelling, under 160 chars
3. Heading structure — logical H1/H2/H3 hierarchy
4. Image alt text — images have descriptive alt attributes
5. Page speed signals — any obvious performance issues (heavy images, no lazy load, render-blocking)
6. Mobile responsiveness — viewport meta tag, responsive layout
7. Internal linking — links between pages, logical site structure
8. Content quality — thin content, keyword stuffing, or duplicate content signals
9. Structured data — schema markup present
10. HTTPS and canonical — secure, no duplicate URL issues

Score each 0-10. Respond ONLY with valid JSON, no preamble, no markdown:

{
  "overall_score": <0-100>,
  "grade": "<A|B|C|D|F>",
  "summary": "<one line: the single biggest SEO problem>",
  "email_hook": "<punchy cold outreach line specific to this site's SEO gaps>",
  "checks": [
    {
      "id": <1-10>,
      "name": "<check name>",
      "score": <0-10>,
      "finding": "<specific finding for this site>",
      "severity": "<critical|moderate|minor|pass>"
    }
  ],
  "top_issues": [
    {
      "title": "<issue title>",
      "description": "<2-3 sentences. Be specific — name the actual page or element>",
      "check_id": <number>,
      "severity": "<critical|moderate>"
    }
  ]
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

  const raw = textBlock.text.replace(/```json|```/g, "").trim();
  // Extract the JSON object even if Claude adds prose around it
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response: " + raw.slice(0, 200));
  return JSON.parse(match[0]);
}

function grade(score) {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  let url = req.method === "POST" ? req.body?.url : req.query?.url;
  if (!url) return res.status(400).json({ error: "url required" });
  if (!url.startsWith("http")) url = "https://" + url;

  try {
    const result = await runSEOAudit(url);
    result.grade = grade(result.overall_score);
    result.url = url;
    result.audited_at = new Date().toISOString();
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
