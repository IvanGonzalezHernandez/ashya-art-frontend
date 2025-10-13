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
      try {
        this.items = JSON.parse(itemsGuardados) || [];
      } catch {
        this.items = [];
      }
    }
    this.itemsSubject.next(this.items);
    this.actualizarContador();
  }

  // ---------------- Observables públicos ----------------
  getItems$(): Observable<ItemCarrito[]> {
    return this.itemsSubject.asObservable();
  }

  getContador(): Observable<number> {
    return this.contador.asObservable();
  }

  // ---------------- Helpers de dominio ----------------
  private isGiftCard(item: ItemCarrito): boolean {
    return item.tipo === 'TARJETA';
  }

  private mergeKey(item: ItemCarrito): string {
    // Para NO TARJETA, agrupamos por id+tipo
    return `${item.tipo}-${item.id}`;
  }

  // ¿El carrito está vacío?
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // ¿Todos los items son cursos?
  contieneSoloCursos(): boolean {
    return this.items.length > 0 && this.items.every(i => i.tipo === 'CURSO');
  }

  // ---------------- Mutadores ----------------
  agregarItem(item: ItemCarrito) {
    const cantidad = Number(item.cantidad) || 1;

    if (this.isGiftCard(item)) {
      // No agrupar TARJETA: 1 línea por unidad para preservar 'destinatario'
      for (let i = 0; i < cantidad; i++) {
        this.items.push({
          ...item,
          cantidad: 1,
          destinatario: (item.destinatario ?? '').trim(),
        });
      }
    } else {
      // Agrupar resto por id+tipo
      const key = this.mergeKey(item);
      const idx = this.items.findIndex(i => this.mergeKey(i) === key);
      if (idx >= 0) {
        const nueva = Number(this.items[idx].cantidad) + cantidad;
        this.items[idx].cantidad = isFinite(nueva) ? nueva : 1;
      } else {
        this.items.push({ ...item, cantidad });
      }
    }

    this.persistir();
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

  obtenerItems(): ItemCarrito[] {
    return [...this.items];
  }

  // ---------------- Totales ----------------
  obtenerTotal(): number {
    const total = this.items.reduce((sum, item) => {
      const precio = Number(item.precio) || 0;
      const cant = Number(item.cantidad) || 0;
      return sum + precio * cant;
    }, 0);
    return Number(total.toFixed(2));
  }

  // ---------------- Persistencia local ----------------
  private actualizarContador() {
    const total = this.items.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);
    this.contador.next(total);
  }

  private persistir() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
    this.itemsSubject.next([...this.items]);
    this.actualizarContador();
  }

  // ---------------- API ----------------
  crearSesionStripe(
    cliente: Cliente,
    total: number,
    codigoTarjeta?: string
  ): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.apiUrl}`, { 
      carrito: { items: this.obtenerItems() },
      cliente,
      totalConDescuento: Number((total ?? 0).toFixed(2)),
      codigoTarjeta: codigoTarjeta?.trim().toUpperCase() || null
    });
  }

  // Compra 100% cubierta por tarjeta regalo (total = 0)
  crearCompraGratuita(
    cliente: Cliente,
    codigoTarjeta?: string
  ): Observable<{ success: boolean; pedidoId?: number }> {
    return this.http.post<{ success: boolean; pedidoId?: number }>(
      `${this.apiUrl}/gratuita`,
      {
        carrito: { items: this.obtenerItems() },
        cliente,
        codigoTarjeta: codigoTarjeta?.trim().toUpperCase() || null
      }
    );
  }

  // Reserva/pedido para pagar en el Atelier (solo cursos)
  crearReservaAtelier(
    cliente: Cliente,
    total: number,
    codigoTarjeta?: string
  ): Observable<{ success: boolean; reservaId?: number }> {
    return this.http.post<{ success: boolean; reservaId?: number }>(
      `${this.apiUrl}/atelier`,
      {
        carrito: { items: this.obtenerItems() },
        cliente,
        totalConDescuento: Number((total ?? 0).toFixed(2)),
        codigoTarjeta: codigoTarjeta?.trim().toUpperCase() || null
      }
    );
  }

  // Validación de tarjetas regalo
  validarTarjeta(codigo: string): Observable<number> {
    return this.http.post<number>(
      `${environment.apiUrl}/tarjetas-regalo/validar`,
      { codigo }
    );
  }
}
