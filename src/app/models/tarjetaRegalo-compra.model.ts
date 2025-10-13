// models/tarjetaRegaloCompra.model.ts
export interface TarjetaRegaloCompra {
  id?: number;
  codigo?: string;
  destinatario?: string;
  canjeada: boolean;
  fechaCompra?: string;
  fechaCaducidad?: string;
  fechaBaja?: string | null;
  estado?: boolean;
  idTarjeta?: number;
  idCliente?: number;
  idCompra?: number;
}