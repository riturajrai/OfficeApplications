const database = require('../database/mysql');
const multer = require('multer');
const path = require('path');
const moment = require('moment-timezone');
const transporter = require('../database/Nodemailer');

// Configure multer for file uploads (optional for reason submissions)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true);
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
    }
  },
}).single('resume');


// ===================== postInfo routes ===========================================\\
const postInfo = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer Error:', err.message);
      return res.status(400).json({
        error: 'File upload failed',
        details: err.message,
        uiMessage: 'Please upload a valid file (PDF/DOC/DOCX under 10MB)',
      });
    }
    const { name, phone, email, applicationType, reason, status = 'pending' } = req.body;
    const resume = req.file ? req.file.buffer : null;
  
    // Validate required fields
    if (!name || !email || !applicationType) {
      return res.status(400).json({
        error: 'Validation error',
        missingFields: {
          name: !name,
          email: !email,
          applicationType: !applicationType,
        },
        uiMessage: 'Please fill all required fields: Name, Email, and Application Type',
      });
    }
  
    if (applicationType === 'interview' && !resume) {
      return res.status(400).json({
        error: 'Validation error',
        missingFields: { resume: true },
        uiMessage: 'Resume is required for interview applications',
      });
    }

    if (applicationType === 'reason' && !reason) {
      return res.status(400).json({
        error: 'Validation error',
        missingFields: { reason: true },
        uiMessage: 'Reason is required for reason submissions',
      });
    }

    if (applicationType !== 'interview' && applicationType !== 'reason') {
      return res.status(400).json({
        error: 'Invalid application type',
        uiMessage: 'Application type must be either "interview" or "reason"',
      });
    }

    try {
      // Save to database (no email uniqueness check)
      const query =
        'INSERT INTO applicants (name, phone, email, resume, reason, application_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [name, phone, email, resume, reason, applicationType, status, new Date()];
      await database.query(query, values);

      // Email templates based on application type
      const emailSubject =
        applicationType === 'interview'
          ? 'Job Application Received - Interview Request'
          : 'Reason for Visit Submission Received';

      const emailBody =
        applicationType === 'interview'
          ? `
              <p>Thank you for applying for a position at <span class="highlight">VocalHeart Infotech Pvt. Ltd.</span>. We have successfully received your job application and resume.</p>
              <div class="divider"></div>
              <p><strong>Application Review</strong><br>
              Our HR team will review your resume and qualifications within the next 1-2 business days.</p>
              <p><strong>Next Steps</strong><br>
              If your profile aligns with our requirements, we will contact you via email or phone to schedule an interview. You can also check our <a href="https://vocalheart.com/careers" style="color: #003087;">careers page</a> for updates on open positions.</p>
              <p>We appreciate your interest in joining our team!</p>
            `
          : `
              <p>Thank you for submitting your reason for visiting <span class="highlight">VocalHeart Infotech Pvt. Ltd.</span>. We have successfully received your submission.</p>
              <div class="divider"></div>
              <p><strong>Submission Details</strong><br>
              Reason: ${reason}</p>
              <p><strong>Next Steps</strong><br>
              Our team will review your submission within 1-2 business days. If further action or follow-up is required, we will reach out to you via email or phone.</p>
              <p>We value your engagement with us!</p>
            `;

      const mailOptions = {
        from: '"VocalHeart Infotech Pvt. Ltd." <careers@vocalheart.com>',
        to: email,
        subject: emailSubject,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${
              applicationType === 'interview'
                ? 'Job Application Confirmation'
                : 'Reason Submission Confirmation'
            }</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                font-size: 12px;
                line-height: 1.5;
                color: #333;
                background-color: #f8f9fa;
                -webkit-font-smoothing: antialiased;
              }
              .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
              }
              .email-header {
                background: white;
                padding: 24px;
                text-align: center;
                border-bottom: 4px solid #ff6b35;
              }
              .logo {
                max-width: 180px;
                height: auto;
              }
              .email-body {
                padding: 32px;
              }
              .greeting {
                font-size: 14px;
                font-weight: 600;
                color: #003087;
                margin-bottom: 16px;
              }
              .divider {
                height: 1px;
                background: #e9ecef;
                margin: 20px 0;
              }
              h1 {
                font-size: 18px;
                color: #212529;
                margin-bottom: 16px;
                font-weight: 600;
              }
              p {
                margin-bottom: 16px;
                color: #495057;
                font-size: 12px;
              }
              .highlight {
                color: #003087;
                font-weight: 500;
              }
              .cta-container {
                text-align: center;
                margin: 24px 0;
              }
              .cta-button {
                display: inline-block;
                padding: 10px 24px;
                background: #ff6b35;
                color: white !important;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 500;
                font-size: 12px;
                transition: all 0.2s ease;
              }
              .cta-button:hover {
                background: #e85925;
                transform: translateY(-1px);
              }
              .email-footer {
                background: #f1f3f5;
                padding: 20px;
                text-align: center;
                font-size: 11px;
                color: #6c757d;
              }
              .social-links {
                margin: 16px 0;
              }
              .social-link {
                display: inline-block;
                margin: 0 8px;
              }
              .social-icon {
                width: 24px;
                height: 24px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
              }
              .social-icon:hover {
                opacity: 1;
              }
              .footer-link {
                color: #003087;
                text-decoration: none;
                margin: 0 5px;
              }
              .footer-link:hover {
                text-decoration: underline;
              }
              @media (max-width: 480px) {
                .email-body {
                  padding: 24px;
                }
                .email-header {
                  padding: 16px;
                }
                .logo {
                  max-width: 140px;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <img src="https://i.ibb.co/gbPrfVSB/Whats-App-Image-2025-03-03-at-17-45-28-b944d3a4-removebg-preview-1.png" 
                     alt="VocalHeart Infotech" class="logo">
              </div>
              <div class="email-body">
                <p class="greeting">Dear ${name},</p>
                <h1>${
                  applicationType === 'interview'
                    ? 'Thank You for Your Job Application!'
                    : 'Thank You for Your Submission!'
                }</h1>
                ${emailBody}
                <div class="cta-container">
                  <a href="https://vocalheart.com${
                    applicationType === 'interview' ? '/careers' : ''
                  }" class="cta-button">
                    ${applicationType === 'interview' ? 'View Current Openings' : 'Visit Our Website'}
                  </a>
                </div>
                <p>For any questions, please reply to this email or contact our team at <a href="mailto:info@vocalheart.com" style="color: #003087;">info@vocalheart.com</a>.</p>
                <p>Best regards,<br>
                <strong>The VocalHeart Team</strong></p>
              </div>
              <div class="email-footer">
                <div class="social-links">
                  <a href="https://www.facebook.com/share/15zG6mR5oW" class="social-link" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" alt="Facebook" class="social-icon">
                  </a>
                  <a href="https://www.linkedin.com/company/vocalheartinfotechprivatelimited" class="social-link" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" class="social-icon">
                  </a>
                  <a href="https://www.instagram.com/vocalheart.tech?igsh=d3gzbW1zdW54NXc1" class="social-link" target="_blank">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" class="social-icon">
                  </a>
                </div>
                <p>VocalHeart Infotech Pvt. Ltd.<br>
                Plot N. 3, Third Floor, Bajaj Tower, Raisen Rd, Lala Lajpat Rai Colony, Bhopal, Madhya Pradesh 462023</p>
                <p>
                  <a href="https://vocalheart.com" class="footer-link">Website</a> | 
                  <a href="mailto:info@vocalheart.com" class="footer-link">Contact</a> | 
                  <a href="https://vocalheart.com/privacy" class="footer-link">Privacy Policy</a>
                </p>
                <p style="margin-top: 12px; color: #adb5bd;">
                  © ${new Date().getFullYear()} VocalHeart Infotech. All rights reserved.<br>
                  This email was sent to ${email} as part of your submission process.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      // Send email (non-blocking)
      transporter.sendMail(mailOptions)
        .then((info) => console.log('Email sent:', info.messageId))
        .catch((err) => console.error('Email error:', err));

      // Success response
      res.status(201).json({
        success: true,
        message:
          applicationType === 'interview'
            ? 'Application submitted successfully!'
            : 'Reason submitted successfully!',
        nextSteps: 'Our team will review your submission and contact you soon.',
        reference: {
          email: email,
          timestamp: new Date().toISOString(),
        },
        uiMessage:
          applicationType === 'interview'
            ? 'Thank you! Your application has been submitted successfully.'
            : 'Thank you! Your reason has been submitted successfully.',
      });
    } catch (err) {
      console.error('Database Error:', err.message);
      res.status(500).json({
        error: 'Internal server error',
        details: err.message,
        uiMessage: 'We encountered an error. Please try again or contact support.',
      });
    }
  });
};

