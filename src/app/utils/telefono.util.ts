/**
 * Enlace "tel:" a partir de un teléfono tal cual lo escribió el cliente.
 * "+49 01727411858" -> "tel:+491727411858". En Alemania, Austria y Suiza el 0 de delante
 * es solo para llamadas nacionales: con el prefijo internacional delante sobra y no conecta.
 * Devuelve null si no hay ningún número que marcar.
 */
export function telHref(telefono: string | null | undefined): string | null {
  let t = (telefono ?? '').trim().replace(/\(0\)/g, '');
  if (t.startsWith('00')) t = '+' + t.slice(2);
  const internacional = t.startsWith('+');
  t = t.replace(/\D/g, '');
  if (!t) return null;
  if (internacional) t = '+' + t.replace(/^(49|43|41)0+/, '$1');
  return 'tel:' + t;
}
