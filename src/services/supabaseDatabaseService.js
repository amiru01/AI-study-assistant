/**
 * Supabase Database Service
 * 
 * Handles all database operations using Supabase
 * Drop-in replacement for Firebase databaseService
 */

import { getSupabase, isSupabaseReady } from '../config/supabase.js';
import { getCurrentUser } from './supabaseAuthService.js';

/**
 * Save a new note to database
 * @param {Object} noteData - Note data
 * @returns {Promise<string>} Note ID
 */
export async function saveNote(noteData) {
    try {
        const supabase = getSupabase();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const note = {
            user_id: user.uid,
            title: noteData.title || 'Untitled Note',
            file_url: noteData.fileURL || '',
            file_name: noteData.fileName || '',
            file_type: noteData.fileType || '',
            file_size: noteData.fileSize || 0,
            extracted_text: noteData.extractedText || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Development mode
        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock save note');
            const mockId = 'note-' + Date.now();
            const notes = getMockNotes();
            notes.push({ id: mockId, ...note });
            localStorage.setItem('mockNotes', JSON.stringify(notes));
            return mockId;
        }

        // Production mode
        const { data, error } = await supabase
            .from('notes')
            .insert([note])
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Note saved:', data.id);
        return data.id;

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
        const supabase = getSupabase();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Development mode
        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock get notes');
            return getMockNotes();
        }

        // Production mode
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert snake_case to camelCase for compatibility
        const notes = data.map(note => ({
            id: note.id,
            userId: note.user_id,
            title: note.title,
            fileURL: note.file_url,
            fileName: note.file_name,
            fileType: note.file_type,
            fileSize: note.file_size,
            extractedText: note.extracted_text,
            createdAt: note.created_at,
            updatedAt: note.updated_at,
        }));

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
        const supabase = getSupabase();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Development mode
        if (!isSupabaseReady()) {
            const notes = getMockNotes();
            const note = notes.find(n => n.id === noteId);
            if (!note) throw new Error('Note not found');
            return note;
        }

        // Production mode
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .eq('user_id', user.uid)
            .single();

        if (error) throw error;

        // Convert to camelCase
        return {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            fileURL: data.file_url,
            fileName: data.file_name,
            fileType: data.file_type,
            fileSize: data.file_size,
            extractedText: data.extracted_text,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
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
        const supabase = getSupabase();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        // Development mode
        if (!isSupabaseReady()) {
            const notes = getMockNotes();
            const index = notes.findIndex(n => n.id === noteId);
            if (index === -1) throw new Error('Note not found');
            notes[index] = { ...notes[index], ...updateData };
            localStorage.setItem('mockNotes', JSON.stringify(notes));
            return;
        }

        // Production mode
        const { error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', noteId)
            .eq('user_id', user.uid);

        if (error) throw error;

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
        const supabase = getSupabase();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Development mode
        if (!isSupabaseReady()) {
            const notes = getMockNotes();
            const filtered = notes.filter(n => n.id !== noteId);
            localStorage.setItem('mockNotes', JSON.stringify(filtered));
            return;
        }

        // Production mode
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', user.uid);

        if (error) throw error;

        console.log('✅ Note deleted:', noteId);

    } catch (error) {
        console.error('Delete note error:', error);
        throw new Error('Failed to delete note');
    }
}

/**
 * Save AI-generated content
 * @param {string} noteId - Note ID
 * @param {string} contentType - Type: 'summary', 'quiz', 'flashcards'
 * @param {Object} content - Generated content
 * @returns {Promise<string>} Content ID
 */
export async function saveGeneratedContent(noteId, contentType, content) {
    try {
        const supabase = getSupabase();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const data = {
            note_id: noteId,
            user_id: user.uid,
            type: contentType,
            content: content,
            created_at: new Date().toISOString(),
        };

        // Development mode
        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock save content');
            const mockId = `${contentType}-${Date.now()}`;
            return mockId;
        }

        // Production mode
        const { data: result, error } = await supabase
            .from('generated_content')
            .insert([data])
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Generated content saved:', result.id);
        return result.id;

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
        const supabase = getSupabase();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Development mode
        if (!isSupabaseReady()) {
            return null;
        }

        // Production mode
        const { data, error } = await supabase
            .from('generated_content')
            .select('*')
            .eq('note_id', noteId)
            .eq('user_id', user.uid)
            .eq('type', contentType)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows found
            throw error;
        }

        return {
            id: data.id,
            noteId: data.note_id,
            userId: data.user_id,
            type: data.type,
            content: data.content,
            createdAt: data.created_at,
        };

    } catch (error) {
        console.error('Get content error:', error);
        return null;
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
