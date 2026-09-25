import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShopService } from '../../../services/shop/shop';
import { Producto } from '../../../models/producto.model';
import { RouterModule } from '@angular/router';
import { ItemCarrito } from '../../../models/item-carrito';
import { CarritoService } from '../../../services/carrito/carrito';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SeoService, seoDescription } from '../../../services/seo/seo';
import { migas, producto as productoJsonLd } from '../../../services/seo/structured-data';

@Component({
  selector: 'app-ceramics-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, RevealAnimateDirective, TranslatePipe],
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
    private carritoService: CarritoService,
    private seo: SeoService,
    private translate: TranslateService
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
        this.productoCargado = true;
        this.loading = false;
        const descripcion = seoDescription(producto.subtitulo, producto.descripcion);
        this.seo.setPage({
          title: producto.nombre,
          description: descripcion,
          image: producto.img1Url,
          structuredData: [
            productoJsonLd(producto, descripcion),
            migas([['Home', '/'], ['Shop', '/shop'], [producto.nombre, `/products/${producto.id}`]])
          ]
        });
      },
      error: (err) => {
        console.error(`Error cargando producto con ID ${id}`, err);
        this.seo.setPage({ title: this.translate.instant('SEO.NOT_FOUND_TITLE'), noindex: true });
        this.loading = false;
      }
    });
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

  esValido(valor: unknown): boolean {
  return valor !== null && valor !== undefined && !(typeof valor === 'string' && valor.trim() === '');
}

obtenerImagenesValidas(): string[] {
  if (!this.productoSeleccionado) return [];
  const imagenes: Array<string | null | undefined> = [
    this.productoSeleccionado.img1Url,
    this.productoSeleccionado.img2Url,
    this.productoSeleccionado.img3Url,
    this.productoSeleccionado.img4Url,
    this.productoSeleccionado.img5Url,
  ];
  // type predicate para que el resultado sea string[]
  return imagenes.filter((img): img is string => !!img && img.trim() !== '');
  }

}
