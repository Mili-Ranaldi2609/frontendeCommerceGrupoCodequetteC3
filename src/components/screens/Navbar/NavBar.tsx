import styles from "./navBar.module.css";
import logo from "../../../assets/logo.png";
import { IoPersonSharp } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { MegaMenu } from "../../ui/MegaMenu/MegaMenu";
import { LoginModal } from "../Login/Login";
import { CartModal } from "../Cart/CartModal";
import { useCartStore } from "../../../store/useCartStore";
import { filterProductos } from '../../../services/ConectionApi';
import type { Producto } from '../../../types/IProduct'; 
import { Link, useNavigate } from "react-router-dom";
export const NavBar = () => {
  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  const frases = [
    "Hasta 12 cuotas sin interés con bancos seleccionados",
    "Envíos gratis en compras mayores a $200.000",
    "Retirá gratis por todas las sucursales del país",
    "Descuentos exclusivos para socios",
  ];
  const [hovered, setHovered] = useState<string | null>(null);
  const [sexoSeleccionado, setSexoSeleccionado] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fraseActual, setFraseActual] = useState(0);
  const [animacion, setAnimacion] = useState("entrada");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const items = useCartStore((state) => state.items);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const [animateBadge, setAnimateBadge] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (cartQuantity > 0) {
      setAnimateBadge(true);
      const timeout = setTimeout(() => setAnimateBadge(false), 300); // duración de la animación
      return () => clearTimeout(timeout);
    }
  }, [cartQuantity]);


  useEffect(() => {
    const intervalo = setInterval(() => {
      setAnimacion("salida"); // empieza animación de salida

      setTimeout(() => {
        // cambia la frase cuando termina la salida
        setFraseActual((prev) => (prev + 1) % frases.length);
        setAnimacion("entrada"); // lanza entrada
      }, 800); // duración de la salida
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const handleNext = () => {
    setFraseActual((prev) => (prev + 1) % frases.length);
  };

  const handlePrev = () => {
    setFraseActual((prev) => (prev - 1 + frases.length) % frases.length);
  };
   const handleSearch = () => {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery === "") {
            navigate('/'); // Si la búsqueda está vacía, simplemente ve a la página principal
            return;
        }
        // Navega a la HomePage, pasando la consulta como un parámetro de URL
        // Por ejemplo: /?search=Nike
        navigate(`/?search=${encodeURIComponent(trimmedQuery)}`);
        setSearchQuery(""); // Limpia el input de búsqueda
    };


  return (
    <>
      <div className={styles.navBarPrincipal}>
        {/* Barra superior */}
        <div className={styles.Principal}>
          ¡Retirá Gratis tu pedido por todas las sucursales! 🎉
        </div>
        <div className={styles.navBarMainContainer}>
          <div className={styles.navBarLeftLinks}>
            <Link to="/">
              <img src={logo} alt="Urban Vibes Logo" className={styles.logo} />
            </Link>
            <p>Suscribite</p>
            <p>Ayuda</p>
          </div>
          <div
            className={styles.menuWrapper}
            onMouseEnter={() => { }}
            onMouseLeave={() => setSexoSeleccionado(null)}
          >
            <div className={styles.navBarCenter}>
              <p onMouseEnter={() => setSexoSeleccionado("MASCULINO")}>Hombre</p>
              <p onMouseEnter={() => setSexoSeleccionado("FEMENINO")}>Mujer</p>
              <p onMouseEnter={() => setSexoSeleccionado("UNISEX_CHILD")}>Niño/a</p>
              <p onMouseEnter={() => setSexoSeleccionado("UNISEX")}>Unisex</p>
            </div>

            {/* MegaMenu: se muestra cuando hay una selección de sexo */}
            <div className={`${styles.megaMenu} ${sexoSeleccionado ? styles.megaMenuVisible : ""}`}>
              {sexoSeleccionado && <MegaMenu sexo={sexoSeleccionado} />}
            </div>
          </div>

          <div className={styles.navBarRight}>
            <div className={styles.searchBox}>
                            {/* ⭐ Input de búsqueda */}
                            <input
                                type="text"
                                placeholder="Buscar"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                            />
                            {/* ⭐ Icono de búsqueda */}
                            <FaSearch className={styles.iconoNav} onClick={handleSearch} />
                        </div>

            <IoPersonSharp
              onClick={() => setShowLoginModal(true)}
              className={styles.iconoNav}
            />

            <LoginModal
              visible={showLoginModal}
              onClose={() => setShowLoginModal(false)}
            />
            <div className={styles.cartIconWrapper}>
              <FaCartShopping
                className={styles.iconoNav}
                onClick={() => setIsCartOpen(true)}
              />
              {cartQuantity > 0 && (
                <span
                  className={`${styles.cartBadge} ${animateBadge ? styles.cartBadgeAnimate : ""}`}
                  onClick={() => setIsCartOpen(true)}
                >
                  {cartQuantity}
                </span>
              )}
            </div>


          </div>
        </div>

        {/* Barra principal */}


      </div>
      {/* Barra inferior promocional */}
      <div className={styles.navBarPromo}>
        <span onClick={handlePrev}>&lt;</span>
        <div className={styles.content}>
          <div
            className={`${styles.promocionTexto} ${animacion === "entrada"
              ? styles.animarEntrada
              : animacion === "salida"
                ? styles.animarSalida
                : ""
              }`}
          >
            <p key={fraseActual}>{frases[fraseActual]}</p>
          </div>

          <div>
            <strong>Ver Promociones</strong></div>
        </div>
        <span onClick={handleNext}>&gt;</span>
      </div>

      <CartModal
        isOpen={isCartOpen}
        items={cartItems}
        total={total}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}  