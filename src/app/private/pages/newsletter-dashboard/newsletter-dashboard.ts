import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { NewsletterService } from '../../../services/newsletter/newsletter';
import { CsvExportService } from '../../../services/csv/csv-export';
import { EmailEnviadoService, UsoResend } from '../../../services/email-enviado/email-enviado';
import { Newsletter } from '../../../models/newsletter.model';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';

@Component({
  selector: 'app-newsletter-dashboard',
  standalone: true,
  templateUrl: './newsletter-dashboard.html',
  styleUrls: ['./newsletter-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, FeedbackModalComponent]
})
export class NewsletterDashboard implements OnInit {
  loading = false;

  // Modal de feedback
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  newsletters: Newsletter[] = [];
  paginaActual: number = 1;
  newsletterEditando: Newsletter | null = null;
  esNuevo: boolean = false;

  // USO DE RESEND (plan gratuito: cuota diaria y mensual)
  uso: UsoResend | null = null;
  loadingUso = false;

  // FILTROS
  filtroTexto: string = '';
  filtroEstado: string = '';

  get newslettersFiltrados(): Newsletter[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    return (this.newsletters || []).filter(n => {
      const coincideTexto = !texto || (n.email ?? '').toLowerCase().includes(texto);
      const coincideEstado = !this.filtroEstado ||
        (this.filtroEstado === 'active' && n.estado) ||
        (this.filtroEstado === 'inactive' && !n.estado);
      return coincideTexto && coincideEstado;
    });
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  constructor(
    private newsletterService: NewsletterService,
    private csvExportService: CsvExportService,
    private emailEnviadoService: EmailEnviadoService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerNewsletters();
    this.cargarUso();
  }

  obtenerNewsletters() {
    this.loading = true;
    this.newsletterService.getNewsletters().subscribe({
      next: data => {
        this.newsletters = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar newsletters', err);
        this.loading = false;
      }
    });
  }

  cargarUso(): void {
    this.loadingUso = true;
    this.emailEnviadoService.obtenerUso().subscribe({
      next: uso => {
        this.uso = uso;
        this.loadingUso = false;
      },
      error: err => {
        console.error('Error al cargar la cuota de Resend', err);
        this.loadingUso = false;
      }
    });
  }

  porcentajeUso(usado: number, limite: number): number {
    if (!limite) return 0;
    return Math.min(100, Math.round((usado / limite) * 100));
  }

  colorBarraUso(usado: number, limite: number): string {
    const pct = this.porcentajeUso(usado, limite);
    if (pct >= 90) return 'bg-danger';
    if (pct >= 70) return 'bg-warning';
    return 'bg-azul';
  }

  crearNewsletter() {
    this.esNuevo = true;
    this.newsletterEditando = {
      id: 0,
      email: '',
      fechaRegistro: new Date(),
      estado: true
    };
  }

  editarNewsletter(newsletter: Newsletter) {
    this.esNuevo = false;
    this.newsletterEditando = { ...newsletter };
  }

  cancelarEdicion() {
    this.newsletterEditando = null;
    this.esNuevo = false;
  }

  guardarCambios() {
  if (!this.newsletterEditando) return;

  const payload = { ...this.newsletterEditando };

  if (this.esNuevo) {
    this.newsletterService.crearNewsletter(payload).subscribe({
      next: () => {
        this.obtenerNewsletters();
        this.newsletterEditando = null;
        this.esNuevo = false;
        this.mostrarModalFeedback('success', 'Saved', 'Newsletter created successfully.');
      },
      error: (e) => {
        console.error(e);
        this.mostrarModalFeedback('error', 'Error', 'Could not create the newsletter. Please try again.');
      }
    });
  } else {
    this.newsletterService.actualizarNewsletter(payload).subscribe({
      next: () => {
        this.obtenerNewsletters();
        this.newsletterEditando = null;
        this.esNuevo = false;
        this.mostrarModalFeedback('success', 'Saved', 'Newsletter updated successfully.');
      },
      error: (e) => {
        console.error(e);
        this.mostrarModalFeedback('error', 'Error', 'Could not update the newsletter. Please try again.');
      }
    });
  }
}

eliminarNewsletter(id: number) {
  if (!confirm('Are you sure you want to delete this newsletter?')) return;

  this.newsletterService.eliminarNewsletter(id).subscribe({
    next: () => {
      this.obtenerNewsletters();
      this.mostrarModalFeedback('success', 'Deleted', 'Newsletter deleted successfully.');
    },
    error: (e) => {
      console.error(e);
      this.mostrarModalFeedback('error', 'Error', 'Could not delete the newsletter. Please try again.');
    }
  });
}


  private mostrarModalFeedback(
  tipo: 'success' | 'error' | 'info',
  titulo: string,
  mensaje: string
  ) {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }

  cerrarFeedback() {
    this.mostrarFeedback = false;
  }

  exportarCSV() {
    const encabezado = ['Email', 'Registration Date', 'Status'];
    const filas = this.newslettersFiltrados.map(newsletter => [
      newsletter.email,
      newsletter.fechaRegistro.toString(),
      newsletter.estado ? 'Active' : 'Inactive'
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'Newsletter');
  }
}
