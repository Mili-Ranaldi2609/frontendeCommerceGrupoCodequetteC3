import type { FC } from "react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ProductoPage.module.css";
import { useProductoStore } from "../../../store/useProductoStore";
import { useCartStore } from "../../../store/useCartStore";
import { Carousel } from "../../ui/Carousel/Carousel";
import { ProductoCard } from "../../ui/ProductCard/ProductCard";
import type { IEnumTalle } from "../../../types/IEnumTalle";
import type { Producto,} from '../../../types/IProduct';
import type { ICategoria } from '../../../types/ICategoria';
import { useAuth } from '../../../hooks/useAuth';
import { ModalEditarProducto } from '../../ui/Modals/ModalsAdmin/EditProductModal';
import { updateProducto as updateProductoService, getCategorias, getAllProductos } from '../../../services/ConectionApi'; // Import the service function

export const ProductoDetalle: FC = () => {
    const { id } = useParams<{ id: string }>();
    const { addToCart, items: cartItems, doesItemExist } = useCartStore();
    const navigate = useNavigate();
    console.log(cartItems);

    const { isAuthenticated, role: userRole } = useAuth();

    const {
        productoSeleccionado: producto,
        fetchProductoPorId,
        loading,
        error,
        productos: allProducts, // Still useful for related products
        fetchProductos, // Still useful for related products
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

    const productDetailRef = useRef<HTMLDivElement>(null);
    const relatedProductsRef = useRef<HTMLDivElement>(null);
    const [productoEditar, setProductoEditar] = useState<Producto | null>(null); // State to control modal

    // --- NEW: State for categories if we need them for the edit modal directly from service ---
    const [categorias, setCategorias] = useState<ICategoria[]>([]);

    useEffect(() => {
        // Fetch categories when the component mounts, similar to AdminPage
        const loadCategories = async () => {
            try {
                const res = await getCategorias();
                setCategorias(res.data);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            }
        };
        loadCategories();
    }, []);


    useEffect(() => {
        if (id) {
            fetchProductoPorId(Number(id));
            // Reiniciar estados al cargar un nuevo producto o al cambiar el ID de la URL
            setImagenSeleccionada(null);
            setColorSeleccionado(null);
            setTalleSeleccionado(null);
            setShowDuplicateMessage(false);
        }
    }, [id, fetchProductoPorId]);

    useEffect(() => {
        // Fetch all products if not already loaded, needed for related products
        if (allProducts.length === 0 && !loading) {
            fetchProductos();
        }
    }, [allProducts.length, loading, fetchProductos]);

    useEffect(() => {
        if (producto) {
            // Cuando el producto carga o cambia, establece el primer detalle como seleccionado
            const primerDetalle = producto.detalle?.[0];
            if (primerDetalle) {
                setImagenSeleccionada(primerDetalle.imagenes?.[0] || null);
                setColorSeleccionado(primerDetalle.color || null);
                const tallesPrimerColor = producto.detalle
                    .filter(d => d.color === primerDetalle.color)
                    .map(d => d.talle);
                if (!talleSeleccionado || !tallesPrimerColor.includes(talleSeleccionado)) {
                    setTalleSeleccionado((tallesPrimerColor[0] || null) as IEnumTalle | null);
                }
            }
        }
    }, [producto]);

    const coloresDisponibles = useMemo(() => {
        if (!producto?.detalle) return [];
        const uniqueColors = new Map<string, string>();
        producto.detalle.forEach(d => {
            if (d.color && d.imagenes && d.imagenes.length > 0 && !uniqueColors.has(d.color)) {
                uniqueColors.set(d.color, d.imagenes[0]);
            }
        });
        return Array.from(uniqueColors.entries()).map(([color, imagen]) => ({ color, imagen }));
    }, [producto]);

    const tallesDisponibles = useMemo(() => {
        if (!producto?.detalle || !colorSeleccionado) return [];
        return Array.from(
            new Set(producto.detalle.filter((d) => d.color === colorSeleccionado).map((d) => d.talle))
        );
    }, [producto, colorSeleccionado]);

    useEffect(() => {
        if (colorSeleccionado) {
            const tallesParaColorActual = producto?.detalle
                .filter(d => d.color === colorSeleccionado)
                .map(d => d.talle) || [];

            if (!talleSeleccionado || !tallesParaColorActual.includes(talleSeleccionado)) {
                setTalleSeleccionado((tallesParaColorActual[0] || null) as IEnumTalle | null);
            }
        }
        setShowDuplicateMessage(false);
    }, [colorSeleccionado, producto, talleSeleccionado]);

    const detalleSeleccionado = useMemo(() => {
        if (!producto || !colorSeleccionado || !talleSeleccionado) return null;
        return (
            producto.detalle.find(
                (d) => d.color === colorSeleccionado && d.talle === talleSeleccionado
            ) || null
        );
    }, [producto, colorSeleccionado, talleSeleccionado]);

    useEffect(() => {
        if (detalleSeleccionado?.imagenes?.[0] && imagenSeleccionada !== detalleSeleccionado.imagenes[0]) {
            setImagenSeleccionada(detalleSeleccionado.imagenes[0]);
        }
    }, [detalleSeleccionado, imagenSeleccionada]);

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

    const handleAddToCart = () => {
        if (!producto || !detalleSeleccionado) {
            alert("Debes seleccionar un color y un talle válidos.");
            return;
        }

        const itemAlreadyInCart = doesItemExist(
            producto.id,
            detalleSeleccionado.color,
            detalleSeleccionado.talle
        );

        if (itemAlreadyInCart) {
            setShowDuplicateMessage(true);
            return;
        }

        addToCart({
            id: producto.id,
            name: producto.descripcion,
            price: detalleSeleccionado.precioVenta,
            color: detalleSeleccionado.color,
            talle: detalleSeleccionado.talle,
            imageUrl: detalleSeleccionado.imagenes?.[0],
        });

        setShowDuplicateMessage(false);

        setAnimateFly(true);
        setTimeout(() => setAnimateFly(false), 1000);
    };

    const goToCart = useCallback(() => {
        navigate('/carrito');
    }, [navigate]);

    const handleOpenEditModal = useCallback(() => {
        if (producto) {
            setProductoEditar(producto);
        }
    }, [producto]);

    const handleCloseEditModal = useCallback(() => {
        setProductoEditar(null);
    }, []);

    // This function will be called by ModalEditarProducto.
    // It directly calls the `updateProductoService` from your services.
    const updateProduct = useCallback(async (
        productoId: number,
        productoActualizado: Omit<Producto, "id" | "precioOriginal" | "precioFinal"> // Matches expected type
    ) => {
        try {
            await updateProductoService(productoId, productoActualizado); // Call the service function
            // After successful update, re-fetch the product details to update the UI
            if (id) {
                fetchProductoPorId(Number(id)); // Re-fetch current product
                fetchProductos(); // Re-fetch all products if needed for related products
            }
            setProductoEditar(null); // Close the modal
            console.log("Producto actualizado con éxito!");
        } catch (updateError) {
            console.error('Error al actualizar el producto:', updateError);
            alert('Error al actualizar el producto.');
            throw updateError; // Re-throw to allow error handling in the modal if desired
        }
    }, [id, fetchProductoPorId, fetchProductos]); // Dependencies for useCallback

    if (loading) return <p className={styles.loadingMessage}>Cargando detalles del producto...</p>;
    if (error)
        return (
            <p className={styles.errorMessage}>
                Ocurrió un error al cargar el producto. Por favor, inténtalo de nuevo más tarde.
            </p>
        );
    if (!producto)
        return <p className={styles.notFoundMessage}>El producto que buscas no fue encontrado.</p>;

    return (
        <div className={styles.productPageWrapper}>
            <div className={styles.detalle} ref={productDetailRef}>
                <div className={styles.imagenesWrapper}>
                    <div className={styles.imagenes}>
                        <div
                            ref={miniaturasRef}
                            className={styles.miniaturasContainer}
                            onWheel={handleMiniaturasWheelScroll}
                            onMouseDown={handleMouseDown}
                        >
                            <div className={styles.miniaturasTrack}>
                                {(detalleSeleccionado?.imagenes ?? []).map((img, i) => (
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
                </div>
                <div className={styles.info}>
                    <h1 className={styles.productTitle}>{producto.descripcion}</h1>

                    {isAuthenticated && userRole === 'ADMIN' && (
                        <div className={styles.adminControls}>
                            <button
                                onClick={handleOpenEditModal}
                                className={styles.editProductButton}
                            >
                                Editar Producto
                            </button>
                            {detalleSeleccionado && (
                                <p className={styles.stockInfoAdmin}>
                                    <strong>Stock disponible:</strong> {detalleSeleccionado.stock} unidades
                                </p>
                            )}
                        </div>
                    )}

                    <div className={styles.opcionesGroup}>
                        <label htmlFor="color-select" className={styles.optionLabel}>
                            Color:{" "}
                        </label>
                        <div className={styles.opcionesContainer}>
                            {coloresDisponibles.map(({ color, imagen }) => (
                                <img
                                    key={color}
                                    src={imagen}
                                    alt={color}
                                    className={`${styles.colorOptionImage} ${
                                        colorSeleccionado === color ? styles.activa : ""
                                    }`}
                                    onClick={() => setColorSeleccionado(color)}
                                    loading="lazy"
                                />
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
                                    type="button"
                                    className={`${styles.opcionBtn} ${
                                        talleSeleccionado === talle ? styles.activa : ""
                                    }`}
                                    onClick={() => setTalleSeleccionado(talle as IEnumTalle)}
                                    aria-pressed={talleSeleccionado === talle}
                                >
                                    {talle}
                                </button>
                            ))}
                        </div>
                    </div>

                    {detalleSeleccionado ? (
                        <p className={styles.priceInfo}>
                            <strong>Precio:</strong> ${detalleSeleccionado.precioVenta.toFixed(2)}
                        </p>
                    ) : (
                        <p className={styles.noDetailMessage}>
                            Selecciona un color y un talle para ver el precio.
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

                </div>
            </div>
            {showDuplicateMessage && (
                <div className={styles.duplicateMessage}>
                    <p>Este producto con el mismo talle y color ya está en tu carrito.</p>
                    <p>¿Quieres agregar más? <strong onClick={goToCart} className={styles.goToCartLink}>Modifica la cantidad desde el carrito.</strong></p>
                    <button onClick={() => setShowDuplicateMessage(false)} className={styles.closeMessageButton}>Entendido</button>
                </div>
            )}

            {relatedProducts.length > 0 && (
                <div className={styles.relatedSection} ref={relatedProductsRef}>
                    <h2 className={styles.relatedTitle}>Productos relacionados que te pueden interesar</h2>
                    <Carousel
                        toList={relatedProducts}
                        renderItem={(item: Producto) => (
                            <ProductoCard key={item.id} producto={item} />
                        )}
                    />
                </div>
            )}

            {isAuthenticated && userRole === 'ADMIN' && productoEditar && (
                <ModalEditarProducto
                    isOpen={!!productoEditar}
                    onClose={handleCloseEditModal}
                    producto={productoEditar}
                    onEdit={updateProduct}
                    categorias={categorias}
                    onProductoEditado={handleCloseEditModal}
                />
            )}
        </div>
    );
};