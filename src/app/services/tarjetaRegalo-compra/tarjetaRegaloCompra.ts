import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { TarjetaRegaloCompra } from '../../models/tarjetaRegalo-compra.model';
import { AuthService } from '../login/auth';

@Injectable({ providedIn: 'root' })
export class TarjetaRegaloCompraService {
  private apiUrl = `${environment.apiUrl}/tarjetas-regalo-compra`;

  constructor(private http: HttpClient,
              private auth: AuthService 
  ) {}

  // ---- Lectura ----
getTarjetas(): Observable<TarjetaRegaloCompra[]> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.get<TarjetaRegaloCompra[]>(this.apiUrl, { headers });
}

marcarCanjeada(id: number): Observable<void> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.put<void>(`${this.apiUrl}/${id}/canjear`, {}, { headers });
}

eliminarCompra(id: number): Observable<void> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
}
}
