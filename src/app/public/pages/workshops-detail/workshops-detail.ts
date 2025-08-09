import { Component } from '@angular/core';
import { Curso } from '../../../models/curso.model';
import { Cliente } from '../../../models/cliente.model';
import { CursoFecha } from '../../../models/cursoFecha.model';
import { CursoService } from '../../../services/curso/curso';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursoFechaService } from '../../../services/curso-fecha/curso-fecha';

declare var bootstrap: any;

@Component({
  selector: 'app-workshops-detail',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './workshops-detail.html',
  styleUrl: './workshops-detail.scss'
})
export class WorkshopsDetail {
  cursos: Curso[] = [];
  cursosFecha: CursoFecha[] = [];
  cursoSeleccionado?: Curso;

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
    classType: '',
    peopleInterested: 1,
    availability: '',
    additionalQuestions: ''
  };
  

  constructor(private cursoService: CursoService,
              private cursoFechaService: CursoFechaService,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
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
      },
      error: (err) => console.error(`Error cargando curso con ID ${id}`, err),
    });
  }

  private cargarCursoFechaPorIdCurso(id: number): void {
    this.cursoFechaService.getCursoFechaPorIdCurso(id).subscribe({
      next: (data) => {
        this.cursosFecha = data;
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

  
  

}
