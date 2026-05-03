/**
 * API Configuration Module
 * 
 * Centralized configuration for all external APIs
 * (OpenAI, OCR services, etc.)
 */

// API Endpoints
export const API_ENDPOINTS = {
    OPENAI: 'https://api.openai.com/v1',
    OCR_SPACE: 'https://api.ocr.space/parse/image',
    HUGGINGFACE: 'https://api-inference.huggingface.co/models',
    // Add other API endpoints here
};

// API Keys (should be stored in environment variables in production)
// IMPORTANT: Replace these with your actual API keys
// For production, use environment variables: import.meta.env.VITE_OPENAI_API_KEY
export const API_KEYS = {
    OPENAI: import.meta.env?.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
    OCR_SPACE: import.meta.env?.VITE_OCR_API_KEY || 'YOUR_OCR_API_KEY_HERE',
    HUGGINGFACE: import.meta.env?.VITE_HUGGINGFACE_TOKEN || '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',
    // Add other API keys here
};

// API Configuration
export const API_CONFIG = {
    OPENAI: {
        model: 'gpt-3.5-turbo',
        maxTokens: 2000,
        temperature: 0.7,
    },
    
    // File upload limits
    UPLOAD: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    },
    
    // Request timeouts
    TIMEOUTS: {
        default: 30000, // 30 seconds
        upload: 60000,  // 60 seconds
        ai: 45000,      // 45 seconds
    },
};

/**
 * Check if API is configured
 * @param {string} apiName - Name of the API
 * @returns {boolean} True if API key is set
 */
export function isApiConfigured(apiName) {
    return API_KEYS[apiName] && API_KEYS[apiName] !== `YOUR_${apiName}_API_KEY_HERE`;
}

/**
 * Get API headers for authenticated requests
 * @param {string} apiName - Name of the API
 * @returns {Object} Headers object
 */
export function getApiHeaders(apiName) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (apiName === 'OPENAI' && isApiConfigured('OPENAI')) {
        headers['Authorization'] = `Bearer ${API_KEYS.OPENAI}`;
    }

    return headers;
}
