import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { NewsletterService } from '../../../services/newsletter/newsletter';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Newsletter } from '../../../models/newsletter.model';

@Component({
  selector: 'app-newsletter-dashboard',
  standalone: true,
  templateUrl: './newsletter-dashboard.html',
  styleUrls: ['./newsletter-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class NewsletterDashboard implements OnInit {
  loading = false;

  newsletters: Newsletter[] = [];
  paginaActual: number = 1;
  newsletterEditando: Newsletter | null = null;
  esNuevo: boolean = false;

  constructor(
    private newsletterService: NewsletterService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerNewsletters();
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

    if (this.esNuevo) {
      this.newsletterService.crearNewsletter(this.newsletterEditando).subscribe(() => {
        this.obtenerNewsletters();
        this.newsletterEditando = null;
        this.esNuevo = false;
      });
    } else {
      this.newsletterService.actualizarNewsletter(this.newsletterEditando).subscribe(() => {
        this.obtenerNewsletters();
        this.newsletterEditando = null;
        this.esNuevo = false;
      });
    }
  }

  eliminarNewsletter(id: number) {
    if (confirm('¿Estás seguro de eliminar este newsletter?')) {
      this.newsletterService.eliminarNewsletter(id).subscribe(() => {
        this.obtenerNewsletters();
      });
    }
  }

  exportarCSV() {
    const encabezado = ['ID', 'Email', 'Register date', 'Estate'];
    const filas = this.newsletters.map(newsletter => [
      newsletter.id,
      newsletter.email,
      newsletter.fechaRegistro.toString(),
      newsletter.estado ? 'Activo' : 'Inactivo'
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'newsletter.csv');
  }
}
