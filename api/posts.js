export const config = { runtime: 'edge' };

const DB_ID = 'f916976129764588b51847f85054f958';

export default async function handler(req) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'NOTION_TOKEN not set' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Status',    select:       { equals:   'Published' } },
            { property: 'Platforms', multi_select: { contains: 'Website'  } },
          ]
        },
        sorts: [{ property: 'Publish Date', direction: 'descending' }],
        page_size: 50,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status, headers: { 'Content-Type': 'application/json' }
      });
    }

    const posts = (data.results || []).map(page => {
      const p = page.properties;
      return {
        id:        page.id,
        title:     p['Article Title']?.title?.[0]?.plain_text ?? '',
        body:      p['Article Body']?.rich_text?.map(r => r.plain_text).join('') ?? '',
        topic:     p['Topic']?.select?.name ?? '',
        date:      p['Publish Date']?.date?.start ?? '',
        wordCount: p['Word Count']?.number ?? null,
      };
    });

    return new Response(JSON.stringify(posts), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
