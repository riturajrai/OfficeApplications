const express = require('express');
const database = require('../database/mysql');
const authenticateToken = require('../middleware/AuthenticationToken');
const multer = require('multer');
const router = express.Router();

// Multer setup (memory storage for database BLOB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET all form submissions for the logged-in user
router.get('/formDetails', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const sql = `SELECT id, qr_code_id, user_id, name, email, reason, application_type, status, reviewed, created_at 
    FROM form_submissions WHERE user_id = ? ORDER BY created_at DESC
    `;
    const [results] = await database.query(sql, [user_id]);

    res.status(200).json({
      message: "Form submissions fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch form submissions" });
  }
});

// GET resume by form submission ID
router.get('/form/resume/:id', authenticateToken, async (req, res) => {
  const formId = req.params.id;

  try {
    const [rows] = await database.query(
      'SELECT resume, name FROM form_submissions WHERE id = ? AND user_id = ?',
      [formId, req.user.id]
    );

    if (!rows.length || !rows[0].resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].name}-resume.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(rows[0].resume);
  } catch (error) {
    console.error('Resume Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});



// Updated route: Submit form data + resume
router.post('/form/:code/submit', upload.single('resume'), async (req, res) => {
  try {
    const { code } = req.params;
    const { name, email, reason, application_type, status } = req.body;
    const resume = req.file ? req.file.buffer : null;

    // Validate inputs
    if (!name || !email || !application_type) {
      return res.status(400).json({ message: 'Name, Email, and Application Type are required' });
    }

    // QR Code check
    const [qrCode] = await database.query('SELECT id, user_id FROM qrcodes WHERE code = ?', [code]);
    if (qrCode.length === 0) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    const qr_code_id = qrCode[0].id;
    const user_id = qrCode[0].user_id;

    // Insert into form_submissions
    const [result] = await database.query(
      `INSERT INTO form_submissions 
        (qr_code_id, user_id, name, email, resume, reason, application_type, status, reviewed) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        qr_code_id,
        user_id,
        name,
        email,
        resume,
        reason || null,
        application_type,
        status || 'pending',
        0 // reviewed default
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
      data: {
        id: result.insertId,
        qr_code_id,
        user_id,
        name,
        email,
        application_type,
        status,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Form Submission Error:', error);
    res.status(500).json({ message: 'Failed to submit form' });
  }
});

module.exports = router;
