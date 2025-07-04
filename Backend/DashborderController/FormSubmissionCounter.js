const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/AuthenticationToken');
const database = require('../database/mysql');

// Route: GET /submission/counter
router.get('/submission/counter', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await database.query(
      'SELECT COUNT(*) AS total FROM form_submissions WHERE user_id = ?',
      [userId]
    );
    res.json({ success: true, total: rows[0].total || 0 });
  } catch (error) {
    console.error('Submission count error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Route: GET /submission/list
router.get('/submission/list', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await database.query(
      'SELECT id, status, created_at, user_id AS userId FROM form_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    res.json({ success: true, submissions: rows });
  } catch (error) {
    console.error('Recent submissions error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;