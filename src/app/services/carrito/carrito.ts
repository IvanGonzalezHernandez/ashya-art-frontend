import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ItemCarrito } from '../../models/item-carrito';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private items: ItemCarrito[] = [];
  private contador = new BehaviorSubject<number>(0);

  getContador(): Observable<number> {
    return this.contador.asObservable();
  }

  agregarItem(item: ItemCarrito) {
    const existente = this.items.find(i => i.id === item.id && i.tipo === item.tipo);

    const cantidad = Number(item.cantidad); // asegurarse de que es número

    if (existente) {
        existente.cantidad += cantidad; // sumar al existente
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

}
