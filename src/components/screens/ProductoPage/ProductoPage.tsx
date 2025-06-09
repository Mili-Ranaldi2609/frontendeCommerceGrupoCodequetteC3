import type { FC } from "react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importar useNavigate
import styles from "./ProductoPage.module.css";
import { useProductoStore } from "../../../store/useProductoStore";
import { useCartStore } from "../../../store/useCartStore"; 
import { Carousel } from "../../ui/Carousel/Carousel";
import { ProductoCard } from "../../ui/ProductCard/ProductCard";
import type { IEnumTalle } from "../../../types/IEnumTalle";
import type { Producto } from '../../../types/IProduct'; 

export const ProductoDetalle: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, items: cartItems, doesItemExist } = useCartStore(); 
  const navigate = useNavigate(); 
  console.log(cartItems);
  
  const {
    productoSeleccionado: producto,
    fetchProductoPorId,
    loading,
    error,
    productos: allProducts,
    fetchProductos,
  } = useProductoStore();

  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null);
  const [talleSeleccionado, setTalleSeleccionado] = useState<IEnumTalle | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Producto[]>([]);
  const [animateFly, setAnimateFly] = useState(false);
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false); 
  const miniaturasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const scrollTopStart = useRef(0);



  useEffect(() => {
    if (id) {
      fetchProductoPorId(Number(id));
      // Resetear selecciones al cargar un nuevo producto
      setImagenSeleccionada(null);
      setColorSeleccionado(null);
      setTalleSeleccionado(null);
      setShowDuplicateMessage(false); // Resetear el mensaje al cambiar de producto
    }
  }, [id, fetchProductoPorId]);

  useEffect(() => {
    if (allProducts.length === 0 && !loading) {
      fetchProductos();
    }
  }, [allProducts.length, loading, fetchProductos]);

  useEffect(() => {
    if (producto) {
      const primerDetalle = producto.detalle?.[0];
      setImagenSeleccionada(primerDetalle?.imagenes?.[0] || null);
      setColorSeleccionado(primerDetalle?.color || null);
    }
  }, [producto]);

  // --- Cálculos Derivados con useMemo para Optimización ---

  const coloresDisponibles = useMemo(() => {
    return producto?.detalle ? Array.from(new Set(producto.detalle.map((d) => d.color))) : [];
  }, [producto]);

  const tallesDisponibles = useMemo(() => {
    if (!producto?.detalle || !colorSeleccionado) return [];
    return Array.from(
      new Set(producto.detalle.filter((d) => d.color === colorSeleccionado).map((d) => d.talle))
    );
  }, [producto, colorSeleccionado]);

  useEffect(() => {
    if (talleSeleccionado && !tallesDisponibles.includes(talleSeleccionado)) {
      setTalleSeleccionado((tallesDisponibles[0] || null) as IEnumTalle | null);
    } else if (!talleSeleccionado && tallesDisponibles.length > 0) {
      setTalleSeleccionado(tallesDisponibles[0] as IEnumTalle);
    }
    // Cuando el talle o color cambian, ocultamos el mensaje de duplicado
    setShowDuplicateMessage(false);
  }, [tallesDisponibles, talleSeleccionado, colorSeleccionado]); // Añadimos colorSeleccionado a las dependencias

  const detalleSeleccionado = useMemo(() => {
    if (!producto || !colorSeleccionado || !talleSeleccionado) return null;
    return (
      producto.detalle.find(
        (d) => d.color === colorSeleccionado && d.talle === talleSeleccionado
      ) || null
    );
  }, [producto, colorSeleccionado, talleSeleccionado]);

  // --- Lógica de Productos Relacionados ---

  useEffect(() => {
    if (!producto || allProducts.length === 0) {
      setRelatedProducts([]);
      return;
    }

    const categoriaIdsActual = new Set(producto.categorias.map(c => c.id).filter(Boolean));

    const relacionados = allProducts
      .filter(p => p.id !== producto.id)
      .filter(p =>
        p.categorias.some(c => c.id && categoriaIdsActual.has(c.id))
      )
      .slice(0, 6);

    setRelatedProducts(relacionados);
  }, [producto, allProducts]);

  // --- Funciones para Interacción del Usuario (useCallback para Estabilidad) ---

  const handleMiniaturasWheelScroll = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (miniaturasRef.current) {
      e.preventDefault();
      miniaturasRef.current.scrollTop += e.deltaY;
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!miniaturasRef.current) return;
    isDragging.current = true;
    startPos.current = e.clientY;
    scrollTopStart.current = miniaturasRef.current.scrollTop;
    miniaturasRef.current.style.cursor = "grabbing";
    miniaturasRef.current.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !miniaturasRef.current) return;
      miniaturasRef.current.scrollTop = scrollTopStart.current - (e.clientY - startPos.current);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      if (miniaturasRef.current) {
        miniaturasRef.current.style.cursor = "grab";
        miniaturasRef.current.style.userSelect = "auto";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Función para añadir el producto al carrito con la animación de "fly to cart"
  const handleAddToCart = () => {
    if (!producto || !detalleSeleccionado) {
      alert("Debes seleccionar un color y un talle válidos.");
      return;
    }

    // ⭐ Lógica para verificar si el producto ya está en el carrito
    const itemAlreadyInCart = doesItemExist(
      producto.id,
      detalleSeleccionado.color,
      detalleSeleccionado.talle
    );

    if (itemAlreadyInCart) {
      setShowDuplicateMessage(true); // Mostrar el mensaje de duplicado
      // No agregamos el producto al carrito aquí para evitar duplicados
      return;
    }

    // Si no está en el carrito, lo agregamos
    addToCart({
      id: producto.id,
      name: producto.descripcion,
      price: detalleSeleccionado.precioVenta,
      // quantity: 1, // addToCart en useCartStore ya lo establece a 1
      color: detalleSeleccionado.color,
      talle: detalleSeleccionado.talle,
      imageUrl: detalleSeleccionado.imagenes?.[0] || undefined, // Si tienes una imagen para el carrito
    });

    // Resetear el mensaje de duplicado si se añadió exitosamente
    setShowDuplicateMessage(false);

    setAnimateFly(true);
    setTimeout(() => setAnimateFly(false), 1000);
  };

  // Función para navegar al carrito
  const goToCart = useCallback(() => {
    // Asume que tu ruta del carrito es '/carrito'
    navigate('/carrito');
  }, [navigate]);

  // --- Renderizado Condicional ---

  if (loading) return <p className={styles.loadingMessage}>Cargando detalles del producto...</p>;
  if (error)
    return (
      <p className={styles.errorMessage}>
        Ocurrió un error al cargar el producto. Por favor, inténtalo de nuevo más tarde.
      </p>
    );
  if (!producto)
    return <p className={styles.notFoundMessage}>El producto que buscas no fue encontrado.</p>;

  // --- Renderizado Principal del Componente ---

  return (
    <div className={styles.productPageWrapper}>
      <div className={styles.detalle}>
        <div className={styles.imagenes}>
          <div
            ref={miniaturasRef}
            className={styles.miniaturasContainer}
            onWheel={handleMiniaturasWheelScroll}
            onMouseDown={handleMouseDown}
          >
            <div className={styles.miniaturasTrack}>
              {(producto.detalle?.[0]?.imagenes ?? []).map((img, i) => (
                <img
                  key={img + i}
                  src={img}
                  alt={`${producto.descripcion} - Miniatura ${i + 1}`}
                  className={`${styles.miniatura} ${
                    imagenSeleccionada === img ? styles.seleccionada : ""
                  }`}
                  onClick={() => setImagenSeleccionada(img)}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
          {imagenSeleccionada ? (
            <img
              src={imagenSeleccionada}
              alt={producto.descripcion}
              className={styles.imagenPrincipal}
              loading="lazy"
            />
          ) : (
            <div className={styles.noImagePlaceholder}>Imagen no disponible</div>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.productTitle}>{producto.descripcion}</h1>

          {detalleSeleccionado && (
            <>
              <p className={styles.stockInfo}>
                <strong>Stock disponible:</strong> {detalleSeleccionado.stock} unidades
              </p>

              <div className={styles.opcionesGroup}>
                <label htmlFor="color-select" className={styles.optionLabel}>
                  Color:{" "}
                </label>
                <div className={styles.opcionesContainer}>
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      className={`${styles.opcionBtn} ${
                        colorSeleccionado === color ? styles.activa : ""
                      }`}
                      onClick={() => {
                        setColorSeleccionado(color);
                        const newTalles = producto.detalle
                          .filter((d) => d.color === color)
                          .map((d) => d.talle);
                        setTalleSeleccionado((newTalles[0] || null) as IEnumTalle | null);
                      }}
                      type="button"
                      aria-pressed={colorSeleccionado === color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.opcionesGroup}>
                <label htmlFor="talle-select" className={styles.optionLabel}>
                  Talle:{" "}
                </label>
                <div className={styles.opcionesContainer}>
                  {tallesDisponibles.map((talle) => (
                    <button
                      key={talle}
                      className={`${styles.opcionBtn} ${
                        talleSeleccionado === talle ? styles.activa : ""
                      }`}
                      onClick={() => setTalleSeleccionado(talle as IEnumTalle)}
                      type="button"
                      aria-pressed={talleSeleccionado === talle}
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>

              <p className={styles.priceInfo}>
                <strong>Precio:</strong> ${detalleSeleccionado.precioVenta.toFixed(2)}
              </p>
            </>
          )}

          {!detalleSeleccionado && (
            <p className={styles.noDetailMessage}>
              Por favor, selecciona un color y un talle para ver la disponibilidad y el precio.
            </p>
          )}

          <p className={styles.categoryInfo}>
            <strong>Categorías:</strong>{" "}
            {producto.categorias?.map((c) => c.descripcion).join(", ") || "Sin categoría"}
          </p>

          <button
            onClick={handleAddToCart}
            className={`${styles.addToCartButton} ${animateFly ? styles.sendToCart : ""}`}
            disabled={!detalleSeleccionado || (detalleSeleccionado && detalleSeleccionado.stock === 0)}
          >
            Agregar al carrito
            <span className={styles.cartItem}></span>
          </button>

          {/* ⭐ Mensaje de advertencia */}
          {showDuplicateMessage && (
            <div className={styles.duplicateMessage}>
              <p>Este producto con el mismo talle y color ya está en tu carrito.</p>
              <p>¿Quieres agregar más? <strong onClick={goToCart} className={styles.goToCartLink}>Modifica la cantidad desde el carrito.</strong></p>
              <button onClick={() => setShowDuplicateMessage(false)} className={styles.closeMessageButton}>Entendido</button>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Productos relacionados que te pueden interesar</h2>
          <Carousel
            toList={relatedProducts}
            renderItem={(item: Producto) => (
              <ProductoCard key={item.id} producto={item} />
            )}
          />
        </div>
      )}
    </div>
  );
};