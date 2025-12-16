import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnalyticsConsentService } from './services/analytics-consent/analytics-consent';
import { CookieBannerComponent } from './shared/cookie-banner/cookie-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected title = 'ashya-art-frontend';

  constructor(
    private router: Router,
    private analyticsConsent: AnalyticsConsentService
  ) {}

  ngOnInit() {
    // Si ya aceptó cookies anteriormente, carga GA al arrancar
    this.analyticsConsent.initOnAppStart();

    // Suscribirse a cambios de ruta (para page_view)
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(event => {
        // Scroll al inicio en cada cambio de ruta
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });

        // Google Analytics SOLO si hay consentimiento
        this.analyticsConsent.trackPageView(event.urlAfterRedirects);
      });
  }
}
