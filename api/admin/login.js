const { checkAdminPassword, createSessionToken, setSessionCookie } = require('../../lib/auth');

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
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (tooManyAttempts(String(ip))) {
    res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
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
  const { username, password } = body || {};

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  let ok = false;
  try {
    ok = await checkAdminPassword(String(username), String(password));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server is not configured for admin login yet.' });
    return;
  }

  if (!ok) {
    res.status(401).json({ error: 'Incorrect username or password.' });
    return;
  }

  const token = createSessionToken(String(username));
  setSessionCookie(res, token);
  res.status(200).json({ ok: true });
};
