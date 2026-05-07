/**
 * Dashboard SPA - Single Page Application
 * Modular dashboard with sidebar navigation
 */

import {
  getCurrentUser,
  isAuthenticated,
  initAuthState,
  logoutUser,
} from "../services/supabaseAuthService.js";
import {
  getNotes,
  getGeneratedContent,
  getAllGeneratedContent,
  deleteNote,
} from "../services/supabaseDatabaseService.js";
import { deleteFile } from "../services/supabaseStorageService.js";
import { showToast } from "../components/toast.js";
import { formatDate } from "../utils/formatting.js";
import {
  animateDynamicContent,
  animateViewSwap,
  initMotionExperience,
  showSkeleton,
} from "../utils/motion.js";

// Global state
let currentView = "dashboard";
let notesData = [];
let generatedContentData = [];
let statsData = {
  totalNotes: 0,
  totalSummaries: 0,
  totalQuizzes: 0,
  totalFlashcards: 0,
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  initMotionExperience();
  await initAuthState();

  if (!isAuthenticated()) {
    window.location.href = "auth.html";
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
  loadView("dashboard");

  console.log("✅ Dashboard SPA initialized");
}

// ============================================
// USER INFO
// ============================================

function displayUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const userName = user.displayName || user.email.split("@")[0];
  const userEmail = user.email;

  document.getElementById("userName").textContent = userName;
  document.getElementById("userEmail").textContent = userEmail;
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();
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
    statsData.totalSummaries = generatedContentData.filter(
      (c) => c.type === "summary",
    ).length;
    statsData.totalQuizzes = generatedContentData.filter(
      (c) => c.type === "quiz",
    ).length;
    statsData.totalFlashcards = generatedContentData.filter(
      (c) => c.type === "flashcards",
    ).length;
  } catch (error) {
    console.error("Load data error:", error);
  }
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    const view = item.dataset.view;
    if (!view) {
      return;
    }

    item.addEventListener("click", (e) => {
      e.preventDefault();
      loadView(view);

      // Update active state
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      // Close mobile menu
      document.getElementById("sidebar").classList.remove("open");
    });
  });
}

function loadView(view) {
  currentView = view;
  const contentArea = document.getElementById("contentArea");
  const pageTitle = document.getElementById("pageTitle");

  // Update page title
  const titles = {
    dashboard: "Dashboard",
    notes: "My Notes",
    summaries: "Summaries",
    quiz: "Quiz",
    flashcards: "Flashcards",
  };
  pageTitle.textContent = titles[view] || "Dashboard";

  // Show loading
  showSkeleton(contentArea, view === "dashboard" ? 4 : 3);

  // Load view content
  setTimeout(() => {
    switch (view) {
      case "dashboard":
        renderDashboard();
        break;
      case "notes":
        renderNotes();
        break;
      case "summaries":
        renderSummaries();
        break;
      case "quiz":
        renderQuiz();
        break;
      case "flashcards":
        renderFlashcards();
        break;
      default:
        renderDashboard();
    }
    animateViewSwap(contentArea);
  }, 300);
}

// ============================================
// DASHBOARD VIEW
// ============================================

function renderDashboard() {
  const contentArea = document.getElementById("contentArea");

  contentArea.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" style="cursor:pointer;" onclick="window.dashboardSPA.loadView('notes')" title="View all notes">
                <div class="stat-header">
                    <div class="stat-icon blue">📚</div>
                </div>
                <div class="stat-value">${statsData.totalNotes}</div>
                <div class="stat-label">Total Notes</div>
            </div>
            
            <div class="stat-card" style="cursor:pointer;" onclick="window.dashboardSPA.loadView('summaries')" title="View summaries">
                <div class="stat-header">
                    <div class="stat-icon purple">✨</div>
                </div>
                <div class="stat-value">${statsData.totalSummaries}</div>
                <div class="stat-label">Summaries Generated</div>
            </div>
            
            <div class="stat-card" style="cursor:pointer;" onclick="window.dashboardSPA.loadView('quiz')" title="View quizzes">
                <div class="stat-header">
                    <div class="stat-icon green">❓</div>
                </div>
                <div class="stat-value">${statsData.totalQuizzes}</div>
                <div class="stat-label">Quizzes Taken</div>
            </div>
            
            <div class="stat-card" style="cursor:pointer;" onclick="window.dashboardSPA.loadView('flashcards')" title="View flashcards">
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
                <div class="stat-card" style="cursor: pointer;" onclick="window.location.href='upload.html'">
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
  animateDynamicContent(contentArea);
}

