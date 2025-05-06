import styles from "./navBar.module.css";
import logo from "../../../assets/logo.png";
import { IoPersonSharp } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";

export const NavBar = () => {
  const frases = [
    "Hasta 12 cuotas sin interés con bancos seleccionados",
    "Envíos gratis en compras mayores a $200.000",
    "Retirá gratis por todas las sucursales del país",
    "Descuentos exclusivos para socios",
  ];

  const [fraseActual, setFraseActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFraseActual((prev) => (prev + 1) % frases.length);
    }, 4000); // cambia cada 4 segundos
    return () => clearInterval(intervalo);
  }, []);

  // ✅ FUNCIONES PARA LAS FLECHAS
  const handleNext = () => {
    setFraseActual((prev) => (prev + 1) % frases.length);
  };

  const handlePrev = () => {
    setFraseActual((prev) => (prev - 1 + frases.length) % frases.length);
  };

  return (
    <>
      {/* Barra superior */}
      <div className={styles.navBarPrincipal}>
        ¡Retirá Gratis tu pedido por todas las sucursales! 🎉
      </div>

      {/* Barra principal */}
      <div className={styles.navBarMainContainer}>
        <div className={styles.navBarLeftLinks}>
          <p>Suscribite</p>
          <p>Ayuda</p>
        </div>

        <div className={styles.navBarCenter}>
          <p className={styles.active}>Destacados</p>
          <p>Hombre</p>
          <p>Mujer</p>
          <p>Niño/a</p>
          <p>Oportunidades</p>
        </div>

        <div className={styles.navBarRight}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input type="text" placeholder="Buscar" />
          </div>
          <IoPersonSharp />
          <FaCartShopping />
        </div>
      </div>

      {/* Barra inferior promocional */}
      <div className={styles.navBarPromo}>
        <span onClick={handlePrev}>&lt;</span>
        <p>
          {frases[fraseActual]}<br />
          <strong>Ver Promociones</strong>
        </p>
        <span onClick={handleNext}>&gt;</span>
      </div>
    </>
  );
};
