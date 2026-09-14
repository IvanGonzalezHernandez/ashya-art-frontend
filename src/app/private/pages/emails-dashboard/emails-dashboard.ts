import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxPaginationModule } from 'ngx-pagination';

import { EmailEnviadoService, UsoResend } from '../../../services/email-enviado/email-enviado';
import { CsvExportService } from '../../../services/csv/csv-export';
import { EmailEnviado, EmailEnviadoDetalle } from '../../../models/email-enviado.model';

@Component({
  selector: 'app-emails-dashboard',
  standalone: true,
  templateUrl: './emails-dashboard.html',
  styleUrls: ['./emails-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class EmailsDashboard implements OnInit {
  loading = false;
  loadingMas = false;
  error = false;

  emails: EmailEnviado[] = [];
  hasMore = false;
  paginaActual: number = 1;

  // USO DE RESEND (plan gratuito: cuota diaria y mensual)
  uso: UsoResend | null = null;
  loadingUso = false;

  // FILTROS
  filtroTexto: string = '';
  filtroEstado: string = '';

  get estados(): string[] {
    return Array.from(new Set((this.emails || []).map(e => e.last_event || 'unknown'))).sort();
  }

  get emailsFiltrados(): EmailEnviado[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    return (this.emails || []).filter(e => {
      const coincideTexto = !texto ||
        e.to.join(', ').toLowerCase().includes(texto) ||
        (e.subject ?? '').toLowerCase().includes(texto);
      const coincideEstado = !this.filtroEstado || (e.last_event || 'unknown') === this.filtroEstado;
      return coincideTexto && coincideEstado;
    });
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  // Modal de previsualización
  emailSeleccionado: EmailEnviadoDetalle | null = null;
  cargandoDetalle = false;
  errorDetalle = false;
  htmlSeguro: SafeHtml | null = null;

  constructor(
    private emailEnviadoService: EmailEnviadoService,
    private csvExportService: CsvExportService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = false;

    this.cargarUso();

    this.emailEnviadoService.listarEmails(100).subscribe({
      next: res => {
        this.emails = res.data;
        this.hasMore = res.has_more;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar emails de Resend', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  cargarMasAntiguos() {
    if (!this.hasMore || this.emails.length === 0 || this.loadingMas) return;

    this.loadingMas = true;
    const ultimoId = this.emails[this.emails.length - 1].id;

    this.emailEnviadoService.listarEmails(100, ultimoId).subscribe({
      next: res => {
        this.emails = [...this.emails, ...res.data];
        this.hasMore = res.has_more;
        this.loadingMas = false;
      },
      error: err => {
        console.error('Error al cargar más emails de Resend', err);
        this.loadingMas = false;
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

  verEmail(email: EmailEnviado) {
    this.emailSeleccionado = { ...email };
    this.cargandoDetalle = true;
    this.errorDetalle = false;
    this.htmlSeguro = null;

    this.emailEnviadoService.obtenerEmail(email.id).subscribe({
      next: detalle => {
        this.emailSeleccionado = detalle;
        this.htmlSeguro = this.sanitizer.bypassSecurityTrustHtml(
          detalle.html || '<p class="text-muted">This email has no HTML content.</p>'
        );
        this.cargandoDetalle = false;
      },
      error: err => {
        console.error('Error al cargar el detalle del email', err);
        this.errorDetalle = true;
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarModal() {
    this.emailSeleccionado = null;
    this.htmlSeguro = null;
  }

  exportarCSV() {
    const encabezado = ['Recipient', 'Subject', 'Sent', 'Status'];
    const filas = this.emailsFiltrados.map(email => [
      email.to.join(', '),
      email.subject,
      email.created_at,
      email.last_event || 'unknown'
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'Sent_Emails');
  }

  estadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'delivered':
      case 'opened':
      case 'clicked':
        return 'bg-success';
      case 'bounced':
      case 'complained':
      case 'failed':
        return 'bg-danger';
      case 'delivery_delayed':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }
}
