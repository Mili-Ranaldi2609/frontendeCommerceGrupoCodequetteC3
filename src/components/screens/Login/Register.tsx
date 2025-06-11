import { useState, useEffect } from "react";
import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";
import { registerUsuario } from "../../../services/ConectionApi";
import * as yup from "yup";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
type FormData = {
  nombre: string;
  apellido: string;
  username: string;
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
  general?: string;
};

const registerSchema = yup.object().shape({
  nombre: yup
    .string()
    .trim()
    .required("El nombre es obligatorio.")
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(50, "El nombre no puede exceder los 50 caracteres."),
  apellido: yup
    .string()
    .trim()
    .required("El apellido es obligatorio.")
    .min(2, "El apellido debe tener al menos 2 caracteres.")
    .max(50, "El apellido no puede exceder los 50 caracteres."),
  username: yup
    .string()
    .trim()
    .email("Por favor, ingresa un email válido.")
    .required("El email es obligatorio."),
  genero: yup
    .string()
    .oneOf(["Hombre", "Mujer", "Otro", ""], "Selecciona un género válido.")
    .required("Debes seleccionar un género."),
  password: yup
    .string()
    .required("La contraseña es obligatoria.")
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .matches(/[a-z]/, "La contraseña debe contener al menos una letra minúscula.")
    .matches(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula.")
    .matches(/\d/, "La contraseña debe contener al menos un número.")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "La contraseña debe contener al menos un símbolo."
    ),
  confirmarPassword: yup
    .string()
    .required("Debes confirmar tu contraseña.")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden."),
});

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
  // Nuevo estado para la visibilidad de las contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const validateField = async () => {
      try {
        await registerSchema.validateAt("confirmarPassword", form);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmarPassword;
          return newErrors;
        });
      } catch (err: any) {
        if (err.name === "ValidationError" && err.path === "confirmarPassword") {
          setErrors((prev) => ({
            ...prev,
            confirmarPassword: err.message,
          }));
        }
      }
    };

    if (form.password || form.confirmarPassword) {
      validateField();
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.confirmarPassword;
        return newErrors;
      });
    }
  }, [form.password, form.confirmarPassword]);
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    try {
      await (yup.reach(registerSchema, name) as yup.AnySchema).validate(value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        setErrors((prev) => ({
          ...prev,
          [name]: err.message,
        }));
      } else {
        // Maneja otros tipos de errores si es necesario
        console.error("Error inesperado en handleChange:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      await registerSchema.validate(form, { abortEarly: false });
      await registerUsuario({
        firstname: form.nombre,
        lastname: form.apellido,
        username: form.username,
        email: form.username,
        password: form.password,
      });

      alert("Registro exitoso. Ahora podés iniciar sesión.");
      navigate("/", { state: { openLoginModal: true } });
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const newErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path as keyof FormErrors] = error.message;
          }
        });
        setErrors(newErrors);
      } else if (err.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          general: "Ya existe un usuario registrado con ese email.",
        }));
      } else {
        console.error("Error al registrar:", err);
        setErrors((prev) => ({
          ...prev,
          general: "No se pudo registrar el usuario. Intenta nuevamente.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  // Funciones para alternar la visibilidad
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const isFormValid =
    Object.keys(errors).length === 0 &&
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.username.trim() !== "" &&
    form.genero !== "" &&
    form.password.trim() !== "" &&
    form.confirmarPassword.trim() !== "";

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Registrate</h2>
      <p className={styles.subtitulo}>
        Registrate y obtené un descuento especial
      </p>

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
              aria-invalid={errors.nombre ? "true" : "false"}
              aria-describedby={errors.nombre ? "nombre-error" : undefined}
            />
            {errors.nombre && (
              <p id="nombre-error" className={styles.errorMessage}>
                {errors.nombre}
              </p>
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
              aria-invalid={errors.apellido ? "true" : "false"}
              aria-describedby={errors.apellido ? "apellido-error" : undefined}
            />
            {errors.apellido && (
              <p id="apellido-error" className={styles.errorMessage}>
                {errors.apellido}
              </p>
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
              aria-invalid={errors.username ? "true" : "false"}
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            {errors.username && (
              <p id="username-error" className={styles.errorMessage}>
                {errors.username}
              </p>
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
              aria-invalid={errors.genero ? "true" : "false"}
              aria-describedby={errors.genero ? "genero-error" : undefined}
            >
              <option value="">-Select-</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.genero && (
              <p id="genero-error" className={styles.errorMessage}>
                {errors.genero}
              </p>
            )}
          </div>

          {/* Campo de Contraseña */}
          <div className={styles.passwordContainer}>

            <div className={styles.passwordInputContainer}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.inputWithIcon}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? styles.inputError : ""}
                />
                <span
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Campo de Confirmar Contraseña */}
            <div className={styles.passwordInputContainerConfirm}> {/* Este también */}
              <label htmlFor="confirmarPassword">Repetí tu contraseña</label>
              <input
                id="confirmarPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmarPassword"
                value={form.confirmarPassword}
                onChange={handleChange}
                className={errors.confirmarPassword ? styles.inputError : ""}
                aria-invalid={errors.confirmarPassword ? "true" : "false"}
                aria-describedby={
                  errors.confirmarPassword ? "confirmarPassword-error" : undefined
                }
              />
              <span
                className={styles.passwordToggle}
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.confirmarPassword && (
                <p id="confirmarPassword-error" className={styles.errorMessage}>
                  {errors.confirmarPassword}
                </p>
              )}
            </div>
          </div>

        </div>

        <button
          type="submit"
          className={styles.boton}
          disabled={isSubmitting || !isFormValid}
        >
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