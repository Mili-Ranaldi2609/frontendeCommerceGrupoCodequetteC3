export interface ProvinciaFrontend {
    id: number;
    nombre: string;
}

export interface LocalidadFrontend {
    id: number;
    nombre: string;
    provincia: ProvinciaFrontend; 
}