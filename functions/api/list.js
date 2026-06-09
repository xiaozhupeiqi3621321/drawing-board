const OWNER = 'xiaozhupeiqi3621321';
const REPO = 'drawing-board';
const FILE_PATH = 'gallery-data.json';
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const password = url.searchParams.get('password') || '';
  const envPwd = env.GALLERY_PASSWORD || '';

  if (envPwd && password !== envPwd) {
    return new Response(JSON.stringify({ error: '密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = env.GITHUB_TOKEN;
    const res = await fetch(API, { headers: { Authorization: `token ${token}` } });

    if (!res.ok) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    if (!data.content) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = atob(data.content.replace(/\n/g, ''));
    const list = JSON.parse(text);
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return new Response(JSON.stringify(list), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('list error:', err.message);
    return new Response(JSON.stringify({ error: '服务器内部错误: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
