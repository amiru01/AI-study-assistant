/**
 * Upload Page Logic
 *
 * Handles multi-file-type upload UI and interactions.
 * UI logic only — all business logic lives in services.
 *
 * Supported types: PDF, JPG/PNG, TXT, DOC/DOCX
 */

import {
    getCurrentUser,
    isAuthenticated,
    initAuthState,
} from '../services/supabaseAuthService.js';
import { uploadFile } from '../services/supabaseStorageService.js';
import { saveNote } from '../services/supabaseDatabaseService.js';
import { validateFile } from '../utils/validation.js';
import { formatFileSize } from '../utils/formatting.js';
import { showToast } from '../components/toast.js';
import { animateDynamicContent, animateViewSwap, initMotionExperience } from '../utils/motion.js';

// ============================================
// CONSTANTS
// ============================================

const FILE_ICONS = {
    'application/pdf': '📄',
    'image/jpeg': '🖼️',
    'image/jpg': '🖼️',
    'image/png': '🖼️',
    'text/plain': '📝',
    'application/msword': '📘',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
};

const FILE_TYPE_LABELS = {
    'application/pdf': 'PDF Document',
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPEG Image',
    'image/png': 'PNG Image',
    'text/plain': 'Text File',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
};

// ============================================
// STATE
// ============================================

let selectedFile = null;

// ============================================
// INITIALIZATION
// ============================================

export async function initUploadPage() {
    initMotionExperience();
    await initAuthState();

    if (!isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }

    await displayUserInfo();
    initDragAndDrop();
    initFileInput();
    attachEventListeners();

    console.log('✅ Upload page initialized');
}

// ============================================
// USER INFO
// ============================================

async function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    const el = document.getElementById('user-email');
    if (el) el.textContent = user.displayName || user.email;
}

// ============================================
// DRAG & DROP
// ============================================

function initDragAndDrop() {
    const zone = document.getElementById('upload-zone');
    if (!zone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        zone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); });
        document.body.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); });
    });

    ['dragenter', 'dragover'].forEach(evt =>
        zone.addEventListener(evt, () => zone.classList.add('drag-over'))
    );
    ['dragleave', 'drop'].forEach(evt =>
        zone.addEventListener(evt, () => zone.classList.remove('drag-over'))
    );

    zone.addEventListener('drop', e => {
        const files = e.dataTransfer?.files;
        if (files?.length) handleFileSelect(files[0]);
    });

    // Only open file picker when clicking the zone background, NOT the button
    // (the button has its own listener added in attachEventListeners)
    zone.addEventListener('click', e => {
        if (e.target.id !== 'browseBtn' && !e.target.closest('#browseBtn')) {
            document.getElementById('file-input')?.click();
        }
    });
}

// ============================================
// FILE INPUT
// ============================================

function initFileInput() {
    const input = document.getElementById('file-input');
    if (!input) return;

    input.addEventListener('change', e => {
        if (e.target.files?.length) handleFileSelect(e.target.files[0]);
    });
}

// ============================================
// FILE SELECTION & VALIDATION
// ============================================

function handleFileSelect(file) {
    // Sanitize filename (strip path separators)
    const safeName = file.name.replace(/[/\\]/g, '_');

    // Run validation
    const validation = validateFile(file);
    if (!validation.isValid) {
        showValidationError(validation.errors[0]);
        return;
    }

    clearValidationError();
    selectedFile = file;
    displayFilePreview(file, safeName);

    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('file-preview').classList.add('show');
    animateViewSwap(document.getElementById('file-preview'));
}

function showValidationError(message) {
    const el = document.getElementById('validation-error');
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
    showToast(message, 'error');
}

function clearValidationError() {
    const el = document.getElementById('validation-error');
    if (el) el.style.display = 'none';
}

// ============================================
// FILE PREVIEW
// ============================================

function displayFilePreview(file, safeName) {
    const icon = FILE_ICONS[file.type] || '📎';
    const label = FILE_TYPE_LABELS[file.type] || file.type || 'Unknown';
    const size = formatFileSize(file.size);
    const ext = file.name.split('.').pop().toUpperCase();

    setEl('file-icon', icon);
    setEl('file-name', safeName || file.name);
    setEl('file-size', size);
    setEl('file-type', label);
    setEl('file-ext-badge', ext);
    setEl('file-size-meta', size);
    setEl('file-status', 'Ready to upload');

    // Show processing hint based on type
    const hint = getProcessingHint(file.type);
    setEl('processing-hint', hint);
}

