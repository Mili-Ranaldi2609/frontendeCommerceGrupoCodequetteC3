import type { Producto } from "./IProduct"

export type ICategoria = {
    id:number
    descripcion:string
    categoriaPadre?:ICategoria
    subcategorias?:ICategoria[]
    productos?:Producto[];
};
