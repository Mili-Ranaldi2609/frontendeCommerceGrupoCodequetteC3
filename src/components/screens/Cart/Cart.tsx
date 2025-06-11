import { useState, useEffect } from "react";
import styles from "./Cart.module.css";
import { useCartStore } from "../../../store/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { FaTruck } from "react-icons/fa6";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { getUserAddresses, type DireccionResponseFrontend } from "../../../services/ConectionApi";
const MERCADOPAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
if (MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(MERCADOPAGO_PUBLIC_KEY, {
    locale: 'es-AR',
  });
} else {
  console.error("MERCADOPAGO_PUBLIC_KEY no está definida. La integración de Mercado Pago no funcionará.");
}
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string; // Asegúrate de que esto siempre sea un string
  color: string;
  talle: string;
  category:string
}

export const CartPage = () => {
  const { items, increaseQuantity, decreaseQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [postalCode, setPostalCode] = useState<string>("");
  const [shippingCost, setShippingCost] = useState<number>(4500); // Default shipping cost
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false); 
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const getSubtotal = (item: CartItem) => item.price * item.quantity;
  const subtotal = items.reduce((acc, item) => acc + getSubtotal(item), 0);

  const total = subtotal + shippingCost;

  const calculateShipping = (cp: string) => {
    setShippingError(null);

    if (items.length === 0) {
      setShippingCost(0);
      return;
    }

    if (!cp || cp.length < 4) {
      setShippingCost(4500);
      setShippingError("Ingrese un código postal válido (mínimo 4 caracteres).");
      return;
    }

    let cost = 0;
    const firstChar = cp.charAt(0).toUpperCase();

    switch (firstChar) {
      case "A": // Salta
        cost = 6000;
        break;
      case "B": // Buenos Aires (provincia)
        cost = 4000;
        break;
      case "C": // CABA (Ciudad Autónoma de Buenos Aires)
        cost = 3500;
        break;
      case "D": // San Luis
        cost = 5000;
        break;
      case "E": // Entre Ríos
        cost = 4800;
        break;
      case "F": // La Rioja
        cost = 5500;
        break;
      case "G": // Santiago del Estero
        cost = 5800;
        break;
      case "H": // Chaco
        cost = 6200;
        break;
      case "J": // San Juan
        cost = 5200;
        break;
      case "K": // Catamarca
        cost = 5700;
        break;
      case "L": // La Pampa
        cost = 4900;
        break;
      case "M": // Mendoza
        cost = 0; // Mendoza tiene envío gratis en este ejemplo
        break;
      case "N": // Misiones
        cost = 6500;
        break;
      case "P": // Formosa
        cost = 6300;
        break;
      case "Q": // Neuquén
        cost = 7000;
        break;
      case "R": // Río Negro
        cost = 7200;
        break;
      case "S": // Santa Fe
        cost = 4500;
        break;
      case "T": // Tucumán
        cost = 5900;
        break;
      case "U": // Chubut
        cost = 7500;
        break;
      case "V": // Tierra del Fuego
        cost = 8000;
        break;
      case "W": // Corrientes
        cost = 5500;
        break;
      case "X": // Córdoba
        cost = 4200;
        break;
      case "Y": // Jujuy
        cost = 6100;
        break;
      case "Z": // Santa Cruz
        cost = 7800;
        break;
      default:
        cost = 6000;
        setShippingError("Código postal no reconocido, se aplica tarifa estándar.");
        break;
    }

    if (subtotal >= 200000) {
      cost = 0;
      setShippingError(null);
    }

    setShippingCost(cost);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      calculateShipping(postalCode);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [postalCode, items]);
  const handleInitiatePayment = async () => {
    if (items.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    if (!postalCode || shippingError) {
      alert("Por favor, ingresa un código postal válido antes de continuar.");
      return;
    }

    setIsLoadingPayment(true);
    setPaymentError(null);

    try {
      const response = await getUserAddresses();
      const userAddresses: DireccionResponseFrontend[] = response.data; 

      if (!userAddresses || userAddresses.length === 0) {
        alert('Para continuar con el pago, necesitas tener al menos una dirección registrada. Serás redirigido a tu perfil para agregarla.');
        navigate('/profile/ubicaciones'); 
        return; 
      }

      alert('Tienes direcciones registradas. Ahora puedes seleccionar una dirección de envío para proceder al pago.');
      navigate('/checkout/select-address'); 

    } catch (error: any) {
      console.error("Error al verificar direcciones o iniciar pago:", error);
      setPaymentError(error.message || "No se pudo iniciar el proceso de pago. Intenta de nuevo.");
    } finally {
      setIsLoadingPayment(false);
    }
  };
  return (
    <div className={styles.cartPage}>
      {items.length > 0 ? (
        <>
          <div className={styles.cartItems}>
            <h2>Productos en el Carrito</h2>
            {items.map((item) => (
              <div key={`${item.id}-${item.color}-${item.talle}`} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemVariant}>
                    <span>Color: {item.color}</span>
                    <span>Talle: {item.talle}</span>
                  </div>
                  <div className={styles.itemPrice}>${item.price.toFixed(2)}</div>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button onClick={() => decreaseQuantity(item.id, item.color, item.talle)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id, item.color, item.talle)}>+</button>
                  </div>
                  <div className={styles.itemSubtotal}>${getSubtotal(item).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h2>Resumen de Compra</h2>

            <div className={styles.shippingSection}>
              <label htmlFor="postalCodeInput">Ingrese su código Postal:</label>
              <input
                id="postalCodeInput"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                placeholder="Ej: B1640AAA"
                className={styles.postalCodeInput}
              />
              {shippingError && <p className={styles.shippingError}>{shippingError}</p>}
              <div className={styles.summaryItemEnvio}>
                <span>Costo de Envío <FaTruck /></span>
                <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "Gratis"}</span>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className={styles.buttons}>
              {/* Animated Pay Button */}
              <div className={styles.animatedButtonContainer} onClick={handleInitiatePayment}>
                <div className={styles.leftSide}>
                  <div className={styles.card}>
                    <div className={styles.cardLine}></div>
                    <div className={styles.cardButtons}></div> {/* Renamed from 'buttons' to avoid conflict */}
                  </div>
                  <div className={styles.post}>
                    <div className={styles.postLine}></div>
                    <div className={styles.screen}>
                      <div className={styles.dollar}>$</div>
                    </div>
                    <div className={styles.numbers}></div>
                    <div className={styles.numbersLine2}></div>
                  </div>
                </div>
                <div className={styles.rightSideButton}> {/* Renamed from 'right-side' to avoid conflict */}
                  <div className={styles.newTransactionText}>Iniciar pago</div> {/* Renamed from 'new' */}
                  <svg
                    viewBox="0 0 451.846 451.847"
                    height="20" /* Reduced size for better fit */
                    width="20" /* Reduced size for better fit */
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.arrow}
                  >
                    <path
                      fill="#cfcfcf"
                      d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"
                    />
                  </svg>
                </div>
              </div>

              <Link to="/catalogo">
                <button className={styles.continueShoppingBtn}>Seguir Comprando</button>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyCartPage}>
          <p>Tu carrito está vacío</p>
          <div className={styles.categories}>
            <Link to="/catalogo/hombre/calzado"><button>Calzado Hombre</button></Link>
            <Link to="/catalogo/mujer/calzado"><button>Calzado Mujer</button></Link>
            <Link to="/catalogo/unisex/ropa"><button>Ropa Hombre y Mujer</button></Link>
          </div>
        </div>
      )}
    </div>
  );
};