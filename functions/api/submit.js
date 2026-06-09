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

    const bucket = env.GALLERY;
    let list = [];
    try {
      const existing = await bucket.get('gallery.json');
      if (existing) {
        const text = await existing.text();
        list = JSON.parse(text);
      }
    } catch (_) {}

    list.push(entry);

    await bucket.put('gallery.json', JSON.stringify(list), {
      httpMetadata: { contentType: 'application/json' },
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
