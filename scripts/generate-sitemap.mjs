// Genera sitemap.xml después del build (npm run build -> postbuild) a partir de las páginas
// prerenderizadas: cada <ruta>/index.html del build es una URL indexable. Así el sitemap
// coincide siempre con lo que se ha generado (incluidas las URLs con nombre de las fichas).

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://ashya-art.com';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browserDir = resolve(root, 'dist/ashya-art-frontend/browser');

if (!existsSync(browserDir)) {
  console.warn(`[sitemap] No existe ${browserDir}; no se genera el sitemap.`);
  process.exit(0);
}

function paginas(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const ruta = join(dir, entry.name);
    if (entry.isDirectory()) return paginas(ruta);
    return entry.name === 'index.html' ? [ruta] : [];
  });
}

const urls = paginas(browserDir)
  // Páginas con noindex (no deberían prerenderizarse, pero por si acaso)
  .filter(file => !/<meta name="robots" content="noindex/.test(readFileSync(file, 'utf8')))
  .map(file => {
    const ruta = relative(browserDir, dirname(file)).split(sep).join('/');
    // Con barra final: Render solo sirve <ruta>/index.html (la página prerenderizada) así.
    return ruta ? `/${ruta}/` : '/';
  })
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(p => `  <url><loc>${SITE_URL}${encodeURI(p)}</loc></url>`),
  '</urlset>',
  ''
].join('\n');

writeFileSync(join(browserDir, 'sitemap.xml'), xml);
console.log(`[sitemap] ${urls.length} URLs escritas en dist/ashya-art-frontend/browser/sitemap.xml`);
