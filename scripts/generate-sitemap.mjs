// Generate sitemap.xml + robots.txt + halaman prerender OG ke dist/ setelah react-snap.
// Jalankan TERAKHIR dalam pipeline build (react-snap rewrite dist/).
//
// Fleet & promo URLs diambil dari API service-travego (dinamis). Gagal fetch →
// fallback static, build tetap sukses.
//
// Prerender OG: crawler media sosial (FB/WA/Twitter) membaca og:tags dari HTML
// mentah dan tidak menjalankan JavaScript, sehingga usePageMeta tidak pernah
// terlihat dan yang tampil selalu meta default index.html. Untuk tiap detail
// armada/promo ditulis dist/<path>/index.html = shell SPA (salinan dist/index.html)
// dengan og:/twitter:/title/canonical diganti sesuai konten — nginx menyajikannya
// lewat try_files, tanpa konfigurasi tambahan; manusia tetap dapat SPA normal.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Load .env root PartnerUI bila ada (Node < 20.6 / tanpa dotenv) — Vite memuat
// .env untuk build frontend, tapi script Node ini berjalan proses terpisah dan
// butuh VITE_API_BASE_URL + VITE_API_KEY untuk fetch fleet saat prerender OG.
// Env nyata (Docker ARG / shell) tetap menang; duplikat key di .env: baris
// terakhir menang (Dockerfile meng-append override di akhir file).
function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  const fromShell = new Set(Object.keys(process.env));
  const fromFile = {};
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    fromFile[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  for (const [key, value] of Object.entries(fromFile)) {
    if (!fromShell.has(key)) process.env[key] = value;
  }
}
loadDotEnv();

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

// Path relatif dari API (assets/…) → absolut, agar og:image bisa di-fetch crawler.
// Pola sama dengan resolveMediaUrl di komponen PartnerUI.
function resolveMediaUrl(p) {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${API_BASE_URL}/${p.replace(/^\//, '')}`;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, max = 160) {
  const chars = Array.from(text);
  return chars.length > max ? `${chars.slice(0, max).join('')}…` : text;
}

function escAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Ganti content= pada <meta property="og:…" / name="…"> apa pun urutan atributnya.
function setMetaContent(html, attr, key, value) {
  const re = new RegExp(`<meta\\s+[^>]*${attr}="${key.replace(/[:]/g, '\\:')}"[^>]*>`);
  const m = html.match(re);
  if (!m) return { html, found: false };
  let tag = m[0];
  const esc = escAttr(value);
  if (/content="[^"]*"/.test(tag)) {
    tag = tag.replace(/content="[^"]*"/, `content="${esc}"`);
  } else {
    tag = tag.replace(/\/?>$/, ` content="${esc}" />`);
  }
  return { html: html.replace(re, tag), found: true };
}

// Build halaman OG: shell SPA + meta diganti sesuai konten halaman.
// Isi #root dikosongkan: react-snap menyimpan DOM homepage di dist/index.html —
// bila disalin utuh, pengunjung detail page melihat kedipan homepage sebelum
// React mount (createRoot mengganti isi kontainer).
function renderOgPage(template, { title, description, imageUrl, pagePath }) {
  const url = `${SITE_URL}${pagePath}`;
  let html = template;

  html = html.replace(
    /(<div id="root"[^>]*>)([\s\S]*)(<\/div>\s*<script)/,
    '$1$3'
  );

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`);
  ({ html } = setMetaContent(html, 'name', 'description', description));
  ({ html } = setMetaContent(html, 'property', 'og:title', title));
  ({ html } = setMetaContent(html, 'property', 'og:description', description));
  ({ html } = setMetaContent(html, 'property', 'og:url', url));
  ({ html } = setMetaContent(html, 'property', 'og:image', imageUrl));
  ({ html } = setMetaContent(html, 'name', 'twitter:card', 'summary_large_image'));
  ({ html } = setMetaContent(html, 'name', 'twitter:title', title));
  ({ html } = setMetaContent(html, 'name', 'twitter:description', description));

  // twitter:image tidak ada di index.html default — sisipkan bila belum ada.
  const twImage = html.match(/<meta\s+[^>]*name="twitter:image"[^>]*>/);
  if (twImage) {
    html = html.replace(twImage[0], twImage[0].replace(/content="[^"]*"/, `content="${escAttr(imageUrl)}"`));
  } else {
    html = html.replace(
      /(<meta\s+[^>]*name="twitter:description"[^>]*>)/,
      `$1\n    <meta name="twitter:image" content="${escAttr(imageUrl)}" />`
    );
  }

  // Canonical mengikuti halaman, bukan homepage.
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escAttr(url)}" />`
  );

  return html;
}

