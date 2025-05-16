import { useState } from "react";
import styles from "./Register.module.css";

export const Register = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    genero: "",
    password: "",
    confirmarPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registrando usuario:", form);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Registrate</h2>
      <p className={styles.subtitulo}>Registrate y obtene un descuento especial</p>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.grid}>
          <div >
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Apellido</label>
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className={styles.labelGenero}>Género</label>
            <select name="genero" value={form.genero} onChange={handleChange} required>
              <option value="">-Select-</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Ingrese nuevamente la contraseña</label>
            <input
              type="password"
              name="confirmarPassword"
              value={form.confirmarPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.boton}>
          Enviar
        </button>
      </form>
    </div>
  );
};

