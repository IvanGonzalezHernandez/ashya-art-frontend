import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly KEY = 'maintenance_unlocked';
  private apiUrl = `${environment.apiUrl}/config/mantenimiento`;

  constructor(private http: HttpClient) {}

  // Consultado por el guard público en cada navegación. Si el backend no responde,
  // se asume que NO hay mantenimiento (falla abierto) para no bloquear el sitio por error.
  isEnabled(): Observable<boolean> {
    return this.http.get<{ activo: boolean }>(this.apiUrl).pipe(
      map(res => !!res.activo),
      catchError(() => of(false))
    );
  }

  // Usado desde el panel de admin (Utils) para activar/desactivar mantenimiento.
  setEnabled(activo: boolean, token: string | null): Observable<boolean> {
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http
      .put<{ activo: boolean }>(this.apiUrl, { activo }, { headers })
      .pipe(map(res => !!res.activo));
  }

  isUnlocked(): boolean {
    return sessionStorage.getItem(this.KEY) === 'true';
  }

  unlock(pass: string): boolean {
    if (pass === environment.maintenancePassword) {
      sessionStorage.setItem(this.KEY, 'true');
      return true;
    }
    return false;
  }

  lock(): void {
    sessionStorage.removeItem(this.KEY);
  }
}
