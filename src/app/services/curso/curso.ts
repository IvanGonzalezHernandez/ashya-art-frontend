import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Curso } from '../../models/curso.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
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
}
