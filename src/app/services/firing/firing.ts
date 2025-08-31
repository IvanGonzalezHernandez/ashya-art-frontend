import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface FiringServiceDto {
  tipoServicio: string;
  numeroPiezas: number;
  nombre: string;
  detallesMaterial: string;
  email: string;
  telefono: string;
  preguntasAdicionales: string;
}

@Injectable({
  providedIn: 'root'
})
export class FiringServiceService {
  private apiUrl = `${environment.apiUrl}/firing`;

  constructor(private http: HttpClient) {}

  solicitarFiring(solicitud: FiringServiceDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/solicitud-firing`, solicitud);
  }
}
