import { useEffect } from 'react';

/**
 * Updates all per-page SEO signals: title, description, canonical, og:url,
 * og:title, og:description, og:image, twitter equivalents, and injects
 * structured data (JSON-LD) when provided.
 *
 * Call once at the top of each page component.
 */
export function useSEO({
  title,
  description,
  canonical,
  ogImage = 'https://drprint.in/og-image.jpg',
  schema = null,
}) {
  useEffect(() => {
    // ── Basic ─────────────────────────────────────────────────────────────────
    document.title = title;

    const set = (sel, val) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute('content', val);
    };
    const setAttr = (sel, attr, val) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };

    set('meta[name="description"]', description);

    // ── Canonical ─────────────────────────────────────────────────────────────
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // ── Open Graph ────────────────────────────────────────────────────────────
    set('meta[property="og:title"]',       title);
    set('meta[property="og:description"]', description);
    set('meta[property="og:image"]',       ogImage);
    if (canonical) set('meta[property="og:url"]', canonical);

    // ── Twitter ───────────────────────────────────────────────────────────────
    set('meta[name="twitter:title"]',       title);
    set('meta[name="twitter:description"]', description);
    set('meta[name="twitter:image"]',       ogImage);

    // ── JSON-LD schema injection ──────────────────────────────────────────────
    const SCHEMA_ID = 'dynamic-page-schema';
    let scriptEl = document.getElementById(SCHEMA_ID);
    if (schema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.type = 'application/ld+json';
        scriptEl.id   = SCHEMA_ID;
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schema);
    } else {
      scriptEl?.remove();
    }

    return () => {
      // Don't clean up title/meta on unmount — AnimatePresence briefly
      // renders two pages at once; let the incoming page overwrite.
    };
  }, [title, description, canonical, ogImage]);
}
