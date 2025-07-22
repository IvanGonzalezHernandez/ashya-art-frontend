import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductoCompra } from '../../models/producto-compra.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ProductoCompraService {
  private apiUrl = `${environment.apiUrl}/productos-compra`;

  constructor(private http: HttpClient) {}

  getProductoCompras(): Observable<ProductoCompra[]> {
    return this.http.get<ProductoCompra[]>(this.apiUrl);
  }

  crearProductoCompra(compra: ProductoCompra): Observable<ProductoCompra> {
    return this.http.post<ProductoCompra>(this.apiUrl, compra);
  }

  actualizarProductoCompra(compra: ProductoCompra): Observable<ProductoCompra> {
    return this.http.put<ProductoCompra>(`${this.apiUrl}/${compra.id}`, compra);
  }

  eliminarProductoCompra(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
