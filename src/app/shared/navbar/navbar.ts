import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
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
  
  // Gift card
  codigoTarjeta: string = '';
  mensajeCodigo: string = '';
  errorCodigo: string = '';
  totalConDescuento: number | null = null;
  descuentoAplicado: number = 0; // <— NUEVO

  // Si más adelante diferencias métodos de pago
  metodoPago: 'stripe' | 'atelier' | null = null;

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
    preguntasAdicionales: '',
    infoComercial: true,
    privacidad: false
  };

  prefijos = [
  { codigo: '+1', pais: 'USA / Canada' },
  { codigo: '+34', pais: 'Spain' },
  { codigo: '+49', pais: 'Germany' },
  { codigo: '+33', pais: 'France' },
  { codigo: '+351', pais: 'Portugal' },
  { codigo: '+44', pais: 'United Kingdom' },
  { codigo: '+39', pais: 'Italy' },
  { codigo: '+40', pais: 'Romania' },
  { codigo: '+48', pais: 'Poland' },
  { codigo: '+43', pais: 'Austria' },
  { codigo: '+41', pais: 'Switzerland' },
  { codigo: '+386', pais: 'Slovenia' },
  { codigo: '+385', pais: 'Croatia' },
  { codigo: '+90', pais: 'Turkey' },
  // … puedes añadir más si quieres
];

prefijoSeleccionado = '+49'; // 🇩🇪 Alemania por defecto


  constructor(public carritoService: CarritoService,
    private router: Router, 
    private route: ActivatedRoute) {}

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

      // Si hay un descuento aplicado, re-calcular el total con el nuevo total bruto
      if (this.descuentoAplicado > 0) {
        const bruto = this.carritoService.obtenerTotal();
        const nuevoTotal = Math.max(0, bruto - this.descuentoAplicado);
        this.totalConDescuento = Number(nuevoTotal.toFixed(2));
      } else {
        this.totalConDescuento = null;
      }

      // Si ya no son solo cursos y estabas en modo atelier, reset
      if (!this.soloCursos && this.metodoPago === 'atelier') {
        this.metodoPago = null;
      }
    });
  }

  // ======== UI Básica ========
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

  // ======== Flujo de confirmación general ========
  confirmarDatos() {
    // Validar mínimos (nombre + apellido + email)
    if (!this.cliente.nombre || !this.cliente.apellido || !this.cliente.email) {
      alert('Please complete the required fields: name, last name and email.');
      return;
    }

    // Combinar prefijo + número ANTES de enviar al backend
    this.cliente.telefono = `${this.prefijoSeleccionado} ${this.cliente.telefono}`.trim();

    // Cerrar modal
    const modalEl = document.getElementById('modalCliente');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();

    // 1) Compra gratuita (total 0€)
    if (this.esCompraGratis) {
      this.confirmarCompraGratis();
      return;
    }

    // 2) Pagar en Atelier (solo cursos)
    if (this.metodoPago === 'atelier') {
      this.confirmarReservaAtelier();
      return;
    }

    // 3) Stripe por defecto
    this.pagarConStripe();
  }

  // ======== Stripe ========
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

  // ======== Atelier ========
  pagarEnAtelier() {
    // Cierra el offcanvas del carrito
    const offcanvasEl = document.getElementById('offcanvasCarrito');
    if (offcanvasEl) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      bsOffcanvas?.hide();
    }

    // Marca el método de pago y abre modal cliente
    this.metodoPago = 'atelier';
    this.abrirModalCliente();
  }

  confirmarReservaAtelier() {
  if (this.loadingCheckout) return;
  this.loadingCheckout = true;

  const total = this.totalConDescuento ?? this.carritoService.obtenerTotal();

  // Cierra offcanvas si está abierto
  const offcanvasEl = document.getElementById('offcanvasCarrito');
  if (offcanvasEl) {
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas?.hide();
  }

  // Cierra modal si estuviera abierto
  const modalEl = document.getElementById('modalCliente');
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  modalInstance?.hide();

  // Registrar la reserva/pedido sin pago online
  this.carritoService.crearReservaAtelier(this.cliente, total, this.codigoTarjeta).subscribe({
    next: () => {
      this.loadingCheckout = false;
      this._resetEstadoPostCompra();

      // Redirección igual que en compra gratuita
      this.router.navigate(['/'], {
        queryParams: { payment: 'success' }
      });
    },
    error: (err) => {
      console.error('Error al confirmar reserva Atelier', err);
      this.loadingCheckout = false;

      this.router.navigate(['/'], {
        queryParams: { payment: 'error' }
      });
    }
  });
}


