/**
 * Upload Page Logic
 * 
 * Handles file upload UI and interactions
 * This file contains ONLY UI logic - all business logic is in services
 */

import { getCurrentUser, isAuthenticated, initAuthState } from '../services/supabaseAuthService.js';
import { uploadFile } from '../services/supabaseStorageService.js';
import { saveNote } from '../services/supabaseDatabaseService.js';
import { validateFile } from '../utils/validation.js';
import { formatFileSize } from '../utils/formatting.js';
import { showToast } from '../components/toast.js';

// Global state
let selectedFile = null;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize upload page
 */
export async function initUploadPage() {
    // Initialize auth state first (loads user from Supabase session)
    await initAuthState();
    
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'auth-refactored.html';
        return;
    }

    // Display user info
    await displayUserInfo();

    // Initialize drag & drop
    initDragAndDrop();

    // Initialize file input
    initFileInput();

    // Attach event listeners for buttons
    attachEventListeners();

    console.log('✅ Upload page initialized');
}

/**
 * Attach event listeners to buttons
 */
function attachEventListeners() {
    // Upload button
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', startUpload);
        console.log('✅ Upload button event listener attached');
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelUpload);
        console.log('✅ Cancel button event listener attached');
    }

    // Go to Dashboard button
    const dashboardBtn = document.getElementById('goto-dashboard-btn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
        console.log('✅ Dashboard button event listener attached');
    }

    // Upload Another button
    const uploadAnotherBtn = document.getElementById('upload-another-btn');
    if (uploadAnotherBtn) {
        uploadAnotherBtn.addEventListener('click', uploadAnother);
        console.log('✅ Upload Another button event listener attached');
    }
}

// ============================================
// USER INFO
// ============================================

async function displayUserInfo() {
    try {
        // Get current user (may be async in production)
        const user = getCurrentUser();
        
        if (!user) {
            console.warn('⚠️ No user found');
            return;
        }

        const userEmailEl = document.getElementById('user-email');
        if (userEmailEl) {
            userEmailEl.textContent = user.displayName || user.email;
            console.log('✅ User info displayed:', user.email);
        }
    } catch (error) {
        console.error('❌ Error displaying user info:', error);
    }
}

// ============================================
// DRAG & DROP
// ============================================

function initDragAndDrop() {
    const uploadZone = document.getElementById('upload-zone');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when dragging over
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.remove('drag-over');
        }, false);
    });

    // Handle dropped files
    uploadZone.addEventListener('drop', handleDrop, false);

    // Click to upload
    uploadZone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            document.getElementById('file-input').click();
        }
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
}

// ============================================
// FILE INPUT
// ============================================

function initFileInput() {
    const fileInput = document.getElementById('file-input');
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

// ============================================
// FILE SELECTION
// ============================================

function handleFileSelect(file) {
    // Validate file
    const validation = validateFile(file);

    if (!validation.isValid) {
        showToast(validation.errors[0], 'error');
        return;
    }

    // Store selected file
    selectedFile = file;

    // Display file preview
    displayFilePreview(file);

    // Hide upload zone, show preview
    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('file-preview').classList.add('show');
}

// ============================================
// FILE PREVIEW
// ============================================

function displayFilePreview(file) {
    // Get file info
    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    const fileType = getFileType(file);
    const fileIcon = getFileIcon(file);

    // Update UI
    document.getElementById('file-icon').textContent = fileIcon;
    document.getElementById('file-name').textContent = fileName;
    document.getElementById('file-size').textContent = fileSize;
    document.getElementById('file-type').textContent = fileType;
    document.getElementById('file-size-meta').textContent = fileSize;
    document.getElementById('file-status').textContent = 'Ready to upload';
}

function getFileType(file) {
    const extension = file.name.split('.').pop().toUpperCase();
    return extension;
}

function getFileIcon(file) {
    const type = file.type;
    
    if (type === 'application/pdf') return '📄';
    if (type.startsWith('image/')) return '🖼️';
    return '📎';
}

// ============================================
// UPLOAD PROCESS
// ============================================

/**
 * Start file upload
 */
async function startUpload() {
    console.log('🚀 Upload button clicked!'); // Debug log
    
    if (!selectedFile) {
        console.error('❌ No file selected');
        showToast('No file selected', 'error');
        return;
    }

    console.log('📁 Selected file:', selectedFile.name, selectedFile.size, 'bytes');

    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const progressStatus = document.getElementById('progress-status');

    try {
        // Disable upload button
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';

        // Show progress
        progressContainer.classList.add('show');
        progressStatus.textContent = 'Uploading file...';

        console.log('📤 Starting upload...');

        // Upload file with progress callback
        const result = await uploadFile(selectedFile, 'notes', (progress) => {
            progressFill.style.width = progress + '%';
            progressPercent.textContent = progress + '%';
            
            if (progress < 30) {
                progressStatus.textContent = 'Uploading file...';
            } else if (progress < 70) {
                progressStatus.textContent = 'Processing...';
            } else {
                progressStatus.textContent = 'Almost done...';
            }
        });

        console.log('✅ Upload complete:', result);

        // Save note to database
        progressStatus.textContent = 'Saving to database...';
        
        const noteData = {
            title: selectedFile.name.replace(/\.[^/.]+$/, ''), // Remove extension
            fileName: selectedFile.name,
            fileURL: result.url,
            filePath: result.path,
            fileType: result.type,
            fileSize: result.size,
            extractedText: result.extractedText || '', // Save extracted text
        };

        console.log('💾 Saving note to database...');
        await saveNote(noteData);

        // Success!
        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';
        progressStatus.textContent = 'Upload complete!';

        console.log('🎉 Upload successful!');

        // Show success message
        setTimeout(() => {
            document.getElementById('file-preview').classList.remove('show');
            document.getElementById('success-message').classList.add('show');
        }, 500);

        showToast('File uploaded successfully!', 'success');

    } catch (error) {
        console.error('❌ Upload error:', error);
        showToast(error.message || 'Upload failed. Please try again.', 'error');
        
        // Reset UI
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload & Process';
        progressContainer.classList.remove('show');
    }
}

// ============================================
// CANCEL & RESET
// ============================================

/**
 * Cancel upload
 */
function cancelUpload() {
    console.log('❌ Upload cancelled');
    
    // Reset state
    selectedFile = null;

    // Reset UI
    document.getElementById('file-preview').classList.remove('show');
    document.getElementById('upload-zone').style.display = 'block';
    document.getElementById('upload-progress').classList.remove('show');
    document.getElementById('file-input').value = '';

    // Reset progress
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-percent').textContent = '0%';
}

/**
 * Upload another file
 */
function uploadAnother() {
    console.log('🔄 Upload another file');
    
    // Reset everything
    selectedFile = null;
    
    document.getElementById('success-message').classList.remove('show');
    document.getElementById('upload-zone').style.display = 'block';
    document.getElementById('file-input').value = '';
    document.getElementById('upload-progress').classList.remove('show');
    
    // Reset progress
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-percent').textContent = '0%';
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUploadPage);
} else {
    initUploadPage();
}
