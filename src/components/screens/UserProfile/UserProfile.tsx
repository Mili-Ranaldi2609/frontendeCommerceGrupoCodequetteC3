import { useEffect, useState } from "react";
import styles from "./UserProfile.module.css";
import { EditUserModal } from "./EditUserModal"; 
import { logout } from "../../../utils/auth";
import { useNavigate } from "react-router-dom";
import { getUsuarioActual, updateProfile } from "../../../services/ConectionApi"; 
interface User {
    id?: number; 
    firstname: string;
    lastname: string;
    email: string;
    password?: string; 
    profileImage?: string; 
}

const defaultImage = "https://cdn-icons-png.flaticon.com/256/18238/18238419.png"; 

export const UserProfile = () => {
    const [user, setUser] = useState<User | null>(null); 
    const [isEditing, setIsEditing] = useState(false); 
    const navigate = useNavigate(); 
    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const res = await getUsuarioActual();
                const data = res.data;
                setUser({
                    id: data.id, 
                    firstname: data.firstname,
                    lastname: data.lastname,
                    email: data.username, 
                    profileImage: data.profileImage,
                });
            } catch (err: any) {
                console.error("Error al obtener datos del usuario:", err);
                logout();
                navigate("/login", { state: { openLoginModal: true } }); 
            }
        };

        fetchUsuario(); 
    }, []); 
    const handleLogout = () => {
        logout(); 
        navigate("/home");
    };
    const handleUserUpdate = async (userId: number, updatedUserData: Omit<User, 'password'>) => {
        try {
            const response = await updateProfile(updatedUserData);
            setUser(response.data);
            setIsEditing(false);
            alert('Perfil actualizado con éxito.'); 
        } catch (error: any) {
            console.error("Error al actualizar el usuario:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Error al actualizar el perfil.');
        }
    };
    if (!user) return <p style={{ padding: "2rem", textAlign: "center" }}>Cargando perfil...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <img
                    src={user.profileImage || defaultImage} 
                    alt="Foto de perfil"
                    className={styles.profileImage}
                />
                <h2>{`${user.firstname} ${user.lastname}`}</h2>
                <p>{user.email}</p>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>

            <div className={styles.infoSection}>
                <h2>Información del usuario</h2>
                <div className={styles.infoItem}><strong>Nombre:</strong> {user.firstname}</div>
                <div className={styles.infoItem}><strong>Apellido:</strong> {user.lastname}</div>
                <div className={styles.infoItem}><strong>Email:</strong> {user.email}</div>
                <div className={styles.infoItem}><strong>Contraseña:</strong> ********</div>

                <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                    Editar perfil
                </button>
            </div>

            {isEditing && user && (
                <EditUserModal
                    user={user} 
                    onClose={() => setIsEditing(false)} 
                    onSave={handleUserUpdate} 
                />
            )}
        </div>
    );
};
