import { useState, useEffect } from "react";
import type { Producto } from "../types/IProduct";
import { api, getProductos } from "../services/ConectionApi"; // <- tu axios con auth
import axios from "axios"; // Importa axios para manejar errores de forma más específica

export const useProducto = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null); // <-- CAMBIO CLAVE: Error | null

  const obtenerProductos = async () => {
    setLoading(true);
    setError(null); // Resetea el error al inicio de la operación
    try {
      const response = await getProductos();
      setProductos(response.data);
    } catch (err: unknown) { // Mejor manejar como 'unknown' para mayor seguridad de tipo
      if (axios.isAxiosError(err)) {
        // Si es un error de Axios, podemos acceder a response.data
        setError(new Error(err.response?.data?.message || err.message || "Error al cargar los productos"));
      } else if (err instanceof Error) {
        // Si ya es una instancia de Error, la usamos directamente
        setError(err);
      } else {
        // Para cualquier otro tipo de error, creamos un Error genérico
        setError(new Error("Ocurrió un error inesperado al cargar los productos."));
      }
      console.error("Error al obtener productos:", err);
    } finally {
      setLoading(false);
    }
  };

  const crearProducto = async (producto: Producto) => {
    // Es buena práctica manejar loading/error también en estas funciones
    setLoading(true);
    setError(null);
    try {
      await api.post("/productos", producto);
      await obtenerProductos(); // Refresca la lista después de crear
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(new Error(err.response?.data?.message || err.message || "Error al crear el producto"));
      } else if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("Ocurrió un error inesperado al crear el producto."));
      }
      console.error("Error al crear producto:", err);
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/productos/${id}`);
      await obtenerProductos(); // Refresca la lista después de eliminar
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(new Error(err.response?.data?.message || err.message || "Error al eliminar el producto"));
      } else if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("Ocurrió un error inesperado al eliminar el producto."));
      }
      console.error("Error al eliminar producto:", err);
    } finally {
      setLoading(false);
    }
  };

  const editarProducto = async (id: number, producto: Producto) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/productos/${id}`, producto);
      await obtenerProductos(); // Refresca la lista después de editar
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(new Error(err.response?.data?.message || err.message || "Error al editar el producto"));
      } else if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("Ocurrió un error inesperado al editar el producto."));
      }
      console.error("Error al editar producto:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  return {
    productos,
    loading,
    error,
    obtenerProductos,
    crearProducto,
    eliminarProducto,
    editarProducto,
  };
};