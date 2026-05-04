/**
 * Validation Utilities
 * 
 * Reusable validation functions for forms and data
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and strength
 */
export function validatePassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 0;
    if (password.length >= minLength) strength++;
    if (password.length >= 8) strength++;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    let strengthLevel = 'weak';
    if (strength >= 5) strengthLevel = 'strong';
    else if (strength >= 3) strengthLevel = 'medium';

    return {
        isValid: password.length >= minLength,
        strength: strengthLevel,
        score: strength,
        requirements: {
            minLength: password.length >= minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSpecialChar,
        }
    };
}

/**
 * Validate file for upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateFile(file, options = {}) {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.doc', '.docx'],
    } = options;

    const errors = [];

    if (!file) {
        errors.push('No file provided');
        return { isValid: false, errors };
    }

    // Reject dangerous / executable types regardless of extension
    const dangerousTypes = [
        'application/x-msdownload', 'application/x-executable',
        'application/x-sh', 'application/x-bat',
        'text/javascript', 'application/javascript',
        'text/html', 'application/xhtml+xml',
    ];
    if (dangerousTypes.includes(file.type)) {
        errors.push('This file type is not allowed for security reasons.');
        return { isValid: false, errors };
    }

    // Reject dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.sh', '.js', '.html', '.htm', '.php', '.py', '.rb', '.cmd', '.vbs', '.ps1'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (dangerousExtensions.includes(ext)) {
        errors.push('This file extension is not allowed for security reasons.');
        return { isValid: false, errors };
    }

    // Check file size
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
        errors.push(`File is too large. Maximum size is ${maxSizeMB}MB.`);
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
        errors.push('Unsupported file type. Allowed: PDF, JPG, PNG, TXT, DOC, DOCX.');
    }

    // Check extension
    if (!allowedExtensions.includes(ext)) {
        errors.push('Unsupported file extension. Allowed: .pdf, .jpg, .png, .txt, .doc, .docx.');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export function validateRequired(value, fieldName = 'Field') {
    const isEmpty = value === null || value === undefined || 
                    (typeof value === 'string' && value.trim() === '');
    
    return {
        isValid: !isEmpty,
        error: isEmpty ? `${fieldName} is required` : null
    };
}

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export function validateMinLength(value, minLength, fieldName = 'Field') {
    const isValid = value && value.length >= minLength;
    
    return {
        isValid,
        error: isValid ? null : `${fieldName} must be at least ${minLength} characters`
    };
}

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export function validateMaxLength(value, maxLength, fieldName = 'Field') {
    const isValid = !value || value.length <= maxLength;
    
    return {
        isValid,
        error: isValid ? null : `${fieldName} must not exceed ${maxLength} characters`
    };
}

/**
 * Validate password match
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {Object} Validation result
 */
export function validatePasswordMatch(password, confirmPassword) {
    const isValid = password === confirmPassword;
    
    return {
        isValid,
        error: isValid ? null : 'Passwords do not match'
    };
}
