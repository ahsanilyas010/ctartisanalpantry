const { neon } = require('@neondatabase/serverless');

let _sql = null;

function sql(...args) {
  if (!_sql) {
    const cs =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NON_POOLING;
    if (!cs) {
      throw new Error(
        'No database connection string found. Set DATABASE_URL in your Vercel project environment variables.'
      );
    }
    _sql = neon(cs);
  }
  return _sql(...args);
}

module.exports = { sql };
