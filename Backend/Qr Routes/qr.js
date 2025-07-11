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
    res.status(500).json({ message: 'Failed to save QR code', error: error.message });
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
    res.status(500).json({ message: 'Failed to fetch QR codes', error: error.message });
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
    res.status(500).json({ message: 'Failed to fetch QR code', error: error.message });
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
  } catch (error) {
    console.error('Delete QR Error:', error);
    res.status(500).json({ message: 'Something went wrong while deleting QR code', error: error.message });
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
    res.status(500).json({ message: 'Internal Server Error', withinRange: false, error: error.message });
  }
});

// Fetch application types, departments, and designations (public access)
router.get('/qrcodes/:code/data', async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`Fetching data for QR code: ${code}`);
    const [qrCode] = await database.query('SELECT user_id FROM qrcodes WHERE code = ?', [code]);
    if (!qrCode.length) {
      console.warn(`QR code with code ${code} not found`);
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
    res.status(500).json({ message: 'Failed to fetch data', error: error.message });
  }
});

// Submit form with new fields (public access)
router.post('/form/:code/submit', upload.single('resume'), async (req, res) => {
  const { code } = req.params;
  const { name, email, reason, application_type, designation, department_name } = req.body;
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
      'SELECT id, name FROM ApplicationType WHERE name = ? AND user_id = ?',
      [application_type, user_id]
    );
    if (!appType.length) {
      return res.status(400).json({ message: 'Invalid application type' });
    }

    // Validate designation
    const [desig] = await database.query(
      'SELECT id, name FROM designation WHERE name = ? AND user_id = ?',
      [designation, user_id]
    );
    if (!desig.length) {
      return res.status(400).json({ message: 'Invalid designation' });
    }

    // Validate department_name if provided
    let departmentNameToStore = null;
    if (department_name) {
      const [dept] = await database.query(
        'SELECT name FROM department WHERE name = ? AND user_id = ?',
        [department_name, user_id]
      );
      if (!dept.length) {
        return res.status(400).json({ message: 'Invalid department name' });
      }
      departmentNameToStore = dept[0].name;
    }

    const [result] = await database.query(
      `INSERT INTO form_submissions 
      (qr_code_id, user_id, name, email, reason, application_type, designation, department_name, resume, created_at, status, reviewed) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        qr_code_id,
        user_id,
        name,
        email,
        reason || null,
        appType[0].name,
        designation,
        departmentNameToStore,
        resume ? resume.buffer : null,
        'pending',
        0,
      ]
    );

    // Add to notifications
    const notiMessage = `New ${appType[0].name} submission from "${name}" for ${designation}.`;
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
        application_type: appType[0].name,
        designation,
        department_name: departmentNameToStore,
        status: 'pending',
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Form Submission Error:', error);
    res.status(500).json({ message: 'Failed to submit form', error: error.message });
  }
});

// Get all form submissions for the logged-in user
router.get('/formDetails', authenticationToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const sql = `
      SELECT 
        fs.id, fs.qr_code_id, fs.user_id, fs.name, fs.email, fs.reason, 
        fs.application_type, fs.designation, fs.department_name, 
        fs.status, fs.reviewed, fs.created_at, 
        at.name AS application_type_name
      FROM form_submissions fs
      LEFT JOIN ApplicationType at ON fs.application_type = at.name AND at.user_id = fs.user_id
      WHERE fs.user_id = ? 
      ORDER BY fs.created_at DESC`;
    const [results] = await database.query(sql, [user_id]);
    res.status(200).json({
      message: 'Form submissions fetched successfully',
      data: results,
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch form submissions', error: error.message });
  }
});

// Update form submission status (authenticated)
router.patch('/formDetails/:id/status', authenticationToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.id;
  const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'approved', 'on_hold'];

  if (!status || !validStatuses.includes(status)) {
    console.warn(`Invalid status provided: ${status} for submission ID: ${id}`);
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  try {
    // Fetch submission to verify existence
    const [submission] = await database.query(
      'SELECT id, name, application_type, designation, user_id FROM form_submissions WHERE id = ?',
      [id]
    );

    if (!submission.length) {
      console.warn(`Form submission with ID ${id} not found`);
      return res.status(404).json({ message: 'Form submission not found' });
    }

    // Update status
    const [updated] = await database.query(
      'UPDATE form_submissions SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (updated.affectedRows === 0) {
      console.warn(`No rows affected for form submission ID ${id}`);
      return res.status(404).json({ message: 'Form submission not found' });
    }

    // Add notification
    const notiMessage = `Form submission from "${submission[0].name}" for ${submission[0].application_type} (${submission[0].designation || 'N/A'}) has been ${status}.`;
    await database.query(
      'INSERT INTO Notification (user_id, type, message, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [submission[0].user_id, 'Status Update', notiMessage, 'unread']
    );

    console.log(`Status updated for form submission ID ${id} to ${status} by user ${user_id}`);
    res.status(200).json({
      message: 'Status updated successfully',
      data: { id: parseInt(id), status },
    });
  } catch (error) {
    console.error('Status Update Error:', {
      message: error.message,
      stack: error.stack,
      id,
      user_id,
      status,
    });
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

// Update form submission review status (authenticated)
router.patch('/formDetails/:id/review', authenticationToken, async (req, res) => {
  const { id } = req.params;
  const { reviewed } = req.body;
  const user_id = req.user.id;

  if (typeof reviewed !== 'number' || ![0, 1].includes(reviewed)) {
    console.warn(`Invalid reviewed value provided: ${reviewed} for submission ID: ${id}`);
    return res.status(400).json({
      message: 'Invalid reviewed value. Must be 0 or 1',
    });
  }

  try {
    // Fetch submission to verify existence
    const [submission] = await database.query(
      'SELECT id, name, application_type, designation, user_id FROM form_submissions WHERE id = ?',
      [id]
    );

    if (!submission.length) {
      console.warn(`Form submission with ID ${id} not found`);
      return res.status(404).json({ message: 'Form submission not found' });
    }

    // Update reviewed status
    const [updated] = await database.query(
      'UPDATE form_submissions SET reviewed = ?, updated_at = NOW() WHERE id = ?',
      [reviewed, id]
    );

    if (updated.affectedRows === 0) {
      console.warn(`No rows affected for form submission ID ${id}`);
      return res.status(404).json({ message: 'Form submission not found' });
    }

    // Add notification
    const notiMessage = `Form submission from "${submission[0].name}" for ${submission[0].application_type} (${submission[0].designation || 'N/A'}) has been ${reviewed ? 'marked as reviewed' : 'marked as unreviewed'}.`;
    await database.query(
      'INSERT INTO Notification (user_id, type, message, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [submission[0].user_id, 'Review Update', notiMessage, 'unread']
    );

    console.log(`Review status updated for form submission ID ${id} to ${reviewed} by user ${user_id}`);
    res.status(200).json({
      message: 'Review status updated successfully',
      data: { id: parseInt(id), reviewed },
    });
  } catch (error) {
    console.error('Review Update Error:', {
      message: error.message,
      stack: error.stack,
      id,
      user_id,
      reviewed,
    });
    res.status(500).json({ message: 'Failed to update review status', error: error.message });
  }
});

// Get resume by form submission ID
router.get('/form/resume/:id', authenticationToken, async (req, res) => {
  const formId = req.params.id;
  try {
    const [rows] = await database.query(
      'SELECT resume, name FROM form_submissions WHERE id = ?',
      [formId]
    );
    if (!rows.length || !rows[0].resume) {
      console.warn(`Resume not found for form ID ${formId}`);
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${rows[0].name}-resume.pdf"`,
    });
    res.send(rows[0].resume);
  } catch (error) {
    console.error('Resume Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch resume', error: error.message });
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
      console.warn(`No QR code found for user ${user_id}`);
      return res.status(404).json({ message: 'No QR code found for user' });
    }
    res.status(200).json({ message: 'QR code fetched successfully', code: qrCode[0].code });
  } catch (error) {
    console.error('QR code fetch error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// User validation endpoint
router.get('/user', authenticationToken, async (req, res) => {
  try {
    const [user] = await database.query('SELECT id, email FROM users WHERE id = ?', [req.user.id]);
    if (!user.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User fetched successfully', user: user[0] });
  } catch (error) {
    console.error('User Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

module.exports = router;
