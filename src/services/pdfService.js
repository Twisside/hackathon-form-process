// src/services/pdfService.js

const API_ENDPOINT = 'http://localhost:3001/process-pdf';

/**
 * Sends a PDF template file and additional data to the processing service.
 * @param {Blob} pdfBlob The PDF template file as a Blob.
 * @param {string} additionalData The text data from the textarea.
 * @returns {Promise<Blob>} A promise that resolves with the processed PDF file.
 */
export async function uploadAndProcessPdf(pdfBlob, additionalData) {
    const formData = new FormData();

    // MODIFIED: Append the blob as a file.
    // The third argument is the filename the server will see.
    formData.append('pdfTemplate', pdfBlob, 'template.pdf');
    formData.append('additionalData', additionalData);

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