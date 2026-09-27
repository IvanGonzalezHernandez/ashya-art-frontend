import { Traducciones } from '../utils/traducciones.util';

export interface TarjetaRegalo {
    id: number;
    nombre: string;
    precio: number;
    estado?: boolean;
    imgUrl?: string | null;
  /** Nombre en alemán y español; si falta se muestra en inglés. */
  traducciones?: Traducciones | null;
}
