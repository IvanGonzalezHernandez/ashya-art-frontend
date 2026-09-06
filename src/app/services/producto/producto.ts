import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../models/producto.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { resolverUrlsProducto } from '../../utils/entity-image-url.util';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl).pipe(map(lista => lista.map(resolverUrlsProducto)));
  }

 // Igual que cursos: POST multipart (FormData con 'producto', 'img1'..'img5', 'deleteImgN' opcional)
  crearProducto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // Igual que cursos: PUT multipart
  actualizarProducto(formData: FormData, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  crearProductoConImagenes(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}`, formData).pipe(map(resolverUrlsProducto));
  }

  actualizarProductoConImagenes(id: number, formData: FormData): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, formData).pipe(map(resolverUrlsProducto));
  }


}
