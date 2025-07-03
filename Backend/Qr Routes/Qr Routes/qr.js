const express = require('express');
const database = require('../database/mysql');
const router = express.Router();
const authenticationToken = require('../middleware/AuthenticationToken');

// Haversine formula to calculate distance between two points (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Create a new QR code (authenticated)
router.post('/qrcodes', authenticationToken, async (req, res) => {
  try {
    const { code, url, image, userId } = req.body;
    if (!code || !url || !userId) {
      console.error('Missing required fields:', { code, url, userId });
      return res.status(400).json({ message: 'Code, URL, and userId are required' });
    }
    if (userId !== req.user.id) {
      console.error('Unauthorized user ID:', { userId, reqUserId: req.user.id });
      return res.status(403).json({ message: 'Unauthorized user ID' });
    }
    const [existingCode] = await database.query('SELECT code FROM qrcodes WHERE code = ?', [code]);
    if (existingCode.length > 0) {
      console.warn(`Code ${code} already exists`);
      return res.status(409).json({ message: 'Code already exists' });
    }
    const [existingUserQR] = await database.query('SELECT id FROM qrcodes WHERE user_id = ?', [userId]);
    if (existingUserQR.length > 0) {
      console.warn(`User ${userId} already has a QR code with ID ${existingUserQR[0].id}`);
      return res.status(409).json({ message: 'User already has a QR code. Delete the existing one to create a new one.' });
    }
    const [result] = await database.query(
      'INSERT INTO qrcodes (code, user_id, url, image) VALUES (?, ?, ?, ?)',
      [code, userId, url, image || null]
    );
    const id = result.insertId;
    console.log(`QR code saved with ID: ${id}, Code: ${code}`);
    res.status(201).json({
      message: 'QR code saved successfully',
      data: { id, code, user_id: userId, url, image, created_at: new Date() },
    });
  } catch (error) {
    console.error('QR Code Save Error:', error);
    res.status(500).json({ message: 'Failed to save QR code' });
  }
});

// Get all QR codes for the authenticated user
router.get('/qrcodes', authenticationToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [qrcodes] = await database.query(
      'SELECT id, code, url, image, created_at FROM qrcodes WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    console.log(`Fetched ${qrcodes.length} QR codes for user ${userId}`);
    res.status(200).json({
      message: 'QR codes fetched successfully',
      data: qrcodes,
    });
  } catch (error) {
    console.error('QR Code Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch QR codes' });
  }
});

// Get a single QR code by code (public access)
router.get('/qrcodes/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const [qrcodes] = await database.query(
      'SELECT id, code, user_id, url, image, created_at FROM qrcodes WHERE code = ?',
      [code]
    );
    if (qrcodes.length === 0) {
      console.warn(`QR code with code ${code} not found`);
      return res.status(404).json({ message: 'QR code not found' });
    }
    console.log(`QR code fetched: ${code}`);
    res.status(200).json({
      message: 'QR code fetched successfully',
      data: qrcodes[0],
    });
  } catch (error) {
    console.error('QR Code Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch QR code' });
  }
});

// Delete a QR code (authenticated)
router.delete('/qrcodes/:id', authenticationToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [result] = await database.query(
      'DELETE FROM qrcodes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      console.warn(`QR code with ID ${id} not found or unauthorized for user ${userId}`);
      return res.status(404).json({ message: 'QR code not found or unauthorized' });
    }
    console.log(`QR code deleted: ${id}`);
    res.status(200).json({ message: 'Successfully deleted', result });
  } catch (err) {
    console.error('Delete QR Error:', err);
    res.status(500).json({ message: 'Something went wrong while deleting QR code' });
  }
});

// Validate QR code and user location (public access)
router.post('/qrcodes/validate/:code', async (req, res) => {
  const { code } = req.params;
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Invalid coordinates', withinRange: false });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ message: 'Invalid coordinates', withinRange: false });
  }

  try {
    // Fetch QR code and associated user
    const [qrCode] = await database.query(
      `SELECT user_id FROM qrcodes WHERE code = ?`,
      [code]
    );

    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found', withinRange: false });
    }

    const { user_id } = qrCode[0];

    // Fetch user's location
    const [location] = await database.query(
      `SELECT latitude, longitude, distance_in_meters FROM LocationCoordinates WHERE user_id = ?`,
      [user_id]
    );

    // If no location is set, allow access
    if (location.length === 0) {
      return res.status(200).json({ message: 'No location set, access granted', withinRange: true });
    }

    const { latitude: storedLat, longitude: storedLon, distance_in_meters } = location[0];
    const distance = calculateDistance(latitude, longitude, storedLat, storedLon);

    if (distance <= distance_in_meters) {
      res.status(200).json({ message: 'Valid QR code and within range', withinRange: true });
    } else {
      res.status(403).json({ message: 'User not within range', withinRange: false });
    }
  } catch (error) {
    console.error('QR code validation error:', error);
    res.status(500).json({ message: 'Internal Server Error', withinRange: false });
  }
});

// Fetch QR code for authenticated user
router.get('/qrcodes/user', authenticationToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const [qrCode] = await database.query(
      `SELECT code FROM qrcodes WHERE user_id = ?`,
      [user_id]
    );

    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'No QR code found for user' });
    }

    res.status(200).json({ message: 'QR code fetched successfully', code: qrCode[0].code });
  } catch (error) {
    console.error('QR code fetch error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;