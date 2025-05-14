import { useState } from "react";
import styles from "./cartPage.module.css";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartPageProps {
  items: CartItem[];
}

export const CartPage = ({ items }: CartPageProps) => {
  const getSubtotal = (item: CartItem) => item.price * item.quantity;
  const subtotal = items.reduce((acc, item) => acc + getSubtotal(item), 0);
  const total = subtotal; // Aquí puedes agregar costos adicionales como impuestos si es necesario

  return (
    <div className={styles.cartPage}>
      {items.length > 0 ? (
        <>
          <div className={styles.cartItems}>
            <h2>Productos en el Carrito</h2>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div>{item.name}</div>
                <div>${item.price}</div>
                <div>{item.quantity}</div>
                <div>${getSubtotal(item)}</div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h2>Resumen de Compra</h2>
            <div className={styles.summaryItem}>
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total</span>
              <span>${total}</span>
            </div>
            <div className={styles.buttons}>
              <button className={styles.payBtn} onClick={() => alert("Iniciar pago")}>Iniciar Pago</button>
              <button className={styles.continueShoppingBtn} onClick={() => alert("Seguir comprando")}>Seguir Comprando</button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyCartPage}>
          <p>Tu carrito está vacío</p>
          <div className={styles.categories}>
            <button onClick={() => alert("Ir a Calzado Hombre")}>Calzado Hombre</button>
            <button onClick={() => alert("Ir a Calzado Mujer")}>Calzado Mujer</button>
            <button onClick={() => alert("Ir a Ropa Hombre y Mujer")}>Ropa Hombre y Mujer</button>
          </div>
        </div>
      )}
    </div>
  );
};
