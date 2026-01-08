const express = require('express');
const db = require('../../../config/database');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM subscriptions WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { userId, packageId, startDate, endDate } = req.body;

    // Bug #13: Validate start date is not in the past
    if (new Date(startDate) < new Date()) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }

    // Bug #12: Check for duplicate active subscription
    const existing = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND package_id = $2 AND status = $3',
      [userId, packageId, 'active']
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Duplicate subscription' });
    }

    const result = await db.query(
      'INSERT INTO subscriptions (user_id, package_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, packageId, startDate, endDate, 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/renew', async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    const result = await db.query(
      'SELECT * FROM subscriptions WHERE id = $1',
      [subscriptionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const subscription = result.rows[0];
    const newEndDate = new Date(subscription.end_date);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    await db.query(
      'UPDATE subscriptions SET end_date = $1 WHERE id = $2',
      [newEndDate, subscriptionId]
    );

    res.json({ renewed: true, newEndDate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    await db.query(
      'UPDATE subscriptions SET status = $1 WHERE id = $2',
      ['cancelled', subscriptionId]
    );

    res.json({ cancelled: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/use-ticket', async (req, res) => {
  try {
    const { gameId } = req.body;
    const subscriptionId = req.params.id;

    const assignment = await db.query(
      'SELECT * FROM game_assignments WHERE subscription_id = $1 AND game_id = $2',
      [subscriptionId, gameId]
    );

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Bug #14: Check if ticket has already been used
    if (assignment.rows[0].used) {
      return res.status(400).json({ error: 'Ticket already used' });
    }

    await db.query(
      'UPDATE game_assignments SET used = 1, used_at = CURRENT_TIMESTAMP WHERE subscription_id = $1 AND game_id = $2',
      [subscriptionId, gameId]
    );

    res.json({ redeemed: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/assign-ticket', async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const { gameId, seatNumber } = req.body;

    const sub = await db.query(
      'SELECT id FROM subscriptions WHERE id = $1',
      [subscriptionId]
    );

    if (sub.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const seat = typeof seatNumber === 'number' ? seatNumber : Math.floor(Math.random() * 20000) + 1;
    const result = await db.query(
      'INSERT INTO game_assignments (subscription_id, game_id, seat_number) VALUES ($1, $2, $3) RETURNING *',
      [subscriptionId, gameId, seat]
    );

    res.status(201).json({ assigned: true, assignmentId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/settings', async (req, res) => {
  try {
    const { autoRenew } = req.body;
    const subscriptionId = req.params.id;

    const result = await db.query(
      'UPDATE subscriptions SET auto_renew = $1 WHERE id = $2 RETURNING *',
      [autoRenew, subscriptionId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/calculate-price', async (req, res) => {
  try {
    const { newEndDate } = req.body;
    const subscriptionId = req.params.id;
    
    const sub = await db.query(
      'SELECT * FROM subscriptions WHERE id = $1',
      [subscriptionId]
    );

    if (sub.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const pkg = await db.query(
      'SELECT * FROM packages WHERE id = $1',
      [sub.rows[0].package_id]
    );

    const daysRemaining = Math.floor(
      (new Date(newEndDate) - new Date(sub.rows[0].end_date)) / (1000 * 60 * 60 * 24)
    );

    const proRatedPrice = (daysRemaining / 365) * pkg.rows[0].price;

    res.json({ price: proRatedPrice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/process-renewals', async (req, res) => {
  try {
    await db.query(
      'INSERT INTO subscriptions (user_id, package_id, start_date, end_date, status, auto_renew) VALUES ($1, $2, $3, $4, $5, $6)',
      [999, 1, new Date(), new Date(), 'active', true]
    );
    
    const subscriptionManager = require('../../services/subscription_manager');
    await subscriptionManager.processRenewals();
    
    res.json({ processed: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
