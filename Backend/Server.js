
require('dotenv').config(); // Load .env early
const express = require('express');
const cors = require('cors');
const { postInfo, getAllInfo, getResumeById, updateApplicant, getApplicantById } = require('./database/FormData');
const authRoute = require('./authRoutes/auth');
const authenticateToken = require('./middleware/AuthenticationToken');
const app = express();
const port = 5000;
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Routes
app.use('/api/auth', authRoute);

// Applicant routes
app.post('/api/applicants', postInfo);
app.get('/api/applicants', authenticateToken, getAllInfo);
app.get('/api/applicants/:id', authenticateToken, getApplicantById);
app.get('/api/resume/:id',  getResumeById);
app.put('/api/applicants/:id', authenticateToken, updateApplicant);

// Server Start
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
