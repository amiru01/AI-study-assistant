/**
 * Text Extraction Service
 * 
 * Handles text extraction from PDFs and images
 * Uses PDF.js for PDFs and OCR.space API for images
 */

import { API_ENDPOINTS, API_KEYS, isApiConfigured } from '../config/api.js';

/**
 * Extract text from a file (PDF or Image)
 * @param {File} file - File object to extract text from
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromFile(file) {
    try {
        const fileType = file.type;

        if (fileType === 'application/pdf') {
            return await extractTextFromPDF(file);
        } else if (fileType.startsWith('image/')) {
            return await extractTextFromImage(file);
        } else {
            throw new Error('Unsupported file type. Please upload PDF or image files.');
        }

    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error(`Failed to extract text: ${error.message}`);
    }
}

/**
 * Extract text from PDF using PDF.js
 * @param {File} file - PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(file) {
    try {
        // Check if PDF.js is loaded
        if (typeof pdfjsLib === 'undefined') {
            console.warn('PDF.js not loaded, using mock text');
            return getMockPDFText();
        }

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        console.log(`📄 PDF loaded: ${pdf.numPages} pages`);

        let fullText = '';

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Combine text items
            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');
            
            fullText += pageText + '\n\n';
        }

        // Clean up text
        fullText = cleanExtractedText(fullText);

        if (!fullText || fullText.trim().length < 50) {
            throw new Error('Could not extract sufficient text from PDF. The PDF might be image-based or encrypted.');
        }

        console.log(`✅ Extracted ${fullText.length} characters from PDF`);
        return fullText;

    } catch (error) {
        console.error('PDF extraction error:', error);
        
        // Fallback to mock text in development
        if (error.message.includes('PDF.js')) {
            console.warn('Using mock PDF text for development');
            return getMockPDFText();
        }
        
        throw error;
    }
}

/**
 * Extract text from image using OCR
 * @param {File} file - Image file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(file) {
    try {
        // Check if OCR API is configured
        if (!isApiConfigured('OCR_SPACE')) {
            console.warn('OCR API not configured, using mock text');
            return getMockImageText();
        }

        // Create FormData for OCR API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('apikey', API_KEYS.OCR_SPACE);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy

        console.log('🔍 Sending image to OCR API...');

        // Call OCR API
        const response = await fetch(API_ENDPOINTS.OCR_SPACE, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`OCR API error: ${response.status}`);
        }

        const result = await response.json();

        // Check for errors
        if (result.IsErroredOnProcessing) {
            throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed');
        }

        // Extract text from result
        const extractedText = result.ParsedResults?.[0]?.ParsedText || '';

        if (!extractedText || extractedText.trim().length < 20) {
            throw new Error('Could not extract sufficient text from image. The image might be too blurry or contain no text.');
        }

        // Clean up text
        const cleanedText = cleanExtractedText(extractedText);

        console.log(`✅ Extracted ${cleanedText.length} characters from image`);
        return cleanedText;

    } catch (error) {
        console.error('Image OCR error:', error);
        
        // Fallback to mock text in development
        if (error.message.includes('OCR API') || error.message.includes('not configured')) {
            console.warn('Using mock image text for development');
            return getMockImageText();
        }
        
        throw error;
    }
}

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
function cleanExtractedText(text) {
    return text
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        // Trim
        .trim();
}

/**
 * Get mock PDF text for development/testing
 * @returns {string} Mock text
 */
