import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CarritoService } from '../../../services/carrito/carrito';
import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { ItemCarrito } from '../../../models/item-carrito';

@Component({
  selector: 'app-gift-cards-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gift-cards-detail.html',
  styleUrls: ['./gift-cards-detail.scss']
})
export class GiftCardsDetail implements OnInit {
  loading = false;
  tarjetaCargada = false;

  tarjetaSeleccionada?: TarjetaRegalo; // no extendemos el tipo para evitar choques

  constructor(
    private route: ActivatedRoute,
    private carritoService: CarritoService,
    private tarjetaRegaloService: TarjetaRegaloService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        const id = Number(idStr);
        if (!isNaN(id)) {
          this.cargarTarjetaPorId(id);
        }
      }
    });
  }

  private cargarTarjetaPorId(id: number): void {
    this.tarjetaRegaloService.getTarjetaPorId(id).subscribe({
      next: (tarjeta) => {
        this.tarjetaSeleccionada = tarjeta;
        this.tarjetaCargada = true;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error cargando tarjeta con ID ${id}`, err);
        this.loading = false;
      }
    });
  }

  /** Convierte base64 en data URL (si no trae prefijo data:) */
  private toDataUrl(base64?: string | null): string {
    if (!base64) return '';
    return base64.startsWith('data:') ? base64 : `data:image/webp;base64,${base64}`;
  }

  /** Getter: URL lista para <img> sin tocar el tipo del modelo */
  get imgTarjetaUrl(): string {
    // cubrimos el caso de que el modelo tenga String (wrapper)
    const b64 = (this.tarjetaSeleccionada as any)?.img as string | undefined | null;
    // si el back ya guarda imgUrl y quieres priorizarlo:
    const existingUrl = (this.tarjetaSeleccionada as any)?.imgUrl as string | undefined | null;
    // prioriza imgUrl si es data: o http(s), si no, genera desde img
    if (existingUrl && (existingUrl.startsWith('data:') || existingUrl.startsWith('http'))) {
      return existingUrl;
    }
    return this.toDataUrl(b64);
  }

  agregarTarjetaAlCarrito(tarjeta: TarjetaRegalo) {
    if (!tarjeta) return;

    const cantidad = 1; // Siempre 1 para tarjeta regalo

    const item: ItemCarrito = {
      id: tarjeta.id,
      tipo: 'TARJETA',
      nombre: tarjeta.nombre,
      precio: tarjeta.precio ?? 0,
      cantidad: cantidad,
      img: this.imgTarjetaUrl, // usamos la URL procesada
      subtitulo: 'Tarjeta regalo para canjear por valor de ' + tarjeta.precio + '€',
      fecha: '',
      hora: ''
    };

    console.log(item);
    this.carritoService.agregarItem(item);
  }
}
