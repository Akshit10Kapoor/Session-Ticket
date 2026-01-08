const db = require('../../config/database');
const logger = require('../utils/logger');

async function processAutoRenewals() {
  try {
    logger.info('Starting auto-renewal worker');

    const result = await db.query(`
      SELECT s.*, p.price FROM subscriptions s
      JOIN packages p ON s.package_id = p.id
      WHERE s.auto_renew = true
      AND s.end_date <= CURRENT_DATE
      AND s.status = 'active'
    `);

    const subscriptions = result.rows;
    logger.info(`Found ${subscriptions.length} subscriptions to renew`);

    for (const sub of subscriptions) {
      try {
        logger.info(`Processing renewal for subscription ${sub.id}`);
      } catch (error) {
        logger.error(`Failed to renew subscription ${sub.id}`, error);
      }
    }
  } catch (error) {
    logger.error('Auto-renewal worker error', error);
  }
}

const INTERVAL_MS = 3600000; // Every hour
setInterval(processAutoRenewals, INTERVAL_MS);

logger.info('Auto-renewal worker started');

module.exports = { processAutoRenewals };
