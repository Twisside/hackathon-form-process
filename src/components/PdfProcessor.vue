<script setup>
import { ref, watch, onMounted } from 'vue';
// Make sure this path is correct
import { uploadAndProcessPdf } from '@/services/pdfService.js';

// --- State Variables ---
const inputFile = ref(null);
const selectedFileName = ref('');
const outputFileUrl = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const additionalData = ref('');

// --- Template Ref for Textarea ---
// This will hold a direct reference to the textarea DOM element.
const textareaRef = ref(null);


// --- The Resizing Logic ---
const resizeTextarea = () => {
  const el = textareaRef.value;
  if (!el) return;

  // 1. Reset height to auto to get the correct scrollHeight.
  el.style.height = 'auto';

  // 2. Define the maximum height you want the textarea to grow to.
  const maxHeight = 500; // in pixels

  // 3. Calculate the new height, but don't exceed the max height.
  const newHeight = Math.min(el.scrollHeight, maxHeight);
  el.style.height = newHeight + 'px';

  // 4. Show a scrollbar only if the content is taller than the max height.
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
};


// --- Vue Reactivity Hooks ---
// Call resizeTextarea whenever the text inside changes.
watch(additionalData, () => {
  resizeTextarea();
});

// Call resizeTextarea once the component is mounted to set the initial size.
onMounted(() => {
  resizeTextarea();
});


// --- Component Methods ---
const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    inputFile.value = file;
    selectedFileName.value = file.name;
    errorMessage.value = '';
  } else {
    inputFile.value = null;
    selectedFileName.value = '';
    errorMessage.value = 'Please select a valid PDF file.';
  }
};

const handleProcessRequest = async () => {
  if (!inputFile.value) {
    errorMessage.value = 'No file selected.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // If there's an old URL, revoke it to prevent memory leaks
    if (outputFileUrl.value) {
      URL.revokeObjectURL(outputFileUrl.value);
    }

    const processedPdfBlob = await uploadAndProcessPdf(inputFile.value, additionalData.value);
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