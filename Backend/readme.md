Applicant Management API Documentation
This document provides detailed documentation for a Node.js-based backend API designed to manage job applicants. The API supports file uploads for resumes, stores applicant data in a MySQL database, and sends confirmation emails using Nodemailer. It is built using Express.js with Multer for file handling and Moment.js for timezone-aware timestamp formatting.
Table of Contents

Overview
Dependencies
File Upload Configuration
API Endpoints
1. POST: Submit Applicant Information
2. GET: Fetch All Applicants
3. GET: Fetch Resume by Applicant ID
4. PUT: Update Applicant Status or Reviewed Flag
5. GET: Fetch Single Applicant by ID


Database Schema
Error Handling
Email Notification
Exported Functions

Overview
The API handles the following functionalities:

Accepts job applications with resume uploads (PDF, DOC, or DOCX).
Stores applicant data (name, phone, email, resume, status) in a MySQL database.
Sends a styled HTML email confirmation to applicants.
Retrieves applicant data, including resumes, and supports updating application status or reviewed flags.
Formats timestamps in Indian Standard Time (IST, Asia/Kolkata).

Dependencies
The code relies on the following Node.js modules:

mysql: For database connectivity and querying MySQL.
multer: Middleware for handling multipart/form-data, used for resume file uploads.
path: Built-in Node.js module for handling file paths and extensions.
moment-timezone: Library for formatting dates and times with timezone support (used for IST).
nodemailer: Module for sending emails, configured via a separate Nodemailer module.

These dependencies are imported as follows:
const database = require('../database/mysql');
const multer = require('multer');
const path = require('path');
const moment = require('moment-timezone');
const transporter = require('../database/Nodemailer');

File Upload Configuration
The multer middleware is configured to handle resume file uploads with the following settings:

Storage: Files are stored in memory using memoryStorage (not saved to disk).
File Size Limit: Maximum 10MB per file.
File Type Filter: Only PDF, DOC, and DOCX files are allowed, validated by file extension and MIME type.

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
        }
    }
}).single('resume');

The single('resume') method specifies that a single file, associated with the form field resume, is expected in the request.
API Endpoints
1. POST: Submit Applicant Information
Endpoint: /applicantsMethod: POSTDescription: Accepts a job application with applicant details and a resume file. Saves the data to the MySQL database and sends a confirmation email to the applicant.
Request:

Content-Type: multipart/form-data
Body:
name (string, required): Applicant's full name.
phone (string, optional): Applicant's phone number.
email (string, required): Applicant's email address.
status (string, optional): Application status (defaults to 'pending').
resume (file, required): Resume file (PDF, DOC, or DOCX, max 10MB).



Response:

Success (201):{
  "success": true,
  "message": "Application submitted successfully!",
  "nextSteps": "Our HR team will review your application and contact you soon.",
  "reference": {
    "email": "applicant@example.com",
    "timestamp": "2025-06-18T15:16:00.000Z"
  },
  "uiMessage": "Thank you! Your application has been submitted successfully."
}


Error (400): Invalid file type or missing required fields.{
  "error": "Validation error",
  "missingFields": {
    "name": true,
    "email": false,
    "resume": true
  },
  "uiMessage": "Please fill all required fields: Name, Email, and Resume"
}


Error (500): Database or server error.{
  "error": "Internal server error",
  "details": "Error message",
  "uiMessage": "We encountered an error. Please try again or contact support."
}



Database Operation:

Executes an INSERT query to save applicant data into the applicants table:INSERT INTO applicants (name, phone, email, resume, status) VALUES (?, ?, ?, ?, ?)


Parameters: [name, phone, email, resume (binary), status].

Email Notification:

Sends a confirmation email to the applicant’s email address with a styled HTML template (see Email Notification for details).
The email is sent asynchronously using transporter.sendMail.

