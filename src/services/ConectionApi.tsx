import axios from "axios";

interface UpdateUserRequestFrontend {
  firstname?: string;
  lastname?: string;
  username?: string; 
  password?: string;
  profileImage?: string; 
  active?: boolean;
  role?: string; 
}


export const api = axios.create({
  baseURL: "http://localhost:8080",
});

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
export const uploadImagen = (file: File) => {
  const formData = new FormData();
  formData.append("file", file); 

  return api.post("/productos/upload-image", formData, {
    headers: {
      'Content-Type': 'multipart/form-data' 
    }
  });
};
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

export const getAllUsers = async () => {
  const response = await api.get("/api/admin/users");
  return response.data; 
};
export const updateProfile = (userData: UpdateUserRequestFrontend) => {
  return api.put("/auth/me", userData);
};
export const uploadProfileImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file); 
  return api.post("/auth/upload-profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const createNewUser = async (userData: {
  firstname: string;
  lastname: string;
  username: string; 
  password: string;
  role?: string; 
}) => {
  const response = await api.post("/api/admin/users", userData);
  return response.data; 
};
export const updateExistingUser = async (id: number | string, userData: {
  firstname?: string;
  lastname?: string;
  username?: string; 
  password?: string;
  role?: string;
  active?: boolean;
}) => {
  const response = await api.put(`/api/admin/users/${id}`, userData);
  return response.data;
};
export const deactivateUser = async (id: number | string) => {
  await api.delete(`/api/admin/users/${id}`);
};
export const activateUser = async (id: number | string) => {
  await api.post(`/api/admin/users/${id}/activate`);
};