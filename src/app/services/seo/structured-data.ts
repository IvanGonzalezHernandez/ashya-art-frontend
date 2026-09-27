// Datos estructurados (JSON-LD, schema.org) para que Google entienda el negocio y las fichas.
// Solo datos que la web ya publica (footer / Impressum); nada inventado (sin horarios ni coordenadas).

import { Producto } from '../../models/producto.model';
import { Curso } from '../../models/curso.model';
import { TarjetaRegalo } from '../../models/tarjetaRegalo.model';
import { segmentoFicha } from '../../utils/slug.util';

export const SITE_URL = 'https://ashya-art.com';

/**
 * URL pública de una página, siempre con barra final (salvo query/fragmento).
 * El hosting (Render) solo sirve la página prerenderizada <ruta>/index.html cuando la URL
 * acaba en "/"; sin barra aplica la reescritura a index.csr.html (página vacía). Por eso
 * canónica, og:url, JSON-LD y sitemap apuntan a la versión con barra.
 */
export function urlDePagina(path: string): string {
  const limpio = path.split(/[?#]/)[0].replace(/\/+$/, '');
  return `${SITE_URL}${limpio}/`;
}

type JsonLd = Record<string, unknown>;

const BUSINESS_ID = `${SITE_URL}/#business`;

/** El estudio: se usa en la home y como proveedor/vendedor en las fichas. */
export function negocio(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: 'Ashya Art & Keramik',
    alternateName: 'Ashya Art',
    description: 'Handcrafted ceramics, pottery workshops, open studio and gift cards in Hamburg.',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/assets/logo/logo.png`,
    image: `${SITE_URL}/assets/banner/banner.webp`,
    email: 'ashyaxart@gmail.com',
    telephone: '+49 163 8681397',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Pinneberger Chaussee 74',
      postalCode: '22523',
      addressLocality: 'Hamburg',
      addressCountry: 'DE'
    },
    sameAs: ['https://www.instagram.com/ashya_art']
  };
}

export function sitioWeb(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ashya Art',
    url: `${SITE_URL}/`,
    publisher: { '@id': BUSINESS_ID }
  };
}

/** Migas de pan: [nombre, ruta] desde la home hasta la página actual. */
export function migas(items: Array<[string, string]>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: urlDePagina(path)
    }))
  };
}

function imagenes(...urls: Array<string | null | undefined>): string[] {
  return urls.filter((u): u is string => !!u && u.trim() !== '');
}

function oferta(precio: number | null | undefined, path: string, disponible = true): JsonLd | undefined {
  if (precio == null) return undefined;
  return {
    '@type': 'Offer',
    price: precio.toFixed(2),
    priceCurrency: 'EUR',
    availability: disponible ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: urlDePagina(path),
    seller: { '@id': BUSINESS_ID }
  };
}

export function producto(p: Producto, descripcion: string): JsonLd {
  const path = `/products/${segmentoFicha(p)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nombre,
    description: descripcion,
    image: imagenes(p.img1Url, p.img2Url, p.img3Url, p.img4Url, p.img5Url),
    category: p.categoria || undefined,
    material: p.material || undefined,
    brand: { '@type': 'Brand', name: 'Ashya Art' },
    offers: oferta(p.precio, path, (p.stock ?? 0) > 0)
  };
}

export function tarjetaRegalo(t: TarjetaRegalo, descripcion: string): JsonLd {
  const path = `/gift-cards/${segmentoFicha(t)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: t.nombre,
    description: descripcion,
    image: imagenes(t.imgUrl),
    brand: { '@type': 'Brand', name: 'Ashya Art' },
    offers: oferta(t.precio, path)
  };
}

export function curso(c: Curso, descripcion: string): JsonLd {
  const path = `/workshops/${segmentoFicha(c)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.nombre,
    description: descripcion,
    image: imagenes(c.img1Url, c.img2Url, c.img3Url, c.img4Url, c.img5Url),
    educationalLevel: c.nivel || undefined,
    provider: { '@id': BUSINESS_ID, '@type': 'LocalBusiness', name: 'Ashya Art & Keramik' },
    offers: oferta(c.precio, path)
  };
}
