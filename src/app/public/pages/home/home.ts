import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../../services/home/home';
import { Curso } from '../../../models/curso.model';
import { Producto } from '../../../models/producto.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  loading = false;
  cursosCargados = false;
  productosCargados = false;

  cursos: Curso[] = [];
  productos: Producto[] = [];

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.loading = true;
    this.cargarCursos();
    this.cargarProductos();
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
  
  
}
