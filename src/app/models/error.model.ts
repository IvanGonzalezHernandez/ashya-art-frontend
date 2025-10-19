export interface ErrorDto {
  id: number;
  fechaCreacion: string; // ISO string p.ej. '2025-10-19T10:20:00Z'
  mensajeError: string;
  claseError?: string;
  metodoError?: string;
  lineaError?: number;
  loggerOrigen?: string;
  metodoHttp?: string;
  rutaPeticion?: string;
  entorno?: string;
  servidor?: string;
  hashTraza?: string;
}