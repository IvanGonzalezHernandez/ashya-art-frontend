export interface Producto {
    id: number;
    nombre: string;
    subtitulo: string;
    descripcion: string;
    stock: number;
    precio: number;
    categoria: string;
    material?: string | null;
    medidas?: string | null;
    estado?: boolean;

    img1Url?: string | null;
    img2Url?: string | null;
    img3Url?: string | null;
    img4Url?: string | null;
    img5Url?: string | null;
}
