import { useState } from "react";
import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";
import { registerUsuario } from "../../../services/ConectionApi";

export const Register = () => {
  const navigate = useNavigate();
  const [passwordMatch, setPasswordMatch] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    username: "",
    genero: "",
    password: "",
    confirmarPassword: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };

    // Si cambia alguna contraseña, actualizamos validación
    if (name === "password" || name === "confirmarPassword") {
      setPasswordMatch(newForm.password === newForm.confirmarPassword);
    }

    setForm(newForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.username)) {
      alert("Por favor, ingresá un email válido.");
      return;
    }

    // Validación de contraseña
    if (form.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Validación de coincidencia
    if (form.password !== form.confirmarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      try {
        await registerUsuario({
          firstname: form.nombre,
          lastname: form.apellido,
          username: form.username,
          email: form.username,
          password: form.password,
        });

        alert("Registro exitoso. Ahora podés iniciar sesión.");
        navigate("/login"); 
      } catch (error: any) {
        if (error.response?.status === 409) {
          alert("Ya existe un usuario registrado con ese email.");
        } else {
          console.error("Error al registrar:", error);
          alert("No se pudo registrar el usuario.");
        }
      }

    } catch (error: any) {
      if (error.response?.status === 409) {
        alert("Ya existe un usuario registrado con ese email.");
      } else {
        console.error("Error al registrar:", error);
        alert("No se pudo registrar el usuario.");
      }
    }
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Registrate</h2>
      <p className={styles.subtitulo}>Registrate y obtené un descuento especial</p>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.grid}>
          <div>
            <label>Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div>
            <label>Apellido</label>
            <input type="text" name="apellido" value={form.apellido} onChange={handleChange} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="username" value={form.username} onChange={handleChange} required />
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
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <label>Repetí tu contraseña</label>
            <input type="password" name="confirmarPassword" value={form.confirmarPassword} onChange={handleChange} required />
          </div>
          {form.confirmarPassword && !passwordMatch && (
            <p style={{ color: 'red', marginTop: '5px' }}>Las contraseñas no coinciden</p>
          )}

        </div>


        <button type="submit" className={styles.boton}>
          Enviar
        </button>
      </form>
    </div>
  );
};
