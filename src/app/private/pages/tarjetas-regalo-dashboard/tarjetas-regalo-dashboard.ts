import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { TarjetaRegaloCompra } from '../../../models/tarjetaRegalo-compra.model';

import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { TarjetaRegaloCompraService } from '../../../services/tarjetaRegalo-compra/tarjetaRegaloCompra';
import { CsvExportService } from '../../../services/csv/csv-export';

import { isWebpFile, isTooLarge, fileToDataUrl } from '../../../utils/image-optimizer.util';
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
  // Loading
  loading = false;           // tarjetas
  loadingCompras = false;    // compras

  // límites imagen
  private readonly IMG_LIMIT_BYTES = 800 * 1024; // 800 KB
  private readonly IMG_MAX_W = 1600;
  private readonly IMG_MAX_H = 1600;

  // Modal feedback
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  // Tarjetas regalo
  tarjetas: TarjetaRegalo[] = [];
  paginaActual: number = 1;
  tarjetaEditando: TarjetaRegalo | null = null;
  esNueva: boolean = false;

  // Slot único de imagen
  imgSlot: SlotImagen = { previewUrl: null, markedForDelete: false };

  // Compras de tarjetas
  tarjetasCompra: TarjetaRegaloCompra[] = [];
  paginaActualCompras: number = 1;

  constructor(
    private tarjetaService: TarjetaRegaloService,
    private csvExportService: CsvExportService,
    private tarjetaCompraService: TarjetaRegaloCompraService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadingCompras = true;
    this.obtenerTarjetas();
    this.obtenerTarjetasCompra();
  }

  // ===== TARJETAS =====
  obtenerTarjetas() {
    this.tarjetaService.getTarjetas().subscribe({
      next: data => {
        this.tarjetas = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar tarjetas', err);
        this.loading = false;
        this.mostrarModalFeedback('error', 'Error loading gift cards', 'Could not load gift cards.');
      }
    });
  }

  crearTarjeta() {
    this.esNueva = true;
    this.tarjetaEditando = {
      id: 0,
      nombre: '',
      precio: 0,
      img: ''
    } as TarjetaRegalo;

    this.imgSlot = { previewUrl: null, markedForDelete: false };
  }

  editarTarjeta(tarjeta: TarjetaRegalo) {
    this.esNueva = false;
    this.tarjetaEditando = { ...tarjeta };
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
    input.value = '';

    if (!isWebpFile(original)) {
      this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
      return;
    }
    if (isTooLarge(original, this.IMG_LIMIT_BYTES)) {
      this.mostrarModalFeedback('error', 'Image too large', `The image must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`);
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

    if (this.imgSlot.file) {
      if (!isWebpFile(this.imgSlot.file)) {
        this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
        return;
      }
      if (isTooLarge(this.imgSlot.file, this.IMG_LIMIT_BYTES)) {
        this.mostrarModalFeedback('error', 'Image too large', `The image must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`);
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
      this.tarjetaService.eliminarTarjeta(id).subscribe({
        next: () => {
          this.obtenerTarjetas();
          this.mostrarModalFeedback('success', 'Gift card deleted', 'The gift card has been deleted successfully.');
        },
        error: err => {
          console.error('Error eliminando tarjeta', err);
          this.mostrarModalFeedback('error', 'Error deleting', 'There was a problem deleting the gift card.');
        }
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

  getImgUrl(id: number): string {
    return this.tarjetaService.getImagenUrl(id);
  }

  // ===== COMPRAS TARJETAS =====
  obtenerTarjetasCompra() {
    this.tarjetaCompraService.getTarjetas().subscribe({
      next: data => {
        this.tarjetasCompra = data || [];
        this.loadingCompras = false;
      },
      error: err => {
        console.error('Error al cargar tarjetas compra', err);
        this.loadingCompras = false;
        this.mostrarModalFeedback('error', 'Error loading purchases', 'Could not load gift card purchases.');
      }
    });
  }

  exportarCSVCompras() {
    const encabezado = ['ID', 'Code', 'Recipient', 'Redeemed', 'Purchase', 'Expires'];
    const filas = (this.tarjetasCompra || []).map(c => [
      c.id?.toString() ?? '',
      c.codigo ?? '',
      c.destinatario ?? '',
      c.canjeada ? 'Yes' : 'No',
      c.fechaCompra ?? '',
      c.fechaCaducidad ?? ''
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'gift-card-purchases.csv');
  }

marcarCanjeada(compra: TarjetaRegaloCompra) {
  if (!compra?.id || compra.canjeada) return;

  const confirmar = confirm(
    `Are you sure you want to mark the code ${compra.codigo} as redeemed?\nThis action cannot be undone.`
  );

  if (!confirmar) return;

  this.tarjetaCompraService.marcarCanjeada(compra.id).subscribe({
    next: () => {
      compra.canjeada = true;
      this.mostrarModalFeedback(
        'success',
        'Marked as redeemed',
        `Code ${compra.codigo} marked as redeemed.`
      );
    },
    error: err => {
      console.error('Error marked as redeemed', err);
      this.mostrarModalFeedback(
        'error',
        'Error',
        'Could not mark as redeemed.'
      );
    }
  });
}


eliminarCompra(id: number) {
  if (!id) return;

  if (confirm('Are you sure you want to delete this gift card purchase? This action cannot be undone.')) {
    this.tarjetaCompraService.eliminarCompra(id).subscribe({
      next: () => {
        this.obtenerTarjetasCompra();
        this.mostrarModalFeedback(
          'success',
          'Deleted',
          'Purchase deleted successfully.'
        );
      },
      error: err => {
        console.error('Error deleting purchase', err);
        this.mostrarModalFeedback(
          'error',
          'Error deleting',
          'Could not delete the purchase.'
        );
      }
    });
  }
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
