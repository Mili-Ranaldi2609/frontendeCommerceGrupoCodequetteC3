import type { FC } from "react";
import type { Producto } from "../../types/IProduct";
import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

import zapatillasejemplo1 from "../../assets/zapatillasejemplo1.jpeg";
import zapatillasejemplo2 from "../../assets/zapatillasejemplo2.jpeg";
import zapatillasejemplo3 from "../../assets/zapatillasejemplo3.jpeg";

const imagenesMap: { [key: string]: string } = {
  "zapatillasejemplo1.jpeg": zapatillasejemplo1,
  "zapatillasejemplo2.jpeg": zapatillasejemplo2,
  "zapatillasejemplo3.jpeg": zapatillasejemplo3
};

type Props = {
  producto: Producto;
};

export const ProductoCard: FC<Props> = ({ producto }) => {
  const navigate = useNavigate();

  const irADetalle = () => {
    navigate(`/producto/${producto.id}`);
  };

  const imagenSrc = imagenesMap[producto.imagenes?.[0]] || "/sin-imagen.jpg";

  return (
    <div onClick={irADetalle} className={styles.card}>
      <img
        src={imagenSrc}
      />
      <div className={styles.info}>
        <h3>{producto.denominacion}</h3>
        <p>
          {producto.detalle.color} - Talle {producto.detalle.talle}
        </p>
        <span className={styles.precio}>${producto.precioVenta}</span>
      </div>
    </div>
  );
};


