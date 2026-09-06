import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { Producto } from '../../models/producto.model';
import { resolverUrlsProducto } from '../../utils/entity-image-url.util';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  private apiProductos = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiProductos).pipe(map(lista => lista.map(resolverUrlsProducto)));
  }

  getProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiProductos}/${id}`).pipe(map(resolverUrlsProducto));
  }
}
