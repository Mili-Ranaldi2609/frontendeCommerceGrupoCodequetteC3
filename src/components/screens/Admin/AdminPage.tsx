import { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import { ModalAgregarProducto } from '../../ui/Modals/ModalsAdmin/AddProductModal';
import { ModalEditarProducto } from '../../ui/Modals/ModalsAdmin/EditProductModal';
import { getCategorias, createProducto,updateProducto, getAllProductos } from '../../../services/ConectionApi';
import type { Producto } from '../../../types/IProduct';
import type { ICategoria } from '../../../types/ICategoria'; 
import { logout } from '../../../utils/auth';
import { useNavigate } from 'react-router-dom';

export const AdminPage = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<ICategoria[]>([]); 
    const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
    const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarCategorias();
        cargarProductos();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/home");
    };

    const cargarCategorias = async () => {
        try {
            const res = await getCategorias();
            setCategorias(res.data);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    };

    const cargarProductos = async () => {
        try {
            const res = await getAllProductos();
            setProductos(res.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    const agregarProducto = async (nuevo: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'>) => {
        try {
            const response = await createProducto(nuevo);
            setProductos(prev => [...prev, response.data]);
        } catch (error) {
            console.error("Error al agregar producto:", error);
        } finally {
            setModalAgregarAbierto(false); // Cerrar modal después de agregar
        }
    };

    // Modificamos eliminarProductoHandler para usar updateProducto y la eliminación lógica
    const handleToggleProductoActive = async (productoId: number, currentStatus: boolean) => {
        try {
            // Encuentra el producto actual por ID
            const productoToUpdate = productos.find(p => p.id === productoId);
            if (!productoToUpdate) {
                console.error("Producto no encontrado para actualizar estado.");
                return;
            }

            // Clona el producto para no mutar el estado directamente
            const updatedProducto = { ...productoToUpdate };

            // Cambia el estado 'active' del producto principal
            updatedProducto.active = !currentStatus;

            // También, si desactivamos el producto, podemos desactivar todos sus detalles.
            // Si reactivamos el producto, podemos dejar los detalles como estaban o activarlos también.
            // Para simplicidad, si el producto se desactiva, desactivamos todos sus detalles.
            // Si el producto se activa, mantenemos el estado individual de los detalles.
            if (!updatedProducto.active) { // Si el producto va a estar inactivo
                updatedProducto.detalle = updatedProducto.detalle.map(d => ({ ...d, active: false }));
            }
            // Si el producto se activa, los detalles conservan su estado original o puedes marcarlos como activos también
            // else {
            //     updatedProducto.detalle = updatedProducto.detalle.map(d => ({ ...d, active: true }));
            // }


            // Prepara el DTO para enviar al backend (excluyendo campos calculados)
            const productoParaBackend = {
                descripcion: updatedProducto.descripcion,
                sexo: updatedProducto.sexo,
                categorias: updatedProducto.categorias.map(cat => ({ id: cat.id, descripcion: cat.descripcion })),
                tipoProducto: updatedProducto.tipoProducto,
                detalle: updatedProducto.detalle.map(det => ({
                    id: det.id, // ¡Importante enviar el ID del detalle!
                    color: det.color,
                    talle: det.talle,
                    marca: det.marca,
                    stock: det.stock,
                    precioCompra: det.precioCompra,
                    precioVenta: det.precioVenta,
                    imagenes: det.imagenes,
                    active: det.active // Enviar el estado active de cada detalle
                })),
                active: updatedProducto.active // Enviar el estado active del producto principal
            };

            await updateProducto(productoId, productoParaBackend);
            cargarProductos(); // Volver a cargar la lista para reflejar los cambios
        } catch (error) {
            console.error(`Error al ${currentStatus ? 'desactivar' : 'activar'} producto:`, error);
        }
    };

    // Función para manejar la edición exitosa (recargar productos)
    const handleProductoEdited = () => {
        cargarProductos();
    };

    // Filtra los productos en activos e inactivos
    const productosActivos = productos.filter(p => p.active !== false); // active puede ser undefined si es nuevo, por eso !== false
    const productosInactivos = productos.filter(p => p.active === false);

    const productosActivosPorCategoria = productosActivos.reduce((acc, prod) => {
        prod.categorias.forEach(cat => {
            const catKey = typeof cat === 'string' ? cat : cat.descripcion;
            if (!acc[catKey]) acc[catKey] = [];
            acc[catKey].push(prod);
        });
        return acc;
    }, {} as Record<string, Producto[]>);

    const productosInactivosPorCategoria = productosInactivos.reduce((acc, prod) => {
        prod.categorias.forEach(cat => {
            const catKey = typeof cat === 'string' ? cat : cat.descripcion;
            if (!acc[catKey]) acc[catKey] = [];
            acc[catKey].push(prod);
        });
        return acc;
    }, {} as Record<string, Producto[]>);


    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1>Panel de Administración</h1>
                <button onClick={() => setModalAgregarAbierto(true)}>Agregar Producto</button>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    Cerrar sesión
                </button>
            </div>

            {/* SECCIÓN DE PRODUCTOS ACTIVOS */}
            <hr />
            <h2>Productos Activos</h2>
            {Object.entries(productosActivosPorCategoria).map(([categoria, lista]) => (
                <div key={`active-${categoria}`} className={styles.categoria}>
                    <h3>{categoria}</h3>
                    <ul>
                        {lista.map(prod => (
                            <li key={prod.id} className={styles.productoItem}>
                                <div>
                                    <strong>{prod.descripcion}</strong>
                                    {/* Mostrar detalles activos de forma más clara si es necesario */}
                                    <p>
                                        {prod.detalle && prod.detalle.length > 0
                                            ? `Detalles: ${prod.detalle.filter(d => d.active !== false).length} activos`
                                            : 'Sin detalles activos'}
                                    </p>
                                </div>
                                <div className={styles.actions}>
                                    <button onClick={() => setProductoEditar(prod)}>Editar</button>
                                    <button onClick={() => handleToggleProductoActive(prod.id, true)} className={styles.deleteButton}>Desactivar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* SECCIÓN DE PRODUCTOS DESACTIVADOS */}
            <hr />
            <h2 className={styles.inactiveSectionTitle}>Productos Desactivados</h2>
            {productosInactivos.length === 0 ? (
                <p>No hay productos desactivados.</p>
            ) : (
                Object.entries(productosInactivosPorCategoria).map(([categoria, lista]) => (
                    <div key={`inactive-${categoria}`} className={styles.categoria}>
                        <h3>{categoria}</h3>
                        <ul>
                            {lista.map(prod => (
                                <li key={prod.id} className={styles.productoItemInactive}>
                                    <div>
                                        <strong>{prod.descripcion}</strong> (Inactivo)
                                        {/* Puedes mostrar aquí los detalles que también están inactivos */}
                                    </div>
                                    <div className={styles.actions}>
                                        <button onClick={() => handleToggleProductoActive(prod.id, false)} className={styles.activateButton}>Activar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}

            <ModalAgregarProducto
                isOpen={modalAgregarAbierto}
                onClose={() => setModalAgregarAbierto(false)}
                onSubmit={agregarProducto}
                categorias={categorias}
            />

            {productoEditar && (
                <ModalEditarProducto
                    isOpen={!!productoEditar}
                    onClose={() => setProductoEditar(null)}
                    producto={productoEditar}
                    onEdit={updateProducto} // Esta función ahora maneja el producto y sus detalles
                    categorias={categorias}
                    onProductoEditado={handleProductoEdited} // Para recargar productos después de editar
                />
            )}
        </div>
    );
};