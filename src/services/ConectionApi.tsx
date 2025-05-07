import axios from "axios";

// Configuración base
export const api = axios.create({
  baseURL: "http://localhost:8080", 
  auth: {
    username: "user",        
    password: "123456789" 
  },
});

// =====================
// CATEGORÍAS
// =====================
export const getCategorias = () => api.get("/categorias");
export const getCategoriaById = (id: number) => api.get(`/categorias/${id}`);
export const createCategoria = (data: any) => api.post("/categorias", data);
export const updateCategoria = (id: number, data: any) => api.put(`/categorias/${id}`, data);
export const deleteCategoria = (id: number) => api.delete(`/categorias/${id}`);

// =====================
// PRODUCTOS
// =====================
export const getProductos = () => api.get("/producto_detalle");
export const getProductoById = (id: number) => api.get(`/producto_detalle/${id}`);
export const createProducto = (data: any) => api.post("/producto_detalle", data);
export const updateProducto = (id: number, data: any) => api.put(`/producto_detalle/${id}`, data);
export const deleteProducto = (id: number) => api.delete(`/producto_detalle/${id}`);

// =====================
// USUARIOS
// =====================
export const getUsuarios = () => api.get("/usuarios");
export const getUsuarioById = (id: number) => api.get(`/usuarios/${id}`);
export const createUsuario = (data: any) => api.post("/usuarios", data);
export const updateUsuario = (id: number, data: any) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id: number) => api.delete(`/usuarios/${id}`);
