import { Pipe, PipeTransform } from '@angular/core';

/** "Taza Azul Ñandú" -> "taza-azul-nandu" */
export function slugify(texto: string | null | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // quita tildes
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/**
 * Segmento de URL de una ficha: "<id>-<nombre>" (p.ej. "12-taza-azul").
 * Solo el id identifica la ficha; el nombre es para buscadores y personas.
 */
export function segmentoFicha(item: { id: number; nombre?: string | null }): string {
  const slug = slugify(item.nombre);
  return slug ? `${item.id}-${slug}` : String(item.id);
}

/** Id a partir del segmento de URL ("12-taza-azul" o el formato antiguo "12"). */
export function idDeSegmento(segmento: string | null): number {
  return segmento ? parseInt(segmento, 10) : NaN;
}

/** En plantillas: [routerLink]="['/products', producto | segmentoFicha]" */
@Pipe({ name: 'segmentoFicha', standalone: true })
export class SegmentoFichaPipe implements PipeTransform {
  transform(item: { id: number; nombre?: string | null }): string {
    return segmentoFicha(item);
  }
}
