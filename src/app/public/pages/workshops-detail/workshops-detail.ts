import { Component } from '@angular/core';
import { Curso } from '../../../models/curso.model';
import { Cliente } from '../../../models/cliente.model';
import { CursoFecha } from '../../../models/cursoFecha.model';
import { CursoService } from '../../../services/curso/curso';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursoFechaService } from '../../../services/curso-fecha/curso-fecha';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { RouterModule } from '@angular/router';
import { ItemCarrito } from '../../../models/item-carrito';
import { CarritoService } from '../../../services/carrito/carrito';

declare var bootstrap: any;

@Component({
  selector: 'app-workshops-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FeedbackModalComponent, RouterModule],
  templateUrl: './workshops-detail.html',
  styleUrls: ['./workshops-detail.scss']
})
export class WorkshopsDetail {
  loading = false;
  cursosCargados = false;

  cursos: Curso[] = [];
  cursosFecha: CursoFecha[] = [];
  cursoSeleccionado?: Curso;

  cantidades: { [idFecha: number]: number } = {};

  // Modal de feedback
  mostrarFeedback: boolean = false;
  feedbackTitulo: string = '';
  feedbackMensaje: string = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  cliente: Cliente = {
    id: 0,
    telefono: '',
    nombre: '',
    apellido: '',
    email: '',
    calle: '',
    numero: '',
    piso: '',
    provincia: '',
    ciudad: '',
    pais: '',
    codigoPostal: '',
    tipoClase: '',
    personasInteresadas: 1,
    disponibilidad: '',
    preguntasAdicionales: '',
    infoComercial: false,
    privacidad: false
  };

  constructor(
    private cursoService: CursoService,
    private cursoFechaService: CursoFechaService,
    private route: ActivatedRoute,
    private carritoService: CarritoService
  ) {}

  // ================== Overlay utils (clave) ==================

  private resetOverlays() {
    document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  }

  private waitOnce(el: HTMLElement, eventName: string): Promise<void> {
    return new Promise(resolve => el.addEventListener(eventName, () => resolve(), { once: true }));
  }

  private getOpenOverlay(): { el: HTMLElement; type: 'modal' | 'offcanvas' } | null {
    const modal = document.querySelector('.modal.show') as HTMLElement | null;
    if (modal) return { el: modal, type: 'modal' };
    const canvas = document.querySelector('.offcanvas.show') as HTMLElement | null;
    if (canvas) return { el: canvas, type: 'offcanvas' };
    return null;
  }

  /** Cierra modal/offcanvas abierto (si lo hay) y espera a `hidden` */
  private async closeAnyOverlay(): Promise<void> {
    const open = this.getOpenOverlay();
    if (!open) { this.resetOverlays(); return; }

    if (open.type === 'modal') {
      const inst = bootstrap.Modal.getOrCreateInstance(open.el);
      inst.hide();
      await this.waitOnce(open.el, 'hidden.bs.modal');
    } else {
      const inst = bootstrap.Offcanvas.getOrCreateInstance(open.el);
      inst.hide();
      await this.waitOnce(open.el, 'hidden.bs.offcanvas');
    }

    this.resetOverlays();
  }

  /** Mueve el modal al body y devuelve su elemento (o null) */
  private prepareModalById(id: string): HTMLElement | null {
    const el = document.getElementById(id);
    if (!el) return null;
    if (el.parentElement !== document.body) document.body.appendChild(el);
    // No crear instancias duplicadas: usa siempre getOrCreate
    return el;
  }

  /** Cerrar lo abierto y luego abrir este modal */
  async openModal(id: string) {
    await this.closeAnyOverlay();
    const el = this.prepareModalById(id);
    if (!el) return;
    const modal = bootstrap.Modal.getOrCreateInstance(el, { backdrop: true, keyboard: true, focus: true });
    el.addEventListener('hidden.bs.modal', () => this.resetOverlays(), { once: true });
    this.resetOverlays();
    modal.show();
  }

  // ================== Lifecycle/data ==================

