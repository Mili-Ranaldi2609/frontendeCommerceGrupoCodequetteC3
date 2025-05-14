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

  return (
    <div onClick={irADetalle} className={styles.card}>
      <img 
        src={producto.imagenes?.[0]} 
        alt={producto.denominacion} 
        className={styles.imagen} 
      />
      <div className={styles.info}>
        <h3>{producto.denominacion}</h3>
        <span className={styles.precio}>${producto.precioFinal}</span>
      </div>
    </div>
  );
};




