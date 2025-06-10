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

type FormErrors = {
  nombre?: string;
  apellido?: string;
  username?: string;
  genero?: string;
  password?: string;
  confirmarPassword?: string;
  general?: string; // For general form errors
};

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    nombre: "",
    apellido: "",
    username: "",
    genero: "",
    password: "",
    confirmarPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to validate password match in real-time
  useEffect(() => {
    if (form.password && form.confirmarPassword) {
      if (form.password !== form.confirmarPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmarPassword: "Las contraseñas no coinciden.",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmarPassword;
          return newErrors;
        });
      }
    } else {
      // Clear error if one of the password fields is empty
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.confirmarPassword;
        return newErrors;
      });
    }
  }, [form.password, form.confirmarPassword]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for the current field as the user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const validateForm = (formData: FormData) => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    }
    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio.";
    }
    if (!formData.username.trim()) {
      newErrors.username = "El email es obligatorio.";
    } else if (!emailRegex.test(formData.username)) {
      newErrors.username = "Por favor, ingresá un email válido.";
    }
    if (!formData.genero) {
      newErrors.genero = "Debes seleccionar un género.";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    if (!formData.confirmarPassword) {
      newErrors.confirmarPassword = "Debes confirmar tu contraseña.";
    } else if (formData.password !== formData.confirmarPassword) {
      newErrors.confirmarPassword = "Las contraseñas no coinciden.";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return; // Stop submission if there are errors
    }

    try {
      await registerUsuario({
        firstname: form.nombre,
        lastname: form.apellido,
        username: form.username,
        email: form.username,
        password: form.password,
      });

      alert("Registro exitoso. Ahora podés iniciar sesión.");
      navigate("/", { state: { openLoginModal: true } });
    } catch (error: any) {
      setIsSubmitting(false);
      if (error.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          general: "Ya existe un usuario registrado con ese email.",
        }));
      } else {
        console.error("Error al registrar:", error);
        setErrors((prev) => ({
          ...prev,
          general: "No se pudo registrar el usuario. Intentá nuevamente.",
        }));
      }
    }
  };

  // Determine if the form is valid for submission (all fields meet basic criteria, passwords match)
  const isFormValid = Object.keys(errors).length === 0 &&
                      form.nombre.trim() !== "" &&
                      form.apellido.trim() !== "" &&
                      form.username.trim() !== "" &&
                      form.genero !== "" &&
                      form.password.length >= 6 &&
                      form.password === form.confirmarPassword;

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Registrate</h2>
      <p className={styles.subtitulo}>Registrate y obtené un descuento especial</p>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.grid}>
          <div>
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className={errors.nombre ? styles.inputError : ""}
              required
            />
            {errors.nombre && (
              <p className={styles.errorMessage}>{errors.nombre}</p>
            )}
          </div>
          <div>
            <label htmlFor="apellido">Apellido</label>
            <input
              id="apellido"
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              className={errors.apellido ? styles.inputError : ""}
              required
            />
            {errors.apellido && (
              <p className={styles.errorMessage}>{errors.apellido}</p>
            )}
          </div>
          <div>
            <label htmlFor="username">Email</label>
            <input
              id="username"
              type="email"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={errors.username ? styles.inputError : ""}
              required
            />
            {errors.username && (
              <p className={styles.errorMessage}>{errors.username}</p>
            )}
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
              className={errors.genero ? styles.inputError : ""}
              required
            >
              <option value="">-Select-</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.genero && (
              <p className={styles.errorMessage}>{errors.genero}</p>
            )}
          </div>
          <div>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? styles.inputError : ""}
              required
            />
            {errors.password && (
              <p className={styles.errorMessage}>{errors.password}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmarPassword">Repetí tu contraseña</label>
            <input
              id="confirmarPassword"
              type="password"
              name="confirmarPassword"
              value={form.confirmarPassword}
              onChange={handleChange}
              className={errors.confirmarPassword ? styles.inputError : ""}
              required
            />
            {errors.confirmarPassword && (
              <p className={styles.errorMessage}>{errors.confirmarPassword}</p>
            )}
          </div>
          {errors.general && (
            <p className={styles.errorMessage} style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              {errors.general}
            </p>
          )}
        </div>

        <button type="submit" className={styles.boton} disabled={isSubmitting || !isFormValid}>
          {isSubmitting ? "Registrando..." : "Enviar"}
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