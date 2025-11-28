import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

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

  constructor(private http: HttpClient) {}

  getTotals(): Observable<DashboardTotals> {
    return this.http.get<DashboardTotals>(`${this.apiUrl}/totals`);
  }
}
