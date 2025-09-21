import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { ProductoService } from '../../../services/producto/producto';
import { ProductoCompraService } from '../../../services/producto-compra/producto-compra';
import { CsvExportService } from '../../../services/csv/csv-export';

import { Producto } from '../../../models/producto.model';
import { ProductoCompra } from '../../../models/producto-compra.model';
import { convertToWebPUnderLimit, fileToDataUrl, isTooLarge, isWebpFile } from '../../../utils/image-optimizer.util';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';

// === Slots, igual que en cursos ===
type SlotImagen = {
  slot: number;               // 1..5
  previewUrl: string | null;  // dataURL o URL del backend
  file?: File;                // archivo local seleccionado
  markedForDelete: boolean;   // marcar para borrado al editar
};

@Component({
  selector: 'app-productos-dashboard',
  standalone: true,
  templateUrl: './productos-dashboard.html',
  styleUrls: ['./productos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, FeedbackModalComponent]
})
export class ProductosDashboard implements OnInit {
  loading = false;
  productosCargados = false;
  comprasCargadas = false;

    // LÍMITES DE IMAGEN
  private readonly IMG_LIMIT_BYTES = 800 * 1024; // 800 KB
  private readonly IMG_MAX_W = 1600;
  private readonly IMG_MAX_H = 1600;

  // FEEDBACK MODAL
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  // SLOTS (igual que cursos)
  slots: SlotImagen[] = [];

  // Productos
  productos: Producto[] = [];
  paginaActualProducto: number = 1;
  productoEditando: Producto | null = null;
  esNuevoProducto: boolean = false;

  // Compras
  compras: ProductoCompra[] = [];
  paginaActualCompra: number = 1;
  compraEditando: ProductoCompra | null = null;
  esNuevoCompra: boolean = false;

  constructor(
    private productoService: ProductoService,
    private productoCompraService: ProductoCompraService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerProductos();
    this.obtenerCompras();
  }

  // --- MÉTODOS PRODUCTOS ---

  obtenerProductos() {
    this.productoService.getProductos().subscribe({
      next: data => {
        this.productos = data;
        this.productosCargados = true;
        this.comprobarCargaCompleta();
      },
      error: err => {
        console.error('Error al cargar productos', err);
        this.productosCargados = true;
        this.comprobarCargaCompleta();
      }
    });
  }

  /** Inicializa los 5 slots; si hay id, precarga las URLs de backend para restore/preview */
  private initSlots(productoId?: number) {
    this.slots = Array.from({ length: 5 }, (_, i) => {
      const slotNum = i + 1;
      return {
        slot: slotNum,
        previewUrl: productoId ? this.productoService.getImagenUrl(productoId, slotNum) : null,
        markedForDelete: false
      } as SlotImagen;
    });
  }

  crearProducto() {
    this.esNuevoProducto = true;
    this.productoEditando = {
      id: 0,
      nombre: '',
      subtitulo: '',
      categoria: '',
      descripcion: '',
      stock: 0,
      precio: 0,
      medidas: '',
      material: '',
      img1: null,
      img2: null,
      img3: null,
      img4: null,
      img5: null
    } as Producto;

    this.initSlots(); // sin id => sin previews del server
  }

  editarProducto(producto: Producto) {
    this.esNuevoProducto = false;
    this.productoEditando = { ...producto };
    this.initSlots(producto.id); // precarga previews desde backend por slot
  }

  cancelarEdicionProducto() {
    this.productoEditando = null;
    this.esNuevoProducto = false;
    this.slots = [];
  }

async onSeleccionarArchivo(event: Event, slot: SlotImagen) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const original = input.files[0];
  input.value = ''; // permitir re-seleccionar el mismo archivo después

  // ✅ Política STRICT: solo WebP y <= 800 KB
  if (!isWebpFile(original)) {
    this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
    return;
  }

  if (isTooLarge(original, this.IMG_LIMIT_BYTES)) {
    this.mostrarModalFeedback('error', 'Image too large', `The file must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`);
    return;
  }

  // Pasa validación → preview y guarda
  slot.file = original;
  slot.markedForDelete = false;
  try {
    slot.previewUrl = await fileToDataUrl(original);
  } catch {
    this.mostrarModalFeedback('error', 'Invalid image', 'Could not read the image.');
    slot.file = undefined;
  }
}


  eliminarSlot(slot: SlotImagen) {
    slot.file = undefined;
    slot.previewUrl = null;
    // En edición marcamos para borrado; en nuevo no hace falta marcar
    slot.markedForDelete = !this.esNuevoProducto;
  }

  restaurarSlot(slot: SlotImagen) {
    if (!this.productoEditando || this.esNuevoProducto) return;
    slot.file = undefined;
    slot.previewUrl = this.productoService.getImagenUrl(this.productoEditando.id, slot.slot);
    slot.markedForDelete = false;
  }

  selectedSlotsCount(): number {
    return this.slots.filter(s => !!s.previewUrl).length;
  }

  guardarCambiosProducto() {
  if (!this.productoEditando) return;

  // 🔒 Doble validación de seguridad
  for (const s of this.slots) {
    if (s.file) {
      if (!isWebpFile(s.file)) {
        this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
        return;
      }
      if (isTooLarge(s.file, this.IMG_LIMIT_BYTES)) {
        this.mostrarModalFeedback('error', 'Image too large', `Each image must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`);
        return;
      }
    }
  }

  const formData = new FormData();
  const productoDto: any = {
    id: this.productoEditando.id,
    nombre: this.productoEditando.nombre,
    subtitulo: this.productoEditando.subtitulo,
    categoria: this.productoEditando.categoria,
    descripcion: this.productoEditando.descripcion,
    stock: this.productoEditando.stock,
    precio: this.productoEditando.precio,
    medidas: this.productoEditando.medidas,
    material: this.productoEditando.material
  };
  formData.append('producto', new Blob([JSON.stringify(productoDto)], { type: 'application/json' }));

  // Solo sube archivos válidos
  this.slots.forEach(s => {
    if (s.file && isWebpFile(s.file) && !isTooLarge(s.file, this.IMG_LIMIT_BYTES)) {
      formData.append(`img${s.slot}`, s.file);
    }
  });

  if (!this.esNuevoProducto) {
    this.slots.forEach(s => {
      if (s.markedForDelete) formData.append(`deleteImg${s.slot}`, 'true');
    });
  }

  const req$ = this.esNuevoProducto
    ? this.productoService.crearProductoConImagenes(formData)
    : this.productoService.actualizarProductoConImagenes(this.productoEditando.id, formData);

  req$.subscribe({
    next: () => {
      this.obtenerProductos();
      this.cancelarEdicionProducto();
      this.mostrarModalFeedback('success', 'Product saved', 'The product has been saved successfully.');
    },
    error: (e) => {
      console.error('Error guardando producto', e);
      this.mostrarModalFeedback('error', 'Error saving product', 'Please review fields or try again.');
    }
  });
}


eliminarProducto(id: number) {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.obtenerProductos();
        this.mostrarModalFeedback('success', 'Product deleted', 'The product has been deleted successfully.');
      },
      error: (e) => {
        console.error('Error eliminando producto', e);
        this.mostrarModalFeedback('error', 'Error deleting product', 'There was a problem deleting the product.');
      }
    });
  }
}


  private comprobarCargaCompleta() {
    if (this.productosCargados && this.comprasCargadas) {
      this.loading = false;
    }
  }

  exportarCSVProductos() {
    const encabezado = ['ID', 'Name', 'Subtitle', 'Description', 'Stock', 'Price'];
    const filas = this.productos.map(producto => [
      producto.id,
      producto.nombre,
      producto.subtitulo,
      producto.descripcion,
      producto.stock,
      producto.precio,
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'products.csv');
  }

  // --- MÉTODOS PRODUCTO COMPRA ---

  obtenerCompras() {
    this.productoCompraService.getProductoCompras().subscribe({
      next: data => {
        this.compras = data;
        this.comprasCargadas = true;
        this.comprobarCargaCompleta();
      },
      error: err => {
        console.error('Error al cargar compras', err);
        this.comprasCargadas = true;
        this.comprobarCargaCompleta();
      }
    });
  }

  crearCompra() {
    this.esNuevoCompra = true;
    this.compraEditando = {
      id: 0,
      idCliente: 0,
      nombreCliente: '',
      idProducto: 0,
      nombreProducto: '',
      cantidad: 0,
      fechaCompra: new Date()
    };
  }

  editarCompra(compra: ProductoCompra) {
    this.esNuevoCompra = false;
    this.compraEditando = { ...compra };
  }

  cancelarEdicionCompra() {
    this.compraEditando = null;
    this.esNuevoCompra = false;
  }

  guardarCambiosCompra() {
    if (!this.compraEditando) return;

    if (this.esNuevoCompra) {
      this.productoCompraService.crearProductoCompra(this.compraEditando).subscribe(() => {
        this.obtenerCompras();
        this.compraEditando = null;
        this.esNuevoCompra = false;
      });
    } else {
      this.productoCompraService.actualizarProductoCompra(this.compraEditando).subscribe(() => {
        this.obtenerCompras();
        this.compraEditando = null;
        this.esNuevoCompra = false;
      });
    }
  }

  eliminarCompra(id: number) {
    if (confirm('¿Estás seguro de eliminar esta compra?')) {
      this.productoCompraService.eliminarProductoCompra(id).subscribe(() => {
        this.obtenerCompras();
      });
    }
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

  exportarCSVCompras() {
    const encabezado = ['ID', 'ID Cliente', 'Nombre Cliente', 'ID Producto', 'Nombre Producto', 'Cantidad', 'Fecha Compra'];
    const filas = this.compras.map(compra => [
      compra.id,
      compra.idCliente,
      compra.nombreCliente,
      compra.idProducto,
      compra.nombreProducto,
      compra.cantidad,
      compra.fechaCompra.toString()
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'producto_compras.csv');
  }
}
