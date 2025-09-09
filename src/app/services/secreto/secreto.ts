import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Secreto } from '../../models/secreto.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SecretoService {
  private apiUrl = `${environment.apiUrl}/secretos`;

  constructor(private http: HttpClient) {}

  // --- CRUD básico ---
  getSecretos(): Observable<Secreto[]> {
    return this.http.get<Secreto[]>(this.apiUrl);
  }

  getSecretoPorId(id: number): Observable<Secreto> {
    return this.http.get<Secreto>(`${this.apiUrl}/${id}`);
  }

  /** Crear secreto con imágenes/PDF usando FormData (multipart/form-data) */
  crearSecreto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  /** Actualizar secreto con imágenes/PDF y flags de borrado */
  actualizarSecreto(formData: FormData, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  eliminarSecreto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Recursos públicos (para previews/enlaces) ---
  /** URL pública para la imagen de un slot (1..5) */
  getImagenUrl(idSecreto: number, slot: number): string {
    return `${this.apiUrl}/${idSecreto}/imagen/${slot}`;
  }

  /** URL pública para ver/descargar el PDF del secreto */
  getPdfUrl(idSecreto: number): string {
    return `${this.apiUrl}/${idSecreto}/pdf`;
  }
}
