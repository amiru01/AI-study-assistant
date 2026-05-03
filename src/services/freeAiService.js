/**
 * Free AI Service (Hugging Face)
 * 
 * Uses Hugging Face Inference API (100% FREE)
 * Alternative to OpenAI for zero-cost AI generation
 */

import { API_ENDPOINTS, API_KEYS } from '../config/api.js';

// Hugging Face models (all free!)
const MODELS = {
    SUMMARIZATION: 'facebook/bart-large-cnn',
    TEXT_GENERATION: 'mistralai/Mistral-7B-Instruct-v0.2',
    QUESTION_ANSWERING: 'deepset/roberta-base-squad2',
};

/**
 * Generate summary using Hugging Face (FREE)
 * @param {string} text - Text to summarize
 * @param {number} maxLength - Maximum summary length
 * @returns {Promise<string>} Generated summary
 */
export async function generateSummaryFree(text, maxLength = 200) {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('No text provided for summarization');
        }

        // Check if Hugging Face is configured
        if (!API_KEYS.HUGGINGFACE || API_KEYS.HUGGINGFACE === 'YOUR_HUGGINGFACE_TOKEN_HERE') {
            console.warn('🔧 Hugging Face not configured, using mock summary');
            await mockDelay(2000);
            return generateMockSummary(text);
        }

        console.log('🤖 Generating summary with Hugging Face (FREE)...');

        // Truncate text if too long (Hugging Face has limits)
        const truncatedText = text.substring(0, 1024);

        const response = await fetch(
            `${API_ENDPOINTS.HUGGINGFACE}/${MODELS.SUMMARIZATION}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEYS.HUGGINGFACE}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: truncatedText,
                    parameters: {
                        max_length: maxLength,
                        min_length: 50,
                        do_sample: false,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            
            // Handle model loading (first request takes time)
            if (error.error && error.error.includes('loading')) {
                console.log('⏳ Model is loading, please wait...');
                await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
                return generateSummaryFree(text, maxLength); // Retry
            }
            
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const data = await response.json();
        const summary = data[0]?.summary_text || data[0]?.generated_text || '';

        if (!summary) {
            throw new Error('No summary generated');
        }

        console.log('✅ Summary generated successfully (FREE)');
        return summary;

    } catch (error) {
        console.error('Generate summary error:', error);
        
        // Fallback to mock
        console.warn('Using mock summary as fallback');
        return generateMockSummary(text);
    }
}

/**
 * Generate quiz using Hugging Face (FREE)
 * @param {string} text - Text to create quiz from
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function generateQuizFree(text, numQuestions = 5) {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('No text provided for quiz generation');
        }

        // Check if Hugging Face is configured
        if (!API_KEYS.HUGGINGFACE || API_KEYS.HUGGINGFACE === 'YOUR_HUGGINGFACE_TOKEN_HERE') {
            console.warn('🔧 Hugging Face not configured, using mock quiz');
            await mockDelay(2500);
            return generateMockQuiz(text, numQuestions);
        }

        console.log('🤖 Generating quiz with Hugging Face (FREE)...');

        // Use text generation model for quiz creation
        const prompt = `Based on the following text, create ${numQuestions} multiple-choice questions with 4 options each. Format as JSON array with question, options, correctAnswer (0-3), and explanation.\n\nText: ${text.substring(0, 500)}\n\nQuestions:`;

        const response = await fetch(
            `${API_ENDPOINTS.HUGGINGFACE}/${MODELS.TEXT_GENERATION}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEYS.HUGGINGFACE}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1000,
                        temperature: 0.7,
                        return_full_text: false,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            
            // Handle model loading
            if (error.error && error.error.includes('loading')) {
                console.log('⏳ Model is loading, please wait...');
                await new Promise(resolve => setTimeout(resolve, 20000));
                return generateQuizFree(text, numQuestions);
            }
            
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data[0]?.generated_text || '';

        // Try to parse JSON from response
        try {
            const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const questions = JSON.parse(jsonMatch[0]);
                console.log('✅ Quiz generated successfully (FREE)');
                return questions.slice(0, numQuestions);
            }
        } catch (parseError) {
            console.warn('Could not parse quiz JSON, using mock');
        }

        // Fallback to mock if parsing fails
        return generateMockQuiz(text, numQuestions);

    } catch (error) {
        console.error('Generate quiz error:', error);
        console.warn('Using mock quiz as fallback');
        return generateMockQuiz(text, numQuestions);
    }
}

