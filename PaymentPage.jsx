// Shared full-screen slide transition for route changes.
// Used with <AnimatePresence mode="wait"> in App.jsx.
const EASE = [0.22, 1, 0.36, 1];

export const slidePage = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
  exit:    { opacity: 0, x: -60, transition: { duration: 0.35, ease: EASE } },
};

// Vertical variant (used by Home for a softer feel)
export const slideUpPage = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  exit:    { opacity: 0, y: -24, transition: { duration: 0.35, ease: EASE } },
};
