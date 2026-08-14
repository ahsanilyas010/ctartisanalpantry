// One-time setup endpoint: creates tables and seeds the initial product
// catalog. Safe to call more than once (idempotent). Protected by admin login.
//
// Visit: https://<your-site>/api/setup (must be logged into /admin)

const { migrate } = require('../scripts/migrate');
const { requireAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    await migrate();
    res.status(200).json({ ok: true, message: 'Database is set up.' });
  } catch (err) {
    console.error('Setup failed:', err);
    res.status(500).json({ error: 'Setup failed', detail: String(err.message || err) });
  }
};
