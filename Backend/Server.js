const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// 🔽 NEW: Import allowedOrigins
const allowedOrigins = require('./cors/corsOrigins');

// Other routes and middleware
const { postInfo, getAllInfo, getResumeById, updateApplicant, getApplicantById } = require('./database/FormData');
const authRoute = require('./authRoutes/auth');
const authenticateToken = require('./middleware/AuthenticationToken');
const Notification = require('./Notification.js/Notification');
const qrCode = require('./Qr Routes/qr');
const attendance = require('./attendance.js/attendance');
const faceUsersRoutes = require('./attendance.js/face-users');
const department = require('./Department/Department');
const designation = require('./Designation/Designation');
const LocationCoordinates = require('./LocationCoordinates/locationRoutes');
const submissionRoutes = require('./DashborderController/FormSubmissionCounter');
const ApplicationType = require('./ApplicationType/ApplicationType');
const Profile = require('./Profile/Profile');
const FormSubmission = require('./FormSubmit/FormSubmission');

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json());

// ✅ Clean CORS setup
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ROUTES
app.use('/api', Profile);
app.use('/api', ApplicationType);
app.use('/api', LocationCoordinates);
app.use('/api', designation);
app.use('/api', Notification);
app.use('/api', department);
app.use('/api', qrCode);
app.use('/api', submissionRoutes);
app.use('/api', FormSubmission);
app.use('/api/attendance', attendance);
app.use('/api/face-users', faceUsersRoutes);
app.use('/api/auth', authRoute);
app.use('/api', authRoute);

// CRUD
app.post('/api/applicants', authenticateToken, postInfo);
app.get('/api/applicants', authenticateToken, getAllInfo);
app.get('/api/applicants/:id', authenticateToken, getApplicantById);
app.get('/api/resume/:id', getResumeById);
app.put('/api/applicants/:id', authenticateToken, updateApplicant);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
