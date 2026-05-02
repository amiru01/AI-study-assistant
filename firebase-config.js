// ============================================
// FIREBASE CONFIGURATION
// ============================================

/**
 * Firebase Configuration Object
 * 
 * INSTRUCTIONS:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Create a new project or select existing project
 * 3. Go to Project Settings > General
 * 4. Scroll down to "Your apps" section
 * 5. Click on Web icon (</>) to add a web app
 * 6. Copy the configuration object and replace the values below
 * 7. Enable Authentication in Firebase Console:
 *    - Go to Authentication > Sign-in method
 *    - Enable Email/Password authentication
 * 8. Enable Firestore Database:
 *    - Go to Firestore Database
 *    - Create database (start in test mode for development)
 * 9. Enable Storage:
 *    - Go to Storage
 *    - Get started (use default settings)
 */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// ============================================
// INITIALIZE FIREBASE
// ============================================

/**
 * Initialize Firebase App
 * This function checks if Firebase SDK is loaded and initializes the app
 */
function initializeFirebase() {
    try {
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded. Please include Firebase scripts in your HTML.');
            console.warn('Add these scripts before firebase-config.js:');
            console.warn('1. <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js"></script>');
            console.warn('2. <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-auth-compat.js"></script>');
            console.warn('3. <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore-compat.js"></script>');
            console.warn('4. <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-storage-compat.js"></script>');
            return false;
        }

        // Check if config is set
        if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
            console.warn('Firebase configuration not set. Please update firebase-config.js with your Firebase project credentials.');
            console.warn('Running in development mode with mock authentication.');
            return false;
        }

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        console.log('✅ Firebase initialized successfully!');
        return true;

    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// ============================================
// FIREBASE SERVICES
// ============================================

/**
 * Get Firebase Authentication instance
 * @returns {Object} Firebase Auth instance
 */
function getAuth() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth();
    }
    console.warn('Firebase Auth not available');
    return null;
}

/**
 * Get Firestore Database instance
 * @returns {Object} Firestore instance
 */
function getFirestore() {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        return firebase.firestore();
    }
    console.warn('Firestore not available');
    return null;
}

/**
 * Get Firebase Storage instance
 * @returns {Object} Firebase Storage instance
 */
function getStorage() {
    if (typeof firebase !== 'undefined' && firebase.storage) {
        return firebase.storage();
    }
    console.warn('Firebase Storage not available');
    return null;
}

// ============================================
// AUTH STATE OBSERVER
// ============================================

/**
 * Monitor authentication state changes
 * This function listens for user login/logout events
 */
function initAuthStateObserver() {
    const auth = getAuth();
    
    if (!auth) {
        console.warn('Auth state observer not initialized - Firebase Auth not available');
        return;
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log('User signed in:', user.email);
            
            // Store user info in localStorage for quick access
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            }));

            // You can redirect to dashboard here if needed
            // window.location.href = 'dashboard.html';

        } else {
            // User is signed out
            console.log('User signed out');
            localStorage.removeItem('currentUser');

            // Redirect to login if on protected pages
            const protectedPages = ['dashboard.html', 'upload.html', 'study.html'];
            const currentPage = window.location.pathname.split('/').pop();
            
            if (protectedPages.includes(currentPage)) {
                window.location.href = 'auth.html';
            }
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get current user from localStorage
 * @returns {Object|null} Current user object or null
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Sign out current user
 */
async function signOut() {
    const auth = getAuth();
    
    if (auth) {
        try {
            await auth.signOut();
            console.log('User signed out successfully');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    } else {
        // Mock sign out
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

// Initialize Firebase when script loads
const isFirebaseInitialized = initializeFirebase();

// Initialize auth state observer
if (isFirebaseInitialized) {
    initAuthStateObserver();
}

// ============================================
// FIREBASE SDK SCRIPT TAGS (Add to HTML)
// ============================================

/*
Add these script tags to your HTML file BEFORE firebase-config.js:

<!-- Firebase App (Core) -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>

<!-- Firebase Authentication -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>

<!-- Firebase Firestore -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Firebase Storage -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>

<!-- Your Firebase Config -->
<script src="firebase-config.js"></script>

*/
