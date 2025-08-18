import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemCarrito } from '../../models/item-carrito';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private items: ItemCarrito[] = [];
  private contador = new BehaviorSubject<number>(0);

  private apiUrl = `${environment.apiUrl}/carrito`;

  constructor(private http: HttpClient) {}

  getContador(): Observable<number> {
    return this.contador.asObservable();
  }

  agregarItem(item: ItemCarrito) {
    const existente = this.items.find(i => i.id === item.id && i.tipo === item.tipo);
    const cantidad = Number(item.cantidad);

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        this.items.push({ ...item, cantidad });
    }

    this.actualizarContador();
  }

  obtenerItems(): ItemCarrito[] {
    return this.items;
  }

  limpiarCarrito() {
    this.items = [];
    this.actualizarContador();
  }

  private actualizarContador() {
    const total = this.items.reduce((sum, item) => sum + item.cantidad, 0);
    this.contador.next(total);
  }

  obtenerTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  crearSesionStripe(): Observable<{ url: string }> {
    const carrito = this.obtenerItems();
    return this.http.post<{ url: string }>(`${this.apiUrl}`, { items: carrito });
  }
}
