import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CursoService } from '../../../services/curso/curso';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Curso } from '../../../models/curso.model';

@Component({
  selector: 'app-cursos-dashboard',
  standalone: true,
  templateUrl: './cursos-dashboard.html',
  styleUrls: ['./cursos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class CursosDashboard implements OnInit {
  cursos: Curso[] = [];
  paginaActual: number = 1;
  cursoEditando: Curso | null = null;
  esNuevo: boolean = false;

  constructor(
    private cursoService: CursoService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.obtenerCursos();
  }

  obtenerCursos() {
    this.cursoService.getCursos().subscribe(data => this.cursos = data);
  }

  crearCurso() {
    this.esNuevo = true;
    this.cursoEditando = {
      id: 0,
      nombre: '',
      subtitulo: '',
      descripcion: '',
      precio: 0,
      img: ''
    };
  }

  editarCurso(curso: Curso) {
    this.esNuevo = false;
    this.cursoEditando = { ...curso };
  }

  cancelarEdicion() {
    this.cursoEditando = null;
    this.esNuevo = false;
  }

  guardarCambios() {
    if (!this.cursoEditando) return;

    if (this.esNuevo) {
      this.cursoService.crearCurso(this.cursoEditando).subscribe(() => {
        this.obtenerCursos();
        this.cursoEditando = null;
        this.esNuevo = false;
      });
    } else {
      this.cursoService.actualizarCurso(this.cursoEditando).subscribe(() => {
        this.obtenerCursos();
        this.cursoEditando = null;
        this.esNuevo = false;
      });
    }
  }

  eliminarCurso(id: number) {
    if (confirm('¿Estás seguro de eliminar este curso?')) {
      this.cursoService.eliminarCurso(id).subscribe(() => {
        this.obtenerCursos();
      });
    }
  }

  asignarFechaCurso() {
    console.log('Asignar fecha');
  }

  exportarCSV() {
    const encabezado = ['ID', 'Name', 'Subtitle', 'Description', 'Price', 'Image'];
    const filas = this.cursos.map(curso => [
      curso.id,
      curso.nombre,
      curso.subtitulo,
      curso.descripcion,
      curso.precio,
      curso.img
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'courses.csv');
  }
}
