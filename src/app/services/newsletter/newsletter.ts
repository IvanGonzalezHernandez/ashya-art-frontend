import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Newsletter } from '../../models/newsletter.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private apiUrl = `${environment.apiUrl}/newsletters`;

  constructor(private http: HttpClient) {}

  getNewsletters(): Observable<Newsletter[]> {
    return this.http.get<Newsletter[]>(this.apiUrl);
  }

  crearNewsletter(newsletter: Newsletter): Observable<Newsletter> {
    return this.http.post<Newsletter>(this.apiUrl, newsletter);
  }

  actualizarNewsletter(newsletter: Newsletter): Observable<Newsletter> {
    return this.http.put<Newsletter>(`${this.apiUrl}/${newsletter.id}`, newsletter);
  }

  eliminarNewsletter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  suscribirse(newsletter: Partial<Newsletter>): Observable<Newsletter> {
    return this.http.post<Newsletter>(`${this.apiUrl}/suscribirse`, newsletter);
  }
}
