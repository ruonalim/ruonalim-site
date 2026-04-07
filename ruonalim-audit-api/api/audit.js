const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function runUXAudit(url) {
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
        content: `You are a senior UX consultant. Analyse the website at ${url} against Nielsen's 10 Usability Heuristics.

Use web_search to visit the site and assess:

1. Visibility of system status — does the UI give feedback on what's happening?
2. Match between system and real world — does it use language users understand?
3. User control and freedom — can users undo, go back, escape easily?
4. Consistency and standards — are UI patterns consistent across pages?
5. Error prevention — does the design prevent mistakes before they happen?
6. Recognition over recall — are options visible rather than requiring memory?
7. Flexibility and efficiency — are there shortcuts for experienced users?
8. Aesthetic and minimalist design — is the UI clean and free of clutter?
9. Help users recognise, diagnose, recover from errors — are error messages helpful?
10. Help and documentation — is support easy to find when needed?

Score each heuristic 0-10. Respond ONLY with valid JSON, no preamble, no markdown:

{
  "overall_score": <0-100>,
  "grade": "<A|B|C|D|F>",
  "summary": "<one line: the single biggest UX problem>",
  "email_hook": "<punchy cold outreach line specific to this site's UX gaps>",
  "checks": [
    {
      "id": <1-10>,
      "name": "<heuristic name>",
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

  const clean = textBlock.text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response: " + clean.slice(0, 200));
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
    const result = await runUXAudit(url);
    result.grade = grade(result.overall_score);
    result.url = url;
    result.audited_at = new Date().toISOString();
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
