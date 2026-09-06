import { environment } from '../../environments/environments';

/**
 * El backend devuelve las imágenes de producto/curso/tarjeta regalo como una ruta relativa
 * (p.ej. "/uploads/productos/<uuid>.webp"), servida como archivo estático. Aquí se le antepone
 * el origen del backend para poder usarla directamente en un [src] de <img>.
 */
export function resolveImgUrl(url?: string | null): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${environment.filesBaseUrl}${url}`;
}
