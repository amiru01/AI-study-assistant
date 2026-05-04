/**
 * Dashboard SPA - Single Page Application
 * Modular dashboard with sidebar navigation
 */

import { getCurrentUser, isAuthenticated, initAuthState, logoutUser } from '../services/supabaseAuthService.js';
import { getNotes, getGeneratedContent, getAllGeneratedContent } from '../services/supabaseDatabaseService.js';
import { showToast } from '../components/toast.js';
import { formatDate } from '../utils/formatting.js';

// Global state
let currentView = 'dashboard';
let notesData = [];
let generatedContentData = [];
let statsData = {
    totalNotes: 0,
    totalSummaries: 0,
    totalQuizzes: 0,
    totalFlashcards: 0
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    await initAuthState();
    
    if (!isAuthenticated()) {
        window.location.href = 'auth-refactored.html';
        return;
    }

    // Display user info
    displayUserInfo();

    // Load data
    await loadAllData();

    // Initialize navigation
    initNavigation();

    // Initialize search box
    initSearch();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize logout
    initLogout();

    // Load initial view
    loadView('dashboard');

    console.log('✅ Dashboard SPA initialized');
}

// ============================================
// USER INFO
// ============================================

function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    const userName = user.displayName || user.email.split('@')[0];
    const userEmail = user.email;

    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('userAvatar').textContent = userName.charAt(0).toUpperCase();
}

// ============================================
// LOAD DATA
// ============================================

async function loadAllData() {
    try {
        // Load notes
        notesData = await getNotes();
        statsData.totalNotes = notesData.length;

        // Load generated content
        generatedContentData = await getAllGeneratedContent();
        statsData.totalSummaries = generatedContentData.filter(c => c.type === 'summary').length;
        statsData.totalQuizzes = generatedContentData.filter(c => c.type === 'quiz').length;
        statsData.totalFlashcards = generatedContentData.filter(c => c.type === 'flashcards').length;

    } catch (error) {
        console.error('Load data error:', error);
    }
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const view = item.dataset.view;
        if (!view) {
            return;
        }

        item.addEventListener('click', (e) => {
            e.preventDefault();
            loadView(view);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Close mobile menu
            document.getElementById('sidebar').classList.remove('open');
        });
    });
}

function loadView(view) {
    currentView = view;
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        notes: 'My Notes',
        upload: 'Upload Notes',
        summaries: 'Summaries',
        quiz: 'Quiz',
        flashcards: 'Flashcards'
    };
    pageTitle.textContent = titles[view] || 'Dashboard';

    // Show loading
    contentArea.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    // Load view content
    setTimeout(() => {
        switch(view) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'notes':
                renderNotes();
                break;
            case 'upload':
                renderUpload();
                break;
            case 'summaries':
                renderSummaries();
                break;
            case 'quiz':
                renderQuiz();
                break;
            case 'flashcards':
                renderFlashcards();
                break;
            default:
                renderDashboard();
        }
    }, 300);
}

// ============================================
// DASHBOARD VIEW
// ============================================

function renderDashboard() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon blue">📚</div>
                </div>
                <div class="stat-value">${statsData.totalNotes}</div>
                <div class="stat-label">Total Notes</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon purple">✨</div>
                </div>
                <div class="stat-value">${statsData.totalSummaries}</div>
                <div class="stat-label">Summaries Generated</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon green">❓</div>
                </div>
                <div class="stat-value">${statsData.totalQuizzes}</div>
                <div class="stat-label">Quizzes Taken</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon orange">🎴</div>
                </div>
                <div class="stat-value">${statsData.totalFlashcards}</div>
                <div class="stat-label">Flashcard Sets</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Recent Notes</h2>
                <button class="btn btn-primary" onclick="window.dashboardSPA.loadView('notes')">View All</button>
            </div>
            ${renderRecentNotes()}
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Quick Actions</h2>
            </div>
            <div class="stats-grid">
                <div class="stat-card" style="cursor: pointer;" onclick="window.dashboardSPA.loadView('upload')">
                    <div class="stat-icon blue">📤</div>
                    <div class="stat-label" style="margin-top: 1rem;">Upload New Note</div>
                </div>
                <div class="stat-card" style="cursor: pointer;" onclick="window.dashboardSPA.loadView('summaries')">
                    <div class="stat-icon purple">✨</div>
                    <div class="stat-label" style="margin-top: 1rem;">View Summaries</div>
                </div>
                <div class="stat-card" style="cursor: pointer;" onclick="window.dashboardSPA.loadView('quiz')">
                    <div class="stat-icon green">❓</div>
                    <div class="stat-label" style="margin-top: 1rem;">Take Quiz</div>
                </div>
            </div>
        </div>
    `;
}

function renderRecentNotes() {
    const recentNotes = notesData.slice(0, 3);
    
    if (recentNotes.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <div class="empty-title">No notes yet</div>
                <div class="empty-text">Upload your first note to get started</div>
                <button class="btn btn-primary" onclick="window.dashboardSPA.loadView('upload')">Upload Note</button>
            </div>
        `;
    }

    return `
        <div class="notes-grid">
            ${recentNotes.map(note => createNoteCard(note)).join('')}
        </div>
    `;
}

