import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MaintenanceService } from '../../../services/maintenance/maintenance';
import { AuthService } from '../../../services/login/auth';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';

@Component({
  selector: 'app-utils-dashboard',
  standalone: true,
  templateUrl: './utils-dashboard.html',
  styleUrls: ['./utils-dashboard.scss'],
  imports: [CommonModule, FeedbackModalComponent]
})
export class UtilsDashboard implements OnInit {
  loading = false;
  saving = false;
  mantenimientoActivo = false;

  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  constructor(
    private maintenanceService: MaintenanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.maintenanceService.isEnabled().subscribe({
      next: activo => {
        this.mantenimientoActivo = activo;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleMantenimiento(): void {
    const nuevoValor = !this.mantenimientoActivo;
    this.saving = true;
    const token = this.authService.obtenerToken();

    this.maintenanceService.setEnabled(nuevoValor, token).subscribe({
      next: activo => {
        this.mantenimientoActivo = activo;
        this.saving = false;
        this.mostrarModalFeedback(
          'success',
          'Saved',
          activo ? 'Maintenance mode is now ON. Visitors will see the maintenance page.' : 'Maintenance mode is now OFF. The site is live again.'
        );
      },
      error: (e) => {
        console.error(e);
        this.saving = false;
        this.mostrarModalFeedback('error', 'Error', 'Could not update maintenance mode. Please try again.');
      }
    });
  }

  private mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }

  cerrarFeedback() {
    this.mostrarFeedback = false;
  }
}
