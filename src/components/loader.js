/**
 * Loader Component
 * 
 * Reusable loading indicator
 * Usage: showLoader(), hideLoader()
 */

/**
 * Show full-screen loader
 * @param {string} message - Optional loading message
 */
export function showLoader(message = 'Loading...') {
    // Get or create loader
    let loader = document.getElementById('app-loader');
    
    if (!loader) {
        loader = createLoader();
        document.body.appendChild(loader);
    }

    // Update message
    const messageEl = loader.querySelector('.loader-message');
    if (messageEl) {
        messageEl.textContent = message;
    }

    // Show loader
    loader.classList.add('show');
}

/**
 * Hide full-screen loader
 */
export function hideLoader() {
    const loader = document.getElementById('app-loader');
    
    if (loader) {
        loader.classList.remove('show');
    }
}

/**
 * Show button loader
 * @param {HTMLElement|string} button - Button element or selector
 * @param {string} loadingText - Text to show while loading
 */
export function showButtonLoader(button, loadingText = 'Loading...') {
    const btn = typeof button === 'string' ? document.querySelector(button) : button;
    
    if (!btn) return;

    // Store original content
    btn.dataset.originalContent = btn.innerHTML;
    btn.disabled = true;

    // Set loading content
    btn.innerHTML = `
        <span class="btn-loader">
            <span class="spinner"></span>
            ${loadingText}
        </span>
    `;
}

/**
 * Hide button loader
 * @param {HTMLElement|string} button - Button element or selector
 */
export function hideButtonLoader(button) {
    const btn = typeof button === 'string' ? document.querySelector(button) : button;
    
    if (!btn) return;

    // Restore original content
    if (btn.dataset.originalContent) {
        btn.innerHTML = btn.dataset.originalContent;
        delete btn.dataset.originalContent;
    }
    
    btn.disabled = false;
}

/**
 * Create loader element
 * @returns {HTMLElement} Loader element
 */
function createLoader() {
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.className = 'app-loader';
    
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p class="loader-message">Loading...</p>
        </div>
    `;

    return loader;
}

// Add loader styles if not already present
if (!document.getElementById('loader-styles')) {
    const style = document.createElement('style');
    style.id = 'loader-styles';
    style.textContent = `
        .app-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }

        .app-loader.show {
            opacity: 1;
            visibility: visible;
        }

        .loader-content {
            text-align: center;
        }

        .loader-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 1rem;
        }

        .loader-message {
            color: white;
            font-size: 1.1rem;
            font-weight: 500;
        }

        .btn-loader {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}

