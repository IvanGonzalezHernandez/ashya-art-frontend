import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsConsentService } from '../../services/analytics-consent/analytics-consent';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cookie-wrap" *ngIf="show">
      <div class="cookie-card" role="dialog" aria-live="polite" aria-label="Cookie consent">
        <div class="cookie-text">
          <h6 class="cookie-title">Cookies & Analytics</h6>
          <p class="cookie-desc">
            We use cookies to analyze website usage (Google Analytics). You can accept or reject their use.
          </p>
        </div>

        <div class="cookie-actions">
          <button type="button" class="btn cookie-btn cookie-btn-outline" (click)="reject()">
            Reject
          </button>
          <button type="button" class="btn cookie-btn cookie-btn-primary" (click)="accept()">
            Accept
          </button>
        </div>
      </div>
    </div>
  `,
styles: [`
  /* Overlay suave, nada intrusivo */
  .cookie-wrap{
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: 99999;

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  /* Card central */
  .cookie-card{
    width: min(460px, 100%);
    background: #F9F3EC; /* beige Ashya */
    border-radius: 26px;
    padding: 26px 26px 22px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.25);
    border: 1px solid rgba(62, 48, 40, 0.18);

    display: flex;
    flex-direction: column;
    gap: 18px;
    text-align: center;
    animation: cookieFadeIn .35s ease;
  }

  @keyframes cookieFadeIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .cookie-title{
    margin: 0;
    font-weight: 700;
    color: #3E3028;
    letter-spacing: .2px;
  }

  .cookie-desc{
    margin: 0;
    color: #6b5e52;
    font-size: 15px;
    line-height: 1.5;
  }

  .cookie-actions{
    display: flex;
    gap: 14px;
    justify-content: center;
    margin-top: 6px;
  }

  .cookie-btn{
    border-radius: 999px;
    padding: 12px 22px;
    font-size: 14px;
    font-weight: 600;
    min-width: 120px;
    transition: all .2s ease;
  }

  /* Azul Ashya */
  .cookie-btn-primary{
    background: #3A9097;
    color: #fff;
    border: 1px solid #3A9097;
    box-shadow: 0 10px 22px rgba(47,111,138,.25);
  }

  .cookie-btn-primary:hover{
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(47,111,138,.35);
  }

  /* Secundario elegante */
  .cookie-btn-outline{
    background: transparent;
    color: #3E3028;
    border: 1px solid rgba(62,48,40,.45);
  }

  .cookie-btn-outline:hover{
    background: rgba(62,48,40,.06);
    transform: translateY(-1px);
  }

  /* Mobile */
  @media (max-width: 576px){
    .cookie-actions{
      flex-direction: column;
    }
    .cookie-btn{
      width: 100%;
    }
  }
`]
})
export class CookieBannerComponent {

  constructor(private analyticsConsent: AnalyticsConsentService) {}

  get show(): boolean {
    return this.analyticsConsent.getConsent() === 'unknown';
  }

  accept(): void {
    this.analyticsConsent.accept();
  }

  reject(): void {
    this.analyticsConsent.reject();
  }
}
