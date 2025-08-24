import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../../services/home/home';
import { Curso } from '../../../models/curso.model';
import { Producto } from '../../../models/producto.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarritoService } from '../../../services/carrito/carrito';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, FeedbackModalComponent, CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  loading = false;
  cursosCargados = false;
  productosCargados = false;

  // Modal de feedback
  mostrarFeedback: boolean = false;
  feedbackTitulo: string = '';
  feedbackMensaje: string = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  cursos: Curso[] = [];
  productos: Producto[] = [];

  constructor(private homeService: HomeService,
              private route: ActivatedRoute, 
              private router: Router,
              private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.loading = true;
    this.cargarCursos();
    this.cargarProductos();

    // Revisar si viene de Stripe
    this.route.queryParams.subscribe(params => {
      const payment = params['payment'];
      if (payment) {
        if (payment === 'success') {
          // ✅ Vaciar carrito correctamente
          this.carritoService.vaciarCarrito();

          this.mostrarModalFeedback(
            'success',
            'Payment successful',
            'Thank you! Your payment was completed. You will receive an email shortly with your invoice and your order number.'
          );
        } else {
          this.mostrarModalFeedback(
            'error',
            'Payment failed',
            'Oops! Your payment could not be completed. Please try again. If the problem persists, contact us directly at +01 532 223 434.'
          );
        }
        // Limpiar query params para que no vuelva a abrir el modal al refrescar
        this.router.navigate([], { queryParams: {} });
      }
    });
  }
  
  imagenes = [
    'assets/instagram/galery_1.webp',
    'assets/instagram/galery_2.webp',
    'assets/instagram/galery_3.webp',
    'assets/instagram/galery_4.webp',
    'assets/instagram/galery_5.webp',
    'assets/instagram/galery_6.webp',
    'assets/instagram/galery_7.webp',
    'assets/instagram/galery_8.webp'
  ];

  mostrarOverlay(event: MouseEvent) {
    const overlay = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.overlay');
    if (overlay) {
      overlay.style.opacity = '1';
    }
  }

  ocultarOverlay(event: MouseEvent) {
    const overlay = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.overlay');
    if (overlay) {
      overlay.style.opacity = '0';
    }
  }
  
  private cargarCursos(): void {
    this.homeService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cursos.forEach(curso => this.procesarImagenesBase64(curso));
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

  private cargarProductos(): void {
    this.homeService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosCargados = true;
        this.comprobarCargaCompleta();
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.productosCargados = true;
        this.comprobarCargaCompleta();
      },
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
    if (this.cursosCargados && this.productosCargados) {
      this.loading = false;
    }
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
  
  
}
