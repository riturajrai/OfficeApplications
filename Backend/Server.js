

const express = require('express');
const cors = require('cors');
const { postInfo, getAllInfo, getResumeById, updateApplicant, getApplicantById } = require('./database/FormData');

const app = express();
const port = 5000;

// ------------------- Middleware -------------------
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5174', "https://visits.vocalheart.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

// ------------------- Routes -------------------

// POST applicant info with resume upload
app.post('/api/applicants', postInfo);

// GET all applicant info (no resumes included)
app.get('/api/applicants', getAllInfo);

// GET specific applicant by ID
app.get('/api/applicants/:id', getApplicantById);

// GET specific resume by applicant ID
app.get('/api/resume/:id', getResumeById);

// PUT update applicant status and reviewed flag
app.put('/api/applicants/:id', updateApplicant);

// ------------------- Server Start -------------------
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
