export interface ProductoCompra {
    id: number;
    idCliente: number;
    nombreCliente: string;
    idProducto: number;
    nombreProducto: string;
    cantidad: number,
    fechaCompra: Date;
}