Code:
const postInfo = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer Error:', err.message);
            return res.status(400).json({ 
                error: 'File upload failed',
                details: err.message,
                uiMessage: 'Please upload a valid file (PDF/DOCX under 5MB)'
            });
        }

        const { name, phone, email, status = 'pending' } = req.body;
        const resume = req.file ? req.file.buffer : null;

        if (!name || !email || !resume) {
            return res.status(400).json({ 
                error: 'Validation error',
                missingFields: {
                    name: !name,
                    email: !email,
                    resume: !resume
                },
                uiMessage: 'Please fill all required fields: Name, Email, and Resume'
            });
        }

        try {
            const query = 'INSERT INTO applicants (name, phone, email, resume, status) VALUES (?, ?, ?, ?, ?)';
            const values� = [name, email, resume, status const;
            await database.query(query, values);

            const mailOptions = {
                from: '"VocalHeart Infotech Pvt. Ltd." <careers@vocalheart.com>',
                to: '',
                email: email,
                subject: 'Application Received',
                html: `...` // Truncated for brevity; contains styled HTML email template
            };

            transporter.sendMail(mailOptions)
                .then(info => console.log('Email sent:', info.messageId))
                .catch(err => console.error('Error:', email));

            res.status(201).json({
                success: true,
                message: 'Application submitted successfully!',
                nextSteps: 'Thank you HR team will review your application and contact you soon.',
                reference: {
                    email: email,
                    updatedAt: new Date().toISOString()
                },
                uiMessage: 'Thank you! Your application has been submitted successfully.'
            });
        } catch (err) {
            console.error('Error:', Database.err.message);
            res.status(500).json({ 
                error: 'Server error',
                internalServer: err.message,
                details: 'We encountered an error. Please try again or contact support.'
            });
        }
    });
};

2. GET: Fetch All Applicants
Endpoint: /applicantsMethod: GETDescription: Retrieves all applicants from the database, ordered by ID in descending order. Timestamps are formatted in IST (Asia/Kolkata).
Request:

No parameters required.

Response:

Success (200):{
  "message": "Successfully fetched",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "status": "pending",
      "reviewed": false,
      "updatedAt": "2025-06-18 20:45:00",
      "createdAt": null
    },
    ...
  ]
}


Error (500):{
  "message": "Error fetching data",
  "error": "Database error message"
}



Database Operation:

Executes a SELECT query to fetch applicant details:SELECT id, name, phone, email, status, reviewed, created_at FROM applicants ORDER BY id DESC


No parameters are required.
Results are mapped to format created_at and updated_at timestamps in IST using moment.tz("Asia/Kolkata").

Code:
const getAllInfo = async (req, res) => {
    try {
        const sql = `SELECT id, name, phone, status, email, reviewed, created_at, updated_at FROM applicants ORDER BY id DESC`;
        const [rows] = await database.query(sql);

        const formattedRows = rows.map(row => ({
            ...row,
            created_at: moment.tz(row.created_at, "Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
            updated_at: row.updated_at ? moment.tz(row.updated_at, "Asia/Kolkata").format("YYYY-MM-DD HH:MM:ss") : null
        }));

        res.status(200).json({
            message: "Successfully fetched",
            data: formattedRows
        });
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ message: "Error fetching data", error });
    }
};

3. GET: Fetch Resume by Applicant ID
Endpoint: /applicants/:id/resumeMethod: GETDescription: Retrieves the resume file for a specific applicant by their ID.
Request:

Path Parameter:
id (number, required): Applicant ID.



Response:

Success (200):
Content-Type: application/pdf (or appropriate MIME type based on file).
Body: Binary data of the resume file.


Error (404):{
  "message": "Resume not found"
}


Error (500):{
  "error": "Error fetching resume"
}



Database Operation:

Executes a SELECT query to fetch the resume:SELECT resume FROM applicants WHERE id = ?


Parameters: [id].
Returns the binary resume column.

