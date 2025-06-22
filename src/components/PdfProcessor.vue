<script setup>
import { ref } from 'vue';
import { uploadAndProcessPdf } from '@/services/pdfService.js';

// --- State Variables ---
// NEW: Manually define the list of available PDF templates.
// The `path` is the public path to the file.
// The `path` is the public path to the file.
const templates = ref([
  { id: 'cpf17', name: 'CPF17', path: '/templates/cpf17.pdf' },
  // NOTE: I've given the long filename a clean name and path.
  // Please rename the actual file to 'formula-achitare-venit.pdf' for best results.
  { id: 'formula-achitare-venit', name: 'Formula Achitare Venit', path: '/templates/formula-achitare-venit.pdf' },
  { id: 'ials21', name: 'IALS21', path: '/templates/ials21.pdf' },
  { id: 'inr14', name: 'INR14', path: '/templates/inr14.pdf' },
  { id: 'ipc21', name: 'IPC21', path: '/templates/ipc21.pdf' },
  { id: 'irm19', name: 'IRM19', path: '/templates/irm19.pdf' },
  { id: 'isapti17', name: 'ISAPTI17', path: '/templates/isapti17.pdf' },
  { id: 'iu17', name: 'IU17', path: '/templates/iu17.pdf' },
  { id: 'parc-it', name: 'Parc IT', path: '/templates/parc-it.pdf' },
  { id: 'rsf1', name: 'RSF1', path: '/templates/rsf1.pdf' },
  { id: 'tl13', name: 'TL13', path: '/templates/tl13.pdf' },
  { id: 'ven12', name: 'VEN12', path: '/templates/ven12.pdf' },
]);

const selectedTemplatePath = ref(''); // MODIFIED: State to hold the PATH of the selected template.
const outputFileUrl = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const additionalData = ref('');

// REMOVED: The onMounted and watch logic for templates is no longer needed.

// --- Component Methods ---
const handleProcessRequest = async () => {
  // MODIFIED: Check if a template path is selected
  if (!selectedTemplatePath.value) {
    errorMessage.value = 'Please select a format template.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // NEW: Fetch the selected PDF template from the public folder.
    const response = await fetch(selectedTemplatePath.value);
    if (!response.ok) {
      throw new Error(`Could not load template file: ${response.statusText}`);
    }
    const pdfBlob = await response.blob(); // Convert the response to a Blob

    if (outputFileUrl.value) {
      URL.revokeObjectURL(outputFileUrl.value);
    }

    // MODIFIED: Pass the fetched PDF Blob and the additional data to the service.
    const processedPdfBlob = await uploadAndProcessPdf(pdfBlob, additionalData.value);
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

        <!-- Card 1: MODIFIED for PDF Template Selection -->
        <div class="card">
          <h2>1. Select Document Format</h2>
          <select v-model="selectedTemplatePath" class="neumorphic-select">
            <option disabled value="">Please select a format...</option>
            <!-- MODIFIED: The value is now the template's path -->
            <option v-for="template in templates" :key="template.id" :value="template.path">
              {{ template.name }}
            </option>
          </select>
        </div>


        <!-- Card 2: Text Input -->
        <div class="card">
          <h2>2. Add Extra Data</h2>
          <textarea
              ref="textareaRef"
              v-model="additionalData"
              class="neumorphic-textarea"
              placeholder="Enter any additional data to send with the PDF..."
          ></textarea>
        </div>

        <!-- MODIFIED: Card 3 is now just the action area -->
        <div class="action-area">
          <button @click="handleProcessRequest" :disabled="!selectedTemplatePath || isLoading" class="neumorphic-button">
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
  width: 30vw;

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

.neumorphic-select {
  width: 100%;
  border: none;
  outline: none;
  padding: 1rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
  background: var(--primary-color);
  box-shadow: 3px 3px 8px var(--dark-shadow),-3px -3px 8px var(--light-shadow);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233f4a5a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.2em;
  transition: box-shadow 0.2s ease-in-out; /* Added for smooth effect */
}

/* NEW: Add a subtle effect when the user interacts with the dropdown */
.neumorphic-select:hover,
.neumorphic-select:focus {
  box-shadow: inset 2px 2px 5px var(--dark-shadow), inset -2px -2px 5px var(--light-shadow);
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
  overflow: hidden; /* Start with the scrollbar hidden */
  width: calc(100% - 2rem);
  min-height: 50px; /* MODIFIED: Set a minimum height instead of a fixed one */
  height: 50px;     /* Set initial height to match min-height */
  outline: none;
  border-radius: 20px;
  padding: 1rem;
  background: var(--primary-color);
  color: var(--text-color);
  font-family: inherit;
  font-size: 1rem;
  resize: none; /* Crucial: disable the user's manual resize handle */
  box-shadow: 3px 3px 6px var(--dark-shadow), -3px -3px 6px var(--light-shadow);
  transition: height 0.2s ease; /* Add a smooth transition for the height change */
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


/* --- Step 1: Main Breakpoint for Tablet & Mobile --- */
@media (max-width: 1300px) {
  .content-wrapper {
    /* Change the layout from a row to a column */
    flex-direction: column;
  }

  .processing-column {
    /* Allow the column to take the full width */
    width: 100%;
  }

  .results-card {
    /* Adjust height to be reasonable for a vertical layout */
    height: 60vh;
  }
}



</style>