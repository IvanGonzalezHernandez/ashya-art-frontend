import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {

  /**
   * Exporta un CSV con encabezado y filas.
   * @param encabezado Array con los nombres de columnas.
   * @param filas Array de arrays con datos.
   * @param nombreBase Nombre del archivo sin extension ni fecha, en ingles (p.ej. 'Clients').
   *                    Se le a\u00F1ade automaticamente la fecha de hoy y la extension .csv.
   * @param separador Separador de columnas (por defecto ';').
   */
  exportarCSV(
    encabezado: string[],
    filas: (string | number | null)[][],
    nombreBase: string = 'Export',
    separador: string = ';'
  ): void {
    const csvContent = [encabezado, ...filas]
      .map(row => row.map(val => `"${(val ?? '').toString().replace(/"/g, '""')}"`).join(separador))
      .join('\n');

    const bom = '\uFEFF';

    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreBase}_${this.sufijoFecha()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /** Fecha de hoy en formato DDMMYYYY, para usar como sufijo del nombre de archivo. */
  private sufijoFecha(): string {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    return `${dia}${mes}${hoy.getFullYear()}`;
  }
}
