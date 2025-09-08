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

type SlotImagen = {
  slot: number;                 // 1..5
  previewUrl: string | null;    // dataURL local o URL backend
  file?: File;                  // archivo nuevo elegido
  markedForDelete: boolean;     // borrar en servidor
};

@Component({
  selector: 'app-cursos-dashboard',
  standalone: true,
  templateUrl: './cursos-dashboard.html',
  styleUrls: ['./cursos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, TruncatePipe]
})
export class CursosDashboard implements OnInit {
  loading = false;
  cursosCargados = false;
  fechasCargados = false;

  // CURSOS
  cursos: Curso[] = [];
  paginaActual: number = 1;
  cursoEditando: Curso | null = null;
  esNuevo: boolean = false;

  // UI de imágenes por slots
  slots: SlotImagen[] = [];

  // CURSOFECHA
  cursoFechas: CursoFecha[] = [];
  paginaActualCursoFecha: number = 1;
  cursoFechaEditando: CursoFecha | null = null;
  esNuevaCursoFecha: boolean = false;

  constructor(
    public cursoService: CursoService,
    private cursoFechaService: CursoFechaService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerCursos();
    this.obtenerCursoFechas();
  }

  // --- CURSOS ---

  obtenerCursos() {
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cursosCargados = true;
        this.comprobarCargaCompleta();
      },
      error: (err) => {
        console.error('Error cargando cursos', err);
        this.cursosCargados = true;  // marcamos como intentado aunque falle
        this.comprobarCargaCompleta();
      }
    });
  }

  private initSlots(cursoId?: number) {
    this.slots = Array.from({ length: 5 }, (_, i) => {
      const slotNum = i + 1;
      return {
        slot: slotNum,
        previewUrl: cursoId ? this.cursoService.getImagenUrl(cursoId, slotNum) : null,
        markedForDelete: false
      } as SlotImagen;
    });
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
    } as unknown as Curso; // adapta si tu modelo difiere
    this.initSlots(); // sin URLs
  }

  editarCurso(curso: Curso) {
    this.esNuevo = false;
    this.cursoEditando = { ...curso };
    this.initSlots(curso.id);
  }

  cancelarEdicion() {
    this.cursoEditando = null;
    this.esNuevo = false;
    this.slots = [];
  }

  onSeleccionarArchivo(event: Event, slot: SlotImagen) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    slot.file = file;
    slot.markedForDelete = false;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      slot.previewUrl = e.target.result; // dataURL local para preview
    };
    reader.readAsDataURL(file);

    // permitir volver a seleccionar el mismo archivo si se desea
    input.value = '';
  }

  eliminarSlot(slot: SlotImagen) {
    slot.file = undefined;
    slot.previewUrl = null;
    slot.markedForDelete = true;
  }

  restaurarSlot(slot: SlotImagen) {
    if (!this.cursoEditando || this.esNuevo) return;
    slot.file = undefined;
    slot.previewUrl = this.cursoService.getImagenUrl(this.cursoEditando.id, slot.slot);
    slot.markedForDelete = false;
  }

  guardarCambios() {
    if (!this.cursoEditando) return;

    const cursoDto: any = {
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

    const fd = new FormData();
    fd.append('curso', new Blob([JSON.stringify(cursoDto)], { type: 'application/json' }));

    // Reemplazos: enviar img1..img5 si hay archivo cargado
    this.slots.forEach(s => {
      if (s.file) {
        fd.append(`img${s.slot}`, s.file);
      }
    });

    // Borrados: enviar flags deleteImgN=true
    this.slots.forEach(s => {
      if (s.markedForDelete) {
        fd.append(`deleteImg${s.slot}`, 'true');
      }
    });

    const req$ = this.esNuevo
      ? this.cursoService.crearCurso(fd)
      : this.cursoService.actualizarCurso(fd, this.cursoEditando.id);

    req$.subscribe({
      next: () => {
        this.obtenerCursos();
        this.cancelarEdicion();
      },
      error: (e) => console.error('Error guardando curso', e)
    });
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
    this.cursoFechaService.getCursoFechas().subscribe({
      next: (data) => {
        this.cursoFechas = data;
        this.fechasCargados = true;
        this.comprobarCargaCompleta();
      },
      error: (err) => {
        console.error('Error cargando fechas de curso', err);
        this.fechasCargados = true;
        this.comprobarCargaCompleta();
      }
    });
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
    } as unknown as CursoFecha;
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

  private comprobarCargaCompleta() {
    if (this.cursosCargados && this.fechasCargados) {
      this.loading = false;
    }
  }

  // --- EXPORTACIÓN CSV ---

exportarCursosCSV() {
  const encabezadoCursos = ['ID', 'Nombre', 'Subtítulo', 'Descripción', 'Precio'];
  const filasCursos = (this.cursos || []).map(curso => [
    curso.id,
    curso.nombre,
    curso.subtitulo,
    curso.descripcion,
    curso.precio
  ]);
  this.csvExportService.exportarCSV(encabezadoCursos, filasCursos, 'courses.csv');
}

exportarCursoFechasCSV() {
  const encabezadoCursoFechas = ['ID', 'Curso', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Plazas Disponibles'];
  const filasCursoFechas = (this.cursoFechas || []).map(cf => [
    cf.id,
    cf.nombreCurso,
    cf.fecha,
    cf.horaInicio,
    cf.horaFin,
    cf.plazasDisponibles
  ]);
  this.csvExportService.exportarCSV(encabezadoCursoFechas, filasCursoFechas, 'course-dates.csv');
}
}
