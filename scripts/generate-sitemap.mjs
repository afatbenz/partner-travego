// Generate sitemap.xml + robots.txt ke dist/ setelah react-snap.
// Jalankan TERAKHIR dalam pipeline build (react-snap rewrite dist/).
// Fleet URLs diambil dari API service-travego (dinamis). Gagal fetch → fallback static, build tetap sukses.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

const SITE_URL = process.env.SITE_URL || 'https://calistaprima.com';
const API_BASE_URL = (process.env.VITE_API_BASE_URL || 'http://localhost:3100/').replace(/\/+$/, '');
const API_KEY = process.env.VITE_API_KEY || '';

const PER_PAGE = 100;

// URL statis dari config react-snap. Exclude /sewa-bis (canonical → /sewa-bus).
const STATIC_URLS = (() => {
  const raw = readFileSync(path.join(__dirname, 'seo-routes.json'), 'utf8');
  const routes = JSON.parse(raw);
  return routes.filter((r) => !r.includes('/sewa-bis'));
})();

async function fetchFleetIds() {
  const results = [];
  const headers = {
    'api-key': API_KEY,
    'Origin': SITE_URL,
    'Accept': 'application/json',
  };

  let page = 1;
  let total = Infinity;

  while (results.length < total) {
    let res;
    try {
      res = await fetch(`${API_BASE_URL}/api/service/fleet?per_page=${PER_PAGE}&page=${page}`, { headers });
    } catch (err) {
      throw new Error(`network error: ${err.message}`);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} on page ${page}`);
    }

    const json = await res.json();
    const items = json?.data ?? [];
    if (!Array.isArray(items) || items.length === 0) break;

    for (const f of items) {
      if (f?.fleet_id) results.push(f.fleet_id);
    }

    total = json?.pagination?.total ?? json?.total ?? items.length;
    if (items.length < PER_PAGE) break;
    page += 1;
  }

  return results;
}

function buildSitemapXml(urls) {
  const today = new Date().toISOString().split('T')[0];
  const urlEntries = urls
    .map((u) => {
      const loc = `${SITE_URL}${u}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u === '/' ? '1.0' : '0.8'}</priority>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

function buildRobotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /checkout',
    'Disallow: /payment',
    'Disallow: /purchase',
    'Disallow: /order',
    'Disallow: /myprofile',
    'Disallow: /auth',
    'Disallow: /custom-order',
    'Disallow: /invalid-apikey',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}

async function main() {
  let fleetIds = [];

  try {
    fleetIds = await fetchFleetIds();
    console.log(`[sitemap] fleet URLs dari API: ${fleetIds.length} armada`);
  } catch (err) {
    console.warn(`[sitemap] Gagal ambil fleet dari API (${err.message}). Fallback ke URL statis saja.`);
  }

  const urls = [...STATIC_URLS, ...fleetIds.map((id) => `/detail/armada/${id}`)];

  mkdirSync(distDir, { recursive: true });
  writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemapXml(urls), 'utf8');
  writeFileSync(path.join(distDir, 'robots.txt'), buildRobotsTxt(), 'utf8');

  console.log(`[sitemap] ditulis: ${urls.length} URL ke ${path.join(distDir, 'sitemap.xml')}`);
}

main().catch((err) => {
  console.error('[sitemap] Gagal:', err);
  process.exit(1);
});
