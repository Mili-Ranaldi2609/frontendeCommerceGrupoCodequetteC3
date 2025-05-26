import type { FC } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductoPage.module.css";
import { useProductoStore } from "../../../store/useProductoStore";

export const ProductoDetalle: FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    productoSeleccionado: producto,
    fetchProductoPorId,
    loading,
    error,
  } = useProductoStore();

  useEffect(() => {
    if (id) {
      console.log("📦 ID recibido por useParams:", id);
      fetchProductoPorId(Number(id));
    }
  }, [id, fetchProductoPorId]);

  useEffect(() => {
    if (producto) {
      console.log("🔍 Producto recibido:", producto);
      console.log("🔍 DetalleDTO:", producto.detalle);
      console.log("🔍 Categorías:", producto.categorias);
    }
  }, [producto]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!producto) return <p>Producto no encontrado</p>;

  return (
    <div className={styles.info}>
      <h2>{producto.denominacion}</h2>

      {producto.detalle ? (
        <>
          <p>{producto.detalle.color} - Talle {producto.detalle.talle}</p>
          <p><strong>Stock disponible: </strong>{producto.detalle.stock}</p>
        </>
      ) : (
        <p>Detalle no disponible</p>
      )}

      <span className={styles.precio}>${producto.precioOriginal}</span>
      <p><strong>Precio Final: </strong>${producto.precioFinal}</p>
      <p>
        <strong>Categorías: </strong>
        {producto.categorias?.join(", ") || "Sin categoría"}
      </p>
      <button className={styles.comprar}>Agregar al carrito</button>
    </div>
  );
};
