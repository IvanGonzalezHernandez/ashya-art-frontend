import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReservasService } from '../../../services/curso-compra/curso-compra';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Reservas } from '../../../models/curso-compra.model';


@Component({
  selector: 'app-reservas-dashboard',
  standalone: true,
  templateUrl: './reservas-dashboard.html',
  styleUrls: ['./reservas-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class ReservasDashboard implements OnInit {
  loading = false;
  
  reservas: Reservas[] = [];
  paginaActual: number = 1;
  reservaEditando: Reservas | null = null;
  esNuevo: boolean = false;
  

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

  crearReserva() {
    this.esNuevo = true;
    this.reservaEditando = {
      id: 0,
      idCliente: '',
      idFecha: 0,
      plazasReservadas: 0,
      fechaReserva: new Date(),
      nombreCurso: '',
      fechaCurso: '',
      nombreCliente: ''
    };
  }

  editarReserva(reserva: Reservas) {
    this.esNuevo = false;
    this.reservaEditando = { ...reserva };
  }

  cancelarEdicion() {
    this.reservaEditando = null;
    this.esNuevo = false;
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
      this.reservasService.actualizarReserva(this.reservaEditando).subscribe(() => {
        this.obtenerReservas();
        this.reservaEditando = null;
        this.esNuevo = false;
      });
    }
  }

  eliminarReserva(id: number) {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      this.reservasService.eliminarReserva(id).subscribe(() => {
        this.obtenerReservas();
      });
    }
  }

  exportarCSV() {
    const encabezado = ['ID', 'Client', 'ID Fecha', 'Plazas Reservadas', 'Fecha Reserva'];
    const filas = (this.reservas || []).map(reserva => [
      reserva.id,
      reserva.nombreCliente ?? '',
      reserva.idFecha,
      reserva.plazasReservadas ?? 0,
      reserva.fechaReserva ? reserva.fechaReserva.toString() : '' // <- toString aquí
    ]);

    this.csvExportService.exportarCSV(encabezado, filas, 'books.csv');
  }

}
