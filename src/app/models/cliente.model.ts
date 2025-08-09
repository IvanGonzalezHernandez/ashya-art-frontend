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
    codigoPostal: string;

    // Nuevos campos
    classType: '',
    peopleInterested: 1,
    availability: '',
    additionalQuestions: ''
}
