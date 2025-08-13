import { Component, OnInit } from '@angular/core';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gift-cards.html',
  styleUrls: ['./gift-cards.scss']
})
export class GiftCards implements OnInit {
  loading = false;
  tarjetasCargadas = false;

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
        this.tarjetasCargadas = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando tarjetas regalo', err);
        this.tarjetasCargadas = true;
        this.loading = false;
      }
    });
  }
}
