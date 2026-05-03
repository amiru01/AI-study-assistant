/**
 * Supabase Authentication Service
 * 
 * Handles all authentication operations using Supabase
 * Drop-in replacement for Firebase authService
 */

import { getSupabase, isSupabaseReady } from '../config/supabase.js';

// Current user cache
let currentUser = null;

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export async function registerUser(email, password) {
    try {
        const supabase = getSupabase();

        // Development mode (mock)
        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock user registration');
            await mockDelay(1000);
            
            const mockUser = {
                uid: 'mock-' + Date.now(),
                email: email,
                displayName: email.split('@')[0],
            };
            
            currentUser = mockUser;
            localStorage.setItem('mockUser', JSON.stringify(mockUser));
            return mockUser;
        }

        // Production mode (real Supabase)
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        if (data.user) {
            currentUser = {
                uid: data.user.id,
                email: data.user.email,
                displayName: email.split('@')[0],
            };
            
            console.log('✅ User registered successfully');
            return currentUser;
        }

        throw new Error('Registration failed');

    } catch (error) {
        console.error('Register error:', error);
        throw new Error(error.message || 'Failed to register user');
    }
}

/**
 * Login existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export async function loginUser(email, password) {
    try {
        const supabase = getSupabase();

        // Development mode (mock)
        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock user login');
            await mockDelay(1000);
            
            const mockUser = {
                uid: 'mock-' + Date.now(),
                email: email,
                displayName: email.split('@')[0],
            };
            
            currentUser = mockUser;
            localStorage.setItem('mockUser', JSON.stringify(mockUser));
            return mockUser;
        }

        // Production mode (real Supabase)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        if (data.user) {
            currentUser = {
                uid: data.user.id,
                email: data.user.email,
                displayName: email.split('@')[0],
            };
            
            console.log('✅ User logged in successfully');
            return currentUser;
        }

        throw new Error('Login failed');

    } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Failed to login');
    }
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    try {
        const supabase = getSupabase();

        // Development mode
        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock user logout');
            currentUser = null;
            localStorage.removeItem('mockUser');
            return;
        }

        // Production mode
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;

        currentUser = null;
        console.log('✅ User logged out successfully');

    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
}

/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
    // Development mode
    if (!isSupabaseReady()) {
        if (!currentUser) {
            const stored = localStorage.getItem('mockUser');
            if (stored) {
                currentUser = JSON.parse(stored);
            }
        }
        return currentUser;
    }

    // Production mode - get from Supabase session
    const supabase = getSupabase();
    const session = supabase.auth.getSession();
    
    if (session && session.data.session) {
        const user = session.data.session.user;
        currentUser = {
            uid: user.id,
            email: user.email,
            displayName: user.email.split('@')[0],
        };
    }
    
    return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Listen for auth state changes
 * @param {Function} callback - Callback function
 */
export function onAuthStateChanged(callback) {
    const supabase = getSupabase();

    // Development mode
    if (!isSupabaseReady()) {
        // Call callback immediately with current user
        callback(getCurrentUser());
        return () => {}; // Return empty unsubscribe function
    }

    // Production mode
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            currentUser = {
                uid: session.user.id,
                email: session.user.email,
                displayName: session.user.email.split('@')[0],
            };
            callback(currentUser);
        } else {
            currentUser = null;
            callback(null);
        }
    });

    // Return unsubscribe function
    return () => subscription.unsubscribe();
}

/**
 * Mock delay helper
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
function mockDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
