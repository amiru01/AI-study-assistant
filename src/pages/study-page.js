/**
 * Study Page Logic
 * 
 * Handles AI-powered study features (summary, quiz, flashcards)
 * This file contains ONLY UI logic - all business logic is in services
 */

import { getCurrentUser, isAuthenticated, initAuthState } from '../services/supabaseAuthService.js';
import { getNote, getGeneratedContent, saveGeneratedContent, updateNote } from '../services/supabaseDatabaseService.js';
import { generateSummary, generateQuiz, generateFlashcards } from '../services/aiService.js';
import { extractTextFromFile } from '../services/textExtractionService.js';
import { showToast } from '../components/toast.js';
import { showLoader, hideLoader } from '../components/loader.js';
import { formatDate, formatSummary } from '../utils/formatting.js';
import { animateDynamicContent, animateViewSwap, initMotionExperience } from '../utils/motion.js';

// Global state
let currentNote = null;
let currentNoteId = null;
let currentTab = 'summary';

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize study page
 */
export async function initStudyPage() {
    initMotionExperience();
    // Initialize auth state first
    await initAuthState();
    
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }

    // Get note ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentNoteId = urlParams.get('noteId');

    if (!currentNoteId) {
        showToast('No note selected', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }

    // Load note
    await loadNote();

    // Initialize tabs
    initTabs();

    // Initialize generate buttons
    initGenerateButtons();

    // Try to load existing content
    await loadExistingContent();

    console.log('✅ Study page initialized');
}

// ============================================
// LOAD NOTE
// ============================================

async function loadNote() {
    try {
        showLoader('Loading note...');

        // Get note from database
        currentNote = await getNote(currentNoteId);

        // Display note info
        displayNoteInfo(currentNote);

        hideLoader();

    } catch (error) {
        console.error('Load note error:', error);
        showToast('Failed to load note', 'error');
        hideLoader();
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }
}

function displayNoteInfo(note) {
    document.getElementById('note-title').textContent = note.title || 'Untitled Note';
    
    const date = note.createdAt ? formatDate(note.createdAt, 'long') : 'Unknown date';
    document.getElementById('note-meta').textContent = `Uploaded ${date}`;
}

// ============================================
// TAB SWITCHING
// ============================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const activePanel = document.getElementById(`${targetTab}-tab`);
            activePanel.classList.add('active');
            animateViewSwap(activePanel);
        });
    });
}

// ============================================
// GENERATE BUTTONS
// ============================================

function initGenerateButtons() {
    document.getElementById('generate-summary-btn').addEventListener('click', handleGenerateSummary);
    document.getElementById('generate-quiz-btn').addEventListener('click', handleGenerateQuiz);
    document.getElementById('generate-flashcards-btn').addEventListener('click', handleGenerateFlashcards);
}

// ============================================
// LOAD EXISTING CONTENT
// ============================================

async function loadExistingContent() {
    try {
        // Try to load existing summary
        const summary = await getGeneratedContent(currentNoteId, 'summary');
        if (summary) {
            displaySummary(summary.content);
        }

        // Try to load existing quiz
        const quiz = await getGeneratedContent(currentNoteId, 'quiz');
        if (quiz) {
            displayQuiz(quiz.content);
        }

        // Try to load existing flashcards
        const flashcards = await getGeneratedContent(currentNoteId, 'flashcards');
        if (flashcards) {
            displayFlashcards(flashcards.content);
        }

    } catch (error) {
        console.log('No existing content found (this is normal for new notes)');
    }
}

// ============================================
// GENERATE SUMMARY
// ============================================

async function handleGenerateSummary() {
    const button = document.getElementById('generate-summary-btn');
    const content = document.getElementById('summary-content');

    try {
        // Disable button
        button.disabled = true;
        button.textContent = '⏳ Generating...';

        // Show loading state
        content.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>AI is analyzing your notes and creating a summary...</p>
            </div>
        `;

        // Generate summary (using extracted text)
        const noteText = getNoteText();
        const summary = await generateSummary(noteText, 200);

        // Save to database
        await saveGeneratedContent(currentNoteId, 'summary', summary);

        // Display summary
        displaySummary(summary);

        showToast('Summary generated successfully!', 'success');

    } catch (error) {
        console.error('Generate summary error:', error);
        showToast(error.message || 'Failed to generate summary', 'error');
        
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <h3>Generation Failed</h3>
                <p>${error.message || 'Please try again'}</p>
            </div>
        `;

    } finally {
        button.disabled = false;
        button.textContent = '✨ Generate Summary';
    }
}

function displaySummary(summary) {
    const content = document.getElementById('summary-content');
    const formattedSummary = formatSummary(summary);

    content.innerHTML = `
        <div class="summary-actions">
            <button id="copy-summary-btn" class="btn btn-secondary">Copy summary</button>
        </div>
        <div class="summary-text summary-formatted">
            ${formattedSummary}
        </div>
    `;

    const copyBtn = document.getElementById('copy-summary-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyTextToClipboard(summary);
        });
    }
    animateDynamicContent(content);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        showToast('Clipboard not supported in this browser.', 'warning');
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => showToast('Summary copied to clipboard!', 'success'))
        .catch(() => showToast('Unable to copy summary.', 'error'));
}

