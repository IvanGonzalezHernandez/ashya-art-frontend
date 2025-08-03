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
      next: (data) => this.cursos = data,
      error: (err) => console.error('Error cargando cursos', err),
    });
  }

  private cargarProductos(): void {
    this.homeService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error('Error cargando productos', err),
    });
  }
}
