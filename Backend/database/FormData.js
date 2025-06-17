const database = require('../database/mysql');
const multer = require('multer');
const path = require('path');

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

//  POST: Save applicant info with resume upload
const postInfo = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer Error:', err.message);
            return res.status(400).json({ error: err.message });
        }

        const { name, phone, email } = req.body;
        const resume = req.file ? req.file.buffer : null;

        if (!name || !email || !resume) {
            console.error('Validation Error: Missing required fields');
            return res.status(400).json({ error: 'Name, email, and resume are required' });
        }

        try {
            const query = 'INSERT INTO applicants (name, phone, email, resume) VALUES (?, ?, ?, ?)';
            const values = [name, phone, email, resume];
            await database.query(query, values);

            console.log('Data saved:', { name, email });
            res.status(201).json({ message: 'Applicant data saved successfully' });
        } catch (dbError) {
            console.error('Database Error:', dbError.message);
            res.status(500).json({ error: 'Failed to save data to database' });
        }
    });
};

//  GET: All applicants info (without resume buffer)
const getAllInfo = async (req, res) => {
    try {
        const sql = `SELECT id, name, phone, email FROM applicants ORDER BY id DESC`;
        const [rows] = await database.query(sql);

        res.status(200).json({
            message: "Successfully fetched",
            data: rows
        });
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ message: "Error fetching data", error });
    }
};

// ✅ GET: Resume by applicant ID (PDF view/download)
const getResumeById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT resume FROM applicants WHERE id = ?';
        const [rows] = await database.query(sql, [id]);

        if (!rows.length || !rows[0].resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.setHeader('Content-Type', 'application/pdf'); // can be improved to detect MIME type
        res.send(rows[0].resume);
    } catch (error) {
        console.error('Resume fetch error:', error);
        res.status(500).json({ message: 'Error fetching resume' });
    }
};

module.exports = {
    postInfo,
    getAllInfo,
    getResumeById
};
