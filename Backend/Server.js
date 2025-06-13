const express = require('express');
const cors = require('cors'); // Import cors
const { postInfo } = require('./database/FormData');

const app = express();
const port = 5000;

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', "https://effervescent-creponne-5a6388.netlify.app", "http://visits.vocalheart.com"],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// Route for form submission
app.post('/api/applicants', postInfo);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
