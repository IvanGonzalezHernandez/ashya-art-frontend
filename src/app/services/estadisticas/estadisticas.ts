import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AuthService } from '../login/auth';

export type PeriodoEstadisticas = '7d' | '30d' | '12m';

export interface Cuenta {
  clave: string;
  visitas: number;
}

export interface TallerEstadisticas {
  id: number;
  nombre: string;
  vistas: number;
  reservas: number;
}

export interface Estadisticas {
  periodo: PeriodoEstadisticas;
  etiquetas: string[];
  serieActual: number[];
  serieAnterior: number[];
  visitas: number;
  visitasAnterior: number;
  paginasVistas: number;
  reservas: number;
  reservasAnterior: number;
  vistasTalleres: number;
  desdeGoogle: number;
  talleres: TallerEstadisticas[];
  paginas: Cuenta[];
  origenes: Cuenta[];
  dispositivos: Cuenta[];
  idiomas: Cuenta[];
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private apiUrl = `${environment.apiUrl}/admin/estadisticas`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getResumen(periodo: PeriodoEstadisticas): Observable<Estadisticas> {
    const token = this.auth.obtenerToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.get<Estadisticas>(this.apiUrl, { headers, params: new HttpParams().set('periodo', periodo) });
  }
}
