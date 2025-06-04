import { Modal } from '../Modal/Modal';
import styles from '../Modal/Modal.module.css';
import { useState } from 'react';
import type { Producto } from '../../../../types/IProduct';
import { IColor } from '../../../../types/IEnumColor';
import { IEnumTalle } from '../../../../types/IEnumTalle';
import type { ICategoria } from '../../../../types/ICategoria';
import style from '../ModalsAdmin/AddProductModal.module.css';


interface Props {
  isOpen: boolean;
  onClose: () => void;
  categorias: ICategoria[];
  onSubmit: (nuevo: Omit<Producto, 'id'>) => Promise<void>;
  onProductoCreado?: () => void;
}
type ProductoFormData = Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal' | 'imagenes'> & {

  detalle: Array<{
    color: IColor;
    talle: IEnumTalle;
    marca: string;
    stock: number;
    precioCompra: number;
    precioVenta: number;
    imagenes: string[];

  }>;
  tipoProducto: string;
};


export const ModalAgregarProducto = ({ isOpen, onClose, categorias, onSubmit, onProductoCreado }: Props) => {
  const [formData, setFormData] = useState<ProductoFormData>({
    descripcion: '',
    sexo: 'MASCULINO',
    categorias: [],
    // imagenFile: null, // <-- Quita esta línea
    detalle: [
      {
        color: IColor.AZUL,
        marca: '',
        stock: 0,
        talle: IEnumTalle.S,
        precioCompra: 0,
        precioVenta: 0,
        imagenes: [''], // <-- Array de strings para URLs
      },
    ],
    tipoProducto: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    console.log("handleChange disparado. Name:", name, "Value:", value, "Type:", type);

    if (name.startsWith('detalle[')) {
        // Opción 1: Usa la regex que ya tienes (y que debería funcionar)
        const match = name.match(/detalle\[(\d+)\]\.(\w+)/);
        const imagenUrlMatch = name.match(/detalle\[(\d+)\]\.imagenes\[(\d+)\]/);

        if (imagenUrlMatch) { // ¡Prioriza el match de imagen URL!
            const detalleIndex = parseInt(imagenUrlMatch[1]);
            const imagenIndex = parseInt(imagenUrlMatch[2]);
            
            console.log("handleChange - URL de imagen detectada (DENTRO DEL BLOQUE IMAGEN):");
            console.log("  name:", name);
            console.log("  e.target.value (directo del input):", e.target.value);
            console.log("  detalleIndex:", detalleIndex);
            console.log("  imagenIndex:", imagenIndex);

            setFormData(prev => {
                const updatedDetalles = [...prev.detalle];
                if (!updatedDetalles[detalleIndex].imagenes) {
                    updatedDetalles[detalleIndex].imagenes = [];
                }
                const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
                updatedImagenes[imagenIndex] = e.target.value; 
                console.log("  updatedImagenes DESPUÉS de la asignación:", updatedImagenes);
                updatedDetalles[detalleIndex] = {
                    ...updatedDetalles[detalleIndex],
                    imagenes: updatedImagenes,
                };
                return { ...prev, detalle: updatedDetalles };
            });
        } else if (match) { // Este bloque manejará los otros campos del detalle (marca, stock, etc.)
            const index = parseInt(match[1]);
            const field = match[2];
            let fieldValue: any = value; 

            if (field === 'stock' || field === 'precioCompra' || field === 'precioVenta') {
                fieldValue = parseFloat(value);
                if (isNaN(fieldValue)) fieldValue = 0;
            }

            setFormData(prev => {
                const updatedDetalles = [...prev.detalle];
                updatedDetalles[index] = {
                    ...updatedDetalles[index],
                    [field]: fieldValue, 
                };
                return { ...prev, detalle: updatedDetalles };
            });
        }
    } else if (name === 'categorias') {
        const select = e.target as HTMLSelectElement;
        const selectedIds = Array.from(select.selectedOptions).map(opt => Number(opt.value));
        const selectedCategorias = categorias.filter(cat => selectedIds.includes(cat.id!));
        setFormData(prev => ({ ...prev, categorias: selectedCategorias }));
    } else {
        let productFieldValue: any = value;
        if (name === 'sexo') {
            productFieldValue = value as Producto['sexo'];
        }
        setFormData(prev => ({
            ...prev,
            [name]: productFieldValue,
        }));
    }
};
  const handleAddDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalle: [
        ...prev.detalle,
        {
          color: IColor.AZUL,
          marca: '',
          stock: 0,
          talle: IEnumTalle.S,
          precioCompra: 0,
          precioVenta: 0,
          imagenes: [''], // <-- Nueva instancia de detalle también con un campo de imagen vacío
        },
      ],
    }));
  };
  const handleRemoveImagenFromDetalle = (detalleIndex: number, imagenIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      const updatedImagenes = updatedDetalles[detalleIndex].imagenes.filter((_, idx) => idx !== imagenIndex);
      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: updatedImagenes.length > 0 ? updatedImagenes : [''], // Asegura que siempre haya al menos un campo vacío
      };
      return { ...prev, detalle: updatedDetalles };
    });
  };
  const handleAddImagenToDetalle = (detalleIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: [...updatedDetalles[detalleIndex].imagenes, ''], // Añadir un nuevo campo de imagen vacío al detalle específico
      };
      return { ...prev, detalle: updatedDetalles };
    });
  };
  const resetForm = () => {
    setFormData({
      descripcion: '',
      sexo: 'MASCULINO',
      categorias: [],
      detalle: [
        {
          color: IColor.AZUL,
          marca: '',
          stock: 0,
          talle: IEnumTalle.S,
          precioCompra: 0,
          precioVenta: 0,
          imagenes: [''],
        },
      ],
      tipoProducto: '',
    });
    setError(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productoParaBackend: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'> = {
        descripcion: formData.descripcion,
        sexo: formData.sexo,
        tipoProducto: formData.tipoProducto,
        categorias: formData.categorias.map(cat => ({
          id: cat.id,
          descripcion: cat.descripcion,
          categoriaPadre: undefined, // Asegúrate de que estos campos se manejen en el backend si son requeridos
          subcategorias: undefined,
          productos: undefined
        })),
        detalle: formData.detalle.map(det => ({
          // El array 'imagenes' ya contendrá las URLs que el usuario ha escrito
          imagenes: det.imagenes.filter(url => url.trim() !== ''), // Filtra cualquier campo de URL vacío
          color: det.color,
          talle: det.talle,
          marca: det.marca,
          stock: det.stock,
          precioCompra: det.precioCompra,
          precioVenta: det.precioVenta,
        })),
      };

      // Envía el objeto JSON directamente
      await onSubmit(productoParaBackend); // Tu función onSubmit debe esperar un objeto JSON, no FormData

      resetForm();
      onClose();
      if (onProductoCreado) onProductoCreado();
      alert('Producto creado correctamente');
    } catch (err) {
      console.error("Error al crear producto:", err);
      setError('Error al crear producto. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={onClose} title="Agregar Producto">
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Nombre:
          <input name="descripcion" value={formData.descripcion} onChange={handleChange} required />
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
          Tipo de Producto:
          <input name="tipoProducto" value={formData.tipoProducto} onChange={handleChange} required />
        </label>

        <label>
          Categorías:
          <select
            name="categorias"
            multiple
            value={formData.categorias.map(cat => String(cat.id))} // Asegúrate de que cat.id no sea undefined
            onChange={handleChange}
            className={style.select_multiple}
          >
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.descripcion}
              </option>
            ))}
          </select>
        </label>



        <div>
          <h4>Detalle</h4>
          {formData.detalle.map((detalleItem, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
              <label>
                Marca:
                <input name={`detalle[${idx}].marca`} value={detalleItem.marca} onChange={handleChange} required />
              </label>
              <label>
                Color:
                <select name={`detalle[${idx}].color`} value={detalleItem.color} onChange={handleChange} required>
                  {Object.values(IColor).map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Stock:
                <input
                  type="number"
                  name={`detalle[${idx}].stock`}
                  value={detalleItem.stock}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Talle:
                <select name={`detalle[${idx}].talle`} value={detalleItem.talle} onChange={handleChange} required>
                  {Object.values(IEnumTalle).map(talle => (
                    <option key={talle} value={talle}>
                      {talle}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Precio Compra:
                <input
                  type="number"
                  name={`detalle[${idx}].precioCompra`}
                  value={detalleItem.precioCompra}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Precio Venta:
                <input
                  type="number"
                  name={`detalle[${idx}].precioVenta`}
                  value={detalleItem.precioVenta}
                  onChange={handleChange}
                  required
                />
              </label>
              <div className={style.imagenesDetalleContainer}>
                <h6>Imágenes del Detalle {idx + 1} (URLs):</h6>
                {/* Añadir una comprobación para asegurar que detalleItem.imagenes es un array */}
                {Array.isArray(detalleItem.imagenes) && detalleItem.imagenes.map((imgUrl, imgIdx) => (
                  <div key={`${idx}-${imgIdx}`} className={style.image_input_row}>
                    <label>
                      URL Imagen {imgIdx + 1}:
                      <input
                        name={`detalle[${idx}].imagenes[${imgIdx}]`}
                        value={imgUrl || ''}
                        onChange={handleChange}
                      />
                    </label>
                    {detalleItem.imagenes.length > 1 && (
                      <button type="button" onClick={() => handleRemoveImagenFromDetalle(idx, imgIdx)} className={style.smallButton}>
                        Eliminar URL
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => handleAddImagenToDetalle(idx)} className={style.smallButton}>
                  Agregar Campo de URL
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddDetalle}>
            Agregar Detalle
          </button>
        </div>
        { error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Agregar Producto'}
        </button>
      </form>
    </Modal>
  );
};