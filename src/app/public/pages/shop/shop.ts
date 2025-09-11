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

  imagenes = [
    'assets/instagram/galery_1.webp',
    'assets/instagram/galery_2.webp',
    'assets/instagram/galery_3.webp',
    'assets/instagram/galery_4.webp',
    'assets/instagram/galery_5.webp',
    'assets/instagram/galery_6.webp',
    'assets/instagram/galery_7.webp',
    'assets/instagram/galery_8.webp'
  ];

  mostrarOverlay(event: MouseEvent) {
    const overlay = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.overlay');
    if (overlay) {
      overlay.style.opacity = '1';
    }
  }

  ocultarOverlay(event: MouseEvent) {
    const overlay = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.overlay');
    if (overlay) {
      overlay.style.opacity = '0';
    }
  }
  
}