// ============================================
// NOTES VIEW
// ============================================

function renderNotes(filteredNotes = notesData) {
    const contentArea = document.getElementById('contentArea');
    const notes = filteredNotes;

    if (notes.length === 0) {
        contentArea.innerHTML = `
            <div class="section">
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <div class="empty-title">No notes yet</div>
                    <div class="empty-text">Upload your first note to get started with AI-powered studying</div>
                    <button class="btn btn-primary" onclick="window.dashboardSPA.loadView('upload')">Upload Note</button>
                </div>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">All Notes (${notes.length})</h2>
                <button class="btn btn-primary" onclick="window.dashboardSPA.loadView('upload')">Upload New</button>
            </div>
            <div class="notes-grid">
                ${notes.map(note => createNoteCard(note)).join('')}
            </div>
        </div>
    `;

    // Attach event listeners
    attachNoteCardListeners();
}

function createNoteCard(note) {
    const date = formatDate(note.createdAt, 'relative');
    
    return `
        <div class="note-card" data-note-id="${note.id}">
            <div class="note-header">
                <div class="note-icon">📄</div>
                <div class="note-info">
                    <div class="note-title">${note.title || 'Untitled Note'}</div>
                    <div class="note-meta">${note.fileName || 'No filename'} • ${date}</div>
                </div>
            </div>
            <div class="note-actions">
                <button class="note-action-btn" onclick="window.dashboardSPA.viewNote('${note.id}', 'summary')">
                    ✨ Summary
                </button>
                <button class="note-action-btn" onclick="window.dashboardSPA.viewNote('${note.id}', 'quiz')">
                    ❓ Quiz
                </button>
                <button class="note-action-btn" onclick="window.dashboardSPA.viewNote('${note.id}', 'flashcards')">
                    🎴 Cards
                </button>
            </div>
        </div>
    `;
}

function attachNoteCardListeners() {
    const cards = document.querySelectorAll('.note-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.note-action-btn')) {
                const noteId = card.dataset.noteId;
                viewNote(noteId, 'summary');
            }
        });
    });
}

function viewNote(noteId, tab) {
    window.location.href = `study.html?noteId=${noteId}&tab=${tab}`;
}

// ============================================
// UPLOAD VIEW
// ============================================

