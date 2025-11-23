import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Curso } from '../../../models/curso.model';
import { CursoFecha } from '../../../models/cursoFecha.model';
import { ItemCarrito } from '../../../models/item-carrito';
import { CursoService } from '../../../services/curso/curso';
import { CursoFechaService } from '../../../services/curso-fecha/curso-fecha';
import { CarritoService } from '../../../services/carrito/carrito';

declare const bootstrap: any;

type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
  key: string;            // YYYY-MM-DD
  sessions: CursoFecha[];
};

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class Calendar implements OnInit {
  // Estado general
  loading = false;
  error?: string;

  // Datos globales
  fechas: CursoFecha[] = [];
  cursosMap = new Map<number, Curso>(); // idCurso -> Curso (con img1Url..img5Url)

  // Calendario
  brandColor = '#3E3028';
  today = new Date();
  current: Date = new Date();
  weeks: DayCell[][] = [];

  // Selección del día
  selectedKey: string | null = null;
  selectedDate: Date | null = null;

  // Modal compartido
  cursosFecha: CursoFecha[] = [];
  cantidades: Record<number, number> = {};

  constructor(
    private cursoService: CursoService,
    private cursoFechaService: CursoFechaService,
    private carritoService: CarritoService
  ) {
    this.today.setHours(0, 0, 0, 0);
  }

  async ngOnInit(): Promise<void> {
    try {
      this.loading = true;
      await this.cargarDatos();
      this.buildCalendar();
    } catch (e) {
      console.error(e);
      this.error = 'Error loading calendar.';
    } finally {
      this.loading = false;
    }
  }

  // ================== Carga de datos ==================
  private async cargarDatos(): Promise<void> {
    const fechas$ = this.cursoFechaService.getCursoFechas();
    const cursos$ = this.cursoService.getCursos();

    await new Promise<void>((resolve) => {
      let gotFechas = false, gotCursos = false;

      fechas$.subscribe({
        next: (data) => {
          this.fechas = Array.isArray(data) ? data : [];
          this.fechas.forEach(f => this.cantidades[f.id] = this.cantidades[f.id] ?? 1);
          gotFechas = true;
          if (gotCursos) resolve();
        },
        error: (err) => {
          console.error('Error loading sessions', err);
          this.fechas = [];
          gotFechas = true;
          if (gotCursos) resolve();
        }
      });

      cursos$.subscribe({
        next: (data) => {
          (data || []).forEach((c: Curso) => {
            this.procesarImagenesBase64Curso(c); // crea img1Url..img5Url si vienen base64
            this.cursosMap.set(Number(c.id), c);
          });
          gotCursos = true;
          if (gotFechas) resolve();
        },
        error: (err) => {
          console.warn('Error loading courses', err);
          gotCursos = true;
          if (gotFechas) resolve();
        }
      });
    });
  }

  /** Procesa imágenes base64 del curso y genera img1Url..img5Url */
  private procesarImagenesBase64Curso(curso: Curso): void {
    // Si tu backend usa otro mime (jpeg/png), ajusta aquí
    const mime = (curso as any).imgMime ?? 'image/webp';
    for (let i = 1; i <= 5; i++) {
      const imgProp = `img${i}` as keyof Curso;
      const urlProp = `img${i}Url` as keyof Curso;
      const base64Str = curso[imgProp] as unknown as string;
      (curso as any)[urlProp] = base64Str ? `data:${mime};base64,${base64Str}` : '';
    }
  }

  // ================== Navegación de mes ==================
  prevMonth() { const d = new Date(this.current); d.setMonth(d.getMonth() - 1); this.current = d; this.buildCalendar(); }
  nextMonth() { const d = new Date(this.current); d.setMonth(d.getMonth() + 1); this.current = d; this.buildCalendar(); }
  thisMonth() { this.current = new Date(); this.buildCalendar(); }

  // ================== Construcción del calendario ==================
  private buildCalendar() {
    const start = this.startOfMonth(this.current);
    const end   = this.endOfMonth(this.current);
    const gridStart = this.startOfWeek(start); // lunes
    const gridEnd   = this.endOfWeek(end);

    const days: DayCell[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d = this.addDays(d, 1)) {
      const key = this.keyOf(d);
      days.push({
        date: new Date(d),
        inCurrentMonth: d.getMonth() === this.current.getMonth(),
        key,
        sessions: this.getSessionsByKey(key),
      });
    }

    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) this.weeks.push(days.slice(i, i + 7));

    if (this.selectedKey && !this.getSessionsByKey(this.selectedKey).length) {
      this.selectedKey = null;
      this.selectedDate = null;
      this.cursosFecha = [];
    }
  }

  // ================== Click en día -> abre el mismo modal ==================
  onSelectDay(cell: DayCell) {
    if (!cell.sessions.length) return;
    this.selectedKey = cell.key;
    this.selectedDate = new Date(cell.date);
    this.cursosFecha = this.getSessionsByKey(cell.key);
    this.cursosFecha.forEach(f => this.cantidades[f.id] = this.cantidades[f.id] ?? 1);
    this.openModalFechasDisponibles();
  }

  // === Modal compartido ===
  private prepareModalById(id: string): HTMLElement | null {
    const el = document.getElementById(id);
    if (!el) return null;
    if (el.parentElement !== document.body) document.body.appendChild(el);
    return el;
  }

  private resetOverlays() {
    document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  }

  private openModalFechasDisponibles(): void {
    const el = this.prepareModalById('modalFechasDisponibles');
    if (!el) return;
    const modal = bootstrap.Modal.getOrCreateInstance(el, { backdrop: true, keyboard: true, focus: true });
    el.addEventListener('hidden.bs.modal', () => this.resetOverlays(), { once: true });
    this.resetOverlays();
    modal.show();
  }

  // ================== Acciones ==================
  async agregarCursoAlCarrito(fecha: CursoFecha) {
    const cantidad = this.cantidades[fecha.id] || 1;
    const nombre = this.getNombre(fecha);
    const precio = this.getPrecio(fecha) ?? 0;

    // 🔑 resolver imagen de forma robusta con idCurso
    const img = await this.resolveImgForFecha(fecha);

    const item: ItemCarrito = {
      id: fecha.id,
      tipo: 'CURSO',
      nombre: `${nombre} - ${this.keyOf(this.toDate(fecha.fecha)!)}`
        .trim(),
      precio,
      cantidad,
      img: img || '',
      subtitulo: this.getSubtitulo(fecha),
      fecha: this.toDate(fecha.fecha) as any,
      hora: fecha.horaInicio
    };

    this.carritoService.agregarItem(item);

    // Cierra modal tras añadir
    const el = document.getElementById('modalFechasDisponibles');
    if (el) bootstrap.Modal.getOrCreateInstance(el).hide();
  }

  // ---------- Resolución de imagen basada en idCurso ----------
  private async resolveImgForFecha(fecha: CursoFecha): Promise<string> {
    // 0) intenta con lo disponible (cache/listado)
    const immediate = this.getImg(fecha);
    if (immediate) return immediate;

    const cursoId = Number(fecha.idCurso);
    if (isNaN(cursoId)) return '';

    // 1) si hay curso cacheado, usa primera imagen no vacía
    const cached = this.cursosMap.get(cursoId);
    if (cached) {
      const img = this.firstImg(cached);
      if (img) return img;
    }

    // 2) carga detalle y procesa base64
    try {
      const cursoDet = await firstValueFrom(this.cursoService.getCursoPorId(cursoId));
      if (cursoDet) {
        this.procesarImagenesBase64Curso(cursoDet);
        this.cursosMap.set(cursoId, cursoDet);
        return this.firstImg(cursoDet) || '';
      }
    } catch (e) {
      console.warn('No se pudo cargar detalle del curso', e);
    }

    return '';
  }

  // ================== Helpers de fecha ==================
  private startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private endOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
  private startOfWeek(d: Date): Date { const k=(d.getDay()+6)%7; const r=new Date(d); r.setDate(d.getDate()-k); r.setHours(0,0,0,0); return r; }
  private endOfWeek(d: Date): Date { const s=this.startOfWeek(d); const e=new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return e; }
  private addDays(d: Date, n: number): Date { const r=new Date(d); r.setDate(d.getDate()+n); return r; }
  private keyOf(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }

  /** Parser robusto: ISO, yyyy-MM-dd, dd/MM/yyyy, epoch */
  private parseDateFlexible(value: string | Date): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

    const v = String(value).trim();

    const iso = new Date(v);
    if (!isNaN(iso.getTime())) return iso;

    const m1 = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m1) {
      const [_, yy, mm, dd] = m1 as any;
      const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? null : d;
    }

    const m2 = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m2) {
      const [_, dd, mm, yy] = m2 as any;
      const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? null : d;
    }

    if (/^\d+$/.test(v)) {
      const d = new Date(Number(v));
      return isNaN(d.getTime()) ? null : d;
    }

    return null;
  }

  private getSessionsByKey(key: string): CursoFecha[] {
    if (!this.fechas?.length) return [];
    return this.fechas.filter(f => {
      const d = this.parseDateFlexible(f.fecha as any);
      return d && this.keyOf(d) === key;
    });
  }

  toDate(v: string | Date): Date | null { return this.parseDateFlexible(v); }

  // ================== Helpers de curso ==================
  private getCurso(s: CursoFecha): Curso | undefined {
    const idNum = Number(s.idCurso);
    return (!isNaN(idNum)) ? this.cursosMap.get(idNum) : undefined;
  }

  getNombre(s: CursoFecha): string {
    const c = this.getCurso(s);
    return c?.nombre ?? s.nombreCurso ?? 'Ceramics Workshop';
  }

  getSubtitulo(s: CursoFecha): string {
    const c = this.getCurso(s);
    return c?.subtitulo ?? '';
  }

  getPrecio(s: CursoFecha): number | null {
    const c = this.getCurso(s);
    // Si alguna vez añades precio a CursoFecha, puedes priorizarlo aquí
    const p = (c?.precio as any);
    return (p !== undefined && p !== null) ? Number(p) : null;
  }

  /** Devuelve la mejor imagen disponible del curso */
  getImg(s: CursoFecha): string {
    const c = this.getCurso(s) as any;
    const candidates = [
      c?.img1Url, c?.img2Url, c?.img3Url, c?.img4Url, c?.img5Url
    ].filter(Boolean) as string[];
    return candidates[0] || '';
  }

  isPast(cell: DayCell): boolean {
    const d = new Date(cell.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < this.today.getTime();
  }

  isPastDate(value: string | Date): boolean {
    const d = this.parseDateFlexible(value);
    if (!d) {
      return false;
    }
    d.setHours(0, 0, 0, 0);
    return d.getTime() < this.today.getTime();
  }

  /** Primera imagen no vacía del curso */
  private firstImg(c?: Curso): string {
    if (!c) return '';
    const list = [c.img1Url, c.img2Url, c.img3Url, c.img4Url, c.img5Url].filter(Boolean) as string[];
    return list[0] || '';
  }
}
