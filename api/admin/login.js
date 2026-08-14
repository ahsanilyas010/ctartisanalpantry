const { checkAdminPassword, createSessionToken, setSessionCookie, clearSessionCookie, getSession } = require('../../lib/auth');

// Simple in-memory rate limiting per serverless instance — a light
// deterrent against brute force, not a substitute for a real WAF.
const attempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function tooManyAttempts(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(key, { count: 1, start: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

module.exports = async (req, res) => {
  const action = req.query && req.query.action;

  // GET /api/admin/me (rewritten to /api/admin/login?action=me)
  if (action === 'me') {
    const session = getSession(req);
    if (!session) return res.status(401).json({ authenticated: false });
    return res.status(200).json({ authenticated: true, username: session.u });
  }

  // POST /api/admin/logout (rewritten to /api/admin/login?action=logout)
  if (action === 'logout') {
    clearSessionCookie(res);
    return res.status(200).json({ ok: true });
  }

  // POST /api/admin/login
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (tooManyAttempts(String(ip))) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { username, password } = body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  let ok = false;
  try {
    ok = await checkAdminPassword(String(username), String(password));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server is not configured for admin login yet.' });
  }

  if (!ok) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  const token = createSessionToken(String(username));
  setSessionCookie(res, token);
  res.status(200).json({ ok: true });
};
