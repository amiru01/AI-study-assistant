/**
 * Landing page entry point
 * Handles FAQ accordion and smooth scroll interactions
 */

// FAQ accordion — native <details> handles open/close,
// but we close others when one opens for a cleaner UX
document.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
        if (detail.open) {
            document.querySelectorAll('details').forEach(other => {
                if (other !== detail) other.open = false;
            });
        }
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
