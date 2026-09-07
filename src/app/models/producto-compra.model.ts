export interface ProductoCompra {
    id: number;
    idCliente: number;
    nombreCliente: string;
    emailCliente?: string;
    idProducto: number;
    nombreProducto: string;
    cantidad: number,
    fechaCompra: Date;
    precio?: number;
    numeroSeguimiento?: string | null;
    metodoEnvio?: 'PICKUP' | 'GERMANY' | 'EU' | null;
}
