import { useState } from "react";
import styles from "./EditUserModal.module.css";

interface User {
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    profileImage?: string;
}

interface Props {
    user: User;
    onClose: () => void;
    onSave: (user: User) => void;
}

export const EditUserModal = ({ user, onClose, onSave }: Props) => {
    const [formData, setFormData] = useState<User>(user);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <h2>Editar Perfil</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.nameLastname}>
                        <label>
                            Nombre:
                            <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} />
                        </label>
                        <label>
                            Apellido:
                            <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} />
                        </label>
                    </div>
                    <label>
                        Email:
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </label>
                    <label>
                        Contraseña:
                        <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    </label>
                    <label>
                        Foto:
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </label>

                    <div className={styles.buttons}>
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
