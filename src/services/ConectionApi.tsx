import axios from "axios";

//const token="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtaWxpMTIzNEBnbWFpbC5jb20iLCJpYXQiOjE3NDg4MDYzNzgsImV4cCI6MjA2NDE2NjM3OH0.4ALiW92ZX8EtQeigf8pkkDWTQvHCCvHC_O1Gkc0K65U"
// Base de axios sin autenticación básica
//////export const api = axios.create({
  //: "http://localhost:8080",
  //: {
    //Authorization: `Bearer ${token}`,
 // },
//});


// Instancia base
export const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Interceptor para agregar el token dinámicamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================
// ENDPOINT AUTH /auth/me
// =====================
export const getUsuarioActual = () => api.get("/auth/me");

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
export const getProductosFiltrados = (params: Record<string, string>) => api.get("/productos/filtrar", { params });

// =====================
// USUARIOS
// =====================
export const registerUsuario = (data: {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}) => {
  return axios.post("http://localhost:8080/auth/register", data);
};

export const loginUsuario = (username: string, password: string) => {
  return axios.post("http://localhost:8080/auth/login", { username, password });
};

export const getUsuarios = () => api.get("/usuarios");
export const getUsuarioById = (id: number) => api.get(`/usuarios/${id}`);
export const createUsuario = (data: any) => api.post("/usuarios", data);
export const updateUsuario = (id: number, data: any) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id: number) => api.delete(`/usuarios/${id}`);