function renderRecentNotes() {
  const recentNotes = notesData.slice(0, 3);

  if (recentNotes.length === 0) {
    return `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <div class="empty-title">No notes yet</div>
                <div class="empty-text">Upload your first note to get started</div>
                <a href="upload.html" class="btn btn-primary">Upload Note</a>
            </div>
        `;
  }

  return `
        <div class="notes-grid">
            ${recentNotes.map((note) => createNoteCard(note)).join("")}
        </div>
    `;
}

// ============================================
// NOTES VIEW
// ============================================

function renderNotes(filteredNotes = notesData, searchQuery = "") {
  const contentArea = document.getElementById("contentArea");
  const notes = filteredNotes;
  const isSearching = searchQuery.trim().length > 0;

  if (notes.length === 0) {
    contentArea.innerHTML = `
            <div class="section">
                <div class="empty-state">
                    <div class="empty-icon">${isSearching ? "🔍" : "📚"}</div>
                    <div class="empty-title">${isSearching ? `No notes match "${searchQuery}"` : "No notes yet"}</div>
                    <div class="empty-text">${isSearching ? "Try a different keyword or clear the search." : "Upload your first note to get started with AI-powered studying"}</div>
                    ${isSearching
                      ? `<button class="btn btn-secondary" onclick="document.getElementById('searchInput').value=''; document.getElementById('searchClear').style.display='none'; window.dashboardSPA.loadView('notes')">Clear Search</button>`
                      : `<button class="btn btn-primary" onclick="window.location.href='upload.html'">Upload Note</button>`
                    }
                </div>
            </div>
        `;
    animateDynamicContent(contentArea);
    return;
  }

  contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">${isSearching ? `Results for "${searchQuery}" (${notes.length})` : `All Notes (${notes.length})`}</h2>
                <a href="upload.html" class="btn btn-primary">Upload New</a>
            </div>
            <div class="notes-grid">
                ${notes.map((note) => createNoteCard(note)).join("")}
            </div>
        </div>
    `;

  attachNoteCardListeners();
  animateDynamicContent(contentArea);
}

function createNoteCard(note) {
  const date = formatDate(note.createdAt, "relative");

  return `
        <div class="note-card" data-note-id="${note.id}">
            <div class="note-header">
                <div class="note-icon">📄</div>
                <div class="note-info">
                    <div class="note-title">${note.title || "Untitled Note"}</div>
                    <div class="note-meta">${note.fileName || "No filename"} • ${date}</div>
                </div>
                <button
                    onclick="event.stopPropagation(); window.dashboardSPA.deleteNote('${note.id}', '${note.fileURL || ''}')"
                    title="Delete note"
                    style="background:transparent; border:1px solid #fed7d7; color:#e53e3e; border-radius:6px; padding:0.35rem 0.5rem; cursor:pointer; font-size:1rem; transition:all 0.2s; flex-shrink:0;"
                    onmouseover="this.style.background='#fff5f5'"
                    onmouseout="this.style.background='transparent'"
                >🗑️</button>
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

async function handleDeleteNote(noteId, filePath) {
  const confirmed = confirm(
    "Are you sure you want to delete this note? This will also remove all generated summaries, quizzes, and flashcards for it."
  );
  if (!confirmed) return;

  try {
    showToast("Deleting note...", "info");

    // Delete the file from storage if we have a URL/path
    if (filePath) {
      try {
        const storagePath = filePath.includes("/storage/v1/object/public/notes/")
          ? filePath.split("/storage/v1/object/public/notes/")[1]
          : filePath;
        await deleteFile(storagePath);
      } catch (storageError) {
        console.warn("Storage file deletion failed (may already be gone):", storageError);
      }
    }

    // Delete the note record from the database
    await deleteNote(noteId);

    // Update local state
    notesData = notesData.filter((n) => n.id !== noteId);
    statsData.totalNotes = notesData.length;

    // Also remove associated generated content from local state
    generatedContentData = generatedContentData.filter((c) => c.noteId !== noteId);
    statsData.totalSummaries = generatedContentData.filter((c) => c.type === "summary").length;
    statsData.totalQuizzes = generatedContentData.filter((c) => c.type === "quiz").length;
    statsData.totalFlashcards = generatedContentData.filter((c) => c.type === "flashcards").length;

    showToast("Note deleted successfully", "success");

    // Re-render the current view
    loadView(currentView);
  } catch (error) {
    console.error("Delete note error:", error);
    showToast("Failed to delete note. Please try again.", "error");
  }
}

function attachNoteCardListeners() {
  const cards = document.querySelectorAll(".note-card");
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".note-action-btn")) {
        const noteId = card.dataset.noteId;
        viewNote(noteId, "summary");
      }
    });
  });
}