// ============================================
// GENERATE QUIZ
// ============================================

async function handleGenerateQuiz() {
    const button = document.getElementById('generate-quiz-btn');
    const content = document.getElementById('quiz-content');

    try {
        button.disabled = true;
        button.textContent = '⏳ Generating...';

        content.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>AI is creating quiz questions from your notes...</p>
            </div>
        `;

        // Generate quiz
        const noteText = getNoteText();
        const quiz = await generateQuiz(noteText, 5);

        // Save to database
        await saveGeneratedContent(currentNoteId, 'quiz', quiz);

        // Display quiz
        displayQuiz(quiz);

        showToast('Quiz generated successfully!', 'success');

    } catch (error) {
        console.error('Generate quiz error:', error);
        showToast(error.message || 'Failed to generate quiz', 'error');
        
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <h3>Generation Failed</h3>
                <p>${error.message || 'Please try again'}</p>
            </div>
        `;

    } finally {
        button.disabled = false;
        button.textContent = '✨ Generate Quiz';
    }
}

function displayQuiz(questions) {
    const content = document.getElementById('quiz-content');
    
    const questionsHTML = questions.map((q, index) => `
        <div class="quiz-question" data-question="${index}">
            <div class="question-number">Question ${index + 1} of ${questions.length}</div>
            <div class="question-text">${q.question}</div>
            <div class="quiz-options">
                ${q.options.map((option, optIndex) => `
                    <div class="quiz-option" data-option="${optIndex}" onclick="selectOption(${index}, ${optIndex})">
                        <div class="option-letter">${String.fromCharCode(65 + optIndex)}</div>
                        <div>${option}</div>
                    </div>
                `).join('')}
            </div>
            <div class="quiz-explanation">
                <strong>Explanation:</strong> ${q.explanation}
            </div>
        </div>
    `).join('');

    content.innerHTML = questionsHTML + `
        <div class="quiz-actions">
            <button class="btn-secondary" onclick="resetQuiz()">Reset Quiz</button>
            <button class="btn-primary" onclick="checkAnswers()">Check Answers</button>
        </div>
    `;

    // Store quiz data
    window.currentQuiz = questions;
    animateDynamicContent(content);
}

// Quiz interaction functions (global for onclick)
window.selectOption = function(questionIndex, optionIndex) {
    const question = document.querySelector(`[data-question="${questionIndex}"]`);
    const options = question.querySelectorAll('.quiz-option');
    
    // Remove previous selection
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add new selection
    options[optionIndex].classList.add('selected');
};

window.checkAnswers = function() {
    if (!window.currentQuiz) return;

    let correct = 0;
    const total = window.currentQuiz.length;

    window.currentQuiz.forEach((q, index) => {
        const question = document.querySelector(`[data-question="${index}"]`);
        const options = question.querySelectorAll('.quiz-option');
        const explanation = question.querySelector('.quiz-explanation');
        
        options.forEach((opt, optIndex) => {
            if (optIndex === q.correctAnswer) {
                opt.classList.add('correct');
            }
            if (opt.classList.contains('selected') && optIndex !== q.correctAnswer) {
                opt.classList.add('incorrect');
            }
            if (opt.classList.contains('selected') && optIndex === q.correctAnswer) {
                correct++;
            }
        });

        explanation.classList.add('show');
    });

    const percentage = Math.round((correct / total) * 100);
    showToast(`You scored ${correct}/${total} (${percentage}%)`, percentage >= 70 ? 'success' : 'warning');
};

window.resetQuiz = function() {
    const options = document.querySelectorAll('.quiz-option');
    const explanations = document.querySelectorAll('.quiz-explanation');
    
    options.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
    });
    
    explanations.forEach(exp => {
        exp.classList.remove('show');
    });
};

// ============================================
// GENERATE FLASHCARDS
// ============================================

async function handleGenerateFlashcards() {
    const button = document.getElementById('generate-flashcards-btn');
    const content = document.getElementById('flashcards-content');

    try {
        button.disabled = true;
        button.textContent = '⏳ Generating...';

        content.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>AI is creating flashcards from your notes...</p>
            </div>
        `;

        // Generate flashcards
        const noteText = getNoteText();
        const flashcards = await generateFlashcards(noteText, 10);

        // Save to database
        await saveGeneratedContent(currentNoteId, 'flashcards', flashcards);

        // Display flashcards
        displayFlashcards(flashcards);

        showToast('Flashcards generated successfully!', 'success');

    } catch (error) {
        console.error('Generate flashcards error:', error);
        showToast(error.message || 'Failed to generate flashcards', 'error');
        
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <h3>Generation Failed</h3>
                <p>${error.message || 'Please try again'}</p>
            </div>
        `;

    } finally {
        button.disabled = false;
        button.textContent = '✨ Generate Flashcards';
    }
}

