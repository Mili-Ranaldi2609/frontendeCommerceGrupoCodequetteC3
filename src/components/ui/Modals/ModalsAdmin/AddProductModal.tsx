import { Modal } from '../Modal/Modal';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Producto } from '../../../../types/IProduct';
import { IColor } from '../../../../types/IEnumColor';
import type { ICategoria } from '../../../../types/ICategoria';
import style from './AddProductModal.module.css';
import { uploadImagen } from '../../../../services/ConectionApi';
import { IEnumTalle } from '../../../../types/IEnumTalle';

interface ImagenItem {
  url: string;
  file: File | null;
  preview: string;
  loading: boolean;
  error: string | null;
}

type DetalleFormData = {
  id?: number;
  active: boolean;
  color: IColor;
  talle: IEnumTalle;
  marca: string;
  stock: number;
  precioCompra: number;
  precioVenta: number;
  imagenes: ImagenItem[];
};

type ProductoFormData = Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal' | 'detalle'> & {
  detalle: DetalleFormData[];
  tipoProducto: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categorias: ICategoria[];
  onSubmit: (nuevo: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'>) => Promise<void>;
  onProductoCreado?: () => void;
}

enum ImageUploadOption {
  FILE = 'file',
  URL = 'url',
  NONE = 'none'
}

const initialDetalle: DetalleFormData = {
  color: IColor.AZUL,
  marca: '',
  stock: 0,
  talle: IEnumTalle.S,
  precioCompra: 0,
  precioVenta: 0,
  imagenes: [],
  active: true,
};

const initialFormData: ProductoFormData = {
  descripcion: '',
  sexo: 'MASCULINO',
  categorias: [],
  detalle: [initialDetalle],
  tipoProducto: '',
  active: true,
};

