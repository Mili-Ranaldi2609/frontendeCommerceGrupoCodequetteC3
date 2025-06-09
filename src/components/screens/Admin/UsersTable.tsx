import React, { useEffect, useState } from 'react';
import { getAllUsers, deactivateUser, activateUser, createNewUser, updateExistingUser } from '../../../services/ConectionApi';
import styles from './UsersTable.module.css'; 
import Swal from 'sweetalert2';
interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string; 
  role: string;
  active: boolean;
}

export const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el formulario de creación/edición (opcional, pero útil)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null); 
  const [formValues, setFormValues] = useState({
    firstname: '',
    lastname: '',
    username: '', 
    password: '',
    role: '',
    active: true 
  });


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(); 
      setUsers(data);
    } catch (err: any) { 
        console.error("Error fetching users:", err);
        if (err.response && err.response.status === 403) {
            setError("No tienes permisos para ver esta información. Acceso denegado (403 Forbidden).");
        } else {
            setError("No se pudieron cargar los usuarios.");
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async (userId: number, username: string) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de desactivar a ${username}?`,
      text: "¡El usuario no podrá iniciar sesión!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deactivateUser(userId);
        Swal.fire(
          '¡Desactivado!',
          `El usuario ${username} ha sido desactivado.`,
          'success'
        );
        fetchUsers(); 
      } catch (error: any) {
        console.error("Error al desactivar usuario:", error);
        Swal.fire(
          'Error',
          `No se pudo desactivar el usuario. ${error.response?.data?.message || error.message}`,
          'error'
        );
      }
    }
  };

  const handleActivate = async (userId: number, username: string) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de activar a ${username}?`,
      text: "El usuario podrá iniciar sesión nuevamente.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await activateUser(userId);
        Swal.fire(
          '¡Activado!',
          `El usuario ${username} ha sido activado.`,
          'success'
        );
        fetchUsers(); 
      } catch (error: any) {
        console.error("Error al activar usuario:", error);
        Swal.fire(
          'Error',
          `No se pudo activar el usuario. ${error.response?.data?.message || error.message}`,
          'error'
        );
      }
    }
  };


  const openModal = (userToEdit: User | null = null) => {
    setIsModalOpen(true);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormValues({
        firstname: userToEdit.firstname,
        lastname: userToEdit.lastname,
        username: userToEdit.username, 
        password: '',
        role: userToEdit.role,
        active: userToEdit.active
      });
    } else {
      setEditingUser(null);
      setFormValues({
        firstname: '',
        lastname: '',
        username: '',
        password: '',
        role: 'USER', 
        active: true
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormValues({
      firstname: '',
      lastname: '',
      username: '',
      password: '',
      role: '',
      active: true
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormValues({ ...formValues, [name]: newValue });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Lógica de actualización
        const updateData: any = { ...formValues };
        // No enviar contraseña si está vacía en la edición
        if (!updateData.password) {
            delete updateData.password;
        }
        await updateExistingUser(editingUser.id, updateData);
        Swal.fire('¡Actualizado!', 'Usuario actualizado con éxito.', 'success');
      } else {
        // Lógica de creación
        await createNewUser(formValues);
        Swal.fire('¡Creado!', 'Usuario creado con éxito.', 'success');
      }
      closeModal();
      fetchUsers(); 
    } catch (error: any) {
      console.error("Error al guardar usuario:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error desconocido al guardar usuario.";
      Swal.fire('Error', errorMessage, 'error');
    }
  };


  if (loading) {
    return <div className={styles.loading}>Cargando usuarios...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión de Usuarios</h1>

      {/* Botón para abrir el modal de crear usuario */}
      <button className={styles.createButton} onClick={() => openModal()}>Crear Nuevo Usuario</button>

      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th> 
              <th>Acciones</th> 
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{user.active ? 'Activo' : 'Inactivo'}</td> 
                <td>
                  <button className={styles.editButton} onClick={() => openModal(user)}>Editar</button>
                  {user.active ? (
                    <button className={styles.deactivateButton} onClick={() => handleDeactivate(user.id, user.username)}>Desactivar</button>
                  ) : (
                    <button className={styles.activateButton} onClick={() => handleActivate(user.id, user.username)}>Activar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.formGroup}>
                <label>Nombre:</label>
                <input
                  type="text"
                  name="firstname"
                  value={formValues.firstname}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Apellido:</label>
                <input
                  type="text"
                  name="lastname"
                  value={formValues.lastname}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email (Username):</label>
                <input
                  type="email"
                  name="username"
                  value={formValues.username}
                  onChange={handleFormChange}
                  required
                  disabled={!!editingUser} 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Contraseña:</label>
                <input
                  type="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleFormChange}
                  required={!editingUser}
                />
                {editingUser && <small>(Deja en blanco para no cambiar la contraseña)</small>}
              </div>
              <div className={styles.formGroup}>
                <label>Rol:</label>
                <select
                  name="role"
                  value={formValues.role}
                  onChange={handleFormChange}
                  required
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              {editingUser && ( 
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="active"
                      checked={formValues.active}
                      onChange={handleFormChange}
                    />
                    Activo
                  </label>
                </div>
              )}
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};