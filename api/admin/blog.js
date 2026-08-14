const { sql } = require('../../lib/db');
const { requireAdmin } = require('../../lib/auth');

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const posts = await sql`SELECT * FROM blog_posts ORDER BY id ASC`;
      res.status(200).json({ posts });
      return;
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    if (req.method === 'POST') {
      const { title, excerpt, cover_image, body_html, meta_description, published } = body;
      if (!title) {
        res.status(400).json({ error: 'Title is required.' });
        return;
      }
      const slug = slugify(title);
      const [post] = await sql`
        INSERT INTO blog_posts (slug, title, excerpt, cover_image, body_html, meta_description, published)
        VALUES (
          ${slug}, ${title}, ${excerpt || null}, ${cover_image || null},
          ${body_html || null}, ${meta_description || null}, ${published !== false}
        )
        RETURNING *
      `;
      res.status(201).json({ post });
      return;
    }

    const id = Number(req.query.id);
    if (!id) {
      res.status(400).json({ error: 'Missing post id.' });
      return;
    }

    if (req.method === 'PUT') {
      const { title, excerpt, cover_image, body_html, meta_description, published } = body;
      const [post] = await sql`
        UPDATE blog_posts SET
          title = COALESCE(${title}, title),
          excerpt = COALESCE(${excerpt}, excerpt),
          cover_image = COALESCE(${cover_image}, cover_image),
          body_html = COALESCE(${body_html}, body_html),
          meta_description = COALESCE(${meta_description}, meta_description),
          published = COALESCE(${published}, published),
          updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `;
      if (!post) {
        res.status(404).json({ error: 'Post not found.' });
        return;
      }
      res.status(200).json({ post });
      return;
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM blog_posts WHERE id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('blog api error:', err);
    res.status(500).json({ error: String(err.message || err) });
  }
};
