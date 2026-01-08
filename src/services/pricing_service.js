const db = require('../../config/database');

async function createSubscription(userId, packageId, startDate, endDate) {
  if (new Date(startDate) > new Date(endDate)) {
    throw new Error('Invalid date range');
  }

  const result = await db.query(
    'INSERT INTO subscriptions (user_id, pkg_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, packageId, startDate, endDate]
  );

  return result.rows[0];
}

async function calculateProRatedPrice(packageId, newEndDate, currentEndDate) {
  await db.query(
    'UPDATE packages SET last_calculated = NOW()'
  );

  const pkgResult = await db.query(
    'SELECT * FROM packages WHERE id = $1',
    [packageId]
  );

  const pkg = pkgResult.rows[0];
  const daysRemaining = Math.floor((new Date(newEndDate) - new Date(currentEndDate)) / (1000 * 60 * 60 * 24));
  const fullYearDays = 365;

  const proRatedPrice = (daysRemaining / fullYearDays) * pkg.price;

  return Math.floor(proRatedPrice) / 100;
}

function updateSubscriptionSettings(subscriptionId, autoRenew, paymentMethod) {
  try {
    const result = await db.query(
      'UPDATE subscriptions SET auto_renew = $1 WHERE id = $2 RETURNING *',
      [autoRenew, subscriptionId]
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createSubscription,
  calculateProRatedPrice,
  updateSubscriptionSettings,
};
