import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { LanguageService } from '../language/language';
import { SITE_URL, negocio, sitioWeb, urlDePagina } from './structured-data';

export { SITE_URL };
const SITE_NAME = 'Ashya Art';
const DEFAULT_IMAGE = `${SITE_URL}/assets/banner/banner.webp`;

const OG_LOCALES: Record<string, string> = { en: 'en_US', de: 'de_DE', es: 'es_ES' };

/**
 * Configuración SEO estática de una ruta (en `data.seo`).
 * - `titleKey` / `descriptionKey`: claves i18n.
 * - `dynamic`: la página fija su propio SEO cuando carga los datos (fichas de producto, curso, tarjeta).
 * - `noindex`: la página no debe aparecer en buscadores.
 * - `structuredData: 'business'`: incluye los datos estructurados del estudio (home).
 */
export interface RouteSeo {
  titleKey?: string;
  descriptionKey?: string;
  dynamic?: boolean;
  noindex?: boolean;
  structuredData?: 'business';
}

/** SEO ya resuelto (textos finales) para aplicar a la página actual. */
export interface PageSeo {
  title: string;
  description?: string;
  image?: string | null;
  noindex?: boolean;
  /** Si el título ya incluye la marca no se le añade " | Ashya Art". */
  fullTitle?: boolean;
  /** Objetos JSON-LD (schema.org) de la página. */
  structuredData?: object[];
  /** Ruta canónica si no coincide con la URL actual (p.ej. fichas con nombre en la URL). */
  path?: string;
}

/** Une los textos no vacíos, quita HTML y recorta a ~160 caracteres (lo que muestra Google). */
export function seoDescription(...parts: Array<string | null | undefined>): string {
  const text = parts
    .filter((p): p is string => !!p && p.trim() !== '')
    .map(p => p.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
    .join('. ')
    .replace(/\.\s*\./g, '.');
  if (text.length <= 160) return text;
  const cut = text.slice(0, 157);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);

  private routeSeo: RouteSeo | null = null;
  private dynamicSeo: PageSeo | null = null;

  /** Se llama una vez al arrancar la app. */
  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.routeSeo = this.findRouteSeo(this.router.routerState.snapshot.root);
        this.dynamicSeo = null;
        this.applyRouteSeo();
      });

    // Al cambiar de idioma se vuelven a traducir título y descripción.
    this.translate.onLangChange.subscribe(() => {
      this.updateLangAttributes();
      if (this.dynamicSeo) {
        this.apply(this.dynamicSeo);
      } else {
        this.applyRouteSeo();
      }
    });

    this.updateLangAttributes();
  }

  /** Para páginas con `dynamic: true`: fija el SEO cuando ya tienen los datos. */
  setPage(seo: PageSeo): void {
    this.dynamicSeo = seo;
    this.apply(seo);
  }

  private applyRouteSeo(): void {
    const seo = this.routeSeo;
    if (!seo || seo.dynamic) {
      // Mientras carga una ficha dinámica, al menos canónica y robots correctos.
      this.updateCanonical(!!seo?.noindex);
      this.updateRobots(!!seo?.noindex);
      this.updateStructuredData(undefined);
      return;
    }

    const keys = [seo.titleKey, seo.descriptionKey].filter((k): k is string => !!k);
    this.translate.get(keys).subscribe(t => {
      this.apply({
        title: seo.titleKey ? t[seo.titleKey] : SITE_NAME,
        description: seo.descriptionKey ? t[seo.descriptionKey] : undefined,
        noindex: seo.noindex,
        fullTitle: seo.titleKey === 'SEO.HOME_TITLE',
        structuredData: seo.structuredData === 'business' ? [negocio(), sitioWeb()] : undefined
      });
    });
  }

  private apply(seo: PageSeo): void {
    const fullTitle = seo.fullTitle ? seo.title : `${seo.title} | ${SITE_NAME}`;
    const url = seo.path ? urlDePagina(seo.path) : this.currentUrl();
    const image = seo.image || DEFAULT_IMAGE;

    this.title.setTitle(fullTitle);
    this.setOrRemove('name="description"', { name: 'description', content: seo.description });

    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.setOrRemove('property="og:description"', { property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    this.updateRobots(!!seo.noindex);
    this.updateCanonical(!!seo.noindex, url);
    this.updateStructuredData(seo.noindex ? undefined : seo.structuredData);
  }

  /** Un único <script type="application/ld+json"> en el head con los datos de la página actual. */
  private updateStructuredData(data: object[] | undefined): void {
    let script = this.document.head.querySelector<HTMLScriptElement>('script#seo-jsonld');
    if (!data?.length) {
      script?.remove();
      return;
    }
    if (!script) {
      script = this.document.createElement('script');
      script.id = 'seo-jsonld';
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    // '<' escapado para que ningún texto pueda cerrar el <script>
    const json = JSON.stringify(data.length === 1 ? data[0] : data).replace(/</g, '\\u003c');
    script.textContent = json;
  }

  private updateRobots(noindex: boolean): void {
    if (noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.removeTag('name="robots"');
    }
  }

  /** Canónica = URL actual sin query ni fragmento, con barra final. Las páginas noindex no llevan canónica. */
  private updateCanonical(noindex: boolean, url = this.currentUrl()): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (noindex) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private updateLangAttributes(): void {
    const lang = this.language.current;
    this.document.documentElement.lang = lang;
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALES[lang] ?? OG_LOCALES['en'] });
  }

  private setOrRemove(selector: string, tag: { name?: string; property?: string; content?: string }): void {
    if (tag.content) {
      this.meta.updateTag(tag as { content: string });
    } else {
      this.meta.removeTag(selector);
    }
  }

  private currentUrl(): string {
    return urlDePagina(this.router.url);
  }

  /** La ruta más profunda con `data.seo` gana (las hijas heredan de las padres si no definen el suyo). */
  private findRouteSeo(snapshot: ActivatedRouteSnapshot): RouteSeo | null {
    let seo: RouteSeo | null = null;
    let current: ActivatedRouteSnapshot | null = snapshot;
    while (current) {
      if (current.data?.['seo']) seo = current.data['seo'];
      current = current.firstChild;
    }
    return seo;
  }
}
