import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { ProductoService } from '../../../services/producto/producto';
import { ProductoCompraService } from '../../../services/producto-compra/producto-compra';
import { CsvExportService } from '../../../services/csv/csv-export';

import { Producto } from '../../../models/producto.model';
import { ProductoCompra } from '../../../models/producto-compra.model';

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
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class ProductosDashboard implements OnInit {
  loading = false;
  productosCargados = false;
  comprasCargadas = false;

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

  // Handlers UI de slots (igual que cursos)
  onSeleccionarArchivo(event: Event, slot: SlotImagen) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen.');
      input.value = '';
      return;
    }

    slot.file = file;
    slot.markedForDelete = false;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      slot.previewUrl = e.target.result; // dataURL para previsualizar
    };
    reader.readAsDataURL(file);

    input.value = ''; // permitir re-elegir el mismo archivo
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

    const formData = new FormData();

    // DTO de producto
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

    // Añadir JSON
    formData.append('producto', new Blob([JSON.stringify(productoDto)], { type: 'application/json' }));

    // Reemplazos: enviar img1..img5 si hay archivo cargado en ese slot
    this.slots.forEach(s => {
      if (s.file) {
        formData.append(`img${s.slot}`, s.file);
      }
    });

    // Borrados: flags deleteImgN=true (solo en edición)
    this.slots.forEach(s => {
      if (!this.esNuevoProducto && s.markedForDelete) {
        formData.append(`deleteImg${s.slot}`, 'true');
      }
    });

    const req$ = this.esNuevoProducto
      ? this.productoService.crearProductoConImagenes(formData)
      : this.productoService.actualizarProductoConImagenes(this.productoEditando.id, formData);

    req$.subscribe({
      next: () => {
        this.obtenerProductos();
        this.cancelarEdicionProducto();
      },
      error: (e) => console.error('Error guardando producto', e)
    });
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe(() => {
        this.obtenerProductos();
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
