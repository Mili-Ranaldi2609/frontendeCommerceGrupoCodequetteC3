import styles from "./footer.module.css";
import { FaFacebookSquare } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { LuMessageCircle } from "react-icons/lu";

export const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInfoContainer}>
        <div>
          <h4>SUMATE A LA COMUNIDAD</h4>
        </div>
        <div>
          <h4>AYUDA</h4>
          <p>Envíos y entregas</p>
          <p>Opciones de pago</p>
          <p>Contacto</p>
        </div>
        <div>
          <h4>ACERCA DE URBAN VIBES</h4>
          <p>Propósito</p>
        </div>
        <div>
          <h4>NOVEDADES</h4>
          <p>Promociones</p>
        </div>
      </div>
      <div className={styles.footerIcons}>
        <LuMessageCircle />
        <FaFacebookSquare />
        <IoLogoInstagram />
      </div>
    </footer>
  );
};
