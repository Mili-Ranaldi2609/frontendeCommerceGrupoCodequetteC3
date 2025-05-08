import { useState, useEffect } from "react";
import type { Producto } from "../types/IProduct";
import { api } from "../services/ConectionApi"; // <- tu axios con auth

export const useProducto = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); 

  const obtenerProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Producto[]>("/productos");
      setProductos(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar los productos");
      console.error("Error al obtener productos", err);
    } finally {
      setLoading(false);
    }
  };

  const crearProducto = async (producto: Producto) => {
    try {
      await api.post("/productos", producto);
      await obtenerProductos();
    } catch (err) {
      console.error("Error al crear producto", err);
    }
  };

  const eliminarProducto = async (id: number) => {
    try {
      await api.delete(`/productos/${id}`);
      await obtenerProductos();
    } catch (err) {
      console.error("Error al eliminar producto", err);
    }
  };

  const editarProducto = async (id: number, producto: Producto) => {
    try {
      await api.put(`/productos/${id}`, producto);
      await obtenerProductos();
    } catch (err) {
      console.error("Error al editar producto", err);
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
