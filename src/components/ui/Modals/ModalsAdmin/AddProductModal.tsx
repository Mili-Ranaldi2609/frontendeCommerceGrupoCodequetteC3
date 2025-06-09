import { Modal } from '../Modal/Modal';
import { useState } from 'react';
import type { Producto } from '../../../../types/IProduct';
import { IColor } from '../../../../types/IEnumColor';
import { IEnumTalle } from '../../../../types/IEnumTalle';
import type { ICategoria } from '../../../../types/ICategoria';
import adminStyles from './AddProductModal.module.css'; 
import { uploadImagen } from '../../../../services/ConectionApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categorias: ICategoria[];
  onSubmit: (nuevo: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'>) => Promise<void>;
  onProductoCreado?: () => void;
}
type DetalleFormData = {
  id?: number; // Para edición
  active?: boolean; // Para edición
  color: IColor;
  talle: IEnumTalle;
  marca: string;
  stock: number;
  precioCompra: number;
  precioVenta: number;
  imagenes: (File | string)[]; 
  loadingImage?: boolean; 
  imageUploadError?: string | null; 
};
type ProductoFormData = Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal' | 'detalle'> & {
  detalle: DetalleFormData[];
  tipoProducto: string;
};

export const ModalAgregarProducto = ({ isOpen, onClose, categorias, onSubmit, onProductoCreado }: Props) => {
  const [formData, setFormData] = useState<ProductoFormData>({
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
        imagenes: [],
        loadingImage: false,
        imageUploadError: null,
      },
    ],
    tipoProducto: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const { type, files } = e.target as HTMLInputElement;

    const detalleFieldMatch = name.match(/detalle\[(\d+)\]\.(\w+)/);
    const imagenInputMatch = name.match(/detalle\[(\d+)\]\.imagenes\[(\d+)\]/);

    if (type === 'file' && files && files.length > 0) {
      const file = files[0];
      if (!imagenInputMatch) return; 

      const detalleIndex = parseInt(imagenInputMatch[1]);
      const imageIndex = parseInt(imagenInputMatch[2]);

      // Marcar el detalle como "cargando imagen"
      setFormData(prev => {
        const updatedDetalles = [...prev.detalle];
        updatedDetalles[detalleIndex] = {
          ...updatedDetalles[detalleIndex],
          loadingImage: true,
          imageUploadError: null,
          imagenes: prev.detalle[detalleIndex].imagenes.map((img, idx) =>
            idx === imageIndex ? file : img // Temporalmente guardamos el File
          ),
        };
        return { ...prev, detalle: updatedDetalles };
      });

      try {
        const response = await uploadImagen(file); 
        const imageUrl = response.data.url; 
        setFormData(prev => {
          const updatedDetalles = [...prev.detalle];
          updatedDetalles[detalleIndex] = {
            ...updatedDetalles[detalleIndex],
            loadingImage: false,
            imageUploadError: null,
            imagenes: prev.detalle[detalleIndex].imagenes.map((img, idx) =>
              idx === imageIndex ? imageUrl : img // Reemplazar File con URL
            ),
          };
          return { ...prev, detalle: updatedDetalles };
        });
      } catch (err: any) {
        console.error('Error al subir imagen:', err);
        // Manejar el error de subida de imagen
        setFormData(prev => {
          const updatedDetalles = [...prev.detalle];
          updatedDetalles[detalleIndex] = {
            ...updatedDetalles[detalleIndex],
            loadingImage: false,
            imageUploadError: 'Error al subir imagen: ' + (err.response?.data?.error || err.message || 'Desconocido'),
            imagenes: prev.detalle[detalleIndex].imagenes.map((img, idx) =>
                idx === imageIndex ? '' : img 
              ),
          };
          return { ...prev, detalle: updatedDetalles };
        });
      } finally {
        if (e.target) {
            e.target.value = '';
        }
      }
      return; 
    }

    if (imagenInputMatch) {
      const detalleIndex = parseInt(imagenInputMatch[1]);
      const imagenIndex = parseInt(imagenInputMatch[2]);

      setFormData(prev => {
        const updatedDetalles = [...prev.detalle];
        const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
        updatedImagenes[imagenIndex] = value; // Aquí se guarda el string de la URL

        updatedDetalles[detalleIndex] = {
          ...updatedDetalles[detalleIndex],
          imagenes: updatedImagenes,
        };
        return { ...prev, detalle: updatedDetalles };
      });
    } else if (detalleFieldMatch) {
      const index = parseInt(detalleFieldMatch[1]);
      const field = detalleFieldMatch[2];
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
          imagenes: [],
          loadingImage: false,
          imageUploadError: null,
        },
      ],
    }));
  };
  const handleRemoveDetalle = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      detalle: prev.detalle.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleRemoveImagenFromDetalle = (detalleIndex: number, imagenIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      const currentImages = [...updatedDetalles[detalleIndex].imagenes];

      const updatedImagenes = currentImages.filter((_, idx) => idx !== imagenIndex);

      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: updatedImagenes,
      };
      return { ...prev, detalle: updatedDetalles };
    });
  };
  const handleAddImagenToDetalle = (detalleIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      const currentImages = updatedDetalles[detalleIndex].imagenes;

      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: [...currentImages, ''], 
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
          imagenes: [],
          loadingImage: false,
          imageUploadError: null,
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

      const anyImageLoading = formData.detalle.some(det => det.loadingImage);
      if (anyImageLoading) {
        throw new Error('Por favor, espere a que todas las imágenes terminen de subir.');
      }
   
      const anyImageUploadError = formData.detalle.some(det => det.imageUploadError);
      if (anyImageUploadError) {
        throw new Error('Hay errores en la subida de imágenes. Por favor, corríjalos.');
      }

      // Prepara el ProductoDTO final para el backend
      const productoParaBackend: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'> = {
        descripcion: formData.descripcion,
        sexo: formData.sexo,
        tipoProducto: formData.tipoProducto,
        categorias: formData.categorias.map(cat => ({
          id: cat.id,
          descripcion: cat.descripcion,
          categoriaPadre: undefined,
          subcategorias: undefined,
          productos: undefined
        })),
        detalle: formData.detalle.map(det => ({
          id: det.id,
          color: det.color,
          talle: det.talle,
          marca: det.marca,
          stock: det.stock,
          precioCompra: det.precioCompra,
          precioVenta: det.precioVenta,
          imagenes: det.imagenes as string[], 
          active: det.active
        })),
      };
      await onSubmit(productoParaBackend);

      resetForm();
      onClose();
      if (onProductoCreado) onProductoCreado();
      alert('Producto creado correctamente');
    } catch (err: any) {
      console.error("Error al crear producto:", err);
      setError(err.message || 'Error al crear producto. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null

  return (
    <Modal show={isOpen} onClose={onClose} title="Agregar Producto"
      actions={
        <button type="submit" form="addProductForm" disabled={loading} className={adminStyles.submitButton}>
          {loading ? 'Guardando...' : 'Agregar Producto'}
        </button>
      }
    >
      <form id="addProductForm" onSubmit={handleSubmit} className={adminStyles.addProductForm}>
        <div className={adminStyles.formColumns}>
          {/* Columna de Información General */}
          <div className={adminStyles.generalInfoColumn}>
            <h3>Información General</h3>
            <label>
              Descripción:
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
                value={formData.categorias.map(cat => String(cat.id))}
                onChange={handleChange}
                className={adminStyles.selectMultiple}
              >
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.descripcion}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Columna de Detalles del Producto */}
          <div className={adminStyles.detailsColumn}>
            <h3>Detalles por Variación</h3>
            {formData.detalle.map((detalleItem, idx) => (
              <div key={idx} className={adminStyles.detalleGroup}>
                <h4>Detalle {idx + 1}</h4>
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
                 <div className={adminStyles.imagenesDetalleContainer}>
                  <h6>Imágenes del Detalle {idx + 1}:</h6>
                  {detalleItem.imagenes.map((imgData, imgIdx) => (
                    <div key={`${idx}-${imgIdx}`} className={adminStyles.imageInputRow}>
                      <label>
                        Archivo de Imagen {imgIdx + 1}:
                        <input
                          type="file"
                          name={`detalle[${idx}].imagenes[${imgIdx}]`}
                          onChange={handleChange}
                          accept="image/*"
                          disabled={detalleItem.loadingImage} // Deshabilita mientras sube
                        />
                        {detalleItem.loadingImage && (
                          <p>Subiendo imagen...</p> // Indicador de carga por imagen
                        )}
                        {detalleItem.imageUploadError && (
                          <p style={{ color: 'red' }}>{detalleItem.imageUploadError}</p> // Muestra error por imagen
                        )}
                        {imgData instanceof File && imgData.name ? (
                          <p>{imgData.name}</p>
                        ) : typeof imgData === 'string' && imgData.length > 0 ? (
                          <img src={imgData} alt="Previsualización" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                        ) : null}
                      </label>
                      {(imgData instanceof File || (typeof imgData === 'string' && imgData.length > 0)) && (
                        <button type="button" onClick={() => handleRemoveImagenFromDetalle(idx, imgIdx)} className={adminStyles.removeImageButton}>
                          X
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddImagenToDetalle(idx)} className={adminStyles.addImageButton}>
                    + Añadir Campo de Imagen
                  </button>
                </div>
                {formData.detalle.length > 1 && (
                  <button type="button" onClick={() => handleRemoveDetalle(idx)} className={adminStyles.removeDetalleButton}>
                    Eliminar Detalle
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddDetalle} className={adminStyles.addDetalleButton}>
              + Agregar Nuevo Detalle
            </button>
          </div>
        </div>
        {error && <p className={adminStyles.errorMessage}>{error}</p>}
      </form>
    </Modal>
  );
};