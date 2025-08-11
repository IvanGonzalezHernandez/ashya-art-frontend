import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../../services/shop/shop';
import { Producto } from '../../../models/producto.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop.html',
  styleUrls: ['./shop.scss']
})
export class Shop implements OnInit {
  loading = false;
  productosCargados = false;

  productos: Producto[] = [];

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.loading = true;
    this.cargarProductos();
  }

  private cargarProductos(): void {
    this.shopService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosCargados = true;
        this.comprobarCargaCompleta();
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.productosCargados = true;
        this.comprobarCargaCompleta();
      },
    });
  }

  private comprobarCargaCompleta(): void {
    if (this.productosCargados) {
      this.loading = false;
    }
  }
}
