import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReservasService } from '../../../services/curso-compra/curso-compra';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Reservas } from '../../../models/curso-compra.model';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';


@Component({
  selector: 'app-reservas-dashboard',
  standalone: true,
  templateUrl: './reservas-dashboard.html',
  styleUrls: ['./reservas-dashboard.scss'],
  imports: [CommonModule, NgxPaginationModule, FeedbackModalComponent, ConfirmModalComponent]
})
export class ReservasDashboard implements OnInit {
  loading = false;

  reservas: Reservas[] = [];
  paginaActual: number = 1;

  // Modal de confirmación de cancelación
  reservaACancelar: Reservas | null = null;

  // Modal de feedback
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  constructor(
    private reservasService: ReservasService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerReservas();
  }

  obtenerReservas() {
    this.loading = true;
    this.reservasService.getReservas().subscribe({
      next: data => {
        this.reservas = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar reservas', err);
        this.loading = false;
      }
    });
  }

  pedirConfirmacionCancelar(reserva: Reservas) {
    this.reservaACancelar = reserva;
  }

  cancelarCancelacion() {
    this.reservaACancelar = null;
  }

  confirmarCancelacion() {
    const reserva = this.reservaACancelar;
    if (!reserva) return;
    this.reservaACancelar = null;

    this.reservasService.eliminarReserva(reserva.id).subscribe({
      next: () => {
        this.obtenerReservas();
        this.mostrarModalFeedback('success', 'Cancelled', 'Booking cancelled and seats released.');
      },
      error: err => {
        console.error('Error cancelling booking', err);
        this.mostrarModalFeedback('error', 'Error', 'Could not cancel the booking.');
      }
    });
  }

  exportarCSV() {
    const encabezado = ['Client', 'Course', 'Date', 'Reserved Seats', 'Unit Price', 'Payment', 'Book Date'];
    const filas = (this.reservas || []).map(reserva => [
      reserva.email ?? '',
      reserva.nombreCurso ?? '',
      reserva.fechaCurso ?? '',
      reserva.plazasReservadas ?? 0,
      reserva.precio ?? '',
      reserva.pagado ? 'Paid' : 'Atelier',
      reserva.fechaReserva ? new Date(reserva.fechaReserva).toISOString().slice(0, 10) : ''
    ]);

    this.csvExportService.exportarCSV(encabezado, filas, 'books.csv');
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
