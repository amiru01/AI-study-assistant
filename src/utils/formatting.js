/**
 * Formatting Utilities
 * 
 * Reusable formatting functions for display
 */

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'relative')
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }
    
    if (format === 'relative') {
        return getRelativeTime(d);
    }
    
    const options = format === 'long' 
        ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return d.toLocaleDateString('en-US', options);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) > 1 ? 's' : ''} ago`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert AI-generated summary text into structured HTML
 * @param {string} text - Raw AI-generated summary
 * @returns {string} HTML markup
 */
export function formatSummary(text) {
    if (!text || typeof text !== 'string') {
        return '<p>No summary available.</p>';
    }

    const lines = text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    let html = '';
    let listOpen = false;

    lines.forEach((line, index) => {
        const isBullet = /^[\-\*•‣⁃]\s+/.test(line) || /^\d+[\.)]\s+/.test(line);
        const isHeading = /^#{1,3}\s+/.test(line) || /^[A-Z][A-Za-z0-9\s]{0,80}:$/.test(line);

        if (isHeading) {
            if (listOpen) {
                html += '</ul>';
                listOpen = false;
            }

            const content = line.replace(/^#{1,3}\s+/, '').replace(/:$/, '');
            const headingLevel = line.startsWith('##') ? 'h4' : 'h3';
            html += `<${headingLevel}>${content}</${headingLevel}>`;
            return;
        }

        if (isBullet) {
            if (!listOpen) {
                html += '<ul class="summary-bullet-list">';
                listOpen = true;
            }
            const item = line.replace(/^[\-\*•‣⁃]\s+/, '').replace(/^\d+[\.)]\s+/, '');
            html += `<li>${item}</li>`;
            return;
        }

        if (listOpen) {
            html += '</ul>';
            listOpen = false;
        }

        if (line.length < 80 && line.endsWith(':')) {
            const headingText = line.slice(0, -1);
            html += `<h4>${headingText}</h4>`;
            return;
        }

        html += `<p>${line}</p>`;
    });

    if (listOpen) {
        html += '</ul>';
    }

    return html;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => capitalize(word)).join(' ');
}

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name) {
    if (!name) return '';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format percentage
 * @param {number} value - Value (0-100)
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
    return value.toFixed(decimals) + '%';
}
