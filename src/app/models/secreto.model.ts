export interface Secreto {
  id?: number;
  estado: boolean;
  fechaBaja?: string | null;
  precio: number;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  categoria: string;
  pdf?: string | null;
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
