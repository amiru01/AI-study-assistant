import { animate, inView } from "motion";

const motionState = {
  initialized: false,
  activeLink: null,
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const canHover = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function initMotionExperience() {
  if (motionState.initialized) return;
  motionState.initialized = true;

  injectMotionStyles();
  initPageEnter();
  initPageTransitions();
  initNavbarMotion();
  initActiveNavIndicator();
  initInteractiveFeedback();
  initAccordions();
  initModalObserver();
  initInputMicroInteractions();
  initHeroMotion();
  animateDynamicContent(document);
}

export function animateDynamicContent(root = document) {
  if (prefersReducedMotion()) {
    document.documentElement.classList.add("reduce-motion");
    return;
  }

  const scope = root instanceof Element ? root : document;
  const targetSelector = [
      "section",
      ".hero-content",
      ".auth-card",
      ".upload-panel",
      ".library-topbar",
      ".summary-card",
      ".stat-card",
      ".section",
      ".feature-card",
      ".use-case-card",
      ".testimonial-card",
      ".pricing-card",
      ".tool-card",
      ".note-card",
      ".quiz-question",
      ".flashcard",
      ".empty-state",
    ].join(",");
  const revealTargets = [
    ...(scope instanceof Element && scope.matches(targetSelector) ? [scope] : []),
    ...scope.querySelectorAll(targetSelector),
  ];

  revealTargets.forEach((el, index) => {
    if (el.dataset.motionReady === "true") return;
    el.dataset.motionReady = "true";
    el.style.opacity = "0";
    el.style.transform = "translateY(18px) scale(0.985)";

    inView(
      el,
      () => {
        animate(
          el,
          { opacity: 1, y: 0, scale: 1 },
          {
            duration: 0.55,
            delay: Math.min(index % 8, 7) * 0.045,
            easing: [0.22, 1, 0.36, 1],
          },
        );
      },
      { amount: 0.18, margin: "0px 0px -8% 0px" },
    );
  });

  animateCounters(scope);
  animateProgress(scope);
}

export function animateViewSwap(root = document) {
  if (!root || prefersReducedMotion()) return;
  animate(
    root,
    { opacity: [0, 1], y: [10, 0], filter: ["blur(6px)", "blur(0px)"] },
    { duration: 0.36, easing: [0.22, 1, 0.36, 1] },
  );
  animateDynamicContent(root);
}

export function showSkeleton(container, count = 3) {
  if (!container) return;

  container.innerHTML = Array.from({ length: count })
    .map(
      () => `
        <div class="skeleton-card" aria-hidden="true">
          <span class="skeleton-line short"></span>
          <span class="skeleton-line"></span>
          <span class="skeleton-line medium"></span>
        </div>
      `,
    )
    .join("");
}

export function animateToastIn(toast) {
  if (!toast || prefersReducedMotion()) return;
  animate(
    toast,
    { opacity: [0, 1], x: [28, 0], scale: [0.96, 1] },
    { duration: 0.32, easing: [0.22, 1, 0.36, 1] },
  );
}

export function animateToastOut(toast) {
  if (!toast || prefersReducedMotion()) return Promise.resolve();
  return animate(
    toast,
    { opacity: 0, x: 24, scale: 0.96 },
    { duration: 0.2, easing: "ease-in" },
  ).finished;
}

function initPageEnter() {
  document.documentElement.classList.add("motion-enabled");
  if (prefersReducedMotion()) return;

  animate(
    document.body,
    { opacity: [0, 1], y: [8, 0] },
    { duration: 0.42, easing: [0.22, 1, 0.36, 1] },
  );
}

function initPageTransitions() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;

    const rawHref = link.getAttribute("href") || "";
    if (
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:")
    ) {
      return;
    }

    const url = new URL(link.href, window.location.href);
    const isSameOrigin = url.origin === window.location.origin;
    const isSamePageHash =
      url.pathname === window.location.pathname && url.hash.length > 0;

    if (!isSameOrigin || isSamePageHash || prefersReducedMotion()) return;
    if (url.href === window.location.href) return;

    event.preventDefault();
    animate(
      document.body,
      { opacity: 0, y: -8, filter: "blur(4px)" },
      { duration: 0.22, easing: "ease-in" },
    ).finished.then(() => {
      window.location.href = url.href;
    });
  });
}

function initNavbarMotion() {
  const nav = document.querySelector(".navbar, .page-header, .top-bar");
  if (!nav) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const currentY = window.scrollY;
    nav.classList.toggle("motion-nav-scrolled", currentY > 12);

    if (nav.classList.contains("navbar")) {
      const shouldHide = currentY > lastY && currentY > 160;
      nav.classList.toggle("motion-nav-hidden", shouldHide);
    }

    lastY = Math.max(currentY, 0);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );

  update();
}

