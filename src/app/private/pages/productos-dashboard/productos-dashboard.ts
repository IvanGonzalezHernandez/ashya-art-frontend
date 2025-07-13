import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductoService } from '../../../services/producto/producto';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Producto } from '../../../models/producto.model';

@Component({
  selector: 'app-productos-dashboard',
  standalone: true,
  templateUrl: './productos-dashboard.html',
  styleUrls: ['./productos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class ProductosDashboard implements OnInit {
  productos: Producto[] = [];
  paginaActual: number = 1;
  productoEditando: Producto | null = null;
  esNuevo: boolean = false;

  constructor(
    private productoService: ProductoService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos() {
    this.productoService.getProductos().subscribe(data => this.productos = data);
  }

  crearProducto() {
    this.esNuevo = true;
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
    this.esNuevo = false;
    this.productoEditando = { ...producto };
  }

  cancelarEdicion() {
    this.productoEditando = null;
    this.esNuevo = false;
  }

  guardarCambios() {
    if (!this.productoEditando) return;

    if (this.esNuevo) {
      this.productoService.crearProducto(this.productoEditando).subscribe(() => {
        this.obtenerProductos();
        this.productoEditando = null;
        this.esNuevo = false;
      });
    } else {
      this.productoService.actualizarProducto(this.productoEditando).subscribe(() => {
        this.obtenerProductos();
        this.productoEditando = null;
        this.esNuevo = false;
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

  exportarCSV() {
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
}
