import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { authExpiredInterceptor } from './private/guards/auth-expired.interceptor';
import { DEFAULT_LANGUAGE, getStoredLanguage } from './services/language/language';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authExpiredInterceptor])),
    // Reutiliza el HTML prerenderizado. La caché de transferencia HTTP evita que, al hidratar,
    // cada página vuelva a pedir a la API los datos que ya trae el HTML (la página se vaciaba
    // y volvía a pintar). Se excluye lo que tiene que estar siempre al día: fechas y plazas
    // de cursos, carrito y configuración (mantenimiento).
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        filter: req => !/\/api\/(cursos-fecha|carrito|config)(\/|$|\?)/.test(req.url)
      })
    ),
    provideTranslateService({
      lang: getStoredLanguage() ?? DEFAULT_LANGUAGE,
      fallbackLang: DEFAULT_LANGUAGE
    }),
    provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' })
  ]
};
