// One-time setup endpoint: creates tables and seeds the initial product
// catalog. Safe to call more than once (idempotent). Protected by a token
// so random visitors can't trigger it.
//
// Visit: https://<your-site>/api/setup?token=<SETUP_TOKEN>

const { migrate } = require('../scripts/migrate');

module.exports = async (req, res) => {
  const token = process.env.SETUP_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'SETUP_TOKEN environment variable is not set.' });
    return;
  }
  if (req.query.token !== token) {
    res.status(401).json({ error: 'Invalid or missing token.' });
    return;
  }

  try {
    await migrate();
    res.status(200).json({ ok: true, message: 'Database is set up.' });
  } catch (err) {
    console.error('Setup failed:', err);
    res.status(500).json({ error: 'Setup failed', detail: String(err.message || err) });
  }
};