function displayFlashcards(flashcards) {
    const content = document.getElementById('flashcards-content');
    
    const flashcardsHTML = flashcards.map((card, index) => `
        <div class="flashcard" onclick="flipCard(${index})">
            <div class="flashcard-inner" id="flashcard-${index}">
                <div class="flashcard-front">
                    <div class="flashcard-label">QUESTION</div>
                    <div class="flashcard-text">${card.front}</div>
                </div>
                <div class="flashcard-back">
                    <div class="flashcard-label">ANSWER</div>
                    <div class="flashcard-text">${card.back}</div>
                </div>
            </div>
            <div class="flip-hint">Click to flip</div>
        </div>
    `).join('');

    content.innerHTML = `<div class="flashcard-container">${flashcardsHTML}</div>`;
    animateDynamicContent(content);
}

// Flashcard flip function (global for onclick)
window.flipCard = function(index) {
    const card = document.getElementById(`flashcard-${index}`).parentElement;
    card.classList.toggle('flipped');
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get note text for AI processing.
 * Uses the extracted text saved during upload.
 * Logs clearly if the text is missing so it's easy to debug.
 */
function getNoteText() {
    const text = currentNote?.extractedText?.trim() || '';

    if (text.length > 100) {
        console.log(`📄 Using extracted text: ${text.length} characters from "${currentNote.title}"`);
        return text;
    }

    // Text is missing — show a visible warning with a re-extract button
    console.warn('⚠️ No extracted text found for this note.');
    console.warn('   Note title:', currentNote?.title);
    console.warn('   This usually means text extraction failed during upload.');

    showMissingTextWarning();

    return text || `Note title: ${currentNote?.title || 'Untitled'}. No text content available.`;
}

/**
 * Show a warning banner with a "Re-extract text" button when extractedText is empty.
 */
function showMissingTextWarning() {
    // Don't add duplicate banners
    if (document.getElementById('reextract-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'reextract-banner';
    banner.style.cssText = `
        background: #fffbeb;
        border: 1px solid #f59e0b;
        border-radius: 10px;
        padding: 1rem 1.25rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    `;
    banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-size:1.5rem;">⚠️</span>
            <div>
                <div style="font-weight:600; color:#92400e; margin-bottom:0.2rem;">No text extracted from this file</div>
                <div style="font-size:0.875rem; color:#b45309;">
                    Text extraction failed when this file was uploaded. Click "Re-extract" to try again,
                    or delete this note and re-upload the file.
                </div>
            </div>
        </div>
        <button id="reextract-btn" style="
            background:#f59e0b; color:white; border:none; border-radius:8px;
            padding:0.625rem 1.25rem; font-weight:600; cursor:pointer;
            font-size:0.875rem; white-space:nowrap;
        ">🔄 Re-extract Text</button>
    `;

    // Insert before the tab buttons
    const tabsEl = document.querySelector('.study-tabs') || document.querySelector('.tab-content');
    if (tabsEl) {
        tabsEl.parentNode.insertBefore(banner, tabsEl);
    }

    document.getElementById('reextract-btn').addEventListener('click', handleReextract);
    animateDynamicContent(banner);
}

/**
 * Fetch the file from its stored URL and re-run text extraction,
 * then update the note in the database.
 */
async function handleReextract() {
    const btn = document.getElementById('reextract-btn');
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = '⏳ Extracting…';

    try {
        if (!currentNote?.fileURL) {
            throw new Error('No file URL stored for this note. Please delete it and re-upload.');
        }

        // Fetch the file from Supabase Storage
        const response = await fetch(currentNote.fileURL);
        if (!response.ok) throw new Error(`Could not fetch file (HTTP ${response.status})`);

        const blob = await response.blob();

        // Reconstruct a File object so extractTextFromFile works
        const file = new File([blob], currentNote.fileName || 'file', {
            type: blob.type || currentNote.fileType || 'application/pdf',
        });

        // Use the already-imported extractTextFromFile (no dynamic import needed)
        const extractedText = await extractTextFromFile(file);

        if (!extractedText || extractedText.trim().length < 50) {
            throw new Error(
                'Still could not extract text. This PDF may be image-based (scanned). ' +
                'Try converting it to a text-based PDF, or take a screenshot and upload as JPG/PNG.'
            );
        }

        // Save the extracted text back to the database
        await updateNote(currentNoteId, { extracted_text: extractedText });

        // Update local state
        currentNote.extractedText = extractedText;

        // Remove the warning banner
        document.getElementById('reextract-banner')?.remove();

        showToast(`✅ Text extracted successfully (${extractedText.length} characters). You can now generate summaries.`, 'success');

    } catch (error) {
        console.error('Re-extract error:', error);
        showToast(error.message || 'Re-extraction failed. Try deleting and re-uploading the file.', 'error');
        btn.disabled = false;
        btn.textContent = '🔄 Re-extract Text';
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudyPage);
} else {
    initStudyPage();
}

