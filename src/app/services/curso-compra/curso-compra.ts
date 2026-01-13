import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Reservas } from '../../models/curso-compra.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AuthService } from '../login/auth';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private apiUrl = `${environment.apiUrl}/cursos-compra`;

  constructor(private http: HttpClient,
              private auth: AuthService
  ) {}

getReservas(): Observable<Reservas[]> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.get<Reservas[]>(this.apiUrl, { headers });
}


crearReserva(reserva: Reservas): Observable<Reservas> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.post<Reservas>(this.apiUrl, reserva, { headers });
}

actualizarReserva(reserva: Reservas): Observable<Reservas> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.put<Reservas>(
    `${this.apiUrl}/${reserva.id}`,
    reserva,
    { headers }
  );
}

eliminarReserva(id: number): Observable<void> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
}
}
