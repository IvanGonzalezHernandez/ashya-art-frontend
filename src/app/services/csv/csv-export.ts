import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {

  /**
   * Exporta un CSV con encabezado y filas.
   * @param encabezado Array con los nombres de columnas.
   * @param filas Array de arrays con datos.
   * @param nombreArchivo Nombre del archivo a descargar.
   * @param separador Separador de columnas (por defecto ';').
   */
  exportarCSV(
    encabezado: string[],
    filas: (string | number | null)[][],
    nombreArchivo: string = 'export.csv',
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
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
