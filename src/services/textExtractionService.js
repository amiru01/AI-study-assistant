/**
 * Text Extraction Service
 *
 * Handles text extraction from all supported file types:
 *   - PDF       → PDF.js
 *   - Images    → OCR.space API
 *   - TXT       → FileReader (direct read)
 *   - DOC/DOCX  → mammoth.js (loaded from CDN)
 */

import { API_ENDPOINTS, API_KEYS, isApiConfigured } from '../config/api.js';

// ============================================
// PUBLIC API
// ============================================

/**
 * Extract text from any supported file type.
 * Dispatches to the correct handler based on MIME type.
 *
 * @param {File} file
 * @returns {Promise<string>} Extracted plain text
 */
export async function extractTextFromFile(file) {
    const type = file.type;

    if (type === 'application/pdf') {
        return extractFromPDF(file);
    }

    if (type.startsWith('image/')) {
        return extractFromImage(file);
    }

    if (type === 'text/plain') {
        return extractFromTextFile(file);
    }

    if (
        type === 'application/msword' ||
        type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        return extractFromWord(file);
    }

    throw new Error(
        `Unsupported file type "${type}". Please upload a PDF, image, TXT, DOC, or DOCX file.`
    );
}

/**
 * Returns true when the extracted text is long enough for AI processing.
 * @param {string} text
 * @returns {boolean}
 */
export function isTextSufficient(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    return trimmed.length >= 100 && trimmed.split(/\s+/).length >= 20;
}

/**
 * Returns the first `length` characters of text with an ellipsis.
 * @param {string} text
 * @param {number} length
 * @returns {string}
 */
export function getTextPreview(text, length = 200) {
    if (!text) return '';
    return text.length <= length ? text : text.substring(0, length) + '...';
}

// ============================================
// PDF  →  PDF.js
// ============================================

async function extractFromPDF(file) {
    if (typeof pdfjsLib === 'undefined') {
        console.warn('PDF.js not loaded — returning mock text');
        return MOCK_PDF_TEXT;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    console.log(`📄 PDF loaded: ${pdf.numPages} page(s)`);

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n\n';
    }

    fullText = cleanText(fullText);

    if (fullText.trim().length < 50) {
        throw new Error(
            'Could not extract enough text from this PDF. It may be image-based or encrypted. Try uploading it as an image instead.'
        );
    }

    console.log(`✅ PDF: extracted ${fullText.length} characters`);
    return fullText;
}

// ============================================
// IMAGES  →  OCR.space
// ============================================

async function extractFromImage(file) {
    if (!isApiConfigured('OCR_SPACE')) {
        console.warn('OCR API not configured — returning mock text');
        return MOCK_IMAGE_TEXT;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', API_KEYS.OCR_SPACE);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    console.log('🔍 Sending image to OCR API…');

    const response = await fetch(API_ENDPOINTS.OCR_SPACE, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`OCR API returned HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed');
    }

    const extracted = cleanText(result.ParsedResults?.[0]?.ParsedText || '');

    if (extracted.trim().length < 20) {
        throw new Error(
            'Could not extract enough text from this image. Make sure the image is clear and contains readable text.'
        );
    }

    console.log(`✅ Image OCR: extracted ${extracted.length} characters`);
    return extracted;
}

// ============================================
// TXT  →  FileReader
// ============================================

function extractFromTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = cleanText(e.target.result || '');
            if (text.trim().length < 10) {
                reject(new Error('The text file appears to be empty.'));
            } else {
                console.log(`✅ TXT: extracted ${text.length} characters`);
                resolve(text);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read the text file.'));
        reader.readAsText(file, 'UTF-8');
    });
}

// ============================================
// DOC / DOCX  →  mammoth.js (CDN)
// ============================================

async function extractFromWord(file) {
    // mammoth is loaded via CDN script tag in the HTML pages
    if (typeof mammoth === 'undefined') {
        console.warn('mammoth.js not loaded — returning mock text');
        return MOCK_WORD_TEXT;
    }

    const arrayBuffer = await file.arrayBuffer();

    // extractRawValue gives plain text without HTML conversion
    const result = await mammoth.extractRawValue({ arrayBuffer });

    if (result.messages?.length) {
        result.messages.forEach(m => console.warn('mammoth:', m.message));
    }

    const text = cleanText(result.value || '');

    if (text.trim().length < 10) {
        throw new Error(
            'Could not extract text from this Word document. The file may be empty or use an unsupported format.'
        );
    }

    console.log(`✅ DOCX: extracted ${text.length} characters`);
    return text;
}

// ============================================
// HELPERS
// ============================================

function cleanText(text) {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')       // collapse horizontal whitespace
        .replace(/\n{3,}/g, '\n\n')    // max two consecutive newlines
        .trim();
}

// ============================================
// MOCK DATA (development / no-API fallback)
// ============================================

const MOCK_PDF_TEXT = `Introduction to Photosynthesis

Photosynthesis is the fundamental process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose molecules. This process is essential for life on Earth as it produces oxygen and forms the base of most food chains.

The Process of Photosynthesis

Photosynthesis occurs primarily in the chloroplasts of plant cells and can be divided into two main stages:

1. Light-Dependent Reactions (Light Reactions)
These reactions occur in the thylakoid membranes of chloroplasts and require direct light energy:
- Light energy is absorbed by chlorophyll and other pigments
- Water molecules are split (photolysis), releasing oxygen as a byproduct
- ATP and NADPH are produced as energy carriers

2. Light-Independent Reactions (Calvin Cycle)
These reactions occur in the stroma of chloroplasts:
- Carbon dioxide from the atmosphere is fixed into organic molecules
- ATP and NADPH from the light reactions provide energy
- Glucose and other sugars are synthesized

The Chemical Equation:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Factors Affecting Photosynthesis:
- Light intensity
- Carbon dioxide concentration
- Temperature
- Water availability`.trim();

const MOCK_IMAGE_TEXT = `Cell Biology Notes

The Cell: Basic Unit of Life

Types of Cells:
1. Prokaryotic Cells - No nucleus, DNA in nucleoid region (Bacteria, Archaea)
2. Eukaryotic Cells - Have nucleus, membrane-bound organelles (Animals, Plants, Fungi)

Key Organelles:
- Nucleus: Contains genetic material, controls cell activities
- Mitochondria: Powerhouse of the cell, produces ATP
- Endoplasmic Reticulum: Rough ER makes proteins; Smooth ER makes lipids
- Golgi Apparatus: Modifies and packages proteins
- Ribosomes: Protein synthesis
- Cell Membrane: Phospholipid bilayer, selectively permeable`.trim();

const MOCK_WORD_TEXT = `Study Notes - Chapter 1

Introduction

This document contains study notes for the course. The following topics are covered:

1. Core Concepts
   - Definition and scope
   - Historical background
   - Key terminology

2. Main Principles
   - Principle A: Describes the fundamental relationship between variables
   - Principle B: Explains how systems maintain equilibrium
   - Principle C: Outlines the process of change over time

3. Applications
   - Real-world use cases
   - Case studies
   - Problem-solving frameworks

Summary

Understanding these core concepts is essential for applying them in practical scenarios. Review the key terms and practice with the provided exercises.`.trim();
