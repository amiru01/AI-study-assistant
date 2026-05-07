/**
 * Supabase Configuration
 *
 * Uses the @supabase/supabase-js npm package (bundled by Vite).
 * The anon key is intentionally public — RLS protects the data.
 * NEVER put a service_role key here.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL     || 'https://gtyzqrhfdqizmykdrwws.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXpxcmhmZHFpem15a2Ryd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Njg2NjAsImV4cCI6MjA5MzM0NDY2MH0.W72zFjo6BFMdp_IpV7ULQtsLND8Hm-a8X3k3vTpbOQw';

let supabase = null;

export function initializeSupabase() {
    try {
        if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
            console.warn('Supabase not configured — running in development mode.');
            return false;
        }

        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized');
        return true;
    } catch (error) {
        console.error('❌ Supabase init error:', error);
        return false;
    }
}

export function getSupabase() {
    if (!supabase) initializeSupabase();
    return supabase;
}

export function isSupabaseReady() {
    return supabase !== null && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE';
}

// Auto-init on import
initializeSupabase();

