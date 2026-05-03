/**
 * Study Page Logic
 * 
 * Handles AI-powered study features (summary, quiz, flashcards)
 * This file contains ONLY UI logic - all business logic is in services
 */

import { getCurrentUser, isAuthenticated, initAuthState } from '../services/supabaseAuthService.js';
import { getNote, getGeneratedContent, saveGeneratedContent } from '../services/supabaseDatabaseService.js';
import { generateSummary, generateQuiz, generateFlashcards } from '../services/aiService.js';
import { showToast } from '../components/toast.js';
import { showLoader, hideLoader } from '../components/loader.js';
import { formatDate } from '../utils/formatting.js';

// Global state
let currentNote = null;
let currentNoteId = null;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize study page
 */
export async function initStudyPage() {
    // Initialize auth state first
    await initAuthState();
    
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'auth-refactored.html';
        return;
    }

    // Get note ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentNoteId = urlParams.get('noteId');

    if (!currentNoteId) {
        showToast('No note selected', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard-refactored.html';
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
            window.location.href = 'dashboard-refactored.html';
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
            document.getElementById(`${targetTab}-tab`).classList.add('active');
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
    
    content.innerHTML = `
        <div class="summary-text">
            ${summary.split('\n').map(para => `<p>${para}</p>`).join('')}
        </div>
    `;
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
 * Get note text for AI processing
 * Uses extracted text from the note, or falls back to mock text
 */
function getNoteText() {
    if (currentNote && currentNote.extractedText && currentNote.extractedText.trim().length > 100) {
        return currentNote.extractedText;
    }
    
    // Fallback to mock text if no extracted text available
    console.warn('⚠️ No extracted text found, using mock text');
    return getMockNoteText();
}

/**
 * Get mock note text for AI processing (fallback)
 * In production, this would extract text from the uploaded file
 */
function getMockNoteText() {
    return `
        Introduction to Photosynthesis
        
        Photosynthesis is the process by which plants convert light energy into chemical energy.
        This process occurs in the chloroplasts of plant cells and involves two main stages:
        the light-dependent reactions and the light-independent reactions (Calvin cycle).
        
        Light-Dependent Reactions:
        - Occur in the thylakoid membranes
        - Require light energy
        - Produce ATP and NADPH
        - Release oxygen as a byproduct
        
        Calvin Cycle (Light-Independent Reactions):
        - Occur in the stroma
        - Use ATP and NADPH from light reactions
        - Fix carbon dioxide into glucose
        - Do not directly require light
        
        The overall equation for photosynthesis is:
        6CO2 + 6H2O + light energy → C6H12O6 + 6O2
        
        Importance of Photosynthesis:
        - Produces oxygen for aerobic organisms
        - Forms the base of most food chains
        - Removes carbon dioxide from the atmosphere
        - Stores energy in chemical bonds
    `;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudyPage);
} else {
    initStudyPage();
}
