export interface ItemCarrito {
  id: number;
  tipo: 'CURSO' | 'PRODUCTO' | 'TARJETA';
  nombre: string;
  subtitulo: string;
  precio: number;
  cantidad: number;
  fecha: string;
  hora: string;
  img: string;
  destinatario?: string;
  stock?: number; // máximo que se puede pedir (stock del producto o plazas libres del curso)
}
