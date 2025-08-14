export interface ItemCarrito {
  id: number;
  tipo: 'CURSO' | 'PRODUCTO' | 'SECRETO' | 'TARJETA';
  nombre: string;
  precio: number;
  cantidad: number;
  img: string;
}
