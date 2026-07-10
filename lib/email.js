const { Resend } = require('resend');

function getNotifyEmails() {
  const raw = process.env.ORDER_NOTIFY_EMAILS || 'ahsanilyas35@gmail.com';
  return raw.split(',').map((e) => e.trim()).filter(Boolean);
}

function formatPkr(amount) {
  return 'Rs ' + Number(amount).toLocaleString('en-PK');
}

async function sendOrderNotification(order, items) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set — skipping order notification email.');
    return { sent: false, reason: 'missing_api_key' };
  }

  const resend = new Resend(apiKey);

  const itemRows = items
    .map(
      (it) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${it.product_name}</td>` +
        `<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;">${it.quantity}</td>` +
        `<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${formatPkr(it.unit_price_pkr)}</td>` +
        `<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${formatPkr(it.line_total_pkr)}</td></tr>`
    )
    .join('');

  const paymentLabel = order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="margin-bottom:4px;">New order ${order.order_number}</h2>
      <p style="color:#666;margin-top:0;">${new Date(order.created_at).toLocaleString('en-PK')}</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #333;">Item</th>
            <th style="text-align:center;padding:6px 12px;border-bottom:2px solid #333;">Qty</th>
            <th style="text-align:right;padding:6px 12px;border-bottom:2px solid #333;">Price</th>
            <th style="text-align:right;padding:6px 12px;border-bottom:2px solid #333;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="font-size:18px;"><strong>Order total: ${formatPkr(order.subtotal_pkr)}</strong></p>
      <h3>Customer</h3>
      <p>
        ${order.customer_name}<br>
        ${order.customer_phone}<br>
        ${order.customer_address}
      </p>
      <h3>Payment method</h3>
      <p>${paymentLabel}</p>
      ${order.notes ? `<h3>Notes</h3><p>${order.notes}</p>` : ''}
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'CT Artisanal Pantry <onboarding@resend.dev>',
      to: getNotifyEmails(),
      subject: `New order ${order.order_number} — ${formatPkr(order.subtotal_pkr)}`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('Failed to send order notification email:', err);
    return { sent: false, reason: 'send_failed' };
  }
}

module.exports = { sendOrderNotification, formatPkr };
