import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reservas } from '../../models/curso-compra.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private apiUrl = `${environment.apiUrl}/cursos-compra`;

  constructor(private http: HttpClient) {}

  getReservas(): Observable<Reservas[]> {
    return this.http.get<Reservas[]>(this.apiUrl);
  }

  crearReserva(reserva: Reservas): Observable<Reservas> {
    return this.http.post<Reservas>(this.apiUrl, reserva);
  }

  actualizarReserva(reserva: Reservas): Observable<Reservas> {
    return this.http.put<Reservas>(`${this.apiUrl}/${reserva.id}`, reserva);
  }

  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
