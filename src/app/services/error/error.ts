import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ErrorDto } from '../../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {
  private apiUrl = `${environment.apiUrl}/errores`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los errores.
   * GET {apiUrl}
   */
  getErrores(): Observable<ErrorDto[]> {
    return this.http.get<ErrorDto[]>(`${this.apiUrl}`);
  }

}
