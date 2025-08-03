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
  productos: Producto[] = [];

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  private cargarProductos(): void {
    this.shopService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error('Error cargando productos', err),
    });
  }
}
