import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReservasService } from '../../../services/curso-compra/curso-compra';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Reservas } from '../../../models/curso-compra.model';
 
import { FullCalendarModule } from '@fullcalendar/angular';
import type { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-reservas-dashboard',
  standalone: true,
  templateUrl: './reservas-dashboard.html',
  styleUrls: ['./reservas-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, FullCalendarModule]
})
export class ReservasDashboard implements OnInit {
  reservas: Reservas[] = [];
  paginaActual: number = 1;
  reservaEditando: Reservas | null = null;
  esNuevo: boolean = false;
  
calendarOptions: CalendarOptions = {
  initialView: 'dayGridMonth',
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    right: 'prev,next'
  },
  events: [], 
  height: 600,       // Altura fija para que no ocupe mucho espacio
  aspectRatio: 1.3,  // Más compacto
  weekends: true,
  dayMaxEventRows: true,
  nowIndicator: true,
  selectable: true,
};

  constructor(
    private reservasService: ReservasService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.obtenerReservas();
  }

  obtenerReservas() {
    this.reservasService.getReservas().subscribe(data => {
      this.reservas = data;

      // Actualiza los eventos del calendario
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.reservas.map(r => ({
          id: r.id.toString(),
          title: `${r.nombreCliente} - (${r.plazasReservadas} plazas)`,
          start: r.fechaCurso,
          allDay: true
        }))
      };
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
    const filas = this.reservas.map(reserva => [
      reserva.id,
      reserva.nombreCliente,
      reserva.idFecha,
      reserva.plazasReservadas,
      reserva.fechaReserva.toISOString().slice(0, 10)
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'books.csv');
  }
}
