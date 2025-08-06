import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../../services/home/home';
import { Curso } from '../../../models/curso.model';
import { Producto } from '../../../models/producto.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  cursos: Curso[] = [];
  productos: Producto[] = [];

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarProductos();
  }

  private cargarCursos(): void {
    this.homeService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.cursos.forEach(curso => this.procesarImagenesBase64(curso));
      },
      error: (err) => console.error('Error cargando cursos', err),
    });
  }  

  private cargarProductos(): void {
    this.homeService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error('Error cargando productos', err),
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
  
  
}
