import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { SecretoCompra } from '../../models/secreto-compra.model';

@Injectable({ providedIn: 'root' })
export class SecretoCompraService {
  private apiUrl = `${environment.apiUrl}/secretos-compra`;

  constructor(private http: HttpClient) {}

  // GET simple
  getCompras(): Observable<SecretoCompra[]> {
    return this.http.get<SecretoCompra[]>(`${this.apiUrl}`);
  }

}
