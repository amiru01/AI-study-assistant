import { getCurrentUser, isAuthenticated, initAuthState, logoutUser } from '../services/supabaseAuthService.js';
import { getNotes, getGeneratedContent, deleteNote } from '../services/supabaseDatabaseService.js';
import { deleteFile } from '../services/supabaseStorageService.js';
import { showToast } from '../components/toast.js';
import { formatDate, formatFileSize, formatSummary } from '../utils/formatting.js';

let notesData = [];
let currentSort = 'latest';
let activeNoteId = null;

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
    initSort();
    initModal();
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
        notesData = sortNotes(dedupeNotes(notes), currentSort);

        if (!notesData.length) {
            notesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <div class="empty-title">No notes uploaded yet</div>
                    <div class="empty-text">Upload a file to start generating summaries and quizzes.</div>
                </div>
            `;
            updateNotesCount(0);
            return;
        }

        renderNotes(notesData);

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
        updateNotesCount(0);
    }
}

function dedupeNotes(notes) {
    return Array.from(new Map(notes.map(note => [note.id, note])).values());
}

function sortNotes(notes, sortType) {
    return [...notes].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        if (sortType === 'oldest') {
            return dateA - dateB;
        }

        return dateB - dateA;
    });
}

function createNoteCard(note) {
    const relativeDate = formatDate(note.createdAt, 'relative');
    const size = note.fileSize ? formatFileSize(note.fileSize) : 'Unknown size';

    return `
        <article class="note-card" data-note-id="${note.id}">
            <header>
                <div class="note-card-icon">📄</div>
                <div style="flex:1;">
                    <h3>${note.title || 'Untitled Note'}</h3>
                    <p class="note-meta">${note.fileName || 'No filename'} • ${relativeDate}</p>
                    <div class="note-badges">
                        <span class="note-badge">${size}</span>
                        <span class="note-badge">${relativeDate}</span>
                    </div>
                </div>
                <button class="note-action-btn btn btn-delete" data-note-id="${note.id}" data-file-path="${note.fileURL || ''}" data-action="delete" title="Delete note" style="flex:0; padding: 0.4rem 0.6rem; font-size: 1rem;">🗑️</button>
            </header>
            <main>
                <p class="note-preview">Ready to generate summaries, quizzes, and flashcards from this note.</p>
            </main>
            <footer>
                <button class="note-action-btn btn btn-primary" data-note-id="${note.id}" data-action="open">Open Study</button>
                <button class="note-action-btn btn btn-outline" data-note-id="${note.id}" data-action="preview">Preview</button>
            </footer>
        </article>
    `;
}

async function handleDeleteNote(noteId, filePath) {
    const confirmed = confirm('Are you sure you want to delete this note? This will also remove all generated summaries, quizzes, and flashcards for it.');
    if (!confirmed) return;

    try {
        showToast('Deleting note...', 'info');

        // Delete the file from storage if we have a path
        if (filePath) {
            try {
                // Extract the storage path from the full URL if needed
                const storagePath = filePath.includes('/storage/v1/object/public/notes/')
                    ? filePath.split('/storage/v1/object/public/notes/')[1]
                    : filePath;
                await deleteFile(storagePath);
            } catch (storageError) {
                // Log but don't block — the DB record should still be removed
                console.warn('Storage file deletion failed (may already be gone):', storageError);
            }
        }

        // Delete the note record (cascades to generated_content via DB foreign key)
        await deleteNote(noteId);

        // Remove from local state and re-render
        notesData = notesData.filter(n => n.id !== noteId);
        renderNotes(notesData);
        showToast('Note deleted successfully', 'success');
    } catch (error) {
        console.error('Delete note error:', error);
        showToast('Failed to delete note. Please try again.', 'error');
    }
}

function attachNoteListeners() {
    const actionButtons = document.querySelectorAll('.note-action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const noteId = button.dataset.noteId;
            const action = button.dataset.action;

            if (!noteId || !action) {
                return;
            }

            if (action === 'open') {
                window.location.href = `study.html?noteId=${noteId}`;
                return;
            }

            if (action === 'delete') {
                const filePath = button.dataset.filePath || '';
                await handleDeleteNote(noteId, filePath);
                return;
            }

            const note = notesData.find(noteItem => noteItem.id === noteId);
            if (note) {
                await openNotePreviewModal(note);
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

function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        const sorted = sortNotes(notesData, currentSort);
        notesData = sorted;
        renderNotes(sorted);
    });
}

function initModal() {
    const modal = document.getElementById('summaryModal');
    const closeButtons = [
        document.getElementById('closeModal'),
        document.getElementById('closeModalFooter'),
    ].filter(Boolean);

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal();
        });
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    const openStudyBtn = document.getElementById('openStudyBtn');
    if (openStudyBtn) {
        openStudyBtn.addEventListener('click', () => {
            if (activeNoteId) {
                window.location.href = `study.html?noteId=${activeNoteId}`;
            }
        });
    }
}

async function openNotePreviewModal(note) {
    activeNoteId = note.id;
    const modal = document.getElementById('summaryModal');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    if (!modal || !modalBody || !modalTitle) return;

    modalTitle.textContent = note.title || 'Note preview';
    modalBody.innerHTML = `
        <p><strong>Filename:</strong> ${note.fileName || 'Unknown file'}</p>
        <p><strong>Uploaded:</strong> ${formatDate(note.createdAt, 'long')}</p>
        <p><strong>Size:</strong> ${note.fileSize ? formatFileSize(note.fileSize) : 'Unknown size'}</p>
        <div class="modal-preview-note">
            <p>Loading saved summary preview...</p>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    try {
        const savedSummary = await getGeneratedContent(note.id, 'summary');
        const bodyContent = document.querySelector('.modal-preview-note');

        if (savedSummary && bodyContent) {
            bodyContent.innerHTML = `${formatSummary(savedSummary.content)}`;
        } else if (bodyContent) {
            bodyContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💡</div>
                    <div class="empty-title">No summary found yet</div>
                    <div class="empty-text">Open the study page to generate a summary for this note.</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Preview load error:', error);
        const bodyContent = document.querySelector('.modal-preview-note');
        if (bodyContent) {
            bodyContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <div class="empty-title">Unable to load preview</div>
                    <div class="empty-text">Try again or open the note to generate content.</div>
                </div>
            `;
        }
    }
}

function closeModal() {
    const modal = document.getElementById('summaryModal');
    if (!modal) return;

    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    activeNoteId = null;
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
        updateNotesCount(0);
        return;
    }

    notesContainer.innerHTML = notes.map(createNoteCard).join('');
    attachNoteListeners();
    updateNotesCount(notes.length);
}

function updateNotesCount(count) {
    const notesCountEl = document.getElementById('notesCount');
    if (notesCountEl) {
        notesCountEl.textContent = count.toString();
    }
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
