import type { IColor } from "./IEnumColor";
import type { IEnumTalle } from "./IEnumTalle";

export type IDetalle = {
  color: IColor;
  talle: IEnumTalle;
  marca: string;
  stock: number;
  precio: number;
};
