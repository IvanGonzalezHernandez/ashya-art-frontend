import { Component, OnInit } from '@angular/core';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { ValorationsComponent } from '../../../shared/valorations/valorations';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule, RouterModule, ValorationsComponent, RevealAnimateDirective],
  templateUrl: './gift-cards.html',
  styleUrls: ['./gift-cards.scss']
})
export class GiftCards implements OnInit {
  loading = false;
  tarjetas: TarjetaRegalo[] = [];

  constructor(private tarjetaRegaloService: TarjetaRegaloService) {}

  ngOnInit(): void {
    this.loading = true;
    this.cargarTarjetas();
  }

  private cargarTarjetas(): void {
    this.tarjetaRegaloService.getTarjetas().subscribe({
      next: (data) => {
        this.tarjetas = data;
        this.tarjetas.forEach(card => this.procesarImagenesBase64(card));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando tarjetas regalo', err);
        this.loading = false;
      }
    });
  }

  private procesarImagenesBase64(card: TarjetaRegalo): void {
    if (card.img) {
      (card as any).imgUrl = `data:image/webp;base64,${card.img}`;
    } else {
      (card as any).imgUrl = '';
    }
  }
}
