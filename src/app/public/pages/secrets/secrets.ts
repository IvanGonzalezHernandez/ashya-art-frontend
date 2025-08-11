import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SecretoService } from '../../../services/secreto/secreto';
import { Secreto } from '../../../models/secreto.model';

@Component({
  selector: 'app-secrets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './secrets.html',
  styleUrl: './secrets.scss'
})
export class Secrets {
  loading = false;
  secretosCargados = false;

  secretos: Secreto[] = [];

  constructor(private SecretoService: SecretoService) {}

    ngOnInit(): void {
    this.loading = true;
    this.cargarSecretos();
  }

  private cargarSecretos(): void {
    this.SecretoService.getSecretos().subscribe({
      next: (data) => {
        this.secretos = data;
        this.secretosCargados = true;
        this.comprobarCargaCompleta();
      },
      error: (err) => {
        console.error('Error cargando secretos', err);
        this.secretosCargados = true;
        this.comprobarCargaCompleta();
      },
    });
  }

  private comprobarCargaCompleta(): void {
    if (this.secretosCargados) {
      this.loading = false;
    }
  }

}
