import type { FC } from "react";
import type { Producto } from "../../types/IProduct";
import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

type Props = {
  producto: Producto;
};

export const ProductoCard: FC<Props> = ({ producto }) => {
  const navigate = useNavigate();

  const irADetalle = () => {
    navigate(`/producto/${producto.id}`);
  };

  let precioDisplay = "Precio no disponible";
  if (producto.detalle && producto.detalle.length > 0) {
    const preciosVenta = producto.detalle.map(d => d.precioVenta).filter(p => p !== undefined && p !== null) as number[];
    if (preciosVenta.length > 0) {
      const minPrecio = Math.min(...preciosVenta);
      const maxPrecio = Math.max(...preciosVenta);

      if (minPrecio === maxPrecio) {
        precioDisplay = `$${minPrecio.toFixed(2)}`;
      } else {
        precioDisplay = `$${minPrecio.toFixed(2)} - $${maxPrecio.toFixed(2)}`;
      }
    }
  }

  return (
    <div onClick={irADetalle} className={styles.card}>
      <img
        src={producto.imagenes?.[0]}
        alt={producto.descripcion}
        className={styles.imagen}
      />
      <div className={styles.info}>
        <h3>{producto.descripcion}</h3>
        {/* Muestra el rango de precios o el precio único */}
        <span className={styles.precio}>{precioDisplay}</span>
      </div>
    </div>
  );
};