import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { TarjetaRegaloCompra } from '../../models/tarjetaRegalo-compra.model';

@Injectable({ providedIn: 'root' })
export class TarjetaRegaloCompraService {
  private apiUrl = `${environment.apiUrl}/tarjetas-regalo-compra`;

  constructor(private http: HttpClient) {}

  // ---- Lectura ----
  // (lo dejo con el mismo nombre que pediste)
  getTarjetas(): Observable<TarjetaRegaloCompra[]> {
    return this.http.get<TarjetaRegaloCompra[]>(this.apiUrl);
  }

  // ---- Acciones opcionales (por si las usas) ----
  marcarCanjeada(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/canjear`, {});
  }

  eliminarCompra(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