function renderUpload() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Upload Notes</h2>
            </div>
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">📤</div>
                <h3 style="margin-bottom: 0.5rem;">Drag & Drop your files here</h3>
                <p style="color: #718096; margin-bottom: 1rem;">or click to browse</p>
                <button class="btn btn-primary" id="browseBtn">Browse Files</button>
                <p style="color: #a0aec0; font-size: 0.875rem; margin-top: 1rem;">
                    Supported: PDF, JPG, PNG (Max 10MB)
                </p>
            </div>
            <input type="file" id="fileInput" accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
        </div>
    `;

    // Initialize upload functionality
    initUploadArea();
}

function initUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');

    // Click to browse
    uploadArea.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // File selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
}

async function handleFileUpload(file) {
    // Redirect to upload page for full functionality
    window.location.href = 'upload.html';
}

// ============================================
// SUMMARIES VIEW
// ============================================

function renderSummaries() {
    const contentArea = document.getElementById('contentArea');
    const summaries = generatedContentData.filter(item => item.type === 'summary');

    if (summaries.length === 0) {
        contentArea.innerHTML = `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">AI-Generated Summaries</h2>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">✨</div>
                    <div class="empty-title">View summaries from your notes</div>
                    <div class="empty-text">Go to My Notes and generate summaries for your uploaded materials</div>
                    <button class="btn btn-primary" onclick="window.dashboardSPA.loadView('notes')">Go to Notes</button>
                </div>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">AI-Generated Summaries</h2>
                <p class="section-subtitle">Your latest summaries are listed below.</p>
            </div>
            <div class="summary-list">
                ${summaries.map(summary => createGeneratedContentCard(summary)).join('')}
            </div>
        </div>
    `;
}

// ============================================
// QUIZ VIEW
// ============================================

function renderQuiz() {
    const contentArea = document.getElementById('contentArea');
    const quizzes = generatedContentData.filter(item => item.type === 'quiz');

    if (quizzes.length === 0) {
        contentArea.innerHTML = `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Practice Quizzes</h2>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">❓</div>
                    <div class="empty-title">Test your knowledge</div>
                    <div class="empty-text">Go to My Notes and generate quizzes from your study materials</div>
                    <button class="btn btn-primary" onclick="window.dashboardSPA.loadView('notes')">Go to Notes</button>
                </div>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Practice Quizzes</h2>
                <p class="section-subtitle">Review quizzes generated from your notes.</p>
            </div>
            <div class="summary-list">
                ${quizzes.map(item => createGeneratedContentCard(item)).join('')}
            </div>
        </div>
    `;
}

// ============================================
// FLASHCARDS VIEW
// ============================================

function renderFlashcards() {
    const contentArea = document.getElementById('contentArea');
    const flashcards = generatedContentData.filter(item => item.type === 'flashcards');

    if (flashcards.length === 0) {
        contentArea.innerHTML = `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Study Flashcards</h2>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">🎴</div>
                    <div class="empty-title">Study with flashcards</div>
                    <div class="empty-text">Go to My Notes and generate flashcards from your notes</div>
                    <button class="btn btn-primary" onclick="window.dashboardSPA.loadView('notes')">Go to Notes</button>
                </div>
            </div>
        `;
        return;
    }

    contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Study Flashcards</h2>
                <p class="section-subtitle">Open the latest flashcard sets created from your notes.</p>
            </div>
            <div class="summary-list">
                ${flashcards.map(item => createGeneratedContentCard(item)).join('')}
            </div>
        </div>
    `;
}

// ============================================
// SEARCH
// ============================================

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        if (currentView !== 'notes') {
            return;
        }

        const query = searchInput.value.trim().toLowerCase();
        const filtered = notesData.filter(note => {
            const title = note.title?.toLowerCase() || '';
            const fileName = note.fileName?.toLowerCase() || '';
            return title.includes(query) || fileName.includes(query);
        });

        renderNotes(filtered);
    });
}

function createGeneratedContentCard(item) {
    return `
        <div class="generated-card">
            <div class="generated-card-header">
                <div class="generated-card-icon">${item.type === 'summary' ? '✨' : item.type === 'quiz' ? '❓' : '🎴'}</div>
                <div>
                    <h3>${item.type === 'summary' ? 'Summary' : item.type === 'quiz' ? 'Quiz' : 'Flashcards'} for note</h3>
                    <p>${new Date(item.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <p class="generated-card-preview">${typeof item.content === 'string' ? item.content.slice(0, 160) : JSON.stringify(item.content).slice(0, 160)}...</p>
            <div class="generated-card-actions">
                <button class="btn btn-secondary" onclick="window.dashboardSPA.viewNote('${item.noteId}', '${item.type === 'flashcards' ? 'flashcards' : item.type === 'quiz' ? 'quiz' : 'summary'}')">Open Study</button>
            </div>
        </div>
    `;
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    mainContent.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    });
}

// ============================================
// LOGOUT
// ============================================

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
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
        }
    });
}

// ============================================
// EXPORT FOR GLOBAL ACCESS
// ============================================

window.dashboardSPA = {
    loadView,
    viewNote
};

// ============================================
// AUTO-INITIALIZE
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
