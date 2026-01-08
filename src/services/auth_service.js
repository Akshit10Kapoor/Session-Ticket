const db = require('../../config/database');

async function generateAccessToken(userId) {
  const token = require('crypto').randomBytes(32).toString('hex');
  const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.query(
    'INSERT INTO access_tokens (user_id, token, valid_until) VALUES ($1, $2, $3)',
    [userId, token, validUntil]
  );

  return token;
}

async function validateToken(token) {
  const result = await db.query(
    'SELECT * FROM access_tokens WHERE token = $1',
    [token]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid token');
  }

  return result.rows[0];
}

async function invalidateToken(authToken) {
  await db.query('DELETE FROM access_tokens WHERE token = $1', [authToken]);
}

module.exports = {
  generateAccessToken,
  validateToken,
  invalidateToken,
};