  ngOnInit(): void {
    this.loading = true;
    this.cargarCursos();

    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        const id = Number(idStr);
        if (!isNaN(id)) {
          this.cargarCursoPorId(id);
          this.cargarCursoFechaPorIdCurso(id);
        }
      }
    });
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

  private cargarCursoPorId(id: number): void {
    this.cursoService.getCursoPorId(id).subscribe({
      next: (curso) => {
        this.cursoSeleccionado = curso;
        if (curso) this.procesarImagenesBase64(curso);
        this.cursosCargados = true;
        this.comprobarCargaCompleta();
      },
      error: (err) => console.error(`Error cargando curso con ID ${id}`, err),
    });
  }

  private cargarCursoFechaPorIdCurso(id: number): void {
    this.cursoFechaService.getCursoFechaPorIdCurso(id).subscribe({
      next: (data) => {
        this.cursosFecha = data;
        this.cursosFecha.forEach(fecha => { this.cantidades[fecha.id] = 1; });
      },
      error: (err) => console.error(`Error cargando fechas del curso con ID ${id}`, err),
    });
  }

  private procesarImagenesBase64(curso: Curso): void {
    for (let i = 1; i <= 5; i++) {
      const imgProp = `img${i}` as keyof Curso;
      const urlProp = `img${i}Url` as keyof Curso;
      const base64Str = curso[imgProp] as unknown as string;
      (curso as any)[urlProp] = base64Str ? `data:image/webp;base64,${base64Str}` : '';
    }
  }

  private comprobarCargaCompleta(): void {
    if (this.cursosCargados) this.loading = false;
  }

  // ================== Acciones de UI ==================

  /** Abrir Reserva desde Fechas garantizando cierre previo */
  async abrirModalReservaDesdeModalFechas(): Promise<void> {
    await this.closeAnyOverlay();
    await this.openModal('modalReserva');
  }

  /** Añadir al carrito: cierra lo abierto y luego agrega (el Navbar ya abrirá el carrito) */
  async agregarCursoAlCarrito(fecha: any) {
    if (!this.cursoSeleccionado) return;
    const cantidad = this.cantidades[fecha.id] || 1;

    const item: ItemCarrito = {
      id: fecha.id,
      tipo: 'CURSO',
      nombre: `${this.cursoSeleccionado.nombre} - ${fecha.fecha}`,
      precio: this.cursoSeleccionado.precio ?? 0,
      cantidad,
      img: this.cursoSeleccionado.img1Url || '',
      subtitulo: this.cursoSeleccionado.subtitulo,
      fecha: fecha.fecha,
      hora: fecha.horaInicio
    };

    await this.closeAnyOverlay();
    // Deja un microturno al DOM tras el hidden antes de mutar estado
    setTimeout(() => this.carritoService.agregarItem(item), 0);
  }

  enviarSolicitudCurso() {
    this.cursoService.solicitarCurso(this.cliente).subscribe({
      next: async () => {
        this.mostrarModalFeedback(
          'success',
          'Request sent',
          'Thank you for submitting your request. You will receive a confirmation email shortly, and one of our team members will contact you as soon as possible to coordinate the details.'
        );
        await this.closeAnyOverlay();
      },
      error: async (err) => {
        console.error('Error sending request', err);
        await this.closeAnyOverlay();
        this.mostrarModalFeedback(
          'error',
          'Request error',
          'An error occurred while sending the request. Please try again later.'
        );
      }
    });
  }

  mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }

  cerrarFeedback() { this.mostrarFeedback = false; }

  // ================== Utilidades varias ==================

  esValido(valor: any): boolean {
    return valor !== null && valor !== undefined && valor !== '';
  }

  obtenerImagenesValidas(): string[] {
    if (!this.cursoSeleccionado) return [];
    const imagenes: (string | undefined)[] = [
      this.cursoSeleccionado.img1Url,
      this.cursoSeleccionado.img2Url,
      this.cursoSeleccionado.img3Url,
      this.cursoSeleccionado.img4Url,
      this.cursoSeleccionado.img5Url
    ];
    return imagenes.filter((img): img is string => !!img && img.trim() !== '');
  }
}
