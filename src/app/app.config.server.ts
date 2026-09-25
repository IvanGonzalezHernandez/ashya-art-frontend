import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Observable, of } from 'rxjs';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Durante el prerenderizado no hay servidor HTTP que sirva /assets/i18n/*.json,
 * así que las traducciones se leen directamente del disco.
 */
class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    const file = join(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`);
    return of(JSON.parse(readFileSync(file, 'utf8')));
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: TranslateLoader, useClass: ServerTranslateLoader }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
