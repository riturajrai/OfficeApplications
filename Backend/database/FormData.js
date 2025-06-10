const database = require('../database/mysql'); // Corrected path
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

const postInfo = async (req, res) => {
    try {
        // Handle file upload
        upload(req, res, async (err) => {
            if (err) {
                console.error('Multer Error:', err.message);
                return res.status(400).json({ error: err.message });
            }

            const { name, phone, email } = req.body;
            const resume = req.file ? req.file.buffer : null;

            // Log incoming data for debugging
            console.log('Received Form Data:', { name, phone, email, resume: !!resume });

            // Validate input
            if (!name || !email || !resume) {
                console.error('Validation Error: Missing required fields');
                return res.status(400).json({ error: 'Name, email, and resume are required' });
            }

            // Insert data into the database
            const query = 'INSERT INTO applicants (name, phone, email, resume) VALUES (?, ?, ?, ?)';
            const values = [name, phone, email, resume];

            try {
                await database.query(query, values);
                console.log('Data saved to database successfully:', { name, email });
                res.status(201).json({ message: 'Applicant data saved successfully' });
            } catch (dbError) {
                console.error('Database Error:', dbError.message);
                res.status(500).json({ error: 'Failed to save data to database' });
            }
        });
    } catch (error) {
        console.error('Error saving applicant data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { postInfo };