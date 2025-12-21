import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface OpenStudioSolicitudDto {
  option: string,
  nombre: string;
  email: string;
  telefono: string;
  preguntasAdicionales: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudioService {
  private apiUrl = `${environment.apiUrl}/studio`;

  constructor(private http: HttpClient) {}

  solicitarOpenStudio(solicitud: OpenStudioSolicitudDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/solicitud-studio`, solicitud);
  }
}

