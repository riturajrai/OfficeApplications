const express = require('express');
const cors = require('cors');
const { postInfo, getAllInfo, getResumeById } = require('./database/FormData');

const app = express();
const port = 5000;

// ------------------- Middleware -------------------
app.use(express.json());
app.use(cors({
    origin: 'https://visits.vocalheart.com', // Adjust if frontend is hosted elsewhere
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

// ------------------- Routes -------------------

// POST applicant info with resume upload
app.post('/api/applicants', postInfo);

// GET all applicant info (no resumes included)
app.get('/api/applicants', getAllInfo);

// GET specific resume (by applicant ID)
app.get('/api/resume/:id', getResumeById);

// ------------------- Server Start -------------------
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