function writeOgPage(relPath, content) {
  const outDir = path.join(distDir, relPath.replace(/^\//, ''));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'index.html'), content, 'utf8');
}

async function fetchFleets() {
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
      if (f?.fleet_id) {
        results.push({
          fleet_id: f.fleet_id,
          fleet_name: f.fleet_name || '',
          description: f.description || '',
          thumbnail: f.thumbnail || '',
        });
      }
    }

    total = json?.pagination?.total ?? json?.total ?? items.length;
    if (items.length < PER_PAGE) break;
    page += 1;
  }

  return results;
}

// Promo publik tanpa paginasi; detail promo tetap bisa diakses untuk yang
// ongoing/upcoming — yang expired tidak dimasukkan (konten sudah tidak relevan).
async function fetchPromos() {
  const headers = {
    'api-key': API_KEY,
    'Origin': SITE_URL,
    'Accept': 'application/json',
  };

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/promotions/public/list`, { headers });
  } catch (err) {
    throw new Error(`network error: ${err.message}`);
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = await res.json();
  const items = json?.data ?? [];
  if (!Array.isArray(items)) return [];

  return items
    .filter((p) => p?.promotion_id && p?.period_status !== 'expired')
    .map((p) => ({
      promotion_id: p.promotion_id,
      title: p.title || '',
      summary: p.summary || '',
      thumbnail_url: p.thumbnail_url || '',
    }));
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
  let fleets = [];
  let promos = [];

  try {
    fleets = await fetchFleets();
    console.log(`[sitemap] fleet URLs dari API: ${fleets.length} armada`);
  } catch (err) {
    console.warn(`[sitemap] Gagal ambil fleet dari API (${err.message}). Fallback ke URL statis saja.`);
  }

  try {
    promos = await fetchPromos();
    console.log(`[sitemap] promo URLs dari API: ${promos.length} promo`);
  } catch (err) {
    console.warn(`[sitemap] Gagal ambil promo dari API (${err.message}). Hanya URL statis promo yang dipakai.`);
  }

  // --- Prerender OG pages (shell SPA + meta per konten) ---
  let template = '';
  try {
    template = readFileSync(path.join(distDir, 'index.html'), 'utf8');
  } catch (err) {
    console.warn(`[sitemap] Tidak bisa baca dist/index.html (${err.message}), prerender OG dilewati.`);
  }

  if (template) {
    const fallbackImage = `${SITE_URL}/favicon.svg`;
    let written = 0;

    for (const f of fleets) {
      const title = `Calista Prima | Sewa ${f.fleet_name} wilayah Tangerang dan Jakarta`.trim();
      const description =
        truncate(stripHtml(f.description)) ||
        `Sewa ${f.fleet_name} di Calista Prima — melayani Tangerang & Jakarta.`;
      const pagePath = `/detail/armada/${f.fleet_id}`;
      writeOgPage(pagePath, renderOgPage(template, {
        title,
        description,
        imageUrl: resolveMediaUrl(f.thumbnail) || fallbackImage,
        pagePath,
      }));
      written += 1;
    }

    for (const p of promos) {
      const title = `Calista Prima | Promo ${p.title}`.trim();
      const description =
        truncate(stripHtml(p.summary)) ||
        'Promo spesial dari Calista Prima — kunjungi halaman promo untuk detail dan syarat berlaku.';
      const pagePath = `/promo-discount/${p.promotion_id}`;
      writeOgPage(pagePath, renderOgPage(template, {
        title,
        description,
        imageUrl: resolveMediaUrl(p.thumbnail_url) || fallbackImage,
        pagePath,
      }));
      written += 1;
    }

    console.log(`[sitemap] prerender OG: ${written} halaman detail (armada + promo)`);
  }

  const urls = [
    ...STATIC_URLS,
    ...fleets.map((f) => `/detail/armada/${f.fleet_id}`),
    ...promos.map((p) => `/promo-discount/${p.promotion_id}`),
  ];

  mkdirSync(distDir, { recursive: true });
  writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemapXml(urls), 'utf8');
  writeFileSync(path.join(distDir, 'robots.txt'), buildRobotsTxt(), 'utf8');

  console.log(`[sitemap] ditulis: ${urls.length} URL ke ${path.join(distDir, 'sitemap.xml')}`);
}

main().catch((err) => {
  console.error('[sitemap] Gagal:', err);
  process.exit(1);
});
