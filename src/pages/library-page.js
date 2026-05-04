import { getCurrentUser, isAuthenticated, initAuthState, logoutUser } from '../services/supabaseAuthService.js';
import { getNotes } from '../services/supabaseDatabaseService.js';
import { showToast } from '../components/toast.js';
import { formatDate, formatFileSize } from '../utils/formatting.js';

let notesData = [];

/**
 * Initialize library page
 */
export async function initLibraryPage() {
    await initAuthState();

    if (!isAuthenticated()) {
        window.location.href = 'auth-refactored.html';
        return;
    }

    displayUserInfo();
    await loadNotes();
    initSearch();
    initLogout();

    console.log('✅ Library page initialized');
}

async function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    const userEmailEl = document.getElementById('user-email');
    if (userEmailEl) {
        userEmailEl.textContent = user.displayName || user.email;
    }
}

async function loadNotes() {
    const notesContainer = document.getElementById('notesContainer');
    if (!notesContainer) return;

    try {
        const notes = await getNotes();
        notesData = notes;

        if (!notes.length) {
            notesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <div class="empty-title">No notes uploaded yet</div>
                    <div class="empty-text">Upload a file to start generating summaries and quizzes.</div>
                </div>
            `;
            return;
        }

        notesContainer.innerHTML = notes.map(createNoteCard).join('');
        attachNoteListeners();

    } catch (error) {
        console.error('Library load error:', error);
        showToast('Failed to load library notes', 'error');
        notesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <div class="empty-title">Unable to load notes</div>
                <div class="empty-text">Please refresh the page or try again later.</div>
            </div>
        `;
    }
}

function createNoteCard(note) {
    const relativeDate = formatDate(note.createdAt, 'relative');
    const size = note.fileSize ? formatFileSize(note.fileSize) : 'Unknown size';

    return `
        <article class="note-card" data-note-id="${note.id}">
            <div class="note-card-body">
                <div class="note-card-icon">📄</div>
                <div>
                    <h3>${note.title || 'Untitled Note'}</h3>
                    <p>${note.fileName || 'No filename'} • ${relativeDate}</p>
                    <p class="note-card-meta">${size}</p>
                </div>
            </div>
            <button class="btn btn-outline note-view-btn" data-note-id="${note.id}">Open</button>
        </article>
    `;
}

function attachNoteListeners() {
    const viewButtons = document.querySelectorAll('.note-view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const noteId = button.dataset.noteId;
            if (noteId) {
                window.location.href = `study.html?noteId=${noteId}`;
            }
        });
    });
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const filteredNotes = notesData.filter(note => {
            const title = note.title?.toLowerCase() || '';
            const fileName = note.fileName?.toLowerCase() || '';
            return title.includes(query) || fileName.includes(query);
        });

        renderNotes(filteredNotes);
    });
}

function renderNotes(notes) {
    const notesContainer = document.getElementById('notesContainer');
    if (!notesContainer) return;

    if (!notes.length) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-title">No notes match your search</div>
                <div class="empty-text">Try a different title, filename, or keyword.</div>
            </div>
        `;
        return;
    }

    notesContainer.innerHTML = notes.map(createNoteCard).join('');
    attachNoteListeners();
}

function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to logout?')) {
            return;
        }

        try {
            await logoutUser();
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Failed to logout', 'error');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLibraryPage);
} else {
    initLibraryPage();
}
