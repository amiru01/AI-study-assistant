// ============================================
// AUTH.JS - Authentication Logic
// ============================================

// ============================================
// 1. TAB SWITCHING FUNCTIONALITY
// ============================================

/**
 * Initialize tab switching between Login and Register forms
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const formContainers = document.querySelectorAll('.form-container');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the target tab
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all tabs and forms
            tabButtons.forEach(btn => btn.classList.remove('active'));
            formContainers.forEach(form => form.classList.remove('active'));

            // Add active class to clicked tab
            button.classList.add('active');

            // Show corresponding form
            const targetForm = document.getElementById(`${targetTab}-form`);
            if (targetForm) {
                targetForm.classList.add('active');
            }

            // Clear all form errors when switching tabs
            clearAllErrors();
        });
    });
}

// ============================================
// 2. PASSWORD VISIBILITY TOGGLE
// ============================================

/**
 * Toggle password visibility (show/hide)
 */
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = button.querySelector('.eye-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.textContent = '🙈'; // Closed eye
            } else {
                passwordInput.type = 'password';
                eyeIcon.textContent = '👁️'; // Open eye
            }
        });
    });
}

// ============================================
// 3. FORM VALIDATION FUNCTIONS
// ============================================

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Object with isValid and strength properties
 */
function validatePassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 0;
    if (password.length >= minLength) strength++;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    let strengthLevel = 'weak';
    if (strength >= 4) strengthLevel = 'strong';
    else if (strength >= 2) strengthLevel = 'medium';

    return {
        isValid: password.length >= minLength,
        strength: strengthLevel,
        score: strength
    };
}

/**
 * Show error message for an input field
 * @param {string} inputId - ID of the input field
 * @param {string} message - Error message to display
 */
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}-error`);

    if (input && errorElement) {
        input.classList.add('error');
        input.classList.remove('success');
        errorElement.textContent = message;
    }
}

/**
 * Clear error message for an input field
 * @param {string} inputId - ID of the input field
 */
function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}-error`);

    if (input && errorElement) {
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.textContent = '';
    }
}

/**
 * Clear all error messages
 */
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputs = document.querySelectorAll('input');

    errorElements.forEach(el => el.textContent = '');
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
}

// ============================================
// 4. PASSWORD STRENGTH INDICATOR
// ============================================

/**
 * Update password strength indicator
 */
function initPasswordStrength() {
    const passwordInput = document.getElementById('register-password');
    const strengthContainer = document.getElementById('password-strength');
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

        // Remove all strength classes
        strengthFill.classList.remove('weak', 'medium', 'strong');
        strengthText.classList.remove('weak', 'medium', 'strong');

        // Add appropriate strength class
        strengthFill.classList.add(validation.strength);
        strengthText.classList.add(validation.strength);

        // Update text
        const strengthLabels = {
            weak: 'Weak password',
            medium: 'Medium password',
            strong: 'Strong password'
        };
        strengthText.textContent = strengthLabels[validation.strength];
    });
}

// ============================================
// 5. TOAST NOTIFICATION SYSTEM
// ============================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning)
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');

    // Set icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };

    toastIcon.textContent = icons[type] || icons.success;
    toastMessage.textContent = message;

    // Remove all type classes and add current type
    toast.classList.remove('success', 'error', 'warning');
    toast.classList.add(type);

    // Show toast
    toast.classList.add('show');

    // Hide toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ============================================
// 6. BUTTON LOADING STATE
// ============================================

/**
 * Set button loading state
 * @param {string} buttonId - ID of the button
 * @param {boolean} isLoading - Loading state
 */
