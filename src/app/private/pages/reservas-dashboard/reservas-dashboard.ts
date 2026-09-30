import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReservasService } from '../../../services/curso-compra/curso-compra';
import { CursoFechaService } from '../../../services/curso-fecha/curso-fecha';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Reservas } from '../../../models/curso-compra.model';
import { CursoFecha } from '../../../models/cursoFecha.model';
import { telHref } from '../../../utils/telefono.util';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';


@Component({
  selector: 'app-reservas-dashboard',
  standalone: true,
  templateUrl: './reservas-dashboard.html',
  styleUrls: ['./reservas-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, FeedbackModalComponent, ConfirmModalComponent]
})
export class ReservasDashboard implements OnInit {
  readonly telHref = telHref;

  loading = false;

  reservas: Reservas[] = [];
  paginaActual: number = 1;

  // FILTROS
  filtroTexto: string = '';
  filtroPago: string = '';

  get reservasFiltradas(): Reservas[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    return (this.reservas || []).filter(r => {
      const coincideTexto = !texto ||
        (r.email ?? '').toLowerCase().includes(texto) ||
        (r.nombreCurso ?? '').toLowerCase().includes(texto);
      const coincidePago = !this.filtroPago ||
        (this.filtroPago === 'paid' && r.pagado) ||
        (this.filtroPago === 'atelier' && !r.pagado);
      return coincideTexto && coincidePago;
    });
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  // Modal de confirmación de cancelación
  reservaACancelar: Reservas | null = null;

  // Modal de cambio de fecha: solo fechas futuras del mismo curso
  reservaAMover: Reservas | null = null;
  fechasDisponibles: CursoFecha[] = [];
  idFechaSeleccionada: number | null = null;
  cargandoFechas = false;
  guardandoCambioFecha = false;

  // Modal de feedback
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  constructor(
    private reservasService: ReservasService,
    private cursoFechaService: CursoFechaService,
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

  abrirCambioFecha(reserva: Reservas) {
    this.reservaAMover = reserva;
    this.fechasDisponibles = [];
    this.idFechaSeleccionada = null;
    this.cargandoFechas = true;

    this.cursoFechaService.getCursoFechaPorIdCurso(reserva.idCurso).subscribe({
      next: fechas => {
        this.fechasDisponibles = fechas.filter(f => f.id !== reserva.idFecha);
        this.cargandoFechas = false;
      },
      error: err => {
        console.error('Error loading course dates', err);
        this.cargandoFechas = false;
      }
    });
  }

  cerrarCambioFecha() {
    this.reservaAMover = null;
  }

  tieneSitio(fecha: CursoFecha): boolean {
    return !!this.reservaAMover && fecha.plazasDisponibles >= this.reservaAMover.plazasReservadas;
  }

  confirmarCambioFecha() {
    const reserva = this.reservaAMover;
    if (!reserva || this.idFechaSeleccionada == null) return;
    this.guardandoCambioFecha = true;

    this.reservasService.cambiarFecha(reserva.id, this.idFechaSeleccionada).subscribe({
      next: actualizada => {
        this.guardandoCambioFecha = false;
        this.reservaAMover = null;
        this.obtenerReservas();
        this.mostrarModalFeedback('success', 'Date changed',
          `Booking moved to ${actualizada.fechaCurso}. An email has been sent to ${reserva.email}.`);
      },
      error: err => {
        console.error('Error changing booking date', err);
        this.guardandoCambioFecha = false;
        this.reservaAMover = null;
        const detalle = typeof err?.error === 'string' && err.error ? err.error : 'Could not change the booking date.';
        this.mostrarModalFeedback('error', 'Error', detalle);
      }
    });
  }

  exportarCSV() {
    const encabezado = ['Client', 'Course', 'Date', 'Reserved Seats', 'Unit Price', 'Payment', 'Book Date'];
    const filas = this.reservasFiltradas.map(reserva => [
      reserva.email ?? '',
      reserva.nombreCurso ?? '',
      reserva.fechaCurso ?? '',
      reserva.plazasReservadas ?? 0,
      reserva.precio ?? '',
      reserva.pagado ? 'Paid' : 'Atelier',
      reserva.fechaReserva ? this.formatearFechaLocal(reserva.fechaReserva) : ''
    ]);

    this.csvExportService.exportarCSV(encabezado, filas, 'Bookings');
  }

  /**
   * Formatea una fecha como yyyy-MM-dd en la zona horaria local, igual que el pipe
   * `date:'yyyy-MM-dd'` de la tabla. new Date(...).toISOString() convierte a UTC y
   * puede mostrar un día distinto al de la tabla para horas cercanas a medianoche.
   */
  private formatearFechaLocal(fecha: string | Date): string {
    const d = new Date(fecha);
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
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