function initActiveNavIndicator() {
  const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActive = () => {
    const activeSection = sections
      .slice()
      .reverse()
      .find((section) => section.getBoundingClientRect().top <= 130);

    navLinks.forEach((link) => {
      const isActive =
        activeSection && link.getAttribute("href") === `#${activeSection.id}`;
      link.classList.toggle("motion-active-link", Boolean(isActive));
    });
  };

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();
}

function initInteractiveFeedback() {
  const selector = [
    "button",
    ".btn",
    ".btn-primary",
    ".btn-secondary",
    ".btn-outline",
    ".btn-large",
    ".nav-item",
    ".note-action-btn",
    ".quiz-option",
    ".tab-btn",
    "a",
  ].join(",");

  document.addEventListener("pointerdown", (event) => {
    const target = event.target.closest(selector);
    if (!target || target.disabled || prefersReducedMotion()) return;
    animate(target, { scale: 0.975 }, { duration: 0.08 });
  });

  document.addEventListener("pointerup", (event) => {
    const target = event.target.closest(selector);
    if (!target || target.disabled || prefersReducedMotion()) return;
    animate(
      target,
      { scale: 1 },
      { type: "spring", stiffness: 520, damping: 24 },
    );
  });
}

function initAccordions() {
  document.querySelectorAll("details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      const content = detail.querySelector("p, .accordion-content");
      if (!content || prefersReducedMotion()) return;
      animate(
        content,
        detail.open
          ? { opacity: [0, 1], y: [-6, 0] }
          : { opacity: [1, 0], y: [0, -4] },
        { duration: 0.22, easing: "ease-out" },
      );
    });
  });
}

function initModalObserver() {
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    const observer = new MutationObserver(() => {
      const card = modal.querySelector(".modal-card");
      if (!card || prefersReducedMotion()) return;

      if (!modal.classList.contains("hidden")) {
        animate(modal, { opacity: [0, 1] }, { duration: 0.22 });
        animate(
          card,
          { opacity: [0, 1], y: [18, 0], scale: [0.96, 1] },
          { duration: 0.34, easing: [0.22, 1, 0.36, 1] },
        );
      }
    });

    observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
  });
}

function initInputMicroInteractions() {
  document.addEventListener("focusin", (event) => {
    const input = event.target.closest("input, textarea, select");
    if (!input || prefersReducedMotion()) return;
    animate(input, { scale: 1.01 }, { duration: 0.18 });
  });

  document.addEventListener("focusout", (event) => {
    const input = event.target.closest("input, textarea, select");
    if (!input || prefersReducedMotion()) return;
    animate(input, { scale: 1 }, { duration: 0.18 });
  });
}

function initHeroMotion() {
  const hero = document.querySelector(".hero, .bg-blobs");
  const heroContent = document.querySelector(".hero-content, .auth-card");
  if (!hero || !heroContent || prefersReducedMotion()) return;

  let ticking = false;
  const updateParallax = () => {
    const offset = Math.min(window.scrollY * 0.08, 44);
    hero.style.setProperty("--hero-shift", `${offset}px`);
    heroContent.style.setProperty("--hero-float", `${offset * -0.28}px`);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true },
  );

}

function animateCounters(scope) {
  const counters = scope.querySelectorAll(
    ".stat-number, .stat-value, #notesCount, .summary-card strong",
  );

  counters.forEach((counter) => {
    if (counter.dataset.counterReady === "true") return;

    const text = counter.textContent.trim();
    if (text.includes("/")) return;

    const numeric = Number.parseFloat(text.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(numeric)) return;

    counter.dataset.counterReady = "true";
    const suffix = text.replace(/[0-9.]/g, "");
    const state = { value: 0 };

    inView(counter, () => {
      animate(state, { value: numeric }, {
        duration: 0.9,
        easing: [0.22, 1, 0.36, 1],
        onUpdate: () => {
          const value = Number.isInteger(numeric)
            ? Math.round(state.value)
            : state.value.toFixed(1);
          counter.textContent = `${value}${suffix}`;
        },
      });
    });
  });
}

function animateProgress(scope) {
  scope.querySelectorAll(".progress-fill").forEach((bar) => {
    if (bar.dataset.progressReady === "true") return;
    bar.dataset.progressReady = "true";
    const target = bar.style.width || getComputedStyle(bar).width;
    bar.style.transformOrigin = "left";
    bar.style.transform = "scaleX(0)";

    inView(bar, () => {
      bar.style.width = target;
      animate(bar, { scaleX: [0, 1] }, { duration: 0.8, easing: "ease-out" });
    });
  });
}

