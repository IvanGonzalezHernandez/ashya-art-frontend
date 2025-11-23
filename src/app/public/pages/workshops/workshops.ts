import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Curso } from '../../../models/curso.model';
import { CursoService } from '../../../services/curso/curso';
import { ValorationsComponent } from '../../../shared/valorations/valorations';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';

@Component({
  selector: 'app-workshops',
  standalone: true,
  templateUrl: './workshops.html',
  styleUrls: ['./workshops.scss'],
  imports: [CommonModule, RouterModule, ValorationsComponent, RevealAnimateDirective]
})
export class Workshops implements OnInit {
  loading = false;
  cursosCargados = false;
  
  cursos: Curso[] = [];

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
    this.loading = true;
    this.cargarCursos();
  }

  private cargarCursos(): void {
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cursos.forEach(curso => this.procesarImagenesBase64(curso));
        this.cursosCargados = true;
        this.comprobarCargaCompleta();
      },
      error: (err) => {
        console.error('Error cargando cursos', err);
        this.cursosCargados = true;
        this.comprobarCargaCompleta();
      }
    });
  }  

  private procesarImagenesBase64(curso: Curso): void {
    for (let i = 1; i <= 5; i++) {
      const imgProp = `img${i}` as keyof Curso;
      const urlProp = `img${i}Url` as keyof Curso;

      const base64Str = curso[imgProp] as unknown as string;
      if (base64Str) {
        (curso as any)[urlProp] = `data:image/webp;base64,${base64Str}`;
      } else {
        (curso as any)[urlProp] = '';
      }
    }
  }

  private comprobarCargaCompleta(): void {
    if (this.cursosCargados) {
      this.loading = false;
    }
  }
}
