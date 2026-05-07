/**
 * Authentication Service
 * 
 * Handles all authentication-related operations.
 * This service is the ONLY place where auth logic exists.
 * UI components should call these functions, never Firebase directly.
 */

import { getAuth, isFirebaseReady } from '../config/firebase.js';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User's full name
 * @returns {Promise<Object>} User object
 * @throws {Error} Registration error
 */
export async function registerUser(email, password, displayName) {
    try {
        const auth = getAuth();

        // Development mode (no Firebase)
        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock registration');
            await mockDelay(1500);
            
            const mockUser = {
                uid: 'mock-' + Date.now(),
                email: email,
                displayName: displayName,
            };
            
            // Store in localStorage for development
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            return mockUser;
        }

        // Production mode (with Firebase)
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with display name
        await userCredential.user.updateProfile({
            displayName: displayName
        });

        // Store user data in Firestore (via databaseService)
        const { saveUserProfile } = await import('./databaseService.js');
        await saveUserProfile(userCredential.user.uid, {
            email: email,
            displayName: displayName,
            createdAt: new Date().toISOString(),
        });

        const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: displayName,
        };

        // Cache user data
        localStorage.setItem('currentUser', JSON.stringify(user));

        return user;

    } catch (error) {
        console.error('Registration error:', error);
        throw handleAuthError(error);
    }
}

/**
 * Login existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 * @throws {Error} Login error
 */
export async function loginUser(email, password) {
    try {
        const auth = getAuth();

        // Development mode (no Firebase)
        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock login');
            await mockDelay(1500);
            
            const mockUser = {
                uid: 'mock-' + Date.now(),
                email: email,
                displayName: email.split('@')[0],
            };
            
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            return mockUser;
        }

        // Production mode (with Firebase)
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
        };

        // Cache user data
        localStorage.setItem('currentUser', JSON.stringify(user));

        return user;

    } catch (error) {
        console.error('Login error:', error);
        throw handleAuthError(error);
    }
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    try {
        const auth = getAuth();

        // Clear localStorage
        localStorage.removeItem('currentUser');

        // Sign out from Firebase (if available)
        if (isFirebaseReady()) {
            await auth.signOut();
        }

        console.log('✅ User logged out successfully');

    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout. Please try again.');
    }
}

/**
 * Get current authenticated user
 * @returns {Object|null} User object or null
 */
export function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function sendPasswordReset(email) {
    try {
        const auth = getAuth();

        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock password reset');
            await mockDelay(1000);
            return;
        }

        await auth.sendPasswordResetEmail(email);
        console.log('✅ Password reset email sent');

    } catch (error) {
        console.error('Password reset error:', error);
        throw handleAuthError(error);
    }
}

/**
 * Update user profile
 * @param {Object} updates - Profile updates (displayName, photoURL)
 * @returns {Promise<void>}
 */
export async function updateUserProfile(updates) {
    try {
        const auth = getAuth();
        const currentUser = auth?.currentUser;

        if (!currentUser && !isFirebaseReady()) {
            // Update localStorage in dev mode
            const user = getCurrentUser();
            if (user) {
                Object.assign(user, updates);
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
            return;
        }

        if (currentUser) {
            await currentUser.updateProfile(updates);
            
            // Update cached data
            const user = getCurrentUser();
            if (user) {
                Object.assign(user, updates);
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
        }

    } catch (error) {
        console.error('Profile update error:', error);
        throw new Error('Failed to update profile');
    }
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function(user)
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChanged(callback) {
    const auth = getAuth();

    if (!isFirebaseReady()) {
        // In dev mode, call callback with cached user
        const user = getCurrentUser();
        setTimeout(() => callback(user), 0);
        return () => {}; // No-op unsubscribe
    }

    return auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
            const user = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            callback(user);
        } else {
            localStorage.removeItem('currentUser');
            callback(null);
        }
    });
}

// ============================================
// HELPER FUNCTIONS (Private)
// ============================================

/**
 * Handle Firebase authentication errors
 * @param {Error} error - Firebase error
 * @returns {Error} User-friendly error
 */
function handleAuthError(error) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password is too weak (minimum 6 characters)',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/user-disabled': 'This account has been disabled',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/network-request-failed': 'Network error. Check your connection',
    };

    const message = errorMessages[error.code] || error.message || 'Authentication failed';
    return new Error(message);
}

/**
 * Mock delay for development mode
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function mockDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

