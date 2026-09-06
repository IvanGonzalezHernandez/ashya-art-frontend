import { resolveImgUrl } from './image-url.util';
import { Producto } from '../models/producto.model';
import { Curso } from '../models/curso.model';
import { TarjetaRegalo } from '../models/tarjetaRegalo.model';

export function resolverUrlsProducto<T extends Producto>(producto: T): T {
  return {
    ...producto,
    img1Url: resolveImgUrl(producto.img1Url),
    img2Url: resolveImgUrl(producto.img2Url),
    img3Url: resolveImgUrl(producto.img3Url),
    img4Url: resolveImgUrl(producto.img4Url),
    img5Url: resolveImgUrl(producto.img5Url)
  };
}

export function resolverUrlsCurso<T extends Curso>(curso: T): T {
  return {
    ...curso,
    img1Url: resolveImgUrl(curso.img1Url),
    img2Url: resolveImgUrl(curso.img2Url),
    img3Url: resolveImgUrl(curso.img3Url),
    img4Url: resolveImgUrl(curso.img4Url),
    img5Url: resolveImgUrl(curso.img5Url)
  };
}

export function resolverUrlTarjeta<T extends TarjetaRegalo>(tarjeta: T): T {
  return { ...tarjeta, imgUrl: resolveImgUrl(tarjeta.imgUrl) };
}
