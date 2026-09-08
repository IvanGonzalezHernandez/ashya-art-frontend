export interface ClienteCursoReserva {
    curso: string;
    fechaCurso: string;
    fechaReserva: string;
    plazasReservadas: number;
}

export interface ClienteTarjetaRegalo {
    tarjeta: string;
    canjeada: boolean;
    fechaCompra: string;
    fechaCaducidad: string;
}

export interface ClienteProducto {
    producto: string;
    cantidad: number;
    precio: number;
    fechaCompra: string;
    metodoEnvio: 'PICKUP' | 'GERMANY' | 'EU' | null;
    numeroSeguimiento: string | null;
}

export interface Cliente {
    id: number;
    telefono: string;
    nombre: string;
    apellido: string;
    email: string;
    calle: string;
    numero: string;
    piso: string;
    provincia: string;
    ciudad: string;
    pais: string;
    codigoPostal: string;
    fechaAlta?: string;
    cursos?: ClienteCursoReserva[];
    tarjetas?: ClienteTarjetaRegalo[];
    productos?: ClienteProducto[];

    // Nuevos campos
    tipoClase: '',
    personasInteresadas: 1,
    disponibilidad: '',
    preguntasAdicionales: ''

    infoComercial: boolean;
    privacidad: boolean;
}
