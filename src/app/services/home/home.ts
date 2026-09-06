import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { Curso } from '../../models/curso.model';
import { Producto } from '../../models/producto.model';
import { resolverUrlsCurso, resolverUrlsProducto } from '../../utils/entity-image-url.util';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiCursos = `${environment.apiUrl}/cursos`;
  private apiProductos = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiCursos}/habilitados`).pipe(map(lista => lista.map(resolverUrlsCurso)));
  }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiProductos).pipe(map(lista => lista.map(resolverUrlsProducto)));
  }
}
