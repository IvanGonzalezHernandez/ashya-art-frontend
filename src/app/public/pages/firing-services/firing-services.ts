import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FiringServiceService } from '../../../services/firing/firing';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { ValorationsComponent } from '../../../shared/valorations/valorations';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';

declare var bootstrap: any;

@Component({
  selector: 'app-firing-services',
  imports: [CommonModule, FormsModule, FeedbackModalComponent, ValorationsComponent, RevealAnimateDirective],
  standalone: true,
  templateUrl: './firing-services.html',
  styleUrl: './firing-services.scss'
})
export class FiringServices {

  @ViewChild('firingForm') firingForm?: NgForm;

  constructor(private firingServiceService: FiringServiceService) {}

  firingLoading = false;

  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  cliente = this.newCliente();

  // ================== Helpers ==================

  private newCliente() {
    return {
      tipoServicio: '',
      numeroPiezas: 1,
      nombre: '',
      detallesMaterial: '',
      email: '',
      telefono: '',
      preguntasAdicionales: ''
    };
  }

  private resetCliente(): void {
    this.cliente = this.newCliente();
  }

  private resetFormState(form?: NgForm): void {
    this.resetCliente();

    // ✅ limpia touched/dirty/errors -> NO vuelve en rojo
    if (form) {
      setTimeout(() => form.resetForm(this.cliente), 0);
    }
  }

  private markAllTouched(form: NgForm): void {
    form.control.markAllAsTouched();
  }

  private cleanupBackdrops(): void {
    document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach((b) => b.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');
  }

  private ensureModalInBody(modalId: string): HTMLElement | null {
    const el = document.getElementById(modalId) as HTMLElement | null;
    if (!el) return null;
    if (el.parentElement !== document.body) {
      document.body.appendChild(el);
    }
    return el;
  }

  // ================== Abrir modal ==================

  abrirModalFiring(): void {
    // ✅ deja todo limpio antes de abrir
    this.firingLoading = false;
    this.resetFormState(this.firingForm);
    this.cleanupBackdrops();

    const el = this.ensureModalInBody('modalFiringService');
    if (!el) return;

    const modal = bootstrap.Modal.getOrCreateInstance(el, {
      backdrop: true,
      keyboard: true,
      focus: true
    });

    // ✅ al cerrar con X / Cancel, vuelve a limpiar para la próxima entrada
    el.addEventListener('hidden.bs.modal', () => {
      this.cleanupBackdrops();
      this.firingLoading = false;
      this.resetFormState(this.firingForm);
    }, { once: true });

    modal.show();
  }

  // ================== Enviar solicitud ==================

  enviarSolicitudFiring(form: NgForm): void {
    if (this.firingLoading) return;

    // ✅ si intentan enviar vacío, muestra validaciones
    if (form.invalid) {
      this.markAllTouched(form);
      return;
    }

    this.firingLoading = true;

    this.firingServiceService.solicitarFiring(this.cliente).subscribe({
      next: () => {
        this.hideModalThen('modalFiringService', () => {
          this.firingLoading = false;
          this.resetFormState(form);

          // mostrar feedback fuera del ciclo del modal
          setTimeout(() => {
            this.mostrarModalFeedback(
              'success',
              'Request sent',
              'Thank you for submitting your firing service request. You will receive a confirmation email shortly, and one of our team members will contact you to coordinate the details.'
            );
          }, 0);
        });
      },
      error: (err) => {
        console.error('Error sending firing request', err);

        this.hideModalThen('modalFiringService', () => {
          this.firingLoading = false;

          setTimeout(() => {
            this.mostrarModalFeedback(
              'error',
              'Request error',
              'An error occurred while sending the firing request. Please try again later.'
            );
          }, 0);
        });
      }
    });
  }

  private hideModalThen(modalId: string, cb: () => void): void {
    const el = this.ensureModalInBody(modalId);
    if (!el) {
      this.cleanupBackdrops();
      cb();
      return;
    }

    const instance = bootstrap.Modal.getOrCreateInstance(el);

    el.addEventListener(
      'hidden.bs.modal',
      () => {
        try { instance.dispose(); } catch {}
        this.cleanupBackdrops();
        cb();
      },
      { once: true }
    );

    try {
      instance.hide();
    } catch {
      try { instance.dispose(); } catch {}
      this.cleanupBackdrops();
      cb();
      return;
    }

    window.setTimeout(() => {
      this.cleanupBackdrops();
    }, 700);
  }

  // ================== Feedback ==================

  mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string): void {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }

  cerrarFeedback(): void {
    this.mostrarFeedback = false;
  }
}
