import { Modal } from '../Modal/Modal';
import React, { useState, useEffect } from 'react';
import type { Producto } from '../../../../types/IProduct';
import { IColor } from '../../../../types/IEnumColor';
import type { ICategoria } from '../../../../types/ICategoria';
import style from './EditProductModal.module.css';
import { uploadImagen } from '../../../../services/ConectionApi'; // Importa tu función de subida de imagen
import type { AxiosResponse } from 'axios';
import { IEnumTalle } from '../../../../types/IEnumTalle';


// ====================================================================================
// Ajustar los tipos para manejar File | string y estados de carga/error por imagen
type DetalleFormData = {
  id?: number;
  active?: boolean;
  color: IColor;
  talle: IEnumTalle;
  marca: string;
  stock: number;
  precioCompra: number;
  precioVenta: number;
  imagenes: (File | string)[]; // Puede ser File (mientras se carga) o string (una vez subida)
  loadingImage?: boolean; // Para saber si una imagen específica está subiendo
  imageUploadError?: string | null; // Para errores de subida de imagen específicos
};

// El ProductoFormData ahora usará DetalleFormData
type ProductoFormData = Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal' | 'detalle'> & {
  detalle: DetalleFormData[];
};

// Definición de las Props del componente
interface Props {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto; // El producto a editar
  categorias: ICategoria[];
  // onEdit ahora espera el ProductoDTO listo para enviar al backend
  onEdit: (productoId: number, productoActualizado: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'>) => Promise<AxiosResponse<any, any>>;
  onProductoEditado?: () => void; // Callback opcional después de editar
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

  const [loading, setLoading] = useState(false); // Para el estado general del formulario
  const [error, setError] = useState<string | null>(null); // Para errores generales del formulario

  // Modificar useEffect para inicializar correctamente los datos existentes
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
          imagenes: det.imagenes && det.imagenes.length > 0 ? det.imagenes : [], // Las URLs existentes ya son strings
          active: det.active !== undefined ? det.active : true,
          loadingImage: false, // Inicializar como no cargando
          imageUploadError: null, // Sin errores al inicio
        })),
      });
    } else if (!isOpen) {
      // Resetear el formulario al cerrar si no es el mismo producto
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

  // ====================================================================================
  // CORRECCIÓN AQUÍ: Desestructurar 'type' y 'files' con 'as HTMLInputElement'
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, checked } = e.target;
    const { type, files } = e.target as HTMLInputElement; // <--- ¡CORRECCIÓN CLAVE AQUÍ!

    // Manejo del checkbox 'active' del producto principal
    if (name === 'active') {
      setFormData(prev => ({ ...prev, active: checked }));
      return;
    }

    // Manejo de campos anidados (detalle y sus propiedades)
    if (name.startsWith('detalle[')) {
      const imagenInputMatch = name.match(/detalle\[(\d+)\]\.imagenes\[(\d+)\]/);
      const activeCheckboxMatch = name.match(/detalle\[(\d+)\]\.active/);

      // Lógica para input de tipo 'file' (subida de imagen)
      if (type === 'file' && files && files.length > 0) { // 'files' ahora es seguro de usar
        const file = files[0];
        if (!imagenInputMatch) return; // Esto no debería pasar si el name está bien

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
          const response = await uploadImagen(file); // Llama a tu función de API para subir la imagen
          const imageUrl = response.data.url; // Asumiendo que la respuesta es { url: '...' }

          // Actualizar el estado con la URL de la imagen una vez que se ha subido
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
                  idx === imageIndex ? '' : img // Limpiar el campo o mantener el anterior si es posible
                ),
            };
            return { ...prev, detalle: updatedDetalles };
          });
        } finally {
          // Limpiar el input file para permitir subir la misma imagen de nuevo
          if (e.target) {
              e.target.value = '';
          }
        }
        return; // Importante para no seguir procesando como un input de texto
      }

      // Lógica para checkbox 'active' de detalle
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
      // Lógica para inputs de URL (si decides permitir pegarlas directamente) o otros campos de detalle
      else if (imagenInputMatch) {
          // Esta rama se ejecutaría si el input fuera de tipo 'text' para URLs
          // Si siempre usas type="file" para nuevas imágenes, este bloque es para URLs existentes
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
      }
      // Lógica para otros campos del detalle (marca, color, stock, etc.)
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
    // Lógica para campos de categorías
    else if (name === 'categorias') {
      const select = e.target as HTMLSelectElement;
      const selectedIds = Array.from(select.selectedOptions).map(opt => Number(opt.value));
      const selectedCategorias = categorias.filter(cat => selectedIds.includes(cat.id!));
      setFormData(prev => ({ ...prev, categorias: selectedCategorias }));
    }
    // Lógica para otros campos generales del producto
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
          imagenes: [], // Iniciar vacío para que se suban archivos
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
      // Si el último campo de imagen está vacío (un string vacío), no añadir otro hasta que se seleccione algo
      if (updatedDetalles[detalleIndex].imagenes.length > 0 &&
          typeof updatedDetalles[detalleIndex].imagenes[updatedDetalles[detalleIndex].imagenes.length - 1] === 'string' &&
          (updatedDetalles[detalleIndex].imagenes[updatedDetalles[detalleIndex].imagenes.length - 1] as string).trim() === '') {
            // Puedes mostrar una alerta si quieres, pero por ahora solo evitamos añadir
            // alert('Por favor, selecciona o pega una URL para el campo de imagen actual antes de añadir uno nuevo.');
            return prev;
          }

      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: [...updatedDetalles[detalleIndex].imagenes, ''], // Añadir un string vacío como placeholder para un nuevo input file
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
        imagenes: updatedImagenes.length > 0 ? updatedImagenes : [], // Si se eliminan todas, dejar vacío
      };
      return { ...prev, detalle: updatedDetalles };
    });
  };

  // PASO 4: Simplificar handleSubmit para que ya no necesite manejar los File's directamente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Bloquear el formulario completo
    setError(null);

    try {
      // 🚨 Validación previa: Asegurarse de que no haya imágenes aún subiendo
      const anyImageLoading = formData.detalle.some(det => det.loadingImage);
      if (anyImageLoading) {
        throw new Error('Por favor, espere a que todas las imágenes terminen de subir.');
      }
      // 🚨 Validación previa: Asegurarse de que no haya errores de subida pendientes
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
          categoriaPadre: undefined, // Eliminar si no es necesario en el DTO de envío
          subcategorias: undefined, // Eliminar si no es necesario en el DTO de envío
          productos: undefined // Eliminar si no es necesario en el DTO de envío
        })),
        detalle: formData.detalle.map(det => ({
          id: det.id, // ¡Importante para la edición!
          color: det.color,
          talle: det.talle,
          marca: det.marca,
          stock: det.stock,
          precioCompra: det.precioCompra,
          precioVenta: det.precioVenta,
          imagenes: det.imagenes.filter(img => typeof img === 'string' && img.trim() !== '') as string[], // Filtrar solo URLs (strings no vacíos)
          active: det.active // Enviar el estado active de cada detalle
        })),
        active: formData.active // Enviar el estado active del producto principal
      };

      // Llama a onEdit del padre, que ahora solo recibirá el ProductoDTO listo
      await onEdit(producto.id!, productoParaBackend); // Asumo que producto.id siempre estará presente en edición

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
        <div className={style.formContent}> {/* Nuevo contenedor para las dos columnas */}
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
              <div key={detalleItem.id || `new-${idx}`} className={style.detalleItem}> {/* Aplica un estilo para cada detalle */}
                {/* Incluir un input oculto para el ID del detalle si existe */}
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
                          type="file" // ¡CAMBIO CLAVE AQUÍ!
                          name={`detalle[${idx}].imagenes[${imgIdx}]`}
                          onChange={handleChange}
                          accept="image/*" // Solo acepta archivos de imagen
                          disabled={detalleItem.loadingImage} // Deshabilita mientras sube
                        />
                        {/* Indicador de carga y error por imagen */}
                        {detalleItem.loadingImage && (
                          <p>Subiendo imagen...</p>
                        )}
                        {detalleItem.imageUploadError && (
                          <p style={{ color: 'red' }}>{detalleItem.imageUploadError}</p>
                        )}
                        {/* Previsualización: nombre del archivo para File, imagen para URL */}
                        {imgData instanceof File && imgData.name ? (
                          <p>{imgData.name}</p>
                        ) : typeof imgData === 'string' && imgData.length > 0 ? (
                          <img src={imgData} alt="Previsualización" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                        ) : null}
                      </label>
                      {/* Botón de eliminar para imágenes (File o URL) */}
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
                  // Muestra el botón "Remover Detalle" si hay más de uno
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
