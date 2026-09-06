import { Component, OnInit } from '@angular/core';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { ValorationsComponent } from '../../../shared/valorations/valorations';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule, RouterModule, ValorationsComponent, RevealAnimateDirective, TranslatePipe],
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
    this.tarjetaRegaloService.getTarjetasHabilitadas().subscribe({
      next: (data) => {
        this.tarjetas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando tarjetas regalo', err);
        this.loading = false;
      }
    });
  }
}
