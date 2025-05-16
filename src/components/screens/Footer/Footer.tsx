// Footer.tsx
import styles from "./footer.module.css";
import { FaFacebookSquare } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { LuMessageCircle } from "react-icons/lu";
import { Register } from "../Login/Register";

// ✅ Agregamos las props al componente
interface FooterProps {
  onEnviosClick: () => void;
  onPagosClick: () => void;
  onContactoClick: () => void;
  onPropositoClick: () => void;
  onPromocionesClick: () => void;
}

export const Footer = ({
  onEnviosClick,
  onPagosClick,
  onContactoClick,
  onPropositoClick,
  onPromocionesClick
}: FooterProps) => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInfoContainer}>
        <div>
          <h4 >REGISTRATE</h4>
        </div>
        <div>
          <h4>AYUDA</h4>
          <p onClick={onEnviosClick}>Envíos y entregas</p>
          <p onClick={onPagosClick}>Opciones de pago</p>
          <p onClick={onContactoClick}>Contacto</p>
        </div>
        <div>
          <h4>ACERCA DE URBAN VIBES</h4>
          <p onClick={onPropositoClick}>Propósito</p>
        </div>
        <div>
          <h4>NOVEDADES</h4>
          <p onClick={onPromocionesClick}>Promociones</p>
        </div>
      </div>

      <div className={styles.footerIcons}>
        <a href="https://api.whatsapp.com/send?phone=5491127996935" target="_blank" rel="noopener noreferrer">
          <LuMessageCircle />
        </a>
        <a href="https://www.facebook.com/nike/" target="_blank" rel="noopener noreferrer">
          <FaFacebookSquare />
        </a>
        <a href="https://www.instagram.com/nike/" target="_blank" rel="noopener noreferrer">
          <IoLogoInstagram />
        </a>
      </div>
    </footer>
  );
};
