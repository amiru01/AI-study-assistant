/**
 * Supabase Storage Service
 * 
 * Handles all file storage operations using Supabase
 * Drop-in replacement for Firebase storageService
 */

import { getSupabase, isSupabaseReady } from '../config/supabase.js';
import { getCurrentUser } from './supabaseAuthService.js';
import { extractTextFromFile, isTextSufficient } from './textExtractionService.js';
import { API_CONFIG } from '../config/api.js';

/**
 * Upload a file to Supabase Storage and extract text
 * @param {File} file - File object to upload
 * @param {string} folder - Storage folder (e.g., 'notes')
 * @param {Function} onProgress - Progress callback (percent)
 * @returns {Promise<Object>} Upload result with URL, metadata, and extracted text
 */
export async function uploadFile(file, folder = 'notes', onProgress = null) {
    try {
        // Validate file
        validateFile(file);

        const user = getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Extract text from file (happens before upload)
        let extractedText = '';
        try {
            console.log('📝 Extracting text from file...');
            extractedText = await extractTextFromFile(file);
            
            if (!isTextSufficient(extractedText)) {
                console.warn('⚠️ Extracted text may be insufficient for AI processing');
            } else {
                console.log(`✅ Extracted ${extractedText.length} characters`);
            }
        } catch (extractError) {
            console.error('Text extraction failed:', extractError);
            extractedText = '';
        }

        const supabase = getSupabase();

        // Development mode
        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock file upload');
            
            // Simulate upload progress
            if (onProgress) {
                for (let i = 0; i <= 100; i += 20) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    onProgress(i);
                }
            }

            // Return mock data with extracted text
            return {
                url: URL.createObjectURL(file),
                path: `${folder}/${user.uid}/${file.name}`,
                name: file.name,
                size: file.size,
                type: file.type,
                extractedText: extractedText,
            };
        }

        // Production mode - Upload to Supabase Storage
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${user.uid}/${fileName}`;

        // Simulate progress (Supabase doesn't provide real-time progress)
        if (onProgress) {
            onProgress(0);
            const progressInterval = setInterval(() => {
                const currentProgress = Math.min(90, Math.random() * 100);
                onProgress(Math.round(currentProgress));
            }, 500);

            // Upload file
            const { data, error } = await supabase.storage
                .from(folder)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            clearInterval(progressInterval);
            onProgress(100);

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(folder)
                .getPublicUrl(filePath);

            console.log('✅ File uploaded successfully');

            return {
                url: urlData.publicUrl,
                path: filePath,
                name: file.name,
                size: file.size,
                type: file.type,
                extractedText: extractedText,
            };
        } else {
            // Upload without progress tracking
            const { data, error } = await supabase.storage
                .from(folder)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(folder)
                .getPublicUrl(filePath);

            console.log('✅ File uploaded successfully');

            return {
                url: urlData.publicUrl,
                path: filePath,
                name: file.name,
                size: file.size,
                type: file.type,
                extractedText: extractedText,
            };
        }

    } catch (error) {
        console.error('Upload file error:', error);
        throw error;
    }
}

/**
 * Get download URL for a file
 * @param {string} filePath - Storage file path
 * @returns {Promise<string>} Download URL
 */
export async function getFileURL(filePath) {
    try {
        const supabase = getSupabase();

        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock file URL');
            return `https://mock-storage.com/${filePath}`;
        }

        const { data } = supabase.storage
            .from('notes')
            .getPublicUrl(filePath);
        
        return data.publicUrl;

    } catch (error) {
        console.error('Get file URL error:', error);
        throw new Error('Failed to get file URL');
    }
}

/**
 * Delete a file from storage
 * @param {string} filePath - Storage file path
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
    try {
        const supabase = getSupabase();

        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock file deletion');
            return;
        }

        const { error } = await supabase.storage
            .from('notes')
            .remove([filePath]);

        if (error) throw error;
        
        console.log('✅ File deleted successfully');

    } catch (error) {
        console.error('Delete file error:', error);
        throw new Error('Failed to delete file');
    }
}

/**
 * List files in a folder
 * @param {string} folderPath - Folder path
 * @returns {Promise<Array>} Array of file references
 */
export async function listFiles(folderPath) {
    try {
        const supabase = getSupabase();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        if (!isSupabaseReady()) {
            return [];
        }

        const { data, error } = await supabase.storage
            .from('notes')
            .list(folderPath || user.uid);

        if (error) throw error;

        return data.map(file => ({
            name: file.name,
            path: `${folderPath || user.uid}/${file.name}`,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'application/octet-stream',
            createdAt: file.created_at,
        }));

    } catch (error) {
        console.error('List files error:', error);
        throw new Error('Failed to list files');
    }
}

// ============================================
// HELPER FUNCTIONS (Private)
// ============================================

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @throws {Error} Validation error
 */
function validateFile(file) {
    if (!file) {
        throw new Error('No file provided');
    }

    // Check file size
    if (file.size > API_CONFIG.UPLOAD.maxFileSize) {
        const maxSizeMB = API_CONFIG.UPLOAD.maxFileSize / (1024 * 1024);
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    // Check MIME type against expanded allowed list
    if (!API_CONFIG.UPLOAD.allowedTypes.includes(file.type)) {
        throw new Error(
            'File type not supported. Allowed types: PDF, JPG, PNG, TXT, DOC, DOCX.'
        );
    }

    // Check extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!API_CONFIG.UPLOAD.allowedExtensions.includes(extension)) {
        throw new Error(
            'File extension not allowed. Allowed: .pdf, .jpg, .jpeg, .png, .txt, .doc, .docx.'
        );
    }

    // Reject dangerous extensions regardless of MIME type
    const dangerous = ['.exe', '.bat', '.sh', '.js', '.html', '.htm', '.php', '.py', '.cmd', '.vbs', '.ps1'];
    if (dangerous.includes(extension)) {
        throw new Error('This file type is not allowed for security reasons.');
    }
}
