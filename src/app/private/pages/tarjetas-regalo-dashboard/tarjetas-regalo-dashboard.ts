import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { CsvExportService } from '../../../services/csv/csv-export';

type SlotImagen = {
  previewUrl: string | null;
  file?: File;
  markedForDelete: boolean;
};

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

  // Slot único de imagen
  imgSlot: SlotImagen = { previewUrl: null, markedForDelete: false };

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
      nombre: '',
      precio: 0,
      img: '' // no se usa en multipart; sólo por tipado del modelo si existe
    } as TarjetaRegalo;

    // Reset slot
    this.imgSlot = { previewUrl: null, markedForDelete: false };
  }

  editarTarjeta(tarjeta: TarjetaRegalo) {
    this.esNueva = false;
    this.tarjetaEditando = { ...tarjeta };

    // Mostrar la imagen del servidor si existe id
    this.imgSlot = {
      previewUrl: tarjeta.id ? this.getImgUrl(tarjeta.id) : null,
      markedForDelete: false
    };
  }

  cancelarEdicion() {
    this.tarjetaEditando = null;
    this.esNueva = false;
    this.imgSlot = { previewUrl: null, markedForDelete: false };
  }

  onSeleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.imgSlot.file = file;
    this.imgSlot.markedForDelete = false;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imgSlot.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    // permitir re-seleccionar el mismo archivo
    input.value = '';
  }

  eliminarImagen() {
    this.imgSlot.file = undefined;
    this.imgSlot.previewUrl = null;
    this.imgSlot.markedForDelete = true;
  }

  restaurarImagen() {
    if (!this.tarjetaEditando || this.esNueva || !this.tarjetaEditando.id) return;
    this.imgSlot.file = undefined;
    this.imgSlot.previewUrl = this.getImgUrl(this.tarjetaEditando.id);
    this.imgSlot.markedForDelete = false;
  }

  guardarCambios() {
    if (!this.tarjetaEditando) return;

    const fd = this.tarjetaService.buildFormData(
      this.tarjetaEditando,
      this.imgSlot.file,
      this.imgSlot.markedForDelete
    );

    const req$ = this.esNueva
      ? this.tarjetaService.crearTarjeta(fd)
      : this.tarjetaService.actualizarTarjeta(this.tarjetaEditando.id!, fd);

    req$.subscribe({
      next: () => {
        this.obtenerTarjetas();
        this.cancelarEdicion();
      },
      error: err => console.error('Error guardando tarjeta', err)
    });
  }

  eliminarTarjeta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta tarjeta regalo?')) {
      this.tarjetaService.eliminarTarjeta(id).subscribe(() => {
        this.obtenerTarjetas();
      });
    }
  }

  exportarCSV() {
    const encabezado = ['ID', 'Name', 'Price'];
    const filas = this.tarjetas.map(t => [
      t.id?.toString() ?? '',
      t.nombre ?? '',
      (t.precio ?? 0).toString()
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'gift-cards.csv');
  }

  // Para usar en el template sin exponer el service
  getImgUrl(id: number): string {
    return this.tarjetaService.getImagenUrl(id);
  }
}
