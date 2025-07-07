// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Files
const {
  postInfo,
  getAllInfo,
  getResumeById,
  updateApplicant,
  getApplicantById
} = require('./database/FormData');

const authRoute = require('./authRoutes/auth');
const authenticateToken = require('./middleware/AuthenticationToken');
const Notification = require('./Notification.js/Notification');
const qrCode = require('./Qr Routes/qr');
const attendance = require('./attendance.js/attendance');
const faceUsersRoutes = require('./attendance.js/face-users');
const department = require('./Department/Department');
const degignation = require('./Designation/Designation');

const LocationCoordinates = require('./LocationCoordinates/locationRoutes');
const submissionRoutes = require('./DashborderController/FormSubmissionCounter');
const ApplicationType = require('./ApplicationType/ApplicationType')
const helmet = require('helmet');


const app = express();
const port = process.env.PORT || 5000;


app.use(helmet());

// CORS & Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://admin.vocalheart.com', 'https://visits.vocalheart.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

//  REST ROUTES
app.use('/api', ApplicationType)
app.use('/api', LocationCoordinates);
app.use('/api', degignation);
app.use('/api', Notification);
app.use('/api', department);
app.use('/api', qrCode);
app.use('/api', submissionRoutes);

app.use('/api/attendance', attendance);
app.use('/api/face-users', faceUsersRoutes);
app.use('/api/auth', authRoute);
app.use('/api/admin', authRoute);

//  Applicants CRUD
app.post('/api/applicants',postInfo);
app.get('/api/applicants', authenticateToken, getAllInfo);
app.get('/api/applicants/:id', authenticateToken, getApplicantById);
app.get('/api/resume/:id', getResumeById);
app.put('/api/applicants/:id', authenticateToken, updateApplicant);

//  Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});



//  Server Start
app.listen(port, () => {
  console.log(` Server is running at http://localhost:${port}`);

});
