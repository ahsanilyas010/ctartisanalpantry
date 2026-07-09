const { sql } = require('../lib/db');
const { sendOrderNotification } = require('../lib/email');

const PAYMENT_METHODS = new Set(['cod', 'bank_transfer']);
const MAX_QTY_PER_ITEM = 100;

function badRequest(res, message) {
  res.status(400).json({ error: message });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return badRequest(res, 'Invalid JSON body.');
    }
  }
  body = body || {};

  const { items, customer, payment_method, notes } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return badRequest(res, 'Your cart is empty.');
  }
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return badRequest(res, 'Please provide your name, phone number, and delivery address.');
  }
  if (!PAYMENT_METHODS.has(payment_method)) {
    return badRequest(res, 'Please choose a valid payment method.');
  }

  const requested = [];
  for (const raw of items) {
    const slug = String(raw.slug || '').trim();
    const quantity = Number(raw.quantity);
    if (!slug || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      return badRequest(res, 'Invalid item in cart.');
    }
    requested.push({ slug, quantity });
  }

  const slugs = requested.map((r) => r.slug);
  const products = await sql`
    SELECT id, slug, name, price_pkr, stock_quantity, active
    FROM products
    WHERE slug = ANY(${slugs})
  `;
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lineItems = [];
  for (const r of requested) {
    const product = bySlug.get(r.slug);
    if (!product || !product.active) {
      return badRequest(res, `"${r.slug}" is not available.`);
    }
    if (product.stock_quantity < r.quantity) {
      return badRequest(res, `Only ${product.stock_quantity} left of ${product.name}.`);
    }
    lineItems.push({
      product_id: product.id,
      product_name: product.name,
      unit_price_pkr: product.price_pkr,
      quantity: r.quantity,
      line_total_pkr: product.price_pkr * r.quantity,
    });
  }

  // Decrement stock atomically per-product; roll back any already-applied
  // decrements if a later one fails (e.g. concurrent order used up stock).
  const decremented = [];
  for (const item of lineItems) {
    const result = await sql`
      UPDATE products
      SET stock_quantity = stock_quantity - ${item.quantity}, updated_at = now()
      WHERE id = ${item.product_id} AND stock_quantity >= ${item.quantity}
      RETURNING id
    `;
    if (result.length === 0) {
      for (const done of decremented) {
        await sql`UPDATE products SET stock_quantity = stock_quantity + ${done.quantity} WHERE id = ${done.product_id}`;
      }
      return badRequest(res, `${item.product_name} just sold out. Please remove it and try again.`);
    }
    decremented.push(item);
  }

  const subtotal = lineItems.reduce((sum, it) => sum + it.line_total_pkr, 0);

  const [order] = await sql`
    INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, payment_method, subtotal_pkr, notes)
    VALUES ('PENDING', ${customer.name}, ${customer.phone}, ${customer.address}, ${payment_method}, ${subtotal}, ${notes || null})
    RETURNING id, created_at
  `;

  const orderNumber = 'CT-' + String(order.id).padStart(5, '0');
  await sql`UPDATE orders SET order_number = ${orderNumber} WHERE id = ${order.id}`;

  for (const item of lineItems) {
    await sql`
      INSERT INTO order_items (order_id, product_id, product_name, unit_price_pkr, quantity, line_total_pkr)
      VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.unit_price_pkr}, ${item.quantity}, ${item.line_total_pkr})
    `;
  }

  const emailResult = await sendOrderNotification(
    {
      order_number: orderNumber,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      payment_method,
      subtotal_pkr: subtotal,
      notes,
      created_at: order.created_at,
    },
    lineItems
  );

  if (!emailResult.sent) {
    console.error('Order', orderNumber, 'saved but notification email was not sent:', emailResult.reason);
  }

  res.status(200).json({ order_number: orderNumber, subtotal_pkr: subtotal });
};
