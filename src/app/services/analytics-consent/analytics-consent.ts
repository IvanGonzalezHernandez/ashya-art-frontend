import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

type Consent = 'accepted' | 'rejected' | 'unknown';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsConsentService {
  private readonly STORAGE_KEY = 'cookie_consent_analytics';

  getConsent(): Consent {
    const v = localStorage.getItem(this.STORAGE_KEY);
    if (v === 'accepted' || v === 'rejected') return v;
    return 'unknown';
  }

  accept(): void {
    localStorage.setItem(this.STORAGE_KEY, 'accepted');
    this.enableGoogleAnalytics();
  }

  reject(): void {
    localStorage.setItem(this.STORAGE_KEY, 'rejected');
  }

  initOnAppStart(): void {
    if (this.getConsent() === 'accepted') {
      this.enableGoogleAnalytics();
    }
  }

  trackPageView(pagePath: string): void {
    if (this.getConsent() !== 'accepted') return;
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', { page_path: pagePath });
  }

  private enableGoogleAnalytics(): void {
  const id = environment.gaMeasurementId?.trim();
  if (!id) return;

  // ya cargado
  if (document.getElementById('ga4-script')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  const s = document.createElement('script');
  s.id = 'ga4-script';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;

  s.onload = () => {
    // Solo cuando YA está cargado
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true, send_page_view: false });

    // Para verificar rápido que manda algo (y crear cookies)
    window.gtag('event', 'page_view', { page_path: location.pathname });
  };

  document.head.appendChild(s);
}

}
