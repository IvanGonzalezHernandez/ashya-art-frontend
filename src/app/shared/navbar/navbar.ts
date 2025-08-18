import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../services/carrito/carrito';
import { ItemCarrito } from '../../models/item-carrito';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit {
  loadingCheckout = false;

  contadorCarrito: number = 0;
  itemsCarrito: ItemCarrito[] = [];

  constructor(public carritoService: CarritoService) {}

  ngOnInit(): void {
    this.carritoService.getContador().subscribe(contador => {
      this.contadorCarrito = contador;
      this.itemsCarrito = [...this.carritoService.obtenerItems()];

      if (this.itemsCarrito.length > 0) {
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

pagarConStripe() {
  this.loadingCheckout = true;

  const offcanvasEl = document.getElementById('offcanvasCarrito');
  if (offcanvasEl) {
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas?.hide();
  }

  this.carritoService.crearSesionStripe().subscribe({
    next: (data: { url: string }) => {
      window.location.href = data.url;
    },
    error: (err) => {
      console.error('Error al crear sesión de Stripe', err);
      alert('Hubo un error al procesar el pago.');
      this.loadingCheckout = false;
    }
  });
}



}