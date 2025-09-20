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

    // Nuevos campos
    tipoClase: '',
    personasInteresadas: 1,
    disponibilidad: '',
    preguntasAdicionales: ''
}
