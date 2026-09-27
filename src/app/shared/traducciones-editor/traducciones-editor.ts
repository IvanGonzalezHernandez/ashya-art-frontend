import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Traducciones } from '../../utils/traducciones.util';

export interface CampoTraducible {
  clave: string;
  etiqueta: string;
  multilinea?: boolean;
}

/**
 * Pestañas Deutsch / Español para traducir los textos de un curso, producto o tarjeta regalo en
 * el admin. Todo es opcional: lo que se deje vacío se muestra en inglés en la web.
 */
@Component({
  selector: 'app-traducciones-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border rounded-3 p-3 bg-light">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <h6 class="mb-0">Translations <span class="text-muted fw-normal small">(optional)</span></h6>
        <div class="btn-group btn-group-sm" role="tablist" aria-label="Translation language">
          <button *ngFor="let i of idiomas" type="button" class="btn"
                  [class.btn-traduccion-activa]="idioma === i.codigo" [class.btn-outline-secondary]="idioma !== i.codigo"
                  [attr.aria-selected]="idioma === i.codigo" role="tab" (click)="idioma = i.codigo">
            {{ i.nombre }}
            <span class="badge rounded-pill ms-1" [class.bg-success]="completados(i.codigo) === campos.length"
                  [class.bg-secondary]="completados(i.codigo) !== campos.length">{{ completados(i.codigo) }}/{{ campos.length }}</span>
          </button>
        </div>
      </div>
      <p class="small text-muted mb-3">Fields left empty are shown in English on the website.</p>

      <div class="row g-3">
        <div *ngFor="let c of campos" [class.col-12]="c.multilinea" [class.col-md-6]="!c.multilinea">
          <label class="form-label small mb-1" [for]="'trad-' + idioma + '-' + c.clave">{{ c.etiqueta }}</label>
          <textarea *ngIf="c.multilinea; else linea" class="form-control form-control-sm" rows="3"
                    [id]="'trad-' + idioma + '-' + c.clave" [name]="'trad-' + idioma + '-' + c.clave"
                    [ngModel]="valor(c.clave)" (ngModelChange)="cambiar(c.clave, $event)"
                    [placeholder]="original?.[c.clave] || ''"></textarea>
          <ng-template #linea>
            <input type="text" class="form-control form-control-sm"
                   [id]="'trad-' + idioma + '-' + c.clave" [name]="'trad-' + idioma + '-' + c.clave"
                   [ngModel]="valor(c.clave)" (ngModelChange)="cambiar(c.clave, $event)"
                   [placeholder]="original?.[c.clave] || ''" />
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-traduccion-activa { background-color: #3A9097; border-color: #3A9097; color: #fff; }
  `]
})
export class TraduccionesEditorComponent {
  @Input({ required: true }) campos: CampoTraducible[] = [];
  /** Textos en inglés del mismo elemento: se muestran como ejemplo en cada campo vacío. */
  @Input() original: Record<string, any> | null = null;
  @Input() traducciones: Traducciones | null | undefined = {};
  @Output() traduccionesChange = new EventEmitter<Traducciones>();

  readonly idiomas: Array<{ codigo: 'de' | 'es'; nombre: string }> = [
    { codigo: 'de', nombre: 'Deutsch' },
    { codigo: 'es', nombre: 'Español' }
  ];
  idioma: 'de' | 'es' = 'de';

  valor(campo: string): string {
    return this.traducciones?.[this.idioma]?.[campo] ?? '';
  }

  completados(idioma: 'de' | 'es'): number {
    const t = this.traducciones?.[idioma] ?? {};
    return this.campos.filter(c => (t[c.clave] ?? '').trim() !== '').length;
  }

  cambiar(campo: string, texto: string): void {
    const copia: Traducciones = { ...(this.traducciones ?? {}) };
    copia[this.idioma] = { ...(copia[this.idioma] ?? {}), [campo]: texto };
    this.traducciones = copia;
    this.traduccionesChange.emit(copia);
  }
}
