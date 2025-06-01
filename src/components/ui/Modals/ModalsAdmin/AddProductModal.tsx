import { Modal } from '../Modal/Modal';
import styles from '../Modal/Modal.module.css';
import { useState } from 'react';
import type { Producto } from '../../../../types/IProduct';
import { IColor } from '../../../../types/IEnumColor';
import { IEnumTalle } from '../../../../types/IEnumTalle';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (producto: ProductoFormData) => void;
  categorias: string[];
}
type ProductoFormData = Omit<Producto, 'id'> & {
  imagenFile: File | null;
};
export const ModalAgregarProducto = ({ isOpen, onClose, onSubmit, categorias }: Props) => {
  const [formData, setFormData] = useState<ProductoFormData>({
    denominacion: '',
    precioOriginal: 0,
    precioFinal: 0,
    sexo: 'MASCULINO',
    tienePromocion: false,
    categorias: [],
    imagenes: [''],
    imagenFile: null,
    detalle: {
      color: IColor.AZUL,
      marca: '',
      stock: 0,
      talle: IEnumTalle.S,
      precio: 0
    }
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    const parsedValue = type === 'number' ? parseFloat(value) : value;

    if (name.startsWith('detalle.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        detalle: {
          ...prev.detalle,
          [key]: type === 'number' ? parseFloat(value) : value
        }
      }));
    } else if (name === 'categorias') {
      const select = e.target as HTMLSelectElement;
      const selected = Array.from(select.selectedOptions).map(opt => opt.value);
      setFormData(prev => ({ ...prev, categorias: selected }));
    } else if (name.startsWith('imagenes[')) {
      const index = parseInt(name.match(/\[(\d+)\]/)?.[1] || '0');
      const newImagenes = [...formData.imagenes];
      newImagenes[index] = value;
      setFormData(prev => ({ ...prev, imagenes: newImagenes }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
      }));
    }
  };

  const handleAddImagen = () => {
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, '']
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      denominacion: formData.denominacion,
      precioOriginal: formData.precioOriginal,
      precioFinal: formData.precioFinal,
      sexo: formData.sexo,
      tienePromocion: formData.tienePromocion,
      categorias: formData.categorias,
      imagenes: formData.imagenes,
      imagenFile: formData.imagenFile,
      detalle: formData.detalle
    });


    onClose();
    setFormData({
      denominacion: '',
      precioOriginal: 0,
      precioFinal: 0,
      sexo: 'MASCULINO',
      tienePromocion: false,
      categorias: [],
      imagenes: [''],
      imagenFile: null,
      detalle: {
        color: IColor.AZUL,
        marca: '',
        stock: 0,
        talle: IEnumTalle.S,
        precio: 0
      }
    });


  };

  return (
    <Modal show={isOpen} onClose={onClose} title="Agregar Producto">
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Nombre:
          <input name="denominacion" value={formData.denominacion} onChange={handleChange} required />
        </label>

        <label>
          Precio Original:
          <input type="number" name="precioOriginal" value={formData.precioOriginal} onChange={handleChange} required />
        </label>

        <label>
          Precio Final:
          <input type="number" name="precioFinal" value={formData.precioFinal} onChange={handleChange} required />
        </label>

        <label>
          Género:
          <select name="sexo" value={formData.sexo} onChange={handleChange} required>
            <option value="">Seleccione género</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="UNISEX">Unisex</option>
            <option value="UNISEX_CHILD">Unisex Niño</option>
          </select>
        </label>

        <label>
          Categorías:
          <select
            name="categorias"
            multiple
            size={5}
            value={formData.categorias}
            onChange={handleChange}
            required
          >
            <option disabled value="">
              Seleccione una o más categorías
            </option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label>Imágenes:</label>
        {formData.imagenes.map((img, index) => (
          <label key={index}>
            Imagen {index + 1}:
            <input
              name={`imagenes[${index}]`}
              value={img}
              onChange={handleChange}
              required
            />
          </label>

        ))}
        <input type="file" onChange={e => setFormData({ ...formData, imagenFile: e.target.files?.[0] || null })} />
        <button type="button" onClick={handleAddImagen}>+ Agregar otra imagen</button>

        <hr />

        <select name="detalle.color" value={formData.detalle.color} onChange={handleChange} required>
          {Object.values(IColor).map(color => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>


        <label>
          Precio Detalle:
          <input
            type="number"
            name="detalle.precio"
            value={formData.detalle.precio}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Marca:
          <input name="detalle.marca" value={formData.detalle.marca} onChange={handleChange} required />
        </label>

        <label>
          Stock:
          <input
            type="number"
            name="detalle.stock"
            value={formData.detalle.stock}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Talle:
          <select name="detalle.talle" value={formData.detalle.talle} onChange={handleChange} required>
            {Object.values(IEnumTalle).map(talle => (
              <option key={talle} value={talle}>{talle}</option>
            ))}
          </select>
        </label>


        <button type="submit">Agregar Producto</button>
      </form>

    </Modal>
  );
};

