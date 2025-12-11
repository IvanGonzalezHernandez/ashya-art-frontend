import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 👈 importar
import { CarritoService } from '../../../services/carrito/carrito';
import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { ItemCarrito } from '../../../models/item-carrito';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';

@Component({
  selector: 'app-gift-cards-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RevealAnimateDirective],
  templateUrl: './gift-cards-detail.html',
  styleUrls: ['./gift-cards-detail.scss']
})
export class GiftCardsDetail implements OnInit {
  loading = false;
  tarjetaCargada = false;

  tarjetaSeleccionada?: TarjetaRegalo;

  destinatario: string = '';

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

  private toDataUrl(base64?: string | null): string {
    if (!base64) return '';
    return base64.startsWith('data:') ? base64 : `data:image/webp;base64,${base64}`;
  }

  get imgTarjetaUrl(): string {
    const b64 = (this.tarjetaSeleccionada as any)?.img as string | undefined | null;
    const existingUrl = (this.tarjetaSeleccionada as any)?.imgUrl as string | undefined | null;
    if (existingUrl && (existingUrl.startsWith('data:') || existingUrl.startsWith('http'))) {
      return existingUrl;
    }
    return this.toDataUrl(b64);
  }

 confirmarDestinatario(): void {
  const nombreLimpio = (this.destinatario || '').trim();
  if (nombreLimpio.length < 2) return;
  if (!this.tarjetaSeleccionada) return;

  this.agregarTarjetaAlCarrito(this.tarjetaSeleccionada, nombreLimpio);
  this.destinatario = ''; // reset después de usar
}

private agregarTarjetaAlCarrito(tarjeta: TarjetaRegalo, destinatario: string) {
  const item: ItemCarrito = {
    id: tarjeta.id,
    tipo: 'TARJETA',
    nombre: tarjeta.nombre,
    subtitulo: 'Gift card for ' + destinatario,
    precio: tarjeta.precio ?? 0,
    cantidad: 1,
    fecha: '',
    hora: '',
    img: this.imgTarjetaUrl,
    destinatario
  };

    console.log('Añadiendo al carrito:', item);
    this.carritoService.agregarItem(item);
  }
}
