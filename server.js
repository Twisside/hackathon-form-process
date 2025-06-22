// server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const port = 3001;

app.use(cors());

// MODIFIED: Configure multer to store the uploaded file in memory.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MODIFIED: Use the multer middleware to handle a single file upload
// The key 'pdfTemplate' must match what we used in the service.
app.post('/process-pdf', upload.single('pdfTemplate'), (req, res) => {
    console.log('Received a PDF template to process.');

    // The uploaded file is in req.file, and text fields are in req.body
    const { additionalData } = req.body;
    const pdfFile = req.file;

    if (!pdfFile) {
        return res.status(400).json({ message: 'No PDF template file uploaded.' });
    }

    // --- Log received data ---
    console.log('--- PDF Template Received ---');
    console.log('Filename:', pdfFile.originalname);
    console.log('Size:', pdfFile.size, 'bytes');
    console.log('--- Additional Data Received ---');
    console.log(additionalData || '(No additional data)');
    console.log('---------------------------------');

    // --- MOCK PROCESSING ---
    // In a real app, you would use a library like 'pdf-lib' to open
    // `pdfFile.buffer`, fill in fields using `additionalData`, and then save it.
    // For this demo, we will simply send the exact same PDF template back.
    const processedFileBuffer = pdfFile.buffer;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=processed_document.pdf');

    // Send the file buffer back as the response
    res.send(processedFileBuffer);
});

app.listen(port, () => {
    console.log(`Mock PDF server listening at http://localhost:${port}`);
});