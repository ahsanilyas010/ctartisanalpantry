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

  try {
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

    const subtotal = lineItems.reduce((sum, it) => sum + it.line_total_pkr, 0);

    // Build typed arrays for unnest — keeps the CTE fully parameterised.
    const productIds   = lineItems.map((i) => i.product_id);
    const quantities   = lineItems.map((i) => i.quantity);
    const productNames = lineItems.map((i) => i.product_name);
    const unitPrices   = lineItems.map((i) => i.unit_price_pkr);
    const lineTotals   = lineItems.map((i) => i.line_total_pkr);
    const itemCount    = lineItems.length;

    // Single CTE: decrement stock, insert order + items, set order_number —
    // all in one atomic statement. If not all stock decrements succeed the
    // WHERE COUNT(*) = itemCount guard prevents the order from being inserted
    // and PostgreSQL rolls back the partial decrements too.
    const [orderRow] = await sql`
      WITH
        item_data(product_id, qty, product_name, unit_price, line_total) AS (
          SELECT * FROM unnest(
            ${productIds}::int[],
            ${quantities}::int[],
            ${productNames}::text[],
            ${unitPrices}::int[],
            ${lineTotals}::int[]
          )
        ),
        decremented AS (
          UPDATE products
          SET stock_quantity = stock_quantity - item_data.qty,
              updated_at     = now()
          FROM item_data
          WHERE products.id = item_data.product_id
            AND products.stock_quantity >= item_data.qty
          RETURNING products.id AS product_id
        ),
        new_order AS (
          INSERT INTO orders
            (order_number, customer_name, customer_phone, customer_address,
             payment_method, subtotal_pkr, notes)
          SELECT
            'PENDING',
            ${customer.name},
            ${customer.phone},
            ${customer.address},
            ${payment_method},
            ${subtotal},
            ${notes || null}
          WHERE (SELECT COUNT(*) FROM decremented) = ${itemCount}::int
          RETURNING id, created_at
        ),
        order_numbered AS (
          UPDATE orders
          SET order_number = 'CT-' || LPAD(new_order.id::text, 5, '0')
          FROM new_order
          WHERE orders.id = new_order.id
          RETURNING orders.id, orders.order_number, new_order.created_at
        ),
        _items AS (
          INSERT INTO order_items
            (order_id, product_id, product_name, unit_price_pkr, quantity, line_total_pkr)
          SELECT
            new_order.id,
            item_data.product_id,
            item_data.product_name,
            item_data.unit_price,
            item_data.qty,
            item_data.line_total
          FROM new_order
          CROSS JOIN item_data
          RETURNING order_id
        )
      SELECT id, order_number, created_at
      FROM order_numbered
    `;

    if (!orderRow) {
      return badRequest(res, 'One or more items just sold out. Please refresh your cart and try again.');
    }

    const emailResult = await sendOrderNotification(
      {
        order_number:     orderRow.order_number,
        customer_name:    customer.name,
        customer_phone:   customer.phone,
        customer_address: customer.address,
        payment_method,
        subtotal_pkr:     subtotal,
        notes,
        created_at:       orderRow.created_at,
      },
      lineItems
    );

    if (!emailResult.sent) {
      console.error('Order', orderRow.order_number, 'saved but notification email was not sent:', emailResult.reason);
    }

    res.status(200).json({ order_number: orderRow.order_number, subtotal_pkr: subtotal });
  } catch (err) {
    console.error('order api error:', err);
    res.status(500).json({ error: 'Something went wrong placing your order. Please try again.' });
  }
};
