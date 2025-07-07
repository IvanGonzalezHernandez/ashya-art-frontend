// cursos-dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CursoService } from '../../../services/curso/curso';
import { Curso } from '../../../models/curso.model';
import { CurrencyPipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-cursos-dashboard',
  templateUrl: './cursos-dashboard.html',
  styleUrls: ['./cursos-dashboard.scss'],
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  providers: [CurrencyPipe]
})
export class CursosDashboard implements OnInit {
  cursos: Curso[] = [];
  paginaActual: number = 1;

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
    this.obtenerCursos();
  }

  obtenerCursos() {
    this.cursoService.getCursos().subscribe(data => this.cursos = data);
  }

  crearCurso() {
    // Aquí puedes abrir un modal o redirigir a un formulario
    console.log("Crear curso");
  }

  editarCurso(curso: Curso) {
    // Aquí puedes abrir un modal con los datos del curso
    console.log("Editar", curso);
  }

  eliminarCurso(id: number) {
    if (confirm('¿Seguro que deseas eliminar este curso?')) {
      this.cursoService.eliminarCurso(id).subscribe(() => {
        this.obtenerCursos();
      });
    }
  }
}
