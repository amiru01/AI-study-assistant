/**
 * Database Service
 * 
 * Handles all Firestore database operations.
 * This service manages notes, user profiles, and other data.
 * UI components should call these functions, never Firestore directly.
 */

import { getFirestore, isFirebaseReady, getTimestamp } from '../config/firebase.js';
import { getCurrentUser } from './authService.js';

/**
 * Save a new note to database
 * @param {Object} noteData - Note data
 * @returns {Promise<string>} Note ID
 */
export async function saveNote(noteData) {
    try {
        const db = getFirestore();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const note = {
            userId: user.uid,
            title: noteData.title || 'Untitled Note',
            fileURL: noteData.fileURL || '',
            fileName: noteData.fileName || '',
            fileType: noteData.fileType || '',
            extractedText: noteData.extractedText || '',
            createdAt: getTimestamp(),
            updatedAt: getTimestamp(),
        };

        // Development mode
        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock save note');
            const mockId = 'note-' + Date.now();
            const notes = getMockNotes();
            notes.push({ id: mockId, ...note, createdAt: new Date().toISOString() });
            localStorage.setItem('mockNotes', JSON.stringify(notes));
            return mockId;
        }

        // Production mode
        const docRef = await db.collection('notes').add(note);
        console.log('✅ Note saved:', docRef.id);
        return docRef.id;

    } catch (error) {
        console.error('Save note error:', error);
        throw new Error('Failed to save note');
    }
}

/**
 * Get all notes for current user
 * @returns {Promise<Array>} Array of notes
 */
export async function getNotes() {
    try {
        const db = getFirestore();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Development mode
        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock get notes');
            return getMockNotes();
        }

        // Production mode
        const snapshot = await db.collection('notes')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const notes = [];
        snapshot.forEach(doc => {
            notes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return notes;

    } catch (error) {
        console.error('Get notes error:', error);
        throw new Error('Failed to retrieve notes');
    }
}

/**
 * Get a single note by ID
 * @param {string} noteId - Note ID
 * @returns {Promise<Object>} Note object
 */
export async function getNote(noteId) {
    try {
        const db = getFirestore();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Development mode
        if (!isFirebaseReady()) {
            const notes = getMockNotes();
            const note = notes.find(n => n.id === noteId);
            if (!note) throw new Error('Note not found');
            return note;
        }

        // Production mode
        const doc = await db.collection('notes').doc(noteId).get();

        if (!doc.exists) {
            throw new Error('Note not found');
        }

        const note = doc.data();
        
        // Verify ownership
        if (note.userId !== user.uid) {
            throw new Error('Unauthorized access');
        }

        return {
            id: doc.id,
            ...note
        };

    } catch (error) {
        console.error('Get note error:', error);
        throw new Error('Failed to retrieve note');
    }
}

/**
 * Update an existing note
 * @param {string} noteId - Note ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateNote(noteId, updates) {
    try {
        const db = getFirestore();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const updateData = {
            ...updates,
            updatedAt: getTimestamp(),
        };

        // Development mode
        if (!isFirebaseReady()) {
            const notes = getMockNotes();
            const index = notes.findIndex(n => n.id === noteId);
            if (index === -1) throw new Error('Note not found');
            notes[index] = { ...notes[index], ...updateData, updatedAt: new Date().toISOString() };
            localStorage.setItem('mockNotes', JSON.stringify(notes));
            return;
        }

        // Production mode
        await db.collection('notes').doc(noteId).update(updateData);
        console.log('✅ Note updated:', noteId);

    } catch (error) {
        console.error('Update note error:', error);
        throw new Error('Failed to update note');
    }
}

/**
 * Delete a note
 * @param {string} noteId - Note ID
 * @returns {Promise<void>}
 */
export async function deleteNote(noteId) {
    try {
        const db = getFirestore();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Development mode
        if (!isFirebaseReady()) {
            const notes = getMockNotes();
            const filtered = notes.filter(n => n.id !== noteId);
            localStorage.setItem('mockNotes', JSON.stringify(filtered));
            return;
        }

        // Production mode
        await db.collection('notes').doc(noteId).delete();
        console.log('✅ Note deleted:', noteId);

    } catch (error) {
        console.error('Delete note error:', error);
        throw new Error('Failed to delete note');
    }
}

/**
 * Save user profile data
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data
 * @returns {Promise<void>}
 */
export async function saveUserProfile(userId, profileData) {
    try {
        const db = getFirestore();

        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock save profile');
            return;
        }

        await db.collection('users').doc(userId).set(profileData, { merge: true });
        console.log('✅ User profile saved');

    } catch (error) {
        console.error('Save profile error:', error);
        throw new Error('Failed to save profile');
    }
}

/**
 * Get user profile data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Profile data
 */
export async function getUserProfile(userId) {
    try {
        const db = getFirestore();

        if (!isFirebaseReady()) {
            return { userId, displayName: 'Dev User' };
        }

        const doc = await db.collection('users').doc(userId).get();
        
        if (!doc.exists) {
            return null;
        }

        return doc.data();

    } catch (error) {
        console.error('Get profile error:', error);
        throw new Error('Failed to retrieve profile');
    }
}

/**
 * Save AI-generated content (summary, quiz, flashcards)
 * @param {string} noteId - Note ID
 * @param {string} contentType - Type: 'summary', 'quiz', 'flashcards'
 * @param {Object} content - Generated content
 * @returns {Promise<string>} Content ID
 */
export async function saveGeneratedContent(noteId, contentType, content) {
    try {
        const db = getFirestore();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const data = {
            noteId: noteId,
            userId: user.uid,
            type: contentType,
            content: content,
            createdAt: getTimestamp(),
        };

        // Development mode
        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock save content');
            const mockId = `${contentType}-${Date.now()}`;
            return mockId;
        }

        // Production mode
        const docRef = await db.collection('generatedContent').add(data);
        console.log('✅ Generated content saved:', docRef.id);
        return docRef.id;

    } catch (error) {
        console.error('Save content error:', error);
        throw new Error('Failed to save generated content');
    }
}

/**
 * Get generated content for a note
 * @param {string} noteId - Note ID
 * @param {string} contentType - Type: 'summary', 'quiz', 'flashcards'
 * @returns {Promise<Object|null>} Generated content or null
 */
export async function getGeneratedContent(noteId, contentType) {
    try {
        const db = getFirestore();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Development mode
        if (!isFirebaseReady()) {
            return null;
        }

        // Production mode
        const snapshot = await db.collection('generatedContent')
            .where('noteId', '==', noteId)
            .where('userId', '==', user.uid)
            .where('type', '==', contentType)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };

    } catch (error) {
        console.error('Get content error:', error);
        throw new Error('Failed to retrieve generated content');
    }
}

// ============================================
// HELPER FUNCTIONS (Private)
// ============================================

/**
 * Get mock notes from localStorage (development mode)
 * @returns {Array} Array of mock notes
 */
function getMockNotes() {
    const notesStr = localStorage.getItem('mockNotes');
    return notesStr ? JSON.parse(notesStr) : [];
}

