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
  localizacion: string;
  orden?: number;

  img1Url?: string | null;
  img2Url?: string | null;
  img3Url?: string | null;
  img4Url?: string | null;
  img5Url?: string | null;
}
