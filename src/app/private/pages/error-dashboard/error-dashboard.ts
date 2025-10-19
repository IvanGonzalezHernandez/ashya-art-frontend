import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ErrorLogService } from '../../../services/error/error';
import { ErrorDto } from '../../../models/error.model';
import { CsvExportService } from '../../../services/csv/csv-export';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';

@Component({
  selector: 'app-error-dashboard',
  standalone: true,
  templateUrl: './error-dashboard.html',
  styleUrls: ['./error-dashboard.scss'],
  imports: [CommonModule, NgxPaginationModule, FeedbackModalComponent],
  providers: [DatePipe]
})
export class ErrorDashboard implements OnInit {
  // Loading
  loading = false;

  // Feedback
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  // Datos
  errores: ErrorDto[] = [];
  paginaActual = 1;

  constructor(
    private errorLogService: ErrorLogService,
    private csvExportService: CsvExportService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerErrores();
  }

  obtenerErrores(): void {
    this.errorLogService.getErrores().subscribe({
      next: (data) => {
        // Normaliza fechas si vienen como string ISO
        this.errores = (data || []).map(e => ({
          ...e,
          fechaCreacion: e.fechaCreacion
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar errores', err);
        this.loading = false;
        this.mostrarModalFeedback('error', 'Error loading errors', 'Could not load errors from server.');
      }
    });
  }

  exportarCSV(): void {
    const encabezado = [
      'ID', 'Date', 'Class', 'Method', 'Line', 'HTTP', 'Path', 'Env', 'Server', 'Hash', 'Message'
    ];

    const filas = (this.errores || []).map(e => [
      e.id?.toString() ?? '',
      this.datePipe.transform(e.fechaCreacion, 'yyyy-MM-dd HH:mm') ?? '',
      e.claseError ?? '',
      e.metodoError ?? '',
      e.lineaError != null ? String(e.lineaError) : '',
      e.metodoHttp ?? '',
      e.rutaPeticion ?? '',
      e.entorno ?? '',
      e.servidor ?? '',
      e.hashTraza ?? '',
      (e.mensajeError || '').replace(/\s+/g, ' ').trim()
    ]);

    this.csvExportService.exportarCSV(encabezado, filas, 'errors.csv');
  }

  // ===== FEEDBACK =====
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
