import { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import { ModalAgregarProducto } from '../../ui/Modals/ModalsAdmin/AddProductModal';
import { ModalEditarProducto } from '../../ui/Modals/ModalsAdmin/EditProductModal';
import { getCategorias, getProductos, createProducto, deleteProducto, updateProducto } from '../../../services/ConectionApi';
import type { Producto } from '../../../types/IProduct';
import { logout } from '../../../utils/auth';
import { useNavigate } from 'react-router-dom';


export const AdminPage = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);
  const handleLogout = () => {
    logout()
    navigate("/home");
  };


  const cargarCategorias = async () => {
    const res = await getCategorias();
    setCategorias(res.data.map((cat: any) => cat.descripcion));
  };

  const cargarProductos = async () => {
    const res = await getProductos();
    setProductos(res.data);
  };

  const agregarProducto = async (nuevo: Omit<Producto, 'id'>) => {
    try {
      const response = await createProducto(nuevo);
      setProductos(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  };

  const eliminarProductoHandler = async (id: number) => {
    try {
      await deleteProducto(id);
      setProductos(productos.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const productosPorCategoria = productos.reduce((acc, prod) => {
    prod.categorias.forEach(cat => {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(prod);
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

      {Object.entries(productosPorCategoria).map(([categoria, lista]) => (
        <div key={categoria} className={styles.categoria}>
          <h2>{categoria}</h2>
          <ul>
            {lista.map(prod => (
              <li key={prod.id} className={styles.productoItem}>
                <div>
                  <strong>{prod.denominacion}</strong>
                  <p>{prod.detalle?.marca} - {prod.detalle?.color} - Talle: {prod.detalle?.talle}</p>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => setProductoEditar(prod)}>Editar</button>
                  <button onClick={() => eliminarProductoHandler(prod.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

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
          onEdit={async (id: number, data: FormData) => {
            try {
              const res = await updateProducto(id, data);
              setProductos(prev =>
                prev.map(p => (p.id === id ? res.data : p))
              );
              setProductoEditar(null);
            } catch (err) {
              console.error("Error actualizando producto", err);
            }
          }}
        />
      )}
    </div>
  );
};


