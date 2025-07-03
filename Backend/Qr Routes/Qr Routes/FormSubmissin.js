const express = require('express');
const router = express.Router();
const database = require('../database/mysql');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const authenticationToken = require('../middleware/AuthenticationToken');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'Uploads/';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
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

// GET all form submissions for the logged-in user
router.get('/formDetails', authenticationToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const sql = `SELECT id, qr_code_id, user_id, name, email, reason, application_type, status, reviewed, created_at 
                 FROM form_submissions WHERE user_id = ? ORDER BY created_at DESC`;
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

// GET resume by form submission ID
router.get('/form/resume/:id', authenticationToken, async (req, res) => {
  const formId = req.params.id;
  try {
    const [rows] = await database.query(
      'SELECT resume_path, name FROM form_submissions WHERE id = ? AND user_id = ?',
      [formId, req.user.id]
    );
    if (!rows.length || !rows[0].resume_path) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.sendFile(path.resolve(rows[0].resume_path));
  } catch (error) {
    console.error('Resume Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

// Submit form data (public endpoint)
router.post('/form/:code/submit', upload.single('resume'), async (req, res) => {
  const { code } = req.params;
  const { name, email, reason, application_type } = req.body;
  const resume = req.file;

  if (!name || !email || !application_type) {
    return res.status(400).json({ message: 'Name, email, and application type are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!['interview', 'reason'].includes(application_type)) {
    return res.status(400).json({ message: 'Invalid application type' });
  }

  try {
    // Verify QR code
    const [qrCode] = await database.query(
      'SELECT id, user_id FROM qrcodes WHERE code = ?',
      [code]
    );
    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    const qr_code_id = qrCode[0].id;
    const user_id = qrCode[0].user_id;

    // Insert form submission
    const [result] = await database.query(
      `INSERT INTO form_submissions 
       (qr_code_id, user_id, name, email, reason, application_type, resume_path, status, reviewed, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qr_code_id,
        user_id,
        name,
        email,
        reason || null,
        application_type,
        resume ? resume.path : null,
        'pending',
        0,
      ]
    );

    // Add to notifications
    const notiMessage = `New ${application_type} submission from "${name}".`;
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
        application_type,
        status: 'pending',
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Form Submission Error:', error);
    res.status(500).json({ message: 'Failed to submit form' });
  }
});

module.exports = router;