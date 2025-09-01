import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { StudioService, OpenStudioSolicitudDto } from '../../../services/studio/studio';

declare var bootstrap: any;

@Component({
  selector: 'app-studio',
  imports: [CommonModule, FormsModule, FeedbackModalComponent],
  templateUrl: './studio.html',
  styleUrl: './studio.scss'
})
export class Studio {
  // Modal de feedback
  mostrarFeedback: boolean = false;
  feedbackTitulo: string = '';
  feedbackMensaje: string = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  // Formulario de reserva de Open Studio
  reserva: OpenStudioSolicitudDto = {
    fecha: '',
    franjaHoraria: '', // Wednesday/Firday/Saturday slots
    nombre: '',
    email: '',
    telefono: '',
    preguntasAdicionales: ''
  };

  constructor(private studioService: StudioService) {}

  enviarSolicitudOpenStudio() {
    this.studioService.solicitarOpenStudio(this.reserva).subscribe({
      next: () => {
        this.mostrarModalFeedback(
          'success',
          'Request sent',
          'Thank you for your Open Studio reservation request. You will receive a confirmation email shortly, and we will contact you to coordinate the details.'
        );

        const modal = document.getElementById('modalOpenStudio');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();
        }

        this.reserva = {
          fecha: '',
          franjaHoraria: '',
          nombre: '',
          email: '',
          telefono: '',
          preguntasAdicionales: ''
        };
      },
      error: (err) => {
        console.error('Error sending Open Studio request', err);

        const modal = document.getElementById('modalOpenStudio');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();
        }

        this.mostrarModalFeedback(
          'error',
          'Request error',
          'An error occurred while sending the Open Studio request. Please try again later.'
        );
      }
    });
  }

  mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }

  cerrarFeedback() {
    this.mostrarFeedback = false;
  }
}
