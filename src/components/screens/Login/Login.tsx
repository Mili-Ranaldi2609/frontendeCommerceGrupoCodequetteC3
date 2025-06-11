import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { loginUsuario } from "../../../services/ConectionApi";
import { FaEye, FaEyeSlash } from 'react-icons/fa';


type Props = {
  visible: boolean;
  onClose: () => void;
};

export const LoginModal = ({ visible, onClose }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  if (!visible) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUsuario(email, password);
      const { token, role, username, email: userEmail } = response.data;

      // Guardar en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem(
        "usuario",
        JSON.stringify({ username, email: userEmail, role })
      );

      // Redirección por rol
      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }

      onClose();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Credenciales inválidas");
    }
  };

  const irARegistro = () => {
    onClose();
    navigate("/register");
  };
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className={styles.passwordInputContainer}> {/* Nuevo contenedor para el input y el ojo */}
            <input
              type={showPassword ? "text" : "password"} // Alterna el tipo
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className={styles.passwordToggle}
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Renderiza el ícono */}
            </span>
          </div>
          <button type="submit">Ingresar</button>
        </form>

        <p className={styles.registro}>
          ¿No tienes cuenta?{" "}
          <span className={styles.link} onClick={irARegistro}>
            Regístrate aquí
          </span>
        </p>

        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};