import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom, Observable } from 'rxjs';
import { ShopService } from './services/shop/shop';
import { CursoService } from './services/curso/curso';
import { TarjetaRegaloService } from './services/tarjetaRegalo/tarjetaRegalo';
import { segmentoFicha } from './utils/slug.util';

/**
 * Ids a prerenderizar para una ficha. Si la API falla, se omiten esas fichas en vez de
 * romper el build: se siguen sirviendo renderizadas en el navegador (fallback Client).
 */
async function idsDe(nombre: string, lista: Observable<{ id: number; nombre?: string | null }[]>): Promise<Record<string, string>[]> {
  try {
    const items = await firstValueFrom(lista);
    return items.map(item => ({ id: segmentoFicha(item) }));
  } catch (err) {
    const motivo = (err as { message?: string })?.message ?? err;
    console.warn(`[prerender] No se pudieron obtener ${nombre} (${motivo}); se renderizarán en el navegador.`);
    return [];
  }
}

export const serverRoutes: ServerRoute[] = [
  // Zona de administración y pantalla de mantenimiento: solo en el navegador, no interesan a buscadores
  { path: 'private/**', renderMode: RenderMode.Client },
  { path: 'maintenance', renderMode: RenderMode.Client },

  // Fichas: se prerenderizan las habilitadas en el momento del build.
  // Las que se creen después se sirven renderizadas en el navegador hasta el siguiente build.
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    getPrerenderParams: () => idsDe('productos', inject(ShopService).getProductos())
  },
  {
    path: 'workshops/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    getPrerenderParams: () => idsDe('cursos', inject(CursoService).getCursosHabilitados())
  },
  {
    path: 'gift-cards/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    getPrerenderParams: () => idsDe('tarjetas regalo', inject(TarjetaRegaloService).getTarjetasHabilitadas())
  },

  // Resto de páginas públicas
  { path: '**', renderMode: RenderMode.Prerender }
];
