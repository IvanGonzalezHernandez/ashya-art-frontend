import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito/carrito';
import { ItemCarrito } from '../../models/item-carrito';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../models/cliente.model';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit {
  loadingCheckout = false;
  contadorCarrito: number = 0;
  itemsCarrito: ItemCarrito[] = [];
  
  //Código tarjeta regalo canjeo
  codigoTarjeta: string = '';
  mensajeCodigo: string = '';
  errorCodigo: string = '';
  totalConDescuento: number | null = null;

  // Datos cliente
  cliente: Cliente = {
    id: 0,
    telefono: '',
    nombre: '',
    apellido: '',
    email: '',
    calle: '',
    numero: '',
    piso: '',
    provincia: '',
    ciudad: '',
    pais: '',
    codigoPostal: '',
    tipoClase: '',
    personasInteresadas: 1,
    disponibilidad: '',
    preguntasAdicionales: ''
  };


  constructor(public carritoService: CarritoService) {}

  ngOnInit(): void {
      // contador para el badge
      this.carritoService.getContador().subscribe(contador => {
        this.contadorCarrito = contador;
      });

      // items para pintar el listado y reaccionar al vaciado
      this.carritoService.getItems$().subscribe(items => {
        this.itemsCarrito = items;

        // Abrir carrito automáticamente si hay items
        if (items.length > 0) {
          this.abrirCarrito();
        }
      });
  }


  abrirCarrito() {
    // Cerrar modales abiertos
    const modales = document.querySelectorAll('.modal.show');
    modales.forEach(modalEl => {
      const modalInstance = bootstrap.Modal.getInstance(modalEl as HTMLElement) 
                          || new bootstrap.Modal(modalEl as HTMLElement);
      modalInstance.hide();
    });

    // Abrir offcanvas del carrito
    const carritoEl = document.getElementById('offcanvasCarrito');
    if (carritoEl) {
      const carrito = bootstrap.Offcanvas.getInstance(carritoEl) 
                      || new bootstrap.Offcanvas(carritoEl);
      carrito.show();
    }
  }

  abrirModalCliente() {
    // 1) Cierra offcanvas si está abierto
    const offcanvasEl = document.getElementById('offcanvasCarrito');
    if (offcanvasEl && offcanvasEl.classList.contains('show')) {
      bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl).hide();
      offcanvasEl.addEventListener('hidden.bs.offcanvas', () => this._openClienteModal(), { once: true });
    } else {
      this._openClienteModal();
    }
  }
  //Método Auxiliar para abrir el modal por problemas que he tenido con los fade
  private _openClienteModal() {
    // 2) Limpia backdrops “colgados”
    document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach(el => el.remove());

    // 3) Mueve el modal al body (clave para el z-index correcto)
    const modalEl = document.getElementById('modalCliente') as HTMLElement | null;
    if (!modalEl) return;
    if (modalEl.parentElement !== document.body) {
      document.body.appendChild(modalEl);
    }

    // 4) Abre el modal con backdrop normal
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true, focus: true, keyboard: true });
    modal.show();
  }

  confirmarDatos() {
    // Validar mínimos (nombre + apellido + email)
    if (!this.cliente.nombre || !this.cliente.apellido || !this.cliente.email) {
      alert('Please complete the required fields: name, last name and email.');
      return;
    }

    // Cerrar modal
    const modalEl = document.getElementById('modalCliente');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();

    // Procesar Stripe
    this.pagarConStripe();
  }

pagarConStripe() {
  this.loadingCheckout = true;

  const total = this.totalConDescuento ?? this.carritoService.obtenerTotal();

  // Cerrar offcanvas del carrito
  const offcanvasEl = document.getElementById('offcanvasCarrito');
  if (offcanvasEl) {
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas?.hide();
  }

  // Crear sesión de Stripe enviando carrito + cliente + total descontado + código
  this.carritoService.crearSesionStripe(this.cliente, total, this.codigoTarjeta).subscribe({
    next: (data: { url: string }) => {
      window.location.href = data.url;
    },
    error: (err) => {
      console.error('Error al crear sesión de Stripe', err);
      alert('Error procesing the payment');
      this.loadingCheckout = false;
    }
  });
}


  eliminarItem(index: number) {
    this.carritoService.eliminarItem(index);
  }



  aplicarCodigo() {
    if (!this.codigoTarjeta.trim()) {
      this.errorCodigo = 'Please, introduce a valid code';
      this.mensajeCodigo = '';
      return;
    }

    // Llamada a tu backend para validar el código
    this.carritoService.validarTarjeta(this.codigoTarjeta).subscribe({
      next: (descuento: number) => {
        this.totalConDescuento = this.carritoService.obtenerTotal() - descuento;
        if (this.totalConDescuento < 0) this.totalConDescuento = 0;
        this.mensajeCodigo = `Code applied: discount of ${descuento}€`;
        this.errorCodigo = '';
      },
      error: () => {
        this.errorCodigo = 'Invalid or already redeemed code';
        this.mensajeCodigo = '';
      }
    });
  }

  
  }
