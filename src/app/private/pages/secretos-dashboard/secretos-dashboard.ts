import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { Secreto } from '../../../models/secreto.model';
import { SecretoService } from '../../../services/secreto/secreto';
import { CsvExportService } from '../../../services/csv/csv-export';

type SlotImagen = {
  slot: number;
  previewUrl: string | null;
  file?: File;
  markedForDelete: boolean;
};

@Component({
  selector: 'app-secretos-dashboard',
  standalone: true,
  templateUrl: './secretos-dashboard.html',
  styleUrls: ['./secretos-dashboard.scss'],
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class SecretosDashboard implements OnInit {
  loading = false;

  // listado
  secretos: Secreto[] = [];
  paginaActual: number = 1;

  // edición
  secretoEditando: Secreto | null = null;
  esNuevo: boolean = false;

  // slots imagen
  slots: SlotImagen[] = [];

  // PDF
  pdfFile?: File;
  pdfPreviewName: string | null = null;
  pdfMarkedForDelete = false;

  constructor(
    public secretoService: SecretoService,
    private csvExportService: CsvExportService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.obtenerSecretos();
  }

  obtenerSecretos() {
    this.secretoService.getSecretos().subscribe({
      next: (data) => {
        this.secretos = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando secretos', err);
        this.loading = false;
      }
    });
  }

  private initSlots(secretoId?: number) {
    this.slots = Array.from({ length: 5 }, (_, i) => {
      const slotNum = i + 1;
      return {
        slot: slotNum,
        previewUrl: secretoId ? this.secretoService.getImagenUrl(secretoId, slotNum) : null,
        markedForDelete: false
      } as SlotImagen;
    });
  }

  crearSecreto() {
    this.esNuevo = true;
    this.secretoEditando = {
      id: 0,
      estado: true,
      fechaBaja: null,
      precio: 0,
      nombre: '',
      subtitulo: '',
      descripcion: '',
      categoria: '',
      pdf: null,
      img1: null,
      img2: null,
      img3: null,
      img4: null,
      img5: null
    };
    this.initSlots();
    this.pdfFile = undefined;
    this.pdfPreviewName = null;
    this.pdfMarkedForDelete = false;
  }

  editarSecreto(sec: Secreto) {
    this.esNuevo = false;
    this.secretoEditando = { ...sec };
    this.initSlots(sec.id);
    // si existe PDF en servidor, mostramos un nombre “virtual”
    this.pdfFile = undefined;
    this.pdfPreviewName = 'Existing PDF';
    this.pdfMarkedForDelete = false;
  }

  cancelarEdicion() {
    this.secretoEditando = null;
    this.esNuevo = false;
    this.slots = [];
    this.pdfFile = undefined;
    this.pdfPreviewName = null;
    this.pdfMarkedForDelete = false;
  }

  // --- IMÁGENES (slots) ---
  onSeleccionarArchivo(event: Event, slot: SlotImagen) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    slot.file = file;
    slot.markedForDelete = false;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      slot.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  eliminarSlot(slot: SlotImagen) {
    slot.file = undefined;
    slot.previewUrl = null;
    slot.markedForDelete = true;
  }

  restaurarSlot(slot: SlotImagen) {
    if (!this.secretoEditando || this.esNuevo) return;
    slot.file = undefined;
    slot.previewUrl = this.secretoService.getImagenUrl(this.secretoEditando.id!, slot.slot);
    slot.markedForDelete = false;
  }

  selectedSlotsCount(): number {
    return this.slots.filter(s => !!s.previewUrl || !!s.file).length;
  }

  // --- PDF ---
  onSeleccionarPdf(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.pdfFile = file;
    this.pdfPreviewName = file.name;
    this.pdfMarkedForDelete = false;
    input.value = '';
  }

  eliminarPdf() {
    this.pdfFile = undefined;
    this.pdfPreviewName = null;
    this.pdfMarkedForDelete = true;
  }

  restaurarPdf() {
    if (!this.secretoEditando || this.esNuevo) return;
    this.pdfFile = undefined;
    this.pdfPreviewName = 'Existing PDF';
    this.pdfMarkedForDelete = false;
  }

  // --- GUARDAR ---
  guardarCambios() {
    if (!this.secretoEditando) return;

    const dto: any = {
      id: this.secretoEditando.id,
      estado: this.secretoEditando.estado,
      fechaBaja: this.secretoEditando.fechaBaja,
      precio: this.secretoEditando.precio,
      nombre: this.secretoEditando.nombre,
      subtitulo: this.secretoEditando.subtitulo,
      descripcion: this.secretoEditando.descripcion,
      categoria: this.secretoEditando.categoria
    };

    const fd = new FormData();
    fd.append('secreto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    // imágenes
    this.slots.forEach(s => {
      if (s.file) {
        fd.append(`img${s.slot}`, s.file);
      }
    });
    this.slots.forEach(s => {
      if (s.markedForDelete) {
        fd.append(`deleteImg${s.slot}`, 'true');
      }
    });

    // pdf
    if (this.pdfFile) {
      fd.append('pdf', this.pdfFile);
    }
    if (this.pdfMarkedForDelete) {
      fd.append('deletePdf', 'true');
    }

    const req$ = this.esNuevo
      ? this.secretoService.crearSecreto(fd)
      : this.secretoService.actualizarSecreto(fd, this.secretoEditando.id!);

    req$.subscribe({
      next: () => {
        this.obtenerSecretos();
        this.cancelarEdicion();
      },
      error: (e) => console.error('Error guardando secreto', e)
    });
  }

  eliminarSecreto(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este secreto?')) {
      this.secretoService.eliminarSecreto(id).subscribe(() => this.obtenerSecretos());
    }
  }

  // --- CSV ---
  exportarCSV() {
    const encabezado = ['ID', 'Name', 'Subtitle', 'Category', 'Price', 'Status', 'Fecha Baja'];
    const filas = (this.secretos || []).map(s => [
      s.id ?? '',
      s.nombre ?? '',
      s.subtitulo ?? '',
      s.categoria ?? '',
      (s.precio ?? 0).toString(),
      s.estado ? 'Activo' : 'Inactivo',
      (s.fechaBaja ?? '')?.toString()
    ]);
    this.csvExportService.exportarCSV(encabezado, filas, 'secrets.csv');
  }
}
