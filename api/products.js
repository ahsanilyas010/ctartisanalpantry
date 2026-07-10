const { sql } = require('../lib/db');

// Public endpoint: list active products for the shop page.
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const products = await sql`
    SELECT slug, name, description, unit_label, price_pkr, stock_quantity, image_path
    FROM products
    WHERE active = true
    ORDER BY id ASC
  `;

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  res.status(200).json({ products });
};
