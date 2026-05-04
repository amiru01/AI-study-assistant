/**
 * Authentication Page Logic
 * 
 * Handles login and registration UI interactions
 * This file contains ONLY UI logic - all business logic is in services
 */

import { registerUser, loginUser } from '../services/supabaseAuthService.js';
import { validateEmail, validatePassword, validatePasswordMatch, validateRequired, validateMinLength } from '../utils/validation.js';
import { showToast } from '../components/toast.js';
import { showButtonLoader, hideButtonLoader } from '../components/loader.js';

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize authentication page
 */
export function initAuthPage() {
    initTabSwitching();
    initPasswordToggle();
    initPasswordStrength();
    initLoginForm();
    initRegisterForm();
    
    console.log('✅ Auth page initialized');
}

// ============================================
// TAB SWITCHING
// ============================================

function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const formContainers = document.querySelectorAll('.form-container');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            formContainers.forEach(form => form.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(`${targetTab}-form`)?.classList.add('active');

            // Clear errors
            clearAllErrors();
        });
    });
}

// ============================================
// PASSWORD VISIBILITY TOGGLE
// ============================================

function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = button.querySelector('.eye-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                eyeIcon.textContent = '👁️';
            }
        });
    });
}

// ============================================
// PASSWORD STRENGTH INDICATOR
// ============================================

function initPasswordStrength() {
    const passwordInput = document.getElementById('register-password');
    const strengthContainer = document.getElementById('password-strength');
    
    if (!passwordInput || !strengthContainer) return;

    const strengthFill = strengthContainer.querySelector('.strength-fill');
    const strengthText = strengthContainer.querySelector('.strength-text');

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;

        if (password.length === 0) {
            strengthContainer.classList.remove('show');
            return;
        }

        strengthContainer.classList.add('show');
        const validation = validatePassword(password);

        // Update UI
        strengthFill.className = `strength-fill ${validation.strength}`;
        strengthText.className = `strength-text ${validation.strength}`;
        
        const labels = {
            weak: 'Weak password',
            medium: 'Medium password',
            strong: 'Strong password'
        };
        strengthText.textContent = labels[validation.strength];
    });
}

// ============================================
// LOGIN FORM
// ============================================

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Validate
        if (!validateLoginForm(email, password)) {
            return;
        }

        // Show loading
        const submitBtn = document.getElementById('login-btn');
        showButtonLoader(submitBtn, 'Logging in...');

        try {
            // Call auth service
            await loginUser(email, password);

            // Success
            showToast('Login successful! Redirecting...', 'success');

            // Redirect
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            // Error
            showToast(error.message, 'error');
            hideButtonLoader(submitBtn);
        }
    });
}

function validateLoginForm(email, password) {
    let isValid = true;

    // Validate email
    const emailValidation = validateRequired(email, 'Email');
    if (!emailValidation.isValid) {
        showError('login-email', emailValidation.error);
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('login-email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError('login-email');
    }

    // Validate password
    const passwordValidation = validateRequired(password, 'Password');
    if (!passwordValidation.isValid) {
        showError('login-password', passwordValidation.error);
        isValid = false;
    } else if (password.length < 6) {
        showError('login-password', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearError('login-password');
    }

    return isValid;
}

// ============================================
// REGISTER FORM
// ============================================

function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const termsCheckbox = document.getElementById('terms-checkbox');

        // Validate
        if (!validateRegisterForm(name, email, password, confirmPassword, termsCheckbox)) {
            return;
        }

        // Show loading
        const submitBtn = document.getElementById('register-btn');
        showButtonLoader(submitBtn, 'Creating account...');

        try {
            // Call auth service
            await registerUser(email, password, name);

            // Success
            showToast('Account created successfully! Redirecting...', 'success');

            // Redirect
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            // Error
            showToast(error.message, 'error');
            hideButtonLoader(submitBtn);
        }
    });
}

function validateRegisterForm(name, email, password, confirmPassword, termsCheckbox) {
    let isValid = true;

    // Validate name
    const nameValidation = validateMinLength(name, 2, 'Name');
    if (!nameValidation.isValid) {
        showError('register-name', nameValidation.error);
        isValid = false;
    } else {
        clearError('register-name');
    }

    // Validate email
    if (!validateEmail(email)) {
        showError('register-email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError('register-email');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showError('register-password', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearError('register-password');
    }

    // Validate confirm password
    const matchValidation = validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.isValid) {
        showError('register-confirm-password', matchValidation.error);
        isValid = false;
    } else {
        clearError('register-confirm-password');
    }

    // Validate terms
    if (!termsCheckbox.checked) {
        showToast('Please agree to the Terms & Conditions', 'warning');
        isValid = false;
    }

    return isValid;
}

// ============================================
// ERROR HANDLING
// ============================================

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}-error`);

    if (input && errorElement) {
        input.classList.add('error');
        input.classList.remove('success');
        errorElement.textContent = message;
    }
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}-error`);

    if (input && errorElement) {
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.textContent = '';
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputs = document.querySelectorAll('input');

    errorElements.forEach(el => el.textContent = '');
    inputs.forEach(input => input.classList.remove('error', 'success'));
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthPage);
} else {
    initAuthPage();
}
