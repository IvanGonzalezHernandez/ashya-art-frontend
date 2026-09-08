import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AuthService } from '../login/auth';
import { EmailEnviadoListaResponse, EmailEnviadoDetalle } from '../../models/email-enviado.model';

@Injectable({
  providedIn: 'root'
})
export class EmailEnviadoService {
  private apiUrl = `${environment.apiUrl}/admin/emails`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  listarEmails(limit: number = 20, after?: string, before?: string): Observable<EmailEnviadoListaResponse> {
    const token = this.auth.obtenerToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    let params = new HttpParams().set('limit', limit);
    if (after) params = params.set('after', after);
    if (before) params = params.set('before', before);

    return this.http.get<EmailEnviadoListaResponse>(this.apiUrl, { headers, params });
  }

  obtenerEmail(id: string): Observable<EmailEnviadoDetalle> {
    const token = this.auth.obtenerToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<EmailEnviadoDetalle>(`${this.apiUrl}/${id}`, { headers });
  }
}
