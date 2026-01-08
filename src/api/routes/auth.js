const express = require('express');
const authService = require('../../services/auth_service');

const router = express.Router();

router.post('/token', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const token = await authService.generateAccessToken(userId);
    res.json({ token, expiresIn: 86400 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'token required' });
    }

    const tokenData = await authService.validateToken(token);
    res.json({ valid: true, userId: tokenData.user_id });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'token required' });
    }

    await authService.invalidateToken(token);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
