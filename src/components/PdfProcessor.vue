<!-- src/components/PdfProcessor.vue -->
<script setup>
// src/components/PdfProcessor.vue

import { ref } from 'vue';
// Make sure this path is correct
import { uploadAndProcessPdf } from '@/services/pdfService.js';

// Reactive state variables
const inputFile = ref(null);
const selectedFileName = ref('');
const outputFileUrl = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const additionalData = ref(''); // <-- NEW: For the textarea

// Function to handle file selection from the input
const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    inputFile.value = file;
    selectedFileName.value = file.name;
    errorMessage.value = '';
    // Don't clear the output URL on file change, so the user can see the last result
  } else {
    inputFile.value = null;
    selectedFileName.value = '';
    errorMessage.value = 'Please select a valid PDF file.';
  }
};

// resize textarea
const textarea = document.getElementById('autoresizing');

document.addEventListener('DOMContentLoaded', function () {
  const textarea = document.getElementById('autoresizing');

  textarea.addEventListener('input', function () {
    this.style.height = 'auto';
    const maxHeight = parseInt(window.getComputedStyle(this).maxHeight);
    const newHeight = Math.min(this.scrollHeight, maxHeight);
    this.style.height = newHeight + 'px';
    this.style.overflowY = (this.scrollHeight > maxHeight) ? 'auto' : 'hidden';
  });
});

// Trigger initial resize on page load
window.addEventListener('DOMContentLoaded', function () {
  const event = new Event('input');
  textarea.dispatchEvent(event);
});


// Function to handle the form submission
const handleProcessRequest = async () => {
  if (!inputFile.value) {
    errorMessage.value = 'No file selected.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  outputFileUrl.value = null;

  try {
    // MODIFIED: Pass both the file and the additional data to the service
    const processedPdfBlob = await uploadAndProcessPdf(inputFile.value, additionalData.value);

    // Create a URL from the returned blob. This will be used by the iframe.
    outputFileUrl.value = URL.createObjectURL(processedPdfBlob);

  } catch (error) {
    errorMessage.value = `Processing failed: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};
</script>

<!-- src/components/PdfProcessor.vue -->
<template>

  <h1>PDF Processor</h1>
  <div class="main-container">
    <div class="content-wrapper">

      <!-- Left Column: All Inputs -->
      <div class="processing-column">

        <!-- Card 1: File Input (Unchanged) -->
        <div class="card">
          <h2>1. Select PDF File</h2>
          <div class="input-group">
            <label for="pdf-upload" class="file-label neumorphic-button">Choose PDF...</label>
            <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                @change="onFileSelected"
            />
            <p v-if="selectedFileName" class="file-name">{{ selectedFileName }}</p>
          </div>
        </div>

        <!-- Card 2: Text Input (Unchanged) -->
        <div class="card">
          <h2>2. Add Extra Data</h2>
          <textarea
              id="autoresizing"
              v-model="additionalData"
              class="neumorphic-textarea"
              placeholder="Enter any additional data to send with the PDF..."
          ></textarea>
        </div>

        <!-- MODIFIED: Card 3 is now just the action area -->
        <div class="action-area">
          <button @click="handleProcessRequest" :disabled="!inputFile || isLoading" class="neumorphic-button">
            {{ isLoading ? 'Processing...' : 'Process PDF' }}
          </button>
          <div class="status-text-wrapper">
            <div v-if="isLoading" class="status-text loading">
              Processing your file...
            </div>
            <div v-if="errorMessage" class="status-text error">
              {{ errorMessage }}
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: PDF Viewer -->
      <div class="card results-card">
        <!-- MODIFIED: Header now contains the download button -->
        <div class="results-header">
          <h2>Results</h2>
          <a
              v-if="outputFileUrl"
              :href="outputFileUrl"
              download="processed_document.pdf"
              class="download-button neumorphic-button"
          >
            Download
          </a>
        </div>

        <div class="pdf-viewer-container">
          <iframe
              v-if="outputFileUrl"
              :src="outputFileUrl"
              class="pdf-viewer"
              title="Processed PDF Viewer"
          ></iframe>
          <div v-else class="placeholder-text">
            Processed PDF will be displayed here.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>


<style scoped>
/* --- Main Layout --- */
.main-container {
  max-width: 100%;

  padding: 3rem;
  font-family: 'Poppins', sans-serif;
}

h1 {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  margin-top: 2rem;
  margin-left: 3rem;
}

.content-wrapper {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
}

.processing-column {
  display: flex;
  flex-direction: column;
  flex-basis: 40%;

  gap: 2.5rem;
}

.results-card {
  flex: 1;
  height: 75vh;
  display: flex;
  flex-direction: column;
}

/* --- Card Styling --- */
.card {
  background: var(--primary-color);
  border-radius: 30px;
  padding: 2rem;
  box-shadow: 9px 9px 16px var(--dark-shadow), -9px -9px 16px var(--light-shadow);
  transition: all 0.3s ease-in-out;
}

h2 {
  margin-top: 0;
  font-weight: 500;
  color: var(--text-color);
}

.card h2 {
  margin-bottom: 1.5rem;

}

/* --- Input & Action Elements --- */
.input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.neumorphic-button {
  border: none;
  outline: none;
  padding: 1rem 2rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  background: var(--primary-color);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 6px 6px 12px var(--dark-shadow), -6px -6px 12px var(--light-shadow);
  transition: all 0.2s ease-in-out;
}

.neumorphic-button:hover:not(:disabled) {
  box-shadow: 8px 8px 14px var(--dark-shadow), -8px -8px 14px var(--light-shadow);
}

.neumorphic-button:active:not(:disabled) {
  box-shadow: inset 6px 6px 12px var(--dark-shadow), inset -6px -6px 12px var(--light-shadow);
}

.neumorphic-button:disabled {
  color: #9e9e9e;
  cursor: not-allowed;
  box-shadow: inset 2px 2px 5px var(--dark-shadow), inset -2px -2px 5px var(--light-shadow);
}

input[type="file"] {
  display: none;
}

.file-name {
  margin-right: 1rem;
  font-weight: 500;
  color: var(--accent-color);
  text-align: center;
}

.neumorphic-textarea {
  border: none;
  overflow: hidden; /* Hide scrollbars */
  width: calc(100% - 2rem);
  height: 120px;
  outline: none;
  border-radius: 20px;
  padding: 1rem;
  background: var(--primary-color);
  color: var(--text-color);
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  box-shadow:
   3px 3px 6px var(--dark-shadow), -3px -3px 6px var(--light-shadow);

}


/* --- NEW and MODIFIED Styles --- */
.action-area {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.status-text-wrapper {
  flex-grow: 1;
}

.status-text {
  font-weight: 500;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-header h2 {
  margin-bottom: 0; /* Remove margin from h2 as parent handles it */
}

.download-button {
  padding: 0.6rem 1.2rem; /* Make it smaller */
  font-size: 0.9rem;
}

/* --- Status & PDF Viewer --- */
.error {
  color: var(--danger-color);
}

.loading {
  color: var(--text-color);
}

.pdf-viewer-container {
  flex-grow: 1;
  border: none;
  border-radius: 20px;
  box-shadow:
  3px 3px 6px var(--dark-shadow), -3px -3px 6px var(--light-shadow);
  padding: 10px;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 15px;
}

.placeholder-text {
  color: var(--text-color);
  opacity: 0.7;
}
</style>