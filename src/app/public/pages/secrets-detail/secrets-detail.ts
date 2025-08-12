import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Secreto } from '../../../models/secreto.model';
import { SecretoService } from '../../../services/secreto/secreto';

@Component({
  selector: 'app-secrets-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './secrets-detail.html',
  styleUrls: ['./secrets-detail.scss']
})
export class SecretsDetail implements OnInit {
  loading = false;
  secretoCargado = false;

  secretoSeleccionado?: Secreto;

  constructor(
    private route: ActivatedRoute,
    private secretosService: SecretoService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        const id = Number(idStr);
        if (!isNaN(id)) {
          this.cargarSecretoPorId(id);
        }
      }
    });
  }

  private cargarSecretoPorId(id: number): void {
    this.secretosService.getSecretoPorId(id).subscribe({
      next: (secreto) => {
        this.secretoSeleccionado = secreto;
        if (secreto) {
          this.procesarImagenesBase64(secreto);
        }
        this.secretoCargado = true;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error cargando secreto con ID ${id}`, err);
        this.loading = false;
      }
    });
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
}
