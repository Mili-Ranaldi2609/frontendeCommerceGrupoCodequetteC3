import styles from "./navBar.module.css";
import logo from "../../../assets/logo.png";
import { IoPersonSharp } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { MegaMenu } from "../MegaMenu/MegaMenu";
import { CartModal } from "../../screens/Cart/CartModal";
import { useCartStore } from "../../../store/useCartStore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../../hooks/useAuth';
import { LoginModal } from "../../screens/Login/Login";
export const NavBar = () => {

    const frases = [
        "Hasta 12 cuotas sin interés con bancos seleccionados",
        "Envíos gratis en compras mayores a $200.000",
        "Retirá gratis por todas las sucursales del país",
        "Descuentos exclusivos para socios",
    ];

    const [sexoSeleccionado, setSexoSeleccionado] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [fraseActual, setFraseActual] = useState(0);
    const [animacion, setAnimacion] = useState("entrada");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const items = useCartStore((state) => state.items);
    const cartQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const [animateBadge, setAnimateBadge] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { isAuthenticated, role: userRole } = useAuth();

    useEffect(() => {
        if (cartQuantity > 0) {
            setAnimateBadge(true);
            const timeout = setTimeout(() => setAnimateBadge(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [cartQuantity]);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setAnimacion("salida");

            setTimeout(() => {

                setFraseActual((prev) => (prev + 1) % frases.length);
                setAnimacion("entrada");
            }, 800);
        }, 5000);

        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {

        if (location.state && (location.state as any).openLoginModal) {
            setShowLoginModal(true);
        }
    }, [location.state, navigate, location.pathname]);

    const handleNext = () => {
        setFraseActual((prev) => (prev + 1) % frases.length);
    };

    const handlePrev = () => {
        setFraseActual((prev) => (prev - 1 + frases.length) % frases.length);
    };

    const handleSearch = () => {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery === "") {
            navigate('/');
            return;
        }
        navigate(`/?search=${encodeURIComponent(trimmedQuery)}`);
        setSearchQuery("");
    };
    const handleUserIconClick = () => {
        if (isAuthenticated) {
            navigate('/profile');
        } else {
            setShowLoginModal(true);
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
                            <div className={styles.hamburgerWrapper}>
                                <label className={styles.hamburger}>
                                    <input
                                        type="checkbox"
                                        checked={menuOpen}
                                        onChange={() => setMenuOpen(!menuOpen)}
                                    />
                                    <svg viewBox="0 0 32 32">
                                        <path className={`${styles.line} ${styles.lineTopBottom}`} d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
                                        <path className={styles.line} d="M7 16 27 16"></path>
                                    </svg>
                                </label>
                                {menuOpen && (
                                    <div className={styles.dropdownMenu}>
                                        <ul className={styles.list}>
                                            <li className={styles.element}>
                                                <Link to="/admin">
                                                    <span>Panel</span>
                                                </Link>
                                            </li>
                                            <li className={styles.element}>
                                                <Link to="/admin/users">
                                                    <span>Usuarios</span>
                                                </Link>
                                            </li>
                                            <li className={styles.element}>
                                                <Link to="/catalogo">
                                                    <span>Catálogo</span>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                )}

                            </div>

                        ) : (
                            <div>
                                <p>Suscribite</p>
                                <p>Ayuda</p>
                            </div>
                        )}
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