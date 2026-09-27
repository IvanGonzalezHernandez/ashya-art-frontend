import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language/language';

/**
 * Traducciones del contenido escrito desde el admin (cursos, productos, tarjetas regalo):
 * { "de": { "nombre": "...", ... }, "es": { ... } }. Los campos normales son el inglés.
 */
export type Traducciones = Partial<Record<'de' | 'es', Record<string, string>>>;

/** Texto de un campo en el idioma pedido; si no está traducido, el original (inglés). */
export function textoTraducido(
  item: { traducciones?: Traducciones | null } | null | undefined,
  campo: string,
  idioma: string
): string {
  if (!item) return '';
  const traducido = (item.traducciones as Record<string, Record<string, string>> | null | undefined)?.[idioma]?.[campo];
  if (traducido && traducido.trim() !== '') return traducido;
  const original = (item as Record<string, unknown>)[campo];
  return original == null ? '' : String(original);
}

/**
 * En plantillas: {{ curso | traducir:'nombre' }}. Impuro para que cambie al elegir otro idioma
 * sin recargar (solo lee un par de propiedades, así que es barato).
 */
@Pipe({ name: 'traducir', standalone: true, pure: false })
export class TraducirPipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(item: { traducciones?: Traducciones | null } | null | undefined, campo: string): string {
    return textoTraducido(item, campo, this.language.current);
  }
}
