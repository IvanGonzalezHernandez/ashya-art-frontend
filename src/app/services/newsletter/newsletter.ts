import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Newsletter } from '../../models/newsletter.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AuthService } from '../login/auth';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private apiUrl = `${environment.apiUrl}/newsletters`;

  constructor(private http: HttpClient,
              private auth: AuthService 
  ) {}

getNewsletters(): Observable<Newsletter[]> {
  const token = this.auth.obtenerToken();

  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();

  return this.http.get<Newsletter[]>(this.apiUrl, { headers });
}

crearNewsletter(newsletter: Newsletter): Observable<Newsletter> {
  const token = this.auth.obtenerToken();

  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();

  return this.http.post<Newsletter>(this.apiUrl, newsletter, { headers });
}

actualizarNewsletter(newsletter: Newsletter): Observable<Newsletter> {
  const token = this.auth.obtenerToken();

  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();

  return this.http.put<Newsletter>(
    `${this.apiUrl}/${newsletter.id}`,
    newsletter,
    { headers }
  );
}

eliminarNewsletter(id: number): Observable<void> {
  const token = this.auth.obtenerToken();

  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();

  return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
}

  suscribirse(newsletter: Partial<Newsletter>): Observable<Newsletter> {
    return this.http.post<Newsletter>(`${this.apiUrl}/suscribirse`, newsletter);
  }
}
