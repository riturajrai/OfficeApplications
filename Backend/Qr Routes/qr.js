const express = require('express');
const router = express.Router();
const database = require('../database/mysql');
const path = require('path');
const multer = require('multer');
const authenticationToken = require('../middleware/AuthenticationToken');

// Configure multer for resume uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|doc|docx/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Haversine formula to calculate distance
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
    console.log(`QR code saved with ID: ${result.insertId}, Code: ${code}`);
    res.status(201).json({
      message: 'QR code saved successfully',
      data: { id: result.insertId, code, user_id: userId, url, image, created_at: new Date() },
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
    const [qrCode] = await database.query(`SELECT id, user_id FROM qrcodes WHERE code = ?`, [code]);
    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found', withinRange: false });
    }

    const { user_id } = qrCode[0];

    const [location] = await database.query(
      `SELECT latitude, longitude, distance_in_meters FROM LocationCoordinates WHERE user_id = ?`,
      [user_id]
    );

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

// Fetch application types, departments, and designations (public access)
router.get('/qrcodes/:code/data', async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`Fetching data for QR code: ${code}`);
    const [qrCode] = await database.query('SELECT user_id FROM qrcodes WHERE code = ?', [code]);
    if (!qrCode.length) {
      console.warn(`QR code ${code} not found`);
      return res.status(404).json({ message: 'QR code not found' });
    }

    const user_id = qrCode[0].user_id;
    console.log(`Found user_id: ${user_id} for QR code: ${code}`);

    const [applicationTypes] = await database.query(
      'SELECT id, name FROM ApplicationType WHERE user_id = ?',
      [user_id]
    );
    console.log(`Fetched ${applicationTypes.length} application types for user_id: ${user_id}`, applicationTypes);

    const [departments] = await database.query(
      'SELECT id, name FROM department WHERE user_id = ?',
      [user_id]
    );
    console.log(`Fetched ${departments.length} departments for user_id: ${user_id}`, departments);

    const [designations] = await database.query(
      'SELECT id, name FROM designation WHERE user_id = ?',
      [user_id]
    );
    console.log(`Fetched ${designations.length} designations for user_id: ${user_id}`, designations);

    res.json({
      message: 'Data fetched successfully',
      applicationTypes,
      departments,
      designations,
    });
  } catch (error) {
    console.error('Data Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
});

// Submit form with new fields (public access)
router.post('/form/:code/submit', upload.single('resume'), async (req, res) => {
  const { code } = req.params;
  const { name, email, reason, application_type, designation, department_id } = req.body;
  const resume = req.file;

  if (!name || !email || !application_type || !designation) {
    return res.status(400).json({ message: 'Name, email, application type, and designation are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const [qrCode] = await database.query('SELECT id, user_id FROM qrcodes WHERE code = ?', [code]);
    if (!qrCode.length) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    const { id: qr_code_id, user_id } = qrCode[0];

    // Validate application_type
    const [appType] = await database.query(
      'SELECT id FROM ApplicationType WHERE name = ? AND user_id = ?',
      [application_type, user_id]
    );
    if (!appType.length) {
      return res.status(400).json({ message: 'Invalid application type' });
    }

    // Validate designation
    const [desig] = await database.query(
      'SELECT id FROM designation WHERE name = ? AND user_id = ?',
      [designation, user_id]
    );
    if (!desig.length) {
      return res.status(400).json({ message: 'Invalid designation' });
    }

    // Validate department_id if provided
    if (department_id) {
      const [dept] = await database.query(
        'SELECT id FROM department WHERE id = ? AND user_id = ?',
        [department_id, user_id]
      );
      if (!dept.length) {
        return res.status(400).json({ message: 'Invalid department' });
      }
    }

    const [result] = await database.query(
      `INSERT INTO form_submissions 
      (qr_code_id, user_id, name, email, reason, application_type, designation, department_id, resume, created_at, status, reviewed) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        qr_code_id,
        user_id,
        name,
        email,
        reason || null,
        application_type,
        designation,
        department_id || null,
        resume ? resume.buffer : null,
        'pending',
        0,
      ]
    );

    // Add to notifications
    const notiMessage = `New ${application_type} submission from "${name}" for ${designation}.`;
    await database.query(
      `INSERT INTO Notification (user_id, type, message, status) VALUES (?, ?, ?, 'unread')`,
      [user_id, 'Form Submission', notiMessage]
    );

    res.status(201).json({
      message: 'Form submitted successfully',
      user_id,
      data: {
        id: result.insertId,
        qr_code_id,
        user_id,
        name,
        email,
        reason,
        application_type,
        designation,
        department_id,
        status: 'pending',
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Form Submission Error:', error);
    res.status(500).json({ message: 'Failed to submit form' });
  }
});

// Get all form submissions for the logged-in user
router.get('/formDetails', authenticationToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const sql = `
      SELECT 
        fs.id, fs.qr_code_id, fs.user_id, fs.name, fs.email, fs.reason, 
        fs.application_type, fs.designation, fs.department_id, fs.status, 
        fs.reviewed, fs.created_at, d.name AS department_name, at.name AS application_type_name
      FROM form_submissions fs
      LEFT JOIN department d ON fs.department_id = d.id
      LEFT JOIN ApplicationType at ON fs.application_type = at.name
      WHERE fs.user_id = ? 
      ORDER BY fs.created_at DESC`;
    const [results] = await database.query(sql, [user_id]);
    res.status(200).json({
      message: 'Form submissions fetched successfully',
      data: results,
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch form submissions' });
  }
});

// Get resume by form submission ID
router.get('/form/resume/:id', authenticationToken, async (req, res) => {
  const formId = req.params.id;
  try {
    const [rows] = await database.query(
      'SELECT resume, name FROM form_submissions WHERE id = ? AND user_id = ?',
      [formId, req.user.id]
    );
    if (!rows.length || !rows[0].resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${rows[0].name}-resume.pdf"`,
    });
    res.send(rows[0].resume);
  } catch (error) {
    console.error('Resume Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
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