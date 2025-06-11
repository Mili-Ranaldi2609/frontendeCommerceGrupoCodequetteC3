import axios, { type AxiosResponse } from "axios";

export interface UpdateUserRequestFrontend {
  firstname?: string;
  lastname?: string;
  username?: string; 
  password?: string;
  profileImage?: string; 
  active?: boolean;
  role?: string; 
}
 export interface DireccionRequestFrontend {
    calle: string;
    numero: number;
    cp: string;
    localidadId: number; 
}

export interface DireccionResponseFrontend {
    id: number;
    calle: string;
    numero: number;
    cp: string;
    localidad: { 
        id: number;
        nombre: string;
        provincia: {
            id: number;
            nombre: string;
        };
    };
}
export interface OrdenCompraDetalleDTO {
    id: number;
    cantidad: number;
    subtotal: number;
    detalleId: number; 
    productoId: number;
    productoNombre: string;
    detalleColor: string;
    detalleTalle: string;
}
export interface CartItemFrontend {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    color: string;
    talle: string;
    category: string;
}

export interface PreferenceResponse {
    preferenceId: string;
}
export interface CashOrderResponse {
    id: number; 
    total: number;
    fechaCompra: string;
    estado: string;
    externalReference: string;
    customerName: string;
    shippingAddress: string;
    detalles: OrdenCompraDetalleDTO[]; 
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
// DIRECCIONES DE USUARIO 
// =====================
// Obtener las direcciones del usuario autenticado
export const getUserAddresses = () => api.get(`/auth/direcciones?activeOnly=true`)

// Crear una nueva dirección para el usuario autenticado
export const createDireccion = (data: DireccionRequestFrontend): Promise<DireccionResponseFrontend> => {
    return api.post("/auth/direcciones", data);
};
// Actualizar una dirección existente del usuario autenticado
export const updateDireccion = (direccionId: number, data: DireccionRequestFrontend): Promise<DireccionResponseFrontend> => {
    return api.put(`/auth/direcciones/${direccionId}`, data);
};

// Eliminar una dirección del usuario autenticado
export const deleteDireccion = (direccionId: number): Promise<void> => {
    return api.delete(`/auth/direcciones/${direccionId}`);
};

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
// =====================
// PAGOS Y ORDENES DE COMPRA )
// =====================
export interface PreferenceResponse {
    preferenceId: string;
}

// Función para crear la preferencia de pago de Mercado Pago
export const createMercadoPagoPreference = async (cartItems: CartItemFrontend[], direccionId: number): Promise<AxiosResponse<PreferenceResponse>> => { // <--- ¡CAMBIO AQUÍ!
    return api.post(`/api/payments/create-preference/${direccionId}`, cartItems);
};
export const createCashOrder = async (
    cartItems: CartItemFrontend[],
    direccionId: number
): Promise<AxiosResponse<CashOrderResponse>> => { // <--- CAMBIO AQUÍ: Ahora devuelve AxiosResponse<CashOrderResponse>
    return api.post(`/api/ordenes/crear-efectivo/${direccionId}`, cartItems);
};
// =====================
// UBICACIONES (PARA SELECTS DE PROVINCIA/LOCALIDAD)
// =====================
interface ProvinciaFrontend {
    id: number;
    nombre: string;
}

interface LocalidadFrontend {
    id: number;
    nombre: string;
    provincia: ProvinciaFrontend; 
}

export const getProvincias = (): Promise<{ data: ProvinciaFrontend[] }> =>
    api.get("ubicaciones/provincias");

export const getLocalidades = (provinciaId: number): Promise<{ data: LocalidadFrontend[] }> =>
    api.get(`ubicaciones/localidades?provinciaId=${provinciaId}`);

// =====================
// ÓRDENES DE COMPRA (PARA HISTORIAL DEL USUARIO Y DETALLES)
// =====================
export const getMyOrders = (): Promise<{ data: CashOrderResponse[] }> =>
    api.get("/ordenes/me"); 

export const getOrderDetails = (orderId: number): Promise<{ data: CashOrderResponse }> =>
    api.get(`/ordenes/${orderId}`); 

// =====================
// ÓRDENES DE COMPRA (PARA ADMIN)
// =====================
export const getAllOrders = (): Promise<{ data: CashOrderResponse[] }> =>
    api.get("/admin/ordenes"); // Requiere rol ADMIN en el backend

export const updateOrderStatus = (orderId: number, status: string): Promise<void> =>
    api.put(`/admin/ordenes/${orderId}/status`, { status }); // Requiere rol ADMIN en el backend
