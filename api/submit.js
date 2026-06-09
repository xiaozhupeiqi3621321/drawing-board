import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, message } = req.body;
    if (!image) return res.status(400).json({ error: '缺少图像数据' });

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const entry = { id, image, message: message || '', createdAt: Date.now() };

    let list = [];
    try {
      const existing = await get('gallery.json', { access: 'private' });
      if (existing) {
        const text = await existing.text();
        list = JSON.parse(text);
      }
    } catch (_) {}

    list.push(entry);

    await put('gallery.json', JSON.stringify(list), {
      contentType: 'application/json',
      access: 'private',
    });

    return res.json({ ok: true, id });
  } catch (err) {
    console.error('submit error:', err.message);
    return res.status(500).json({ error: '服务器内部错误: ' + err.message });
  }
}
