import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { TarjetaRegalo } from '../../models/tarjetaRegalo.model';

@Injectable({ providedIn: 'root' })
export class TarjetaRegaloService {
  private apiUrl = `${environment.apiUrl}/tarjetas-regalo`;

  constructor(private http: HttpClient) {}

  // ---- Lectura ----
  getTarjetas(): Observable<TarjetaRegalo[]> {
    return this.http.get<TarjetaRegalo[]>(this.apiUrl);
  }

  getTarjetaPorId(id: number): Observable<TarjetaRegalo> {
    return this.http.get<TarjetaRegalo>(`${this.apiUrl}/${id}`);
  }

  // Para usar en <img [src]>
  getImagenUrl(id: number): string {
    return `${this.apiUrl}/${id}/imagen`;
  }

  // ---- Escritura (multipart/form-data) ----
  crearTarjeta(formData: FormData): Observable<TarjetaRegalo> {
    return this.http.post<TarjetaRegalo>(this.apiUrl, formData);
  }

  actualizarTarjeta(id: number, formData: FormData): Observable<TarjetaRegalo> {
    return this.http.put<TarjetaRegalo>(`${this.apiUrl}/${id}`, formData);
  }

  eliminarTarjeta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Helpers ---
  private toLocalDateString(d?: string | Date | null): string | null {
    if (!d) return null;
    if (typeof d === 'string') return d; // asumimos formato valido
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const date = d as Date;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  /**
   * Construye el FormData esperado por el backend:
   *  - 'tarjeta' -> Blob(JSON con campos)
   *  - 'img' (opcional) -> File
   *  - 'deleteImg' (opcional) -> 'true' si NO hay file y queremos borrar la existente
   */
  buildFormData(
    tarjeta: Partial<TarjetaRegalo>,
    file?: File,
    markedForDelete?: boolean
  ): FormData {
    const dto: any = {
      id: tarjeta.id ?? null,
      nombre: tarjeta.nombre ?? '',
      precio: tarjeta.precio ?? 0,
      estado: (tarjeta as any).estado ?? true,
      stock: (tarjeta as any).stock ?? null,
      fechaAlta: this.toLocalDateString((tarjeta as any).fechaAlta ?? null),
      fechaBaja: this.toLocalDateString((tarjeta as any).fechaBaja ?? null),
    };

    const fd = new FormData();
    fd.append('tarjeta', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    if (file) {
      // si hay nuevo archivo, NO mandamos deleteImg
      fd.append('img', file, file.name);
    } else if (markedForDelete) {
      fd.append('deleteImg', 'true');
    }

    return fd;
  }
}
