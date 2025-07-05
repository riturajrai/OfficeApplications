const express = require('express')
const pool = require('../database/mysql');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, reference_image } = req.body;
    if (!name || !reference_image) {
      return res.status(400).json({ message: 'Name and reference image are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO face_users (name, reference_image) VALUES (?, ?)',
      [name, reference_image]
    );
    res.status(201).json({
      message: 'User added successfully',
      data: { id: result.insertId, name, reference_image },
    });
  } catch (error) {
    console.error('Add User Error:', error);
    res.status(500).json({ message: 'Failed to add user' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, reference_image FROM face_users');
    res.status(200).json({
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router