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
  styleUrls: ['./secrets.scss']
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
        this.secretos.forEach(secretos => this.procesarImagenesBase64(secretos));
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

    private procesarImagenesBase64(secreto: Secreto): void {
      for (let i = 1; i <= 5; i++) {
        const imgProp = `img${i}` as keyof Secreto;
        const urlProp = `img${i}Url` as keyof Secreto;
    
        const base64Str = secreto[imgProp] as unknown as string;
        if (base64Str) {
          (secreto as any)[urlProp] = `data:image/webp;base64,${base64Str}`;
        } else {
          (secreto as any)[urlProp] = '';
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
