import { useState } from "react";
import styles from "./EditUserModal.module.css";
import { Modal } from "../../ui/Modals/Modal/Modal";
import { uploadProfileImage } from "../../../services/ConectionApi";
interface UserFormData {
    id?: number;
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    profileImage?: string;
    profileImageFile?: File;
    loadingImage?: boolean;
    imageUploadError?: string | null;
}

interface Props {
    user: UserFormData;
    onClose: () => void;
    onSave: (userId: number, updatedUserData: Omit<UserFormData, 'profileImageFile' | 'loadingImage' | 'imageUploadError'>) => Promise<any>;
}

export const EditUserModal = ({ user, onClose, onSave }: Props) => {
    const [formData, setFormData] = useState<UserFormData>({
        ...user,
        password: '',
        profileImage: user.profileImage || '',
        profileImageFile: undefined,
        loadingImage: false,
        imageUploadError: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFormData(prev => ({
            ...prev,
            profileImageFile: file,
            loadingImage: true,
            imageUploadError: null,
        }));

        try {
            const response = await uploadProfileImage(file);
            const imageUrl = response.data.url;
            setFormData(prev => ({
                ...prev,
                profileImage: imageUrl,
                loadingImage: false,
                profileImageFile: undefined,
            }));
            e.target.value = '';
        } catch (err: any) {
            console.error('Error al subir imagen de perfil:', err);
            setFormData(prev => ({
                ...prev,
                loadingImage: false,
                profileImageFile: undefined,
                profileImage: user.profileImage || '',
                imageUploadError: 'Error al subir imagen: ' + (err.response?.data?.error || err.message || 'Desconocido'),
            }));
        }
    };
    const handleRemoveProfileImage = () => {
        setFormData(prev => ({
            ...prev,
            profileImage: '',
            profileImageFile: undefined,
            imageUploadError: null,
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (formData.loadingImage) {
                throw new Error('Por favor, espere a que la imagen de perfil termine de subir.');
            }
            if (formData.imageUploadError) {
                throw new Error('Hay un error en la subida de la imagen. Por favor, corríjalo.');
            }
            const userToSave: Omit<UserFormData, 'profileImageFile' | 'loadingImage' | 'imageUploadError'> = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                email: formData.email,
                profileImage: formData.profileImage || undefined,
            };
            if (formData.password && formData.password.trim() !== '') {
                userToSave.password = formData.password;
            }
            if (user.id) {
                await onSave(user.id, userToSave);
            } else {
                throw new Error('ID de usuario no disponible para la edición.');
            }

        } catch (err: any) {
            console.error("Error al guardar perfil:", err);
            setError(err.message || 'Error al guardar perfil. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={true} onClose={onClose} title="Editar Perfil">
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
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled />
                </label>
                <label>
                    Contraseña (dejar en blanco para no cambiar):
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                </label>
                <label>
                    Foto de perfil:
                    <div className={styles.profileImagePreviewContainer}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={formData.loadingImage}
                        />
                        {(formData.profileImage || formData.profileImageFile) && !formData.loadingImage && (
                            <div className={styles.imgbutton}>
                                <button type="button" onClick={handleRemoveProfileImage} className={styles.removeImageButton}>
                                    Quitar Imagen
                                </button>
                                <img
                                    src={formData.profileImageFile ? URL.createObjectURL(formData.profileImageFile) : formData.profileImage}
                                    alt="Previsualización"
                                    className={styles.profileImagePreview}
                                />
                            </div>
                        )}
                    </div>
                    {formData.loadingImage && <p className={styles.loadingMessage}>Subiendo imagen...</p>}
                    {formData.imageUploadError && <p className={styles.errorMessage}>{formData.imageUploadError}</p>}
                </label>


                <div className={styles.buttons}>
                    <button type="submit" disabled={loading || formData.loadingImage}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
            </form>
        </Modal>
    );
};
