// Register.tsx

import { useState, useEffect } from "react";
import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";
import { registerUsuario } from "../../../services/ConectionApi";

type FormData = {
  nombre: string;
  apellido: string;
  username: string; // Esto es el email
  genero: string;
  password: string;
  confirmarPassword: string;
};

export const Register = () => {
  const navigate = useNavigate();
  const [passwordMatch, setPasswordMatch] = useState(true);

  const [form, setForm] = useState<FormData>({
    nombre: "",
    apellido: "",
    username: "",
    genero: "",
    password: "",
    confirmarPassword: "",
  });

  useEffect(() => {
    setPasswordMatch(form.password === form.confirmarPassword);
  }, [form.password, form.confirmarPassword]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.username)) {
      alert("Por favor, ingresá un email válido.");
      return;
    }

    if (form.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!passwordMatch) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      await registerUsuario({
        firstname: form.nombre,
        lastname: form.apellido,
        username: form.username, // Se usa como username en el backend
        email: form.username,     // También como email en el backend
        password: form.password,
      });

      alert("Registro exitoso. Ahora podés iniciar sesión.");
      // ✨ CAMBIO AQUÍ: Navega a la página principal y pasa un estado
      navigate("/", { state: { openLoginModal: true } }); // Pasa un objeto de estado

    } catch (error: any) {
      if (error.response?.status === 409) {
        alert("Ya existe un usuario registrado con ese email.");
      } else {
        console.error("Error al registrar:", error);
        alert("No se pudo registrar el usuario. Intentá nuevamente.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Registrate</h2>
      <p className={styles.subtitulo}>Registrate y obtené un descuento especial</p>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.grid}>
          {/* ... Tus campos de formulario ... */}
          <div>
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="apellido">Apellido</label>
            <input
              id="apellido"
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="username">Email</label>
            <input
              id="username"
              type="email" // Asegúrate de que sea type="email" para validación básica del navegador
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="genero" className={styles.labelGenero}>
              Género
            </label>
            <select
              id="genero"
              name="genero"
              value={form.genero}
              onChange={handleChange}
              required
            >
              <option value="">-Select-</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmarPassword">Repetí tu contraseña</label>
            <input
              id="confirmarPassword"
              type="password"
              name="confirmarPassword"
              value={form.confirmarPassword}
              onChange={handleChange}
              required
            />
          </div>
          {!passwordMatch && form.confirmarPassword && (
            <p style={{ color: "red", marginTop: "5px" }}>
              Las contraseñas no coinciden
            </p>
          )}
        </div>

        <button type="submit" className={styles.boton}>
          Enviar
          {/* ... SVG de estrellas ... */}
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className={styles[`star-${n}`]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 784.11 815.53"
                style={{
                  shapeRendering: "geometricPrecision",
                  textRendering: "geometricPrecision",
                  imageRendering: "auto",
                  fillRule: "evenodd",
                  clipRule: "evenodd",
                }}
              >
                <g id="Layer_x0020_1">
                  <path
                    className={styles.fil0}
                    d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
                  />
                </g>
              </svg>
            </div>
          ))}
        </button>
      </form>
    </div>
  );
};