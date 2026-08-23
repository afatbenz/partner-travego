import { useEffect } from 'react';

export type PageMeta = {
  title: string;
  description?: string;
  /** Relative path, e.g. '/sewa-bus-tangerang'. Origin resolved from window.location.origin. */
  canonicalPath?: string;
  noindex?: boolean;
  ogImage?: string;
  /** Object or array — serialized into one <script data-seo="page">. */
  jsonLd?: object | object[];
};

function upsertMeta(selector: string, create: () => HTMLElement, apply: (el: HTMLElement) => void) {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  apply(el);
}

// Selama prerender (react-snap), window.location.origin = http://localhost:<port>,
// sehingga canonical/OG URL di snapshot statis salah. Pakai origin produksi eksplisit.
const SITE_ORIGIN =
  import.meta.env.VITE_PRERENDER === 'true'
    ? (import.meta.env.VITE_SITE_URL || 'https://calistaprima.com').replace(/\/+$/, '')
    : window.location.origin;

export function usePageMeta(meta: PageMeta): void {
  useEffect(() => {
    document.title = meta.title;

    if (meta.description) {
      upsertMeta(
        'meta[name="description"]',
        () => {
          const m = document.createElement('meta');
          m.name = 'description';
          return m;
        },
        (el) => el.setAttribute('content', meta.description!)
      );
    }

    if (meta.canonicalPath) {
      const href = `${SITE_ORIGIN}${meta.canonicalPath}`;
      upsertMeta(
        'link[rel="canonical"]',
        () => {
          const l = document.createElement('link');
          l.rel = 'canonical';
          return l;
        },
        (el) => el.setAttribute('href', href)
      );
    }

    // Open Graph (upsert; clears stale values from previous page)
    upsertMeta(
      'meta[property="og:title"]',
      () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:title');
        return m;
      },
      (el) => el.setAttribute('content', meta.title)
    );
    upsertMeta(
      'meta[property="og:url"]',
      () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:url');
        return m;
      },
      (el) => el.setAttribute('content', meta.canonicalPath ? `${SITE_ORIGIN}${meta.canonicalPath}` : window.location.href)
    );
    if (meta.description) {
      upsertMeta(
        'meta[property="og:description"]',
        () => {
          const m = document.createElement('meta');
          m.setAttribute('property', 'og:description');
          return m;
        },
        (el) => el.setAttribute('content', meta.description!)
      );
    }
    if (meta.ogImage) {
      upsertMeta(
        'meta[property="og:image"]',
        () => {
          const m = document.createElement('meta');
          m.setAttribute('property', 'og:image');
          return m;
        },
        (el) => el.setAttribute('content', meta.ogImage!)
      );
    }

    // Robots
    upsertMeta(
      'meta[name="robots"]',
      () => {
        const m = document.createElement('meta');
        m.name = 'robots';
        return m;
      },
      (el) => el.setAttribute('content', meta.noindex ? 'noindex, nofollow' : 'index, follow')
    );

    // JSON-LD page block
    if (meta.jsonLd) {
      upsertMeta(
        'script[data-seo="page"]',
        () => {
          const s = document.createElement('script');
          s.type = 'application/ld+json';
          s.setAttribute('data-seo', 'page');
          return s;
        },
        (el) => {
          el.textContent = JSON.stringify(meta.jsonLd);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.title, meta.description, meta.canonicalPath, meta.noindex, meta.ogImage]);
}
