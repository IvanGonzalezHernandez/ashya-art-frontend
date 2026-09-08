import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxPaginationModule } from 'ngx-pagination';

import { EmailEnviadoService } from '../../../services/email-enviado/email-enviado';
import { CsvExportService } from '../../../services/csv/csv-export';
import { EmailEnviado, EmailEnviadoDetalle } from '../../../models/email-enviado.model';

@Component({
  selector: 'app-emails-dashboard',
  standalone: true,
  templateUrl: './emails-dashboard.html',
  styleUrls: ['./emails-dashboard.scss'],
  imports: [CommonModule, NgxPaginationModule]
})
export class EmailsDashboard implements OnInit {
  loading = false;
  loadingMas = false;
  error = false;

  emails: EmailEnviado[] = [];
  hasMore = false;
  paginaActual: number = 1;

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
    const filas = this.emails.map(email => [
      email.to.join(', '),
      email.subject,
      email.created_at,
      email.last_event || 'unknown'
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'sent-emails.csv');
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
