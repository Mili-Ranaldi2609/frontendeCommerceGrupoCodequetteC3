import { Modal } from '../Modal/Modal';
import type { Producto } from '../../../../types/IProduct';
import { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto;
  onEdit: (productoId: number, data: FormData) => void;
}

export const ModalEditarProducto = ({ isOpen, onClose, producto, onEdit }: Props) => {
  const [formData, setFormData] = useState({
    denominacion: '',
    precio: '',
    categoria: '',
    talle: '',
    color: '',
    marca: '',
    imagenUrl: '',
    imagenFile: null as File | null,
  });

  useEffect(() => {
    // Este efecto asegura que los valores se carguen cuando se abre el modal
    if (producto) {
      setFormData({
        denominacion: producto.denominacion,
        precio: producto.precioFinal.toString(),
        categoria: producto.categorias[0],
        talle: producto.detalle.talle,
        color: producto.detalle.color,
        marca: producto.detalle.marca,
        imagenUrl: '',
        imagenFile: null,
      });
    }
  }, [producto]);

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("denominacion", formData.denominacion);
    data.append("precio", formData.precio);
    data.append("categoria", formData.categoria);
    data.append("talle", formData.talle);
    data.append("color", formData.color);
    data.append("marca", formData.marca);

    if (formData.imagenFile) {
      data.append("imagen", formData.imagenFile);
    } else if (formData.imagenUrl) {
      data.append("imagenUrl", formData.imagenUrl);
    }

    await onEdit(producto.id, data);
    onClose();
  };

  return (
    <Modal show={isOpen} title="Editar Producto" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Denominación"
          value={formData.denominacion}
          onChange={e => setFormData({ ...formData, denominacion: e.target.value })}
        />
        <input
          type="text"
          placeholder="Precio"
          value={formData.precio}
          onChange={e => setFormData({ ...formData, precio: e.target.value })}
        />
        <input
          type="text"
          placeholder="Categoría"
          value={formData.categoria}
          onChange={e => setFormData({ ...formData, categoria: e.target.value })}
        />
        <input
          type="text"
          placeholder="Talle"
          value={formData.talle}
          onChange={e => setFormData({ ...formData, talle: e.target.value })}
        />
        <input
          type="text"
          placeholder="Color"
          value={formData.color}
          onChange={e => setFormData({ ...formData, color: e.target.value })}
        />
        <input
          type="text"
          placeholder="Marca"
          value={formData.marca}
          onChange={e => setFormData({ ...formData, marca: e.target.value })}
        />
        <input
          type="text"
          placeholder="URL de imagen"
          value={formData.imagenUrl}
          onChange={e => setFormData({ ...formData, imagenUrl: e.target.value })}
        />
        <input
          type="file"
          onChange={e => setFormData({ ...formData, imagenFile: e.target.files?.[0] || null })}
        />
        <button onClick={handleSubmit}>Guardar cambios</button>
      </div>
    </Modal>
  );
};

