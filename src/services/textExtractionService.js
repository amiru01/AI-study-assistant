/**
 * Text Extraction Service
 *
 * Handles text extraction from all supported file types:
 *   - PDF       → pdfjs-dist (npm)
 *   - Images    → OCR.space API
 *   - TXT       → FileReader
 *   - DOC/DOCX  → mammoth (npm)
 */

import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { API_ENDPOINTS, API_KEYS, isApiConfigured } from '../config/api.js';

// Configure PDF.js worker using Vite's ?url import for the correct .js worker
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// ============================================
// PUBLIC API
// ============================================

/**
 * Extract text from any supported file type.
 */
export async function extractTextFromFile(file) {
    const type = file.type;

    if (type === 'application/pdf') return extractFromPDF(file);
    if (type.startsWith('image/'))  return extractFromImage(file);
    if (type === 'text/plain')      return extractFromTextFile(file);

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

export function isTextSufficient(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    return trimmed.length >= 100 && trimmed.split(/\s+/).length >= 20;
}

export function getTextPreview(text, length = 200) {
    if (!text) return '';
    return text.length <= length ? text : text.substring(0, length) + '...';
}

// ============================================
// PDF  →  pdfjs-dist
// ============================================

async function extractFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();

    let pdf;
    try {
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
        throw new Error(
            `Could not open this PDF: ${err.message}. The file may be password-protected or corrupted.`
        );
    }

    console.log(`📄 PDF loaded: ${pdf.numPages} page(s)`);

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n\n';
    }

    fullText = cleanText(fullText);

    if (fullText.trim().length < 50) {
        throw new Error(
            'This PDF appears to be image-based (scanned) — no selectable text was found. ' +
            'Please export it as a text-based PDF, or take a screenshot and upload as JPG/PNG.'
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

    const response = await fetch(API_ENDPOINTS.OCR_SPACE, { method: 'POST', body: formData });

    if (!response.ok) throw new Error(`OCR API returned HTTP ${response.status}`);

    const result = await response.json();
    if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed');
    }

    const extracted = cleanText(result.ParsedResults?.[0]?.ParsedText || '');
    if (extracted.trim().length < 20) {
        throw new Error('Could not extract enough text from this image. Make sure it is clear and contains readable text.');
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
        reader.onload  = e => {
            const text = cleanText(e.target.result || '');
            text.trim().length < 10
                ? reject(new Error('The text file appears to be empty.'))
                : resolve(text);
        };
        reader.onerror = () => reject(new Error('Failed to read the text file.'));
        reader.readAsText(file, 'UTF-8');
    });
}

// ============================================
// DOC / DOCX  →  mammoth
// ============================================

async function extractFromWord(file) {
    const arrayBuffer = await file.arrayBuffer();

    // Support both:
    // - npm mammoth (Vite): uses extractRawText()
    // - CDN mammoth (window.mammoth): uses extractRawValue()
    let result;
    if (typeof mammoth?.extractRawText === 'function') {
        result = await mammoth.extractRawText({ arrayBuffer });
    } else if (typeof mammoth?.extractRawValue === 'function') {
        result = await mammoth.extractRawValue({ arrayBuffer });
    } else if (typeof window !== 'undefined' && typeof window.mammoth?.extractRawValue === 'function') {
        result = await window.mammoth.extractRawValue({ arrayBuffer });
    } else if (typeof window !== 'undefined' && typeof window.mammoth?.extractRawText === 'function') {
        result = await window.mammoth.extractRawText({ arrayBuffer });
    } else {
        throw new Error('mammoth.js is not loaded. Cannot extract text from Word document.');
    }

    if (result.messages?.length) {
        result.messages.forEach(m => console.warn('mammoth:', m.message));
    }

    const text = cleanText(result.value || '');
    if (text.trim().length < 10) {
        throw new Error('Could not extract text from this Word document. It may be empty or use an unsupported format.');
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
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// ============================================
// MOCK DATA (fallback when OCR not configured)
// ============================================

const MOCK_IMAGE_TEXT = `Cell Biology Notes

Types of Cells:
1. Prokaryotic Cells - No nucleus (Bacteria, Archaea)
2. Eukaryotic Cells - Have nucleus (Animals, Plants, Fungi)

Key Organelles:
- Nucleus: Contains genetic material
- Mitochondria: Produces ATP
- Ribosomes: Protein synthesis
- Cell Membrane: Selectively permeable`.trim();

