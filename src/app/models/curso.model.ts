export interface Curso {
  id: number;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  precio: number;
  nivel: string;
  duracion: string;
  piezas: string;
  materiales: string;
  estado?: boolean;
  fechaBaja?: string;
  plazasMaximas?: number;
  informacionExtra?: string;
  img1?: any;
  img2?: any;
  img3?: any;
  img4?: any;
  img5?: any;

  img1Url?: string;
  img2Url?: string;
  img3Url?: string;
  img4Url?: string;
  img5Url?: string;
}
