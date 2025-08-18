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

  constructor(private http: HttpClient) {
    // Cargar items desde LocalStorage al iniciar
    const itemsGuardados = localStorage.getItem('carrito');
    if (itemsGuardados) {
      this.items = JSON.parse(itemsGuardados);
      this.actualizarContador();
    }
  }

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
    this.guardarEnLocalStorage();
  }

  obtenerItems(): ItemCarrito[] {
    return [...this.items]; // devolver copia
  }

  eliminarItem(index: number) {
  // Hacemos una copia de los items actuales
  const items = [...this.items];
  
  // Eliminamos el item en la posición indicada
  items.splice(index, 1);

  // Actualizamos la lista de items, contador y LocalStorage
  this.items = items;
  this.actualizarContador();
  localStorage.setItem('carrito', JSON.stringify(this.items));
}


  private actualizarContador() {
    const total = this.items.reduce((sum, item) => sum + item.cantidad, 0);
    this.contador.next(total);
  }

  private guardarEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }

  obtenerTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  crearSesionStripe(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.apiUrl}`, { items: this.obtenerItems() });
  }
}