/**
 * Generate flashcards using Hugging Face (FREE)
 * @param {string} text - Text to create flashcards from
 * @param {number} numCards - Number of flashcards
 * @returns {Promise<Array>} Array of flashcards
 */
export async function generateFlashcardsFree(text, numCards = 10) {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('No text provided for flashcard generation');
        }

        // Check if Hugging Face is configured
        if (!API_KEYS.HUGGINGFACE || API_KEYS.HUGGINGFACE === 'YOUR_HUGGINGFACE_TOKEN_HERE') {
            console.warn('🔧 Hugging Face not configured, using mock flashcards');
            await mockDelay(2000);
            return generateMockFlashcards(text, numCards);
        }

        console.log('🤖 Generating flashcards with Hugging Face (FREE)...');

        // Use text generation for flashcards
        const prompt = `Based on the following text, create ${numCards} flashcards. Format as JSON array with front (question) and back (answer).\n\nText: ${text.substring(0, 500)}\n\nFlashcards:`;

        const response = await fetch(
            `${API_ENDPOINTS.HUGGINGFACE}/${MODELS.TEXT_GENERATION}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEYS.HUGGINGFACE}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 800,
                        temperature: 0.7,
                        return_full_text: false,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            
            // Handle model loading
            if (error.error && error.error.includes('loading')) {
                console.log('⏳ Model is loading, please wait...');
                await new Promise(resolve => setTimeout(resolve, 20000));
                return generateFlashcardsFree(text, numCards);
            }
            
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data[0]?.generated_text || '';

        // Try to parse JSON from response
        try {
            const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const flashcards = JSON.parse(jsonMatch[0]);
                console.log('✅ Flashcards generated successfully (FREE)');
                return flashcards.slice(0, numCards);
            }
        } catch (parseError) {
            console.warn('Could not parse flashcards JSON, using mock');
        }

        // Fallback to mock if parsing fails
        return generateMockFlashcards(text, numCards);

    } catch (error) {
        console.error('Generate flashcards error:', error);
        console.warn('Using mock flashcards as fallback');
        return generateMockFlashcards(text, numCards);
    }
}

// ============================================
// MOCK FUNCTIONS (Fallback)
// ============================================

function generateMockSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ') + '.';
    return summary || 'This is a summary of the provided text. The main topics include key concepts and important information from the document.';
}

function generateMockQuiz(text, numQuestions) {
    const questions = [];
    const topics = extractTopics(text);
    
    for (let i = 0; i < numQuestions; i++) {
        const topic = topics[i % topics.length] || 'the main topic';
        questions.push({
            question: `What is the significance of ${topic} in the context of this material?`,
            options: [
                `${topic} is a fundamental concept that forms the basis of understanding`,
                `${topic} is a secondary element with limited importance`,
                `${topic} is not discussed in the material`,
                `${topic} is only mentioned briefly without detail`
            ],
            correctAnswer: 0,
            explanation: `${topic} is discussed as a key concept in the material and understanding it is essential for grasping the overall content.`
        });
    }
    
    return questions;
}

function generateMockFlashcards(text, numCards) {
    const flashcards = [];
    const topics = extractTopics(text);
    
    for (let i = 0; i < numCards; i++) {
        const topic = topics[i % topics.length] || `Concept ${i + 1}`;
        flashcards.push({
            front: `What is ${topic}?`,
            back: `${topic} is an important concept discussed in the material. It relates to the main themes and helps build understanding of the subject matter.`
        });
    }
    
    return flashcards;
}

function extractTopics(text) {
    // Simple topic extraction (first words of sentences)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const topics = sentences.map(s => {
        const words = s.trim().split(' ').filter(w => w.length > 4);
        return words[0] || 'topic';
    }).slice(0, 10);
    
    return topics.length > 0 ? topics : ['the main concept', 'key principles', 'important ideas'];
}

function mockDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
