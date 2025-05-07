export type Producto = {
  id: number;
  denominacion: string;
  precioVenta: number;
  precioFinal: number; 
  sexo: 'MASCULINO' | 'FEMENINO' | 'UNISEX' | 'UNISEX_CHILD'; 
  tienePromocion: boolean;
  categorias: string[];
  imagenes: string[]; 
  detalle: {
    precioCompra: number;
    stockActual: number;
    cantidad: number;
    stockMaximo: number;
    color: string;
    talle: string;
  };
};
