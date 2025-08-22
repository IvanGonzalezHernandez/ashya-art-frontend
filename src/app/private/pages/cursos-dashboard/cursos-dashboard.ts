import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CursoService } from '../../../services/curso/curso';
import { CursoFechaService } from '../../../services/curso-fecha/curso-fecha';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Curso } from '../../../models/curso.model';
import { CursoFecha } from '../../../models/cursoFecha.model';
import { TruncatePipe } from '../../../pipes/truncate/truncate-pipe';

@Component({
  selector: 'app-cursos-dashboard',
  standalone: true,
  templateUrl: './cursos-dashboard.html',
  styleUrls: ['./cursos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, TruncatePipe]
})
export class CursosDashboard implements OnInit {
  // CURSOS
  cursos: Curso[] = [];
  paginaActual: number = 1;
  cursoEditando: Curso | null = null;
  esNuevo: boolean = false;

  imagenes: File[] = [];
  vistaPreviaImagenes: string[] = [];

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
      img1: null,
      img2: null,
      img3: null,
      img4: null,
      img5: null,
      nivel: '',
      duracion: '',
      piezas: '',
      materiales: '',
      plazasMaximas: 0,
      informacionExtra: ''
    };
  }
  
  onImagenesSeleccionadas(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
  
    const nuevosArchivos = Array.from(input.files);
  
    if (this.imagenes.length + nuevosArchivos.length > 5) {
      alert('Solo puedes seleccionar hasta 5 imágenes en total');
      return;
    }
  
    nuevosArchivos.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vistaPreviaImagenes.push(e.target.result);
      };
      reader.readAsDataURL(file);
      this.imagenes.push(file);
    });
  }

  eliminarImagen(index: number) {
    this.imagenes.splice(index, 1);
    this.vistaPreviaImagenes.splice(index, 1);
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
  
    const formData = new FormData();
    const cursoDto = {
      id: this.cursoEditando.id,
      nombre: this.cursoEditando.nombre,
      subtitulo: this.cursoEditando.subtitulo,
      descripcion: this.cursoEditando.descripcion,
      precio: this.cursoEditando.precio,
      nivel: this.cursoEditando.nivel,
      duracion: this.cursoEditando.duracion,
      piezas: this.cursoEditando.piezas,
      materiales: this.cursoEditando.materiales,
      plazasMaximas: this.cursoEditando.plazasMaximas,
      informacionExtra: this.cursoEditando.informacionExtra
    };
  
    formData.append('curso', new Blob([JSON.stringify(cursoDto)], { type: 'application/json' }));
  
    this.imagenes.forEach(imagen => {
      formData.append('imagenes', imagen);
    });
  
    if (this.esNuevo) {
      this.cursoService.crearCurso(formData).subscribe(() => {
        this.obtenerCursos();
        this.cancelarEdicion();
      });
    } else {
      this.cursoService.actualizarCurso(formData, this.cursoEditando.id).subscribe(() => {
        this.obtenerCursos();
        this.cancelarEdicion();
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
    const encabezadoCursos = ['ID', 'Nombre', 'Subtítulo', 'Descripción', 'Precio'];
    const filasCursos = this.cursos.map(curso => [
      curso.id,
      curso.nombre,
      curso.subtitulo,
      curso.descripcion,
      curso.precio,
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
