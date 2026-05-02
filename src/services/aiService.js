/**
 * AI Service
 * 
 * Handles all AI-related operations (OpenAI API calls).
 * This service generates summaries, quizzes, and flashcards.
 * UI components should call these functions, never API directly.
 */

import { API_ENDPOINTS, API_CONFIG, getApiHeaders, isApiConfigured } from '../config/api.js';

/**
 * Generate summary from text using AI
 * @param {string} text - Text to summarize
 * @param {number} maxLength - Maximum summary length (words)
 * @returns {Promise<string>} Generated summary
 */
export async function generateSummary(text, maxLength = 200) {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('No text provided for summarization');
        }

        // Development mode (mock AI)
        if (!isApiConfigured('OPENAI')) {
            console.log('🔧 Development mode: Mock AI summary');
            await mockDelay(2000);
            return generateMockSummary(text, maxLength);
        }

        // Production mode (real OpenAI API)
        const prompt = `Summarize the following text in approximately ${maxLength} words. Make it clear, concise, and educational:\n\n${text}`;

        const response = await fetch(`${API_ENDPOINTS.OPENAI}/chat/completions`, {
            method: 'POST',
            headers: getApiHeaders('OPENAI'),
            body: JSON.stringify({
                model: API_CONFIG.OPENAI.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful study assistant that creates clear, concise summaries for students.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: API_CONFIG.OPENAI.maxTokens,
                temperature: API_CONFIG.OPENAI.temperature,
            }),
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const summary = data.choices[0].message.content.trim();

        console.log('✅ Summary generated successfully');
        return summary;

    } catch (error) {
        console.error('Generate summary error:', error);
        throw new Error('Failed to generate summary. Please try again.');
    }
}

/**
 * Generate quiz questions from text using AI
 * @param {string} text - Text to create quiz from
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function generateQuiz(text, numQuestions = 5) {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('No text provided for quiz generation');
        }

        // Development mode (mock AI)
        if (!isApiConfigured('OPENAI')) {
            console.log('🔧 Development mode: Mock AI quiz');
            await mockDelay(2500);
            return generateMockQuiz(text, numQuestions);
        }

        // Production mode (real OpenAI API)
        const prompt = `Create ${numQuestions} multiple-choice questions based on the following text. 
        Format each question as JSON with: question, options (array of 4 choices), correctAnswer (index 0-3), and explanation.
        Return only a JSON array.\n\nText:\n${text}`;

        const response = await fetch(`${API_ENDPOINTS.OPENAI}/chat/completions`, {
            method: 'POST',
            headers: getApiHeaders('OPENAI'),
            body: JSON.stringify({
                model: API_CONFIG.OPENAI.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful study assistant that creates educational quiz questions. Always respond with valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: API_CONFIG.OPENAI.maxTokens,
                temperature: API_CONFIG.OPENAI.temperature,
            }),
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Parse JSON response
        const questions = JSON.parse(content);

        console.log('✅ Quiz generated successfully');
        return questions;

    } catch (error) {
        console.error('Generate quiz error:', error);
        throw new Error('Failed to generate quiz. Please try again.');
    }
}

/**
 * Generate flashcards from text using AI
 * @param {string} text - Text to create flashcards from
 * @param {number} numCards - Number of flashcards to generate
 * @returns {Promise<Array>} Array of flashcards
 */
export async function generateFlashcards(text, numCards = 10) {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('No text provided for flashcard generation');
        }

        // Development mode (mock AI)
        if (!isApiConfigured('OPENAI')) {
            console.log('🔧 Development mode: Mock AI flashcards');
            await mockDelay(2000);
            return generateMockFlashcards(text, numCards);
        }

        // Production mode (real OpenAI API)
        const prompt = `Create ${numCards} flashcards based on the following text. 
        Format each flashcard as JSON with: front (question/term) and back (answer/definition).
        Return only a JSON array.\n\nText:\n${text}`;

        const response = await fetch(`${API_ENDPOINTS.OPENAI}/chat/completions`, {
            method: 'POST',
            headers: getApiHeaders('OPENAI'),
            body: JSON.stringify({
                model: API_CONFIG.OPENAI.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful study assistant that creates educational flashcards. Always respond with valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: API_CONFIG.OPENAI.maxTokens,
                temperature: API_CONFIG.OPENAI.temperature,
            }),
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Parse JSON response
        const flashcards = JSON.parse(content);

        console.log('✅ Flashcards generated successfully');
        return flashcards;

    } catch (error) {
        console.error('Generate flashcards error:', error);
        throw new Error('Failed to generate flashcards. Please try again.');
    }
}

/**
 * Extract text from image using OCR
 * @param {string} imageUrl - Image URL or base64
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromImage(imageUrl) {
    try {
        // Development mode
        if (!isApiConfigured('OPENAI')) {
            console.log('🔧 Development mode: Mock OCR');
            await mockDelay(1500);
            return 'This is mock extracted text from the image. In production, this would use OCR or Vision API.';
        }

        // Production mode - Use OpenAI Vision API or dedicated OCR service
        // This is a placeholder - implement based on your chosen OCR service
        throw new Error('OCR not yet implemented. Please use PDF files for now.');

    } catch (error) {
        console.error('Extract text error:', error);
        throw new Error('Failed to extract text from image');
    }
}

// ============================================
// MOCK FUNCTIONS (Development Mode)
// ============================================

/**
 * Generate mock summary for development
 * @param {string} text - Original text
 * @param {number} maxLength - Max words
 * @returns {string} Mock summary
 */
function generateMockSummary(text, maxLength) {
    const words = text.split(' ').slice(0, maxLength);
    return `📝 Mock Summary: ${words.join(' ')}... (This is a development mode summary. Configure OpenAI API for real summaries.)`;
}

/**
 * Generate mock quiz for development
 * @param {string} text - Original text
 * @param {number} numQuestions - Number of questions
 * @returns {Array} Mock quiz questions
 */
function generateMockQuiz(text, numQuestions) {
    const questions = [];
    
    for (let i = 1; i <= numQuestions; i++) {
        questions.push({
            question: `Mock Question ${i}: What is the main topic discussed in the text?`,
            options: [
                'Option A: First possible answer',
                'Option B: Second possible answer',
                'Option C: Third possible answer',
                'Option D: Fourth possible answer'
            ],
            correctAnswer: 0,
            explanation: 'This is a mock question. Configure OpenAI API for real quiz generation.'
        });
    }
    
    return questions;
}

/**
 * Generate mock flashcards for development
 * @param {string} text - Original text
 * @param {number} numCards - Number of cards
 * @returns {Array} Mock flashcards
 */
function generateMockFlashcards(text, numCards) {
    const flashcards = [];
    
    for (let i = 1; i <= numCards; i++) {
        flashcards.push({
            front: `Mock Term ${i}`,
            back: `Mock Definition ${i}: This is a development mode flashcard. Configure OpenAI API for real flashcard generation.`
        });
    }
    
    return flashcards;
}

/**
 * Mock delay helper
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
function mockDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
