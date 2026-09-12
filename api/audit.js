export const config = { runtime: 'edge' };

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: cors()
    });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: cors()
    });
  }

  const url = (body.url || '').trim();
  const images = Array.isArray(body.images) ? body.images.slice(0, 5) : [];

  if (!url && images.length === 0) {
    return new Response(JSON.stringify({ error: 'url or images required' }), {
      status: 400, headers: cors()
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500, headers: cors()
    });
  }

  const urlContext = url ? `The website URL is: ${url}` : '';
  const screenshotContext = images.length > 0
    ? `${images.length} screenshot${images.length > 1 ? 's' : ''} of the product have been provided as images.`
    : '';
  const webSearchInstruction = url
    ? `Use web_search to visit ${url} and analyse it.`
    : `Analyse only the screenshots provided — no web search needed.`;

  const prompt = `You are a senior UX consultant. ${urlContext} ${screenshotContext}

${webSearchInstruction}

Assess the product across:
1. Usability (Nielsen's 10 Heuristics)
2. Visual clarity and hierarchy
3. Accessibility
4. Conversion pathways

Score each area 0–100. Respond ONLY with valid JSON, no preamble, no markdown fences:

{
  "overall_score": <0-100 integer>,
  "grade": "<A|B|C|D|F>",
  "summary": "<one sentence: the single biggest UX problem or strength>",
  "categories": {
    "usability":      { "title": "Usability",      "score": <0-1 decimal> },
    "clarity":        { "title": "Clarity",         "score": <0-1 decimal> },
    "accessibility":  { "title": "Accessibility",   "score": <0-1 decimal> },
    "conversion":     { "title": "Conversion",      "score": <0-1 decimal> }
  },
  "issues": [
    "<specific actionable issue 1>",
    "<specific actionable issue 2>",
    "<specific actionable issue 3>"
  ]
}`;

  // Build message content
  const content = [];

  // Add images first (vision)
  for (const dataUrl of images) {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) continue;
    const [, mediaType, data] = match;
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data }
    });
  }

  content.push({ type: 'text', text: prompt });

  // Tools: only include web_search if URL provided
  const tools = url
    ? [{ type: 'web_search_20250305', name: 'web_search' }]
    : [];

  const requestBody = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1400,
    messages: [{ role: 'user', content }]
  };

  if (tools.length > 0) {
    requestBody.tools = tools;
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  };

  if (url) {
    headers['anthropic-beta'] = 'web-search-2025-03-05';
  }

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Claude API error: ' + err }), {
        status: 502, headers: cors()
      });
    }

    const data = await res.json();

    // Extract the last text block
    let text = '';
    for (const block of (data.content || [])) {
      if (block.type === 'text') text = block.text;
    }

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
