import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { CsvExportService } from '../../../services/csv/csv-export';
import { isWebpFile, isTooLarge, fileToDataUrl, convertToWebPUnderLimit } from '../../../utils/image-optimizer.util';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';

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
  imports: [CommonModule, FormsModule, NgxPaginationModule, FeedbackModalComponent]
})
export class TarjetasRegaloDashboard implements OnInit {
  loading = false;

  // límites imagen
  private readonly IMG_LIMIT_BYTES = 800 * 1024; // 800 KB
  private readonly IMG_MAX_W = 1600;
  private readonly IMG_MAX_H = 1600;

  // Modal feedback
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';


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

  mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
  this.feedbackTipo = tipo;
  this.feedbackTitulo = titulo;
  this.feedbackMensaje = mensaje;
  this.mostrarFeedback = true;
  }
  cerrarFeedback() {
    this.mostrarFeedback = false;
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

  async onSeleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const original = input.files[0];
    input.value = ''; // permitir re-seleccionar

    // Solo WebP
    if (!isWebpFile(original)) {
      this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
      return;
    }
    // ≤ 800 KB
    if (isTooLarge(original, this.IMG_LIMIT_BYTES)) {
      this.mostrarModalFeedback(
        'error',
        'Image too large',
        `The image must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`
      );
      return;
    }

    this.imgSlot.file = original;
    this.imgSlot.markedForDelete = false;
    this.imgSlot.previewUrl = await fileToDataUrl(original);
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

  // Doble validación estricta
  if (this.imgSlot.file) {
    if (!isWebpFile(this.imgSlot.file)) {
      this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
      return;
    }
    if (isTooLarge(this.imgSlot.file, this.IMG_LIMIT_BYTES)) {
      this.mostrarModalFeedback(
        'error',
        'Image too large',
        `The image must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`
      );
      return;
    }
  }

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
      this.mostrarModalFeedback('success', 'Gift card saved', 'The gift card has been saved successfully.');
    },
    error: err => {
      console.error('Error guardando tarjeta', err);
      this.mostrarModalFeedback('error', 'Error saving', 'Please review fields or try again.');
    }
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
