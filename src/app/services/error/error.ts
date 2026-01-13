import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ErrorDto } from '../../models/error.model';
import { AuthService } from '../login/auth';

@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {
  private apiUrl = `${environment.apiUrl}/errores`;

  constructor(private http: HttpClient,
              private auth: AuthService
  ) {}

  /**
   * Obtiene todos los errores.
   * GET {apiUrl}
   */
  getErrores(): Observable<ErrorDto[]> {
    const token = this.auth.obtenerToken();

    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.get<ErrorDto[]>(this.apiUrl, { headers });
  }

}
