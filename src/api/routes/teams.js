const express = require('express');
const db = require('../../../config/database');

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM teams ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id/packages', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM packages WHERE team_id = $1 ORDER BY price ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
