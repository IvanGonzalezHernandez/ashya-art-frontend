import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShopService } from '../../../services/shop/shop';
import { Producto } from '../../../models/producto.model';
import { RouterModule } from '@angular/router';
import { ItemCarrito } from '../../../models/item-carrito';
import { CarritoService } from '../../../services/carrito/carrito';

@Component({
  selector: 'app-ceramics-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ceramics-detail.html',
  styleUrls: ['./ceramics-detail.scss']
})
export class CeramicsDetail implements OnInit {
  loading = false;
  productoCargado = false;

  productoSeleccionado?: Producto;

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        const id = Number(idStr);
        if (!isNaN(id)) {
          this.cargarProductoPorId(id);
        }
      }
    });
  }

  private cargarProductoPorId(id: number): void {
    this.shopService.getProductoPorId(id).subscribe({
      next: (producto) => {
        this.productoSeleccionado = producto;
        if (producto) {
          this.procesarImagenesBase64(producto);
        }
        this.productoCargado = true;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error cargando producto con ID ${id}`, err);
        this.loading = false;
      }
    });
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

  agregarProductoAlCarrito(producto: any) {
  if (!producto) return;

  const cantidad = producto.cantidadSeleccionada || 1;

  const item: ItemCarrito = {
    id: producto.id,
    tipo: 'PRODUCTO',
    nombre: producto.nombre,
    precio: producto.precio ?? 0,
    cantidad: cantidad,
    img: producto.img1Url || '',
    subtitulo: producto.subtitulo,
    fecha: '',
    hora: ''
  };
  console.log(item);
  this.carritoService.agregarItem(item);
  }
}
