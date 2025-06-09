// NavBar.tsx

import styles from "./navBar.module.css";
import logo from "../../../assets/logo.png";
import { IoPersonSharp } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { MegaMenu } from "../MegaMenu/MegaMenu";
import { CartModal } from "../../screens/Cart/CartModal";
import { useCartStore } from "../../../store/useCartStore";
// ✨ IMPORTA useLocation aquí
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../../hooks/useAuth';
import { LoginModal } from "../../screens/Login/Login"; // Asegúrate de que la ruta sea correcta aquí

export const NavBar = () => {
    // Define CartItem interface si no está globalmente accesible
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
    const [showLoginModal, setShowLoginModal] = useState(false); // Estado para controlar la visibilidad del modal de login
    const [isCartOpen, setIsCartOpen] = useState(false);

    const items = useCartStore((state) => state.items);
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cartQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const [animateBadge, setAnimateBadge] = useState(false);
    const navigate = useNavigate();
    // ✨ Usa el hook useLocation aquí
    const location = useLocation();

    const { isAuthenticated, role: userRole } = useAuth();

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

    // ✨ NUEVO useEffect para manejar el estado de la navegación
    useEffect(() => {
        // Comprueba si hay un estado de navegación y si openLoginModal es true
        if (location.state && (location.state as any).openLoginModal) {
            setShowLoginModal(true); // Esto abre el modal

            // OPCIONAL: Limpia el estado para que el modal no se abra en futuras recargas o navegaciones.
            // Si no quieres que el modal se abra cada vez que el usuario navegue o recargue la página
            // (si el estado persiste en la URL), entonces descomenta la siguiente línea.
            // navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]); // Dependencias: location.state (para detectar cambios), navigate (para limpiar el estado), location.pathname (para la URL actual)


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
        navigate(`/?search=${encodeURIComponent(trimmedQuery)}`);
        setSearchQuery(""); // Limpia el input de búsqueda
    };

    // Función para manejar el clic en el icono de persona
    const handleUserIconClick = () => {
        if (isAuthenticated) {
            if (userRole === 'ADMIN') { // Asegúrate de que userRole esté bien definido y sea 'ADMIN'
                navigate('/admin');
            } else {
                navigate('/profile'); // Redirige a la página de perfil del usuario
            }
        } else {
            setShowLoginModal(true); // Cambia el estado para mostrar el modal
        }
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
                        {/* Lógica del botón dinámico */}
                        {isAuthenticated && userRole === 'ADMIN' ? (
                            <Link to="/admin" className={styles.adminButton}>
                                <p>Panel</p> {/* O "Productos", si prefieres */}
                            </Link>
                        ) : (
                            <p>Suscribite</p>
                        )}
                        {isAuthenticated && userRole === 'ADMIN' ? (
                            <Link to="/admin/users" className={styles.adminButton}>
                                <p>Usuarios</p> {/* O "Productos", si prefieres */}
                            </Link>
                        ) : (
                            <p>Ayuda</p>
                        )}
                    </div>
                    <div
                        className={styles.menuWrapper}
                        onMouseEnter={() => {}}
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
                            <FaSearch className={styles.iconoNav} onClick={handleSearch} />
                        </div>

                        <IoPersonSharp
                            onClick={handleUserIconClick}
                            className={styles.iconoNav}
                        />

                        {/* El LoginModal se renderiza condicionalmente basado en `showLoginModal` */}
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
                onClose={() => setIsCartOpen(false)}
            />
        </>
    );
};