function injectMotionStyles() {
  if (document.getElementById("motion-experience-styles")) return;

  const style = document.createElement("style");
  style.id = "motion-experience-styles";
  style.textContent = `
    html {
      scroll-behavior: smooth;
    }

    body {
      background:
        linear-gradient(180deg, #eef7ff 0%, #f6fbff 42%, #f8fafc 100%);
      transition: background-color 240ms ease, color 240ms ease;
    }

    .motion-enabled body::before {
      content: "";
      position: fixed;
      inset: -25%;
      z-index: -1;
      pointer-events: none;
      background:
        radial-gradient(circle at 18% 18%, rgba(79,70,229,0.055), transparent 28%),
        radial-gradient(circle at 80% 10%, rgba(6,182,212,0.07), transparent 24%),
        radial-gradient(circle at 45% 90%, rgba(14,165,233,0.055), transparent 25%);
      animation: motionGradientDrift 18s ease-in-out infinite alternate;
      will-change: transform;
    }

    .navbar,
    .page-header,
    .top-bar {
      transition: transform 260ms ease, background-color 260ms ease, box-shadow 260ms ease, border-color 260ms ease, backdrop-filter 260ms ease;
      will-change: transform;
    }

    .motion-nav-scrolled {
      background: rgba(255,255,255,0.82) !important;
      backdrop-filter: blur(18px) saturate(160%);
      box-shadow: 0 12px 30px rgba(15,23,42,0.08) !important;
    }

    .motion-nav-hidden {
      transform: translateY(-112%);
    }

    .nav-links a {
      position: relative;
    }

    .nav-links a::after {
      content: "";
      position: absolute;
      left: 50%;
      right: 50%;
      bottom: -0.45rem;
      height: 2px;
      border-radius: 999px;
      background: currentColor;
      opacity: 0;
      transition: left 220ms ease, right 220ms ease, opacity 220ms ease;
    }

    .nav-links a:hover::after,
    .nav-links a.motion-active-link::after {
      left: 0;
      right: 0;
      opacity: 0.75;
    }

    .hero {
      background-position: center calc(50% + var(--hero-shift, 0px));
    }

    .hero-content,
    .auth-card {
      transform: translateY(var(--hero-float, 0px));
      will-change: transform;
    }

    .btn,
    button,
    a,
    .feature-card,
    .use-case-card,
    .testimonial-card,
    .pricing-card,
    .tool-card,
    .note-card,
    .stat-card,
    .summary-card,
    .type-chip,
    .quiz-option,
    .flashcard,
    .modal-close,
    .toggle-password {
      transition:
        transform 180ms ease,
        box-shadow 220ms ease,
        border-color 220ms ease,
        background-color 220ms ease,
        color 220ms ease,
        opacity 180ms ease;
    }

    @media (hover: hover) and (pointer: fine) {
      .feature-card:hover,
      .use-case-card:hover,
      .testimonial-card:hover,
      .tool-card:hover,
      .note-card:hover,
      .stat-card:hover,
      .summary-card:hover,
      .type-chip:hover {
        transform: translateY(-5px) scale(1.01);
      }

      button:hover,
      .btn:hover,
      .note-action-btn:hover,
      .tab-btn:hover,
      .quiz-option:hover,
      .modal-close:hover,
      .toggle-password:hover {
        transform: translateY(-1px);
      }
    }

    input,
    textarea,
    select {
      transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
    }

    input.error,
    textarea.error {
      animation: motionShake 260ms ease;
    }

    .tab-btn.active {
      position: relative;
      overflow: hidden;
    }

    .tab-btn.active::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(90deg, rgba(99,102,241,0.1), rgba(6,182,212,0.1));
      opacity: 0.75;
      pointer-events: none;
    }

    .modal-overlay {
      opacity: 1;
      visibility: visible;
      transition: opacity 220ms ease, visibility 220ms ease;
      backdrop-filter: blur(8px);
    }

    .modal-overlay.hidden {
      display: flex !important;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }

    .modal-card {
      transform-origin: center;
    }

    .sidebar {
      transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), width 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease !important;
      will-change: transform;
    }

    .sidebar.open {
      box-shadow: 24px 0 60px rgba(15,23,42,0.22);
    }

    .loading-state,
    .loading,
    .app-loader .loader-content {
      animation: motionFadeUp 360ms ease both;
    }

    .skeleton-card {
      min-height: 132px;
      border-radius: 14px;
      padding: 1.25rem;
      background: rgba(255,255,255,0.78);
      border: 1px solid rgba(226,232,240,0.9);
      box-shadow: 0 1px 3px rgba(15,23,42,0.06);
      overflow: hidden;
    }

    .skeleton-line {
      display: block;
      height: 0.78rem;
      width: 100%;
      margin: 0.85rem 0;
      border-radius: 999px;
      background: linear-gradient(90deg, #eef2f7 0%, #f8fafc 42%, #eef2f7 82%);
      background-size: 220% 100%;
      animation: skeletonSweep 1.25s ease-in-out infinite;
    }

    .skeleton-line.short { width: 38%; }
    .skeleton-line.medium { width: 68%; }

    .toast {
      will-change: transform, opacity;
    }

    @keyframes motionGradientDrift {
      from { transform: translate3d(-1%, -1%, 0) rotate(0deg); }
      to { transform: translate3d(1.5%, 1%, 0) rotate(1deg); }
    }

    @keyframes motionFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes motionShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    @keyframes skeletonSweep {
      from { background-position: 120% 0; }
      to { background-position: -120% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.001ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}
