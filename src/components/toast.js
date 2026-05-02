/**
 * Toast Notification Component
 * 
 * Reusable toast notification system
 * Usage: showToast('Message', 'success')
 */

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms (default: 4000)
 */
export function showToast(message, type = 'success', duration = 4000) {
    // Get or create toast container
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = createToastContainer();
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = createToastElement(message, type);
    
    // Add to container
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto-hide after duration
    setTimeout(() => {
        hideToast(toast);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', () => {
        hideToast(toast);
    });
}

/**
 * Create toast container
 * @returns {HTMLElement} Toast container
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    return container;
}

/**
 * Create toast element
 * @param {string} message - Toast message
 * @param {string} type - Toast type
 * @returns {HTMLElement} Toast element
 */
function createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Close">×</button>
    `;

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideToast(toast);
    });

    return toast;
}

/**
 * Hide toast
 * @param {HTMLElement} toast - Toast element
 */
function hideToast(toast) {
    toast.classList.remove('show');
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Icon emoji
 */
function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    return icons[type] || icons.info;
}

// Add toast styles if not already present
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        }

        .toast {
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transform: translateX(450px);
            transition: transform 0.3s ease;
            cursor: pointer;
            position: relative;
        }

        .toast.show {
            transform: translateX(0);
        }

        .toast-success {
            border-left: 4px solid #10b981;
        }

        .toast-error {
            border-left: 4px solid #ef4444;
        }

        .toast-warning {
            border-left: 4px solid #f59e0b;
        }

        .toast-info {
            border-left: 4px solid #3b82f6;
        }

        .toast-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }

        .toast-message {
            flex: 1;
            font-weight: 500;
            color: #1f2937;
        }

        .toast-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #6b7280;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .toast-close:hover {
            background: #f3f4f6;
        }

        @media (max-width: 768px) {
            .toast-container {
                left: 10px;
                right: 10px;
                max-width: none;
            }

            .toast {
                transform: translateY(-100px);
            }

            .toast.show {
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}
