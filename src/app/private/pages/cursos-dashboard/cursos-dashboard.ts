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

import { Reservas } from '../../../models/curso-compra.model';
import { ReservasService } from '../../../services/curso-compra/curso-compra';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { convertToWebPUnderLimit,fileToDataUrl,isTooLarge,isWebpFile } from '../../../utils/image-optimizer.util';

type SlotImagen = {
  slot: number;
  previewUrl: string | null;
  file?: File;
  markedForDelete: boolean;
};

@Component({
  selector: 'app-cursos-dashboard',
  standalone: true,
  templateUrl: './cursos-dashboard.html',
  styleUrls: ['./cursos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, TruncatePipe,  FeedbackModalComponent]
})
export class CursosDashboard implements OnInit {
  loading = false;
  cursosCargados = false;
  fechasCargados = false;

  private readonly IMG_LIMIT_BYTES = 800 * 1024; // 800 KB
  private readonly IMG_MAX_W = 1600;
  private readonly IMG_MAX_H = 1600;

  // Modal de feedback
  mostrarFeedback: boolean = false;
  feedbackTitulo: string = '';
  feedbackMensaje: string = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  // Detalle de CursoFecha
  cursoFechaSeleccionada: CursoFecha | null = null;

  // Lista de reservas
  reservas: Reservas[] = [];

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
    private csvExportService: CsvExportService,

    private reservasService: ReservasService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerCursos();
    this.obtenerCursoFechas();
    
    this.cargarReservas();
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
        this.cursosCargados = true;
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
    } as unknown as Curso;
    this.initSlots();
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

 async onSeleccionarArchivo(event: Event, slot: SlotImagen) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const original = input.files[0];
  input.value = ''; // permitir re-seleccionar el mismo archivo después

  // 🚫 Política STRICT: solo WebP y <= 800 KB
  if (!isWebpFile(original)) {
    this.mostrarModalFeedback(
      'error',
      'Invalid image',
      'Only WebP images are allowed.'
    );
    return;
  }

  if (isTooLarge(original, this.IMG_LIMIT_BYTES)) {
    this.mostrarModalFeedback(
      'error',
      'Image too large',
      `The file must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`
    );
    return;
  }

  // ✅ Pasa validación
  slot.file = original;
  slot.markedForDelete = false;
  slot.previewUrl = await fileToDataUrl(original);
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

  // 🔒 Doble validación de seguridad
  for (const s of this.slots) {
    if (s.file) {
      if (!isWebpFile(s.file)) {
        this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
        return;
      }
      if (isTooLarge(s.file, this.IMG_LIMIT_BYTES)) {
        this.mostrarModalFeedback(
          'error',
          'Image too large',
          `Each image must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`
        );
        return;
      }
    }
  }

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
    informacionExtra: this.cursoEditando.informacionExtra,
    localizacion: this.cursoEditando.localizacion
  };

  const fd = new FormData();
  fd.append('curso', new Blob([JSON.stringify(cursoDto)], { type: 'application/json' }));

  this.slots.forEach(s => {
    if (s.file) {
      // (opcional) seguridad extra en runtime
      if (isWebpFile(s.file) && !isTooLarge(s.file, this.IMG_LIMIT_BYTES)) {
        fd.append(`img${s.slot}`, s.file);
      }
    }
  });

  this.slots.forEach(s => {
    if (s.markedForDelete) fd.append(`deleteImg${s.slot}`, 'true');
  });

  const req$ = this.esNuevo
    ? this.cursoService.crearCurso(fd)
    : this.cursoService.actualizarCurso(fd, this.cursoEditando.id);

  req$.subscribe({
    next: () => {
      this.obtenerCursos();
      this.cancelarEdicion();
      this.mostrarModalFeedback('success', 'Course saved', 'The course has been saved successfully.');
    },
    error: (e) => {
      console.error('Error guardando curso', e);
      this.mostrarModalFeedback('error', 'Error saving course', 'Please review fields or try again.');
    }
  });
}


  eliminarCurso(id: number) {
    if (confirm('¿Estás seguro de eliminar este curso?')) {
      this.cursoService.eliminarCurso(id).subscribe(() => this.obtenerCursos());
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

    const req$ = this.esNuevaCursoFecha
      ? this.cursoFechaService.crearCursoFecha(this.cursoFechaEditando)
      : this.cursoFechaService.actualizarCursoFecha(this.cursoFechaEditando);

    req$.subscribe({
      next: () => {
        this.obtenerCursoFechas();
        this.cursoFechaEditando = null;
        this.esNuevaCursoFecha = false;
      },
      error: (e) => console.error('Error guardando fecha de curso', e)
    });
  }

  eliminarCursoFecha(id: number) {
    if (confirm('¿Estás seguro de eliminar esta fecha de curso?')) {
      this.cursoFechaService.eliminarCursoFecha(id).subscribe(() => this.obtenerCursoFechas());
    }
  }

  private comprobarCargaCompleta() {
    if (this.cursosCargados && this.fechasCargados) {
      this.loading = false;
    }
  }

  // --- RESERVAS / DETALLE DE FECHA ---

  private cargarReservas() {
    this.reservasService.getReservas().subscribe({
      next: (data) => (this.reservas = data ?? []),
      error: (e) => console.error('Error cargando reservas', e)
    });
  }

  verDetalleCursoFecha(cf: CursoFecha) {
    this.cursoFechaSeleccionada = cf;
  }

  cerrarDetalleCursoFecha() {
    this.cursoFechaSeleccionada = null;
  }

  get reservasDeFecha(): Reservas[] {
    if (!this.cursoFechaSeleccionada) return [];
    const idFechaSel = this.cursoFechaSeleccionada.id;
    return this.reservas.filter(r => r.idFecha === idFechaSel);
  }

  get totalPlazasReservadas(): number {
    return this.reservasDeFecha.reduce((sum, r) => sum + (Number(r.plazasReservadas) || 0), 0);
  }

    // Mostrar el modal
  mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }

  // Cerrar manual (si se pulsa la X)
  cerrarFeedback() {
    this.mostrarFeedback = false;
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
