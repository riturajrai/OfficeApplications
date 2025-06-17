const database = require('../database/mysql');
const multer = require('multer');
const path = require('path');
const moment = require('moment-timezone');

// Configure multer for file uploads
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

//POST: Save applicant info with resume upload
const postInfo = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer Error:', err.message);
            return res.status(400).json({ error: err.message });
        }

        const { name, phone, email, status = 'pending' } = req.body;
        const resume = req.file ? req.file.buffer : null;

        if (!name || !email || !resume) {
            return res.status(400).json({ error: 'Name, email, and resume are required' });
        }

        try {
            const query = 'INSERT INTO applicants (name, phone, email, resume, status) VALUES (?, ?, ?, ?, ?)';
            const values = [name, phone, email, resume, status];
            await database.query(query, values);

            res.status(201).json({ message: 'Applicant data saved successfully' });
        } catch (dbError) {
            console.error('Database Error:', dbError.message);
            res.status(500).json({ error: 'Failed to save data to database' });
        }
    });
};

// GET: All applicants info (show created_at and updated_at in IST)
const getAllInfo = async (req, res) => {
    try {
        const sql = `SELECT id, name, phone, email, status, reviewed, created_at, updated_at FROM applicants ORDER BY id DESC`;
        const [rows] = await database.query(sql);

        const formattedRows = rows.map(row => ({
            ...row,
            created_at: moment(row.created_at).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
            updated_at: row.updated_at ? moment(row.updated_at).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null
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

// GET: Resume by applicant ID
const getResumeById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT resume FROM applicants WHERE id = ?';
        const [rows] = await database.query(sql, [id]);

        if (!rows.length || !rows[0].resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.setHeader('Content-Type', 'application/pdf'); // Adjust if you support DOC too
        res.send(rows[0].resume);
    } catch (error) {
        console.error('Resume fetch error:', error);
        res.status(500).json({ message: 'Error fetching resume' });
    }
};

// PUT: Update applicant status and reviewed flag
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

// GET: Applicant by ID
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
        console.error('Fetch Applicant Error:', error);
        res.status(500).json({ message: 'Error fetching applicant', error });
    }
};

module.exports = {
    postInfo,
    getAllInfo,
    getResumeById,
    updateApplicant,
    getApplicantById
};