function getProcessingHint(mimeType) {
    if (mimeType === 'application/pdf') return '📄 Text will be extracted using PDF.js';
    if (mimeType.startsWith('image/')) return '🔍 Text will be extracted using OCR';
    if (mimeType === 'text/plain') return '📝 Text will be read directly';
    if (mimeType.includes('word')) return '📘 Text will be extracted using mammoth.js';
    return '';
}

function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// ============================================
// EVENT LISTENERS
// ============================================

function attachEventListeners() {
    // Browse button — stopPropagation so the zone click handler doesn't also fire
    document.getElementById('browseBtn')?.addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('file-input')?.click();
    });

    document.getElementById('upload-btn')?.addEventListener('click', startUpload);
    document.getElementById('cancel-btn')?.addEventListener('click', cancelUpload);
    document.getElementById('upload-another-btn')?.addEventListener('click', uploadAnother);
    document.getElementById('goto-dashboard-btn')?.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
}

// ============================================
// UPLOAD PROCESS
// ============================================

async function startUpload() {
    if (!selectedFile) {
        showToast('No file selected', 'error');
        return;
    }

    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const progressStatus = document.getElementById('progress-status');

    try {
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading…';
        progressContainer.classList.add('show');

        const result = await uploadFile(selectedFile, 'notes', (pct) => {
            progressFill.style.width = pct + '%';
            progressPercent.textContent = pct + '%';
            progressStatus.textContent =
                pct < 30 ? 'Uploading file…' :
                pct < 60 ? 'Extracting text…' :
                pct < 90 ? 'Processing…' : 'Almost done…';
        });

        progressStatus.textContent = 'Saving to database…';

        await saveNote({
            title: selectedFile.name.replace(/\.[^/.]+$/, ''),
            fileName: selectedFile.name,
            fileURL: result.url,
            filePath: result.path,
            fileType: result.type,
            fileSize: result.size,
            extractedText: result.extractedText || '',
        });

        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';
        progressStatus.textContent = 'Upload complete!';

        setTimeout(() => {
            document.getElementById('file-preview').classList.remove('show');
            document.getElementById('success-message').classList.add('show');
            animateDynamicContent(document.getElementById('success-message'));
        }, 500);

        showToast('File uploaded successfully!', 'success');

    } catch (error) {
        console.error('Upload error:', error);
        showToast(error.message || 'Upload failed. Please try again.', 'error');
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload & Process';
        progressContainer.classList.remove('show');
    }
}

// ============================================
// RESET HELPERS
// ============================================

function cancelUpload() {
    selectedFile = null;
    document.getElementById('file-preview').classList.remove('show');
    document.getElementById('upload-zone').style.display = 'block';
    document.getElementById('upload-progress').classList.remove('show');
    animateViewSwap(document.getElementById('upload-zone'));
    resetProgress();
    resetUploadButton();
    clearValidationError();
    const input = document.getElementById('file-input');
    if (input) input.value = '';
}

function uploadAnother() {
    selectedFile = null;
    document.getElementById('success-message').classList.remove('show');
    document.getElementById('upload-zone').style.display = 'block';
    document.getElementById('upload-progress').classList.remove('show');
    animateViewSwap(document.getElementById('upload-zone'));
    resetProgress();
    resetUploadButton();
    clearValidationError();
    const input = document.getElementById('file-input');
    if (input) input.value = '';
}

function resetUploadButton() {
    const btn = document.getElementById('upload-btn');
    if (btn) {
        btn.disabled = false;
        btn.textContent = '⬆️ Upload & Process';
    }
}

function resetProgress() {
    const fill = document.getElementById('progress-fill');
    const pct = document.getElementById('progress-percent');
    if (fill) fill.style.width = '0%';
    if (pct) pct.textContent = '0%';
}

// ============================================
// AUTO-INIT
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUploadPage);
} else {
    initUploadPage();
}

