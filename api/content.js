const { sql } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    const rows = await sql`
      SELECT section, key, value, content_type
      FROM site_content
      ORDER BY section, sort_order, key
    `;

    const content = {};
    for (const row of rows) {
      const k = `${row.section}:${row.key}`;
      if (row.content_type === 'json') {
        try { content[k] = JSON.parse(row.value); } catch { content[k] = row.value; }
      } else {
        content[k] = row.value;
      }
    }

    res.status(200).json({ content });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
