const { sql } = require('../../lib/db');
const { requireAdmin } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM site_content ORDER BY section, sort_order, key`;
    res.status(200).json({ content: rows });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  if (req.method === 'PUT') {
    const { section, key } = req.query;
    if (!section || !key) {
      res.status(400).json({ error: 'section and key query params are required.' });
      return;
    }
    const { value } = body;
    const [row] = await sql`
      UPDATE site_content
      SET value = ${value ?? null}, updated_at = now()
      WHERE section = ${section} AND key = ${key}
      RETURNING *
    `;
    if (!row) {
      res.status(404).json({ error: 'Content entry not found.' });
      return;
    }
    res.status(200).json({ row });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
