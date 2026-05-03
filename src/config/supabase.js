/**
 * Supabase Configuration
 * 
 * Free alternative to Firebase - no credit card required!
 * Get your credentials from: https://supabase.com/dashboard/project/_/settings/api
 */

// IMPORTANT: Replace these with YOUR actual Supabase credentials
const SUPABASE_URL = 'https://gtyzqrhfdqizmykdrwws.supabase.co'; // Example: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXpxcmhmZHFpem15a2Ryd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Njg2NjAsImV4cCI6MjA5MzM0NDY2MH0.W72zFjo6BFMdp_IpV7ULQtsLND8Hm-a8X3k3vTpbOQw'; // Long string starting with eyJhbGc...

// Initialize Supabase client (will be set after script loads)
let supabase = null;

/**
 * Initialize Supabase client
 * @returns {boolean} True if initialized successfully
 */
export function initializeSupabase() {
    try {
        // Check if Supabase SDK is loaded
        if (typeof window.supabase === 'undefined') {
            console.warn('Supabase SDK not loaded. Make sure to include the script tag.');
            return false;
        }

        // Check if config is set
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
            console.warn('Supabase not configured. Running in development mode.');
            return false;
        }

        // Initialize Supabase client
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase initialized successfully');
        return true;

    } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        return false;
    }
}

/**
 * Get Supabase client instance
 * @returns {Object|null} Supabase client
 */
export function getSupabase() {
    if (!supabase) {
        initializeSupabase();
    }
    return supabase;
}

/**
 * Check if Supabase is configured and ready
 * @returns {boolean} True if Supabase is ready to use
 */
export function isSupabaseReady() {
    return supabase !== null && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE';
}

// Auto-initialize on module load
initializeSupabase();