function getMockPDFText() {
    return `
Introduction to Photosynthesis

Photosynthesis is the fundamental process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose molecules. This process is essential for life on Earth as it produces oxygen and forms the base of most food chains.

The Process of Photosynthesis

Photosynthesis occurs primarily in the chloroplasts of plant cells and can be divided into two main stages:

1. Light-Dependent Reactions (Light Reactions)
These reactions occur in the thylakoid membranes of chloroplasts and require direct light energy:
- Light energy is absorbed by chlorophyll and other pigments
- Water molecules are split (photolysis), releasing oxygen as a byproduct
- ATP (adenosine triphosphate) and NADPH are produced as energy carriers
- These energy carriers are used in the next stage

2. Light-Independent Reactions (Calvin Cycle)
These reactions occur in the stroma of chloroplasts and do not directly require light:
- Carbon dioxide from the atmosphere is fixed into organic molecules
- ATP and NADPH from the light reactions provide energy
- Glucose and other sugars are synthesized
- The cycle regenerates its starting molecule (RuBP)

The Chemical Equation

The overall equation for photosynthesis can be written as:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

This means that six molecules of carbon dioxide and six molecules of water, using light energy, produce one molecule of glucose and six molecules of oxygen.

Factors Affecting Photosynthesis

Several environmental factors can affect the rate of photosynthesis:

1. Light Intensity
- Higher light intensity generally increases the rate of photosynthesis
- However, there is a saturation point beyond which more light does not increase the rate
- Different plants have different light requirements

2. Carbon Dioxide Concentration
- Increased CO₂ concentration typically increases photosynthesis rate
- Plants can only use CO₂ up to a certain concentration
- Current atmospheric CO₂ levels are often limiting for plant growth

3. Temperature
- Photosynthesis is controlled by enzymes that work best at optimal temperatures
- Most plants photosynthesize best between 25-35°C
- Extreme temperatures can denature enzymes and stop photosynthesis

4. Water Availability
- Water is a raw material for photosynthesis
- Lack of water causes stomata to close, reducing CO₂ intake
- Severe water stress can damage the photosynthetic machinery

Importance of Photosynthesis

Photosynthesis is crucial for several reasons:

1. Oxygen Production
- Photosynthesis produces virtually all the oxygen in Earth's atmosphere
- This oxygen is essential for aerobic respiration in most organisms

2. Food Production
- All food chains begin with photosynthetic organisms (producers)
- Plants convert solar energy into chemical energy that other organisms can use

3. Carbon Dioxide Removal
- Photosynthesis removes CO₂ from the atmosphere
- This helps regulate Earth's climate and reduces greenhouse gases

4. Energy Storage
- Solar energy is stored in chemical bonds of glucose
- This stored energy can be released through cellular respiration

Adaptations for Photosynthesis

Plants have evolved various adaptations to maximize photosynthesis:

1. Leaf Structure
- Large surface area to capture maximum light
- Thin leaves allow light to penetrate to all cells
- Stomata allow gas exchange while minimizing water loss

2. Chloroplast Organization
- Stacked thylakoids (grana) increase surface area for light reactions
- Stroma provides space for Calvin cycle enzymes

3. Pigment Diversity
- Chlorophyll a and b absorb different wavelengths of light
- Accessory pigments (carotenoids) capture additional light energy
- This allows plants to use a broader spectrum of light

4. Alternative Pathways
- C4 plants have adapted to hot, dry environments
- CAM plants open stomata at night to conserve water
- These adaptations allow photosynthesis in challenging conditions

Conclusion

Photosynthesis is one of the most important biological processes on Earth. It converts solar energy into chemical energy, produces oxygen, and forms the foundation of most ecosystems. Understanding photosynthesis is essential for addressing challenges in agriculture, climate change, and sustainable energy production.
    `.trim();
}

/**
 * Get mock image text for development/testing
 * @returns {string} Mock text
 */
function getMockImageText() {
    return `
Cell Biology Notes

The Cell: Basic Unit of Life

All living organisms are composed of one or more cells. The cell is the smallest unit that can carry out all the processes of life.

Types of Cells:
1. Prokaryotic Cells
   - No nucleus
   - DNA in nucleoid region
   - Examples: Bacteria, Archaea

2. Eukaryotic Cells
   - Have nucleus
   - Membrane-bound organelles
   - Examples: Animals, Plants, Fungi

Cell Organelles:

Nucleus
- Contains genetic material (DNA)
- Controls cell activities
- Site of DNA replication and transcription

Mitochondria
- Powerhouse of the cell
- Produces ATP through cellular respiration
- Has its own DNA

Endoplasmic Reticulum (ER)
- Rough ER: Has ribosomes, makes proteins
- Smooth ER: Makes lipids, detoxifies

Golgi Apparatus
- Modifies and packages proteins
- Sorts molecules for transport

Ribosomes
- Protein synthesis
- Found free in cytoplasm or on rough ER

Cell Membrane
- Phospholipid bilayer
- Controls what enters and exits cell
- Selectively permeable

Key Concepts:
- Cells maintain homeostasis
- Cells reproduce through division
- Cells respond to their environment
- Cells require energy to function
    `.trim();
}

/**
 * Validate if extracted text is sufficient for AI processing
 * @param {string} text - Extracted text
 * @returns {boolean} True if text is sufficient
 */
export function isTextSufficient(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const trimmedText = text.trim();
    
    // Check minimum length (at least 100 characters)
    if (trimmedText.length < 100) {
        return false;
    }

    // Check if text has actual words (not just symbols)
    const wordCount = trimmedText.split(/\s+/).length;
    if (wordCount < 20) {
        return false;
    }

    return true;
}

/**
 * Get text preview (first N characters)
 * @param {string} text - Full text
 * @param {number} length - Preview length
 * @returns {string} Text preview
 */
export function getTextPreview(text, length = 200) {
    if (!text) return '';
    
    if (text.length <= length) {
        return text;
    }
    
    return text.substring(0, length) + '...';
}
