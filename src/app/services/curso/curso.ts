import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environments';
import { Curso } from '../../models/curso.model';
import { Cliente } from '../../models/cliente.model';
import { resolverUrlsCurso } from '../../utils/entity-image-url.util';
import { AuthService } from '../login/auth';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  public apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.obtenerToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

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
    return this.http.post(this.apiUrl, formData, { headers: this.authHeaders() });
  }

  actualizarCurso(formData: FormData, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers: this.authHeaders() });
  }

  eliminarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  solicitarCurso(cliente: Cliente): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/solicitud-curso`, cliente);
  }
}