// ======== Compra gratis (total 0€) ========
confirmarCompraGratis() {
  if (this.loadingCheckout) return;
  this.loadingCheckout = true;

  // Cierra el carrito si está abierto
  const offcanvasEl = document.getElementById('offcanvasCarrito');
  if (offcanvasEl) {
    const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas?.hide();
  }

  // Cierra modal cliente si está abierto
  const modalEl = document.getElementById('modalCliente');
  if (modalEl) {
    const modalInstance = (window as any).bootstrap?.Modal.getInstance(modalEl);
    modalInstance?.hide();
  }

  // Llama al backend para registrar la compra gratuita
  this.carritoService.crearCompraGratuita(this.cliente, this.codigoTarjeta).subscribe({
    next: () => {
      this.loadingCheckout = false;
      this._resetEstadoPostCompra();

      // ✅ Redirigir al home con parámetro payment=success
      this.router.navigate(['/'], {
        queryParams: { payment: 'success' }
      });
    },
    error: (err) => {
      console.error('Error al confirmar compra gratuita', err);
      this.loadingCheckout = false;

      // ❌ Redirigir al home con parámetro payment=error
      this.router.navigate(['/'], {
        queryParams: { payment: 'error' }
      });
    }
  });
}



  // ======== Gestión de items y gift card ========
  eliminarItem(index: number) {
    this.carritoService.eliminarItem(index);

    // Si había descuento, re-evalúa el total con descuento
    if (this.descuentoAplicado > 0) {
      const bruto = this.carritoService.obtenerTotal();
      this.totalConDescuento = Math.max(0, bruto - this.descuentoAplicado);
    }
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
        this.descuentoAplicado = Number(descuento) || 0; // <— guarda descuento
        const bruto = this.carritoService.obtenerTotal();
        const total = Math.max(0, bruto - this.descuentoAplicado);
        this.totalConDescuento = Number(total.toFixed(2));
        this.mensajeCodigo = `Code applied: discount of ${this.descuentoAplicado}€`;
        this.errorCodigo = '';
      },
      error: () => {
        this.errorCodigo = 'Invalid or already redeemed code';
        this.mensajeCodigo = '';
        this.descuentoAplicado = 0;
        this.totalConDescuento = null;
      }
    });
  }

  quitarCodigo() {
    this.codigoTarjeta = '';
    this.mensajeCodigo = '';
    this.errorCodigo = '';
    this.totalConDescuento = null;
    this.descuentoAplicado = 0;
    // this.metodoPago = null; // opcional
  }

  // ======== Getters de estado ========
  get soloCursos(): boolean {
    return (
      this.itemsCarrito.length > 0 &&
      this.itemsCarrito.every(item => item.tipo === 'CURSO')
    );
  }

  get esCompraGratis(): boolean {
    const total = this.totalConDescuento ?? this.carritoService.obtenerTotal();
    // Redondeo a 2 decimales para evitar problemas de coma flotante
    return this.itemsCarrito.length > 0 && Number((total ?? 0).toFixed(2)) === 0;
  }

  // ======== Utils ========
  private _resetEstadoPostCompra() {
    this.carritoService.vaciarCarrito();
    this.totalConDescuento = null;
    this.descuentoAplicado = 0;
    this.codigoTarjeta = '';
    this.mensajeCodigo = '';
    this.metodoPago = null;
  }
}
