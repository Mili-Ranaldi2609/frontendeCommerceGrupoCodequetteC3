// src/components/user/UserAddresses/UserAddresses.tsx
import { useEffect, useState } from 'react';
import {  createDireccion, deleteDireccion, getLocalidades, getProvincias, getUserAddresses, updateDireccion, type DireccionRequestFrontend, type DireccionResponseFrontend } from '../../../services/ConectionApi';
interface UserAddressesProps {
    userId: number; 
}
import styles  from "./UserAddresses.module.css"
import type { LocalidadFrontend, ProvinciaFrontend } from '../../../types/Ubicaciones';
export const UserAddresses = ({ userId }: UserAddressesProps) => {
    const [direcciones, setDirecciones] = useState<DireccionResponseFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<DireccionResponseFrontend | null>(null);

    // Estados para el formulario de dirección
    const [calle, setCalle] = useState('');
    const [numero, setNumero] = useState<number | ''>('');
    const [cp, setCp] = useState('');
    const [provinciaId, setProvinciaId] = useState<number | ''>('');
    const [localidadId, setLocalidadId] = useState<number | ''>('');

    const [provincias, setProvincias] = useState<ProvinciaFrontend[]>([]);
    const [localidades, setLocalidades] = useState<LocalidadFrontend[]>([]);

    const fetchDirecciones = async () => {
        setLoading(true);
        setError(null);
        try {
            // Usamos ConectionApi.auth para acceder a las funciones de direcciones
            const response = await getUserAddresses();
            setDirecciones(response.data);
        } catch (err: any) {
            console.error("Error al obtener direcciones:", err);
            if (err.response && err.response.status === 403) {
                setError("No autorizado para ver direcciones. Por favor, inicie sesión nuevamente.");
                // Aquí podrías redirigir al login o limpiar el token
            } else {
                setError("Error al cargar las direcciones. Inténtelo de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchProvincias = async () => {
        try {
            const response = await getProvincias();
            setProvincias(response.data);
        } catch (err) {
            console.error("Error al cargar provincias:", err);
            setError("No se pudieron cargar las provincias.");
        }
    };

    const fetchLocalidades = async (pId: number) => {
        try {
            const response = await getLocalidades(pId);
            setLocalidades(response.data);
        } catch (err) {
            console.error("Error al cargar localidades:", err);
            setError("No se pudieron cargar las localidades.");
        }
    };

    useEffect(() => {
        fetchDirecciones();
        fetchProvincias();
    }, []);

    useEffect(() => {
        if (provinciaId) {
            fetchLocalidades(Number(provinciaId));
        } else {
            setLocalidades([]);
            setLocalidadId('');
        }
    }, [provinciaId]);

    const resetForm = () => {
        setCalle('');
        setNumero('');
        setCp('');
        setProvinciaId('');
        setLocalidadId('');
        setEditingAddress(null);
        setShowForm(false);
    };

    const handleCreateUpdateDireccion = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!calle || !numero || !cp || !localidadId) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        const direccionData: DireccionRequestFrontend= {
            calle,
            numero: Number(numero),
            cp,
            localidadId: Number(localidadId),
        };

        try {
            if (editingAddress) {
                await updateDireccion(editingAddress.id, direccionData);
                alert('Dirección actualizada con éxito.');
            } else {
                await createDireccion(direccionData);
                alert('Dirección creada con éxito.');
            }
            fetchDirecciones(); // Refrescar la lista
            resetForm();
        } catch (err: any) {
            console.error("Error al guardar dirección:", err);
            setError(err.response?.data?.message || "Error al guardar la dirección.");
        }
    };

    const handleEditClick = (direccion: DireccionResponseFrontend) => {
        setEditingAddress(direccion);
        setCalle(direccion.calle);
        setNumero(direccion.numero);
        setCp(direccion.cp);
        setProvinciaId(direccion.localidad.provincia.id);
        setLocalidadId(direccion.localidad.id);
        setShowForm(true);
    };

    const handleDeleteDireccion = async (direccionId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
            try {
                await deleteDireccion(direccionId);
                alert('Dirección eliminada con éxito.');
                fetchDirecciones(); // Refrescar la lista
            } catch (err: any) {
                console.error("Error al eliminar dirección:", err);
                setError(err.response?.data?.message || "Error al eliminar la dirección.");
            }
        }
    };

    if (loading) return <p>Cargando direcciones...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.addressesContainer}>
            <h3>Mis Direcciones</h3>

            <button onClick={() => setShowForm(!showForm)} className={styles.toggleFormBtn}>
                {showForm ? 'Ocultar Formulario' : 'Agregar Nueva Dirección'}
            </button>

            {showForm && (
                <form onSubmit={handleCreateUpdateDireccion} className={styles.addressForm}>
                    <h4>{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</h4>
                    <input type="text" placeholder="Calle" value={calle} onChange={(e) => setCalle(e.target.value)} required />
                    <input type="number" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value === '' ? '' : Number(e.target.value))} required />
                    <input type="text" placeholder="Código Postal" value={cp} onChange={(e) => setCp(e.target.value)} required />

                    <select value={provinciaId} onChange={(e) => setProvinciaId(Number(e.target.value))} required>
                        <option value="">Seleccione Provincia</option>
                        {provincias.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>

                    <select value={localidadId} onChange={(e) => setLocalidadId(Number(e.target.value))} required disabled={!provinciaId}>
                        <option value="">Seleccione Localidad</option>
                        {localidades.map(l => (
                            <option key={l.id} value={l.id}>{l.nombre}</option>
                        ))}
                    </select>

                    <button type="submit">{editingAddress ? 'Actualizar Dirección' : 'Guardar Dirección'}</button>
                    <button type="button" onClick={resetForm} className={styles.cancelBtn}>Cancelar</button>
                    {error && <p className={styles.formError}>{error}</p>}
                </form>
            )}

            {direcciones.length === 0 ? (
                <p>No tienes direcciones registradas.</p>
            ) : (
                <ul className={styles.addressList}>
                    {direcciones.map(dir => (
                        <li key={dir.id} className={styles.addressItem}>
                            <p><strong>{dir.calle} {dir.numero}, {dir.localidad.nombre} ({dir.localidad.provincia.nombre})</strong></p>
                            <p>CP: {dir.cp}</p>
                            <div className={styles.addressActions}>
                                <button onClick={() => handleEditClick(dir)} className={styles.editAddressBtn}>Editar</button>
                                <button onClick={() => handleDeleteDireccion(dir.id)} className={styles.deleteAddressBtn}>Eliminar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};