function viewNote(noteId, tab) {
  window.location.href = `study.html?noteId=${noteId}&tab=${tab}`;
}

// ============================================
// SUMMARIES VIEW
// ============================================

function renderSummaries() {
  const contentArea = document.getElementById("contentArea");
  const summaries = generatedContentData.filter(
    (item) => item.type === "summary",
  );

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
    animateDynamicContent(contentArea);
    return;
  }

  contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">AI-Generated Summaries (${summaries.length})</h2>
            </div>
            <div class="notes-grid">
                ${summaries.map((summary) => createGeneratedContentCard(summary)).join("")}
            </div>
        </div>
    `;
  animateDynamicContent(contentArea);
}

// ============================================
// QUIZ VIEW
// ============================================

function renderQuiz() {
  const contentArea = document.getElementById("contentArea");
  const quizzes = generatedContentData.filter((item) => item.type === "quiz");

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
    animateDynamicContent(contentArea);
    return;
  }

  contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Practice Quizzes (${quizzes.length})</h2>
            </div>
            <div class="notes-grid">
                ${quizzes.map((item) => createGeneratedContentCard(item)).join("")}
            </div>
        </div>
    `;
  animateDynamicContent(contentArea);
}

// ============================================
// FLASHCARDS VIEW
// ============================================

function renderFlashcards() {
  const contentArea = document.getElementById("contentArea");
  const flashcards = generatedContentData.filter(
    (item) => item.type === "flashcards",
  );

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
    animateDynamicContent(contentArea);
    return;
  }

  contentArea.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Study Flashcards (${flashcards.length})</h2>
            </div>
            <div class="notes-grid">
                ${flashcards.map((item) => createGeneratedContentCard(item)).join("")}
            </div>
        </div>
    `;
  animateDynamicContent(contentArea);
}

// ============================================
// SEARCH
// ============================================

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();

    // Show/hide clear button
    if (searchClear) {
      searchClear.style.display = query.length > 0 ? "block" : "none";
    }

    // Always switch to notes view when searching
    if (currentView !== "notes") {
      currentView = "notes";
      document.getElementById("pageTitle").textContent = "My Notes";

      // Update sidebar active state
      document.querySelectorAll(".nav-item").forEach((nav) => {
        nav.classList.toggle("active", nav.dataset.view === "notes");
      });
    }

    const lower = query.toLowerCase();
    const filtered = notesData.filter((note) => {
      return (
        (note.title?.toLowerCase() || "").includes(lower) ||
        (note.fileName?.toLowerCase() || "").includes(lower)
      );
    });

    renderNotes(filtered, query);
  });

  // Clear button
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchClear.style.display = "none";
      searchInput.focus();
      if (currentView === "notes") renderNotes(notesData);
    });
  }
}

function createGeneratedContentCard(item) {
  const icon = item.type === "summary" ? "✨" : item.type === "quiz" ? "❓" : "🎴";
  const label = item.type === "summary" ? "Summary" : item.type === "quiz" ? "Quiz" : "Flashcards";
  const preview = typeof item.content === "string" ? item.content.slice(0, 160) : JSON.stringify(item.content).slice(0, 160);
  const date = formatDate(item.createdAt, "relative");
  
  return `
        <div class="note-card" style="cursor: default;">
            <div class="note-header">
                <div class="note-icon">${icon}</div>
                <div class="note-info">
                    <div class="note-title">${label} for note</div>
                    <div class="note-meta">${date}</div>
                </div>
            </div>
            <p style="color: #718096; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1rem;">${preview}...</p>
            <div class="note-actions">
                <button class="btn btn-primary" style="flex: 1;" onclick="window.dashboardSPA.viewNote('${item.noteId}', '${item.type === "flashcards" ? "flashcards" : item.type === "quiz" ? "quiz" : "summary"}')">Open Study</button>
            </div>
        </div>
    `;
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // Close sidebar when clicking outside on mobile
  mainContent.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("open");
    }
  });
}

// ============================================
// LOGOUT
// ============================================

function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logoutUser();
        showToast("Logged out successfully", "success");
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1000);
      } catch (error) {
        console.error("Logout error:", error);
        showToast("Failed to logout", "error");
      }
    }
  });
}

// ============================================
// EXPORT FOR GLOBAL ACCESS
// ============================================

window.dashboardSPA = {
  loadView,
  viewNote,
  deleteNote: handleDeleteNote,
};

// ============================================
// AUTO-INITIALIZE
// ============================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

