import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { CursoService } from '../../../services/curso/curso';
import { CursoFechaService } from '../../../services/curso-fecha/curso-fecha';
import { CsvExportService } from '../../../services/csv/csv-export';

import { Curso } from '../../../models/curso.model';
import { CursoFecha } from '../../../models/cursoFecha.model';

@Component({
  selector: 'app-cursos-dashboard',
  standalone: true,
  templateUrl: './cursos-dashboard.html',
  styleUrls: ['./cursos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class CursosDashboard implements OnInit {
  // CURSOS
  cursos: Curso[] = [];
  paginaActual: number = 1;
  cursoEditando: Curso | null = null;
  esNuevo: boolean = false;

  // CURSOFECHA
  cursoFechas: CursoFecha[] = [];
  paginaActualCursoFecha: number = 1;
  cursoFechaEditando: CursoFecha | null = null;
  esNuevaCursoFecha: boolean = false;

  constructor(
    private cursoService: CursoService,
    private cursoFechaService: CursoFechaService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.obtenerCursos();
    this.obtenerCursoFechas();
  }

  // --- CURSOS ---

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

  // --- CURSOFECHA ---

  obtenerCursoFechas() {
    this.cursoFechaService.getCursoFechas().subscribe(data => this.cursoFechas = data);
  }

  crearCursoFecha() {
    this.esNuevaCursoFecha = true;
    this.cursoFechaEditando = {
      id: 0,
      idCurso: 0,
      fecha: '',
      horaInicio: '',
      horaFin: '',
      plazasDisponibles: 0,
      nombreCurso: ''
    };
  }

  editarCursoFecha(cursoFecha: CursoFecha) {
    this.esNuevaCursoFecha = false;
    this.cursoFechaEditando = { ...cursoFecha };
  }

  cancelarEdicionCursoFecha() {
    this.cursoFechaEditando = null;
    this.esNuevaCursoFecha = false;
  }

  guardarCursoFecha() {
    if (!this.cursoFechaEditando) return;

    if (this.esNuevaCursoFecha) {
      this.cursoFechaService.crearCursoFecha(this.cursoFechaEditando).subscribe(() => {
        this.obtenerCursoFechas();
        this.cursoFechaEditando = null;
        this.esNuevaCursoFecha = false;
      });
    } else {
      this.cursoFechaService.actualizarCursoFecha(this.cursoFechaEditando).subscribe(() => {
        this.obtenerCursoFechas();
        this.cursoFechaEditando = null;
        this.esNuevaCursoFecha = false;
      });
    }
  }

  eliminarCursoFecha(id: number) {
    if (confirm('¿Estás seguro de eliminar esta fecha de curso?')) {
      this.cursoFechaService.eliminarCursoFecha(id).subscribe(() => {
        this.obtenerCursoFechas();
      });
    }
  }

  // --- EXPORTACIÓN CSV ---

  exportarCSV() {
    // Exportar cursos
    const encabezadoCursos = ['ID', 'Nombre', 'Subtítulo', 'Descripción', 'Precio', 'Imagen'];
    const filasCursos = this.cursos.map(curso => [
      curso.id,
      curso.nombre,
      curso.subtitulo,
      curso.descripcion,
      curso.precio,
      curso.img
    ]);
    this.csvExportService.exportarCSV(encabezadoCursos, filasCursos, 'courses.csv');

    // Exportar cursoFechas
    const encabezadoCursoFechas = ['ID', 'Curso', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Plazas Disponibles'];
    const filasCursoFechas = this.cursoFechas.map(cf => [
      cf.id,
      cf.nombreCurso,
      cf.fecha,
      cf.horaInicio,
      cf.horaFin,
      cf.plazasDisponibles
    ]);
    this.csvExportService.exportarCSV(encabezadoCursoFechas, filasCursoFechas, 'curso-fechas.csv');
  }
}
