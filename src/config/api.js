/**
 * API Configuration
 *
 * Vite exposes VITE_* variables from .env via import.meta.env at build time.
 * No window.__ENV__ hack needed anymore.
 */

export const API_ENDPOINTS = {
    OPENAI:      'https://api.openai.com/v1',
    OCR_SPACE:   'https://api.ocr.space/parse/image',
    HUGGINGFACE: 'https://api-inference.huggingface.co/models',
};

export const API_KEYS = {
    OPENAI:      import.meta.env.VITE_OPENAI_API_KEY    || '',
    OCR_SPACE:   import.meta.env.VITE_OCR_API_KEY       || '',
    HUGGINGFACE: import.meta.env.VITE_HUGGINGFACE_TOKEN || '',
};

export const API_CONFIG = {
    OPENAI: {
        model:       'gpt-3.5-turbo',
        maxTokens:   2000,
        temperature: 0.7,
    },

    UPLOAD: {
        maxFileSize: 10 * 1024 * 1024, // 10 MB
        allowedTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.doc', '.docx'],
        typeLabels: {
            'application/pdf':   'PDF Document',
            'image/jpeg':        'JPEG Image',
            'image/jpg':         'JPEG Image',
            'image/png':         'PNG Image',
            'text/plain':        'Text File',
            'application/msword': 'Word Document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
        },
    },

    TIMEOUTS: {
        default: 30000,
        upload:  60000,
        ai:      45000,
    },
};

export function isApiConfigured(apiName) {
    const key = API_KEYS[apiName];
    return !!key && !key.startsWith('YOUR_');
}

export function getApiHeaders(apiName) {
    const headers = { 'Content-Type': 'application/json' };
    if (apiName === 'OPENAI' && isApiConfigured('OPENAI')) {
        headers['Authorization'] = `Bearer ${API_KEYS.OPENAI}`;
    }
    return headers;
}

