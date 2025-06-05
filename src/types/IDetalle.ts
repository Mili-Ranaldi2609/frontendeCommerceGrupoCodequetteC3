import type { IColor } from "./IEnumColor";
import type { IEnumTalle } from "./IEnumTalle";

export type IDetalle = {
  id?: number;
  color: IColor;
  talle: IEnumTalle;
  marca: string;
  stock: number;
  precioCompra: number
  precioVenta: number
  imagenes: string[];
  active?: boolean;
};
