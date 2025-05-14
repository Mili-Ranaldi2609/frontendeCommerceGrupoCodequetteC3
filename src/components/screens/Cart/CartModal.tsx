import { useEffect } from "react";
import styles from "./cartModal.module.css";
import { BsCart3 } from "react-icons/bs";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartModalProps {
    isOpen: boolean;
    items: CartItem[];
    total: number;
    onClose: () => void;
}

export const CartModal = ({ isOpen, items, total, onClose }: CartModalProps) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <div className={styles.top}>
                        <b>Mi Compra</b>
                        <button className={styles.closeBtn} onClick={onClose}>X</button>
                    </div>
                    {items.length > 0 ? (
                        <>
                            <div className={styles.products}>
                                {items.map((item) => (
                                    <div key={item.id} className={styles.product}>
                                        <span>{item.name}</span>
                                        <span>{item.quantity} x ${item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.total}>
                                <p>Total: ${total}</p>
                                <button className={styles.checkoutBtn} onClick={() => alert("Ir al carrito de compra")}>Finalizar Compra</button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyCart}>
                            <div className={styles.emptyCartContent}>
                                <BsCart3 />
                                <b>Tu carrito está vacío</b>
                            </div>
                            <div className={styles.categories}>
                                <button onClick={() => alert("Ir a Calzado Hombre")}>Calzado Hombre</button>
                                <button onClick={() => alert("Ir a Calzado Mujer")}>Calzado Mujer</button>
                                <button onClick={() => alert("Ir a Ropa Hombre")}>Ropa Hombre</button>
                                <button onClick={() => alert("Ir a Ropa Mujer")}>Ropa Mujer</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


