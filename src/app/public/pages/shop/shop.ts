import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../../services/shop/shop';
import { Producto } from '../../../models/producto.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
        this.productos.forEach(productos => this.procesarImagenesBase64(productos));
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

  private procesarImagenesBase64(producto: Producto): void {
    for (let i = 1; i <= 5; i++) {
      const imgProp = `img${i}` as keyof Producto;
      const urlProp = `img${i}Url` as keyof Producto;
  
      const base64Str = producto[imgProp] as unknown as string;
      if (base64Str) {
        (producto as any)[urlProp] = `data:image/webp;base64,${base64Str}`;
      } else {
        (producto as any)[urlProp] = '';
      }
    }
  }
  
}
