/**
 * Supabase Database Service
 *
 * Handles all database operations using Supabase
 * Drop-in replacement for Firebase databaseService
 */

import { getSupabase, isSupabaseReady } from "../config/supabase.js";
import { getCurrentUser } from "./supabaseAuthService.js";

/**
 * Save a new note to database
 * @param {Object} noteData - Note data
 * @returns {Promise<string>} Note ID
 */
export async function saveNote(noteData) {
  try {
    const supabase = getSupabase();
    const user = getCurrentUser();

    console.log("💾 Attempting to save note...");
    console.log(
      "📊 User:",
      user ? `${user.email} (${user.uid})` : "NOT AUTHENTICATED",
    );
    console.log("📊 Note data received:", noteData);

    if (!user) {
      throw new Error("User not authenticated");
    }

    const note = {
      user_id: user.uid,
      title: noteData.title || "Untitled Note",
      file_url: noteData.fileURL || "",
      file_name: noteData.fileName || "",
      file_type: noteData.fileType || "",
      file_size: noteData.fileSize || 0,
      extracted_text: noteData.extractedText || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("📦 Prepared note object:", {
      user_id: note.user_id,
      title: note.title,
      file_name: note.file_name,
      file_url: note.file_url
        ? note.file_url.substring(0, 50) + "..."
        : "empty",
      file_size: note.file_size,
      has_extracted_text: !!note.extracted_text,
    });

    // Development mode
    if (!isSupabaseReady()) {
      console.log("🔧 Development mode: Mock save note");
      const mockId = "note-" + Date.now();
      const notes = getMockNotes();
      notes.push({ id: mockId, ...note });
      localStorage.setItem("mockNotes", JSON.stringify(notes));
      console.log("✅ Mock note saved:", mockId);
      return mockId;
    }

    // Production mode
    console.log("📤 Inserting into Supabase database...");
    const { data, error } = await supabase
      .from("notes")
      .insert([note])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:");
      console.error("  Code:", error.code);
      console.error("  Message:", error.message);
      console.error("  Details:", error.details);
      console.error("  Hint:", error.hint);
      console.error("  Full error:", error);
      throw error;
    }

    console.log("✅ Note saved successfully to database!");
    console.log("  Note ID:", data.id);
    console.log("  Title:", data.title);
    return data.id;
  } catch (error) {
    console.error("❌ Save note error:", error);
    console.error("  Error type:", error.constructor.name);
    console.error("  Error message:", error.message);

    // Provide helpful error messages
    if (error.code === "42P01") {
      throw new Error(
        'Database table "notes" does not exist. Please run the setup SQL script.',
      );
    } else if (error.code === "42501") {
      throw new Error(
        "Permission denied. Please check Row Level Security policies.",
      );
    } else if (error.code === "23502") {
      throw new Error(
        "Missing required field. Check that all required columns have values.",
      );
    } else if (error.code === "23503") {
      throw new Error("Invalid user ID. Make sure you are logged in.");
    } else {
      throw new Error(`Failed to save note: ${error.message}`);
    }
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
      throw new Error("User not authenticated");
    }

    // Development mode
    if (!isSupabaseReady()) {
      console.log("🔧 Development mode: Mock get notes");
      return getMockNotes();
    }

    // Production mode
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.uid)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Convert snake_case to camelCase for compatibility
    const notes = data.map((note) => ({
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
    console.error("Get notes error:", error);
    throw new Error("Failed to retrieve notes");
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
      throw new Error("User not authenticated");
    }

    // Development mode
    if (!isSupabaseReady()) {
      const notes = getMockNotes();
      const note = notes.find((n) => n.id === noteId);
      if (!note) throw new Error("Note not found");
      return note;
    }

    // Production mode
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .eq("user_id", user.uid)
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
    console.error("Get note error:", error);
    throw new Error("Failed to retrieve note");
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
      throw new Error("User not authenticated");
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Development mode
    if (!isSupabaseReady()) {
      const notes = getMockNotes();
      const index = notes.findIndex((n) => n.id === noteId);
      if (index === -1) throw new Error("Note not found");
      notes[index] = { ...notes[index], ...updateData };
      localStorage.setItem("mockNotes", JSON.stringify(notes));
      return;
    }

    // Production mode
    const { error } = await supabase
      .from("notes")
      .update(updateData)
      .eq("id", noteId)
      .eq("user_id", user.uid);

    if (error) throw error;

    console.log("✅ Note updated:", noteId);
  } catch (error) {
    console.error("Update note error:", error);
    throw new Error("Failed to update note");
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
      throw new Error("User not authenticated");
    }

    // Development mode
    if (!isSupabaseReady()) {
      const notes = getMockNotes();
      const filtered = notes.filter((n) => n.id !== noteId);
      localStorage.setItem("mockNotes", JSON.stringify(filtered));
      return;
    }

    // Production mode
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId)
      .eq("user_id", user.uid);

    if (error) throw error;

    console.log("✅ Note deleted:", noteId);
  } catch (error) {
    console.error("Delete note error:", error);
    throw new Error("Failed to delete note");
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

    console.log("💾 Attempting to save generated content...");
    console.log("  Note ID:", noteId);
    console.log("  Content Type:", contentType);
    console.log("  User:", user ? user.email : "NOT AUTHENTICATED");
    console.log(
      "  Content length:",
      typeof content === "string"
        ? content.length
        : JSON.stringify(content).length,
    );

    if (!user) {
      throw new Error("User not authenticated");
    }

    const data = {
      note_id: noteId,
      user_id: user.uid,
      type: contentType,
      content: content,
      created_at: new Date().toISOString(),
    };

    console.log("📦 Prepared data object:", {
      note_id: data.note_id,
      user_id: data.user_id,
      type: data.type,
      content_preview:
        typeof content === "string"
          ? content.substring(0, 50) + "..."
          : "object",
    });

    // Development mode
    if (!isSupabaseReady()) {
      console.log("🔧 Development mode: Mock save content");
      const mockId = `${contentType}-${Date.now()}`;
      localStorage.setItem(
        `mock_${contentType}_${noteId}`,
        JSON.stringify(content),
      );
      return mockId;
    }

    // Production mode
    console.log("📤 Inserting into Supabase generated_content table...");
    const { data: result, error } = await supabase
      .from("generated_content")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:");
      console.error("  Code:", error.code);
      console.error("  Message:", error.message);
      console.error("  Details:", error.details);
      console.error("  Hint:", error.hint);
      throw error;
    }

    console.log("✅ Generated content saved successfully!");
    console.log("  Content ID:", result.id);
    return result.id;
  } catch (error) {
    console.error("❌ Save content error:", error);
    console.error("  Error type:", error.constructor.name);
    console.error("  Error message:", error.message);

    // Provide helpful error messages
    if (error.code === "42P01") {
      throw new Error(
        'Database table "generated_content" does not exist. Please run the setup SQL script.',
      );
    } else if (error.code === "42501") {
      throw new Error(
        "Permission denied. Please check Row Level Security policies for generated_content table.",
      );
    } else if (error.code === "23502") {
      throw new Error(
        "Missing required field. Check that all required columns have values.",
      );
    } else if (error.code === "23503") {
      throw new Error(
        "Invalid note ID or user ID. Make sure the note exists and you are logged in.",
      );
    } else {
      throw new Error(`Failed to save generated content: ${error.message}`);
    }
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
      throw new Error("User not authenticated");
    }

    // Development mode
    if (!isSupabaseReady()) {
      const storageKey = `mock_${contentType}_${noteId}`;
      const storedValue = localStorage.getItem(storageKey);
      if (!storedValue) {
        return null;
      }

      return {
        id: `${contentType}-${noteId}`,
        noteId,
        userId: user.uid,
        type: contentType,
        content: JSON.parse(storedValue),
        createdAt: new Date().toISOString(),
      };
    }

    // Production mode
    const { data, error } = await supabase
      .from("generated_content")
      .select("*")
      .eq("note_id", noteId)
      .eq("user_id", user.uid)
      .eq("type", contentType)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
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
    console.error("Get content error:", error);
    return null;
  }
}

/**
 * Get all generated content for current user
 * @returns {Promise<Array>} Array of generated content objects
 */
export async function getAllGeneratedContent() {
  try {
    const supabase = getSupabase();
    const user = getCurrentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Development mode
    if (!isSupabaseReady()) {
      const results = [];

      for (const key of Object.keys(localStorage)) {
        const match = key.match(/^mock_(summary|quiz|flashcards)_(.+)$/);
        if (!match) continue;

        const [, type, noteId] = match;
        try {
          results.push({
            id: `${type}-${noteId}`,
            noteId,
            userId: user.uid,
            type,
            content: JSON.parse(localStorage.getItem(key)),
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Failed to parse mock generated content:", err);
        }
      }

      return results;
    }

    const { data, error } = await supabase
      .from("generated_content")
      .select("*")
      .eq("user_id", user.uid)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => ({
      id: item.id,
      noteId: item.note_id,
      userId: item.user_id,
      type: item.type,
      content: item.content,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error("Get all generated content error:", error);
    throw new Error("Failed to retrieve generated content");
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
  const notesStr = localStorage.getItem("mockNotes");
  return notesStr ? JSON.parse(notesStr) : [];
}
