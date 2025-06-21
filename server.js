// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 3001;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// When using multer, text fields are available in `req.body`
app.post('/process-pdf', upload.single('pdf'), (req, res) => {
    console.log('Received a file to process.');

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // --- NEW: Access and log the additional text data ---
    const additionalData = req.body.data;
    console.log('--- Additional Data Received ---');
    console.log(additionalData || '(No additional data provided)');
    console.log('---------------------------------');

    const processedFileBuffer = req.file.buffer;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=processed.pdf');
    res.send(processedFileBuffer);
});

app.listen(port, () => {
    console.log(`Mock PDF server listening at http://localhost:${port}`);
});