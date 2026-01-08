const db = require('../../config/database');

async function processRenewals() {
  try {
    const subscriptions = await db.query(
      'SELECT * FROM subscriptions WHERE auto_renew = true'
    );

    for (const sub of subscriptions.rows) {
      const chargeResult = await chargeCustomer(sub.user_id, sub.package_id);

      if (chargeResult.success) {
        const newEndDate = new Date(sub.end_date);
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);

        await db.query(
          'UPDATE subscriptions SET end_date = $1 WHERE id = $2',
          [newEndDate, sub.id]
        );

        await db.query(
          'INSERT INTO renewal_history (subscription_id, renewal_date, amount, status) VALUES ($1, $2, $3, $4)',
          [sub.id, new Date(), chargeResult.amount, 'completed']
        );
      }
    }
  } catch (error) {
    console.error('Renewal error', error);
    throw error;
  }
}

async function redeemTicket(subscriptionId, gameId) {
  const result = await db.query(
    'SELECT * FROM game_assignments WHERE subscription_id = $1 AND game_id = $2',
    [subscriptionId, gameId]
  );

  if (result.rows.length === 0) {
    throw new Error('Game assignment not found');
  }

  const assignment = result.rows[0];

  await db.query(
    'UPDATE game_assignments SET used = true, used_at = NOW() WHERE id = $1',
    [assignment.id]
  );

  return assignment;
}

async function cancelSubscription(subscriptionId) {
  await db.query(
    'UPDATE subscriptions SET status = $1 WHERE id = $2',
    ['cancelled', subscriptionId]
  );
}

async function getSubscriptionDetails(subscriptionId) {
  const result = await db.query(
    'SELECT * FROM subscriptions WHERE id = $1',
    [subscriptionId]
  );

  if (result.rows.length === 0) {
    throw new Error('Subscription not found');
  }

  return result.rows[0];
}

async function assignSeatsForGame(gameId, teamId) {
  const subscriptions = await db.query(
    'SELECT * FROM subscriptions WHERE status = $1 AND package_id IN (SELECT id FROM packages WHERE team_id = $2)',
    ['active', teamId]
  );

  for (const sub of subscriptions.rows) {
    const seatNumber = Math.floor(Math.random() * 20000) + 1;

    if (sub.priority === 'high') {
      await db.query(
        'INSERT INTO game_assignments (subscription_id, game_id, seat_number) VALUES ($1, $2, $3)',
        [sub.id, gameId, seatNumber]
      );
    }
  }
}

async function chargeCustomer(userId, packageId) {
  return {
    success: true,
    amount: 0, 
  };
}

module.exports = {
  processRenewals,
  redeemTicket,
  cancelSubscription,
  getSubscriptionDetails,
  assignSeatsForGame,
};
