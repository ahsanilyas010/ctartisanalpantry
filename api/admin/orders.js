const { sql } = require('../../lib/db');
const { requireAdmin } = require('../../lib/auth');

const VALID_STATUSES = new Set(['pending', 'confirmed', 'shipped', 'completed', 'cancelled']);

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === 'GET') {
    if (id) {
      const [order] = await sql`SELECT * FROM orders WHERE id = ${id}`;
      if (!order) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      const items = await sql`SELECT * FROM order_items WHERE order_id = ${id} ORDER BY id ASC`;
      res.status(200).json({ order, items });
      return;
    }
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 500`;
    res.status(200).json({ orders });
    return;
  }

  if (req.method === 'PATCH') {
    if (!id) {
      res.status(400).json({ error: 'Missing order id.' });
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
    const { status } = body || {};
    if (!VALID_STATUSES.has(status)) {
      res.status(400).json({ error: 'Invalid status.' });
      return;
    }
    const [order] = await sql`
      UPDATE orders SET status = ${status}, updated_at = now() WHERE id = ${id} RETURNING *
    `;
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.status(200).json({ order });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
