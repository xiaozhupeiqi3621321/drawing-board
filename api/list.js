import { get } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const password = req.query.password || '';
  const envPwd = process.env.GALLERY_PASSWORD || '';

  if (envPwd && password !== envPwd) {
    return res.status(401).json({ error: '密码错误' });
  }

  try {
    const result = await get('gallery.json', { access: 'private' });
    if (!result) return res.json([]);
    const text = await new Response(result.stream).text();
    const list = JSON.parse(text);
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return res.json(list);
  } catch (err) {
    console.error('list error:', err.message);
    return res.status(500).json({ error: '服务器内部错误: ' + err.message });
  }
}
