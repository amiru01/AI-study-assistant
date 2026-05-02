/**
 * Firebase Configuration Module
 * 
 * This is the ONLY file where Firebase is initialized.
 * All other modules import Firebase instances from here.
 * 
 * Setup Instructions:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Create/select your project
 * 3. Go to Project Settings > General
 * 4. Copy your config and replace the values below
 * 5. Enable Authentication, Firestore, and Storage in Firebase Console
 */

// Firebase Configuration Object
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Firebase instances (initialized once)
let auth = null;
let db = null;
let storage = null;
let isInitialized = false;

/**
 * Initialize Firebase App
 * @returns {boolean} True if initialized successfully
 */
export function initializeFirebase() {
    try {
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded. Running in development mode.');
            return false;
        }

        // Check if config is set
        if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
            console.warn('Firebase not configured. Running in development mode.');
            return false;
        }

        // Initialize Firebase (only once)
        if (!isInitialized) {
            firebase.initializeApp(firebaseConfig);
            
            // Initialize services
            auth = firebase.auth();
            db = firebase.firestore();
            storage = firebase.storage();
            
            isInitialized = true;
            console.log('✅ Firebase initialized successfully');
        }

        return true;

    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

/**
 * Get Firebase Authentication instance
 * @returns {Object|null} Firebase Auth instance
 */
export function getAuth() {
    if (!isInitialized) {
        initializeFirebase();
    }
    return auth;
}

/**
 * Get Firestore Database instance
 * @returns {Object|null} Firestore instance
 */
export function getFirestore() {
    if (!isInitialized) {
        initializeFirebase();
    }
    return db;
}

/**
 * Get Firebase Storage instance
 * @returns {Object|null} Firebase Storage instance
 */
export function getStorage() {
    if (!isInitialized) {
        initializeFirebase();
    }
    return storage;
}

/**
 * Check if Firebase is initialized and configured
 * @returns {boolean} True if Firebase is ready to use
 */
export function isFirebaseReady() {
    return isInitialized && auth !== null;
}

/**
 * Get Firebase timestamp
 * @returns {Object} Firebase server timestamp
 */
export function getTimestamp() {
    if (db && firebase.firestore) {
        return firebase.firestore.FieldValue.serverTimestamp();
    }
    return new Date().toISOString();
}

// Auto-initialize on module load
initializeFirebase();
