const express = require('express');
const pool = require('../database/mysql');
const authenticateToken = require('../middleware/AuthenticationToken');
const { v4: uuidv4 } = require('uuid')
const router = express.Router();

// Create a new QR code
router.post('/qrcodes', authenticateToken, async (req, res) => {
  try {
    const { url, image } = req.body;
    const userId = req.user.id;
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    const [result] = await pool.query(
      'INSERT INTO qrcodes (user_id, url, image) VALUES (?, ?, ?)',
      [userId, url, image || null]
    );
    res.status(201).json({
      message: 'QR code saved successfully',
      data: { id: result.insertId, user_id: userId, url, image, created_at: new Date() },
    });
  } catch (error) {
    console.error('QR Code Save Error:', error);
    res.status(500).json({ message: 'Failed to save QR code' });
  }
});

// Get all QR codes for the authenticated user
router.get('/qrcodes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [qrcodes] = await pool.query(
      'SELECT id, url, image, created_at FROM qrcodes WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({
      message: 'QR codes fetched successfully',
      data: qrcodes,
    });
  } catch (error) {
    console.error('QR Code Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch QR codes' });
  }
});
router.delete('/qrcodes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const [result] = await pool.query(
      'DELETE FROM qrcodes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'QR code not found or unauthorized' });
    }

    res.status(200).json({ message: 'Successfully deleted', result });
  } catch (err) {
    console.error('Delete QR Error:', err);
    res.status(500).json({ message: 'Something went wrong while deleting QR code' });
  }
});

module.exports = router;