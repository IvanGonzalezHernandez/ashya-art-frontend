import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Curso } from '../../../models/curso.model';
import { CursoService } from '../../../services/curso/curso';
import { ValorationsComponent } from '../../../shared/valorations/valorations';
import { RevealAnimateDirective } from '../../../utils/Reveal- animate-directive';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-workshops',
  standalone: true,
  templateUrl: './workshops.html',
  styleUrls: ['./workshops.scss'],
  imports: [CommonModule, RouterModule, ValorationsComponent, RevealAnimateDirective, TranslatePipe]
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
    this.cursoService.getCursosHabilitados().subscribe({
      next: (data) => {
        this.cursos = data;
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

  private comprobarCargaCompleta(): void {
    if (this.cursosCargados) {
      this.loading = false;
    }
  }
}
