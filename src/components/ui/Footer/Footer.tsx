// Footer.tsx
import { FaWhatsapp } from "react-icons/fa6";
import styles from "./footer.module.css";
import { FaFacebookSquare } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { LuMessageCircle } from "react-icons/lu";
import { Link } from "react-router-dom";

// ✅ Props
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
          <Link to="/register" >
            <h4 style={{ cursor: "pointer" }}>REGISTRATE</h4>
          </Link>
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
                <ul className={styles.wrapper}>
                    {/* Ícono de Facebook */}
                    <li className={`${styles.icon} ${styles.facebook}`}>
                        <span className={styles.tooltip}>Facebook</span>
                        <a href="https://www.facebook.com/nike/" target="_blank" rel="noopener noreferrer" aria-label="Visita nuestro Facebook">
                            <FaFacebookSquare />
                        </a>
                    </li>

                    {/* Ícono de WhatsApp */}
                    <li className={`${styles.icon} ${styles.whatsapp}`}> 
                        <span className={styles.tooltip}>WhatsApp</span>
                        <a href="https://api.whatsapp.com/send?phone=5491127996935" target="_blank" rel="noopener noreferrer" aria-label="Envíanos un mensaje por WhatsApp">
                            <FaWhatsapp /> {/* Usa el componente de React Icon para WhatsApp */}
                        </a>
                    </li>

                    {/* Ícono de Instagram */}
                    <li className={`${styles.icon} ${styles.instagram}`}>
                        <span className={styles.tooltip}>Instagram</span>
                        <a href="https://www.instagram.com/nike/" target="_blank" rel="noopener noreferrer" aria-label="Visita nuestro Instagram">
                            <IoLogoInstagram />
                        </a>
                    </li>
                </ul>
            </div>
    </footer>
  );
};
