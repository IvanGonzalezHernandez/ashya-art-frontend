import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnalyticsConsentService } from './services/analytics-consent/analytics-consent';
import { CookieBannerComponent } from './shared/cookie-banner/cookie-banner';
import { SeoService } from './services/seo/seo';
import { VisitasService } from './services/visitas/visitas';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected title = 'ashya-art-frontend';
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    private analyticsConsent: AnalyticsConsentService,
    private seo: SeoService,
    private visitas: VisitasService
  ) {}

  ngOnInit() {
    // Título, descripción, canónica y Open Graph por ruta
    this.seo.init();

    // Si ya aceptó cookies anteriormente, carga GA al arrancar
    this.analyticsConsent.initOnAppStart();

    // Suscribirse a cambios de ruta (para page_view)
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(event => {
        // Scroll al inicio en cada cambio de ruta
        if (isPlatformBrowser(this.platformId)) window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });

        // Google Analytics SOLO si hay consentimiento
        this.analyticsConsent.trackPageView(event.urlAfterRedirects);

        // Estadísticas propias del panel (sin cookies)
        this.visitas.registrar(event.urlAfterRedirects);
      });
  }
}
