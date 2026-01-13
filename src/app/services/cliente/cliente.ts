import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Cliente } from '../../models/cliente.model';
import { Observable } from 'rxjs';
import { AuthService } from '../login/auth';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  getClientes(): Observable<Cliente[]> {
    const token = this.auth.obtenerToken();

    const headers = token? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.get<Cliente[]>(this.apiUrl, { headers });
  }

crearCliente(cliente: Cliente): Observable<Cliente> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.post<Cliente>(this.apiUrl, cliente, { headers });
}

actualizarCliente(cliente: Cliente): Observable<Cliente> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.put<Cliente>(`${this.apiUrl}/${cliente.id}`, cliente, { headers });
}

eliminarCliente(id: number): Observable<void> {
  const token = this.auth.obtenerToken();

  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

  return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
}
}
