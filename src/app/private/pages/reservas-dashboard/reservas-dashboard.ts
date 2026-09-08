import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReservasService } from '../../../services/curso-compra/curso-compra';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Reservas } from '../../../models/curso-compra.model';
import { CursoFechaService } from '../../../services/curso-fecha/curso-fecha';
import { CursoFecha } from '../../../models/cursoFecha.model';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';


@Component({
  selector: 'app-reservas-dashboard',
  standalone: true,
  templateUrl: './reservas-dashboard.html',
  styleUrls: ['./reservas-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, FeedbackModalComponent]
})
export class ReservasDashboard implements OnInit {
  loading = false;

  reservas: Reservas[] = [];
  paginaActual: number = 1;
  reservaEditando: Reservas | null = null;
  esNuevo: boolean = false;

  // Fechas disponibles del curso de la reserva que se está editando (para reprogramar)
  fechasDisponibles: CursoFecha[] = [];

  // Modal de feedback
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  constructor(
    private reservasService: ReservasService,
    private csvExportService: CsvExportService,
    private cursoFechaService: CursoFechaService
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

  crearReserva() {
    this.esNuevo = true;
    this.reservaEditando = {
      id: 0,
      idCliente: '',
      idFecha: 0,
      idCurso: 0,
      plazasReservadas: 0,
      fechaReserva: new Date(),
      nombreCurso: '',
      fechaCurso: '',
      nombreCliente: '',
      telefono: '',
      email: '',
      pagado: true
    };
  }

  editarReserva(reserva: Reservas) {
    this.esNuevo = false;
    this.reservaEditando = { ...reserva };
    this.fechasDisponibles = [];

    this.cursoFechaService.getCursoFechaPorIdCurso(reserva.idCurso).subscribe({
      next: fechas => {
        this.fechasDisponibles = fechas;
      },
      error: err => {
        console.error('Error al cargar las fechas disponibles del curso', err);
      }
    });
  }

  cancelarEdicion() {
    this.reservaEditando = null;
    this.esNuevo = false;
    this.fechasDisponibles = [];
  }

  guardarCambios() {
    if (!this.reservaEditando) return;

    if (this.esNuevo) {
      this.reservasService.crearReserva(this.reservaEditando).subscribe(() => {
        this.obtenerReservas();
        this.reservaEditando = null;
        this.esNuevo = false;
      });
    } else {
      this.reservasService.actualizarReserva(this.reservaEditando).subscribe({
        next: () => {
          this.obtenerReservas();
          this.reservaEditando = null;
          this.mostrarModalFeedback('success', 'Saved', 'Booking updated successfully.');
        },
        error: err => {
          console.error('Error updating booking', err);
          const mensaje = typeof err?.error === 'string' ? err.error : 'Could not update the booking.';
          this.mostrarModalFeedback('error', 'Error updating', mensaje);
        }
      });
    }
  }

  cancelarReserva(reserva: Reservas) {
    if (!confirm(`Are you sure you want to cancel the booking for ${reserva.email}? This will free up the reserved seats.`)) {
      return;
    }

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
