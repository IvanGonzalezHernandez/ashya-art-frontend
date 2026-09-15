import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { CursoFecha } from '../../models/cursoFecha.model';
import { AuthService } from '../login/auth';

@Injectable({
  providedIn: 'root'
})
export class CursoFechaService {
  private apiUrl = `${environment.apiUrl}/cursos-fecha`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.obtenerToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  // Obtener todas las fechas de cursos
  getCursoFechas(): Observable<CursoFecha[]> {
    return this.http.get<CursoFecha[]>(this.apiUrl);
  }

  getCursoFechaPorIdCurso(id: number): Observable<CursoFecha[]> {
    return this.http.get<CursoFecha[]>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva fecha de curso
  crearCursoFecha(fechaCurso: CursoFecha): Observable<CursoFecha> {
    return this.http.post<CursoFecha>(this.apiUrl, fechaCurso, { headers: this.authHeaders() });
  }

  // Actualizar fecha de curso existente
  actualizarCursoFecha(fechaCurso: CursoFecha): Observable<CursoFecha> {
    return this.http.put<CursoFecha>(`${this.apiUrl}/${fechaCurso.id}`, fechaCurso, { headers: this.authHeaders() });
  }

  // Eliminar fecha de curso por id
  eliminarCursoFecha(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  // Exportar CSV (opcional)
  exportarCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/csv`, { responseType: 'blob' });
  }
}
