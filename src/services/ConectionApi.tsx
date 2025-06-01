import axios from "axios";

const token="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcmFuY28xMjQiLCJpYXQiOjE3NDgzOTE5NzAsImV4cCI6MjA2Mzc1MTk3MH0.UfNMR5b-lr4dz9CHbvYasmu7gG5-KvD_ShIxUHMt9kI"
// Base de axios sin autenticación básica
export const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${token}`,
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
export const getProductos = () => api.get("/productos");
export const getProductoById = (id: number) => api.get(`/productos/${id}`);
export const createProducto = (data: any) => api.post("/producto_detalle", data);
export const updateProducto = (id: number, data: any) => api.put(`/producto_detalle/${id}`, data);
export const deleteProducto = (id: number) => api.delete(`/producto_detalle/${id}`);
export const getProductosFiltrados = (params: Record<string, string>) =>api.get("/productos/filtrar", { params });

// =====================
// USUARIOS
// =====================
export const getUsuarios = () => api.get("/usuarios");
export const getUsuarioById = (id: number) => api.get(`/usuarios/${id}`);
export const createUsuario = (data: any) => api.post("/usuarios", data);
export const updateUsuario = (id: number, data: any) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id: number) => api.delete(`/usuarios/${id}`);
