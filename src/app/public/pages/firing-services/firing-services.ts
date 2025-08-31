import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiringServiceService } from '../../../services/firing/firing';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';

declare var bootstrap: any;

@Component({
  selector: 'app-firing-services',
  imports: [CommonModule, FormsModule, FeedbackModalComponent],
  standalone: true,
  templateUrl: './firing-services.html',
  styleUrl: './firing-services.scss'
})
export class FiringServices {

  constructor(private firingServiceService: FiringServiceService) {}

  // Modal de feedback
  mostrarFeedback: boolean = false;
  feedbackTitulo: string = '';
  feedbackMensaje: string = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  cliente = {
    tipoServicio: '',
    numeroPiezas: 1,
    nombre: '',
    detallesMaterial: '',
    email: '',
    telefono: '',
    preguntasAdicionales: ''
  };

enviarSolicitudFiring() {
  this.firingServiceService.solicitarFiring(this.cliente).subscribe({
    next: () => {
      this.mostrarModalFeedback(
        'success',
        'Request sent',
        'Thank you for submitting your firing service request. You will receive a confirmation email shortly, and one of our team members will contact you to coordinate the details.'
      );

      const modal = document.getElementById('modalFiringService');
      if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        modalInstance.hide();
      }

      // Reiniciar el formulario
      this.cliente = {
        tipoServicio: '',
        numeroPiezas: 1,
        nombre: '',
        detallesMaterial: '',
        email: '',
        telefono: '',
        preguntasAdicionales: ''
      };
    },
    error: (err) => {
      console.error('Error sending firing request', err);

      const modal = document.getElementById('modalFiringService');
      if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        modalInstance.hide();
      }

      this.mostrarModalFeedback(
        'error',
        'Request error',
        'An error occurred while sending the firing request. Please try again later.'
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
