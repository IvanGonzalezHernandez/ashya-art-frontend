import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AuthService } from '../login/auth';

export interface DashboardTotals {
  totalClientes: number;
  totalProductos: number;
  totalReservas: number;
  totalIngresos: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient,
              private auth: AuthService
  ) {}

  getTotals(): Observable<DashboardTotals> {
    const token = this.auth.obtenerToken();

    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.get<DashboardTotals>(
      `${this.apiUrl}/totals`,
      { headers }
    );
  }
}
