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

  tarjetaSeleccionada?: TarjetaRegalo;

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

  agregarTarjetaAlCarrito(tarjeta: TarjetaRegalo) {
    if (!tarjeta) return;

    const cantidad = 1; // Siempre 1 para tarjeta regalo, o puedes añadir un campo cantidadSeleccionada

    const item: ItemCarrito = {
      id: tarjeta.id,
      tipo: 'TARJETA',
      nombre: tarjeta.nombre,
      precio: tarjeta.precio ?? 0,
      cantidad: cantidad,
      img: tarjeta.img || '',
      subtitulo: '',
      fecha: '',
      hora: ''
    };

    console.log(item);
    this.carritoService.agregarItem(item);
  }
}
