import { create } from 'zustand';

import { getProductos, getProductoById, getProductosFiltrados } from '../services/ConectionApi';
import type { Producto } from '../types/IProduct';

interface ProductoState {
  productos: Producto[];
  productoSeleccionado: Producto | null;
  loading: boolean;
  error: string | null;
  fetchProductos: () => Promise<void>;
  fetchProductoPorId: (id: number) => Promise<void>;
  clearProductoSeleccionado: () => void;
}

export const useProductoStore = create<ProductoState>((set) => ({
  productos: [],
  productoSeleccionado: null,
  loading: false,
  error: null,

  /* fetchProductos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getProductos();
      set({ productos: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar productos', loading: false });
    }
  },
 */
fetchProductos: async (params?: Record<string, string>) => {
  set({ loading: true, error: null });
  try {
    const response = params
      ? await getProductosFiltrados(params)
      : await getProductos();
    set({ productos: response.data, loading: false });
  } catch (error: any) {
    set({ error: error.message || 'Error al cargar productos', loading: false });
  }
},

  fetchProductoPorId: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await getProductoById(id);
      set({ productoSeleccionado: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al cargar el producto', loading: false });
    }
  },

  clearProductoSeleccionado: () => set({ productoSeleccionado: null }),
}));