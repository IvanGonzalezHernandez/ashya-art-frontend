import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../models/producto.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
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

  // URL directa para cada slot (preview en el modal)
  getImagenUrl(idProducto: number, slot: number): string {
    return `${this.apiUrl}/${idProducto}/imagen/${slot}`;
  }
  
  crearProductoConImagenes(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}`, formData);
  }

  actualizarProductoConImagenes(id: number, formData: FormData): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, formData);
  }


}
