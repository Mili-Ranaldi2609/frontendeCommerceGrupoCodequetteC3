import type { FC } from "react";
import { useEffect, useState, useMemo } from "react";
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

  const { id } = useParams<{ id: string }>();
  const {
    productoSeleccionado: producto,
    fetchProductoPorId,
    loading,
    error,
  } = useProductoStore();

  // ----- NUEVA LÓGICA PARA MANEJAR COLORES Y TALLES ÚNICOS -----
  const coloresDisponibles = useMemo(() => {
    if (!producto || !producto.detalle) return [];
    // Obtenemos solo los colores únicos de todos los detalles
    return Array.from(new Set(producto.detalle.map(d => d.color)));
  }, [producto]);

  const tallesDisponiblesParaColor = useMemo(() => {
    if (!producto || !producto.detalle || !colorSeleccionado) return [];
    // Filtramos los detalles por el color seleccionado y obtenemos sus talles únicos
    return Array.from(
      new Set(
        producto.detalle
          .filter(d => d.color === colorSeleccionado)
          .map(d => d.talle)
      )
    );
  }, [producto, colorSeleccionado]);

  const detalleSeleccionado = useMemo(() => {
    if (!producto || !producto.detalle || !colorSeleccionado || !talleSeleccionado) {
      return null;
    }
    // Buscamos el detalle exacto que coincida con color y talle seleccionados
    return producto.detalle.find(
      d => d.color === colorSeleccionado && d.talle === talleSeleccionado
    );
  }, [producto, colorSeleccionado, talleSeleccionado]);

  // -----------------------------------------------------------

  const handleAgregarAlCarrito = () => {
    if (!producto || !detalleSeleccionado) { // Usamos detalleSeleccionado aquí
      alert("Debes seleccionar un color y un talle válidos.");
      return;
    }

    addToCart({
      id: producto.id,
      name: producto.descripcion,
      // Usamos el precioVenta del detalle seleccionado
      price: detalleSeleccionado.precioVenta,
      quantity: 1, // Por ahora, asumimos 1. Podrías añadir un selector de cantidad.
      // Puedes añadir más información del detalle aquí si la necesitas en el carrito
      color: detalleSeleccionado.color,
      talle: detalleSeleccionado.talle,
      // ... otros campos del detalle si son relevantes para el carrito
    });

    setAnimateFly(true);
    setTimeout(() => setAnimateFly(false), 1000);
  };

  useEffect(() => {
    if (id) {
      console.log("📦 ID recibido por useParams:", id);
      fetchProductoPorId(Number(id));
    }
  }, [id, fetchProductoPorId]);

  useEffect(() => {
    if (producto?.detalle && producto.detalle.length > 0 && producto.detalle[0]?.imagenes?.length) {
  setImagenSeleccionada(producto.detalle[0].imagenes[0]);
}
    // Una vez que el producto carga, si hay colores y talles disponibles, selecciona el primero por defecto
    if (producto?.detalle && producto.detalle.length > 0) {
      if (coloresDisponibles.length > 0 && !colorSeleccionado) {
        setColorSeleccionado(coloresDisponibles[0]);
      }
      // No selecciones talle aquí, el talle depende del color seleccionado
    }
  }, [producto, coloresDisponibles, colorSeleccionado]); // Añade dependencias

  // Efecto para seleccionar el primer talle disponible cuando cambia el color seleccionado
  useEffect(() => {
    if (tallesDisponiblesParaColor.length > 0) {
      setTalleSeleccionado(tallesDisponiblesParaColor[0]);
    } else {
      setTalleSeleccionado(null); // Resetea el talle si no hay talles para el color
    }
  }, [tallesDisponiblesParaColor]);


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
          {/* Verificamos que 'detalle' exista y no esté vacío */}
          {producto.detalle && producto.detalle.length > 0 &&
            /* Ahora, específicamente verificamos que 'imagenes' exista en el primer detalle */
            producto.detalle[0].imagenes &&
            // Y luego, si existe, lo mapeamos
            producto.detalle[0].imagenes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Miniatura ${i}`}
                className={`${styles.miniatura} ${imagenSeleccionada === img ? styles.seleccionada : ""}`}
                onClick={() => setImagenSeleccionada(img)}
              />
            ))}

          {/* Mensaje opcional si no hay imágenes o no se han cargado */}
          {(!producto.detalle || producto.detalle.length === 0 || !producto.detalle[0].imagenes) && (
            <p>No hay miniaturas disponibles o están cargando...</p>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <h2>{producto.descripcion}</h2>
        <p>{producto.descripcion}</p> {/* Doble descripción, puedes quitar una */}

        {producto.detalle && producto.detalle.length > 0 ? (
          <>
            {/* Mostrar stock del detalle seleccionado */}
            <p>
              <strong>Stock:</strong>{" "}
              {detalleSeleccionado ? detalleSeleccionado.stock : "Selecciona opciones"}
            </p>

            <div className={styles.opciones}>
              <label>Color: </label>
              {coloresDisponibles.map((color, i) => (
                <button
                  key={i}
                  className={`${styles.opcion} ${colorSeleccionado === color ? styles.activa : ""}`}
                  onClick={() => setColorSeleccionado(color)}
                >
                  {color}
                </button>
              ))}
            </div>

            <div className={styles.opciones}>
              <label>Talle: </label>
              {tallesDisponiblesParaColor.map((talle, i) => (
                <button
                  key={i}
                  className={`${styles.opcion} ${talleSeleccionado === talle ? styles.activa : ""}`}
                  onClick={() => setTalleSeleccionado(talle)}
                >
                  {talle}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p>Detalle no disponible para este producto.</p>
        )}

        {/* Mostrar precio del detalle seleccionado, si existe */}
        {detalleSeleccionado ? (
          <>
            <p>
              <strong>Precio:</strong> ${detalleSeleccionado.precioVenta?.toFixed(2)}
            </p>
          </>
        ) : (
          <p>Selecciona un color y talle para ver el precio.</p>
        )}

        <p>
          <strong>Categorías:</strong>{" "}
          {producto.categorias?.map(cat => cat.descripcion).join(", ") || "Sin categoría"}
        </p>

        <button
          onClick={handleAgregarAlCarrito}
          className={`${styles.addToCartButton} ${animateFly ? styles.sendToCart : ""}`}
          disabled={!detalleSeleccionado || (detalleSeleccionado && detalleSeleccionado.stock === 0)} // Deshabilita si no hay detalle seleccionado o stock es 0
        >
          Agregar al carrito
          <span className={styles.cartItem}></span>
        </button>
      </div>
    </div>
  );
};