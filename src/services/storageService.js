/**
 * Storage Service
 * 
 * Handles all Firebase Storage operations for file uploads.
 * This service manages file uploads, downloads, and deletions.
 * UI components should call these functions, never Storage directly.
 */

import { getStorage, isFirebaseReady } from '../config/firebase.js';
import { getCurrentUser } from './authService.js';
import { API_CONFIG } from '../config/api.js';
import { extractTextFromFile, isTextSufficient } from './textExtractionService.js';

/**
 * Upload a file to Firebase Storage and extract text
 * @param {File} file - File object to upload
 * @param {string} folder - Storage folder (e.g., 'notes', 'profiles')
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
            // Continue with upload even if extraction fails
            extractedText = '';
        }

        const storage = getStorage();

        // Development mode
        if (!isFirebaseReady()) {
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

        // Production mode
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${folder}/${user.uid}/${fileName}`;
        const storageRef = storage.ref(filePath);

        // Upload file with progress tracking
        const uploadTask = storageRef.put(file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Progress callback
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) {
                        onProgress(Math.round(progress));
                    }
                },
                (error) => {
                    // Error callback
                    console.error('Upload error:', error);
                    reject(handleStorageError(error));
                },
                async () => {
                    // Success callback
                    try {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        
                        resolve({
                            url: downloadURL,
                            path: filePath,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            extractedText: extractedText,
                        });

                        console.log('✅ File uploaded successfully');
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });

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
        const storage = getStorage();

        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock file URL');
            return `https://mock-storage.com/${filePath}`;
        }

        const storageRef = storage.ref(filePath);
        const url = await storageRef.getDownloadURL();
        
        return url;

    } catch (error) {
        console.error('Get file URL error:', error);
        throw handleStorageError(error);
    }
}

/**
 * Delete a file from storage
 * @param {string} filePath - Storage file path
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
    try {
        const storage = getStorage();

        if (!isFirebaseReady()) {
            console.log('🔧 Development mode: Mock file deletion');
            return;
        }

        const storageRef = storage.ref(filePath);
        await storageRef.delete();
        
        console.log('✅ File deleted successfully');

    } catch (error) {
        console.error('Delete file error:', error);
        throw handleStorageError(error);
    }
}

/**
 * Get file metadata
 * @param {string} filePath - Storage file path
 * @returns {Promise<Object>} File metadata
 */
export async function getFileMetadata(filePath) {
    try {
        const storage = getStorage();

        if (!isFirebaseReady()) {
            return {
                name: filePath.split('/').pop(),
                size: 0,
                contentType: 'application/octet-stream',
            };
        }

        const storageRef = storage.ref(filePath);
        const metadata = await storageRef.getMetadata();
        
        return {
            name: metadata.name,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
        };

    } catch (error) {
        console.error('Get metadata error:', error);
        throw handleStorageError(error);
    }
}

/**
 * List files in a folder
 * @param {string} folderPath - Folder path
 * @returns {Promise<Array>} Array of file references
 */
export async function listFiles(folderPath) {
    try {
        const storage = getStorage();
        const user = getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        if (!isFirebaseReady()) {
            return [];
        }

        const storageRef = storage.ref(folderPath);
        const result = await storageRef.listAll();
        
        const files = await Promise.all(
            result.items.map(async (itemRef) => {
                const url = await itemRef.getDownloadURL();
                const metadata = await itemRef.getMetadata();
                
                return {
                    name: metadata.name,
                    url: url,
                    path: itemRef.fullPath,
                    size: metadata.size,
                    type: metadata.contentType,
                };
            })
        );

        return files;

    } catch (error) {
        console.error('List files error:', error);
        throw handleStorageError(error);
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

    // Check file type
    if (!API_CONFIG.UPLOAD.allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload PDF or image files.');
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!API_CONFIG.UPLOAD.allowedExtensions.includes(extension)) {
        throw new Error('File extension not allowed');
    }
}

/**
 * Handle Firebase Storage errors
 * @param {Error} error - Storage error
 * @returns {Error} User-friendly error
 */
function handleStorageError(error) {
    const errorMessages = {
        'storage/unauthorized': 'You do not have permission to access this file',
        'storage/canceled': 'Upload was canceled',
        'storage/unknown': 'An unknown error occurred',
        'storage/object-not-found': 'File not found',
        'storage/quota-exceeded': 'Storage quota exceeded',
        'storage/unauthenticated': 'Please login to upload files',
    };

    const message = errorMessages[error.code] || error.message || 'Storage operation failed';
    return new Error(message);
}
