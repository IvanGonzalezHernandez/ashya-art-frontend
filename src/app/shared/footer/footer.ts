import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter/newsletter';
import { Newsletter } from '../../models/newsletter.model';
import { FeedbackModalComponent } from '../../shared/feedback-modal/feedback-modal';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule, FeedbackModalComponent, CommonModule, RouterModule, TranslatePipe],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {

  constructor(
    private newsletterService: NewsletterService,
    private translate: TranslateService
  ) {}

  // Email del input
  emailSuscripcion: string = '';

  // Modal de feedback
  mostrarFeedback: boolean = false;
  feedbackTitulo: string = '';
  feedbackMensaje: string = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  currentYear = new Date().getFullYear();
  newsletterLoading: boolean = false;

suscribirse() {
  if (!this.emailSuscripcion.trim()) {
    this.mostrarModalFeedback(
      'error',
      this.translate.instant('FOOTER.INVALID_EMAIL_TITLE'),
      this.translate.instant('FOOTER.INVALID_EMAIL_MSG')
    );
    return;
  }

  if (this.newsletterLoading) {
    return;
  }

  this.newsletterLoading = true;

  const nuevoNewsletter: Partial<Newsletter> = {
    email: this.emailSuscripcion
  };

  this.newsletterService.suscribirse(nuevoNewsletter)
    .pipe(
      finalize(() => {
        // SIEMPRE se ejecuta: éxito o error
        this.newsletterLoading = false;
      })
    )
    .subscribe({
      next: () => {
        this.emailSuscripcion = '';
        this.mostrarModalFeedback(
          'success',
          this.translate.instant('FOOTER.SUB_CONFIRMED_TITLE'),
          this.translate.instant('FOOTER.SUB_CONFIRMED_MSG')
        );
      },
      error: err => {
        console.error('Subscription error:', err);

        const backendMessage: string | undefined =
          typeof err.error === 'string'
            ? err.error
            : err?.error?.message || err?.error?.detail || err?.error?.error;

        const yaSuscrito =
          err.status === 409 ||
          (backendMessage && backendMessage.toLowerCase().includes('already subscribed'));

        const message = yaSuscrito
          ? this.translate.instant('FOOTER.ALREADY_SUBSCRIBED_MSG')
          : this.translate.instant('FOOTER.SUB_GENERIC_ERROR_MSG');

        this.mostrarModalFeedback(
          'error',
          this.translate.instant('FOOTER.SUB_ERROR_TITLE'),
          message
        );
      }

    });
}


  // Mostrar el modal
  mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }

  // Cerrar manual (si se pulsa la X)
  cerrarFeedback() {
    this.mostrarFeedback = false;
  }
}
