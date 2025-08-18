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
    codigoPostal: '',

    // Campos formulario
    tipoClase: '',
    personasInteresadas: 1,
    disponibilidad: '',
    preguntasAdicionales: ''
  };
  

  constructor(private cursoService: CursoService,
              private cursoFechaService: CursoFechaService,
              private route: ActivatedRoute,
              private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.loading = true;
    this.cargarCursos();

    // Obtener el parámetro 'id' de la URL y cargar ese curso
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
        if (curso) {
          this.procesarImagenesBase64(curso);
        }
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

        this.cursosFecha.forEach(fecha => {
          this.cantidades[fecha.id] = 1;
        });
      },
      error: (err) => console.error(`Error cargando fechas del curso con ID ${id}`, err),
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

  enviarSolicitudCurso() {
    this.cursoService.solicitarCurso(this.cliente).subscribe({
      next: () => {
        this.mostrarModalFeedback(
          'success',
          'Request sent',
          'Thank you for submitting your request. You will receive a confirmation email shortly, and one of our team members will contact you as soon as possible to coordinate the details.'
        );
        
        const modal = document.getElementById('modalReserva');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();
        }
      },
      error: (err) => {
        console.error('Error sending request', err);
  
        const modal = document.getElementById('modalReserva');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();
        }
        let mensajeError = 'An error occurred while sending the request. Please try again later.';
        this.mostrarModalFeedback(
          'error',
          'Request error',
          mensajeError
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
  
    cerrarFeedback() {
      this.mostrarFeedback = false;
    }
  
  abrirModalReservaDesdeModalFechas(): void {
    const fechasModalEl = document.getElementById('modalFechasDisponibles');
    const reservaModalEl = document.getElementById('modalReserva');
    if (fechasModalEl && reservaModalEl) {
      const fechasModal = bootstrap.Modal.getInstance(fechasModalEl);
      if (fechasModal) fechasModal.hide();

      const reservaModal = new bootstrap.Modal(reservaModalEl);
      reservaModal.show();
    }
  }

agregarCursoAlCarrito(fecha: any) {
  if (!this.cursoSeleccionado) return;

  const cantidad = this.cantidades[fecha.id] || 1;

  const item: ItemCarrito = {
    id: fecha.id,
    tipo: 'CURSO',
    nombre: `${this.cursoSeleccionado.nombre} - ${fecha.fecha}`,
    precio: this.cursoSeleccionado.precio ?? 0,
    cantidad: cantidad,
    img: this.cursoSeleccionado.img1Url || ''
  };
  console.log(item);
  this.carritoService.agregarItem(item);
}



  
  

}
