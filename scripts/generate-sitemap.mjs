// Genera src/static/sitemap.xml antes del build (npm run build -> prebuild).
// Incluye las páginas públicas estáticas y las fichas habilitadas de productos, cursos y tarjetas regalo.
// Si la API no responde, genera el sitemap solo con las páginas estáticas: nunca rompe el build.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://ashya-art.com';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Misma API que usa el build de producción (se puede sobrescribir con SITEMAP_API_URL)
const envProd = readFileSync(resolve(root, 'src/environments/environments.prod.ts'), 'utf8');
const API_URL = process.env.SITEMAP_API_URL || envProd.match(/apiUrl:\s*'([^']+)'/)?.[1];

const STATIC_PAGES = [
  '/',
  '/workshops',
  '/workshops/firing-services',
  '/workshops/gift-cards',
  '/shop',
  '/calendar',
  '/about',
  '/studio',
  '/conditions',
  '/imprint',
  '/privacy-policy'
];

const DYNAMIC_PAGES = [
  { endpoint: '/productos/habilitados', path: id => `/products/${id}` },
  { endpoint: '/cursos/habilitados', path: id => `/workshops/${id}` },
  { endpoint: '/tarjetas-regalo/habilitadas', path: id => `/gift-cards/${id}` }
];

async function fetchIds(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();
    return items.map(item => item.id).filter(id => id != null);
  } catch (err) {
    console.warn(`[sitemap] No se pudo leer ${endpoint} (${err.message}); se omiten esas fichas.`);
    return [];
  }
}

const paths = [...STATIC_PAGES];
for (const { endpoint, path } of DYNAMIC_PAGES) {
  const ids = await fetchIds(endpoint);
  paths.push(...ids.map(path));
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map(p => `  <url><loc>${SITE_URL}${p}</loc></url>`),
  '</urlset>',
  ''
].join('\n');

writeFileSync(resolve(root, 'src/static/sitemap.xml'), xml);
console.log(`[sitemap] ${paths.length} URLs escritas en src/static/sitemap.xml`);
