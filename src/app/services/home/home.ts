import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Curso } from '../../models/curso.model';
import { Producto } from '../../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiCursos = `${environment.apiUrl}/cursos`;
  private apiProductos = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiCursos);
  }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiProductos);
  }
}
