import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductoService } from '../../../services/producto/producto';
import { ProductoCompraService } from '../../../services/producto-compra/producto-compra';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Producto } from '../../../models/producto.model';
import { ProductoCompra } from '../../../models/producto-compra.model';

@Component({
  selector: 'app-productos-dashboard',
  standalone: true,
  templateUrl: './productos-dashboard.html',
  styleUrls: ['./productos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class ProductosDashboard implements OnInit {
  // Productos
  productos: Producto[] = [];
  paginaActualProducto: number = 1;
  productoEditando: Producto | null = null;
  esNuevoProducto: boolean = false;

  // ProductoCompra
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
    this.obtenerProductos();
    this.obtenerCompras();
  }

  // --- MÉTODOS PRODUCTOS ---
  obtenerProductos() {
    this.productoService.getProductos().subscribe(data => this.productos = data);
  }

  crearProducto() {
    this.esNuevoProducto = true;
    this.productoEditando = {
      id: 0,
      nombre: '',
      subtitulo: '',
      descripcion: '',
      stock: 0,
      precio: 0,
      img: ''
    };
  }

  editarProducto(producto: Producto) {
    this.esNuevoProducto = false;
    this.productoEditando = { ...producto };
  }

  cancelarEdicionProducto() {
    this.productoEditando = null;
    this.esNuevoProducto = false;
  }

  guardarCambiosProducto() {
    if (!this.productoEditando) return;

    if (this.esNuevoProducto) {
      this.productoService.crearProducto(this.productoEditando).subscribe(() => {
        this.obtenerProductos();
        this.productoEditando = null;
        this.esNuevoProducto = false;
      });
    } else {
      this.productoService.actualizarProducto(this.productoEditando).subscribe(() => {
        this.obtenerProductos();
        this.productoEditando = null;
        this.esNuevoProducto = false;
      });
    }
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe(() => {
        this.obtenerProductos();
      });
    }
  }

  exportarCSVProductos() {
    const encabezado = ['ID', 'Name', 'Subtitle', 'Description', 'Stock', 'Price', 'Image'];
    const filas = this.productos.map(producto => [
      producto.id,
      producto.nombre,
      producto.subtitulo,
      producto.descripcion,
      producto.stock,
      producto.precio,
      producto.img
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'products.csv');
  }

  // --- MÉTODOS PRODUCTO COMPRA ---
  obtenerCompras() {
    this.productoCompraService.getProductoCompras().subscribe(data => this.compras = data);
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
