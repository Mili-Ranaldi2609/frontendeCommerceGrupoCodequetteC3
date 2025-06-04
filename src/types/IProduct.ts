import type { ICategoria } from "./ICategoria";
import type { IDetalle } from "./IDetalle";

export type Producto = {
  id: number;
  descripcion: string;
  tipoProducto:string;
  sexo: 'MASCULINO' | 'FEMENINO' | 'UNISEX' | 'UNISEX_CHILD';
  categorias: ICategoria[];
  detalle:IDetalle[]
};
