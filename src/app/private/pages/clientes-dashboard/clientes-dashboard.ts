import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ClienteService } from '../../../services/cliente/cliente';
import { CsvExportService } from '../../../services/csv/csv-export';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-clientes-dashboard',
  standalone: true,
  templateUrl: './clientes-dashboard.html',
  styleUrls: ['./clientes-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class ClientesDashboard implements OnInit {
  loading = false;

  clientes: Cliente[] = [];
  paginaActual: number = 1;
  clienteEditando: Cliente | null = null;
  esNuevo: boolean = false;

  constructor(
    private clienteService: ClienteService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerClientes();
  }

  obtenerClientes() {
    this.loading = true;
    this.clienteService.getClientes().subscribe({
      next: data => {
        this.clientes = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar clientes', err);
        this.loading = false;
      }
    });
  }

  crearCliente() {
    this.esNuevo = true;
    this.clienteEditando = {
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

      // Nuevos campos
      tipoClase: '',
      personasInteresadas: 1,
      disponibilidad: '',
      preguntasAdicionales: ''
    };
  }

  editarCliente(cliente: Cliente) {
    this.esNuevo = false;
    this.clienteEditando = { ...cliente };
  }

  cancelarEdicion() {
    this.clienteEditando = null;
    this.esNuevo = false;
  }

  guardarCambios() {
    if (!this.clienteEditando) return;

    if (this.esNuevo) {
      this.clienteService.crearCliente(this.clienteEditando).subscribe(() => {
        this.obtenerClientes();
        this.clienteEditando = null;
        this.esNuevo = false;
      });
    } else {
      this.clienteService.actualizarCliente(this.clienteEditando).subscribe(() => {
        this.obtenerClientes();
        this.clienteEditando = null;
        this.esNuevo = false;
      });
    }
  }

  eliminarCliente(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clienteService.eliminarCliente(id).subscribe(() => {
        this.obtenerClientes();
      });
    }
  }

  exportarCSV() {
    const encabezado = ['ID', 'Tlf', 'Name', 'Surname', 'Email', 'Street', 'Number', 'Floor', 'Province', 'City', 'Postal Code'];
    const filas = this.clientes.map(cliente => [
      cliente.id,
      cliente.telefono,
      cliente.nombre,
      cliente.apellido,
      cliente.email,
      cliente.calle,
      cliente.numero,
      cliente.piso,
      cliente.provincia,
      cliente.ciudad,
      cliente.codigoPostal
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'clients.csv');
  }
}
