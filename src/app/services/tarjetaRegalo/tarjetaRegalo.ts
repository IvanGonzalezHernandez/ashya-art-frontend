import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TarjetaRegalo } from '../../models/tarjetaRegalo.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class TarjetaRegaloService {
  private apiUrl = `${environment.apiUrl}/tarjetas-regalo`;

  constructor(private http: HttpClient) {}

  getTarjetas(): Observable<TarjetaRegalo[]> {
    return this.http.get<TarjetaRegalo[]>(this.apiUrl);
  }

  crearTarjeta(tarjeta: TarjetaRegalo): Observable<TarjetaRegalo> {
    return this.http.post<TarjetaRegalo>(this.apiUrl, tarjeta);
  }

  actualizarTarjeta(tarjeta: TarjetaRegalo): Observable<TarjetaRegalo> {
    return this.http.put<TarjetaRegalo>(`${this.apiUrl}/${tarjeta.id}`, tarjeta);
  }

  eliminarTarjeta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
