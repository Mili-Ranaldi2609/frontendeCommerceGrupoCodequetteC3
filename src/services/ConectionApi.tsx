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
export const getProductos = () => api.get("/productos/activos");
export const getAllProductos = () => api.get("/productos");
export const getProductoById = (id: number) => api.get(`/productos/${id}`);
export const createProducto = (data: any) => api.post("/productos", data);
export const updateProducto = (id: number, data: any) => api.put(`/productos/${id}`, data);
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

export const getUsuarioById = (id: number) => api.get(`/usuarios/${id}`);

// =====================
// GESTIÓN DE USUARIOS (Endpoints de ADMIN)
// =====================

// ✨ Nueva función para obtener todos los usuarios (para el panel de administración)
export const getAllUsers = async () => {
  // Endpoint del backend: GET /api/admin/users
  const response = await api.get("/api/admin/users");
  return response.data; // Retorna la lista de usuarios
};

// ✨ Nueva función para crear un usuario (desde el panel de administración)
export const createNewUser = async (userData: {
  firstname: string;
  lastname: string;
  username: string; // Email
  password: string;
  role?: string; // Opcional, si el admin puede asignar roles
}) => {
  // Endpoint del backend: POST /api/admin/users
  const response = await api.post("/api/admin/users", userData);
  return response.data; // Retorna el usuario creado
};

// ✨ Nueva función para actualizar un usuario
export const updateExistingUser = async (id: number | string, userData: {
  firstname?: string;
  lastname?: string;
  username?: string; // Email
  password?: string;
  role?: string;
  active?: boolean; // Para activar/desactivar desde la misma función de update
}) => {
  // Endpoint del backend: PUT /api/admin/users/{id}
  const response = await api.put(`/api/admin/users/${id}`, userData);
  return response.data; // Retorna el usuario actualizado
};

// ✨ Nueva función para desactivar (soft delete) un usuario
export const deactivateUser = async (id: number | string) => {
  // Endpoint del backend: DELETE /api/admin/users/{id}
  await api.delete(`/api/admin/users/${id}`);
  // No retorna contenido, solo un 204 No Content
};

// ✨ Nueva función para activar un usuario (si lo necesitas)
export const activateUser = async (id: number | string) => {
  // Endpoint del backend: POST /api/admin/users/{id}/activate
  await api.post(`/api/admin/users/${id}/activate`);
};