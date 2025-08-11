import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter/newsletter';
import { Newsletter } from '../../models/newsletter.model';
import { FeedbackModalComponent } from '../../shared/feedback-modal/feedback-modal';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule, FeedbackModalComponent, CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {

  // Email del input
  emailSuscripcion: string = '';

  // Modal de feedback
  mostrarFeedback: boolean = false;
  feedbackTitulo: string = '';
  feedbackMensaje: string = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  constructor(private newsletterService: NewsletterService) {}

  suscribirse() {
    if (!this.emailSuscripcion.trim()) {
      this.mostrarModalFeedback(
        'error',
        'Invalid email',
        'Please enter a valid email address to subscribe.'
      );
      return;
    }
  
    const nuevoNewsletter: Partial<Newsletter> = {
      email: this.emailSuscripcion
    };
  
    this.newsletterService.suscribirse(nuevoNewsletter).subscribe({
      next: () => {
        this.emailSuscripcion = '';
        this.mostrarModalFeedback(
          'success',
          'Subscription confirmed',
          'Thank you for subscribing! You will receive a confirmation email shortly.'
        );
      },
      error: err => {
        console.error('Subscription error:', err);
        const message =
          err.status === 409
            ? 'This email is already registered.'
            : 'An error occurred while subscribing. Please try again later.';
  
        this.mostrarModalFeedback(
          'error',
          'Subscription error',
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
