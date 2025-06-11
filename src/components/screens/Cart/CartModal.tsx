import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BsCart3 } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useCartStore } from "../../../store/useCartStore";
import styles from "./CartModal.module.css";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    color: string;
    talle: string;
    imageUrl?: string;
}

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
    const { items, total, increaseQuantity, decreaseQuantity, removeFromCart } = useCartStore();

    // Define the free shipping threshold
    const FREE_SHIPPING_THRESHOLD = 200000;
    const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - total;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const renderCartItem = (item: CartItem) => (
        <div key={`${item.id}-${item.color}-${item.talle}`} className={styles.product}>
            <img
                src={item.imageUrl || "https://via.placeholder.com/50x50?text=Item"}
                alt={item.name}
                className={styles.productImage}
            />
            <div className={styles.productDetails}>
                <span className={styles.productName}>{item.name}</span>
                {item.color && item.talle && (
                    <span className={styles.productOptions}>
                        Color: {item.color}, Talle: {item.talle}
                    </span>
                )}
                <div className={styles.quantityControls}>
                    <button
                        onClick={() => decreaseQuantity(item.id, item.color, item.talle)}
                        disabled={item.quantity <= 1}
                        className={styles.quantityButton}
                        aria-label="Disminuir cantidad"
                    >
                        -
                    </button>
                    <span className={styles.productQuantity}>{item.quantity}</span>
                    <button
                        onClick={() => increaseQuantity(item.id, item.color, item.talle)}
                        className={styles.quantityButton}
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>
                </div>
                <span className={styles.productPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                    onClick={() => removeFromCart(item.id, item.color, item.talle)}
                    className={styles.removeButton}
                    aria-label={`Eliminar ${item.name} del carrito`}
                >
                    <RiDeleteBin6Line />
                </button>
            </div>
        </div>
    );

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <div className={styles.top}>
                        <b>Mi Compra</b>
                        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">X</button>
                    </div>

                    <div className={styles.progressBarContainer}>
                        <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                        <div className={styles.circulito} style={{ left: `${progress}%` }}></div>
                    </div>
                    <p className={styles.shippingMessage}>
                        {total >= FREE_SHIPPING_THRESHOLD ? (
                            <span className={styles.freeShipping}>¡Tenes envío gratis! </span>
                        ) : (
                            <span>Faltan **${remainingForFreeShipping.toFixed(2)}** para envío gratis</span>
                        )}
                    </p>

                    {items.length > 0 ? (
                        <>
                            <div className={styles.products}>
                                {items.map(renderCartItem)}
                            </div>
                            <div className={styles.total}>
                                <p>Total: ${total.toFixed(2)}</p>
                                <Link to="/cart" onClick={onClose}>
                                    <button className={styles.checkoutBtn}>Finalizar Compra</button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyCart}>
                            <div className={styles.emptyCartContent}>
                                <BsCart3 size={48} />
                                <b>Tu carrito está vacío</b>
                            </div>
                            <div className={styles.categories}>
                                {["Calzado Hombre", "Calzado Mujer", "Ropa Hombre", "Ropa Mujer"].map((cat) => (
                                    <button key={cat} onClick={() => alert(`Ir a ${cat}`)}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};