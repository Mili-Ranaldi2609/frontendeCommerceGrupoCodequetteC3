import type { FC } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductoPage.module.css";
import { useProductoStore } from "../../../store/useProductoStore";
import { useCartStore } from "../../../store/useCartStore";

export const ProductoDetalle: FC = () => {
  const { addToCart } = useCartStore();
  const [animateFly, setAnimateFly] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null);
  const [talleSeleccionado, setTalleSeleccionado] = useState<string | null>(null);

  const handleAgregarAlCarrito = () => {
    if (!producto || !colorSeleccionado || !talleSeleccionado) {
      alert("Debes seleccionar un color y un talle");
      return;
    }

    addToCart({
      id: producto.id,
      name: producto.denominacion,
      price: producto.precioFinal,
      quantity: 1,
    });

    setAnimateFly(true);
    setTimeout(() => setAnimateFly(false), 1000);
  };


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
      console.log(producto?.detalle);
      
    }
  }, [id, fetchProductoPorId]);

  useEffect(() => {
    if (producto?.imagenes?.length) {
      setImagenSeleccionada(producto.imagenes[0]);
    }
  }, [producto]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!producto) return <p>Producto no encontrado</p>;

  return (
    <div className={styles.detalle}>
      <div className={styles.imagenes}>
        {imagenSeleccionada && (
          <img
            src={imagenSeleccionada}
            alt="Imagen principal"
            className={styles.imagenPrincipal}
          />
        )}
        <div className={styles.miniaturas}>
          {producto.imagenes?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Miniatura ${i}`}
              className={`${styles.miniatura} ${imagenSeleccionada === img ? styles.seleccionada : ""}`}
              onClick={() => setImagenSeleccionada(img)}
            />
          ))}
        </div>
      </div>

      <div className={styles.info}>
        <h2>{producto.denominacion}</h2>
        <p>{producto.denominacion}</p>

        {producto.detalle ? (
          <>
            <p><strong>Stock:</strong> {producto.detalle.stock}</p>
            <div className={styles.opciones}>
              <label>Color: </label>
              <button
                className={`${styles.opcion} ${colorSeleccionado === producto.detalle.color ? styles.activa : ""}`}
                onClick={() => setColorSeleccionado(producto.detalle.color)}
              >
                {producto.detalle.color}
              </button>
            </div>

            <div className={styles.opciones}>
              <label>Talle: </label>
              <button
                className={`${styles.opcion} ${talleSeleccionado === producto.detalle.talle ? styles.activa : ""}`}
                onClick={() => setTalleSeleccionado(producto.detalle.talle)}
              >
                {producto.detalle.talle}
              </button>
            </div>

          </>
        ) : (
          <p>Detalle no disponible</p>
        )}

        <p className={styles.precio}>Precio original: ${producto.precioOriginal}</p>
        <p><strong>Precio final:</strong> ${producto.precioFinal}</p>

        <p><strong>Categorías:</strong> {producto.categorias?.join(", ") || "Sin categoría"}</p>

        <button
          onClick={handleAgregarAlCarrito}
          className={`${styles.addToCartButton} ${animateFly ? styles.sendToCart : ""}`}
        >
          Agregar al carrito
          <span className={styles.cartItem}></span>
        </button>
      </div>
    </div>
  );
};

