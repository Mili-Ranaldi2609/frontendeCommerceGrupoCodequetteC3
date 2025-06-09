import { Modal } from '../Modal/Modal';
import React, { useState, useEffect } from 'react';
import type { Producto } from '../../../../types/IProduct';
import { IColor } from '../../../../types/IEnumColor';
import type { ICategoria } from '../../../../types/ICategoria';
import style from './EditProductModal.module.css';
import { uploadImagen } from '../../../../services/ConectionApi'; 
import type { AxiosResponse } from 'axios';
import { IEnumTalle } from '../../../../types/IEnumTalle';


type DetalleFormData = {
  id?: number;
  active?: boolean;
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
};

// Definición de las Props del componente
interface Props {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto; // El producto a editar
  categorias: ICategoria[];
  onEdit: (productoId: number, productoActualizado: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'>) => Promise<AxiosResponse<any, any>>;
  onProductoEditado?: () => void; 
}

export const ModalEditarProducto = ({ isOpen, onClose, producto, categorias, onEdit, onProductoEditado }: Props) => {
  const [formData, setFormData] = useState<ProductoFormData>({
    descripcion: '',
    sexo: 'MASCULINO',
    categorias: [],
    detalle: [],
    tipoProducto: '',
    active: true,
  });

  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    if (isOpen && producto) {
      setFormData({
        descripcion: producto.descripcion || '',
        sexo: producto.sexo || 'UNISEX',
        categorias: producto.categorias || [],
        tipoProducto: producto.tipoProducto || '',
        active: producto.active !== undefined ? producto.active : true,
        detalle: producto.detalle.map(det => ({
          id: det.id,
          color: det.color || IColor.AZUL,
          talle: det.talle || IEnumTalle.S,
          marca: det.marca || '',
          stock: det.stock || 0,
          precioCompra: det.precioCompra || 0,
          precioVenta: det.precioVenta || 0,
          imagenes: det.imagenes && det.imagenes.length > 0 ? det.imagenes : [],
          active: det.active !== undefined ? det.active : true,
          loadingImage: false, 
          imageUploadError: null, 
        })),
      });
    } else if (!isOpen) {
      setFormData({
        descripcion: '',
        sexo: 'MASCULINO',
        categorias: [],
        detalle: [],
        tipoProducto: '',
        active: true,
      });
      setError(null);
    }
  }, [isOpen, producto]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, checked } = e.target;
    const { type, files } = e.target as HTMLInputElement; 
    if (name === 'active') {
      setFormData(prev => ({ ...prev, active: checked }));
      return;
    }

  
    if (name.startsWith('detalle[')) {
      const imagenInputMatch = name.match(/detalle\[(\d+)\]\.imagenes\[(\d+)\]/);
      const activeCheckboxMatch = name.match(/detalle\[(\d+)\]\.active/);

    
      if (type === 'file' && files && files.length > 0) {
        const file = files[0];
        if (!imagenInputMatch) return; 

        const detalleIndex = parseInt(imagenInputMatch[1]);
        const imageIndex = parseInt(imagenInputMatch[2]);

        setFormData(prev => {
          const updatedDetalles = [...prev.detalle];
          updatedDetalles[detalleIndex] = {
            ...updatedDetalles[detalleIndex],
            loadingImage: true,
            imageUploadError: null,
            imagenes: prev.detalle[detalleIndex].imagenes.map((img, idx) =>
              idx === imageIndex ? file : img 
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
                idx === imageIndex ? imageUrl : img 
              ),
            };
            return { ...prev, detalle: updatedDetalles };
          });
        } catch (err: any) {
          console.error('Error al subir imagen:', err);
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

      if (activeCheckboxMatch) {
        const detalleIndex = parseInt(activeCheckboxMatch[1]);
        setFormData(prev => {
          const updatedDetalles = [...prev.detalle];
          updatedDetalles[detalleIndex] = {
            ...updatedDetalles[detalleIndex],
            active: checked,
          };
          return { ...prev, detalle: updatedDetalles };
        });
      }
  
      else if (imagenInputMatch) {
          
          const detalleIndex = parseInt(imagenInputMatch[1]);
          const imagenIndex = parseInt(imagenInputMatch[2]);

          setFormData(prev => {
              const updatedDetalles = [...prev.detalle];
              const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
              updatedImagenes[imagenIndex] = value;

              updatedDetalles[detalleIndex] = {
                  ...updatedDetalles[detalleIndex],
                  imagenes: updatedImagenes,
              };
              return { ...prev, detalle: updatedDetalles };
          });
      }
      else {
        const match = name.match(/detalle\[(\d+)\]\.(\w+)/);
        if (match) {
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
      }
    }
    else if (name === 'categorias') {
      const select = e.target as HTMLSelectElement;
      const selectedIds = Array.from(select.selectedOptions).map(opt => Number(opt.value));
      const selectedCategorias = categorias.filter(cat => selectedIds.includes(cat.id!));
      setFormData(prev => ({ ...prev, categorias: selectedCategorias }));
    }
    else {
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
          active: true,
          loadingImage: false,
          imageUploadError: null,
        },
      ],
    }));
  };

  const handleRemoveDetalle = (indexToRemove: number) => {
    setFormData(prev => {
      const updatedDetalles = prev.detalle.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, detalle: updatedDetalles };
    });
  };

  const handleAddImagenToDetalle = (detalleIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];

      if (updatedDetalles[detalleIndex].imagenes.length > 0 &&
          typeof updatedDetalles[detalleIndex].imagenes[updatedDetalles[detalleIndex].imagenes.length - 1] === 'string' &&
          (updatedDetalles[detalleIndex].imagenes[updatedDetalles[detalleIndex].imagenes.length - 1] as string).trim() === '') {

            return prev;
          }

      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: [...updatedDetalles[detalleIndex].imagenes, ''], 
      };
      return { ...prev, detalle: updatedDetalles };
    });
  };

  const handleRemoveImagenFromDetalle = (detalleIndex: number, imagenIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      const updatedImagenes = updatedDetalles[detalleIndex].imagenes.filter((_, idx) => idx !== imagenIndex);
      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: updatedImagenes.length > 0 ? updatedImagenes : [], 
      };
      return { ...prev, detalle: updatedDetalles };
    });
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

      const productoParaBackend: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'> = {
        descripcion: formData.descripcion,
        sexo: formData.sexo,
        tipoProducto: formData.tipoProducto,
        categorias: formData.categorias.map(cat => ({
          id: cat.id,
          descripcion: cat.descripcion,
          categoriaPadre: undefined, 
          subcategorias: undefined,
          productos: undefined,
        })),
        detalle: formData.detalle.map(det => ({
          id: det.id, 
          color: det.color,
          talle: det.talle,
          marca: det.marca,
          stock: det.stock,
          precioCompra: det.precioCompra,
          precioVenta: det.precioVenta,
          imagenes: det.imagenes.filter(img => typeof img === 'string' && img.trim() !== '') as string[], 
          active: det.active
        })),
        active: formData.active
      };
      await onEdit(producto.id!, productoParaBackend); 
      onClose();
      if (onProductoEditado) onProductoEditado();
      alert('Producto editado correctamente');
    } catch (err: any) {
      console.error("Error al editar producto:", err);
      setError(err.message || 'Error al editar producto. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={onClose} title="Editar Producto">
      <form onSubmit={handleSubmit} className={style.form}>
        <div className={style.formContent}> 
          <div className={style.generalInfo}> {/* Columna de información general */}
            <h3>Información General del Producto</h3>
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
                className={style.select_multiple}
              >
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.descripcion}
                  </option>
                ))}
              </select>
            </label>

            <label className={style.checkboxLabel}>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              Producto Activo
            </label>
          </div>

          <div className={style.productDetails}> {/* Columna de detalles del producto */}
            <h3>Detalles del Producto</h3>
            {formData.detalle.map((detalleItem, idx) => (
              <div key={detalleItem.id || `new-${idx}`} className={style.detalleItem}> 
                {detalleItem.id && <input type="hidden" name={`detalle[${idx}].id`} value={detalleItem.id} />}

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

                <label className={style.checkboxLabel}>
                  <input
                    type="checkbox"
                    name={`detalle[${idx}].active`}
                    checked={detalleItem.active !== undefined ? detalleItem.active : true}
                    onChange={handleChange}
                  />
                  Detalle Activo
                </label>

                <div className={style.imagenesDetalleContainer}>
                  <h6>Imágenes del Detalle {idx + 1}:</h6>
                  {detalleItem.imagenes.map((imgData, imgIdx) => (
                    <div key={`${idx}-${imgIdx}`} className={style.image_input_row}>
                      <label>
                        Archivo de Imagen {imgIdx + 1}:
                        <input
                          type="file"
                          name={`detalle[${idx}].imagenes[${imgIdx}]`}
                          onChange={handleChange}
                          accept="image/*" 
                          disabled={detalleItem.loadingImage}
                        />
                        {detalleItem.loadingImage && (
                          <p>Subiendo imagen...</p>
                        )}
                        {detalleItem.imageUploadError && (
                          <p style={{ color: 'red' }}>{detalleItem.imageUploadError}</p>
                        )}
                        {imgData instanceof File && imgData.name ? (
                          <p>{imgData.name}</p>
                        ) : typeof imgData === 'string' && imgData.length > 0 ? (
                          <img src={imgData} alt="Previsualización" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                        ) : null}
                      </label>
                      {(imgData instanceof File || (typeof imgData === 'string' && imgData.length > 0)) && (
                        <button type="button" onClick={() => handleRemoveImagenFromDetalle(idx, imgIdx)} className={style.smallButton}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddImagenToDetalle(idx)} className={style.smallButton}>
                    + Añadir Campo de Imagen
                  </button>
                </div>
                {
                  formData.detalle.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDetalle(idx)}
                      className={style.removeDetalleButton}
                    >
                      Remover Detalle
                    </button>
                  )
                }
              </div>
            ))}
            <button type="button" onClick={handleAddDetalle} className={style.addDetalleButton}>
              Agregar Nuevo Detalle
            </button>
          </div>
        </div>

        {error && <p className={style.errorMessage}>{error}</p>}

        <button type="submit" disabled={loading || formData.detalle.some(det => det.loadingImage)} className={style.submitButton}>
          {loading ? 'Guardando cambios...' : 'Guardar cambios'}
        </button>
      </form>
    </Modal>
  );
};
