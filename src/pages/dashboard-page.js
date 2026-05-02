/**
 * Dashboard Page Logic
 * 
 * Handles dashboard UI and user interactions
 * This file contains ONLY UI logic - all business logic is in services
 */

import { getCurrentUser, logoutUser, isAuthenticated } from '../services/authService.js';
import { getNotes } from '../services/databaseService.js';
import { showToast } from '../components/toast.js';
import { showLoader, hideLoader } from '../components/loader.js';
import { formatDate, formatFileSize } from '../utils/formatting.js';

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize dashboard page
 */
export async function initDashboard() {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'auth-refactored.html';
        return;
    }

    // Display user info
    displayUserInfo();

    // Load user notes
    await loadNotes();

    // Initialize logout button
    initLogoutButton();

    console.log('✅ Dashboard initialized');
}

// ============================================
// USER INFO
// ============================================

function displayUserInfo() {
    const user = getCurrentUser();
    
    if (!user) return;

    // Update user email display
    const userEmailEl = document.getElementById('user-email');
    if (userEmailEl) {
        userEmailEl.textContent = user.displayName || user.email;
    }

    // Update welcome message
    const welcomeNameEl = document.getElementById('welcome-name');
    if (welcomeNameEl) {
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';
        welcomeNameEl.textContent = firstName;
    }
}

// ============================================
// LOAD NOTES
// ============================================

async function loadNotes() {
    const notesContainer = document.getElementById('notes-container');
    
    if (!notesContainer) return;

    try {
        showLoader('Loading your notes...');

        // Get notes from database service
        const notes = await getNotes();

        // Display notes
        if (notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3>No notes yet</h3>
                    <p>Upload your first study material to get started!</p>
                    <a href="upload.html" class="btn-primary">Upload Now</a>
                </div>
            `;
        } else {
            notesContainer.innerHTML = notes.map(note => createNoteCard(note)).join('');
            
            // Add event listeners to note cards
            attachNoteCardListeners();
        }

        hideLoader();

    } catch (error) {
        console.error('Load notes error:', error);
        showToast('Failed to load notes', 'error');
        hideLoader();
    }
}

/**
 * Create HTML for note card
 * @param {Object} note - Note object
 * @returns {string} HTML string
 */
function createNoteCard(note) {
    const date = formatDate(note.createdAt, 'relative');
    const fileSize = note.fileSize ? formatFileSize(note.fileSize) : '';

    return `
        <div class="note-card" data-note-id="${note.id}">
            <div class="note-icon">📄</div>
            <div class="note-content">
                <h3 class="note-title">${note.title}</h3>
                <p class="note-meta">
                    ${note.fileName || 'Untitled'} 
                    ${fileSize ? `• ${fileSize}` : ''} 
                    • ${date}
                </p>
            </div>
            <div class="note-actions">
                <button class="btn-icon" data-action="view" title="View">👁️</button>
                <button class="btn-icon" data-action="delete" title="Delete">🗑️</button>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners to note cards
 */
function attachNoteCardListeners() {
    const noteCards = document.querySelectorAll('.note-card');

    noteCards.forEach(card => {
        const noteId = card.dataset.noteId;

        // View button
        const viewBtn = card.querySelector('[data-action="view"]');
        viewBtn?.addEventListener('click', () => viewNote(noteId));

        // Delete button
        const deleteBtn = card.querySelector('[data-action="delete"]');
        deleteBtn?.addEventListener('click', () => deleteNoteConfirm(noteId));

        // Click on card to view
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.note-actions')) {
                viewNote(noteId);
            }
        });
    });
}

/**
 * View note details
 * @param {string} noteId - Note ID
 */
function viewNote(noteId) {
    window.location.href = `study.html?noteId=${noteId}`;
}

/**
 * Confirm and delete note
 * @param {string} noteId - Note ID
 */
async function deleteNoteConfirm(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    try {
        showLoader('Deleting note...');

        const { deleteNote } = await import('../services/databaseService.js');
        await deleteNote(noteId);

        showToast('Note deleted successfully', 'success');
        
        // Reload notes
        await loadNotes();

    } catch (error) {
        console.error('Delete note error:', error);
        showToast('Failed to delete note', 'error');
        hideLoader();
    }
}

// ============================================
// LOGOUT
// ============================================

function initLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to logout?')) {
            return;
        }

        try {
            await logoutUser();
            showToast('Logged out successfully', 'success');
            
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            showToast('Failed to logout', 'error');
        }
    });
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