// GET: All applicants info with IST timestamps
const getAllInfo = async (req, res) => {
  try {
    const sql = `SELECT id, name, phone, email, application_type, status, reviewed, created_at, updated_at FROM applicants ORDER BY id DESC`;
    const [rows] = await database.query(sql);
    const formattedRows = rows.map((row) => ({
      ...row,
      created_at: moment(row.created_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
      updated_at: row.updated_at
        ? moment(row.updated_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
        : null,
    }));

    res.status(200).json({
      message: 'Successfully fetched',
      data: formattedRows,
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching data', error });
  }
};

// GET: Resume file by ID
const getResumeById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'SELECT resume, application_type FROM applicants WHERE id = ?';
    const [rows] = await database.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    if (rows[0].application_type !== 'interview' || !rows[0].resume) {
      return res.status(404).json({ message: 'No resume available for this submission' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.send(rows[0].resume);
  } catch (error) {
    console.error('Resume Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching resume' });
  }
};

// GET: Reason by ID
const getReasonById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'SELECT reason, application_type FROM applicants WHERE id = ?';
    const [rows] = await database.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    if (rows[0].application_type !== 'reason' || !rows[0].reason) {
      return res.status(404).json({ message: 'No reason available for this submission' });
    }
    
    res.status(200).json({
      message: 'Reason fetched successfully',
      reason: rows[0].reason,
    });
  } catch (error) {
    console.error('Reason Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching reason' });
  }
};

// PUT: Update status/reviewed
const updateApplicant = async (req, res) => {
  const { id } = req.params;
  const { status, reviewed } = req.body;

  if (!status && reviewed === undefined) {
    return res.status(400).json({ error: 'Status or reviewed flag must be provided' });
  }

  try {
    const updates = {};
    if (status) updates.status = status;
    if (reviewed !== undefined) updates.reviewed = reviewed;
    updates.updated_at = new Date();

    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    const sql = `UPDATE applicants SET ${fields} WHERE id = ?`;
    const [result] = await database.query(sql, [...values, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    res.status(200).json({ message: 'Applicant updated successfully' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Error updating applicant', error });
  }
};

// GET: Single applicant info
const getApplicantById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql =
      'SELECT id, name, phone, email, application_type, status, reviewed, created_at, updated_at, reason FROM applicants WHERE id = ?';
    const [rows] = await database.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    const formattedRow = {
      ...rows[0],
      created_at: moment(rows[0].created_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
      updated_at: rows[0].updated_at
        ? moment(rows[0].updated_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
        : null,
    };

    res.status(200).json({
      message: 'Applicant fetched successfully',
      data: formattedRow,
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching applicant', error });
  }
};

module.exports = {
  postInfo,
  getAllInfo,
  getResumeById,
  getReasonById,
  updateApplicant,
  getApplicantById,
};