import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TarjetaRegalo } from '../../../models/tarjetaRegalo.model';
import { TarjetaRegaloCompra } from '../../../models/tarjetaRegalo-compra.model';
import { Cliente } from '../../../models/cliente.model';

import { TarjetaRegaloService } from '../../../services/tarjetaRegalo/tarjetaRegalo';
import { TarjetaRegaloCompraService } from '../../../services/tarjetaRegalo-compra/tarjetaRegaloCompra';
import { ClienteService } from '../../../services/cliente/cliente';
import { CsvExportService } from '../../../services/csv/csv-export';

import { isWebpFile, isTooLarge, fileToDataUrl } from '../../../utils/image-optimizer.util';
import { FeedbackModalComponent } from '../../../shared/feedback-modal/feedback-modal';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

type SlotImagen = {
  previewUrl: string | null;
  file?: File;
  markedForDelete: boolean;
};

const CLIENTE_NUEVO_VACIO: Partial<Cliente> = {
  nombre: '', apellido: '', email: '', telefono: '',
  calle: '', numero: '', piso: '', provincia: '', ciudad: '', pais: '', codigoPostal: ''
};

@Component({
  selector: 'app-tarjetas-regalo-dashboard',
  standalone: true,
  templateUrl: './tarjetas-regalo-dashboard.html',
  styleUrls: ['./tarjetas-regalo-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, FeedbackModalComponent, ConfirmModalComponent]
})
export class TarjetasRegaloDashboard implements OnInit {
  // Loading
  loading = false;           // tarjetas
  loadingCompras = false;    // compras

  // límites imagen
  private readonly IMG_LIMIT_BYTES = 800 * 1024; // 800 KB
  private readonly IMG_MAX_W = 1600;
  private readonly IMG_MAX_H = 1600;

  // Modal feedback
  mostrarFeedback = false;
  feedbackTitulo = '';
  feedbackMensaje = '';
  feedbackTipo: 'success' | 'error' | 'info' = 'info';

  // Tarjetas regalo
  tarjetas: TarjetaRegalo[] = [];
  paginaActual: number = 1;
  tarjetaEditando: TarjetaRegalo | null = null;
  esNueva: boolean = false;

  // FILTROS TARJETAS
  filtroTextoTarjeta: string = '';
  filtroVisibilidad: string = '';

  get tarjetasFiltradas(): TarjetaRegalo[] {
    const texto = this.filtroTextoTarjeta.trim().toLowerCase();
    return (this.tarjetas || []).filter(t => {
      const coincideTexto = !texto || (t.nombre ?? '').toLowerCase().includes(texto);
      const coincideVisibilidad = !this.filtroVisibilidad ||
        (this.filtroVisibilidad === 'visible' && t.estado !== false) ||
        (this.filtroVisibilidad === 'hidden' && t.estado === false);
      return coincideTexto && coincideVisibilidad;
    });
  }

  onFiltroTarjetaChange(): void {
    this.paginaActual = 1;
  }

  // Slot único de imagen
  imgSlot: SlotImagen = { previewUrl: null, markedForDelete: false };

  // Compras de tarjetas
  tarjetasCompra: TarjetaRegaloCompra[] = [];
  paginaActualCompras: number = 1;

  // FILTROS COMPRAS TARJETAS
  filtroTextoCompraTarjeta: string = '';
  filtroCanjeada: string = '';

  get tarjetasCompraFiltradas(): TarjetaRegaloCompra[] {
    const texto = this.filtroTextoCompraTarjeta.trim().toLowerCase();
    return (this.tarjetasCompra || []).filter(c => {
      const coincideTexto = !texto ||
        (c.codigo ?? '').toLowerCase().includes(texto) ||
        (c.email ?? '').toLowerCase().includes(texto);
      const coincideCanjeada = !this.filtroCanjeada ||
        (this.filtroCanjeada === 'yes' && c.canjeada) ||
        (this.filtroCanjeada === 'no' && !c.canjeada);
      return coincideTexto && coincideCanjeada;
    });
  }

  onFiltroCompraTarjetaChange(): void {
    this.paginaActualCompras = 1;
  }

  // Edición manual de canjeo (Redeemed / Redeemed On)
  compraEditando: TarjetaRegaloCompra | null = null;
  edicionCanjeo: { canjeada: boolean; fechaBaja: string } = { canjeada: false, fechaBaja: '' };

  // ===== CREAR TARJETA REGALO MANUAL =====
  tarjetasCatalogo: TarjetaRegalo[] = [];
  clientes: Cliente[] = [];

  modoCliente: 'existente' | 'nuevo' = 'existente';
  busquedaCliente = '';
  idClienteSeleccionado: number | null = null;
  clienteNuevo: Partial<Cliente> = { ...CLIENTE_NUEVO_VACIO };

  idTarjetaSeleccionadaManual: number | null = null;
  destinatarioTarjeta = '';
  creandoTarjeta = false;
  mostrarConfirmacionTarjeta = false;

  private readonly avatarColores = ['#2F7A80', '#B4623E', '#7C6A9E', '#4E7A4A', '#A9762F'];

  constructor(
    private tarjetaService: TarjetaRegaloService,
    private csvExportService: CsvExportService,
    private tarjetaCompraService: TarjetaRegaloCompraService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadingCompras = true;
    this.obtenerTarjetas();
    this.obtenerTarjetasCompra();

    this.tarjetaService.getTarjetasHabilitadas().subscribe({
      next: tarjetas => this.tarjetasCatalogo = tarjetas,
      error: () => this.tarjetasCatalogo = []
    });

    this.clienteService.getClientes().subscribe({
      next: clientes => this.clientes = clientes,
      error: () => this.clientes = []
    });
  }

  get clientesFiltrados(): Cliente[] {
    const texto = this.busquedaCliente.trim().toLowerCase();
    if (!texto) return this.clientes;
    return this.clientes.filter(c =>
      `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(texto)
    );
  }

  inicialesCliente(c: Cliente): string {
    return `${c.nombre?.[0] ?? ''}${c.apellido?.[0] ?? ''}`.toUpperCase();
  }

  colorAvatarCliente(c: Cliente): string {
    const clave = `${c.nombre}${c.apellido}`;
    let hash = 0;
    for (let i = 0; i < clave.length; i++) hash = (hash * 31 + clave.charCodeAt(i)) >>> 0;
    return this.avatarColores[hash % this.avatarColores.length];
  }

  onModoClienteChange(): void {
    this.idClienteSeleccionado = null;
    this.busquedaCliente = '';
    this.clienteNuevo = { ...CLIENTE_NUEVO_VACIO };
  }

  get formularioTarjetaValido(): boolean {
    if (!this.idTarjetaSeleccionadaManual) return false;

    if (this.modoCliente === 'existente') {
      return !!this.idClienteSeleccionado;
    }

    const c = this.clienteNuevo;
    return !!(c.nombre && c.apellido && c.email && c.calle && c.numero && c.ciudad && c.pais && c.codigoPostal);
  }

  get emailDestinoTarjeta(): string {
    if (this.modoCliente === 'existente') {
      return this.clientes.find(c => c.id === this.idClienteSeleccionado)?.email || '';
    }
    return this.clienteNuevo.email || '';
  }

  pedirConfirmacionCrearTarjeta(): void {
    if (!this.formularioTarjetaValido || this.creandoTarjeta) return;
    this.mostrarConfirmacionTarjeta = true;
  }

  cancelarCrearTarjeta(): void {
    this.mostrarConfirmacionTarjeta = false;
  }

  confirmarCrearTarjeta(): void {
    this.mostrarConfirmacionTarjeta = false;
    this.creandoTarjeta = true;

    this.tarjetaCompraService.crearManual({
      idCliente: this.modoCliente === 'existente' ? this.idClienteSeleccionado : null,
      clienteNuevo: this.modoCliente === 'nuevo' ? this.clienteNuevo : null,
      idTarjetaRegalo: this.idTarjetaSeleccionadaManual!,
      destinatario: this.destinatarioTarjeta || null
    }).subscribe({
      next: creada => {
        this.creandoTarjeta = false;
        this.resetearFormularioTarjeta();
        this.obtenerTarjetasCompra();
        this.mostrarModalFeedback(
          'success',
          'Gift card created',
          `The gift card was created and emailed successfully. Code: ${creada.codigo}`
        );
      },
      error: (e) => {
        console.error(e);
        this.creandoTarjeta = false;
        const mensaje = e?.error?.message || e?.error || 'Could not create the gift card. Please try again.';
        this.mostrarModalFeedback('error', 'Error', mensaje);
      }
    });
  }

  private resetearFormularioTarjeta(): void {
    this.modoCliente = 'existente';
    this.busquedaCliente = '';
    this.idClienteSeleccionado = null;
    this.clienteNuevo = { ...CLIENTE_NUEVO_VACIO };
    this.idTarjetaSeleccionadaManual = null;
    this.destinatarioTarjeta = '';

    this.clienteService.getClientes().subscribe({
      next: clientes => this.clientes = clientes,
      error: () => {}
    });
  }

  // ===== TARJETAS =====
  obtenerTarjetas() {
    this.tarjetaService.getTarjetas().subscribe({
      next: data => {
        this.tarjetas = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar tarjetas', err);
        this.loading = false;
        this.mostrarModalFeedback('error', 'Error loading gift cards', 'Could not load gift cards.');
      }
    });
  }

  crearTarjeta() {
    this.esNueva = true;
    this.tarjetaEditando = {
      id: 0,
      nombre: '',
      precio: 0,
      estado: true,
      imgUrl: null
    } as TarjetaRegalo;

    this.imgSlot = { previewUrl: null, markedForDelete: false };
  }

  editarTarjeta(tarjeta: TarjetaRegalo) {
    this.esNueva = false;
    this.tarjetaEditando = { ...tarjeta };
    this.imgSlot = {
      previewUrl: tarjeta.imgUrl ?? null,
      markedForDelete: false
    };
  }

  cancelarEdicion() {
    this.tarjetaEditando = null;
    this.esNueva = false;
    this.imgSlot = { previewUrl: null, markedForDelete: false };
  }

  async onSeleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const original = input.files[0];
    input.value = '';

    if (!isWebpFile(original)) {
      this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
      return;
    }
    if (isTooLarge(original, this.IMG_LIMIT_BYTES)) {
      this.mostrarModalFeedback('error', 'Image too large', `The image must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`);
      return;
    }

    this.imgSlot.file = original;
    this.imgSlot.markedForDelete = false;
    this.imgSlot.previewUrl = await fileToDataUrl(original);
  }

  eliminarImagen() {
    this.imgSlot.file = undefined;
    this.imgSlot.previewUrl = null;
    this.imgSlot.markedForDelete = true;
  }

  restaurarImagen() {
    if (!this.tarjetaEditando || this.esNueva || !this.tarjetaEditando.id) return;
    this.imgSlot.file = undefined;
    this.imgSlot.previewUrl = this.tarjetaEditando.imgUrl ?? null;
    this.imgSlot.markedForDelete = false;
  }

  guardarCambios() {
    if (!this.tarjetaEditando) return;

    if (this.imgSlot.file) {
      if (!isWebpFile(this.imgSlot.file)) {
        this.mostrarModalFeedback('error', 'Invalid image', 'Only WebP images are allowed.');
        return;
      }
      if (isTooLarge(this.imgSlot.file, this.IMG_LIMIT_BYTES)) {
        this.mostrarModalFeedback('error', 'Image too large', `The image must be ${(this.IMG_LIMIT_BYTES / 1024).toFixed(0)} KB or less.`);
        return;
      }
    }

    const fd = this.tarjetaService.buildFormData(
      this.tarjetaEditando,
      this.imgSlot.file,
      this.imgSlot.markedForDelete
    );

    const req$ = this.esNueva
      ? this.tarjetaService.crearTarjeta(fd)
      : this.tarjetaService.actualizarTarjeta(this.tarjetaEditando.id!, fd);

    req$.subscribe({
      next: () => {
        this.obtenerTarjetas();
        this.cancelarEdicion();
        this.mostrarModalFeedback('success', 'Gift card saved', 'The gift card has been saved successfully.');
      },
      error: err => {
        console.error('Error guardando tarjeta', err);
        this.mostrarModalFeedback('error', 'Error saving', 'Please review fields or try again.');
      }
    });
  }

  eliminarTarjeta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta tarjeta regalo?')) {
      this.tarjetaService.eliminarTarjeta(id).subscribe({
        next: () => {
          this.obtenerTarjetas();
          this.mostrarModalFeedback('success', 'Gift card deleted', 'The gift card has been deleted successfully.');
        },
        error: err => {
          console.error('Error eliminando tarjeta', err);
          this.mostrarModalFeedback('error', 'Error deleting', 'There was a problem deleting the gift card.');
        }
      });
    }
  }

  exportarCSV() {
    const encabezado = ['Name', 'Price', 'Visibility'];
    const filas = this.tarjetasFiltradas.map(t => [
      t.nombre ?? '',
      (t.precio ?? 0).toString(),
      t.estado !== false ? 'Visible' : 'Hidden'
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'Gift_Cards');
  }

  // ===== COMPRAS TARJETAS =====
  obtenerTarjetasCompra() {
    this.tarjetaCompraService.getTarjetas().subscribe({
      next: data => {
        this.tarjetasCompra = data || [];
        this.loadingCompras = false;
      },
      error: err => {
        console.error('Error al cargar tarjetas compra', err);
        this.loadingCompras = false;
        this.mostrarModalFeedback('error', 'Error loading purchases', 'Could not load gift card purchases.');
      }
    });
  }

  editarCanjeo(compra: TarjetaRegaloCompra) {
    this.compraEditando = compra;
    this.edicionCanjeo = {
      canjeada: compra.canjeada,
      fechaBaja: (compra.fechaBaja ?? '').substring(0, 10)
    };
  }

  cancelarEdicionCanjeo() {
    this.compraEditando = null;
  }

  mostrarConfirmacionDesCanjeo = false;

  guardarCanjeo() {
    if (!this.compraEditando?.id) return;

    if (this.edicionCanjeo.canjeada && !this.edicionCanjeo.fechaBaja) {
      this.mostrarModalFeedback(
        'error',
        'Redeemed On required',
        'You must set a Redeemed On date when marking this purchase as redeemed manually.'
      );
      return;
    }

    // Si ya estaba canjeada con un gasto real registrado y se está desmarcando, la tarjeta
    // recupera su valor completo y se pierde el registro de lo ya gastado: pedimos confirmación
    // explícita para evitar un doble gasto por un clic accidental.
    const seDesmarcaGastoReal = this.compraEditando.canjeada
      && !this.edicionCanjeo.canjeada
      && this.compraEditando.montoUtilizado != null;

    if (seDesmarcaGastoReal) {
      this.mostrarConfirmacionDesCanjeo = true;
      return;
    }

    this.aplicarGuardadoCanjeo();
  }

  cancelarDesCanjeo() {
    this.mostrarConfirmacionDesCanjeo = false;
  }

  confirmarDesCanjeo() {
    this.mostrarConfirmacionDesCanjeo = false;
    this.aplicarGuardadoCanjeo();
  }

  private aplicarGuardadoCanjeo() {
    if (!this.compraEditando?.id) return;

    const fechaBaja = this.edicionCanjeo.canjeada ? this.edicionCanjeo.fechaBaja : null;
    const compra = this.compraEditando;

    this.tarjetaCompraService.actualizarCanjeo(compra.id!, this.edicionCanjeo.canjeada, fechaBaja).subscribe({
      next: actualizado => {
        compra.canjeada = actualizado.canjeada;
        compra.fechaBaja = actualizado.fechaBaja;
        compra.montoUtilizado = actualizado.montoUtilizado;
        this.cancelarEdicionCanjeo();
        this.mostrarModalFeedback('success', 'Purchase updated', `Code ${compra.codigo} updated successfully.`);
      },
      error: err => {
        console.error('Error updating redemption', err);
        const mensaje = typeof err?.error === 'string' ? err.error : 'Could not update the redemption status.';
        this.mostrarModalFeedback('error', 'Error updating', mensaje);
      }
    });
  }

  exportarCSVCompras() {
    const encabezado = ['Code', 'Client', 'Price', 'Purchase Date', 'Expiration', 'Redeemed', 'Redeemed On', 'Amount Spent'];
    const filas = this.tarjetasCompraFiltradas.map(c => [
      c.codigo ?? '',
      c.email ?? '',
      (c.precio ?? 0).toString(),
      c.fechaCompra ?? '',
      c.fechaCaducidad ?? '',
      c.canjeada ? 'Yes' : 'No',
      c.fechaBaja ?? '',
      c.canjeada ? (c.montoUtilizado != null ? c.montoUtilizado.toString() : 'Unknown') : ''
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'Gift_Card_Purchases');
  }

verPdf(compra: TarjetaRegaloCompra) {
  if (!compra?.id) return;

  this.tarjetaCompraService.obtenerPdf(compra.id).subscribe({
    next: blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    },
    error: err => {
      console.error('Error loading gift card PDF', err);
      this.mostrarModalFeedback('error', 'Error', 'Could not load the gift card PDF.');
    }
  });
}

marcarCanjeada(compra: TarjetaRegaloCompra) {
  if (!compra?.id || compra.canjeada) return;

  const confirmar = confirm(
    `Are you sure you want to mark the code ${compra.codigo} as redeemed?\nThis action cannot be undone.`
  );

  if (!confirmar) return;

  this.tarjetaCompraService.marcarCanjeada(compra.id).subscribe({
    next: () => {
      compra.canjeada = true;
      this.mostrarModalFeedback(
        'success',
        'Marked as redeemed',
        `Code ${compra.codigo} marked as redeemed.`
      );
    },
    error: err => {
      console.error('Error marked as redeemed', err);
      this.mostrarModalFeedback(
        'error',
        'Error',
        'Could not mark as redeemed.'
      );
    }
  });
}


eliminarCompra(id: number) {
  if (!id) return;

  if (confirm('Are you sure you want to delete this gift card purchase? This action cannot be undone.')) {
    this.tarjetaCompraService.eliminarCompra(id).subscribe({
      next: () => {
        this.obtenerTarjetasCompra();
        this.mostrarModalFeedback(
          'success',
          'Deleted',
          'Purchase deleted successfully.'
        );
      },
      error: err => {
        console.error('Error deleting purchase', err);
        this.mostrarModalFeedback(
          'error',
          'Error deleting',
          'Could not delete the purchase.'
        );
      }
    });
  }
}


  // ===== FEEDBACK =====
  mostrarModalFeedback(tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string) {
    this.feedbackTipo = tipo;
    this.feedbackTitulo = titulo;
    this.feedbackMensaje = mensaje;
    this.mostrarFeedback = true;
  }
  cerrarFeedback() {
    this.mostrarFeedback = false;
  }
}
