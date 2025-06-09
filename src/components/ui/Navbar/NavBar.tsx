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
                            <Link to="/admin" className={styles.adminButton}>
                                <p>Panel</p> {/* O "Productos", si prefieres */}
                            </Link>
                        ) : (
                            <p>Suscribite</p>
                        )}
                        {isAuthenticated && userRole === 'ADMIN' ? (
                            <Link to="/admin/users" className={styles.adminButton}>
                                <p>Usuarios</p>
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