const { sql } = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');

  try {
    const { slug } = req.query;

    if (slug) {
      const [post] = await sql`
        SELECT slug, title, excerpt, cover_image, body_html, meta_description, custom_url
        FROM blog_posts
        WHERE slug = ${slug} AND published = true
      `;
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      res.status(200).json({ post });
      return;
    }

    const posts = await sql`
      SELECT slug, title, excerpt, cover_image, custom_url
      FROM blog_posts
      WHERE published = true
      ORDER BY id ASC
    `;
    res.status(200).json({ posts });
  } catch (err) {
    console.error('blog api error:', err);
    res.status(500).json({ error: String(err.message || err) });
  }
};
