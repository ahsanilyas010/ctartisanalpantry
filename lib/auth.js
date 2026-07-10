const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const COOKIE_NAME = 'ct_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set.');
  }
  return secret;
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payloadB64) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');
}

function createSessionToken(username) {
  const payload = JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = base64url(payload);
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  const expected = sign(payloadB64);
  const sigBuf = Buffer.from(signature || '', 'base64url');
  const expBuf = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

function setSessionCookie(res, token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  );
}

function getSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  return verifySessionToken(token);
}

/** Returns the session if valid, otherwise writes a 401 response and returns null. */
function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }
  return session;
}

async function checkAdminPassword(username, password) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUsername || !passwordHash) {
    throw new Error('ADMIN_USERNAME / ADMIN_PASSWORD_HASH environment variables are not set.');
  }
  if (username !== expectedUsername) return false;
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  requireAdmin,
  checkAdminPassword,
};
