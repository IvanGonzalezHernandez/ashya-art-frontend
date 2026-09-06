import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environments';
import { Curso } from '../../models/curso.model';
import { Cliente } from '../../models/cliente.model';
import { resolverUrlsCurso } from '../../utils/entity-image-url.util';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  public apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl).pipe(map(lista => lista.map(resolverUrlsCurso)));
  }

  getCursosHabilitados(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}/habilitados`).pipe(map(lista => lista.map(resolverUrlsCurso)));
  }

  getCursoPorId(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`).pipe(map(resolverUrlsCurso));
  }

  crearCurso(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  actualizarCurso(formData: FormData, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  eliminarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  solicitarCurso(cliente: Cliente): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/solicitud-curso`, cliente);
  }
}
