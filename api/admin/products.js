const { sql } = require('../../lib/db');
const { requireAdmin } = require('../../lib/auth');

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const products = await sql`SELECT * FROM products ORDER BY id ASC`;
    res.status(200).json({ products });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  if (req.method === 'POST') {
    const { name, description, unit_label, price_pkr, stock_quantity, image_path, active } = body;
    if (!name || !Number.isFinite(Number(price_pkr))) {
      res.status(400).json({ error: 'Name and price are required.' });
      return;
    }
    const slug = slugify(name);
    const [product] = await sql`
      INSERT INTO products (slug, name, description, unit_label, price_pkr, stock_quantity, image_path, active)
      VALUES (
        ${slug}, ${name}, ${description || null}, ${unit_label || null},
        ${Math.round(Number(price_pkr))}, ${Math.max(0, Math.round(Number(stock_quantity) || 0))},
        ${image_path || null}, ${active !== false}
      )
      RETURNING *
    `;
    res.status(201).json({ product });
    return;
  }

  const id = Number(req.query.id);
  if (!id) {
    res.status(400).json({ error: 'Missing product id.' });
    return;
  }

  if (req.method === 'PUT') {
    const { name, description, unit_label, price_pkr, stock_quantity, image_path, active } = body;
    const [product] = await sql`
      UPDATE products SET
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        unit_label = COALESCE(${unit_label}, unit_label),
        price_pkr = COALESCE(${price_pkr != null ? Math.round(Number(price_pkr)) : null}, price_pkr),
        stock_quantity = COALESCE(${stock_quantity != null ? Math.round(Number(stock_quantity)) : null}, stock_quantity),
        image_path = COALESCE(${image_path}, image_path),
        active = COALESCE(${active}, active),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.status(200).json({ product });
    return;
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM products WHERE id = ${id}`;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
