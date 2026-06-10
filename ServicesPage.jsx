@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: auto; }

body {
  background-color: #000000;
  color: #FFFFFF;
  font-family: 'Poppins', sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: default;
}

*, *::before, *::after { cursor: inherit; }
input, textarea, select, [contenteditable="true"] { cursor: text; }
a, button, label, [role="button"], [onclick] { cursor: pointer; }
button, a, nav, header, footer, h1, h2, h3, h4, h5, h6,
.select-none, [class*="tracking-"] {
  -webkit-user-select: none;
  user-select: none;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #000000; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

.reviews-scroll::-webkit-scrollbar { display: none; }

/* Lenis */
html.lenis { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }
.lenis.lenis-scrolling iframe { pointer-events: none; }

/* Custom cursor — hidden on hover-capable devices so CursorGlow takes over */
@media (hover: hover) and (pointer: fine) {
  * { cursor: none !important; }
  input, textarea, select { cursor: none !important; }
}

/* Smooth default transitions for interactive elements */
a, button {
  transition-property: color, background-color, border-color, opacity, transform;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

/* Text selection color */
::selection {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

/* ── Glassmorphism utility class ─────────────────────────────────────────────── */
.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
}
.glass-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10);
}

/* ── Page slide-up entrance (used by motion.div wrappers on each page) ────────── */
.page-enter {
  opacity: 0;
  transform: translateY(18px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ── Stagger children fade-up via CSS (for non-Framer lists) ─────────────────── */
.stagger-children > * {
  opacity: 0;
  transform: translateY(16px);
  animation: fadeUpIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.12s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.19s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.26s; }
.stagger-children > *:nth-child(5) { animation-delay: 0.33s; }
.stagger-children > *:nth-child(6) { animation-delay: 0.40s; }

@keyframes fadeUpIn {
  to { opacity: 1; transform: translateY(0); }
}

/* ── Accessibility & motion ──────────────────────────────────────────────── */
:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.55);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ── Nav link underline grow ─────────────────────────────────────────────── */
.nav-underline {
  position: relative;
}
.nav-underline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, rgba(255,150,60,0.9), rgba(255,255,255,0.7));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-underline:hover::after,
.nav-underline.active::after {
  transform: scaleX(1);
}