Code:
const getResumeByID = async (req, res) {
    const { id } = req.params.id;
    try {
        const sql = 'SELECT resume FROM applicants WHERE id = ?';
        const [rows] = await database.query(sql, [id]);

        if (!rows.length || !rows[0].resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(rows[0].resume);
    } catch (error) {
        console.error('Resume Error:', error);
        res.status(500).json({ message: 'Error fetching resume' });
    }
};

4. PUT: Update Applicant Status or Reviewed Flag
Endpoint: /applicants/:idMethod: PUTDescription: Updates the status and/or reviewed flag for a specific applicant by their ID. Automatically updates the updated_at timestamp.
Request:

Path Parameter:
id (number, required): Applicant ID.


Body:
status (string, optional): New status (e.g., 'pending', 'reviewed', 'rejected').
reviewed (boolean, optional): Reviewed flag.



Response:

Success (200):{
  "message": "Applicant updated successfully"
}


Error (400):{
  "error": "Status or reviewed flag must be provided"
}


Error (404):{
  "message": "Applicant not found"
}


Error (500):{
  "message": "Error updating applicant",
  "error": "Error message"
}



Database Operation:

Executes an UPDATE query to modify specified fields:UPDATE applicants SET status = ?, reviewed = ?, updated_at = ? WHERE id = ?


Parameters: [status, reviewed, updated_at, id] (only provided fields are included).

Code:
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

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
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

5. GET: Fetch Single Applicant by ID
Endpoint: /applicants/:idMethod: GETDescription: Retrieves details for a specific applicant by their ID. Timestamps are formatted in IST (Asia/Kolkata).
Request:

Path Parameter:
id (number, required): Applicant ID.



Response:

Success (200):{
  "message": "Applicant fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "status": "pending",
    "reviewed": false,
    "created_at": "2025-06-18 20:46:00",
    "updated_at": null
  }
}


Error (404):{
  "message": "Applicant not found"
}


Error (500):{
  "message": "Error fetching applicant",
  "error": "Error message"
}



Database Operation:

Executes a SELECT query to retrieve applicant details:SELECT id, name, phone, email, status, reviewed, created_at, updated_at FROM applicants WHERE id = ?


Parameters: [id].
Formats created_at and updated_at timestamps in IST.

Code:
const getApplicantById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT id, name, phone, email, status, reviewed, created_at, updated_at FROM applicants WHERE id = ?';
        const [rows] = await database.query(sql, [id]);

        if (!rows.length) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        const formattedRow = {
            ...rows[0],
            created_at: moment(rows[0].created_at).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
            updated_at: rows[0].updated_at ? moment(rows[0].updated_at).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null
        };

        res.status(200).json({
            message: 'Applicant fetched successfully',
            data: formattedRow
        });
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ message: 'Error fetching applicant', error });
    }
};

Database Schema
The API interacts with a MySQL table named applicants. The assumed schema is:
CREATE TABLE applicants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    resume BLOB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);


id: Unique identifier, auto-incremented.
name: Applicant’s full name (required).
phone: Applicant’s phone number (optional).
email: Applicant’s email address (required).
resume: Binary data of the resume file (required).
status: Application status (e.g., 'pending', 'reviewed', 'rejected').
reviewed: Boolean flag indicating if the application has been reviewed.
created_at: Timestamp of record creation.
updated_at: Timestamp of last update (nullable).

Error Handling
The API implements robust error handling:

File Upload Errors: Multer validates file type and size, returning a 400 status with a user-friendly message for invalid files.
Validation Errors: Checks for required fields (name, email, resume) and returns a 400 status with missing field details.
Database Errors: Catches query errors and returns a 500 status with a generic user message and detailed error logging.
Not Found Errors: Returns a 404 status for missing applicants or resumes.
Console Logging: Errors are logged to the console for debugging.

Email Notification
The postInfo endpoint sends a confirmation email to the applicant upon successful submission. Key features:

Sender: "VocalHeart Infotech Pvt. Ltd." <careers@vocalheart.com>.
Subject: Application Received.
Content: Styled HTML email with:
Company logo.
Greeting addressing the applicant by name.
Confirmation message and next steps.
Call-to-action button linking to career openings.
Social media links (Facebook, LinkedIn, Instagram).
Footer with company address, website, and privacy policy links.


Styling: Responsive CSS for desktop and mobile, with a clean, professional design.
Asynchronous Delivery: Email sending is non-blocking using transporter.sendMail.

The HTML email template is embedded in the postInfo function and includes:

A header with the company logo.
A body with application details and instructions.
A footer with contact information and social links.

Exported Functions
The module exports the following functions for use in an Express.js router:
module.exports = {
    postInfo,
    getAllInfo,
    getResumeById,
    updateApplicant,
    getApplicantById
};

These functions correspond to the API endpoints described above and can be mounted to routes in an Express application.

This documentation provides a complete reference for developers integrating or maintaining the applicant management API. For additional details, refer to the code comments or contact the development team.
