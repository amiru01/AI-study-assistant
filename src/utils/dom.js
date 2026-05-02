/**
 * DOM Utilities
 * 
 * Helper functions for DOM manipulation
 */

/**
 * Show element
 * @param {HTMLElement|string} element - Element or selector
 */
export function show(element) {
    const el = getElement(element);
    if (el) el.style.display = 'block';
}

/**
 * Hide element
 * @param {HTMLElement|string} element - Element or selector
 */
export function hide(element) {
    const el = getElement(element);
    if (el) el.style.display = 'none';
}

/**
 * Toggle element visibility
 * @param {HTMLElement|string} element - Element or selector
 */
export function toggle(element) {
    const el = getElement(element);
    if (el) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Add class to element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - Class name to add
 */
export function addClass(element, className) {
    const el = getElement(element);
    if (el) el.classList.add(className);
}

/**
 * Remove class from element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - Class name to remove
 */
export function removeClass(element, className) {
    const el = getElement(element);
    if (el) el.classList.remove(className);
}

/**
 * Toggle class on element
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} className - Class name to toggle
 */
export function toggleClass(element, className) {
    const el = getElement(element);
    if (el) el.classList.toggle(className);
}

/**
 * Set element text content
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} text - Text content
 */
export function setText(element, text) {
    const el = getElement(element);
    if (el) el.textContent = text;
}

/**
 * Set element HTML content
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} html - HTML content
 */
export function setHTML(element, html) {
    const el = getElement(element);
    if (el) el.innerHTML = html;
}

/**
 * Get element value (for inputs)
 * @param {HTMLElement|string} element - Element or selector
 * @returns {string} Element value
 */
export function getValue(element) {
    const el = getElement(element);
    return el ? el.value : '';
}

/**
 * Set element value (for inputs)
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} value - Value to set
 */
export function setValue(element, value) {
    const el = getElement(element);
    if (el) el.value = value;
}

/**
 * Clear element value (for inputs)
 * @param {HTMLElement|string} element - Element or selector
 */
export function clearValue(element) {
    setValue(element, '');
}

/**
 * Disable element
 * @param {HTMLElement|string} element - Element or selector
 */
export function disable(element) {
    const el = getElement(element);
    if (el) el.disabled = true;
}

/**
 * Enable element
 * @param {HTMLElement|string} element - Element or selector
 */
export function enable(element) {
    const el = getElement(element);
    if (el) el.disabled = false;
}

/**
 * Add event listener
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function on(element, event, handler) {
    const el = getElement(element);
    if (el) el.addEventListener(event, handler);
}

/**
 * Remove event listener
 * @param {HTMLElement|string} element - Element or selector
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function off(element, event, handler) {
    const el = getElement(element);
    if (el) el.removeEventListener(event, handler);
}

/**
 * Create element
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string} content - Element content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attributes = {}, content = '') {
    const el = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
        if (key === 'class') {
            el.className = attributes[key];
        } else if (key === 'style') {
            Object.assign(el.style, attributes[key]);
        } else {
            el.setAttribute(key, attributes[key]);
        }
    });
    
    if (content) {
        el.innerHTML = content;
    }
    
    return el;
}

/**
 * Remove element from DOM
 * @param {HTMLElement|string} element - Element or selector
 */
export function removeElement(element) {
    const el = getElement(element);
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

/**
 * Get element (helper function)
 * @param {HTMLElement|string} element - Element or selector
 * @returns {HTMLElement|null} Element
 */
function getElement(element) {
    if (typeof element === 'string') {
        return document.querySelector(element);
    }
    return element;
}
