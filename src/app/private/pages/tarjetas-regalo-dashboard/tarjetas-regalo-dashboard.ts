import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { CsvExportService } from '../../../services/csv/csv-export';

@Component({
  selector: 'app-tarjetas-regalo-dashboard',
  standalone: true,
  templateUrl: './tarjetas-regalo-dashboard.html',
  styleUrls: ['./tarjetas-regalo-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class TarjetasRegaloDashboard implements OnInit {
  loading = false;

  tarjetas: TarjetaRegalo[] = [];
  paginaActual: number = 1;
  tarjetaEditando: TarjetaRegalo | null = null;
  esNueva: boolean = false;

  constructor(
    private tarjetaService: TarjetaRegaloService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerTarjetas();
  }

  obtenerTarjetas() {
    this.loading = true;
    this.tarjetaService.getTarjetas().subscribe({
      next: data => {
        this.tarjetas = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar tarjetas', err);
        this.loading = false;
      }
    });
  }

  crearTarjeta() {
    this.esNueva = true;
    this.tarjetaEditando = {
      id: 0,
      idReferencia: '',
      nombre: '',
      precio: 0,
      img: ''
    };
  }

  editarTarjeta(tarjeta: TarjetaRegalo) {
    this.esNueva = false;
    this.tarjetaEditando = { ...tarjeta };
  }

  cancelarEdicion() {
    this.tarjetaEditando = null;
    this.esNueva = false;
  }

  guardarCambios() {
    if (!this.tarjetaEditando) return;

    if (this.esNueva) {
      this.tarjetaService.crearTarjeta(this.tarjetaEditando).subscribe(() => {
        this.obtenerTarjetas();
        this.cancelarEdicion();
      });
    } else {
      this.tarjetaService.actualizarTarjeta(this.tarjetaEditando).subscribe(() => {
        this.obtenerTarjetas();
        this.cancelarEdicion();
      });
    }
  }

  eliminarTarjeta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta tarjeta regalo?')) {
      this.tarjetaService.eliminarTarjeta(id).subscribe(() => {
        this.obtenerTarjetas();
      });
    }
  }

  exportarCSV() {
    const encabezado = ['ID', 'Reference', 'Name', 'Price', 'Image'];
    const filas = this.tarjetas.map(tarjetaRegalo => [
      tarjetaRegalo.id,
      tarjetaRegalo.idReferencia,
      tarjetaRegalo.nombre,
      tarjetaRegalo.precio,
      tarjetaRegalo.img
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'gift-cards.csv');
  }
}
