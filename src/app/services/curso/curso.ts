import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { Curso } from '../../models/curso.model';
import { Cliente } from '../../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  public apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  getCursoPorId(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
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

  getImagenUrl(idCurso: number, slot: number): string {
    return `${this.apiUrl}/${idCurso}/imagen/${slot}`;
  }
}
