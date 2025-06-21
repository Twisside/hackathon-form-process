// src/services/pdfService.js

const API_ENDPOINT = 'http://localhost:3001/process-pdf';

/**
 * Uploads a PDF file and additional data to the processing service.
 * @param {File} pdfFile The PDF file to be processed.
 * @param {string} additionalData The text data to send with the file.
 * @returns {Promise<Blob>} A promise that resolves with the processed PDF file as a Blob.
 */
export async function uploadAndProcessPdf(pdfFile, additionalData) { // <-- MODIFIED
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('data', additionalData); // <-- NEW: Append the text data

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred.' }));
            throw new Error(`Server error: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('Error during PDF processing:', error);
        throw error;
    }
}