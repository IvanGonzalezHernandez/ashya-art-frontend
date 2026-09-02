// models/tarjetaRegaloCompra.model.ts
export interface TarjetaRegaloCompra {
  id?: number;
  codigo?: string;
  destinatario?: string;
  canjeada: boolean;
  fechaCompra?: string;
  fechaCaducidad?: string;
  fechaBaja?: string | null;
  montoUtilizado?: number | null;
  estado?: boolean;
  idTarjeta?: number;
  idCliente?: number;
  idCompra?: number;

  email?: string;
  precio?: number;
}