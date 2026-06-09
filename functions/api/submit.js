const OWNER = 'xiaozhupeiqi3621321';
const REPO = 'drawing-board';
const FILE_PATH = 'gallery-data.json';
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { image, message } = await request.json();
    if (!image) {
      return new Response(JSON.stringify({ error: '缺少图像数据' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const entry = { id, image, message: message || '', createdAt: Date.now() };

    const token = env.GITHUB_TOKEN;
    const headers = { Authorization: `token ${token}` };

    let list = [];
    let sha = '';

    const res = await fetch(API, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.content) {
        const text = atob(data.content.replace(/\n/g, ''));
        list = JSON.parse(text);
        sha = data.sha;
      }
    }

    list.push(entry);

    const body = {
      message: `add entry ${id}`,
      content: btoa(JSON.stringify(list)),
    };
    if (sha) body.sha = sha;

    await fetch(API, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return new Response(JSON.stringify({ ok: true, id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('submit error:', err.message);
    return new Response(JSON.stringify({ error: '服务器内部错误: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