export const ModalAgregarProducto = ({ isOpen, onClose, categorias, onSubmit, onProductoCreado }: Props) => {
  const [formData, setFormData] = useState<ProductoFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadOption, setUploadOption] = useState<Map<number, ImageUploadOption>>(new Map());
  // Nuevo estado para controlar si un detalle está plegado o no
  const [collapsedDetalles, setCollapsedDetalles] = useState<Map<number, boolean>>(new Map());
    const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set());

  // Initialize uploadOption and collapsedDetalles map when the modal opens or closes
  useEffect(() => {
    if (isOpen) {
      const initialOptions = new Map<number, ImageUploadOption>();
      const initialCollapsed = new Map<number, boolean>();
      formData.detalle.forEach((_, idx) => {
        initialOptions.set(idx, ImageUploadOption.NONE);
        initialCollapsed.set(idx, false); // All details expanded by default
      });
      setUploadOption(initialOptions);
      setCollapsedDetalles(initialCollapsed);
    } else {
      resetForm();
    }
  }, [isOpen]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox'; // Not strictly needed here

    const detalleFieldMatch = name.match(/detalle\[(\d+)\]\.(\w+)/);

    if (detalleFieldMatch) {
      const index = parseInt(detalleFieldMatch[1]);
      const field = detalleFieldMatch[2];
      let fieldValue: any = value;

      if (['stock', 'precioCompra', 'precioVenta'].includes(field)) {
        fieldValue = parseFloat(value);
        if (isNaN(fieldValue)) fieldValue = 0;
      } else if (field === 'active') { // Handle active checkbox for detalle
        fieldValue = (e.target as HTMLInputElement).checked;
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
      const selectedCategorias = categorias.filter(cat => cat.id && selectedIds.includes(cat.id));
      setFormData(prev => ({ ...prev, categorias: selectedCategorias }));
    } else if (name === 'active') {
      setFormData(prev => ({ ...prev, active: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }, [categorias]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, detalleIndex: number, imagenIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
      updatedImagenes[imagenIndex] = {
        url: '',
        file: file,
        preview: previewUrl,
        loading: true,
        error: null,
      };
      updatedDetalles[detalleIndex] = { ...updatedDetalles[detalleIndex], imagenes: updatedImagenes };
      return { ...prev, detalle: updatedDetalles };
    });

    try {
      const response = await uploadImagen(file);
      const imageUrl = response.data.url;

      setFormData(prev => {
        const updatedDetalles = [...prev.detalle];
        const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
        updatedImagenes[imagenIndex] = {
          ...updatedImagenes[imagenIndex],
          url: imageUrl,
          loading: false,
          error: null,
        };
        updatedDetalles[detalleIndex] = { ...updatedDetalles[detalleIndex], imagenes: updatedImagenes };
        return { ...prev, detalle: updatedDetalles };
      });
    } catch (err: any) {
      console.error('Error al subir imagen:', err);
      setFormData(prev => {
        const updatedDetalles = [...prev.detalle];
        const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
        updatedImagenes[imagenIndex] = {
          ...updatedImagenes[imagenIndex],
          loading: false,
          error: 'Error al subir imagen: ' + (err.response?.data?.error || err.message || 'Desconocido'),
          url: '',
          preview: '',
          file: null,
        };
        updatedDetalles[detalleIndex] = { ...updatedDetalles[detalleIndex], imagenes: updatedImagenes };
        return { ...prev, detalle: updatedDetalles };
      });
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  }, []);

  const handleImageUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, detalleIndex: number, imagenIndex: number) => {
    const url = e.target.value;
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
      updatedImagenes[imagenIndex] = {
        ...updatedImagenes[imagenIndex],
        url: url,
        file: null,
        preview: url,
        loading: false,
        error: null,
      };
      updatedDetalles[detalleIndex] = { ...updatedDetalles[detalleIndex], imagenes: updatedImagenes };
      return { ...prev, detalle: updatedDetalles };
    });
  }, []);

  const handleAddDetalle = useCallback(() => {
    setFormData(prev => {
      const newDetalleIndex = prev.detalle.length;
      setUploadOption(current => new Map(current).set(newDetalleIndex, ImageUploadOption.NONE));
      setCollapsedDetalles(current => new Map(current).set(newDetalleIndex, false)); // New detail starts expanded
      return {
        ...prev,
        detalle: [...prev.detalle, initialDetalle],
      };
    });
  }, []);

  const handleRemoveDetalle = useCallback((indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      detalle: prev.detalle.filter((_, idx) => idx !== indexToRemove),
    }));
    setUploadOption(prev => {
      const newMap = new Map(prev);
      newMap.delete(indexToRemove);
      return newMap;
    });
    setCollapsedDetalles(prev => {
      const newMap = new Map(prev);
      newMap.delete(indexToRemove);
      return newMap;
    });
  }, []);

  const handleRemoveImagenFromDetalle = useCallback((detalleIndex: number, imagenIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      const updatedImagenes = updatedDetalles[detalleIndex].imagenes.filter((_, idx) => idx !== imagenIndex);
      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: updatedImagenes,
      };
      return { ...prev, detalle: updatedDetalles };
    });
  }, []);

  const handleAddImagenToDetalle = useCallback((detalleIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: [...updatedDetalles[detalleIndex].imagenes, { url: '', file: null, preview: '', loading: false, error: null }],
      };
      return { ...prev, detalle: updatedDetalles };
    });
  }, []);

  const handleToggleImageUploadOption = useCallback((detalleIndex: number, option: ImageUploadOption) => {
    setUploadOption(prev => {
      const newMap = new Map(prev);
      newMap.set(detalleIndex, option);
      return newMap;
    });
  }, []);

  // Nueva función para alternar el estado plegado de un detalle
  const toggleDetalleCollapse = useCallback((detalleIndex: number) => {
    setCollapsedDetalles(prev => {
      const newMap = new Map(prev);
      newMap.set(detalleIndex, !newMap.get(detalleIndex)); // Toggle the collapse state
      return newMap;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setError(null);
    setUploadOption(new Map());
    setCollapsedDetalles(new Map());
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const anyImageLoading = formData.detalle.some(det => det.imagenes.some(img => img.loading));
      if (anyImageLoading) {
        throw new Error('Por favor, espere a que todas las imágenes terminen de subir.');
      }

      const anyImageUploadError = formData.detalle.some(det => det.imagenes.some(img => img.error));
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
          imagenes: det.imagenes.filter(img => img.url.trim() !== '').map(img => img.url),
          active: det.active
        })),
        active: formData.active
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
  }, [formData, onSubmit, resetForm, onClose, onProductoCreado]);
    const toggleDetalleExpansion = useCallback((index: number) => {
      setExpandedDetails(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    }, []);

  const allColors = useMemo(() => Object.values(IColor), []);
  const allTalles = useMemo(() => Object.values(IEnumTalle), []);
  const allSexos = useMemo(() => ['MASCULINO', 'FEMENINO', 'UNISEX', 'UNISEX_CHILD'], []);

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={onClose} title="Agregar Nuevo Producto">
      <form onSubmit={handleSubmit} className={style.form}>
        <div className={style.formContent}>
          <div className={style.generalInfo}>
            <h3>Información General del Producto</h3>
            <label>
              Descripción:
              <input name="descripcion" value={formData.descripcion} onChange={handleChange} required />
            </label>

            <label>
              Género:
              <select name="sexo" value={formData.sexo} onChange={handleChange} required>
                <option value="">Seleccione género</option>
                {allSexos.map(sexo => (
                  <option key={sexo} value={sexo}>
                    {sexo}
                  </option>
                ))}
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

          <div className={style.productDetails}>
            <h3>Detalles del Producto</h3>
            {formData.detalle.map((detalleItem, idx) => (
              <div key={idx} className={`${style.detalleItem} ${expandedDetails.has(idx) ? style.expanded : style.collapsed}`}>
                <div className={style.detalleHeader} onClick={() => toggleDetalleExpansion(idx)}>
                  <h4>Detalle {idx + 1} - {detalleItem.marca} ({detalleItem.color})</h4>
                  <span className={style.toggleIcon}>
                    {expandedDetails.has(idx) ? '▲' : '▼'}
                  </span>
                </div>

                {expandedDetails.has(idx) && (
                  <div className={style.detalleContent}>
                    <label>
                      Marca:
                      <input name={`detalle[${idx}].marca`} value={detalleItem.marca} onChange={handleChange} required />
                    </label>
                    <label>
                      Color:
                      <select name={`detalle[${idx}].color`} value={detalleItem.color} onChange={handleChange} required>
                        {allColors.map(color => (
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
                        {allTalles.map(talle => (
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
                        checked={detalleItem.active}
                        onChange={handleChange}
                      />
                      Detalle Activo
                    </label>

                    <div className={style.imagenesDetalleContainer}>
                      <h6>Imágenes del Detalle {idx + 1}:</h6>
                      {detalleItem.imagenes.map((imgItem, imgIdx) => (
                        <div key={`${idx}-${imgIdx}`} className={style.image_input_row}>
                          <div className={style.uploadSwitchContainer}>
                            <span className={style.switchLabel}>Subir imagen por:</span>
                            <label className={style.switch}>
                              <input
                                type="checkbox"
                                checked={uploadOption.get(idx) === ImageUploadOption.URL}
                                onChange={() => handleToggleImageUploadOption(idx, uploadOption.get(idx) === ImageUploadOption.FILE ? ImageUploadOption.URL : ImageUploadOption.FILE)}
                                disabled={imgItem.loading}
                              />
                              <span className={style.slider}></span>
                            </label>
                          </div>

                          {uploadOption.get(idx) === ImageUploadOption.FILE && (
                            <div className={style.imageUploadGroup}>
                              <label>
                                Archivo de Imagen {imgIdx + 1}:
                                <input
                                  type="file"
                                  name={`detalle[${idx}].imagenesFile[${imgIdx}]`}
                                  onChange={(e) => handleFileChange(e, idx, imgIdx)}
                                  accept="image/*"
                                  disabled={imgItem.loading}
                                />
                              </label>
                            </div>
                          )}

                          {uploadOption.get(idx) === ImageUploadOption.URL && (
                            <div className={style.imageUploadGroup}>
                              <label>
                                URL de Imagen:
                                <input
                                  type="url"
                                  name={`detalle[${idx}].imagenesUrl[${imgIdx}]`}
                                  value={imgItem.url}
                                  onChange={(e) => handleImageUrlChange(e, idx, imgIdx)}
                                  placeholder="https://ejemplo.com/imagen.jpg"
                                  disabled={imgItem.loading}
                                />
                              </label>
                            </div>
                          )}

                          {imgItem.loading && (
                            <p className={style.loadingMessage}>Subiendo imagen...</p>
                          )}
                          {imgItem.error && (
                            <p className={style.errorMessage}>{imgItem.error}</p>
                          )}
                          {imgItem.preview && (
                            <div className={style.imagePreviewContainer}>
                              <img src={imgItem.preview} alt="Previsualización" className={style.imagePreview} />
                            </div>
                          )}

                          {(imgItem.file || imgItem.url) && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImagenFromDetalle(idx, imgIdx)}
                              className={style.smallButton}
                            >
                              Eliminar Imagen
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddImagenToDetalle(idx)} className={style.addImagenButton}>
                        + Añadir Imagen
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
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddDetalle} className={style.addDetalleButton}>
              Agregar Nuevo Detalle
            </button>
          </div>
        </div>

        {error && <p className={style.errorMessage}>{error}</p>}

        <button
          type="submit"
          disabled={loading || formData.detalle.some(det => det.imagenes.some(img => img.loading))}
          className={style.submitButton}
        >
          {loading ? 'Agregando producto...' : 'Agregar Producto'}
        </button>
      </form>
    </Modal>
  );
};