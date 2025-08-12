export interface Producto {
    id: number;
    nombre: string;
    subtitulo: string;
    descripcion: string;
    stock: number;
    precio: number;
    material?: string | null;
    medidas?: string | null;
    estado?: boolean;

    img1?: string | null; 
    img2?: string | null;
    img3?: string | null;
    img4?: string | null;
    img5?: string | null;

    img1Url?: string;
    img2Url?: string;
    img3Url?: string;
    img4Url?: string;
    img5Url?: string;
}