function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    if (isLoading) {
        button.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    } else {
        button.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// ============================================
// 7. LOGIN FORM VALIDATION & SUBMISSION
// ============================================

/**
 * Validate login form
 * @returns {boolean} - True if valid, false otherwise
 */
function validateLoginForm() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let isValid = true;

    // Validate email
    if (!email) {
        showError('login-email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('login-email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError('login-email');
    }

    // Validate password
    if (!password) {
        showError('login-password', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('login-password', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearError('login-password');
    }

    return isValid;
}

/**
 * Handle login form submission
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateLoginForm()) {
            return;
        }

        // Get form values
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Set loading state
        setButtonLoading('login-btn', true);

        try {
            // Call Firebase login function
            await loginUser(email, password);

            // Show success message
            showToast('Login successful! Redirecting...', 'success');

            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            // Show error message
            showToast(error.message || 'Login failed. Please try again.', 'error');
            setButtonLoading('login-btn', false);
        }
    });
}

// ============================================
// 8. REGISTER FORM VALIDATION & SUBMISSION
// ============================================

/**
 * Validate register form
 * @returns {boolean} - True if valid, false otherwise
 */
function validateRegisterForm() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const termsCheckbox = document.getElementById('terms-checkbox');

    let isValid = true;

    // Validate name
    if (!name) {
        showError('register-name', 'Full name is required');
        isValid = false;
    } else if (name.length < 2) {
        showError('register-name', 'Name must be at least 2 characters');
        isValid = false;
    } else {
        clearError('register-name');
    }

    // Validate email
    if (!email) {
        showError('register-email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('register-email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError('register-email');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!password) {
        showError('register-password', 'Password is required');
        isValid = false;
    } else if (!passwordValidation.isValid) {
        showError('register-password', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearError('register-password');
    }

    // Validate confirm password
    if (!confirmPassword) {
        showError('register-confirm-password', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('register-confirm-password', 'Passwords do not match');
        isValid = false;
    } else {
        clearError('register-confirm-password');
    }

    // Validate terms checkbox
    if (!termsCheckbox.checked) {
        showToast('Please agree to the Terms & Conditions', 'warning');
        isValid = false;
    }

    return isValid;
}

/**
 * Handle register form submission
 */
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateRegisterForm()) {
            return;
        }

        // Get form values
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        // Set loading state
        setButtonLoading('register-btn', true);

        try {
            // Call Firebase register function
            await registerUser(email, password, name);

            // Show success message
            showToast('Account created successfully! Redirecting...', 'success');

            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            // Show error message
            showToast(error.message || 'Registration failed. Please try again.', 'error');
            setButtonLoading('register-btn', false);
        }
    });
}

// ============================================
// 9. FIREBASE AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user with Firebase
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User full name
 * @returns {Promise} - Firebase auth promise
 */
async function registerUser(email, password, name) {
    // TODO: Replace with actual Firebase implementation
    // This is a placeholder function structure

    return new Promise((resolve, reject) => {
        // Simulate API call delay
        setTimeout(() => {
            // Check if Firebase is initialized
            if (typeof firebase === 'undefined' || !firebase.auth) {
                console.log('Firebase not initialized. Using mock registration.');
                console.log('Registration data:', { email, name });
                
                // Mock success for development
                resolve({ user: { email, displayName: name } });
                return;
            }

            // Actual Firebase implementation (uncomment when Firebase is configured)
            /*
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Update user profile with name
                    return userCredential.user.updateProfile({
                        displayName: name
                    }).then(() => {
                        // Store additional user data in Firestore
                        return firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                            name: name,
                            email: email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }).then(() => {
                        resolve(userCredential);
                    });
                })
                .catch((error) => {
                    // Handle Firebase errors
                    let errorMessage = 'Registration failed';
                    
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage = 'This email is already registered';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Invalid email address';
                            break;
                        case 'auth/weak-password':
                            errorMessage = 'Password is too weak';
                            break;
                        default:
                            errorMessage = error.message;
                    }
                    
                    reject(new Error(errorMessage));
                });
            */
        }, 1500);
    });
}

/**
 * Login user with Firebase
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Firebase auth promise
 */
async function loginUser(email, password) {
    // TODO: Replace with actual Firebase implementation
    // This is a placeholder function structure

    return new Promise((resolve, reject) => {
        // Simulate API call delay
        setTimeout(() => {
            // Check if Firebase is initialized
            if (typeof firebase === 'undefined' || !firebase.auth) {
                console.log('Firebase not initialized. Using mock login.');
                console.log('Login data:', { email });
                
                // Mock success for development
                resolve({ user: { email } });
                return;
            }

            // Actual Firebase implementation (uncomment when Firebase is configured)
            /*
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    resolve(userCredential);
                })
                .catch((error) => {
                    // Handle Firebase errors
                    let errorMessage = 'Login failed';
                    
                    switch (error.code) {
                        case 'auth/user-not-found':
                            errorMessage = 'No account found with this email';
                            break;
                        case 'auth/wrong-password':
                            errorMessage = 'Incorrect password';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Invalid email address';
                            break;
                        case 'auth/user-disabled':
                            errorMessage = 'This account has been disabled';
                            break;
                        default:
                            errorMessage = error.message;
                    }
                    
                    reject(new Error(errorMessage));
                });
            */
        }, 1500);
    });
}

// ============================================
// 10. INITIALIZE ALL FUNCTIONALITY
// ============================================

/**
 * Initialize all authentication functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tab switching
    initTabSwitching();

    // Initialize password toggle
    initPasswordToggle();

    // Initialize password strength indicator
    initPasswordStrength();

    // Initialize login form
    initLoginForm();

    // Initialize register form
    initRegisterForm();

    console.log('Authentication system initialized successfully!');
});
