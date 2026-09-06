import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const SUPPORTED_LANGUAGES = ['en', 'de', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** Rutas a los iconos SVG de bandera (propios, no dependen de la fuente de emoji del sistema). */
export const LANGUAGE_FLAG_ICONS: Record<SupportedLanguage, string> = {
  en: 'assets/flags/gb.svg',
  de: 'assets/flags/de.svg',
  es: 'assets/flags/es.svg'
};

const STORAGE_KEY = 'ashya_lang';

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** Lee el idioma guardado antes de que Angular arranque (usado al configurar TranslateService). */
export function getStoredLanguage(): SupportedLanguage | null {
  try {
    return isSupportedLanguage(localStorage.getItem(STORAGE_KEY))
      ? (localStorage.getItem(STORAGE_KEY) as SupportedLanguage)
      : null;
  } catch {
    // localStorage no disponible (modo privado, navegador restringido, etc.)
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class LanguageService {

  constructor(private translate: TranslateService) {}

  get current(): SupportedLanguage {
    const lang = this.translate.currentLang();
    return isSupportedLanguage(lang) ? (lang as SupportedLanguage) : DEFAULT_LANGUAGE;
  }

  use(lang: SupportedLanguage): void {
    this.translate.use(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // No crítico: simplemente no se recordará la preferencia entre visitas.
    }
  }
}
