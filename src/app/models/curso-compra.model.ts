export interface Reservas {
    id: number;
    idCliente: string;
    idFecha: number;
    plazasReservadas: number;
    fechaReserva: Date;
    nombreCurso: string;
    telefono: string;
    email: string;
    fechaCurso: string;
    nombreCliente: string;
    pagado: boolean;
}
