import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemCarrito } from '../../models/item-carrito';
import { Cliente } from '../../models/cliente.model';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private items: ItemCarrito[] = [];
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  private contador = new BehaviorSubject<number>(0);

  private apiUrl = `${environment.apiUrl}/carrito`;

  constructor(private http: HttpClient) {
    const itemsGuardados = localStorage.getItem('carrito');
    if (itemsGuardados) {
      this.items = JSON.parse(itemsGuardados);
    }
    this.itemsSubject.next(this.items);
    this.actualizarContador();
  }

  getItems$(): Observable<ItemCarrito[]> {
    return this.itemsSubject.asObservable();
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

    this.persistir();
  }

  obtenerItems(): ItemCarrito[] {
    return [...this.items];
  }

  eliminarItem(index: number) {
    const items = [...this.items];
    items.splice(index, 1);
    this.items = items;
    this.persistir();
  }

  vaciarCarrito() {
    this.items = [];
    this.persistir();
    localStorage.removeItem('carrito'); // opcional
  }

  private actualizarContador() {
    const total = this.items.reduce((sum, item) => sum + item.cantidad, 0);
    this.contador.next(total);
  }

  private persistir() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
    this.itemsSubject.next([...this.items]); // aquí notificamos cambios
    this.actualizarContador();
  }

  obtenerTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  crearSesionStripe(cliente: Cliente, total: number, codigoTarjeta?: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.apiUrl}`, { 
      carrito: { items: this.obtenerItems() },
      cliente: cliente,
      totalConDescuento: total,
      codigoTarjeta: codigoTarjeta?.trim().toUpperCase() || null
    });
  }
  
  validarTarjeta(codigo: string): Observable<number> {
    return this.http.post<number>(`${environment.apiUrl}/tarjetas-regalo/validar`, { codigo });
  }

}
