import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const LoginModal = ({ visible, onClose }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  if (!visible) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando sesión con", email, password);
    // Aquí iría tu lógica de autenticación
    onClose();
  };

  const irARegistro = () => {
    onClose(); // cerramos el modal primero
    navigate("/register");
  };

  return (
    <div className={styles.overlay}>
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
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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

