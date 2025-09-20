// src/app/utils/image-optimizer.util.ts

export type OptimizeOptions = {
  maxBytes?: number;    // límite de tamaño final (bytes)
  maxWidth?: number;    // ancho máx
  maxHeight?: number;   // alto máx
  quality?: number;     // [0..1] calidad webp inicial
  minQuality?: number;  // [0..1] calidad mínima a la que permitimos bajar
  steps?: number;       // intentos de compresión
  downscaleFactor?: number; // factor para reducir dimensiones si sigue grande (1.5 => ~66%)
};

const DEFAULTS: Required<OptimizeOptions> = {
  maxBytes: 800 * 1024,   // 800 KB
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
  minQuality: 0.5,
  steps: 6,
  downscaleFactor: 1.5,
};

/** Lee un File y devuelve un HTMLImageElement listo para dibujar en canvas */
export function readFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Error leyendo archivo'));
    fr.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('El archivo no es una imagen válida'));
      img.src = fr.result as string;
    };
    fr.readAsDataURL(file);
  });
}

/** Dibuja la imagen en un canvas respetando proporciones y límites de tamaño */
export function drawToCanvas(
  img: HTMLImageElement,
  maxW: number,
  maxH: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  let { width, height } = img;

  const ratio = Math.min(maxW / width, maxH / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/** Genera un Blob WebP desde un canvas con la calidad pedida */
export function canvasToWebP(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar WebP'))),
      'image/webp',
      quality
    );
  });
}

/** Cambia/extiende el nombre con .webp */
export function ensureWebPExtension(name: string): string {
  return name.replace(/\.[^.]+$/i, '') + '.webp';
}

/** DataURL para previsualización */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Error leyendo archivo'));
    fr.onload = () => resolve(fr.result as string);
    fr.readAsDataURL(file);
  });
}

/** Comprueba si un File es WebP (por mime o extensión) */
export function isWebpFile(file: File): boolean {
  const byMime = file.type?.toLowerCase() === 'image/webp';
  const byExt = /\.webp$/i.test(file.name || '');
  return byMime || byExt;
}

/** Comprueba si el File supera un límite en bytes */
export function isTooLarge(file: File, maxBytes: number): boolean {
  return file.size > maxBytes;
}

/**
 * Optimiza (resize + compresión) y fuerza WebP por debajo de un límite de bytes.
 * Devuelve un File listo para subir (type image/webp) o lanza error si falla.
 */
export async function convertToWebPUnderLimit(
  file: File,
  opts: OptimizeOptions = {}
): Promise<File> {
  const conf = { ...DEFAULTS, ...opts };
  const img = await readFileAsImage(file);

  // 1) Primer render con límites
  let canvas = drawToCanvas(img, conf.maxWidth, conf.maxHeight);
  let quality = conf.quality;
  let blob = await canvasToWebP(canvas, quality);

  // 2) Bucle de compresión ajustando calidad
  for (let i = 0; i < conf.steps && blob.size > conf.maxBytes && quality > conf.minQuality; i++) {
    quality = Math.max(conf.minQuality, +(quality - (conf.quality - conf.minQuality) / conf.steps).toFixed(2));
    blob = await canvasToWebP(canvas, quality);
  }

  // 3) Si aún es grande, reducimos dimensiones y un intento extra
  if (blob.size > conf.maxBytes) {
    const newMaxW = Math.round(conf.maxWidth / conf.downscaleFactor);
    const newMaxH = Math.round(conf.maxHeight / conf.downscaleFactor);
    canvas = drawToCanvas(img, newMaxW, newMaxH);
    blob = await canvasToWebP(canvas, quality);
  }

  // 4) Retornar como File (aunque si supera un poco, dejamos que el caller decida si rechaza)
  return new File([blob], ensureWebPExtension(file.name), {
    type: 'image/webp',
    lastModified: Date.now(),
  });

  
}
