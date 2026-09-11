export const config = { runtime: 'edge' };

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: cors()
    });
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: cors()
    });
  }

  const url = (body.url || '').trim();
  if (!url) {
    return new Response(JSON.stringify({ error: 'url is required' }), {
      status: 400, headers: cors()
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500, headers: cors()
    });
  }

  const prompt = `You are a senior UX consultant. Analyse the website at ${url} against Nielsen's 10 Usability Heuristics.

Use web_search to visit the site and assess:

1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition over recall
7. Flexibility and efficiency
8. Aesthetic and minimalist design
9. Help users recognise and recover from errors
10. Help and documentation

Score each heuristic 0-10. Respond ONLY with valid JSON, no preamble, no markdown:

{
  "overall_score": <0-100>,
  "grade": "<A|B|C|D|F>",
  "summary": "<one sentence: the single biggest UX problem>",
  "categories": {
    "usability": { "title": "Usability", "score": <0-1 decimal> },
    "clarity": { "title": "Clarity", "score": <0-1 decimal> },
    "accessibility": { "title": "Accessibility", "score": <0-1 decimal> },
    "conversion": { "title": "Conversion", "score": <0-1 decimal> }
  },
  "issues": [
    "<specific issue 1>",
    "<specific issue 2>",
    "<specific issue 3>"
  ]
}`;

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Claude API error: ' + err }), {
        status: 502, headers: cors()
      });
    }

    const data = await res.json();

    // Extract text from response (last text block)
    let text = '';
    for (const block of (data.content || [])) {
      if (block.type === 'text') text = block.text;
    }

    // Parse JSON from Claude's response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Could not parse audit response', raw: text }), {
        status: 502, headers: cors()
      });
    }

    const result = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(result), {
      status: 200, headers: cors()
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: cors()
    });
  }
}

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
