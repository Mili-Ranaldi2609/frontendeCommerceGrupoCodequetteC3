import type { IDetalle } from "./IDetalle";

export type Producto = {
  id: number;
  denominacion: string;
  precioOriginal: number;
  precioFinal: number;
  sexo: 'MASCULINO' | 'FEMENINO' | 'UNISEX' | 'UNISEX_CHILD';
  tienePromocion: boolean;
  categorias: string[];
  imagenes: string[];
  detalle:IDetalle
};
