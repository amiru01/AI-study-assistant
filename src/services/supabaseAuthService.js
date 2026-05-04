/**
 * Supabase Authentication Service
 *
 * Handles all authentication operations using Supabase.
 * Supports email/password and Google OAuth.
 */

import { getSupabase, isSupabaseReady } from '../config/supabase.js';

// Current user cache
let currentUser = null;

// ============================================
// HELPERS
// ============================================

/** Map a Supabase user object to our internal shape */
function mapUser(supabaseUser) {
    if (!supabaseUser) return null;
    return {
        uid: supabaseUser.id,
        email: supabaseUser.email,
        displayName:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            supabaseUser.email?.split('@')[0] ||
            'User',
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
        provider: supabaseUser.app_metadata?.provider || 'email',
    };
}

function mockDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// REGISTER
// ============================================

/**
 * Register a new user with email + password
 */
export async function registerUser(email, password, displayName) {
    try {
        const supabase = getSupabase();

        if (!isSupabaseReady()) {
            await mockDelay(1000);
            const mockUser = { uid: 'mock-' + Date.now(), email, displayName: displayName || email.split('@')[0], provider: 'email' };
            currentUser = mockUser;
            localStorage.setItem('mockUser', JSON.stringify(mockUser));
            return mockUser;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: displayName || email.split('@')[0] } },
        });

        if (error) throw error;
        if (!data.user) throw new Error('Registration failed — no user returned.');

        currentUser = mapUser(data.user);
        console.log('✅ User registered:', currentUser.email);
        return currentUser;

    } catch (error) {
        console.error('Register error:', error);
        throw new Error(error.message || 'Failed to register user');
    }
}

// ============================================
// EMAIL / PASSWORD LOGIN
// ============================================

/**
 * Login with email + password
 */
export async function loginUser(email, password) {
    try {
        const supabase = getSupabase();

        if (!isSupabaseReady()) {
            await mockDelay(1000);
            const mockUser = { uid: 'mock-' + Date.now(), email, displayName: email.split('@')[0], provider: 'email' };
            currentUser = mockUser;
            localStorage.setItem('mockUser', JSON.stringify(mockUser));
            return mockUser;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;
        if (!data.user) throw new Error('Login failed — no user returned.');

        currentUser = mapUser(data.user);
        console.log('✅ User logged in:', currentUser.email);
        return currentUser;

    } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Failed to login');
    }
}

// ============================================
// GOOGLE OAUTH
// ============================================

/**
 * Start Google OAuth sign-in flow.
 * Supabase redirects the browser to Google, then back to redirectTo.
 *
 * @param {string} redirectTo - URL to return to after Google auth (defaults to dashboard)
 */
export async function loginWithGoogle(redirectTo) {
    try {
        const supabase = getSupabase();

        if (!isSupabaseReady()) {
            throw new Error('Supabase is not configured. Please add your credentials to src/config/supabase.js');
        }

        // Build redirect URL — works for both localhost and production
        const origin = window.location.origin;
        const callbackUrl = redirectTo || (
            origin.includes('localhost') || origin.includes('127.0.0.1')
                ? `${origin}/public/dashboard.html`
                : `${origin}/public/dashboard.html`
        );

        console.log('🔑 Starting Google OAuth, redirect to:', callbackUrl);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: callbackUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',   // always show account picker
                },
            },
        });

        if (error) throw error;
        return data;

    } catch (error) {
        console.error('Google login error:', error);
        // Surface the raw Supabase message so the user sees exactly what's wrong
        throw new Error(error.message || 'Failed to start Google login');
    }
}

// ============================================
// LOGOUT
// ============================================

export async function logoutUser() {
    try {
        const supabase = getSupabase();

        if (!isSupabaseReady()) {
            currentUser = null;
            localStorage.removeItem('mockUser');
            return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        currentUser = null;
        console.log('✅ User logged out');

    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
}

// ============================================
// SESSION / USER STATE
// ============================================

/**
 * Initialize auth state — call this on every page load.
 * Handles both normal sessions and OAuth callback tokens in the URL.
 */
export async function initAuthState() {
    const supabase = getSupabase();

    if (!isSupabaseReady()) {
        const stored = localStorage.getItem('mockUser');
        if (stored) currentUser = JSON.parse(stored);
        return currentUser;
    }

    try {
        // exchangeCodeForSession handles the ?code= param that Supabase
        // appends to the redirectTo URL after Google OAuth
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
            currentUser = mapUser(session.user);
            console.log('✅ Auth state initialized:', currentUser.email, `(${currentUser.provider})`);
        } else {
            currentUser = null;
        }

        return currentUser;

    } catch (error) {
        console.error('Error initializing auth state:', error);
        return null;
    }
}

/**
 * Get the currently cached user (synchronous).
 * Always call initAuthState() first on page load.
 */
export function getCurrentUser() {
    if (!isSupabaseReady()) {
        if (!currentUser) {
            const stored = localStorage.getItem('mockUser');
            if (stored) currentUser = JSON.parse(stored);
        }
        return currentUser;
    }
    return currentUser;
}

export function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Subscribe to auth state changes (login / logout / token refresh).
 * Returns an unsubscribe function.
 */
export function onAuthStateChanged(callback) {
    const supabase = getSupabase();

    if (!isSupabaseReady()) {
        callback(getCurrentUser());
        return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            currentUser = mapUser(session.user);
            callback(currentUser);
        } else {
            currentUser = null;
            callback(null);
        }
    });

    return () => subscription.unsubscribe();
}
