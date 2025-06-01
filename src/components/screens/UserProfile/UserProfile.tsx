import { useState } from "react";
import styles from "./UserProfile.module.css";
import { EditUserModal } from "./EditUserModal";

const defaultImage = "https://cdn-icons-png.flaticon.com/256/18238/18238419.png";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  password: string;
  profileImage?: string;
}

export const UserProfile = () => {
  const [user, setUser] = useState<User>({
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    gender: "HOMBRE",
    password: "********",
    profileImage: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    alert("Sesión cerrada");
    // Aquí deberías limpiar el token y redirigir al login
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <img
          src={user.profileImage || defaultImage}
          alt="Foto de perfil"
          className={styles.profileImage}
        />
        <h2>{`${user.firstName} ${user.lastName}`}</h2>
        <p>{user.email}</p>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className={styles.infoSection}>
        <h2>Información del usuario</h2>
        <div className={styles.infoItem}><strong>Nombre:</strong> {user.firstName}</div>
        <div className={styles.infoItem}><strong>Apellido:</strong> {user.lastName}</div>
        <div className={styles.infoItem}><strong>Email:</strong> {user.email}</div>
        <div className={styles.infoItem}><strong>Sexo:</strong> {user.gender}</div>
        <div className={styles.infoItem}><strong>Contraseña:</strong> {user.password}</div>

        <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
          Editar perfil
        </button>
      </div>

      {isEditing && (
        <EditUserModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={handleUserUpdate}
        />
      )}
    </div>
  );
};
