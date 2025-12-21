import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { StudioService, OpenStudioSolicitudDto } from '../../../services/studio/studio';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';

declare var bootstrap: any;

@Component({
  selector: 'app-studio',
  imports: [CommonModule, FormsModule, FeedbackModalComponent, RevealAnimateDirective],
  templateUrl: './studio.html',
  styleUrl: './studio.scss'
})
export class Studio {

  @ViewChild('openStudioForm') openStudioForm?: NgForm;

  openStudioLoading = false;

  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  reserva: OpenStudioSolicitudDto = this.newReserva();

  constructor(private studioService: StudioService) {}

  // ================== Model helpers ==================

  private newReserva(): OpenStudioSolicitudDto {
    return {
      option: '',
      nombre: '',
      email: '',
      telefono: '',
      preguntasAdicionales: ''
    };
  }

  private resetReserva(): void {
    this.reserva = this.newReserva();
  }

  private resetFormState(form?: NgForm): void {
    this.resetReserva();

    // ✅ limpia touched/dirty/errors -> NO vuelve en rojo
    if (form) {
      setTimeout(() => form.resetForm(this.reserva), 0);
    }
  }

  private markAllTouched(form: NgForm): void {
    form.control.markAllAsTouched();
  }

  // ================== Modal helpers ==================

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

  abrirModalOpenStudio(): void {
    // ✅ deja todo limpio antes de abrir
    this.openStudioLoading = false;
    this.resetFormState(this.openStudioForm);
    this.cleanupBackdrops();

    const el = this.ensureModalInBody('modalOpenStudio');
    if (!el) return;

    const modal = bootstrap.Modal.getOrCreateInstance(el, {
      backdrop: true,
      keyboard: true,
      focus: true
    });

    // ✅ al cerrar con X / Cancel, vuelve a limpiar para la próxima entrada
    el.addEventListener('hidden.bs.modal', () => {
      this.cleanupBackdrops();
      this.openStudioLoading = false;
      this.resetFormState(this.openStudioForm);
    }, { once: true });

    modal.show();
  }

  // ================== Enviar solicitud ==================

  enviarSolicitudOpenStudio(form: NgForm): void {
    if (this.openStudioLoading) return;

    // ✅ si intentan enviar vacío, muestra validaciones
    if (form.invalid) {
      this.markAllTouched(form);
      return;
    }

    this.openStudioLoading = true;

    this.studioService.solicitarOpenStudio(this.reserva).subscribe({
      next: () => {
        this.hideModalThen('modalOpenStudio', () => {
          this.openStudioLoading = false;
          this.resetFormState(form);

          setTimeout(() => {
            this.mostrarModalFeedback(
              'success',
              'Request sent',
              'Thank you for your Open Studio reservation request. You will receive a confirmation email shortly, and we will contact you to coordinate the details.'
            );
          }, 0);
        });
      },
      error: (err) => {
        console.error('Error sending Open Studio request', err);

        this.hideModalThen('modalOpenStudio', () => {
          this.openStudioLoading = false;

          setTimeout(() => {
            this.mostrarModalFeedback(
              'error',
              'Request error',
              'An error occurred while sending the Open Studio request. Please try again later.'
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
