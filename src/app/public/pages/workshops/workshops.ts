import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Curso } from '../../../models/curso.model';
import { CursoService } from '../../../services/curso/curso';

@Component({
  selector: 'app-workshops',
  standalone: true,
  templateUrl: './workshops.html',
  styleUrls: ['./workshops.scss'],
  imports: [CommonModule, RouterModule]
})
export class Workshops implements OnInit {
  
  cursos: Curso[] = [];

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  private cargarCursos(): void {
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cursos.forEach(curso => this.procesarImagenesBase64(curso));
      },
      error: (err) => console.error('Error cargando cursos', err),
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
}
