import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { AuthService } from '../login/auth';
import { LanguageService } from '../language/language';

/**
 * Avisa al backend de cada página vista para las estadísticas del panel (sección Statistics).
 * Sin cookies ni almacenamiento en el navegador: solo se envía la ruta, si es la primera página
 * de la visita (con la web de la que viene y el utm_source) y el idioma elegido.
 * No cuenta nada si el admin tiene la sesión iniciada ni en el prerenderizado.
 */
@Injectable({ providedIn: 'root' })
export class VisitasService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly url = `${environment.apiUrl}/estadisticas/visita`;

  private primera = true;

  registrar(urlDespuesDeRedirecciones: string): void {
    if (!this.isBrowser || this.auth.obtenerToken()) return;

    const entrada = this.primera;
    this.primera = false;

    const [ruta, query = ''] = urlDespuesDeRedirecciones.split('#')[0].split('?');
    this.http.post(this.url, {
      ruta,
      entrada,
      referrer: entrada ? document.referrer : null,
      utmSource: entrada ? new URLSearchParams(query).get('utm_source') : null,
      idioma: this.language.current
    }).subscribe({ error: () => { /* una visita sin contar no debe molestar a nadie */ } });
  }
}
