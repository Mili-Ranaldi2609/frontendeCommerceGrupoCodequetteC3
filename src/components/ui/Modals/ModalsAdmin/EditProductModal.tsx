import { Modal } from '../Modal/Modal';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Producto } from '../../../../types/IProduct';
import { IColor } from '../../../../types/IEnumColor';
import type { ICategoria } from '../../../../types/ICategoria';
import style from './EditProductModal.module.css';
import { uploadImagen } from '../../../../services/ConectionApi';
import type { AxiosResponse } from 'axios';
import { IEnumTalle } from '../../../../types/IEnumTalle';

type ImagenItem = {
  url: string;
  file: File | null;
  preview: string;
  loading: boolean;
  error: string | null;
};

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
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto;
  categorias: ICategoria[];
  onEdit: (productoId: number, productoActualizado: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'>) => Promise<AxiosResponse<any, any>>;
  onProductoEditado?: () => void;
}

enum ImageUploadOption {
  FILE = 'file',
  URL = 'url',
  NONE = 'none'
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
  const [uploadOption, setUploadOption] = useState<Map<number, ImageUploadOption>>(new Map());
  const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen && producto) {
      setFormData({
        descripcion: producto.descripcion || '',
        sexo: producto.sexo || 'UNISEX',
        categorias: producto.categorias || [],
        tipoProducto: producto.tipoProducto || '',
        active: producto.active ?? true,
        detalle: producto.detalle.map(det => ({
          id: det.id,
          color: det.color || IColor.AZUL,
          talle: det.talle || IEnumTalle.S,
          marca: det.marca || '',
          stock: det.stock || 0,
          precioCompra: det.precioCompra || 0,
          precioVenta: det.precioVenta || 0,
          imagenes: det.imagenes.map(imgUrl => ({
            url: imgUrl,
            file: null,
            preview: imgUrl,
            loading: false,
            error: null,
          })),
          active: det.active ?? true,
        })),
      });

      const initialUploadOptions = new Map<number, ImageUploadOption>();
      producto.detalle.forEach((_, idx) => {
        initialUploadOptions.set(idx, ImageUploadOption.NONE);
      });
      setUploadOption(initialUploadOptions);
      setExpandedDetails(new Set(producto.detalle.map((_, idx) => idx)));

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
      setUploadOption(new Map());
      setExpandedDetails(new Set());
    }
  }, [isOpen, producto]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'active') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, active: target.checked }));
      return;
    }

    if (name.startsWith('detalle[')) {
      const match = name.match(/detalle\[(\d+)\]\.(\w+)/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        let fieldValue: string | number | boolean = value;

        if (['stock', 'precioCompra', 'precioVenta'].includes(field)) {
          fieldValue = parseFloat(value) || 0;
        } else if (field === 'active') {
          const target = e.target as HTMLInputElement;
          fieldValue = target.checked;
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
      const selectedCategorias = categorias.filter(cat => cat.id && selectedIds.includes(cat.id));
      setFormData(prev => ({ ...prev, categorias: selectedCategorias }));
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

  const handleAddDetalle = useCallback(() => {
    setFormData(prev => {
      const newDetalleIndex = prev.detalle.length;
      const newDetalles = [
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
        },
      ];
      setExpandedDetails(new Set([newDetalleIndex]));
      return { ...prev, detalle: newDetalles };
    });
    setUploadOption(prev => new Map(prev).set(formData.detalle.length, ImageUploadOption.NONE));
  }, [formData.detalle.length]);

  const handleRemoveDetalle = useCallback((indexToRemove: number) => {
    setFormData(prev => {
      const updatedDetalles = prev.detalle.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, detalle: updatedDetalles };
    });
    setUploadOption(prev => {
      const newMap = new Map(prev);
      newMap.delete(indexToRemove);
      return newMap;
    });
    setExpandedDetails(prev => {
      const newExpanded = new Set<number>();
      prev.forEach(idx => {
        if (idx < indexToRemove) {
          newExpanded.add(idx);
        } else if (idx > indexToRemove) {
          newExpanded.add(idx - 1);
        }
      });
      return newExpanded;
    });
  }, []);

  const handleAddImagenToDetalle = useCallback((detalleIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: [
          ...updatedDetalles[detalleIndex].imagenes,
          { url: '', file: null, preview: '', loading: false, error: null },
        ],
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
  }, [formData, onEdit, onClose, onProductoEditado, producto.id]);

  const allCategories = useMemo(() => Object.values(IColor), []);
  const allTalles = useMemo(() => Object.values(IEnumTalle), []);
  const allSexos = useMemo(() => ['MASCULINO', 'FEMENINO', 'UNISEX', 'UNISEX_CHILD'], []);

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={onClose} title="Editar Producto">
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
              <div key={detalleItem.id || `new-${idx}`} className={`${style.detalleItem} ${expandedDetails.has(idx) ? style.expanded : style.collapsed}`}>
                <div className={style.detalleHeader} onClick={() => toggleDetalleExpansion(idx)}>
                  <h4>Detalle {idx + 1} - {detalleItem.marca} ({detalleItem.color})</h4>
                  <span className={style.toggleIcon}>
                    {expandedDetails.has(idx) ? '▲' : '▼'}
                  </span>
                </div>

                {expandedDetails.has(idx) && (
                  <div className={style.detalleContent}>
                    {detalleItem.id && <input type="hidden" name={`detalle[${idx}].id`} value={detalleItem.id} />}

                    <label>
                      Marca:
                      <input name={`detalle[${idx}].marca`} value={detalleItem.marca} onChange={handleChange} required />
                    </label>
                    <label>
                      Color:
                      <select name={`detalle[${idx}].color`} value={detalleItem.color} onChange={handleChange} required>
                        {allCategories.map(color => (
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
          {loading ? 'Guardando cambios...' : 'Guardar cambios'}
        </button>
      </form>
    </Modal>
  );
};