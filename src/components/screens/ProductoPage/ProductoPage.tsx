/*import type { FC } from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Producto } from "../../../types/IProduct";
import { api } from "../../../services/ConectionApi";
import axios from "axios";
import styles from "./ProductoPage.module.css";
import { NavBar } from "../../screens/Navbar/NavBar";
import { Footer } from "../../screens/Footer/Footer";


export const ProductoDetalle: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  
  const obtenerProducto = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Producto>(`/productos/${id}`);
      setProducto(response.data);
    } catch (err: any) {
      setError("Error al cargar el detalle del producto");
      console.error("Error al obtener producto", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      obtenerProducto();
    }
    console.log("ID recibido por useParams:", id);
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!producto) return <p>Producto no encontrado</p>;

  return (
    <>
      <NavBar />

      <div className={styles.detalle}>
        <div className={styles.imagenes}>
          {producto.imagenes?.map((imagen, index) => (
            <img key={index} src={imagen} alt={producto.denominacion} />
          ))}
        </div>
        <div className={styles.info}>
          <h2>{producto.denominacion}</h2>
          <p>{producto.detalle.color} - Talle {producto.detalle.talle}</p>
          <span className={styles.precio}>${producto.precioVenta}</span>
          <p><strong>Precio Final: </strong>${producto.precioFinal}</p>
          <p><strong>Stock disponible: </strong>{producto.detalle.stockActual}</p>
          <p><strong>Stock máximo: </strong>{producto.detalle.stockMaximo}</p>
          <p><strong>Categorías: </strong>{producto.categorias.join(", ")}</p>
          <button className={styles.comprar}>Agregar al carrito</button>
        </div>
      </div>

      <Footer />
    </>
  );
};
*/
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Producto } from "../../../types/IProduct";
import { api } from "../../../services/ConectionApi";
import axios from "axios";
import styles from "./ProductoPage.module.css";
import { NavBar } from "../../screens/Navbar/NavBar";
import { Footer } from "../../screens/Footer/Footer";

export const ProductoDetalle: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerProducto = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3001/productos/${id}`);
      console.log(response.data);
      setProducto(response.data);
    } catch (error) {
      setError("Error al cargar el detalle del producto");
      console.error("Error al obtener producto", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      obtenerProducto();
    }
    console.log("ID recibido por useParams:", id);
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!producto) return <p>Producto no encontrado</p>;

  return (
    <>

      <div className={styles.detalle}>
        <div className={styles.imagenes}>
          {producto.imagenes?.map((imagen, index) => (
            <img key={index} src={imagen} alt={producto.denominacion} />
          ))}
        </div>
        <div className={styles.info}>
          <h2>{producto.denominacion}</h2>
          <p>{producto.detalle.color} - Talle {producto.detalle.talle}</p>
          <span className={styles.precio}>${producto.precioVenta}</span>
          <p><strong>Precio Final: </strong>${producto.precioFinal}</p>
          <p><strong>Stock disponible: </strong>{producto.detalle.stockActual}</p>
          <p><strong>Stock máximo: </strong>{producto.detalle.stockMaximo}</p>
          <p><strong>Categorías: </strong>{producto.categorias.join(", ")}</p>
          <button className={styles.comprar}>Agregar al carrito</button>
        </div>
      </div>
    </>
  );
};

